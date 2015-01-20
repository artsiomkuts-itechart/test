var PhoneIDFrame = function(keysPair) {
    this.keysPair = keysPair;
    PhoneIDFrame.superclass.constructor.call(this, $(PhoneIDFrame.formSelector), $(PhoneIDFrame.frameSelector));
    this.$profileErrorsContainer = $(PhoneIDFrame.profileDataErrorsContainerSelector);
    this.onReset = null;
    this.$telEl = this.$frame.find('input[type="tel"]');
    this.$searchButtonEl = this.$frame.find('.id-phone-button');
    this.ProfileFrame = null;
    this.ajaxing = false;
    this.bindings();
    this.clearPhone();
};

PhoneIDFrame.phoneLength = 10;
PhoneIDFrame.phoneMask = '(000) 000-0000';
PhoneIDFrame.frameSelector = '#jsPhoneIDFrame';
PhoneIDFrame.formSelector = '#jsPhoneIDForm';
PhoneIDFrame.profileDataErrorsContainerSelector = '#profileDataContainerErrors';

PhoneIDFrame.prototype.setKeysPair = function(keysPair) {
    this.keysPair = keysPair;
    if(this.ProfileFrame) {
        this.ProfileFrame.setKeysPair(keysPair);
    }
};

PhoneIDFrame.prototype.clearPhone = function() {
    this.$telEl.val('');
};

PhoneIDFrame.prototype.resetProfile = function() {
    var self = this;
    if (self.ProfileFrame) {
        if(self.ProfileFrame.onReset) {
            self.ProfileFrame.onReset();
        }
    }
};

(function() {
    function extendParentCode(parentObject, parentMethod, code) {
        var parentCode = parentObject[parentMethod];
        var newCode = function() {
            var args = Array.prototype.slice.call(arguments, 2);
            parentCode && parentCode.apply(this, args);
            return code.apply(this, args);
        };
        parentObject[parentMethod] = newCode;
        return newCode;
    }

    PhoneIDFrame.postExtend = function() {

        extendParentCode(PhoneIDFrame.prototype, 'hideErrors', function() {
            this.$profileErrorsContainer.find('.response-error').removeClass('active');
            this.$profileErrorsContainer.removeClass('active');
            return this;
        });

        extendParentCode(PhoneIDFrame.prototype, 'cleanErrors', function() {
            this.$profileErrorsContainer.find('.response-error').text('').removeClass('active');
            this.$profileErrorsContainer.removeClass('active');
            return this;
        });
    };
})();

(function() {

    function isEmptyObject(obj) {
      for(var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          return false;
        }
      }
      return true;
    }

    function parseErrorDescription(errorDescription) {
        var key, errorDescriptionArr = [];
        for (key in errorDescription) {
            if (errorDescription.hasOwnProperty(key)) {
                errorDescriptionArr.push(
                    key + ' - ' + (
                            typeof(errorDescription[key]) === "string" ?
                                errorDescription[key] :
                            errorDescription[key].join(' ')
                    )
                )
            }
        }
        return errorDescriptionArr.join('. ')
    }

    PhoneIDFrame.prototype.startAjax = function() {
        this.ajaxing = true;
        this.$searchButtonEl.siblings('.spinner-container, .loader-wrapper').removeClass('invisible').addClass('visible');
        this.$searchButtonEl.attr('disabled', 'true').addClass('disabled');
    };

    PhoneIDFrame.prototype.stopAjax = function() {
        this.ajaxing = false;
        this.$searchButtonEl.siblings('.spinner-container, .loader-wrapper').removeClass('visible').addClass('invisible');
        this.$searchButtonEl.removeAttr('disabled').removeClass('disabled');
    };

    PhoneIDFrame.prototype.processError = function(response) {
        var self = this;
        var errorMessage, errorJson, errorDescription;
        try {
            errorJson = $.parseJSON(response.responseText);
            errorMessage = errorJson.error.message;
            errorDescription = errorJson.error.description;
            if (errorDescription) {
                if (typeof(errorDescription) === "string") {
                    errorMessage += ". " + errorDescription;
                } else {
                    errorMessage += ". " + parseErrorDescription(errorDescription);
                }
            }
        } catch (e) {
            errorMessage = response.responseText;
        }
        self.$profileErrorsContainer.addClass('active').find('.response-error').text(errorMessage).addClass('active');
        if(!self.errorScroll) {
            var scroll_options = {
                scrollbars: true,
                interactiveScrollbars: true,
                fadeScrollbars: true,
                scrollX: true,
                scrollY: true,
                freeScroll: true,
                shrinkScrollbars: 'scale'
            };
            self.errorScroll = new IScroll(self.$profileErrorsContainer.get(0), scroll_options);
        }
    };

    PhoneIDFrame.prototype.bindings = function() {

        var self = this;

        if(!PhoneIDFrame.binded){
            this.$telEl.mask(PhoneIDFrame.phoneMask);

//            this.$telEl.on('blur', function() {
//                self.checkForErrors(this);
//            });

            this.$telEl.on('focus', function() {
                self.hideError(this);
            });

            this.$searchButtonEl.on('click', function(e) {
                e.preventDefault();
                var phone = self.$telEl.val();
                self.checkForErrors(self.$telEl);
                var errors = self.hasErrors();
                if(errors || self.ajaxing) {
                    return false;
                }
                if(!self.ProfileFrame) {
                    self.ProfileFrame = new ProfileFrame(self.keysPair, phone, self.cleanPhone(phone));
                    self.ProfileFrame.onReset = function() {
                        this.ajaxing = false;
                        if(this.dataProvider && this.dataProvider.currentRequest) {
                            this.dataProvider.currentRequest.abort();
                        }
                        this.hide();
                        this.hideMenu();
                        this.emptyFrame(this.$profileContainer);
                    };
                } else {
                    self.ProfileFrame.setPhone(phone, self.cleanPhone(phone));
                }
                self.startAjax();
                self.ProfileFrame.getProfile(self.cleanPhone(phone), function() {
                    self.stopAjax();
                    self.ProfileFrame.show(true);
                }, function (response) {
                    self.stopAjax();
                    self.processError(response);
                    if(self.errorScroll) {
                        self.errorScroll.refresh();
                    }
                });
                return true;
            });
            PhoneIDFrame.binded = true;
        }
    };
})();
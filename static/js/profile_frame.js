var ProfileFrame = function(keysPair, phone, cleanPhone) {
    this.currentProfile = {};
    this.profileFormatter = new ProfileFormatter();
    ProfileFrame.superclass.constructor.call(this, null, $(ProfileFrame.frameSelector));
    this.$profileContainer = $(ProfileFrame.profileContainer);
    this.keysPair = keysPair;
    this.phone = phone;
    this.cleanedPhone = cleanPhone;
    this.menu = {};
    this.dataProvider = new NCDataProvider(keysPair);
    this.onShow = function() {
        this.bindings();
    }
};


ProfileFrame.binded = false;

var SubstringMatcher = function(strs) {
    this.source = {src: strs};
    var that = this.source;
    this.matcher = function (q, cb) {
        var matches, substrRegex;
        matches = [];
        substrRegex = new RegExp(q, 'i');
        $.each(that.src, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push({ value: str });
            }
        });
        cb(matches);
    };
};

var capitalize = function(str, lower) {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

var mapClient = function(client, element, self) {
    client.on( 'ready', function(event) {
        client.on( 'copy', function(event) {
            console.log('z-copy');
            var data = self.copySelectedValues(element.is('.copy-image') ? element : false);
            if(data) {
                event.clipboardData.setData('text/plain', data);
            }
        });
        client.on( 'aftercopy', function(event) {
        });
    });
};

ProfileFrame.prototype.updateFlashBindings = function() {
    var self = this;
    var clients = $.map($('.copy-all, .copy-image'), function(elem) {
        return { client: new ZeroClipboard( $(elem) ), element: $(elem) };
    });
    $.each(clients, function(ind, cl) {
        mapClient(cl.client, cl.element, self);
    });
}

SubstringMatcher.prototype.setSource = function(src) {
    this.source = src;
};

var initTypehead = function($element, emails) {
    var scroll_options = {
        scrollbars: true,
        interactiveScrollbars: true,
        mouseWheel: true,
        fadeScrollbars: true,
        shrinkScrollbars: 'scale'
    };
    var matcher = new SubstringMatcher(emails);
    $element.data('matcher', matcher);
    $element.typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'emails',
        displayKey: 'value',
        source: matcher.matcher
    });
    console.log($element);
    $element.siblings('.tt-dropdown-menu').on('datasetRendered', function() {
        if(!$element.data('autocompleteScroll')) {
            $element.data('autocompleteScroll', new IScroll($element.siblings('.tt-dropdown-menu').get(0), scroll_options));
            $element.data('autocompleteScroll').refresh();
        }
        $element.data('autocompleteScroll').refresh();
    });
    $element.parents('.form-input-container').css('overflow', 'inherit');
};

ProfileFrame.frameSelector = '#jsProfileFrame';
ProfileFrame.profileContainer = '#profileDataContainer';
ProfileFrame.idPhoneBlockTmplSelector = '#idPhoneBlockTmpl';
ProfileFrame.idModalTmplSelector = '#idModalTmpl';
ProfileFrame.modalSelector = '.modal-overlay';
ProfileFrame.demograpicBlockTmplSelector = '#idDemographicBlockTmpl';
ProfileFrame.phoneMask = '(000) 000-0000';

ProfileFrame.prototype.setPhone = function(phone, cleanPhone) {
    this.phone = phone;
    this.cleanedPhone = cleanPhone;
};

ProfileFrame.prototype.getChangedFields = function() {
    var pageData = {},
        updatedFields = {},
        errorsFields = {},
        profileField,
        changedField,
        keyParts,
        key,
        getBySplitAttr = function (obj, attrParts) {
            if (attrParts.length == 1 || !obj[attrParts[0]]) {
                return obj[attrParts[0]];
            }
            return getBySplitAttr(obj[attrParts[0]], attrParts.slice(1));
        },
        setBySplitAttr = function (obj, attrParts, value) {
            if (attrParts.length == 1) {
                obj[attrParts[0]] = value;
                return;
            }
            if (!obj[attrParts[0]]) {
                obj[attrParts[0]] = {};
            }
            setBySplitAttr(obj[attrParts[0]], attrParts.slice(1), value);
        };
    this.$profileContainer.find('input,select').each(function () {
        pageData[this.name] = $.trim($(this).val());
    });
    for (key in pageData) {
        if (pageData.hasOwnProperty(key)) {
            keyParts = key.split('.');
            profileField = getBySplitAttr(this.currentProfile, keyParts);
            changedField = pageData[key];
            if (profileField !== changedField) {
                if (changedField) {
                    setBySplitAttr(updatedFields, keyParts, changedField);
                } else if (!changedField && profileField) {
                    errorsFields[key] = 'Field cannot be blank';
                }
            }
        }
    }
    if ('shipping_address1' in updatedFields) {
        // add all address fields
        for (key in pageData) {
            if (pageData.hasOwnProperty(key)) {
                keyParts = key.split('.');
                changedField = pageData[key];
                if (keyParts[0]  === 'shipping_address1') {
                    setBySplitAttr(updatedFields, keyParts, changedField);
                }
            }
        }

    }
    return {updatedFields: updatedFields, errorsFields: errorsFields};
};

ProfileFrame.prototype.setKeysPair = function(keysPair) {
    this.keysPair = keysPair;
    if(this.dataProvider) {
        this.dataProvider.setKeysPair(keysPair);
    }
};

ProfileFrame.prototype.updateEmail = function(email, emails) {
    var self = this;
    self.$profileContainer.find('#emailInputHidden').fadeOut(300, function() {
        var parent = $(this).parents('.input-group').first();
        $(this).replaceWith('<input id="emailInput" type="email" name="email" class="form-input" value="' + email + '" tabindex=10/>').hide();
        parent.find('label').attr('for', 'emailInput');
        parent.append('<div class="copy-image" title="click to add/subtract from copy"></div>');
        var $newInput = parent.find('#emailInput');
        console.log('updateEmail');
        initTypehead($newInput, emails || []);
    });
};

ProfileFrame.prototype.startAjax = function() {
    this.ajaxing = true;
    this.$frame.find('#update-your-plan, .search-button-async').attr('disabled', 'true').addClass('disabled');
};

ProfileFrame.prototype.stopAjax = function() {
    this.ajaxing = false;
    this.$frame.find('#update-your-plan, .search-button-async').removeAttr('disabled').removeClass('disabled');
};

ProfileFrame.prototype.updateDemographic = function(profile) {
    var self = this;
    var compiled = _.template($(ProfileFrame.demograpicBlockTmplSelector).text()),
        fProfile = self.profileFormatter.formatProfile(profile);
    if(!self.currentProfile['has_email'] && fProfile['has_email']) {
        self.updateEmail(fProfile['email'], profile['linked_emails'] || (profile['email'] ? [profile['email']] : []));
    } else if (self.currentProfile['has_email']) {
        var $emailInput = self.$frame.find('#emailInput');
        if($emailInput.data("ttTypeahead")) {
            $emailInput.typeahead('val', self.currentProfile['email']);
            $emailInput.data('matcher').source.src = profile['linked_emails'] || (profile['email'] ? [profile['email']] : []);
        } else {
            initTypehead($emailInput, profile['linked_emails'] || (profile['email'] ? [profile['email']] : []));
        }
    }
    self.currentProfile = $.extend(fProfile, {phone_number: self.phone ? "+1 " + self.phone : ""});
    self.$demographicContainer.velocity('stop', true).velocity({opacity: 0}, {duration: 300, display: 'none', complete: function() {
            var $this = $(this);
            $this.html(compiled(fProfile));
            if(hasFlash()) {
                var copy_element = $this.find('.copy-image');
                mapClient(new ZeroClipboard(copy_element), copy_element, self);
            }
            $this.css('display', 'block');
            $this.velocity({opacity: 1}, {delay: 50, duration: 200, begin: function() {
                    if(self.menu && self.menu.draggableScroll) {
                        self.menu.draggableScroll.refresh();
                    }
                }
            });
        }
    });
    return fProfile;
};

ProfileFrame.prototype.checkForUpdates = function(callback, error) {
    var self = this;
    self.dataProvider.getPlan(function(profile) {
        var obj = {};
        $.each(profile, function(ind, elem) { obj[elem] = '';});
        if(self.profileFormatter.hasAdditionalData(obj)) {
            self.dataProvider.getProfileByPhone(self.cleanedPhone, function(profile) {
                var fProfile = self.updateDemographic(profile);
                if(callback){
                    callback(fProfile);
                }
            }, function (response) {
                if (error) {
                    error(response);
                }
            });
        } else {
            window.location.href = window.upgradePlanUrl;
        }
    }, function (response) {
        if (error) {
            error(response);
        }
    });
};

ProfileFrame.prototype.getProfile = function(phone, callback, error) {
    var self = this;
    self.dataProvider.getProfileByPhone(phone, function(profile) {
        var compiled = _.template($(ProfileFrame.idPhoneBlockTmplSelector).text()),
            fProfile = self.profileFormatter.formatProfile(profile),
            compiledDemographic = _.template($(ProfileFrame.demograpicBlockTmplSelector).text());
        self.currentProfile = $.extend(fProfile, {phone_number: self.phone ? "+1 " + self.phone : ""});
        self.$profileContainer.html(compiled(fProfile));
        self.$demographicContainer = $('.demographic-data-content');
        self.$demographicContainer.html(compiledDemographic(fProfile));
        if(self.currentProfile['has_email']) {
            var $emailInput = self.$frame.find('#emailInput');
            if($emailInput.data("ttTypeahead")) {
                $emailInput.typeahead('val', '');
                $emailInput.data('matcher').source.src = profile['linked_emails'] || (profile['email'] ? [profile['email']] : []);
            } else {
                initTypehead($emailInput, profile['linked_emails'] || (profile['email'] ? [profile['email']] : []));
            }
        }
        if(callback){
            callback(fProfile);
        }
    }, function (response) {
        if (error) {
            error(response);
        }
    });
};

ProfileFrame.prototype.getInputValue = function($this, profile) {
    var tmp = null, i = 0, n;
    var name = $this.attr('name').split('.');
    n = name.length;
    var value = "";
    for(i,n; i < n; i++) {
        if(tmp === null) {
            tmp = profile[name[i]];
        } else {
            tmp = tmp[name[i]];
            if(!tmp) {
                break;
            }
        }
    }
    if(tmp) value = tmp;
    return value;
};

ProfileFrame.prototype.updateMainInfo = function(leavePhone) {
    var self = this;
    var profile = self.currentProfile;
    var animationSequence = [];
    if(!leavePhone) {
        self.$frame.find('.phone-and-line .phone').text(profile['phone_number']);
        self.$frame.find('.phone-and-line .line-type').text(profile['line_type'] ? profile['line_type'] : "");
    }
    self.$profileContainer.find('.form-input[name]').each(function() {
        var $this = $(this);
        if($this.is('.readonly')) {
            return false;
        }
        if($this.parents().is('.hidden, .invisible')) {
            $this.val(self.getInputValue($this, profile));
        } else {
            var value = self.getInputValue($this, profile);
            if(value != $this.val()) {
//                animationSequence.push([{
//                    elements: $this,
//                    properties: {opacity: 0},
//                    options: {
//                        duration: 80,
//                        sequenceQueue: false,
//                        complete: function() {
//                            $this.val(value);
//                        }
//                    }
//                }, {
//                    elements: $this,
//                    properties: {opacity: 1},
//                    options: {
//                        sequenceQueue: false,
//                        duration: 160
//                    }
//                }]);
                $this.velocity({opacity: 0}, { duration: 80,
                        complete: function() {
                            $this.val(value);
                        }
                }).velocity({opacity: 1}, {duration: 160});
            }
        }
        return true;
    });
//    animationSequence.sort(function(a, b) {
//        return (parseInt(_.first(a).elements.attr('tabindex')) > parseInt(_.first(b).elements.attr('tabindex'))) ? 1 : -1;
//    });
//    $.Velocity.RunSequence(_.flatten(animationSequence));
};

ProfileFrame.prototype.updateProfile = function(phone, callback, error) {
    var self = this;
    self.setPhone(phone, self.cleanPhone(phone));
    self.dataProvider.getProfileByPhone(self.cleanedPhone, function(profile) {
        var fProfile = self.updateDemographic(profile);
        self.updateMainInfo();
        if(callback){
            callback(fProfile);
        }
    }, function (response) {
        if (error) {
            error(response);
        }
    });
};

ProfileFrame.prototype.hideMenu = function() {
    var self = this;
    var topMenu = self.$frame.find('.top-menu');
    topMenu.velocity('stop', true);
    topMenu.velocity({'height': '0px'}, {
        duration: 0,
        begin: function() {
            self.$frame.find('.cogwheel').removeClass('clicked');
            topMenu.removeClass('opened');
            topMenu.removeClass('animating');
        }
    });
};

ProfileFrame.prototype.getProfileById = function(profileId, callback, error) {
    var self = this;
    self.dataProvider.getProfileById(profileId, function(profile) {
        var compiled = _.template($(ProfileFrame.idPhoneBlockTmplSelector).text()),
            fProfile = self.profileFormatter.formatProfile(profile);
        self.currentProfile = $.extend(fProfile, {phone_number: self.phone ? "+1 " + self.phone : ""});
        self.$profileContainer.html(compiled(fProfile));
        self.bindings();
        if(callback){
            callback(fProfile);
        }
    }, function (response) {
        if (error) {
            error(response);
        }
    });
};

ProfileFrame.prototype.copySelectedValues = function(selector) {
    var self = this;
    var name;
    var result = "";
    var delayed_result = "";
    self.$frame.find(selector || '.copy-image').each(function(index, element) {
        var data = [];
        var $this = $(element);
        var parent = $this.parents('.input-group, .demographic-data-container').first();
        if(parent.is('.input-group')) {
            name = parent.data('name');
            var inputs = parent.find('input[name], select').not('.fake-input').sort(function(a, b){
                var propName = 'tabIndex';
                var descending = false;
                if (typeof b[propName] == 'number' && typeof a[propName] == 'number') {
                    return (descending) ? b[propName] - a[propName] : a[propName] - b[propName];
                } else if (typeof b[propName] == 'string' && typeof a[propName] == 'string') {
                    return (descending) ? b[propName] > a[propName] : a[propName] > b[propName];
                } else {
                    return this;
                }
            });
            $.each(inputs, function(ind, elem) {
                var $el = $(elem);
                if($el.val()) {
                    data.push($el.val());
                }
            });
            if(data.length) {
                if(result) {
                    result += ". ";
                }
                result += data.join(parent.data('delimiter') || ' ');
            }
        } else {
            var keys = [];
            var values = [];
            parent.find('.demographic-data-span').each(function(ind, elem) {
                var text = $(elem).text();
                if(text) {
                    if($(elem).next().is('.demographic-data-array')) {
                        var array_values = [];
                        $(elem).next().find('a').each(function() {
                           if($(this).attr('href') && !$(this).data('link')) {
                               array_values.push($(this).attr('href'));
                           } else {
                               array_values.push($(this).text());
                           }
                        });
                        text = "";
                        text += array_values.join(', ');
                    }
                    keys.push($(elem).data('name'));
                    values.push(text);
                }
            });
            if(keys.length) {
//                delayed_result += 'Demographic Data: ' + _.map(_.zip(keys, values), function(elem) { return (elem[0] + ': ' + elem[1]);}).join('; ') + ')';
                delayed_result += 'Demographic: ' + values.join(', ');
            }
//            var rawProfile = self.profileFormatter.rawProfile;
//            var key;
//            for(key in rawProfile) {
//                if(rawProfile.hasOwnProperty(key)) {
//                    if (!!~ProfileFormatter.additionalFields.indexOf(key)) {
//                        values[key] = rawProfile[key];
//                    }
//                }
//            }
        }
    });
    if(result && delayed_result) {
        delayed_result = '. ' + delayed_result;
    }
    return result + delayed_result;
//    return $.isEmptyObject(values) ? null : values;
};

var hasFlash = function() {
    try {
        return (typeof navigator.plugins == "undefined" || navigator.plugins.length == 0) ? !!(new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) : navigator.plugins["Shockwave Flash"];
    } catch (ex) {
        return false;
    }
};

ProfileFrame.prototype.openModal = function(text) {
    var compiled = _.template($(ProfileFrame.idModalTmplSelector).text());
    return compiled({'copy_text': text});
};


ProfileFrame.prototype.requestRelative = function(id, callback, error) {
    var self = this;
    self.dataProvider.getProfileById(id, function(profile) {
        var fProfile = self.updateDemographic(profile);
        self.updateMainInfo(true);
        if(callback){
            callback(fProfile);
        }
    }, function (response) {
        if (error) {
            error(response);
        }
    });
};

ProfileFrame.prototype.bindings = function() {
    //we should update bindings every time we call for a new profile as template simply rewrites
    var self = this;
    var scroll_options = {
        scrollbars: true,
        interactiveScrollbars: true,
        mouseWheel: true,
        fadeScrollbars: true,
        shrinkScrollbars: 'scale'
    };
    self.$frame.find('input[type="tel"]').mask(ProfileFrame.phoneMask);
    var $dragContainer = $('.grid-container');
    var $demographicDataContainer = $('.demographic-data-container');
    var $topBorderElement = $('.phone-and-line-container');
    var $tag = $('.demographic-data-container-tag');
    var gridRows = 2;
    var gridColumns = 1;
    var gridHeight = 220;
    var gridWidth = parseInt($dragContainer.parents().first().css('width'));
    $dragContainer.css('bottom', -gridHeight + 'px');
    $demographicDataContainer.css('top', gridHeight + 'px');
    $dragContainer.css({height: gridRows * gridHeight, width: gridColumns * gridWidth});
    $demographicDataContainer.css({width: gridWidth, height: gridHeight});
    var maxTop = ($topBorderElement.offset().top + $topBorderElement.outerHeight() + 10) - $tag.offset().top;
    var $containerWrapper = $('.demographic-content-wrapper');
    $containerWrapper.css('height', gridHeight + 'px');
    var tag_handler = null;
    function update() {
        var y = 0;
        var animating_drag, animating_tap;
        var epsilon = 5;
        tag_handler = function() {
            if(!animating_drag) {
                animating_tap = true;
                $demographicDataContainer.velocity('stop', true);
                var value = ($tag.is('.active') ? '0px' : (-gridHeight + 'px'));
                $demographicDataContainer.velocity({translateY: value}, {duration: 500
                    , easing: 'easeInOutCubic'
                    , complete: function() {
                        y = !$tag.is('.active') ? 0 : -gridHeight;
                        animating_tap = false;
                    }
                });
                $tag.is('.active') ? $tag.removeClass('active') : $tag.addClass('active');
                if(self.menu.draggable) {
                    self.menu.draggableScroll.refresh();
                }
            }
        };
        interact.styleCursor(false);
        interact($tag.get(0)).on('tap', tag_handler);
        interact($demographicDataContainer.get(0))
            .draggable({axis: 'y', styleCursor: false})
            .allowFrom($tag.get(0))
            .snap({
                mode: 'grid',
                grid: { x: gridWidth, y: gridHeight },
                gridOffset: { x: 0, y: $dragContainer.offset().top - gridHeight },
                range: Infinity,
                endOnly: true,
                elementOrigin: { x: $dragContainer.offset().left, y: $dragContainer.offset().top }
            })
            .on('dragstart', function() {
                $('html').addClass('move-cursor');
                if(!animating_tap) {
                    animating_drag = true;
                }
            })
            .on('dragmove', function (event) {
                if(animating_drag) {
                    y += event.dy;
                    $(event.target).velocity({translateY: (y > maxTop ? y : maxTop)}, 0);
                }
            })
            .on('dragend', function(event) {
                $('html').removeClass('move-cursor');
                animating_drag = false;
                if(-epsilon < y && y < epsilon) {
                    $tag.removeClass('active');
                } else {
                    $tag.addClass('active');
                }
                if(self.menu.draggableScroll) {
                    self.menu.draggableScroll.refresh();
                }
            })
            .inertia({smoothEndDuration: 500})
            .restrict({
                drag: $dragContainer.get(0),
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                endOnly: true
            });
        self.menu.draggableScroll = new IScroll($containerWrapper.get(0), scroll_options);
    }
    update();
    var toggleContainers = function($this, contA, contB, isparent) {
        var $parent;
        if(!isparent) {
            $parent = $this.parents(contA);
        } else {
            $parent = $this.find(contA);
        }
        console.log(contA, contB);
        $parent.velocity('stop', true);
        $parent.velocity(
            {
                opacity: 0
            },
            {
                duration: 0,
                display: 'none',
                complete: function() {
                    $parent.addClass('invisible').removeClass('visible');
                    console.log(contB);
                    contB = $parent.siblings(contB);
                    contB.css({'display': 'block', 'opacity': 0}).find('input').first().focus();
                    contB.addClass('visible').removeClass('invisible');
                    contB.velocity(
                        {
                            opacity: 1
                        },
                        {
                            duration: 600
                        }
                    );
                }
            });
    };

    if(!ProfileFrame.binded) {
        var isOpened = false;
        ProfileFrame.binded = true;
        ZeroClipboard.config({ swfPath: '//s3.amazonaws.com/nextcaller-apptest/ZeroClipboard.swf' });
        self.$frame.find('svg.reset').on('mouseenter', function() {
            var $this = $(this).find('.reset-path');
            console.log($this);
            $this.velocity('stop', true);
            $this.velocity({translateX: "5"}, {duration: 500, loop: true});
        }).on('mouseleave', function() {
            var $this = $(this).find('.reset-path');
            console.log($this);
            $this.velocity('stop', true);
            $this.velocity({translateX: "0"}, {duration: 250});
        });
        self.$frame.on('click', '.phone-input-container', function(e) {
            e.stopPropagation();
            console.log('cont');
        });
        self.$frame.on('click', '.relative-link', function() {
            if(!self.ajaxing) {
                self.startAjax();
                var $this = $(this);
                var id = $this.data('link');
                var demographic = $('.demographic-data-container');
                var spinner = demographic.find('.spinner-container, .loader-wrapper');
                var content = demographic.find('.demographic-content-wrapper');
                content.velocity('stop', true).velocity({opacity: 0}, {duration: 200, display: 'none'});
                spinner.removeClass('invisible').addClass('visible');
                self.requestRelative(id, function() {
                    spinner.removeClass('visible').addClass('invisible');
                    content.velocity('stop', true).velocity({opacity: 1}, {duration: 0, delay: 300, display: 'block'});
                    self.stopAjax();
                }, function() {
                    spinner.removeClass('visible').addClass('invisible');
                    content.velocity('stop', true).velocity({opacity: 1}, {duration: 0, delay: 300, display: 'block'});
                    self.stopAjax();
                });
                return true;
            }
        });
        self.$frame.on('click', '#update-your-plan', function() {
            if(!self.ajaxing) {
                var $this = $(this);
                self.startAjax();
                $this.siblings('.spinner-container, .loader-wrapper').removeClass('invisible').addClass('visible');
                self.checkForUpdates(function() {
                    self.stopAjax();
                    $this.siblings('.spinner-container, .loader-wrapper').removeClass('visible').addClass('invisible');
                }, function() {
                    self.stopAjax();
                    $this.siblings('.spinner-container, .loader-wrapper').removeClass('visible').addClass('invisible');
                })
            }
        });
        self.$frame.on('focus', '.phone-input', function(e) {
            self.hideError(this);
        });

        self.$frame.on('keyup', '.phone-input', function(event) {
            if(event.keyCode == 13){
                event.stopPropagation();
                $(this).siblings(".search-button-async").trigger('click');
            }
        });

        self.$frame.on('click', '.search-button-async', function(e) {
            e.stopPropagation();
            var phone = $(this).siblings('.phone-input').get(0);
            var errors = self.checkForErrors(phone);
            if(errors || self.ajaxing) {
                return false;
            } else {
                self.startAjax();
                phone = $(phone);
                isOpened = false;
                toggleContainers(phone, '.phone-input-container', '.phone-ajax-async');
                if($tag.is('.active')) {
                    tag_handler()
                }
                self.updateProfile(phone.val(), function() {
                    self.stopAjax();
                    phone.val('');
                    toggleContainers($('.phone-ajax-async').parents().first(), '.phone-ajax-async', '.phone-and-line', true);
                }, function() {self.stopAjax();});
                return true;
            }
        });

        $('body').on('click', function(e) {
            if(isOpened) {
                isOpened = false;
                var $this = self.$frame.find('.phone-input');
                toggleContainers($this, '.phone-input-container', '.phone-and-line');
            }
        });

        self.$frame.on('click', '.copy-image', function() {
            self.$frame.find('.copy-image').removeClass('active');
            $(this).addClass('active');
        });

        if(!hasFlash()) {
            var data = null;
            var template = false;
            var closeModal = function(modal) {
                modal.velocity('stop', true).velocity({
                    opacity: 0
                },
                {
                    display: 'none',
                    duration: 300
                })
            };
            self.$frame.find('.copy-all, .copy-image').on('click', function() {
                data = self.copySelectedValues(($(this).is('.copy-all') ?  false : $(this)));
                if(data) {
                    var modal = self.$frame.find(ProfileFrame.modalSelector);
                    var input = null;
                    if(template) {
                        input = modal.find('input').val(data);
                    } else {
                        template = self.openModal(data);
                        modal.html(template);
                        modal.on('click', '.close-button', function() {
                            closeModal(modal);
                        });

                        modal.on('keyup', function(e) {
                            if(e.keyCode == 13) {
                                e.preventDefault();
                                e.stopPropagation();
                                closeModal(modal);
                            }
                        }).find('form').on('submit', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            closeModal(modal);
                        });

                        modal.find('.modal').prepend('<div class="close-button-container"><a class="close-button simple-link">Close</a></div>');
                    }
                    input = input ? input.get(0) : modal.find('input').get(0);
                    $('.ok-button').focus();
                    input.setSelectionRange(0, input.value.length);
                    modal.velocity('stop', true).velocity({
                        opacity: 1
                    },
                    {
                        display: 'block',
                        duration: 300
                    });
                }
            });
        }
    }

    $('.change-phone-button').on('click', function(e){
        e.stopPropagation();
        var $this = $(this);
        isOpened = true;
        toggleContainers($this, '.phone-and-line', '.phone-input-container');
    });

    if(hasFlash()) {
        self.updateFlashBindings();
    }
};
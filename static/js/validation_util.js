var ValidationUtil = (function() {
    var ValidationUtil = function(form, frame) {
        this.$form = form;
        this.$frame = frame;
        this.fieldNames = {};
    };

    var ascii_reg = /^[\x00-\x7F]*$/;
    function isASCII(str) {
        return ascii_reg.test(str);
    }

    var _validateField = function(field) {
        var $field = $(field);
        var types = $field.data('types');
        var errors = {};
        if(types) {
            types = types.split(',');
            types = $.map(types, function(elem) {
                var pair = elem.replace(' ', '').split(':');
                return pair[0];
            });
        } else {
            return errors;
        }
        var emptyRequired = function(errors, x, customField) {
            if(customField) {
                return errors['required'] = customField;
            }
            return errors['required'] = errors['required'] ? errors['required'].replace('{%param%}', x) : 'API ' + x + ' field is required.';
        };
        for (var i = 0; i < types.length; ++i) {
            var x = types[i];
            //here is where all errors have to be found, processing will be done in the calling code
            switch(x) {
                case 'required':
                    if(!$field.val() && !errors['required']) {
                        errors['required'] = 'API {%param%} field is required';
                    }
                    break;
                case 'password':
                    if(!$field.val()) {
                        emptyRequired(errors, x);
                    } else if (!isASCII($field.val().trim())){
                        errors['password'] = 'API username should not contain non-latin symbols';
                    } else if (!/^[^\W_]+$/.test($field.val().trim())) {
                        errors['password'] = 'API password must contain only numbers and letters';
                    }
                    break;
                case 'username':
                    if(!$field.val()) {
                        emptyRequired(errors, x);
                    } else if (!isASCII($field.val().trim())){
                        errors['username'] = 'API username should not contain non-latin symbols';
                    } else if (!/^[^\W_]+$/.test($field.val().trim())) {
                        errors['username'] = 'API username must contain only numbers and letters';
                    }
                    break;
                case 'phone':
                    if(!$field.val()) {
                        emptyRequired(errors, x, 'Phone number field cannot be empty');
                    } else {
                        var validValue = $field.val().replace(/[\(\) \-]+/g, '');
                        if(validValue.match(/[\w]{10}/) && validValue.length == 10) {
                            break;
                        }
                        errors['phone'] = 'Number must contain 10 digits';
                    }
                    break;
                default:
                    break;
            }
        }
        if (errors['required']) {
            errors['required'] = errors['required'].replace('{%param%} ', '');
        }
        return errors;
    };

    ValidationUtil.prototype = {
        checkForErrors: function(element) {
            var errors = _validateField(element);
            var $this = $(element);
            if ($.isEmptyObject(errors)) {
                $this.siblings('.field-error').text('').removeClass('active');
            }
            var types = $this.data('types');
            if(!types) {
                $this.siblings('.field-error').text('').removeClass('active');
                return;
            }
            types = $.map(types.split(','), function(tp) {
                var split = tp.replace(' ', '').split(':');
                return {priority: parseInt(split[1]) || 0, name: split[0]};
            }).sort(function(a ,b) {
                return a.priority < b.priority ? 1 : -1;
            });
            var text = null;
            $.each(types, function() {
                if(errors[this.name]) {
                    text = errors[this.name];
                    return false;
                }
                return true;
            });
            if(text) {
                $this.siblings('.field-error').text(text).addClass('active');
                return true;
            } else {
                return false;
            }
        },
        hideError: function (caller) {
            $(caller).siblings('.field-error').removeClass('active');
        },
        hideErrors: function() {
            this.$form.find('input').siblings('.field-error').removeClass('active');
        },
        cleanErrors: function() {
            this.$form.find('input').siblings('.field-error').text('').removeClass('active');
        },
        cleanPhone: function(phone) {
            return phone.replace(/\D/g, '');
        },
        show: function(timeout) {
            var self = this;
            $('.webapp-frame').hide();
            self.$frame.fadeIn(timeout ? 500 : 0);
            if(self.onShow) {
                self.onShow();
            }
        },
        hide: function() {
            this.$frame.hide();
        },
        emptyFrame: function(selector) {
            if(selector) {
                this.$frame.find(selector).html('');
            } else {
                this.$frame.html('');
            }
        },
        hasErrors: function() {
            return !!this.$form.find('.field-error.active').length;
        },
        showErrors: function(errors) {
            var self = this;
            $.each(errors, function(field, message){
                self.$form.find(self.fieldNames[field + 'Field']).siblings('.field-error').text(message).addClass('active');
            });
        }
    };
    ValidationUtil.prototype.constructor = ValidationUtil;
    return ValidationUtil;
})();
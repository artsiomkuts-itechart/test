var SignInFrame = function(){
    SignInFrame.superclass.constructor.call(this, $(SignInFrame.formSelector), $(SignInFrame.frameSelector));
    this.onSignedIn = null;
    this.bindings();
    this.fieldNames = {
        usernameField: '#apiUsernameInput',
        passwordField: '#apiPasswordInput'
    };
};

SignInFrame.frameSelector = '#jsSignInFrame';
SignInFrame.formSelector = '#jsSignInForm';

SignInFrame.prototype.pullKeysPair = function(){
    return {
        username: $('#apiUsernameInput').val().trim(),
        password: $('#apiPasswordInput').val().trim()
    }
};

SignInFrame.prototype.bindings = function() {
    var self = this;
    if(!SignInFrame.binded){

        self.$form.find('input').on('focus', function() {
            self.hideError(this);
        });

        self.$form.find('input').on('blur', function() {
            self.checkForErrors(this);
        });

        self.$form.on('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if(self.hasErrors()) {
                return false;
            }
            var keysPair = self.pullKeysPair(),
                errors = keysManager.validateKeysPair(keysPair);
            self.hideErrors();
            if(errors) {
                self.showErrors(errors)
            } else {
//                self.$form[0].reset();
                if(self.onSignedIn){
                    self.onSignedIn(keysPair)
                }
            }
            return false;
        });

        SignInFrame.binded = true;
    }
};

var NCWebApp = function (popup_mode) {
    this.$container = $('.nc-webapp-container');
    this.$middleware = $('.nc-webapp-popup-opener');
    if(popup_mode) {
        this.$container.css('display', 'block');
        this.extend(SignInFrame, ValidationUtil);
        this.extend(PhoneIDFrame, ValidationUtil, PhoneIDFrame.postExtend);
        this.extend(ProfileFrame, ValidationUtil);
        this.signInFrame = new SignInFrame();
        window.keysManager = new KeysManager();
        this.bindings();
    } else {
        this.$middleware.css('display', 'block');
        this.middlewareBindings();
    }
};

NCWebApp.prototype.openPopup = function() {
    var posX, posY;
    var w=392, h=532; //hard-coded dimensions of the app
    var offsetX = 10, offsetY= 10;
    if (typeof window.screenLeft != "undefined"){
        posX = window.screenLeft + offsetX;
        posY = window.screenTop + offsetY;
    } else if (typeof window.screenX != "undefined") {
        posX = window.screenX + offsetX;
        posY = window.screenY + offsetY;
    }
    else {
        posX = screen.availWidth/2 - w/2;
        posY = screen.availHeight/2 - h/2;
    }
    var win = window.open(window.location.href + '?popup=true', "_blank", "width=" + w + ",height=" + h + ",left=" + posX + ",top=" + posY);
    win.focus();
    return win;
};

NCWebApp.prototype.extend = function(cls, baseCls, postExtend) {
    var oldPrototype = cls.prototype;
    var intermediate = function F() {};
    intermediate.prototype = baseCls.prototype;
    cls.prototype = new intermediate();
    $.extend(cls.prototype, oldPrototype);
    cls.prototype.constructor = cls;
    cls.superclass = baseCls.prototype;
    postExtend && postExtend();
};

NCWebApp.prototype.signIn = function(keysPair, timeout){
    var self = this;
    if(!self.phoneIdFrame) {
        var phoneIdFrame = new PhoneIDFrame(keysPair);
        self.phoneIdFrame = phoneIdFrame;
        phoneIdFrame.onReset = function() {
            this.cleanErrors();
            this.resetProfile();
            this.clearPhone();
        };
        phoneIdFrame.show(timeout);
    } else {
        self.phoneIdFrame.setKeysPair(keysPair);
        self.phoneIdFrame.onReset();
        self.phoneIdFrame.show(timeout);
    }
};

NCWebApp.prototype.run = function() {
    var self = this,
        keysPair = keysManager.getKeysPair();
    this.signInFrame.onSignedIn = function(keysPair) {
        keysManager.setKeysPair(keysPair);
        self.signIn(keysPair, true);
    };
    if(keysPair) {
        self.signIn(keysPair, false);
    } else {
        this.signInFrame.show(false);
    }
    return this;
};


NCWebApp.prototype.middlewareBindings = function() {
    var self = this;
    var disableClicks = false;
    this.$middleware.on('click', '.open-app-button', function() {
        var popup = self.openPopup();
        disableClicks = true;
        setTimeout( function() {
            if(!popup || popup.outerHeight === 0) {
                $(this).siblings('.popup-blocker-error').velocity({opacity: 1}, {duration: 200, display: 'block'});
            }
        }, 25);
    })
};

NCWebApp.prototype.bindings = function() {
    var self = this;
    var time;
    var topMenuHeight = 250;
    var friction = 15;
    var initialTime = topMenuHeight * 6;
    var initialTension = initialTime * 0.25;
    if(!NCWebApp.binded) {
        self.$container.on('click', '#resetButton, .reset, #newCredsButton', function() {
            keysManager.cleanKeysPair();
            self.signInFrame.show(true);
            if(self.phoneIdFrame && self.phoneIdFrame.onReset) {
                self.phoneIdFrame.onReset();
            }
        });

        self.$container.on('click', '#newPhoneButton', function() {
            if(self.phoneIdFrame) {
                if(self.phoneIdFrame.onReset) {
                    self.phoneIdFrame.onReset();
                }
                self.phoneIdFrame.show(true);
            }
        });

        self.$container.on('click', '.cogwheel', function() {
            var $this = $(this);
            $this.toggleClass('clicked');
            var topMenu = self.$container.find('.top-menu');
            topMenu.addClass('animating');
            topMenu.velocity('stop', true);
            var height = parseInt(topMenu.css('height'));
            var coef = (topMenuHeight - height) / topMenuHeight;
            coef = coef < 0 ? Math.abs(coef) : coef;
            var tension = coef * initialTension;
            if($this.is('.clicked')) {
                time = coef * initialTime;
                topMenu.velocity({'height': [topMenuHeight + 'px', [tension < 100 ? 100 : tension, friction]]}, {
                    duration: time < 150 ? 150 : time,
                    complete: function() {
                        topMenu.addClass('opened').removeClass('animating');
                    }
                });
            } else {
                time = (height/(topMenuHeight*2.5)) * initialTime;
                topMenu.velocity({'height': '0px'}, {
                    duration: time,
                    easing: [0.94, 0.06, 0.32, 0.95],
                    begin: function() {
                        topMenu.removeClass('opened');
                    },
                    complete: function() {
                        topMenu.removeClass('animating');
                    }
                });
            }
        });
    }
    NCWebApp.binded = true;
};

$(document).ready(function(){
    var components = decodeURIComponent(location.search.substr(1)).split('&');
    var popup = !!~$.map(components, function(elem) { return elem.split('=')[0]; }).indexOf('popup');
    if(popup) {
        new NCWebApp(true).run();
    } else {
        new NCWebApp(false);
    }
});

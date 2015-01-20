var KeysManager = function(){
    this.keysPairVar = null;
};

KeysManager.ApiUsernameSelector = '#ApiUsername';
KeysManager.ApiPasswordSelector = '#ApiPassword';
KeysManager.IsPlatform = '#IsPlatformr';

KeysManager.prototype.getObtainedKeysPair = function(){
    var apiUsername = $(KeysManager.ApiUsernameSelector).val(),
        apiPassword = $(KeysManager.ApiPasswordSelector).val();
    if(apiUsername && apiPassword){
        return {
            username: apiUsername,
            password: apiPassword
        }
    }
    return null;
};

KeysManager.prototype.getLocalStorageKeysPair = function(){
    var apiUsername = localStorage.getItem('nc_api_username'),
        apiPassword = localStorage.getItem('nc_api_password');
    if(apiUsername && apiPassword) {
        return {
            username: apiUsername,
            password: apiPassword
        }
    }
    return null;
};

KeysManager.prototype.getKeysPair = function(){
    if(!this.keysPairVar){
        this.keysPairVar = this.getLocalStorageKeysPair();
        if(!this.keysPairVar){
            this.keysPairVar = this.getObtainedKeysPair();
            this.setKeysPair(this.keysPairVar)
        }
    }
    return this.keysPairVar;
};

KeysManager.prototype.setKeysPair = function(keysPair){
    if(keysPair && keysPair.username && keysPair.password){
        this.keysPairVar = keysPair;
        localStorage.setItem('nc_api_username', this.keysPairVar.username);
        localStorage.setItem('nc_api_password', this.keysPairVar.password);
    }
};

KeysManager.prototype.cleanKeysPair = function() {
    this.keysPairVar = null;
    localStorage.removeItem('nc_api_username');
    localStorage.removeItem('nc_api_password');
};

KeysManager.prototype.validateKeysPair = function(keysPair){
    var errors = {};
    if(!keysPair.username){
        errors.username = 'API username field is required'
    } else if(!/^[^\W_]+$/.test(keysPair.username.trim())) {
        errors.username = 'API username must contain only numbers and letters'
    }
    if(!keysPair.password){
        errors.password = 'API password field is required'
    } else if(!/^[^\W_]+$/.test(keysPair.password.trim())) {
        errors.password = 'API password must contain only numbers and letters'
    }
    if(errors.username || errors.password){
        return errors;
    }
    return null;
};

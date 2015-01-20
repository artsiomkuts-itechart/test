var NCDataProvider = function(keysPair){
    this.keysPair = keysPair;
    this.currentRequest = null;
    this.ajaxDefault = {
        type: 'GET',
        format: 'json',
        headers: {"Authorization": "Basic " + this.renderAuthHeader()}
    };
};

(function() {
    var replaceRegexp;
    var getProfileUrl, postProfileUrl, localRealm, getPlanUrl;
    getProfileUrl = window.getProfileUrl;
    postProfileUrl = window.postProfileUrl;
    getPlanUrl = window.getPlanUrl;

    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }

    localRealm = window.localRealm;
    replaceRegexp = /http[s]{0,1}:\/\/[^\/]*\//;
    getProfileUrl = localRealm ? window.location.origin + '/' + getProfileUrl.replace(replaceRegexp, '') : getProfileUrl;
    postProfileUrl = localRealm ? window.location.origin + '/' + postProfileUrl.replace(replaceRegexp, '') : postProfileUrl;
    getPlanUrl = localRealm ? window.location.origin + '/' + getPlanUrl.replace(replaceRegexp, '') : getPlanUrl;


    NCDataProvider.prototype.renderAuthHeader = function(){
        return $.base64.btoa(this.keysPair.username + ":" + this.keysPair.password)
    };

    NCDataProvider.prototype.ajax = function(params){
        return $.ajax($.extend(this.ajaxDefault, params));
    };

    NCDataProvider.prototype.setKeysPair = function(keysPair) {
        this.keysPair = keysPair;
        this.ajaxDefault.headers = {"Authorization": "Basic " + this.renderAuthHeader()}
    };

    NCDataProvider.prototype.getProfileByPhone = function(phone, success, error) {
        var data = {format: 'json', phone: phone};
        this.currentRequest = this.ajax({
            url: getProfileUrl,
            data: data
        }).done(function(response) {
            if(success) {
                success(response['records'][0])
            }
        }).fail(function(response) {
            if(error) {
                error(response)
            }
        });
    };

    NCDataProvider.prototype.getPlan = function(success, error) {
        this.currentRequest =  this.ajax({
            url: getPlanUrl
        }).done(function(response) {
            if(success) {
                success(response['fields'])
            }
        }).fail(function(response) {
            if(error) {
                error(response)
            }
        });
    };

    NCDataProvider.prototype.postProfile = function(id, data, success, error){
        this.currentRequest =  this.ajax({
            type: 'POST',
            url: postProfileUrl + id + '/',
            data: data,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        }).done(function(response){
            if(success){
                success(response)
            }
        }).fail(function(response){
            if(error){
                error(response)
            }
        });
    };

    NCDataProvider.prototype.getProfileById = function(id, success, error){
        var data = {format: 'json'};
        this.currentRequest = this.ajax({
            type: 'GET',
            url: postProfileUrl + id + '/',
            data: data,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        }).done(function(response){
            if(success){
                success(response)
            }
        }).fail(function(response){
            if(error){
                error(response)
            }
        });
    };
})();

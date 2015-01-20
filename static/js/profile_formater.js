var ProfileFormatter = function() {
    this.rawProfile = null;
},
    statesList = window.statesList;

ProfileFormatter.additionalFields = [
    "age",
    "education",
    "gender",
    "high_net_worth",
    "home_owner_status",
    "household_income",
    "length_of_residence",
    "marital_status",
    "market_value",
    "occupation",
    "presence_of_children",
    //no more relatives
    //"relatives",
    "social_links"
];

ProfileFormatter.YES_CHOICE = "YES";
ProfileFormatter.NO_CHOICE = "NO";
ProfileFormatter.HAS_KIDS_CHOICE = "Has kids";
ProfileFormatter.NO_KIDS_CHOICE = "No kids";
ProfileFormatter.HIGH_NET_WORTH_YES = "High Net Worth";
ProfileFormatter.HIGH_NET_WORTH_NO = "";

ProfileFormatter.prototype.hasAdditionalData = function(profile){
    for(var i in ProfileFormatter.additionalFields) {
        if (ProfileFormatter.additionalFields.hasOwnProperty(i)) {
            var field = ProfileFormatter.additionalFields[i];
            if(profile[field] !== undefined){
                return true;
            }
        }
    }
    return false;
};

ProfileFormatter.prototype.highNetWorth = function(value){
    if(value.toUpperCase() == ProfileFormatter.YES_CHOICE){
        return ProfileFormatter.HIGH_NET_WORTH_YES;
    } else {
        return ProfileFormatter.HIGH_NET_WORTH_NO;
    }
};

ProfileFormatter.prototype.hasKids = function(value){
    if(value.toUpperCase() == ProfileFormatter.YES_CHOICE){
        return ProfileFormatter.HAS_KIDS_CHOICE;
    } else {
        return ProfileFormatter.NO_KIDS_CHOICE;
    }
};

ProfileFormatter.prototype.formatAdditionalData = function(profile) {
    var maritalAndKids = '',
        incomeAndLength = '',
        result = [];
    //order makes sense here as values should render in specified positions (and I am too lazy to provide additional order key-value for each profile key)!!!
    if(profile['gender']){
        result.push({key: 'Gender', value: profile['gender']});
    }
    if(profile['age']){
        result.push({key: 'Age', value: profile['age'] + ' yrs old'});
    }
    if(profile['marital_status']){
        maritalAndKids = profile['marital_status'];
    }
    if(profile['presence_of_children']){
        if(maritalAndKids) {
            maritalAndKids += '/';
        }
        maritalAndKids += this.hasKids(profile['presence_of_children']);
    }
    if(maritalAndKids){
        result.push({key: 'Marital Status and Presence of Children', value: maritalAndKids});
    }
    if(profile['household_income']) {
        result.push({key: 'Household Income', value: profile['household_income']});
    }
    if(profile['education']){
        result.push({key: 'Education', value: profile['education']});
    }
    if(profile['home_owner_status']) {
        incomeAndLength = profile['home_owner_status'] + " home";
    }
    if(profile['length_of_residence']) {
        if(incomeAndLength) {
            incomeAndLength += ' for ';
        }
        incomeAndLength += profile['length_of_residence'];
    }
    if(profile['high_net_worth']) {
        var netWorth = this.highNetWorth(profile['high_net_worth']);
        if(netWorth) {
            if(incomeAndLength) {
                incomeAndLength += ', ';
            }
            incomeAndLength += netWorth;
        }
    }
    if(incomeAndLength) {
        result.push({key: 'Home Owner Status, Length of Residence, and Net Worth', value: incomeAndLength});
    }
    if(profile['relatives'] && profile['relatives'].length > 0){
        result.push({key: 'Relatives', value: _.map(
            profile['relatives'], function (rel) {return rel.name + '#: ' + rel.id}
        ), is_array: true});
    }
    if(profile['social_links'] && profile['social_links'].length){
        result.push({key: 'Social links', value: _.uniq(_.map(
            profile['social_links'], function (link) {
                return {type: link['type'], url: link['url'], followers: (link['followers'] ? (' - ' + link['followers'] + ' followers') : '')}
            }
        ), false, function(item) { return item['type']; }), is_array: true});
    }
    return result;
};

ProfileFormatter.prototype.formatProfile = function(srcProfile) {
    var self = this;
    self.rawProfile = srcProfile;
    var profile = {
        id: srcProfile.id,
        first_name: srcProfile.first_name,
        middle_name: srcProfile.middle_name,
        last_name: srcProfile.last_name,
        line_type: srcProfile.line_type,
        has_email: srcProfile.email !== undefined,
        email: srcProfile.email,
        shipping_address1: (srcProfile.address.length > 0 ? srcProfile.address[0] : {}),
        states: $.parseJSON(statesList),
        has_demographic: this.hasAdditionalData(srcProfile)
    };
    profile = $.extend(profile, {'demographic': this.formatAdditionalData(srcProfile)});
    return profile;
};

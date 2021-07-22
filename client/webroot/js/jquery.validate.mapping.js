$(document).bind('document_update', function(event, dom) {
    var forms = [];
    if (dom.is('form')) {
        forms.push(dom);
    } else {
        forms = dom.find('form');
    }
    $.each(forms, function(k, v) {
        $(v).ready(function(){
        $.validate_form($(v));
        $(v).submit(function() {
                $(this).valid();
            });
            $(v).find('input[type="submit"]').click(function(){
                if(!$(this).closest('form').valid()){
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }                   
            });
            });
    });
});
// constructs and returns the final data (rules and messages) to pass to original jquery.validate plugin
$.validation = function(filter, model, fdata) {
    for (x in filter) {
        fdata['rules']['data[' + model + '][' + x + ']'] = {};
        fdata['messages']['data[' + model + '][' + x + ']'] = {};
        $.validate_rules(x, filter[x], model, fdata)
    }
    for (x in fdata['messages']) {

        popup_x = x.split('][');
        pop = popup_x.pop();
        pop = '__' + pop;
        popup_x.push(pop);
        popup_x = popup_x.join('][');


        fdata['messages'][popup_x] = fdata['messages'][x];
        fdata['rules'][popup_x] = fdata['rules'][x];
    }
    return fdata;
};

// Finds the nested fields and rules associated and calls $.validate_map on these
$.validate_rules = function(name, rules, model, fdata, pre_x, ans_x) {
    if (typeof (rules) !== 'undefined') {
        for (x in rules) {
            data = [];
            if (x == 'rule') {
                if (isNaN(parseInt(rules[x])) === true) {
                    data = $.validate_map(rules[x]);
                    if (typeof (data) !== 'undefined') {
                        fdata['rules']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['rules']['data[' + model + '][' + name + ']'], data[0]);
                        fdata['messages']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['messages']['data[' + model + '][' + name + ']'], data[1]);
                    }
                }

            }
            else if (x == 'params') {
                var objectLength=0;
                $.each(rules['params'],function(k,v){
                    objectLength++;
                });
                if (rules['params'].length > 0 || objectLength)
                    if (rules[x]['options'][1] != 'undefined') {
                        data = $.validate_map(rules[x]['options'][1]);
                    }
                if (typeof (data) !== 'undefined') {
                    if (typeof (ans_x) != 'undefined') {
                        name = name + '][' + ans_x;
                    }
                    fdata['rules']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['rules']['data[' + model + '][' + name + ']'], data[0]);
                    fdata['messages']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['messages']['data[' + model + '][' + name + ']'], data[1]);
                }
            }
            else if ((rules instanceof Array) || (rules instanceof Object)) {

                $.validate_rules(name, rules[x], model, fdata, x, pre_x)

            }


        }

    }

};
// maps Maax rules to jquery validation plugin rules
$.validate_map = function(rule) {
    var map = [];
    switch (rule) {
        case "\\kernel\\validation::notEmpty":
            map = [{"required": true}, {"required": "Required"}];
            break;
        case "notEmpty":
            map = [{"required": true}, {"required": "Required"}];
            break;
        case "\\kernel\\validation::isValidEmail":
            map = [{"email": true}, {"email": "Invalid"}];
            break;
        case "\\kernel\\validation::isValidPhoneNumber":
            map = [{"intlphone": true}, {"intlphone": "Invalid"}];
            break;
    }
    return map;

};
// function to validate phone number
jQuery.validator.addMethod('intlphone', function(value) {
    return (value.match(/^\s*(?!([^-]*-){5})(\+\s*\d+)?\s*(\(\s*\d+\s*\))?\s*[- \d]+\s*$|^\s*$/));
});
// validates form
$.validate_form = function(form) {
    var rules = {};
    var messages = {};
    var jsRules = {
        rules: rules,
        messages: messages
    };
    var fdata = $.validation(form.data('filter_rules'), form.data('model'), jsRules);
  //  form.validate(fdata);
};
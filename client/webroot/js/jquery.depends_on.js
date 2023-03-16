/*
 fetch_default_value:
 
 While creating form fields we will specify a property called "on_change_field",
 this will be fully qualified name of other form field its depends on.
 
 
 */


(function($) {
    // we will track change in DOM from our plugin
    $(document).bind('document_update', function(event, dom) {
        //code for grid it will modify the name of on_change_field in grid
        dom.find("[name]").not('.template-element').each(function() {
            if (typeof ($(this).attr('on_change_field')) != undefined) {
                var on_change = $(this).attr('on_change_field');
            }
            if (on_change != null && on_change != '') {
                var on_change_fullname = on_change.split(".");
                on_change_fullname = "data[" + on_change_fullname.join("][") + "]";
                var form = $(this).closest('form');
                var on_change_fullname = form.find('[name="' + on_change_fullname + '"]').attr('name');
                var name = $(this).attr('name');
                name = name.split('][');
                name.pop();
                var grid = name.pop();
                grid = parseInt(grid);
                if (typeof (grid) == 'number' && grid && typeof (on_change_fullname) == 'undefined') {
                    $(this).attr('on_change_field', Grid(on_change, grid)).removeAttr('disabled').filter('[is_disabled="1"]').attr('disabled', 'disabled');
                }
            }
            function Grid(on_change, count) {
                on_change = on_change.split('.');
                r = on_change.pop();
                on_change.push(count);
                on_change.push(r);
                on_change = on_change.join('.');
                return on_change;

            }

        });
        dom.find(".popup-hidden")
                .not('.template-element')
                .bind('data_source_url', function(event, id) {
                    try {
                        var href = '';
                        var td = $(this).closest('div');
                        var popupSelect = td.find('.popup-select');
                        if (popupSelect.length > 0) {
                            href = popupSelect.find("option:selected").attr('href');
                        } else {
                            href = $((typeof (this.element) != 'undefined' && typeof (this.element[0]) != 'undefined' ? this.element[0] : this)).attr('href');
                        }
                        if (typeof (href) != 'undefined' && $.trim(href) != '') {
                            href = href.split("?")[0].replace('/index', '/view');
                            href += ".json?id=" + id;
                            $(this).data('data_source_url', href);
                            event.preventDefault();
                            return false;
                        }
                    }
                    catch (err)
                    {
                        log(err);
                    }
                });

        if (typeof (dom) != 'undefined') {
            // track on change field from the form as DOM changes
            dom.find("[on_change_field]").not('.template-element').autoPopulate({
                'name_formatter': function(name) {
                    var name = name.split(".");
                    return name = "data[" + name.join("][") + "]";
                },
                'data_cleaner': function(data) {
                    if (typeof (data['paginate']) != 'undefined' && typeof (data['paginate']['data']) != 'undefined') {
                        data = data['paginate']['data'];
                        return data;
                    } else
                        return [];

                },
                'data_source': function(id) {
                    $(this).triggerHandler('data_source_url', id);
                    return $(this).data('data_source_url');
                },
                bring_data: function(q, dataSource) {
                    var promise = $.Deferred();
                    $.ajax(dataSource, {
                        data: {
                            q: JSON.stringify(q)
                        },
                        success: function(result) {
                            promise.resolve(result);
                        },
                        error: function() {

                            var error = 'failed in fetching data';
                            promise.reject(error);
                        }
                    });
                    return promise;
                },
                new_q: function(q) {
                    q['method'] = 'find';
                    q['fields'] = [];
                    q['where'] = {};
                    return q;
                }

            });
        }

    });
    // plugin name
    $.fn.autoPopulate = function(options) {

        // take sample thids as imnput
        //console.log('shubham')
        // defaults for plugin
        var defaults = {
            // in case "on_change_field" value need tranformation to get actual field name.
            'name_formatter': function(name) {
                return name;
            },
            // possible values are
            // 1. JSON data.
            // 2. URL to fetch data from.
            // 3. function which returns JSON data or URL to fetch data.
            'data_source': '',
            // in case server data need preprocessing.
            'data_cleaner': '',
            'populate_on_create': 1,
            'on_change_field': null
        };
        // merged settings;
        var settings = $.extend({}, defaults, options);
        //private function setting values, trigger data_ready event;

        // function to generate 'q' based on dependent field registry
        function generate_Q(onChangeField) {
            try {
                // 'q' that will get generated will come under this oject
                var rule_Q = {};
                // finding all dependent fields
                var dependentList = onChangeField.data('dependent_list');
                var form = onChangeField.closest('form');
                // iterating over all dependencies to generate 'q' accordingly
                $.each(dependentList, function(i, dependentName) {

                    // finding all filter conditions and its values
                    filterField = $(form.find('[name="' + dependentName + '"]')).attr('__filter_field');
                    if (typeof (filterField) == 'undefined') {
                        log('Auto-population : filter field not defined' + dependentName);
                    }
                    if (typeof (filterField) != 'undefined') {
                        filterField = filterField.split('.');
                        filterField.splice(0, 1);
                        filterField = filterField.join('.');
                    }

                    filterValue = $(form.find('[name="' + dependentName + '"]')).attr('filter_val');
                    if (typeof (filterValue) == 'undefined') {
                        log('Auto-population : filter value not defined' + dependentName);
                    }
                    mappedField = $(form.find('[name="' + dependentName + '"]')).attr('__mapped_field');
                    if (typeof (mappedField) == 'undefined') {
                        log('Auto-population : mappedField not defined for' + dependentName);
                    }

                    // @author : tushar takkar
                    // why we need following commented code?
                    /*
                     if (typeof (mappedField) != 'undefined') {
                     mappedField = mappedField.split('.');
                     mappedField.splice(0, 1);
                     mappedField = mappedField.join('.');
                     }*/

                    if (mappedField != null) {
                        // defining index as under which we will populate the 'q'
                        if (filterField == null) {
                            index = 'simple';
                        } else
                        {
                            index = filterField + '|' + filterValue
                        }
                        // generating new 'q' as per our condition
                        if (typeof (rule_Q[index]) == 'undefined') {
                            var q = {};
                            var q = settings.new_q(q);
                            rule_Q[index] = q;
                        }
                        // push fields in our 'q'
                        rule_Q[index]['fields'].push(mappedField);
                        if(form.find('[name="' + dependentName + '"]').attr('type') =='file'){
                            var mappedFieldModel=mappedField.split('.');
                            mappedFieldModel.pop();
                            mappedFieldModel=mappedFieldModel.join('.');
                            rule_Q[index]['fields'].push(mappedFieldModel+".mime_type as 'document_mime_type'");
                            rule_Q[index]['fields'].push(mappedFieldModel+".path as 'document_path'");
                            rule_Q[index]['fields'].push(mappedFieldModel+".storage_path  as 'document_storage_path'");
                            rule_Q[index]['fields'].push(mappedFieldModel+".id AS 'document_id'");
                            rule_Q[index]['fields'].push(mappedFieldModel+".name AS 'document_name'");
                        }
                        // populate where conditions in 'q'
                        if (filterField != null) {
                            rule_Q[index]['where'][filterField] = filterValue;
                        }

                    }

                });
                return rule_Q;
            }
            catch (err)
            {
                log(err);
            }
        }

        function processString(dup, alias) {
            dup = dup.split('.');
            var index = dup.lastIndexOf(alias);
            if (index != -1) {
                // if found then remove everything before it
                dup = dup.slice(index);
            } else {
                // else add alias as 0th string
                dup.unshift(alias);
            }
            return dup.join('.');
        }

        // function to bring data via ajax calls based on our 'q'
        function bringData(rule_Q, dataSource, id, onChangeField) {
            try {
                // hot fix for issue of alias name
                if (typeof (id[0]) != 'undefined' && $.trim(id[0]) != '') {
                    var alias = id[0].split('.');
                    alias = alias[0];
                }
                for (z in rule_Q) {
                    for (x in rule_Q[z]['fields']) {
                        //@author : tushar takkar
                        /*this code is wrong
                         if (dup[0] != alias) {
                         if (alias in dup) {
                         dup.splice(0, dup.indexOf(alias));
                         }
                         dup[0] = alias;
                         dup = dup.join('.');
                         rule_Q[z]['fields'][x] = dup;
                         }
                         */
                        // We have to remove any path before alias string, if its missing as it as first string.
                        rule_Q[z]['fields'][x] = processString(rule_Q[z]['fields'][x], alias);
                    }
                    for (y in rule_Q[z]['where']) {
                        var dup = processString(y, alias);
                        rule_Q[z]['where'][dup] = rule_Q[z]['where'][y];
                        delete(rule_Q[z]['where'][y]);
                    }
                }

                var data = {};
                var count = 0;
                var cnt = 0;
                // count to control the asynchronous code so that we can populate the data
                for (x in rule_Q) {
                    count++;
                }

                // get data based on 'q'
                $.each(rule_Q, function(i, q) {
                    // populate where condition as we need only data if this id
                    q['where'][id[0]] = id[1];
                    // call bring data by declaring promise variable
                    if (typeof (settings.bring_data) == "function") {
                        // calling bring data
                        var dataPromise = settings.bring_data(q, dataSource);
                        // we get our data when promise done
                        dataPromise.done(function(result) {
                            //calling data cleaner to clean data
                            data[i] = settings.data_cleaner(result);
                            if (cnt == count - 1) {
                                // calling populate value as we  need to populate this data in fields
                                $.populateValue(onChangeField, data);
                            } else {
                                cnt++;
                            }

                        });

                    }

                });
            }
            catch (err)
            {
                log(err);
            }
        }

        // function to populate value to be called from bring data after data is being collected
        $.populateValue = function(onChangeField, data) {
            try {
                // find all dependencies;
                var dependentList = onChangeField.data('dependent_list');
                log(['onChangeField',onChangeField,dependentList]);
                
                var form = onChangeField.closest('form');
                // if data does not comes
                if (data === false) {
                    data = {};
                    $.each(dependentList, function(i, dependentName) {
                        if(form.find('[name="' + dependentName + '"]').attr('type') != 'file'){
                            form.find('[name="' + dependentName + '"]').val('');
                        }
                    });
                } else {
                    // iterate over dependent list and populate data one by one
                    $.each(dependentList, function(i, dependentName) {
                        // to reset all dependent fields before setting it 
                        if(form.find('[name="' + dependentName + '"]').attr('type') != 'file'){
                            form.find('[name="' + dependentName + '"]').val('');
                        }

                        if (typeof (dependentName) != 'undefined' && $.trim(dependentName) != '') {
                            var popupHidden = dependentName.split('][');
                            popup = popupHidden.pop();
                            if (popup[0] == '_' && popup[1] == '_') {
                                popup = popup.slice(2, popup.length);
                                popupHidden.push(popup);
                                popupHidden = popupHidden.join('][');
                                var flag = true;
                            }
                        }
                        // fetching attributs from the DOM
                        filterField = $(form.find('[name="' + dependentName + '"]')).attr('__filter_field');
                        if (typeof (filterField) != 'undefined') {
                            filterField = filterField.split('.');
                            filterField.splice(0, 1);
                            filterField = filterField.join('.');
                        }
                        filterValue = $(form.find('[name="' + dependentName + '"]')).attr('filter_val');
                        mappedField = $(form.find('[name="' + dependentName + '"]')).attr('__mapped_field');
                        if (typeof (mappedField) != 'undefined') {
                            mappedField = mappedField.split('.').pop();
                        }
                        
                        // populating fields in DOM
                        if (mappedField != null) {
                            // index from which we have to get data on this dependent field
                            if (filterField == null) {
                                index = 'simple';
                            } else {
                                index = filterField + '|' + filterValue
                            }
                            // if we have not got the data we need to follow fall back to populate same data
                            if (data[index].length == 0) {
                                ind = index.split('|');
                                for (x in data) {
                                    if (data[x].length > 0) {
                                        if (x.indexOf(ind[0]) !== -1){
                                            index = x;
                                        }
                                    }
                                }
                            }
                            // populating data based on fields
                            $.each(data[index], function(k, v) {
                                // iterating through each key
                                for (key in v) {
                                    // if key matches the mapped field we have to put that data
                                    if (key == mappedField) {
                                        
                                        var field = form.find('[name="' + dependentName + '"]');
                                        // condition to check if field is empty
                                        if (field.attr("type") == "file") {
                                            var f1=dependentName.split('][');
                                            var documentdata=data["simple"][0];
                                            f1.pop();
                                            f1=f1.join('][');
                                            field.after('<input type="hidden" name="'+f1+'][clone_id]" value="'+documentdata['document_id']+'"><a href="/document_management_base/attachments/_download/id:'+documentdata['document_id']+'" data-ajax="false"><img src="'+(documentdata['document_storage_path']+documentdata['document_path']).replace('webroot/','/')+'" style="max-width:100px;height:auto;"></a>');                                            
                                            //document_id: 1646
                                            //document_mime_type: "image/png"
                                            //document_name: "logo-sample.png"
                                            //document_path: "2022/08/04/12/62ebbc93-7a3c-49df-998a-083d89e4c792.png"
                                            //document_storage_path: "webroot/img/uploads/"

                                        }else if(field.val().length == 0){
                                            if (flag == true) {
                                                populatePopupValue(dependentName, v[key], popupHidden, form);
                                                flag = false;
                                            } else {
                                                log(field.attr("type")+' -> Auto-population populateValue: [name="' + dependentName + '"].val(' + v[key] + ')');
                                                // finding the field and setting its value
                                                field.val(v[key]).trigger('change');
                                                if(field.attr('editor') == "WYSIWYG"){
                                                    field.cleditor()[0].updateFrame();
                                                }
                                            }
                                        }
                                    }

                                }


                            });


                        }


                    });
                }
            }
            catch (err)
            {
                log(err);
            }
        }
        function populatePopupValue(dependentName, id, popupHidden, form) {
            try {
                var source = $(form.find('[name="' + dependentName + '"]')).attr('href');
                if (typeof (source) != 'undefined' && $.trim(source) != '') {
                    source=source.split("?")[0];
                    source += '.json';
                    if (source.indexOf('view') > -1) {
                        source = source.replace('/view', '/index');
                    }
                }

                if (typeof (settings.new_q) == 'function') {
                    var q = {};
                    var q = settings.new_q(q);
                    q['fields'].push('{{MODEL}}.{{DISPLAY_FIELD}}');
                    q['where']['{{MODEL}}.{{PRIMARY_KEY}}'] = id;
                }
                if (typeof (settings.bring_data) == "function") {
                    var dataPromise = settings.bring_data(q, source);
                    // we get our data when promise done
                    dataPromise.done(function(result) {
                        //calling data cleaner to clean data
                        if(Array.isArray(result['paginate']['data']) && result['paginate']['data'].length > 0){
                            var data = result['paginate']['data'][0];
                            var allLabel=Object.values(data);
                            var label=($.isset(data['name'])?data['name']:(allLabel.length > 0)?allLabel[0]:'');
                            log('Auto-population populatePopupValue : [name="' + dependentName + '"].val(' + label + ')');
                            log('Auto-population populatePopupValue : [name="' + popupHidden + '"]).val(' + id + ')');

                            form.find('[name="' + dependentName + '"]').val(label).trigger('change');
                            form.find('[name="' + popupHidden + '"]').val(id).trigger('change');
                        }    
                    });
                }
            }
            catch (err)
            {
                log(err);
            }
        }

        // function to generate simple 'q'

        var onChangeFieldList = [];
        // loop of each match element in set
        var plugin = this.each(function(k, v) {
            try {

                var dependencyName = $(this).attr('name');
                // on whcih field its dependent on.
                var onChangeField = (settings.on_change_field != null ? settings.on_change_field : $(this).attr('on_change_field'));
                // try to localy dependednt on element.
                onChangeField = $(this).closest('form').find('[name="' + settings.name_formatter(onChangeField) + '"]');
                onChangeFieldList.push(onChangeField);
                // find list containing all dependencies, else create an empty list.
                var dependentList = onChangeField.data('dependent_list');
                var isset = true;
                if (!$.isArray(dependentList)) {
                    dependentList = [];
                    isset = false;
                }
                // add to dependency list and save it back into element.
                dependentList.push(dependencyName);
                onChangeField.data('dependent_list', dependentList);
                // if element is not informed that others are dependent on it, then inform it so that it can inform back with cahnge data.
                if (isset === false) {
                    // code to be executed when field changes it value.
                    onChangeField.change(function(event) {
                        var onChangeField = $(this);
                        var id = [];
                        // changed value
                        var onChangeFieldValue = onChangeField.val();
                        var oldFieldValue = onChangeField.attr('oldFieldValue');
                        if (onChangeFieldValue != "" && oldFieldValue == onChangeFieldValue) {
                            return;
                        } else {
                            onChangeField.attr('oldFieldValue', onChangeFieldValue);
                        }
                        console.log('onChangeFieldValue',onChangeFieldValue);
                        if (onChangeFieldValue != false) {
                            // find source which can be a
                            //1. JSON data

                            var dataSource = settings.data_source;
                            // if source is function then call it.
                            if (typeof (dataSource) == "function") {

                                dataSource = dataSource.call(onChangeField, onChangeFieldValue);
                            }


                            // if source is URL then make get/json call.
                            if (typeof (dataSource) == "string") {
                                // fetch data from server.
                                if (dataSource.indexOf('?') == -1) {
                                    // If URL doesnt not contain ID then append as get parameter...
                                    dataSource += "?id=" + onChangeFieldValue;
                                }
                                // manipulation on data source to collect its id to pass as where in our 'q'
                                dataSource = dataSource.split('/');
                                dataSource.pop();
                                id[0] = dataSource.pop();
                                dataSource.push(id[0]);
                                dataSource = dataSource.join('/');
                                dataSource += '/index.json'


                                if (typeof (id[0]) == 'string') {
                                    id[0] += '.id';
                                    id[1] = onChangeFieldValue;
                                }


                                //function to generate 'q' by scanning the fields which are dependent
                                var rule_Q = generate_Q(onChangeField);
                                // after q is generated under rule_q we need to bring data and populate it
                                bringData(rule_Q, dataSource, id, onChangeField);
                            }

                        } else {
                            $.populateValue(onChangeField, false);
                        }

                    });
                }
            }
            catch (err)
            {
                log(err);
            }
        });
        if (settings.populate_on_create == 1) {
            var action = $(onChangeFieldList[0]).closest("form").attr('action');
            if (typeof (action) !== 'undefined') {
                if (action.indexOf("add") != -1) {

                    $.each(onChangeFieldList, function(k, v) {
                        try {
                            if ($(v).val() !== '') {
                                $(v).trigger('change');
                            }
                        }
                        catch (err)
                        {
                            log(err);
                        }
                    });
                }
            }
        }
        return plugin;
    }
}(jQuery));

/*
 fetch_filtered_value_set:
 
 While creating form fields we will specify a property called "filter_by_fields",
 this will be fully qualified name of other form field its data to be filtered by.
 You can specify a comma separated list of one or more fields...
 e.g.: State will be filtered by country.
 Any call made to state data will auto append country criteria.
 Also a trigger will be fired called "beforeSearch()" as its happening right now.
 On change of country, reset state.
 
 Filter example 1;
 <input name="data[invoices][country_id]" value="">
 <input name="data[invoices][state_id]" filter_by_fields="invoices.country_id" >
 
 Filter example 2;
 If sql column name cant be retrive from form field name, then sepecify "form_field_name|sql_column_name"
 <input name="data[invoices][country_id]" value="">
 <input name="data[invoices][state_id]" filter_by_fields="invoices.country_id|custom_country_id" >
 
 Filter example 2;
 Comma seperated list of column in case of multiple filter by
 <input name="data[invoices][country_id]" value="">
 <input name="data[invoices][state_id]" value="" filter_by_fields="invoices.country_id|custom_country_id" >
 <input name="data[invoices][city_id]" filter_by_fields="invoices.country_id|custom_country_id,invoices.state_id|state_id" >
 
 $(['filter_by_fields'])
 .filterBy(
 {
 'form_field_name':function(name){
 var name=name.split(".");
 return name="data["+name.join("][")+"]";
 },'sql_column_name':function(name){
 var name=name.replace('[','.').replace(']','.').split('.');
 var found = false;   
 while(name.length > 0 && found===false){
 var tempName=name.pop();
 if(tempName !=""){   
 found=tempName;
 }
 }
 return found;
 }
 }
 );
 */







(function($) {

    $(document).bind('document_update', function(event, dom) {

        //code for grid it will modify the attribute on_change_field in grid
        dom.find("[name]").not('.template-element').each(function() {
            try {
                var filters = '';
                if (typeof ($(this).attr('filter_by_fields')) != undefined) {
                    filters = $(this).attr('filter_by_fields');
                }

                if (filters != null && filters != '') {
                    filters=filters.split(',');
                    var filter_by_fields=[];
                    for(var i=0; i < filters.length; i++){
                        var filter=filters[i];
                        // take the ROW or COLUMN out
                        filter = filter.split('|');
                        var sqlColumnName="";
                        if(filter.length == 2){
                            sqlColumnName=filter[1];
                        }
                        // pick the first part of array which is the filter definition
                        filter = filter[0];
                        var filter_fullname = filter.split(".");
                        filter_fullname = "data[" + filter_fullname.join("][") + "]";
                        // above 2 could have been written as var filter_fullname = "data[" + filter.split(".").join("][") + "]";
                        // pick the closest form as maax supports multiple forms per page
                        var form = $(this).closest('form');
                        // @TODO This is a slow operation, better to go by ID for any DOM element
                        var filter_name = form.find('[name="' + filter_fullname + '"]').attr('name');
                        // filter_name is undefined
                        var name = $(this).attr('name');
                        name = name.split('][');
                        // throw away the last
                        name.pop();
                        // grid element number
                        var grid = name.pop();
                        grid = parseInt(grid);
                        // @TODO bad logic here.  Grids are 0 based and && grid checks for TRUE / FALSE and 0 = FALSE
                        // Such a scenario is only used before typeof to avoid if throwing an error
                        // Read shortcut evaluation 
                        // ~~ if (typeof (grid) == 'number' && grid && typeof (filter_name) == 'undefined') { ~~
                        if (typeof (grid) == 'number' && typeof (filter_name) == 'undefined') {
                            var filter_by_field=Grid(filter, grid);
                            if(sqlColumnName !=""){
                                filter_by_field="|"+sqlColumnName;
                            }
                            filter_by_fields.push(filter_by_field);
                            //$(this).attr('filter_by_fields', filter_by_field).removeAttr('disabled').filter('[is_disabled="1"]').attr('disabled', 'disabled');
                        }
                    }
                    if(filter_by_fields.length >  0){
                        filter_by_fields=filter_by_fields.join(',');
                        $(this).attr('filter_by_fields', filter_by_fields).removeAttr('disabled').filter('[is_disabled="1"]').attr('disabled', 'disabled');
                    }
                }
                function Grid(filter, count) {
                    filter = filter.split('.');
                    r = filter.pop();
                    filter.push(count);
                    filter.push(r);
                    filter = filter.join('.');
                    return filter;

                }
            }
            catch (err)
            {
                log(err);
            }

        });
        if (typeof (dom) != 'undefined') {

            dom.find("[filter_by_fields]").not('.template-element').filterBy({
                'search': function(name) {
                    return '[__name="' + name + '"]';
                },
                'sql_column_name': function(name) {
                    var name = name.replace('[', '.').replace(']', '.').split('.');
                    var found = false;
                    while (name.length > 0 && found === false) {
                        var tempName = name.pop();
                        if (tempName != "") {
                            found = tempName;
                        }
                    }
                    return found;
                }
                ,
                'form_field_name': function(name) {
                    var name = name.split(".");
                    return name = "data[" + name.join("][") + "]";
                }

            });
        }
    });

    // plugin name
    $.fn.filterBy = function(options) {
        // defaults for plugin
        var defaults = {
            // translate column name into form field name.
            'form_field_name': function(name) {
                return name;
            },
            // convert form field name into sql column name.
            'sql_column_name': function(name) {
                return name;
            },
            'filter_by_fields': null
        };
        // merged settings;
        var settings = $.extend({}, defaults, options);
        // loop of each match element in set
        var plugin = this.each(function(k, v) {
            // alias for current element;
            var element = $(this);
            // All fields which have the attribute filter_by_field associated with it
            var fieldName = element.attr('name');
            // All fields on which current element need to be filtered by.
            // Comma seperated list.
            // If sql column name cant be retrive from form field name, then sepecify "form_field_name|sql_column_name"
            var filterByFields = (settings.filter_by_fields != null ? settings.filter_by_fields : element.attr('filter_by_fields'));
            // field on whose value other fields need to be filtered by
            if (filterByFields != "") {
                var __filterByFields = element.attr('__filter_by_fields');
                if( filterByFields.indexOf('|') == -1 && __filterByFields.indexOf('|') != -1 ){
                    filterByFields = filterByFields +"|"+ __filterByFields.split('|')[1];
                }
                filterByFields = filterByFields.split(',');
                // find form containing element that defines scope of filtered by fields.
                var form = element.closest('form');
                var filterByFieldsObj = [];
                $.each(filterByFields, function(k, filterByField) {
                    try {
                        // split form field name and any sql column name
                        filterByField = filterByField.split('|');
                        filterByField[0] = $.trim(filterByField[0]);

                        var sqlColumnName = '';
                        if (typeof (filterByField[1]) != "undefined") {
                            // if sql column name is defined.
                            sqlColumnName = filterByField[1];
                        } else {
                            // else compute sql column name from form field name.
                            sqlColumnName = settings.sql_column_name(filterByField[0]);
                        }
                        // find all parent fields and set change event so when they change, all to be filtered fields get reset.
                        var formFieldName = form
                                .find('[name="' + settings.form_field_name(filterByField[0]) + '"]')
                                .change(function() {
                                    element.val("").trigger('change');
                                }).attr('name');
                        // formFieldName is the fully qualified name of field based on its value other form field needs to be filtered by

                        /* we will maintain a registry of filter by field and on its sql_column_name index we will store the column name
                         and at the index form_field_name we will store name of form field on change of which othe filds need to filter by */
                        filterByFieldsObj[k] = {
                            'sql_column_name': sqlColumnName,
                            'form_field_name': formFieldName
                        };
                    }
                    catch (err)
                    {
                        log(err);
                    }
                });
                // we will assign this sql name and name odf the field to tha data attribute of each associated with field
                element.data('filter_by_fields_obj', filterByFieldsObj);
                element.bind('beforeSearch', function(event,href) {
                    try {
                        var q = $(this).data('q');
                        /*  
                        if(!$.isArray(q)){
                            q=[q];   
                        } 
                        */
                        var href=href.split('/');
                        var where = {}; 
                        $(this).data('filter_by_fields_obj').forEach(function(k, v) {
                            var prefilter=false;
                            if(k['sql_column_name'].indexOf('filter_by_url.') != -1){
                                var sql_column_name=k['sql_column_name'].split('.');
                                if(href[0] == sql_column_name[0]){
                                    prefilter=true;
                                }
                                k['sql_column_name']=k['sql_column_name'].replace('filter_by_url.','');
                            }else{
                                prefilter=true;
                            }
                            if(prefilter == true){
                                where[k['sql_column_name']] = form.find('[name="' + k['form_field_name'] + '"]').val();
                                //new code for grid
                                if (typeof (q['controller']) == 'undefined') {
                                    var id = form.find('[name="' + k['form_field_name'] + '"]').val();
                                    if (id != null && id != '') {
                                        where[k['sql_column_name']] = id;
                                        //   q['where'] = where;
                                    }
                                }
                            }

                        });
                        $.extend(q['where'], where);
                        console.log(q);
                        $(this).data('q', q);
                    }
                    catch (err)
                    {
                        log(err);
                    }
                });
            }
        });
        return plugin;
    }
}(jQuery));



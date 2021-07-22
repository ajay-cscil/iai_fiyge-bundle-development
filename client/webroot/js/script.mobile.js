var loaderNotValidClasses = ['history_index','carousel-control',
'popup-clear','ui-datepicker-prev',
'ui-datepicker-next','.ui-datepicker-calendar',
'ui-icon-delete'];
function getString(arr) {
    if (typeof arr == 'string') {
        return arr;
    } else {
        var str = '';
        for (var i in arr) {
            str += ' ' + i + '="' + arr[i] + '"';
        }
        return str;
    }
    return '';
}
function showError(msg) {
    var html = "";
    if (typeof msg == 'object') {
        for (var i = 0; i < msg.length; i++) {
            html += "<li>" + msg[i] + "</li>";
        }
        html = "<ol>" + html + "</ol>";
    }
    else {
        html = msg;
    }
    $("#message-panel").removeClass('ui-helper-hidden').removeClass('ui-state-highlight').addClass('ui-state-error').html(html);
}
jQuery.fn.valJSON = function(value, text, merge) {
    log('valJSON');

    if (typeof merge == 'undefined') {
        merge = true;
    }
    if (typeof value == 'undefined') {
        return $(this).val();
    } else {
        return $(this).each(function() {
            var v = [];
            if (merge === true) {
                v = $.parseJSON($(this).val());
                if (!$.isArray(v)) {
                    v = [];
                }
                v.push([value, text]);
            }
            $(this).val(JSON.stringify(v));
        });
    }
}
function parseJSON(string) {
    var json = '';
    try {
        json = JSON.parse(string);
    }
    catch (e) {

    }
    return json;
}
function showMessage(msg) {
    $("#message-panel").removeClass('ui-helper-hidden').removeClass('ui-state-error').addClass('ui-state-highlight').html(msg);
}
function hideMessage() {
    $("#message-panel").addClass('ui-helper-hidden').html('');
}
function showLoader(el) {
    if (typeof (el) != 'undefined') {
        var show = true, i;
        for (i = 0; i < loaderNotValidClasses.length; i++) {
            if (el.hasClass(loaderNotValidClasses[i])) {
                show = false;
            }
        }
        if (show === true) {
            showLoader();
        }
        else{
            hideLoader();
        }
    }
    else {
        $('#dvLoading').show();
    }
}
function hideLoader() {
    $('#dvLoading').hide();
}
jQuery('document').ready(function($) {
    /**
     * check if variable defined
     *
     * @author Tushar Takkar
     * @param mixed variable
     * @return boolean true/false
     */
    $('.carousel').each(function(){
        $(this).carousel({
            pause: true,
            interval: false
        });
    });
    $.isset = function(variable) {
        return (typeof variable != 'undefined');
    };
    $(document).on('click', function(e){
        if(e.target.type == 'submit'){
            showLoader();
        }
    });
    $(document).on('click', 'a', function(e) {
        if ($(this).attr('data-rel') != 'back' && typeof($(this).attr('href')) != 'undefined' && $(this).attr('href') != '' && 
            $(this).closest('.ui-datepicker-calendar').length == 0) 
            {
            showLoader($(this));
            showLoader($(e.target))
        } else {
            hideLoader();
        }
    });
    $('#dvLoading').fadeOut(1000);
    $.ucWords = function(str) {
        // split string on spaces
        var arrStr = str.split(" ");

        var strOut = "";

        for (var i = 0, length = arrStr.length; i < length; i++) {
            // split string
            var firstChar = arrStr[i].substring(0, 1);
            var remainChar = arrStr[i].substring(1);

            // convert case
            firstChar = firstChar.toUpperCase();
            remainChar = remainChar.toLowerCase();

            strOut += firstChar + remainChar + ' ';
        }

        // return string, but drop the last space
        return strOut.substring(0, strOut.length - 1);
    }
    $.ccWords = function(str) {
        log('ccWords');

        // split string on spaces
        var arrStr = str.split(" ");
        var strOut = [arrStr[0].toLowerCase()];
        for (var i = 1, length = arrStr.length; i < length; i++) {
            strOut.push(arrStr[i].substring(0, 1).toUpperCase() + arrStr[i].substring(1).toLowerCase());
        }
        // return string, but drop the last space
        return strOut.join('');
    }
    $.isEmpty = function(str) {
        log('isEmpty');

        if ($.isArray(str) && str.length == 0) {
            return true;
        } else if ($.isPlainObject(str) && $.isEmptyObject(str)) {
            return true;
        } else if ($.trim(str) == '')
            return true;
        return false;
    };

    $.mergeAll = function(arguments) {
        log('mergeAll');

        var data = {
            'array': [],
            'object': {}
        };
        var length = arguments.length;
        for (var i = 0; i < length; i++) {
            if ($.isPlainObject(arguments[i])) {
                data['object'] = $.extend(true, data['object'], arguments[i]);
            } else {
                data['array'] = $.merge(data['array'], arguments[i]);
            }
        }
        var objectEmpty = $.isEmpty(data['object']);
        var arrayEmpty = $.isEmpty(data['array']);
        if (!objectEmpty && !arrayEmpty) {
            data['object'][0] = data['array'];
            return data['object'];
        } else if (!objectEmpty) {
            return data['object'];
        } else if (!arrayEmpty) {
            return data['array'];
        }
        return {};
    }
    $.projectConfiguration = {};
    $.getConfig = function(key, value) {
        value = ($.isset(value) ? value : "");
        keys = key.split(".");
        return $.getValue(keys, value, $.projectConfiguration);
    }

    $.setConfig = function(key, value) {
        if (!$.isset($.projectConfiguration))
            $.projectConfiguration = {};
        $.projectConfiguration[key] = value;
    }
    $.getValue = function(path, value, data) {
        var value = value || "";
        var requiredValue = data;
        $.each(path, function(k, v) {
            if (!$.isset(requiredValue[v])) {
                requiredValue = value;
                return false;
            } else {
                requiredValue = requiredValue[v];
            }
        });
        return requiredValue;
    }

    $(document).on({
        ajaxStart: function() {
            showLoader();
        //$.mobile.loading('show');
        },
        ajaxStop: function() {
            hideLoader();
        //$.mobile.loading('hide');
        }
    });

    $(document).on('click', '.fc-event', function(event) {
        document.location.href = $(this).attr('href');
        event.preventDefault();
        event.stopImmediatePropagation()
        event.stopPropagation();
        return false;
    })
    /*
     * Initialize default ajax loader.
     * @author Tushar Takkar
     */
    $(document).ajaxError(function(e, xhr, settings, exception) {
        var response = JSON.parse(xhr.responseText);
        if ($.isset(response.errors))
            showError(response.errors);
        hideLoader();
    });


    $('.input-trigger-search-basic').live('keypress', function(event) {
        if (event.which == 13) {
            var ul = $(this).closest('[data-role="page"]').find('.listview:first');
            var link = ul.find('.active-paginate-link:first');
            if (link.length == 0) {
                ul.children(':last').append('<a class="active-paginate-link paginate-link"  url="' + ul.attr('active_paginate_link') + '" href="' + ul.attr('active_paginate_link') + '">Reload</a>');
            }
            link = ul.find('.active-paginate-link:first');
            link.trigger('click');
            event.preventDefault();
            event.stopImmediatePropagation()
            event.stopPropagation();
            return false;
        }
    });
    /*
     $('.form-trigger-search-basic').live('submit',function(event){
     alert(1);
     $(this).closest('div').find('ul:first').find('.active-paginate-link:first').trigger('click');
     alert(2);
     event.preventDefault();
     event.stopImmediatePropagation()
     event.stopPropagation();
     return false;
     
     });
     */

    /*
     * implement bulk select in listview.
     *
     * @author Tushar Takkar
     */
    $(".lca").live('click', function() {
        var index = $(this).closest('td').index();
        var checkboxes = $(this).closest('table').find('.lco');
        if ($(this).is(':checked')) {
            checkboxes.attr('checked', 'checked');
        } else {
            checkboxes.removeAttr('checked');
        }
    });

    $.uu = function() {
        var c = "89ab";
        var u = [];
        for (var i = 0; i < 36; i++) {
            u[i] = (Math.random() * 16 | 0).toString(16);
        }
        u[8] = u[13] = u[18] = u[23] = "-";
        u[14] = "4";
        u[19] = c.charAt((Math.random() * 4 | 0));
        return u.join("");
    };

    $.isEmpty = function(str) {
        if ($.trim(str) == '')
            return true;

        return false;
    };

    $.jsContainer = function(html, params, pageParams) {
        var uuid = $.uu();
        var params = params || {};

        var pageParams = pageParams || {};

        var defaults = {
            autoOpen: false,
            modal: true,
            width: 'auto',
            dialogClass: 'no-close',
            buttons: {}
        };
        var setting = $.extend(false, defaults, params);

        var transition = ($.isset(pageParams['icon']) && pageParams['icon'] == 'arrow-d' ? "slidedown" : "slide");
        if (transition == 'slidedown') {
            $("body").append('<div data-role="page"  id="' + uuid + '" class="js-container page-slidedown"><div data-role="header" data-theme="b" ><a href="#" data-rel="back" data-icon="arrow-u" class="ui-btn-right"  >Up</a><h1>' + ($.isset(params['title']) ? params['title'] : '') + '</h1></div><div data-role="content" class="content"></div></div>');

        } else {
            $("body").append('<div data-role="page"  id="' + uuid + '" class="js-container page-slide"><div  data-role="header" data-theme="b" ><a href="#" data-rel="back" data-direction="reverse" data-icon="arrow-l" >Back</a><h1>' + ($.isset(params['title']) ? params['title'] : '') + '</h1></div><div data-role="content" class="content"></div></div>');
        }

        $("#" + uuid).find(".content").html(html);
        $.mobile.changePage("#" + uuid, {
            transition: transition,
            changeHash: true,
            reverse: false
        });

        return uuid;
    };
    $.confirmationBox = function(object) {
        $('#dialog').remove();
        var html = '<div data-role="dialog" id="dialog">';
        html += '<div data-role="header" data-theme="d">';
        html += '<h1></h1>';
        html += '</div>';
        html += '<div data-role="content" data-theme="c">';
        html += '<h1 class="confirmation_message_text"></h1>';
        html += '<a data-rel="back" data-role="button" id="confirmation_yes" data-theme="b" href="#">Yes</a>';
        html += '<a data-rel="back" data-role="button" data-theme="c" href="#">No</a>';
        html += '</div>';
        html += '</div>';
        $("body").append(html);
        var dialog = $('#dialog');

        var confirmationMessage = $(object).attr('confirmation_message');
        if ($.isEmpty(confirmationMessage)) {
            confirmationMessage = 'Do you want continue';
        }
        dialog.dialog()
        .find('.confirmation_message_text').html(confirmationMessage).end()
        .find('#confirmation_yes').attr('url', object.attr('href'));
        $('#confirmation_yes').click(function(event) {
            //$('.ui-dialog').dialog('close');
            document.location.href = $(this).attr('url');
            event.stopPropagation();
            return false;
        });
        $.mobile.changePage(dialog, {
            transition: "pop",
            role: "dialog",
            reverse: false
        });

    }

    $('.require_confirmation').click(function(event) {
        $.confirmationBox($(this));
        event.stopPropagation();
        return false;
    });

    $.mobile.dialog.prototype._close = $.mobile.dialog.prototype.close;
    $.mobile.dialog.prototype.close = function() {
        var args = Array.prototype.slice.call(arguments, 0);
    //console.log($(args).html());
    };

    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    $.splitHtmlScript = function(data) {
        var html = "";
        var script = "";
        var urls = [];
        var html = data.replace(/<script\s*[^>]*>([\S\s]*?)<\/script>/ig, "").replace(/<link\s*[^>]*>/ig, "");   //data.split('<script type="text/javascript">')[0];
        var match = data.match(/<script\s*[^>]*>([\S\s]*?)<\/script>/ig);
        if (match != null) {
            $.each(match, function(k, v) {
                if (v.indexOf("src=") !== -1) {
                    var src = $(v).attr("src");
                    if (src != "")
                        ;
                    urls.push(src);
                }
            });
        }
        script = (match != null ? match.join("").replace(/<script\s*[^>]*>/ig, "").replace(/<\/script>/ig, "") : "");
        var match = data.match(/<link\s*[^>]*>/ig);
        if (match != null) {
            $.each(match, function(k, v) {
                if (v.indexOf("stylesheet") !== -1) {
                    $("head").append(v);
                }
            });
        }

        return {
            "html": html,
            "script": script,
            urls: urls
        };
    }
    $.loadFiles = function(params) {
        var defaults = {
            oncomplete: {},
            params: {}
        };
        this.settings = $.extend(true, defaults, params);
        this.filesToLoad = this.settings.files.length;
        this.filesLoaded = 0;
        if (this.filesLoaded != this.filesToLoad) {
            (function(obj) {
                $.each(obj.settings.files, function(k, url) {
                    $.ajax({
                        url: url,
                        dataType: 'script',
                        success: function() {
                            obj.filesLoaded++;
                            if (obj.filesToLoad == obj.filesLoaded) {
                                if (typeof obj.settings.oncomplete == "function") {
                                    obj.settings.oncomplete.call(obj, obj.settings.params);
                                }
                            }
                        }
                    });
                });
            })(this);
        }
        else {
            if (typeof this.settings.oncomplete == "function") {
                this.settings.oncomplete.call(this, this.settings.params);
            }
        }
    }




    $.fn.attrs = function(events) {
        var events = events || false;
        var attributes = {};
        var attrs = $(this).get(0).attributes;
        $.each(attrs, function(k, v) {
            if (events === true)
                attributes[v.nodeName] = v.nodeValue;
            else {
                if (v.nodeName.indexOf('on') == -1)
                    attributes[v.nodeName] = v.nodeValue;
            }
        });
        return attributes;
    }


    $(document).on('click', '.select', function(event) {
        var href = $(this).attr('href');
        if (!$.isset(href)) {
            href = $(this).attr('url');
        }
        if (!$.isset(href))
            return false;
        if ($.isEmpty(href) || href == "#") {
            href = $(this).attr('url');
        }
        href = href.split('?');
        var base = href[0] || '';
        var get = href[1] || '';
        var length = 0;
        base = base.split('/');
        var params = {};
        var index = '';
        var p1 = '';
        var p2 = '';
        for (var i = 0, length = base.length; i < length; i++) {
            index = base[i].indexOf(':');
            if (index != -1) {
                p1 = base[i].substring(0, index);
                p2 = base[i].substring(index + 1);
                if (!$.isEmpty(p1) && !$.isEmpty(p2))
                    params[p1] = p2;
            }
        }
        if (!$.isEmpty(get))
            get = get.split('&');
        var getParams = {};
        var pair = [];
        for (var i = 0, length = get.length; i < length; i++) {
            pair = get[i].split('=');
            if ($.isset(pair[0]) && $.isset(pair[1]) && !$.isEmpty(pair[0]) && !$.isEmpty(pair[1]))
                getParams[pair[0]] = pair[1];
        }


        try {
            if ($.isset(params['id']) && $.isset(getParams['trigger'])) {
                var td = $('#' + getParams['trigger']).closest('.field_collection');
                if (td.length == 0) {
                    td = $('#' + getParams['trigger']).closest('div');
                }

                var popupSelect = td.find('.popup-select');
                var popupHidden = td.find('.popup-hidden:first');
                var popupAutocomplete = td.find('.popup-autocomplete:first');

                var label = '';
                if ($.isset(getParams['display_field'])) {
                    label = $(this).find("[column_name='" + getParams['display_field'] + "']").text();
                }
                if ($('#' + getParams['trigger']).hasClass('tokeninput-popup-add')) {
                    var list = [];
                    td.find('.token-input-list').find('.key').each(function() {
                        if ($(this).closest('li').find('[name*="[deleted]"]').val() != 1) {
                            list.push($(this).val());
                        }
                    });
                    if ($.inArray(params['id'], list) != -1) {
                        $.jsContainer("<p>" + label + " is already selected</p>");
                    } else {
                        td.find('.tokeninput-popup-autocomplete').tokenInput("add", {
                            'key': params['id'],
                            'name': label,
                            'model': td.find('.tokeninput-popup-select').val()
                        }).trigger('change');
                    }

                } else {
                    if ($.isEmpty(label)) {
                        if (!$.isEmpty(href)) {
                            var q = {};
                            q["paginate_as"] = "lazy";
                            q['limit'] = 1;
                            q['fields'] = ['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}', '{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'];
                            var where = {};
                            where['{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'] = params['id'];
                            q['where'] = where;

                            $.getJSON(href + '.json', {
                                'q': encodeURIComponent(JSON.stringify(q))
                            }, function(paginate) {
                                if (typeof (paginate['paginate']) != 'undefined') {
                                    paginate = paginate['paginate'];
                                }
                                var primaryKey = paginate['primary_key'];
                                var displayField = paginate['display_field'];
                                var v = paginate.data.pop();
                                if (primaryKey == displayField && typeof (v) == 'undefined') {
                                    v = {};
                                    v[primaryKey] = v[displayField] = params['id'];
                                }
                                if (typeof (v) != 'undefined') {
                                    if (popupHidden.attr('multiselect') == 1) {
                                        var terms = popupAutocomplete.val();
                                        terms = terms.split(/,\s*/);
                                        terms.pop();
                                        terms.push(v[displayField]);
                                        terms.push("");
                                        popupAutocomplete.val(terms.join(", "));
                                        popupHidden.valJSON(v[primaryKey], v[displayField]).triggerHandler('change');
                                        return false;
                                    } else {
                                        popupAutocomplete.val($.trim(v[displayField]));
                                        popupHidden.val(v[primaryKey]).attr('for_text', $.trim(v[displayField])).triggerHandler('change');
                                        return false;
                                    }
                                }
                            });
                        }
                    } else {
                        v = {};
                        v['primaryKey'] = params['id'];
                        v['displayField'] = label;
                        if (popupHidden.attr('multiselect') == 1) {
                            var terms = popupAutocomplete.val();
                            terms = terms.split(/,\s*/);
                            terms.pop();
                            terms.push(v['displayField']);
                            terms.push("");
                            popupAutocomplete.val(terms.join(", "));
                            popupHidden.valJSON(v['primaryKey'], v['displayField']).triggerHandler('change');
                        //return false;
                        } else {
                            popupAutocomplete.val($.trim(v['displayField']));
                            popupHidden.val(v['primaryKey']).attr('for_text', $.trim(v['displayField'])).triggerHandler('change');
                        //return false;
                        }

                    }

                }


            }

        } catch (e) {

        }



        $.mobile.activePage.find('[data-rel="back"]').trigger('click');

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });





    /*
     * Intercept paginate-link click event
     * Used in case of categorized/tree listview sublevels pagination.
     *
     * @author Tushar Takkar
     */
    $('.paginate-link').live('click', function(event) {
        if ($(this).hasClass('ui-state-disabled'))
            return false;
        //$.mobile.showPageLoadingMsg();
        var paginateLink = $(this).closest('li').find('.paginate-link').addClass('ui-state-disabled');
        var href = $(this).attr('href');
        var url = $(this).attr('url');
        if (url != '') {
            href = url;
        }
        var table = $(this).closest('ul');
        var search_basic = table.closest('[data-role=page]').find('[name="search_basic"]').val();
        if ($.isset(search_basic) && search_basic != '')
            href += (href.indexOf('?') == -1 ? '?' : '') + '&search_basic=' + search_basic;

        $.get(href, {}, function(data) {
            var data = $(data);
            $.each(data.attrs(), function(k, v) {
                if (k != 'id' && k != 'class') {
                    table.attr(k, v);
                }
            });
            table.html(data.html()).listview("refresh").trigger('create');
            //table.trigger('create');//.trigger('create').listview("refresh");

            initChart(table);
            paginateLink.removeClass('ui-state-disabled');
            $.mobile.hidePageLoadingMsg();
        });
        event.stopPropagation();
        return false;

    });

    $('.trigger-search-basic').live('click', function(event) {
        $(this).closest('div').find('.listview:first').find('.active-paginate-link:first').trigger('click');
        event.stopPropagation();
        return false;
    });

    /**
     * To make the jQuery Datepicker calendar disappear on load of form 
     * and appear on field select 
     * and then again disappear on seelcting date
     * @author Shubham Singh<ssingh@primarymodules.com>
     * @link https://github.com/primod/maax/issues/1018
     * @since 2014-02-01
     */
    $(".hasDatepicker").hide();
    $('input').filter('.ui-datepicker-mobile').prop("readonly", true);
    $('.ui-datepicker-mobile').on('click', function(event) {
        $(this).closest('li').find(".hasDatepicker")
        .find('.ui-icon-arrow-r').trigger('click').end()
        .find('.ui-icon-arrow-l').trigger('click').end().show();
        event.preventDefault();
        event.stopPropagation();
        return false;
    });

    $('li.cell-label').on('click', function(event) {
        var target = $(event.target);
        if (!target.hasClass('ui-icon-arrow-r') && !target.hasClass('ui-icon-arrow-l')) {
            $(this).find(".hasDatepicker").hide();
        }
    });

    $(document).on('click', '.tokeninput-popup-add', function(event) {
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        var td = $(this).closest('.field_collection');
        if (td.length == 0) {
            td = $(this).closest('div');
        }

        var popupSelect = td.find('.popup-select');
        var display_field = '';
        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.tokeninput-popup-autocomplete');
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = decodeURIComponent(option.attr('q'));
            display_field = option.attr('display_field');
        } else {
            var popupAutocomplete = td.find('.tokeninput-popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = decodeURIComponent(popupAutocomplete.attr('q'));
            display_field = popupAutocomplete.attr('display_field');
        }
        if (typeof (href) == 'undefined') {
            href = '';
        }

        if (!$.isset(q) || $.trim(q) == '' || q == 'undefined')
            q = '{}';


        q = JSON.parse(q);
        if (!$.isPlainObject(q))
            q = {};


        q["paginate_as"] = "lazy";

        q['actions'] = ['select'];
        if (!$.isset(q['where']))
            q['where'] = [];

        q['merge_paginate'] = 1;
        q['autocomplete'] = 1;
        $(popupAutocomplete).data('q', q);
        $(popupAutocomplete).triggerHandler('beforeSearch');
        q = $(popupAutocomplete).data('q');

        var dataIcon = $(this).data('icon');

        if (q !== false) {
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';
            $.get(href, {
                'q': encodeURIComponent(JSON.stringify(q)),
                'trigger': uuid
            }, function(data) {
                var params = {};
                data = $(data);
                var ob = false;
                data.each(function(k, v) {
                    if (ob === false && $(v).is('ul')) {
                        ob = $(v);
                    }
                });
                if (ob !== false && ob.is('[header_title]')) {
                    if (ob.attr('header_title') != '') {
                        params['title'] = ob.attr('header_title');
                    }
                }
                if (ob !== false && ob.is('[page_title]')) {
                    if (ob.attr('page_title') != '') {
                        params['title'] = ob.attr('page_title');
                    }
                }
                var pageParams = {};
                pageParams['icon'] = dataIcon;
                var uuid = $.jsContainer(data, params, pageParams);
                initChart($('#' + uuid));
            });
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    });

    $('.popup-add').live('click', function(event) {
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        var td = $(this).closest('.field_collection');
        if (td.length == 0) {
            td = $(this).closest('div');
        }

        var popupSelect = td.find('.popup-select');
        var display_field = '';
        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.popup-autocomplete');
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = decodeURIComponent(option.attr('q'));
            display_field = option.attr('display_field');
        } else {
            var popupAutocomplete = td.find('.popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = decodeURIComponent(popupAutocomplete.attr('q'));
            display_field = popupAutocomplete.attr('display_field');
        }
        if (typeof (href) == 'undefined') {
            href = '';
        }

        if (!$.isset(q) || $.trim(q) == '' || q == 'undefined')
            q = '{}';


        q = JSON.parse(q);
        if (!$.isPlainObject(q))
            q = {};


        q["paginate_as"] = "lazy";

        q['actions'] = ['select'];
        if (!$.isset(q['where']))
            q['where'] = [];

        q['merge_paginate'] = 1;
        q['autocomplete'] = 1;
        $(popupAutocomplete).data('q', q);
        $(popupAutocomplete).triggerHandler('beforeSearch');
        q = $(popupAutocomplete).data('q');

        var dataIcon = $(this).data('icon');

        if (q !== false) {
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';
            $.get(href, {
                'q': encodeURIComponent(JSON.stringify(q)),
                'trigger': uuid
            }, function(data) {
                var params = {};
                data = $(data);
                var ob = false;
                data.each(function(k, v) {
                    if (ob === false && $(v).is('ul')) {
                        ob = $(v);
                    }
                });
                if (ob !== false && ob.is('[header_title]')) {
                    if (ob.attr('header_title') != '') {
                        params['title'] = ob.attr('header_title');
                    }
                }
                if (ob !== false && ob.is('[page_title]')) {
                    if (ob.attr('page_title') != '') {
                        params['title'] = ob.attr('page_title');
                    }
                }
                var pageParams = {};
                pageParams['icon'] = dataIcon;
                var uuid = $.jsContainer(data, params, pageParams);
                initChart($('#' + uuid));
            });
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    });


    $(document).on('click', '.popup-clear', function(event) {
        var td = $(this).parents('li:first');
        if (td.length == 0) {
            td = $(this).parents('div:first');
        }
        td.find('.popup-autocomplete').val('');
        td.find('.popup-hidden').val('').triggerHandler('change');
        //$.populateValue(td.find('.popup-autocomplete').val('').end().find('.popup-hidden'), false);
        event.stopPropagation();
        return false;
    });

    $('.popup-select').live('change', function() {
        var td = $(this).closest('li');
        if (td.length == 0) {
            td = $(this).closest('div');
        }
        td.find('.popup-autocomplete').val('');
        td.find('.popup-hidden').val('').triggerHandler('change');
    });

    $('.popup-cancel').live('click', function(event) {
        $.mobile.changePage($('[data-role="page"]:first'));
        event.stopPropagation();
        return false;
    });


    $(document).on('click', '.grid-row-delete', function(event) {
        $(this).closest('.last-data-row').trigger('grid_row_delete');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('grid_row_delete', '.last-data-row', function(event) {
        var grid = $(this).closest('.grid');
        var min = grid.attr('min');
        if (!isNaN(min)) {
            if ((gridRows(grid) <= min)) {
                $.jsContainer('<span>Minimum number of allowed rows are ' + min + '</span>');
                return;
            }
        }
        var tr = $(this).closest('ul');
        var primary = tr.find(".primary:first").val();
        if (!$.isset(primary) || primary == '') {
            tr.removeClass('last-data-row').find(':input').remove().end().hide();
        } else {
            tr.removeClass('last-data-row').hide().find(".deleted:first").val(1).end();
        }
        gridSequence(grid);
        grid.trigger('row_delete');
        if (grid.attr('trigger_change') != 0) {
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.grid-row-add', function(event) {
        log('click -> .grid-row-add');
        $(this).closest('.grid').trigger('grid_row_add');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('grid_row_add', '.grid', function(event) {
        var grid = $(this);
        var gridId = grid.attr('id');
        var rowCounter = $('#row_counter_' + gridId);
        var max = grid.attr('max');
        if (!isNaN(max)) {
            if (!(gridRows(grid) < max)) {
                $.jsContainer('<span>Maximum number of allowed rows are ' + max + '</span>');
                return;
            }
        }
        var count = rowCounter.val();
        if (count == null) {
            count = -1;
        }
        count++;
        rowCounter.val(count);
        var row =
        grid
        .find('.grid-template-row')
        .clone(true).removeClass('grid-template-row')
        .addClass('last-data-row')
        .css('display', 'block');

        row.find(':input,label')
        .each(function() {
            var name = $(this).attr('name');
            var id = $(this).attr('id');
            var for1 = $(this).attr('for');
            if (name != null && name != '') {
                $(this).attr('name', name.replace('[_X_]', '[' + count + ']'))
                .removeAttr('disabled')
                .removeAttr('data-role')
                .filter('[is_disabled="1"]')
                .attr('disabled', 'disabled');
                if ($(this).hasClass('none')) {
                    $(this).attr('data-role', 'none');
                }
            }
            if (id != null && id != '') {
                $(this).attr('id', id.replace('_X_', '' + count + ''));
            }
            if (for1 != null && for1 != '') {
                for1=for1.replace('_X_', '' + count + '');
                $(this).attr('for', for1);
            }
            $(this).attr('grid_row_number', count);
            $(this).removeClass('template-element');
        });


        var after = grid.find('.last-data-row:first');
        if (after.length == 0) {
            after = grid.find('.grid-template-row:last');
            row.insertAfter(after);
        } else {
            row.insertBefore(after);
        }
        $.mobile.checkboxradio.prototype.enhanceWithin( row.get(0), true );
        
        grid.find('.last-data-row:first').trigger('create');
        $.initFields(grid.find('.last-data-row:first'));
        gridSequence(grid);
        grid.trigger('row_add');
        if (grid.attr('trigger_change') != 0) {
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
        
    });

    function gridSequence(grid) {
        grid.find('.last-data-row').each(function(i, k) {
            $.each($(this).find('.cell-seq-grid:first').find('.sequence'), function(k, v) {
                if ($(this).is('input')) {
                    $(this).val((i + 1));
                } else {
                    $(this).text((i + 1));
                }
            });
        });
    }


    function gridRows(grid) {
        var count = 0;
        grid.find('.last-data-row').each(function(i, k) {
            if ($(this).find(".deleted:first").val() != 1) {
                count++;
            }
        });
        return count;
    }



    $('[on_change_reload_form=1]').live('change', function() {
        var button = $(this)
        .closest('form')
        .find('input[type="submit"]:first')
        .attr('name', "data[action][reload]").val($(this).attr('name'));
        $(this).closest('form').validate().currentForm = '';
        if (button.hasClass('ajax-popup-form')) {
            button.triggerHandler('click');
        } else {
            button.trigger('click');
        }
    });

    $('#message-panel').click(function() {
        $(this).closest('.ui-bar').remove();
    });

    initChart($(document));
    $('#controller_action_menu').bind("change", function(event, ui) {
        var href = $(this).val();
        if (href != '') {
            window.location.href = href;
        }
        event.preventDefault();
        event.stopImmediatePropagation()
        event.stopPropagation();
        return false;
    });

    $('#data-current_listview').change(function(event) {
        //$.mobile.showPageLoadingMsg();
        var href = $.config['base'] + $.config['module'] + '/' + $.config['controller'] + '/index?current_listview=' + $(this).val();
        var table = $('[data-role="page"]:first').find('ul:first');
        $.get(href, {}, function(data) {
            var data = $(data);
            $.each(data.attrs(), function(k, v) {
                if (k != 'id' && k != 'class') {
                    table.attr(k, v);
                }
            });
            table.html(data.html()).listview("refresh").trigger('create');
            initChart(table);
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage($('[data-role="page"]:first'), {
                transition: "slide",
                reverse: true,
                changeHash: true
            });
        });
        event.stopPropagation();
        return false;



    //window.location.href=$.config['base']+$.config['module']+'/'+$.config['controller']+'/index?current_listview='+$(this).val();
    //event.preventDefault();
    //event.stopImmediatePropagation()
    //event.stopPropagation();
    //return false;

    });

    $(document).on('reload', '.listview', function(event) {
        var ul = $(this);
        var link = ul.find('.active-paginate-link:first');
        if (link.length == 0) {
            ul.find('li:last').append('<a class="active-paginate-link paginate-link" style="display:none;" url="' + ul.attr('active_paginate_link') + '" href="' + ul.attr('active_paginate_link') + '">Reload</a>');
        }
        link = ul.find('.active-paginate-link:first');
        link.trigger('click');
        event.preventDefault();
        event.stopImmediatePropagation()
        event.stopPropagation();
        return false;

    });


    $(window).bind('orientationchange', function(event) {
        $.mobile.activePage.find('.listview').each(function() {
            if ($(this).attr('orientation') != event.orientation && $(this).find('.chart').length > 0) {
                var obj = this;
                $(this).attr('orientation', event.orientation);
                setTimeout(function() {
                    initChart(obj);
                }, 500);
            }

        });

    });

    $('form .ui-listview:first').css('margin-top', '0px');
    /*
     $(':input[collection-set]').before('<label class="placeholder-label ui-input-text"></label>');
     
     $('.popup-autocomplete').each(function(){
     if(!$(this).prev().is('select')){
     $(this).before('<label class="placeholder-label ui-input-text"></label>');
     }
     
     });
     */
    function handalDrilldown(object) {
        var options = object.closest('.listview').attrs();
        // fetch q
        // modify q and append where ={parent:current prmary key};
        var query = options['query'];
        query = parseJSON(decodeURIComponent(options['query']));
        var childListview = query['child_listview'] | false;
        var query = {
            'reset': 1,
            'active_level': 1
        };
        var where = {};
        var displayField = '';
        if (options['render_as'] == 'categorized') {
            var matchFound = false;
            displayField = [];
            $(object).find('.category').each(function(k, v) {
                if (matchFound === false) {
                    where[$(this).attr('column_name')] = $(this).text();
                    query['active_level'] = k + 1;
                    displayField.push($(this).text());
                }
                if (!$(this).hasClass('category-inactive')) {
                    matchFound = true;
                }
            });
        } else {
            if (typeof (options['display_field']) != 'undefined') {
                displayField = $(object)
                .closest('.listview-link')
                .find('[column_name="' + options['display_field'] + '"]').text().split('.');

            }
            where[options['foreign_column_name']] = $(object).closest('.listview-link').data('id');
        }
        if ($.isset(options['model']) && displayField.length > 0) {
            displayField.unshift(options['model']);
        }
        displayField = displayField.join('.');
        query['where'] = where;
        var href = options['href'];
        href = href.replace('page=', 'old_page=');
        href = href.split('q:')[0];
        href = href.split('q=')[0];
        href = href.replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
        href += href.indexOf('?') != -1 ? '' : '?';
        href += "&drilldown=1";
        document.location.href = href + "&q=" + encodeURIComponent(JSON.stringify(query));
    /*
         $.get(href,{
         "q":encodeURIComponent(JSON.stringify(query))
         },function(data){
         data=$(data);
         var params={};
         if(displayField != ''){
         params['title']=displayField.replace(/\./ig,' / ');
         }else if(data.is('[header_title]')){
         params['title']=data.attr('header_title');
         }
         var width=$('body').width();
         var popup_width=CONFIG.popup_width_percent || 80;
         width=(width/100)*popup_width;
         params["width"]=width+"px";
         var uuid=$.jsContainer(data,params);
         });
         */
    }
    $(document).on('click', '.drilldown', function(event) {
        handalDrilldown($(this));
        event.stopPropagation();
        event.preventDefault();
        return false;

    });

    $(document).on('click', '.history_index', function(event) {
        var index = parseInt($(this).data('history_index'));
        window.history.go(index);
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    // invoke a global handler for initialising new added dom elements with plugin.
    //$(document).triggerHandler('document_update', [$(document)]);

    $.fn.disable = function(partial) {
        var partial = (typeof (partial) != 'undefined' ? partial : false);
        return this.each(function() {
            if (partial == true) {
                $(this)
                .addClass('ui-state-disabled')
                .filter('[button]')
                .addClass('ui-button-disabled');
            } else {
                $(this)
                .attr('disabled', 'disabled')
                .addClass('ui-state-disabled')
                .filter('[button]')
                .addClass('ui-button-disabled')
                .button('disable');
            }
        });
    }

    $.fn.enable = function() {
        return this.each(function() {
            $(this).removeAttr('disabled')
            .removeClass('ui-state-disabled')
            .removeClass('ui-button-disabled')
            .button('enable');
        });
    }

    $('form').submit(function(event) {
        var form = $(this);
        // Validation on form submit
        var should_validate = true;
        if (should_validate === true) {
            if (!form.valid()) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        }
        setTimeout(function() {
            form.find('[type="submit"]').disable();
        }, 100);
        form.find('.grid-template-row').remove();
    });
    

    $.initFields = function(container, init) {
        log('initFields');
        
        $(document).triggerHandler('document_update', [container]);
        
        container.find("input.tagsinput").not('.template-element').not('[readonly]')
        .each(function() {
            //var element = $(this);
            //var prepopulate = JSON.parse($(this).attr('prepopulate'));
            var url=$(this).attr('autocomplete_url')+'.json';
            var properties={
            //   'autocomplete_url':url
            };
            $(this).tagsInput(properties);
        });
        
        $(container).find(".tokeninput-popup-autocomplete").not('.template-element').not('[readonly]')
        .each(function() {

            var element = $(this);
            var prepopulate = JSON.parse($(this).attr('prepopulate'));
            var counter = 0;
            var properties = {
                processPrePopulate: true,
                prePopulate: prepopulate,
                onAdd: function(hidden_input, token, item) {
                    element.trigger('change');
                    element.closest('form').trigger('change');
                },
                onDelete: function(hidden_input, token_data, token) {
                    element.trigger('change');
                    element.closest('form').trigger('change');
                },
                tokenFormatter: function(item) {
                    var grid_row_number = element.attr('grid_row_number');
                    var str = '';
                    var column = '';
                    var stdColumns = {
                        'model_column': 1, 
                        'key_column': 1, 
                        'label_column': 1, 
                        'deleted_column': 1, 
                        'id_column': 1
                    };

                    var list = [];
                    element.prev().find('.key').each(function() {
                        if ($(this).closest('li').find('[name*="[deleted]"]').val() != 1) {
                            list.push($(this).val());
                        }
                    });
                    if (typeof (item['key']) != 'undefined' && $.inArray(item['key'], list) != -1) {
                        $.jsContainer("<p>" + item['name'] + " is already selected</p>");
                        return false;
                    }
                    $.each(element.attrs(), function(k, v) {
                        if (k.indexOf('_column') != -1) {
                            if (typeof (stdColumns[k]) == 'undefined') {
                                column = k.replace('_column', '');
                                str += "<input type='hidden'  name='" + v.replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + ($.isset(item[column]) && item[column] != "" ? item[column] : "") + "' >"
                            }
                        }
                    });
                    return "<li class='li-token-item'>"
                    + "<input type='hidden' class='model' name='" + element.attr('model_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + ($.isset(item['model']) && item['model'] != "" ? item['model'] : "") + "' >"
                    + "<input type='hidden' class='key' name='" + element.attr('key_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['key'] + "' >"
                    + "<input type='hidden' class='name' name='" + element.attr('label_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['name'] + "' >"
                    + ($.isset(item['deleted']) && item['deleted'] != "" ? "<input class='deleted' type='hidden' name='" + element.attr('deleted_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['deleted'] + "' >" : "")
                    + ($.isset(item['id']) && item['id'] != "" ? "<input class='id' type='hidden' name='" + element.attr('id_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['id'] + "' >" : "")
                    + str
                    + "<p class='value'>" + item['name'] + "</p></li>";
                    counter++;

                },
                onResult: function(result) {
                    var rows = [];
                    if ($.isset(result) && $.isset(result.paginate) && $.isset(result.paginate.data) && $.isArray(result.paginate.data)) {
                        var popupSelect = element.closest('td').find('.tokeninput-popup-select');
                        $.each(result.paginate.data, function(k, v) {
                            rows.push({
                                'key': v[result.paginate.primary_key],
                                'name': v[result.paginate.display_field],
                                'model': popupSelect.val()
                            });
                        });
                    } else {
                        rows = result;
                    }
                    return rows;
                }
            };

            $(this).removeClass('.tokeninput').tokenInput(
                function(searchTerm) {
                    var href = '';
                    var q = '';
                    var td = $(element).parents(':first');
                    var term = [];
                    var termP = [];
                    for (var i = 0; i < termP.length; i++) {
                        term.push($.trim(termP[i].split('[')[0]));
                    }
                    term = term.join('/');
                    var popupSelect = td.find('.tokeninput-popup-select');
                    if (popupSelect.length > 0) {
                        var option = popupSelect.find("option:selected");
                        href = option.attr('href');
                        q = option.attr('q');
                    } else {
                        href = $(element).attr('href');
                        q = $(element).attr('q');
                    }
                    var inline_search = $(element).attr('inline_search');
                    if ($.isset(inline_search) && inline_search == 0) {
                        return false;
                    }
                    q = decodeURIComponent(q);
                    if (href != '') {
                        if ($.trim(q) == '' || !$.isset(q))
                            q = '{}';
                        q = parseJSON(q);
                        if (!$.isPlainObject(q))
                            q = {};
                        q["paginate_as"] = "lazy";
                        q['limit'] = 20;
                        q['fields'] = ['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}', '{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'];
                        if (!$.isset(q['where'])) {
                            q['where'] = [];
                        }
                        where = {};
                        if (searchTerm != '') {
                            where['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}' + ' LIKE '] = searchTerm;
                        }
                        q['fetch'] = 1;
                        q['autocomplete'] = 1;
                        q['where'] = $.mergeAll([q['where'], where]);
                        var concatTextValue = parseInt(element.attr('concat_text_value'));
                        $(element).data('q', q);
                        $(element).triggerHandler('beforeSearch');
                        q = $(element).data('q');
                        if (href.indexOf('?') !== -1) {
                            href = href.replace('?', '.json?');
                        } else {
                            href = href + '.json?';
                        }
                        href = href + '&q=' + encodeURIComponent(JSON.stringify(q));
                        return href;
                    }
                }, properties);

        });

    }
    $.initFields($('body'));
});


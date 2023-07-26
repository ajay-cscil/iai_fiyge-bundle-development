/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function getString(arr) {
    log('getString');
    if (typeof arr == 'string') {
        return arr;
    }
    else {
        var str = '';
        for (var i in arr) {
            str += ' ' + i + '="' + arr[i] + '"';
        }
        return str;
    }
    return '';
}
function log(message) {
    if (CONFIG.debug_js && typeof console != undefined) {
        console.log(message);
    }

}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */


function array_column(matrix, col){
       var column = [];
       if(Array.isArray(matrix)){
           for(var i=0; i<matrix.length; i++){
              column.push(matrix[i][col]);
           }
       }
       return column;
}

function html_entity_decode(string, quote_style) {
    //return string.replace('&lt;','<').replace('&gt;','>');
    string = string.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
    return string;
}

/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function showMessage(response, params) {
    log('showMessage');
    if (typeof (params) == 'undefined') {
        params = {};
    }
    if (!$.isset(response)) {
        return;
    } else if (typeof response != 'object') {
        params = $.extend({
            height: 300,
            width: 700,
            title: 'Could not process server response'
        }, params);
        response = "<div style='text-align:left;' class='ui-state-error-text'>" + response + "</div>";
        $.jsContainer(response, params);
        return;
    }



    var msg = "";
    var message = '';
    var addClass = '';
    var removeClass = '';
    if ($.isset(response.errors) && !$.isEmpty(response.errors)) {
        var msg = response.errors;
        addClass = 'ui-state-error';
        removeClass = 'ui-state-highlight';
        params['title'] = "Server response";
    } else if ($.isset(response.message) && !$.isEmpty(response.message)) {
        var msg = response.message;
        addClass = 'ui-state-highlight';
        removeClass = 'ui-state-error';
    }
    if ($.isArray(msg)) {
        var length = msg.length;
        for (var i = 0; i < length; i++) {
            message += msg[i] + '<br />';
        }
    } else {
        message += msg;
    }
    var text = "";
    if (!$.isArray(msg)) {
        text = $("<div>" + message + "</div>");
        text = text.text();
    } else if (typeof (msg[0]) != 'undefined') {
        text = $("<div>" + msg[0] + "</div>");
        text = text.text();
    }
    if (($.isArray(msg) && msg.length > 1) || text.length > 150) {
        params = $.extend({
            height: 300,
            width: 400
        }, params);
        $.jsContainer(message, params);
    } else {
        var titlebar = $('.ui-dialog:visible').find('.content');
        if (titlebar.length > 0) {
            var next = $(titlebar).find('.message-panel:first').remove();
            var top = $(titlebar).position();
            titlebar.prepend('<div class="message-panel" align="center" style="position:fixed;";><div class="' + addClass + '">' + message + '</div></div>');
            $(titlebar).find('.message-panel:first').show()
            .removeClass(removeClass)
            .addClass(addClass).delay(4000).hide('highlight', {}, 1000);
            var left = 30 + $(titlebar).width() / 2 - $(titlebar).find('.message-panel:first').width() / 2;
            $(titlebar).find('.message-panel:first').css({
                'top': '8px',
                'left': left + 'px'
            });
        } else {
            $("#message-panel").removeClass('ui-helper-hidden').removeClass(removeClass)

            .addClass(addClass).html(message).show().delay(60000).hide('highlight', {}, 1000);

        }
    }


//}

}
function parseJSON(string) {
    log('parseJSON');
    var json = '';
    try {
        json = JSON.parse(string);
    }
    catch (e) {

    }
    return json;
}
function extractJSON(string) {
    log('extractJSON');
    string = string.split('{"');
    string.shift();
    string = string.join('{"').split("}");
    string.pop()
    string.join("}");
    return string;
}
function initMessagePanel() {
    log('initMessagePanel');
    $("#message-panel:visible").show().delay(4000).hide('highlight', {}, 1000);
}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function hideMessage() {
    log('hideMessage');
    $("#message-panel").addClass('ui-helper-hidden').html('');
}
function addThemeRoller() {
    log('addThemeRoller');
    if (!/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        alert('Sorry, this tool only works in Firefox');
        return false;
    }
    ;
    if (window.jquitr) {
        jquitr.addThemeRoller();
    } else {
        jquitr = {};
        jquitr.s = document.createElement('script');
        jquitr.s.src = $.config['base'] + 'js/themeroller.js';
        document.getElementsByTagName('head')[0].appendChild(jquitr.s);
    }
}
function extractName(name) {
    log('extractName');
    name = name.replace(/[\[\]]/g, ':').split(':');
    if (name[(name.length - 1)] == '') {
        name = name.slice(0, -1);
    }
    return name;
}

function setClipboard(value) {
    console.log(value);
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
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
function autoResizeIframe(iframe) {
    var autoResizeIframeHeight=iframe.contentWindow.document.body.scrollHeight;
    autoResizeIframeHeight += 20;
    console.log({"autoResizeIframeHeight":autoResizeIframeHeight});
    if(jQuery(iframe).is(':visible')){
        if(autoResizeIframeHeight < 30){
            autoResizeIframeHeight=30;
        }
        jQuery(iframe).height(autoResizeIframeHeight);
        jQuery(iframe).attr('scrolling','no');
    }else{
        jQuery(iframe).attr('scrolling','yes');
    }
}

function getPath(obj) {
  var args = Array.prototype.slice.call(arguments, 1);
  if(args.length==1){
    args=args[0].split('.');
  }
  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return obj;
}
        
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '/module/pdf/pdf.worker.min.js';
var pdfDoc = null;
var scale = 1; //Set Scale for zooming PDF.
var resolution = 2; //Set Resolution to Adjust PDF clarity.

function LoadPdfFromUrl(pdfContainerID,url,fileName) {
    console.log('LoadPdfFromUrl',pdfContainerID,url,fileName);
    var fileExt=(fileName?fileName.split('.').pop():'').toLowerCase();
    if(fileExt =="pdf"){
        pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            var pdf_container = document.getElementById(pdfContainerID);
            pdf_container.classList.add("preview_pdf_container");
            if(pdf_container){
                pdf_container.innerHTML = "<div><b>"+fileName+"<b></div>";
                for (var i = 1; i <= pdfDoc.numPages; i++) {
                    RenderPage(pdf_container, i);
                }
            }
        });
    }else if(["doc","docx","xls","xlsx","xlsb","ppt"].includes(fileExt)){
        var pdf_container = document.getElementById(pdfContainerID);
        pdf_container.classList.add("preview_pdf_container");
        pdf_container.innerHTML = "<div><b>"+fileName+"<b></div>"+'<iframe src="https://docs.google.com/gview?url='+encodeURIComponent(url)+'&embedded=true" frameborder="0" style="overflow:hidden;height:90vh;width:100%" height="90vh" width="100%"></iframe>';
    }else{
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var pdf_container = document.getElementById(pdfContainerID);
        pdf_container.classList.add("preview_pdf_container");
        pdf_container.innerHTML = "<div><b>"+fileName+"<b></div>";
        pdf_container.appendChild(canvas);
        var myImg = new Image();
        myImg.onload = function() {
            ctx.canvas.width = myImg.width;
            ctx.canvas.height = myImg.height;
            ctx.drawImage(myImg, 0, 0,myImg.width,myImg.height);
        };
        myImg.src = url;
    }
}

function RenderPage(pdf_container, num) {
    pdfDoc.getPage(num).then(function (page) {
        var canvas = document.createElement('canvas');
        canvas.id = 'pdf-' + num;
        var ctx = canvas.getContext('2d');
        pdf_container.appendChild(canvas);

        var spacer = document.createElement("div");
        spacer.style.height = "20px";
        pdf_container.appendChild(spacer);

        var viewport = page.getViewport({ scale: scale });
        canvas.height = resolution * viewport.height;
        canvas.width = resolution * viewport.width;

        var renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            transform: [resolution, 0, 0, resolution, 0, 0]
        };
        page.render(renderContext);
    });
}


/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
jQuery('document').ready(function($) {
    /**
     * check if variable defined
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @param mixed variable
     * @return boolean true/false
     */
    $.isset = function(variable) {
        return (typeof variable != 'undefined' && variable != 'undefined');
    };
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.ucWords = function(str,firstCharOnly) {
        log('ucWords');

        // split string on spaces
        var arrStr = str.split(" ");

        var strOut = "";

        for (var i = 0, length = arrStr.length; i < length; i++) {
            // split string
            var firstChar = arrStr[i].substring(0, 1);
            var remainChar = arrStr[i].substring(1);

            // convert case
            firstChar = firstChar.toUpperCase();
            if(!(firstCharOnly && firstCharOnly===true)){
                remainChar = remainChar.toLowerCase();
            }
            
            strOut += firstChar + remainChar + ' ';
        }

        // return string, but drop the last space
        return strOut.substring(0, strOut.length - 1);
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
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
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */


    $.getConfig = function(key, value) {
        value = ($.isset(value) ? value : "");
        keys = key.split(".");
        return $.getValue(keys, value, $.projectConfiguration);
    }

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.getValue = function(path, value, data) {
        var value = value || "";
        var requiredValue = data;
        $.each(path, function(k, v) {
            if (!$.isset(requiredValue[v])) {
                return value;
            }
            else {
                requiredValue = requiredValue[v];
            }
        });
        return requiredValue;
    }


    /**
     * Check if input is empty
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

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
    $.fn.outer = function() {
        return $($('<div></div>').html(this.clone())).html();
    }
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

    $.string_repeat = function(string, multiplier) {
        for (var i = 0; i < multiplier; i++) {
            string += string;
        }
        return string;
    }

    /**
     * Initialize default ajax loader.
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $("body").append('<div id="ajax-loader" class="ui-state-highlight" style="display:none;z-index:100002">Loading...</div>');
    var bodyWidth = $("body").width();
    var ajaxLoaderWidth = $("#ajax-loader").width();
    var ajaxLoaderTop = 1;
    var ajaxLoaderLeft = (bodyWidth / 2) - (ajaxLoaderWidth / 2);
    var ajaxLoaderCounter = 0;
    $("#ajax-loader").css({
        "top": ajaxLoaderTop,
        "left": ajaxLoaderLeft,
        "position": "fixed"
    })
    .ajaxStart(function() {
        $.showLoader();
    })
    .ajaxStop(function() {
        $.hideLoader();
    });
    $.showLoader = function(stat) {
        if ($.isset(stat))
            ajaxLoaderCounter += stat;
        var obj = $("#ajax-loader");
        $(obj).html('Loading...').show();
        setTimeout(function() {
            if (obj.is(':visible')) {
                obj.html('Still Loading...');
            }
        }, 3000);
    }
    $.hideLoader = function(stat) {
        if ($.isset(stat))
            ajaxLoaderCounter -= stat;

        if (ajaxLoaderCounter <= 0) {
            $("#ajax-loader").hide();
        }
    }
    $(document).ajaxError(function(e, xhr, settings, exception) {
        log('ajaxError');
        var responseText = xhr.responseText;
        if (typeof (responseText) == "undefined") {
            showMessage('Your request could not be completed as server returned "503 Service Unavailable"', {
                'title': '503 Service Unavailable'
            });
        } else if (typeof responseText == 'string' && $.isEmpty(responseText)) {
        //showMessage('Your request could not be processed');
        } else {
            if (
                typeof responseText == 'string'
                && responseText.indexOf('{"errors"') == -1
                && responseText.indexOf('{"message"') == -1
                ) {
                var data = $(responseText);
                $.initAjaxForm({
                    'data': data,
                    'listview_table_id': false,
                    'twisty': false,
                    'href': $(data).attr('action')
                });
            } else {
                if (typeof responseText == 'string'
                    &&
                    (responseText.indexOf('{"errors"') != -1
                        ||
                        responseText.indexOf('{"message"') != -1
                        )
                    ) {
                    responseText = $.parseJSON(responseText);
                }
                showMessage(responseText);
            }
        }
    });

    $(document).on('click', '.action-list-trigger', function(event) {
        var id = $(this).attr('id');
        var menu = $("." + id).show().position({
            my: "right top",
            at: "right bottom",
            of: this
        });
        $(document).one("click", function() {
            menu.hide();
        });
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;

    });


    /**
     * implement bulk select in listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.lco', function() {
        log('click -> .lco');
        if ($(this).is(':checked')) {
            $.setActionMenu(this, 'active');
        } else if ($(this).closest('.listview').find('.lco:checked').length == 0) {
            $.setActionMenu(this, 'inactive');
        }
    //$.setActionMenu(this,'active');
    });
    $(document).on('click', ".lca", function() {
        log('click-> .lca');
        var index = $(this).closest('td').index();
        var listview = $(this).closest('.listview');
        var checkboxes = listview.find('.lco');

        $('#select_all_records-' + listview.attr("id")).remove();
        if ($(this).is(':checked')) {
            checkboxes.attr('checked', 'checked');
            $.setActionMenu(this, 'active', true);
            if (listview.find('.pagination-row a.paginate-link:not(.ui-state-disabled)').not('.active-paginate-link').length > 0) {
                listview.before('<div class="all-records-selection ui-state-default" id="select_all_records-' + listview.attr("id") + '"><input name="select_all_records" type="checkbox" value="1">' + (listview.attr("select_all_label").replace('%s', listview.find('.paginate_count').outer())) + '</div>');
                $('#select_all_records-' + listview.attr("id")).find('a.paginate_count').trigger('click');
            }
        } else {
            checkboxes.removeAttr('checked');
            $.setActionMenu(this, 'inactive', false);
        }
    });
    $.setActionMenu = function(obj, action) {
        log('setActionMenu');

        var searchView = $(obj).closest('.listview').attr('id');
        var actionBar = $('.action-bar[search_view="' + searchView + '"]');
        if (actionBar.length > 0) {
            if (action == 'active') {
                //console.log(action);
                actionBar.find('.sub-action')
                .show();//.enable();
            } else if (action == 'inactive') {
                //console.log(action);
                actionBar.find('.sub-action').not('.track-unchecked')
                .hide();//.disable();
            }
        }
    }
    /**
     * implement column search in listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('keypress', '.search_inline_column', function(event) {
        log('keypress,.search_inline_column');

        if (event.which == 13) {
            event.preventDefault();
            var col = $(this);
            var table = $(this).closest('.listview');
            var searchInline = [];
            var name = extractName(col.attr('name'));
            searchInline.push({
                'column': col.attr('name'),
                'value': col.val()
            });
            $.listviewSearch(table, {
                'search_inline': searchInline //,'reset':1
            });
            event.stopPropagation();
            return false;
        }
    });

    $(document).on('keypress', '#advance_search input', function(event) {
        log('keypress,#advance_search input');
        if (event.which == 13) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

    /*
     $(document).on('submit','.search_inline_form',function(event){
     var col=$(this).find('.search_inline_column');
     var table=$(this).closest('.listview');
     var searchInline=[];
     var name=extractName(col.attr('name'));
     searchInline.push({
     'column':col.attr('name'),
     'value':col.val()
     });
     $.listviewSearch(table, {
     'search_inline':searchInline,
     'reset':1
     });
     event.stopPropagation();
     return false;
     });
     */


    /**
     * Intercepts click event for finding result count incase of lazy pagination.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', "a.paginate_count", function(event) {
        log('click-> a.paginate_count');

        var paginateCountObj = this;
        $.get($(this).attr('href'), {}, function(data) {
            $(paginateCountObj).replaceWith('<span class="paginate_count">' + data + '</span>');
        });
        event.stopPropagation();
        return false;
    });



    /**
     * Intercept twisty-close click event
     * Used in case of categorized/tree listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.twisty-close,.twisty-close-last', function(event, href, tobeDeleted) {
        log('click -> .twisty-close,.twisty-close-last');
        if ($(this).hasClass('ui-state-disabled'))
            return false;

        var $this = this;
        var tobeDeleted = tobeDeleted;
        var table = $(this).addClass('ui-state-disabled').closest('table');
        var query = table.attr('query');
        var collapseCategoryColumns = table.attr('collapse_category_columns');
        if (typeof collapseCategoryColumns == 'undefined') {
            collapseCategoryColumns = 0;
        }
        if (typeof href == 'undefined') {
            var href = table.attr('href');
        }
        href = href.replace('page=', 'old_page=');
        var active_level = $(this).attr('active_level');
        active_level = parseInt(active_level) + 1;
        query = parseJSON(decodeURIComponent(query));
        query['active_level'] = active_level;
        var td = $(this).closest('td');
        var tr = td.closest('tr');
        var where = {};
        var treeNode = $(td).hasClass('tree-node');
        if (treeNode) {
            where[$(this).closest('table').attr('model')+'.'+$(this).closest('table').attr('foreign_column_name')] = $.trim($(this).closest('tr').attr('primary_key'));
        } else {
            var val = $.trim(td.text());
            if (td.is('[value]')) {
                val = td.attr('value');
            }

            if (val == '') {
                where[0] = {
                    'OR': [td.attr('column_name') + ' IS NULL', td.attr('column_name') + '=""']
                };
            } else {
                where[td.attr('column_name')] = val;
            }
        }


        if (collapseCategoryColumns == 1) {
            var tr_active_level = tr.attr('active_level');
            if (!$.isset(tr_active_level)) {
                tr_active_level = 0;
            }
            tr_active_level = parseInt(tr_active_level);
            var ptar = tr.prev();
            if (ptar.hasClass('record-row')) {
                var ctr_active_level = '';
                while (typeof ptar == 'object') {
                    ctr_active_level = ptar.attr('active_level');
                    ctr_active_level = parseInt(!$.isset(ctr_active_level) ? 0 : ctr_active_level);
                    if (ctr_active_level < tr_active_level) {
                        ptar.find('.category').each(function() {
                            var val = $.trim($(this).text());
                            if ($(this).is('[value]')) {
                                val = $(this).attr('value');
                            }
                            where[$(this).attr('column_name')] = $.trim(val);
                        });
                        tr_active_level = ctr_active_level;
                    }
                    if (ptar.hasClass('record-row') && !$.isset(ptar.attr('active_level'))) {
                        break;
                    }
                    ptar = ptar.prev();
                }
            }

        } else {
            td.prevAll('.category').each(function() {
                var val = $.trim($(this).text());
                if ($(this).is('[value]')) {
                    val = $(this).attr('value');
                }
                where[$(this).attr('column_name')] = $.trim(val);
            });

        }
        if (typeof query['where'] == 'undefined')
            query['where'] = {};
        if ($.isArray(query['where']))
            query['where'].push(where);
        else
            query['where'] = $.extend(query['where'], where);

        href = href.split('q:')[0];
        href = href.split('q=')[0];

        if (typeof query['search_basic'] != undefined) {
            delete(query['search_basic']);
        }
        if (typeof query['search_advance'] != undefined) {
            delete(query['search_advance']);
        }
        if (typeof query['search'] != undefined) {
            delete(query['search']);
        }
        href = href.replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
        //href.indexOf('current_listview=') != -1 &&
        if ($.isset(query['fields'])) {
            delete(query['fields']);
        }
        $.get(href, {
            "q": encodeURIComponent(JSON.stringify(query))
        }, function(data) {
            if (typeof tobeDeleted != 'undefined' && tobeDeleted.length > 0) {
                for (var i = 0, max = tobeDeleted.length; i < max; i++) {
                    tobeDeleted[i].remove();
                }
            }
            var data = $(data);
            var padding = '';
            var treeMarkup = '';
            if (treeNode || collapseCategoryColumns == 1) {
                for (var k = 0; k < active_level; k++) {
                    padding += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                    treeMarkup += '<div class="twisty-i" ></div>';
                }
            }

            if (treeNode || collapseCategoryColumns == 1) {
                var paginationRow = data.find('.pagination-row');
                var tds = data.find('.record-row:first>td');
                var colspan = parseInt(tds.length);
                var actionTdMarkup = false;
                if (tds.last().hasClass('list-row-action')) {
                    colspan--;
                    //style="background-color: white;"
                    actionTdMarkup = '<td >&nbsp;</td>';
                }
                var tdMarkup = false;
                if (tds.first().find('.lco').length > 0) {
                    colspan--;
                    //style="background-color: white;"
                    tdMarkup = '<td >&nbsp;</td>';
                }


                if (paginationRow.find('.paginate-link').not('.active-paginate-link').length > 0) {
                    paginationRow.attr({
                        'active_level': active_level
                    }).find('td:first').attr('colspan', colspan).prepend('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + padding).end();
                    if (tdMarkup !== false) {
                        paginationRow.prepend(tdMarkup);
                    }
                    if (actionTdMarkup !== false) {
                        paginationRow.append(actionTdMarkup);
                    }
                    paginationRow.insertAfter(tr);
                }
                var activeLevels = [];
                var num = 0;
                tr.nextAll().not('.pagination-row').each(function(k, v) {
                    num = parseInt($(this).attr('active_level'));
                    activeLevels.push((isNaN(num) ? 0 : num));
                });
                //data.find('.record-row').find('.tree-node,.category').prepend(padding).end().attr('active_level',active_level).insertAfter(tr);
                data.find('.record-row').each(function() {
                    var row = $(this);
                    if (!$(this).is('[active_level]')) {
                        $(this).find('.tree-node,.category').prepend(treeMarkup);
                        $(this).attr('active_level', active_level);
                    }
                    row.find('.twisty-i').each(function(k, v) {
                        var found = 0;
                        for (var kk = 0; kk < activeLevels.length; kk++) {
                            if (activeLevels[kk] == k) {
                                found = 1;
                            }
                            if (activeLevels[kk] < k) {
                                break;
                            }
                        }
                        if (found == 0) {
                            $(this).removeClass('twisty-i').addClass('twisty-b');
                        }
                    });
                }).insertAfter(tr);
            //data.find('.record-row').attr('active_level',active_level).insertAfter(tr);
            } else {
                if (data.find('.pagination-row').find('.paginate-link').not('.active-paginate-link').length > 0) {
                    var tdMarkup = '';
                    for (var k = 0; k < active_level; k++) {

                        //style="background-color: white;"
                        tdMarkup += '<td >&nbsp;</td>';
                    }
                    var tds = data.find('.record-row:first>td');
                    var colspan = parseInt(tds.length) - active_level;
                    var paginationRow = data.find('.pagination-row');
                    var actionTdMarkup = false;
                    if (tds.last().hasClass('list-row-action')) {
                        colspan--;
                        //style="background-color: white;"
                        actionTdMarkup = '<td >&nbsp;</td>';
                    }
                    paginationRow.attr({
                        'active_level': active_level
                    }).find('td:first').attr('colspan', colspan).end().prepend(tdMarkup);
                    if (actionTdMarkup !== false) {
                        paginationRow.append(actionTdMarkup);
                    }
                    paginationRow.insertAfter(tr);
                }
                var recordsCount = data.find('.record-row').length;
                data.find('.record-row').attr('active_level', active_level).insertAfter(tr);
                if (recordsCount > 0)
                    $($this).closest('tr').removeClass('ui-state-default').addClass('tree-color');//.find('.list-row-action:first').css('background-color','white').end().end().closest('td').prevAll().css('background-color','white');
            }
            $($this).removeClass('ui-state-disabled');
        });
        if ($(this).hasClass('twisty-close-last')) {
            $(this).removeClass('twisty-close-last').addClass('twisty-open-last').next('.twisty-fclose').removeClass('twisty-fclose').addClass('twisty-fopen');

        } else {
            $(this).removeClass('twisty-close').addClass('twisty-open').next('.twisty-fclose').removeClass('twisty-fclose').addClass('twisty-fopen');

        }
        event.stopPropagation();
        return false;
    });

    /**
     * Intercept twisty-open click event
     * Used in case of categorized/tree listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.twisty-fopen,.twisty-fclose', function(event) {
        log('click -->.twisty-fopen,.twisty-fclose');

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.twisty-open,.twisty-open-last', function(event) {
        log('click -> .twisty-open,.twisty-open-last');

        if ($(this).hasClass('ui-state-disabled'))
            return false;
        var tr = $(this).addClass('ui-state-disabled').closest('tr');
        var active_level = tr.attr('active_level');
        var tobeDeleted = [];
        if (typeof active_level == 'undefined') {
            active_level = 0;
        }
        active_level = parseInt(active_level);
        tr = tr.next();
        var level = tr.attr('active_level');
        while (level != 'undefined' && parseInt(level) > active_level) {
            tobeDeleted.push(tr);
            tr = tr.next();
            level = tr.attr('active_level');
        }
        if (tobeDeleted.length > 0) {
            var max = 0;
            for (var i = 0, max = tobeDeleted.length; i < max; i++) {
                tobeDeleted[i].remove();
            }
        }
        $(this).closest('tr').removeClass('ui-state-default').removeClass('tree-color');

        if ($(this).hasClass('twisty-open-last')) {
            $(this).removeClass('ui-state-disabled').removeClass('twisty-open-last').addClass('twisty-close-last')
            .next('.twisty-fopen').removeClass('twisty-fopen').addClass('twisty-fclose');
        } else {
            $(this).removeClass('ui-state-disabled').removeClass('twisty-open').addClass('twisty-close')
            .next('.twisty-fopen').removeClass('twisty-fopen').addClass('twisty-fclose');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('change','.save-list-record-input',function(){
        jQuery(this).closest('.record-row').find('.save-list-record').trigger('click');
    });

    $(document).on('click', '.search_trigger', function(event) {
        log('click -> .search_trigger');

        var val = $(this).parents(':first').find('[name="search_basic"]').val();
        var searchView = '#' + $(this).attr('search_view');
        var params = {
            'search_basic': val
        };
        $.listviewSearch(searchView, params);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.reset-search', function() {
        $(this).parents(':first').find('[name=\'search_basic\']').val('');
        jQuery.listviewSearch('#' + $(this).attr('search_view'), {});
    });
    $.listviewSearch = function(searchView, params, object) {
        log('listviewSearch');
        var href = $(searchView).attr('href');
        if (!$.isset(href)) {
            href = $(searchView).find('.paginate-link:first').attr('href');
        }
        if (href.indexOf('?') == -1) {
            href += '?';
        }
        href = href.replace(/page:[0-9]*/, '').replace('search_advance', 's').replace('search_basic', 's').replace('[search]', '[si]');
        if ($.isset(params['search_inline'])) {
            $.each(params['search_inline'], function(k, v) {
                href += '&' + v['column'] + '=' + v['value'];
            });
        }
        if ($.isset(params['search_basic'])) {
            href += '&search_basic=' + params['search_basic'];
        }
        if ($.isset(params['search_advance'])) {
            if ($.isArray(params['search_advance']) || $.isPlainObject(params['search_advance'])) {
                params['search_advance'] = encodeURIComponent(JSON.stringify(params['search_advance']))
            }
            href += '&search_advance=' + params['search_advance'];
        }
        href += '&page=1';


        href += '&related_to=' + $(searchView).closest('form').find('.form_document_id').val();

        if ($.isset(params['reset'])) {
            href += '&reset=' + params['reset'];
        }
        if ($.isset(params['params'])) {
            href += params['params'];
        }
        log(href);

        $.get(href, {}, function(data) {
            $.replaceListview($(searchView), data);
            if (typeof (object) != 'undefined') {
                $(object).closest('.ui-dialog').find('.ui-dialog-titlebar-close').trigger('click');
            }
        //document.location.href=href;
        });
    //link.attr('href',href).trigger('click');
    }


    /**
     * Intercept paginate-link click event
     * Used in case of categorized/tree listview sublevels pagination.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.paginate-link', function(event) {
        log('click -> .paginate-link');

        var paginateLink = $(this);
        if (typeof $(this).closest('tr').attr('active_level') != 'undefined') {
            if ($(this).hasClass('ui-state-disabled'))
                return false;
            var tr = $(this).siblings('.paginate-link').addClass('ui-state-disabled').end().addClass('ui-state-disabled').closest('tr');
            var active_level = tr.attr('active_level');
            var tobeDeleted = [tr];
            var href = $(this).attr('href');
            if (typeof active_level != 'undefined') {
                active_level = parseInt(active_level);
                tr = tr.prev();
                var level = tr.attr('active_level');
                while (level != 'undefined' && parseInt(level) >= active_level) {
                    tobeDeleted.push(tr);
                    tr = tr.prev();
                    level = tr.attr('active_level');
                }
            }
            tr.find('.twisty-open,.twisty-open-last').each(function() {
                if ($(this).hasClass('twisty-open-last')) {
                    $(this).removeClass('twisty-open-last').addClass('twisty-close-last').trigger('click', [href, tobeDeleted]);
                } else {
                    $(this).removeClass('twisty-open').addClass('twisty-close').trigger('click', [href, tobeDeleted]);
                }
            });
        } else {
            if ($(this).hasClass('ui-state-disabled'))
                return false;
            var tr = $(this).siblings('.paginate-link').addClass('ui-state-disabled').end().addClass('ui-state-disabled').closest('tr');
            var href = $(this).attr('href');
            var table = $(this).closest('table');
            $.get(href, {}, function(data) {
                if (typeof (data) === "object") {
                    showMessage(data);
                    var oldUrl = paginateLink.attr('old_href');
                    if ($.isset(oldUrl))
                        paginateLink.attr('href', oldUrl);
                    $(tr).find('.paginate-link').removeClass('ui-state-disabled');
                } else {
                    $.replaceListview(table, data);


                }
            });
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    $.replaceListview = function(replacedView, data) {
        log('replaceListview');

        var data = $(data);
        var requiredTable = (data.hasClass('listview') ? data : data.find('.listview:first'));
        if (replacedView.hasClass('table-no-td-border')) {
            requiredTable.addClass('table-no-td-border');
        }
        if (replacedView.prev('.all-records-selection').length > 0) {
            replacedView.prev('.all-records-selection').remove();
        }
        var viewId = replacedView.attr('id');
        replacedView.replaceWith(requiredTable);
        if ($.isset(viewId)) {
            $(requiredTable).attr({
                'id': viewId
            });
        }

        initChart(data);
    //$.tableColResizable(requiredTable);
    }
    /*
     $.tableColResizable=function(table){
     table.parents(":first").find('.JCLRgrips').remove();
     if(!table.find('tr:first').hasClass('search_criteria')){
     $(table).colResizable();
     if(table.is("[search_criteria]")) {
     table.before('<div class="search_criteria">'+table.attr('search_criteria')+'</div>');
     }
     }
     }
     $('.listview.index').colResizable();
     */


    /**
     * Intercept sort-link click event
     * Used in case of all listviews.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.sort', function(event) {
        log('click -> .sort');
        var href = $(this).attr('href');
        var table = $(this).parents('table:eq(1)');
        $.get(href, {}, function(data) {
            $.replaceListview(table, data);
        });
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    //$.address.change(function(event){
    //    $(".tab").tabs( "select" , window.location.hash )
    //});

    $(document).on('click', '.date_toggle', function(event) {
        log('click -> .date_toggle');
        if ($(this).hasClass('toggle_enabled')) {
            $(this).parents(':first').find('.date').datepicker("destroy").removeClass('date datetime number');
            $(this).removeClass('toggle_enabled').addClass('toggle_disabled').text('Show Picker');
        } else {
            $(this).parents(':first').find('.date').datepicker({"yearRange": "-100:+5"});
            $(this).removeClass('toggle_disabled').addClass('toggle_enabled').text('Enter manually');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    $(document).on('click', '.datetime_toggle', function(event) {
        log('click -> .datetime_toggle');
        if ($(this).hasClass('toggle_enabled')) {
            $(this).parents(':first').find('.datetime').datepicker("destroy");
            $(this).removeClass('toggle_enabled').addClass('toggle_disabled').text('Show Picker');
        } else {
            var ampm = false;
            if ($.isset($.config) && $.isset($.config.hour_format))
                ampm = $.config.hour_format;
            $(this).parents(':first').find('.datetime').datetimepicker({
                "ampm": ampm,
                "timeFormat": "hh:mm:ss TT",
                "showSecond": true
            });
            $(this).removeClass('toggle_disabled').addClass('toggle_enabled').text('Enter manually');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    if(ClipboardJS.isSupported()){

        new ClipboardJS('.copy-to-clipboard-action');
        new ClipboardJS('.copy_to_clipboard_link');
        var clipboard=new ClipboardJS('.copy_to_clipboard');
        clipboard.on('success', function(e) {
            setTimeout(function(){
                jQuery(e.trigger).parents("div.ui-widget-content:first").dialog('destroy').remove();
            },500);
        });
    }
    


        

     

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.select', function(event) {
        log('click -> .select');
        var href = $(this).attr('href');
        if (!$.isset(href))
            return false;
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
        if ($.isset(params['id']) && $.isset(getParams['trigger'])) {
            var listview = $(this).parents("table.listview:first");
            var displayField = listview.attr('display_field');
            var primaryKey = listview.attr('primary_key');
            if ($('#' + getParams['trigger']).hasClass('tokeninput-popup-add')) {
                var label = (displayField == primaryKey ? params['id'] : $(this).closest('tr').find("[column_name='" + displayField + "']").text());
                var td = $('#' + getParams['trigger']).parents(':first');
                $(this).parents("div.ui-widget-content:first").dialog('destroy').remove();

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
                var td = $('#' + getParams['trigger']).parents(':first');
                $(this).parents("div.ui-widget-content:first").dialog('destroy').remove();
                var popupSelect = td.find('.popup-select');
                var popupHidden = td.find('.popup-hidden:first');
                var popupAutocomplete = td.find('.popup-autocomplete:first');
                var selectedModel = popupSelect.find('option:selected').attr('model');
                var href = '';
                if (popupSelect.length > 0) {
                    href = popupSelect.find("option:selected").attr('href');
                } else {
                    href = $(this.element[0]).attr('href');
                }
                var label = (displayField == primaryKey ? params['id'] : $(this).closest('tr').find("[column_name='" + displayField + "']").text());
                if ($.isEmpty(label)) {
                    if (!$.isEmpty(href)) {
                        var q = {};
                        q["paginate_as"] = "lazy";
                        q['limit'] = 1;
                        q['fields'] = ['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}', '{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'];
                        q['autocomplete'] = 1;
                        var where = {};
                        where['{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'] = params['id'];
                        q['where'] = where;
                        href = href.split('?');
                        href[0] += '.json';
                        href = href.join('?')
                        log('calling ' + href);
                        $.getJSON(href, {
                            'q': encodeURIComponent(JSON.stringify(q))
                        }, function(paginateResponse) {
                            var paginate = {};
                            if ($.isset(paginateResponse['paginate'])) {
                                paginate = paginateResponse['paginate'];
                            }
                            var primaryKey = paginate['primary_key'];
                            var displayField = paginate['display_field'];

                            var v = paginate.data.pop();
                            if (popupHidden.attr('multiselect') == 1) {
                                var terms = popupAutocomplete.val();
                                terms = terms.split(/,\s*/);
                                terms.pop();
                                if (popupHidden.attr('postfix_label') == 1) {
                                    terms.push(v[displayField] + "[" + selectedModel.substring(0, 1) + "]");
                                } else {
                                    terms.push(v[displayField]);
                                }
                                terms.push("");
                                popupAutocomplete.val(terms.join(", "));
                                if (popupHidden.attr('prefix_id') == 1) {
                                    popupHidden.valJSON(selectedModel.substring(0, 1) + v[primaryKey], v[displayField]).trigger('change');
                                } else {
                                    popupHidden.valJSON(v[primaryKey], v[displayField]).trigger('change');
                                }
                                return false;
                            } else {
                                popupAutocomplete.val($.trim(v[displayField]));
                                popupHidden.val(v[primaryKey]).attr('for_text', $.trim(v[displayField])).trigger('change');
                                return false;
                            }


                        });
                    }
                } else {
                    v = {};
                    v[primaryKey] = params['id'];
                    v[displayField] = label;
                    if (popupHidden.attr('multiselect') == 1) {
                        var terms = popupAutocomplete.val();
                        terms = terms.split(/,\s*/);
                        terms.pop();
                        if (popupHidden.attr('postfix_label') == 1) {
                            terms.push(v[displayField] + "[" + selectedModel.substring(0, 1) + "]");
                        } else {
                            terms.push(v[displayField]);
                        }
                        terms.push("");
                        popupAutocomplete.val(terms.join(", "));
                        if (popupHidden.attr('prefix_id') == 1) {
                            popupHidden.valJSON(selectedModel.substring(0, 1) + v[primaryKey], v[displayField]).trigger('change');
                        } else {
                            popupHidden.valJSON(v[primaryKey], v[displayField]).trigger('change');
                        }
                        return false;
                    } else {
                        popupAutocomplete.val($.trim(v[displayField]));
                        popupHidden.val(v[primaryKey]).attr('for_text', $.trim(v[displayField])).trigger('change');
                        return false;
                    }
                }
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    
    
    $(document).on('click', '.popup-select-record,.popup-multi-select-record', function(event) {
        console.log('click -> .popup-select-record,.popup-multi-select-record');
        log('click -> .popup-select-record,.popup-multi-select-record');
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        href = $(this).attr('href');
        q = $(this).attr('q');
        q = decodeURIComponent(q);
        
        if (typeof (href) != 'undefined' && $.trim(href) != '') {
            if ($.trim(q) == '' || !$.isset(q))
                q = '{}';
            q = parseJSON(q);
            if (!$.isPlainObject(q)) {
                q = {};
            }
            q['limit'] = 16;
            if($(this).hasClass('popup-multi-select-record')){
                q['actions'] = [];
            }else{
                q['actions'] = ['select'];
            }
            
            if (!$.isset(q['where'])) {
                q['where'] = [];
            }
            q['fetch'] = 1;
            q['merge_paginate'] = 1;

            var where = {};
            q['where'] = $.mergeAll([q['where'], where]);
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';

            if (q !== false) {
                if(href.indexOf($(this).data('current_module')+"/"+$(this).data('current_controller')) != -1){
                    q['where'][$(this).data('current_controller')+".id != "] = $(this).data('current_record_id'); 
                }
                $.get(href, {
                    'q': encodeURIComponent(JSON.stringify(q)),
                    'trigger': uuid
                }, function(data) {
                    var params = {
                        "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
                        "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
                    };
                    params['title'] = popupTitle(href);
                    var uuid = $.jsContainer(data, params);
                    $.initFields($('#' + uuid));
                });
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.popup-add', function(event) {
        console.log('click -> .popup-add');
        log('click -> .popup-add');
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        var td = $(this).parents(':first');
        var popupSelect = td.find('.popup-select');
        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.popup-autocomplete');
            if (popupSelect.find("option:selected").length == 0) {
                popupSelect.get(0).selectedIndex = 0;
            }
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = option.attr('q');
        } else {
            var popupAutocomplete = td.find('.popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = popupAutocomplete.attr('q');
        }
        href=processMergeWords($(this),href);
        q = decodeURIComponent(q);
        
        if (typeof (href) != 'undefined' && $.trim(href) != '') {
            if ($.trim(q) == '' || !$.isset(q))
                q = '{}';
            q = parseJSON(q);
            if (!$.isPlainObject(q)) {
                q = {};
            }
            q['limit'] = 16;
            q['actions'] = ['select'];
            if (!$.isset(q['where'])) {
                q['where'] = [];
            }
            q['fetch'] = 1;
            q['merge_paginate'] = 1;

            var where = {};
            var fieldDependsOn = popupAutocomplete.attr('field_value_depends_on');
            var message = popupAutocomplete.attr('message_if_empty_dependent_on_field');
            if (fieldDependsOn != '') {
                $(fieldDependsOn).each(function() {
                    var name = $.extractName($(this).attr('name'));
                    var val = $(this).val();
                    var fieldName = name.slice(-2).join('.');
                    if (message == '') {
                        var label = $('[for="' + name.join('-') + '"]').text();
                        if (label == "") {
                            label = fieldName;
                        }
                        message = "Please enter value for field " + label;
                    }
                    where[fieldName] = val;

                });
            }
            q['where'] = $.mergeAll([q['where'], where]);

            $(popupAutocomplete).data('q', q);
            $(popupAutocomplete).triggerHandler('beforeSearch');
            q = $(popupAutocomplete).data('q');
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';

            if (q !== false) {
                if(href.indexOf($(this).data('current_module')+"/"+$(this).data('current_controller')) != -1){
                    q['where'][$(this).data('current_controller')+".id != "] = $(this).data('current_record_id'); 
                }
                $.get(href, {
                    'q': encodeURIComponent(JSON.stringify(q)),
                    'trigger': uuid
                }, function(data) {
                    var params = {
                        "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
                        "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
                    };
                    params['title'] = popupTitle(href);
                    var uuid = $.jsContainer(data, params);
                    $.initFields($('#' + uuid));

                });
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });



    $(document).on('click', '.tokeninput-popup-add', function(event) {
        log('click -> .tokeninput-popup-add');
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        var td = $(this).parents(':first');
        var popupSelect = td.find('.popup-select');

        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.tokeninput-popup-autocomplete');
            if (popupSelect.find("option:selected").length == 0) {
                popupSelect.get(0).selectedIndex = 0;
            }
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = option.attr('q');
        } else {
            var popupAutocomplete = td.find('.tokeninput-popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = popupAutocomplete.attr('q');
        }
        href=processMergeWords($(this),href);
        q = decodeURIComponent(q);
        if ($.trim(href) != '') {
            if ($.trim(q) == '' || !$.isset(q))
                q = '{}';
            q = parseJSON(q);
            if (!$.isPlainObject(q)) {
                q = {};
            }
            q['limit'] = 16;
            q['actions'] = ['select'];
            if (!$.isset(q['where'])) {
                q['where'] = [];
            }
            q['fetch'] = 1;
            q['merge_paginate'] = 1;

            where = {};
            var fieldDependsOn = popupAutocomplete.attr('field_value_depends_on');
            var message = popupAutocomplete.attr('message_if_empty_dependent_on_field');
            if (fieldDependsOn != '') {
                $(fieldDependsOn).each(function() {
                    var name = $.extractName($(this).attr('name'));
                    var val = $(this).val();
                    var fieldName = name.slice(-2).join('.');
                    if (message == '') {
                        var label = $('[for="' + name.join('-') + '"]').text();
                        if (label == "") {
                            label = fieldName;
                        }
                        message = "Please enter value for field " + label;
                    }
                    where[fieldName] = val;

                });
            }
            q['where'] = $.mergeAll([q['where'], where]);
            $(popupAutocomplete).data('q', q);
            $(popupAutocomplete).triggerHandler('beforeSearch');
            q = $(popupAutocomplete).data('q');
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';
            if (q !== false) {
                $.get(href, {
                    'q': encodeURIComponent(JSON.stringify(q)),
                    'trigger': uuid
                }, function(data) {
                    var params = {
                        "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
                        "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
                    };
                    params['title'] = popupTitle(href);
                    var uuid = $.jsContainer(data, params);
                    $.initFields($('#' + uuid));

                });
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });


    $(document).on('click', '.popup-open-record', function(event) {
        console.log('click -> .popup-open-record');
        log('click -> .popup-open-record');
        var href = '';
        var q = '';
        var td = $(this).parents(':first');
        var popupSelect = td.find('.popup-select');
        var popupHidden = td.find('.popup-hidden');
        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.popup-autocomplete');
            if (popupSelect.find("option:selected").length == 0) {
                popupSelect.get(0).selectedIndex = 0;
            }
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = option.attr('q');
        } else {
            var popupAutocomplete = td.find('.popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = popupAutocomplete.attr('q');
        }
        href=processMergeWords($(this),href);
        

        if ($.trim(href) != '' && ($(this).hasClass('popup-open-record-always') || popupHidden.val() != '') ) {
            href += (href.indexOf('?') == -1 ? '?' : '');//+'&id='+popupHidden.val();
            href = href.replace('/index', '/view');
            href = href.replace('?', '/id:' + popupHidden.val() + '?');

        
            $(popupAutocomplete).data('q_open', href);
            $(popupAutocomplete).triggerHandler('beforeOpen');
            var href = $(popupAutocomplete).data('q_open');
            $(this).attr('href', href);
            if ($.trim(href) != ''){
                $.ajaxPopup($(this).attr('ajax', 1));
            }
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    function processMergeWords(obj,href){
        if (typeof (href) != 'undefined' && $.trim(href) != '') {
            var formdata=$(obj).closest('form').serializeArray();
            if(formdata.length){
                for(var i=0; i < formdata.length; i++){
                    var formfieldName=formdata[i]['name'];
                    var formfieldValue=formdata[i]['value'];
                    formfieldName=formfieldName.replaceAll('][','.').replaceAll('data[','').replaceAll(']','');
                    href=href.replaceAll('{{'+formfieldName+'}}',formfieldValue);
                    console.log('{{'+formfieldName+'}}',formfieldValue);
                }
            }
        }
        return href;
    }



    function popupTitle(href) {
        log('popupTitle');
        if (typeof href == 'string') {
            href = href.split($.config['base']);
            href.shift();
            href = href.join($.config['base']);
            href = href.split('?')[0].split("/");
            href.shift();
            for (i = 0; i < href.length; i++) {
                if (href[i].indexOf(':') != -1) {
                    href[i] = href[i].substring(href[i].indexOf(':') + 1, href[i].length);
                }
            }
            return href.join(" » ").replace('_', ' ');
        }
        else {
            return'';
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.popup-clear', function(event) {
        log('click -> .popup-clear');
        $(this).closest('td')
        .find('.popup-autocomplete').val('').end()
        .find('.popup-hidden').val('').trigger('change').end()
        .find('.popup-open-record').hide().end();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('change', '.popup-select', function(event) {
        log('change -> .popup-select');

        var td = $(this).closest('td');
        if (parseInt(td.find('.popup-hidden').attr('multiselect')) != 1) {
            td.find('.popup-autocomplete').val('').end()
            .find('.popup-hidden').val('').trigger('change').end();
            //.find('.popup-open-record').hide().end();
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('change', '.geocoder', function(event) {
        var block = $(this).closest('.block');
        var latitude = block.find('[name *="[latitude]" ]');
        var longitude = block.find('[name *="[longitude]" ]');
        var locationType = block.find('[name *="[location_type]" ]');
        var geocodeType = block.find('[name *="[geocode_type]" ]');
        if (latitude.length > 0 && latitude.is(':input') && latitude.val() == "") {
            var address = [];
            var line1 = block.find('[name *="address_line_1" ]').val();
            var line2 = block.find('[name *="address_line_2" ]').val();
            var city = block.find('[name *="city" ]').val();
            var state = block.find('[name *="__state" ]').val();
            var country = block.find('[name *="__country" ]').val();
            if (line1 != '' && city != '' && state != '' && country != '') {
                address.push(line1);
                address.push(line2);
                address.push(city);
                address.push(state);
                address.push(country);
                address = address.join(', ');
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'address': address
                }, function(results, status) {
                    latitude.val("");
                    longitude.val("");
                    if (locationType.length > 0) {
                        locationType.val("");
                    }
                    if (geocodeType.length > 0) {
                        geocodeType.val("");
                    }

                    if (status == google.maps.GeocoderStatus.OK) {
                        latitude.val(results[0].geometry.location.lat());
                        longitude.val(results[0].geometry.location.lng());
                        if (locationType.length > 0) {
                            locationType.val(results[0].geometry.location_type);
                        }
                        if (geocodeType.length > 0) {
                            geocodeType.val(results[0].types.join(', '));
                        }
                    }
                });
            }
        }
    });

    /*
     $(document).bind('document_update',function(event,dom){
     console.log(dom);
     });
     */

    /*
     $(document).bind('document_update',function(event,dom){
     console.log(dom);
     });
     */

    $.initFields = function(container, init) {
        log('initFields');

        /**
         * Initialize jquery tab
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        var init = init || false;


        /*
         if (container.find('[name="data[forms][properties][formula]"]').length > 0) {
         container.find('[name="data[forms][properties][formula]"]').val(container.find('[name="data[forms][properties][formula]"]').val().replace(/&quot;/g, '"'));
         }
         container.find('form').ready(function() {
         container.find('form').each(function() {
         // Form validation using jquery.validate plugin
         $.validate_form($(this));
         });
         // Formula Computation
         container.find('[formula]').compute();
         });
         */


        container.find(".tab").not('.template-element').each(function() {
            var selected = $(this).attr("selected");
            var op = {};
            op["cookie"] = {};
            if (init == true) {
                op["cookie"] = null;
            }
            op['activate'] = function(event, ui) {
                if ($.isset(ui.newPanel) && $(ui.newPanel).index() > 1 && !$(ui.panel).hasClass('resized')) {
                    $(ui.newPanel).addClass('resized').find('.listview').each(function() {
                        if ($(this).find('.chart').length > 0) {
                            initChart($(this));
                        }
                    });
                }
            };

            $(this).tabs(op).bind("tabsselect", function(event, ui) {
                //window.location.hash = ui.tab.hash;
                });
        // when the tab is selected update the url with the hash
        });
        // invoke a global handler for initialising new added dom elements with plugin.
        log('$(document).triggerHandler(document_update, [container])');
        log(container);
        $(document).triggerHandler('document_update', [container]);
        // Usage:
        // $(document).bind('document_update',function(event,dom){
        // 
        // });

        if ($(".row-template-overflow").length > 0) {
            $(".row-template-overflow").each(function() {
                if ($(this)[0].scrollHeight > 0) {
                    if ($(this).height() < $(this)[0].scrollHeight) {
                        $(this).closest("td").append('<span class="row-template-more" style="color:GREY;">more...</span>');
                    }
                }
            });
        }
        $('.row-template-more').on('click', function(event) {
            if ($(this).prev().find('.row-template-overflow').attr('style') != '') {
                $(this).prev().find('.row-template-overflow').attr('style', '');
                t = $(this).clone(true);
                t.text('less...');
                $(this).replaceWith(t);
            }
            else {
                $(this).prev().find('.row-template-overflow').attr('style', 'height:115px;overflow:hidden;');
                t = $(this).clone(true);
                t.text('more...');
                $(this).replaceWith(t);
            }
        });

        container.find("button")
        .removeClass('ui-state-active').each(function() {
            if ($(this).is('button')) {
                $(this).css({
                    'padding': '1px'
                });
            }

            if ($(this).hasClass('action-list-trigger')) {
                $(this).button({
                    icons: {
                        secondary: "ui-icon-triangle-1-s"
                    }
                });
            } else {
                var iconClass = $(this).attr('icon_class');
                var iconPosition = $(this).attr('icon_position');
                if (iconClass != "") {
                    var icon = {};
                    if (typeof (iconPosition) == 'undefined' || iconPosition == '') {
                        iconPosition = 'secondary';
                    }
                    icon[iconPosition] = iconClass;
                    $(this).button({
                        icons: icon
                    });
                } else {
                    $(this).button();
                }
            }

            if ($(this).hasClass('ui-helper-hidden')) {
                $(this).hide();
            }
            if ($(this).hasClass('track-unchecked')) {
                $(this).show();
            }
        });

        /**
         * Initialize WYSIWYG editor
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('[editor="WYSIWYG"]').not('.template-element').each(function() {
            var properties = {};
            var height = parseInt($(this).css('height'));
            var rows = parseInt($(this).attr('rows'));
            if(rows > 0){
                height=rows*20;
            }
            if ($.isset(height) && height > 250)
                properties['height'] = height;

            //var width=parseInt($(this).css('width'));
            //if($.isset(width) && width > 500)
            //    properties['width'] =width;
            //else

            //properties['width'] =parseInt($(this).parents(':visible:first').css('width'));
            //console.log()
            $(this).cleditor(properties);
        }).change(function(){
            var editor = $(this).cleditor()[0];
                editor.refresh();
        });

        /**
         * Initialize WYSIWYG editor
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        var aceEditor = container.find('[editor="code_editor"]').not('.template-element');
        if (aceEditor.length > 0) {
            var initAceEditor = function() {
                aceEditor.each(function() {
                    var properties = {};
                    var height = parseInt($(this).css('height'));
                    if ($.isset(height) && height > 250)
                        properties['height'] = height;

                    var width = parseInt($(this).css('width'));
                    if ($.isset(width) && width > 500)
                        properties['width'] = width;
                    else
                        properties['width'] = '100%';
                    $(this).ace({
                        theme: 'eclipse',
                        lang: 'php'
                    });
                });
            }
            if (typeof (window.jQueryAce) == "undefined") {
                var oHead = document.getElementsByTagName('head')[0];
                var oScript = document.createElement('script');
                oScript.type = 'text/javascript';
                oScript.src = CONFIG.base + "module/ace/jquery-ace.js";
                // most browsers
                oScript.onload = initAceEditor;
                // IE 6 & 7
                oScript.onreadystatechange = function() {
                    if (this.readyState == 'complete') {
                        initAceEditor();
                    }
                }
                oHead.appendChild(oScript);
            } else {
                initAceEditor();
            }
        }



        container.find('[editor="markup"]').not('.template-element').each(function() {
            var base = ($.isset($.config) && $.isset($.config.base) ? $.config.base : false);
            $(this).markItUp(mySettings);
            $('#emoticons a').click(function() {
                emoticon = $(this).attr("title");
                $.markItUp({
                    replaceWith: emoticon
                });
            });
        });

        /**
         * Initialize date picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */

        var dateFormat = $.config['date_format'];
        container.find('input.date')
        .not('.template-element').each(function() {
            if ($(this).attr('is_readonly') != 0) {
                $(this).attr('readonly', 'readonly');
            } else {
                $(this).parents(':first').find('.date_toggle').remove();
                $(this).after('<a href="#" class="date_toggle toggle_enabled">Enter manually</a>');
            }
        })
        .datepicker({"yearRange": "-100:+15"})
        .keyup(function(e) {
            if(e.keyCode == 8 || e.keyCode == 46) {
                $.datepicker._clearDate(this);
            }
        })
        .next().after('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + ")" : "") + '</span>');

        container.find('span.date')
        .not('.template-element')
        .after('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + ")" : "") + '</span>');

        /**
         * Initialize date time picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('input.datetime')
        .not('.template-element')
        .each(function() {

            var ampm = false;
            if ($.isset($.config) && $.isset($.config.hour_format) && parseInt($.config.hour_format) == 12) {
                ampm = true;
            }
            var $this=$(this);
            if ($this.attr('is_readonly') != 0) {
                $this.attr('readonly', 'readonly');
            } else {
                $this.parents(':first').find('.datetime_toggle').remove();
                $this.after('<a href="#" class="datetime_toggle toggle_enabled" >Enter manually</a>');
            }
            var datetimeValueOriginal = $.trim($this.val());
            var datetimeValue = $this.val().split(' ');
            if (typeof (datetimeValue[1]) != 'undefined') {
                datetimeValue = datetimeValue[1].split(':');
            } else {
                datetimeValue = [];
            }
            var $thisdatetimepicker=$this.datetimepicker({
                "ampm": ampm,
                "timeFormat": "hh:mm:ss TT",
                "showSecond": true,
                "hour": datetimeValue[0] | 0,
                "minute": datetimeValue[1] | 0,
                "second": datetimeValue[2] | 0
            });
            if(datetimeValue.length ==0){
                let defaultDatetime=new Date();
                if($this.attr('name').indexOf('start_') !== -1){
                    defaultDatetime.setHours(9);
                    defaultDatetime.setMinutes(0);
                    defaultDatetime.setSeconds(0);
                }else if($this.attr('name').indexOf('end_') !== -1 || $this.attr('name').indexOf('due_') !== -1){
                    defaultDatetime.setHours(17);
                    defaultDatetime.setMinutes(0);
                    defaultDatetime.setSeconds(0);
                }
                if($this.attr('disable_autofill_while_cloning') != 1){
                    $thisdatetimepicker.datetimepicker('setDate', defaultDatetime);
                }
            }
            if(datetimeValueOriginal.indexOf('XVAR') != -1){
                $this.parents(':first').find('.datetime_toggle').trigger('click');
                $this.val(datetimeValueOriginal);
            }
        }).keyup(function(e) {
            if(e.keyCode == 8 || e.keyCode == 46) {
                $(this).val(null);
            }
        }).closest('.cell-info').append('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + " hh:mm:ss)" : "") + '</span>');


        container.find('span.datetime').not('.template-element')
        .closest('.cell-info').append('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + " hh:mm:ss)" : "") + '</span>');

        /**
         * Initialize time picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('input.time').not('.template-element').attr('readonly', 'readonly').each(function() {
            var ampm = (parseInt($(this).attr('ampm')) == 1 ? true : false);
            $(this).timepicker({
                "ampm": ampm,
                "timeFormat": "hh:mm:ss tt",
                "showSecond": true
            });
        });


        container.find('.button-set').buttonset();
        container.find('.action-list').menu();






        /**
         * Initialize jquery autocomplete
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */


        container.find(".popup-autocomplete").not('.template-element').not('[readonly]')
        .each(function() {

            var properties = {
                minLength: 0,
                select: function(event, ui) {
                    var popupSelect = $(this).closest('td').find('.popup-select');
                    var popupHidden = $(this).closest('td').find('.popup-hidden:first');
                    var popupAutocomplete = $(this).closest('td').find('.popup-autocomplete:first');
                    if (popupHidden.attr('multiselect') == 1) {
                        var terms = this.value.split(/,\s*/);
                        terms.pop();
                        // add the selected item
                        terms.push(ui.item.value);
                        // add placeholder to get the comma-and-space at the end
                        terms.push("");
                        this.value = terms.join(", ");
                        popupHidden.valJSON(ui.item.id, ui.item.value.split('[')[0]).trigger('change');

                        return false;
                    } else {
                        this.value = ui.item.value;
                        popupHidden.val(ui.item.id).attr('for_text', ui.item.value).trigger('change');
                        return false;
                    }

                },
                source: function(request, response) {
                    var href = '';
                    var q = '';
                    var element = this.element[0];
                    log(this.element[0]);
                    var td = $(this.element[0]).closest('td');
                    log(td);
                    log(td.html());
                    var term = [];
                    var termP = request.term.split("/");
                    for (var i = 0; i < termP.length; i++) {
                        term.push($.trim(termP[i].split('[')[0]));
                    }
                    term = term.join('/');
                    var popupHidden = td.find('.popup-hidden:first');
                    log(popupHidden);
                    var forText = popupHidden.attr('for_text');
                    if (typeof (forText) == 'undefined') {
                        forText = "";
                    }
                    forText = forText.split('[')[0];

                    var searchTerm = request.term;
                    if (popupHidden.attr('multiselect') == 1) {
                        searchTerm = request.term.split(/,\s*/).pop();
                    } else {
                        if ($.trim(forText) != term) {
                            td.find('.popup-hidden').val('').trigger('change');
                        }
                    }
                    var popupSelect = td.find('.popup-select');
                    if (popupSelect.length > 0) {
                        var option = popupSelect.find("option:selected");
                        href = option.attr('href');
                        q = option.attr('q');
                    } else {
                        href = $(this.element[0]).attr('href');
                        q = $(this.element[0]).attr('q');
                    }
                    href=processMergeWords($(this.element[0]),href);
                    var inline_search = $(this.element[0]).attr('inline_search');
                    if ($.isset(inline_search) && inline_search == 0) {
                        return false;
                    }



                    q = decodeURIComponent(q);
                    if (typeof (href) != 'undefined' && href != '') {
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
                        if (!$.isEmpty(searchTerm)) {
                            where['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}' + ' LIKE '] = searchTerm;
                        }

                        q['fetch'] = 1;
                        q['autocomplete'] = 1;
                        q['where'] = $.mergeAll([q['where'], where]);

                        var concatTextValue = parseInt($(this.element[0]).attr('concat_text_value'));


                        $(this.element[0]).data('q', q);
                        $(this.element[0]).triggerHandler('beforeSearch');
                        q = $(this.element[0]).data('q');
                        if (q !== false) {
                            if (href.indexOf('?') !== -1) {
                                href = href.replace('?', '.json?');
                            } else {
                                href = href + '.json';
                            }
                            $.getJSON(href, {
                                'q': encodeURIComponent(JSON.stringify(q))
                            }, function(paginateResponse, status, xhr) {
                                var paginate = {};
                                if ($.isset(paginateResponse['paginate'])) {
                                    paginate = paginateResponse['paginate'];
                                }
                                var list = [];
                                if ((typeof (paginate) != 'undefined') && (typeof (paginate['data']) != 'undefined')) {
                                    var primaryKey = paginate['primary_key'];
                                    var displayField = paginate['display_field'];
                                    if (concatTextValue == 1) {
                                        $.each(paginate.data, function(k, v) {
                                            list.push({
                                                'id': v[primaryKey],
                                                'value': (v[displayField] != v[primaryKey] ? v[displayField] + ' [' + v[primaryKey] + ']' : v[displayField])
                                            });

                                        });
                                    } else {
                                        $.each(paginate.data, function(k, v) {
                                            list.push({
                                                'id': v[primaryKey],
                                                'value': v[displayField]
                                            });

                                        });
                                    }
                                }
                                $(element).data('option_list', list);

                                response(list);
                            });
                        }

                    }

                }
            };

            var autocomplete = $.extend({}, properties);
            if ($(this).attr('multiselect') == 1) {
                $(this).bind("keydown", function(event) {
                    if (event.keyCode === $.ui.keyCode.TAB &&
                        $(this).data("autocomplete").menu.active) {
                        event.preventDefault();
                    }
                });
                autocomplete['focus'] = function() {
                    // prevent value inserted on focus
                    return false;
                }
            }
            $(this).autocomplete(autocomplete);
        }).click(function() {
            $(this).autocomplete('search');
        }).keydown(function(event) {
            if (event.keyCode === $.ui.keyCode.TAB
                &&
                $(this).closest('td').find('.popup-hidden:first').val() == ""
                &&
                $(this).closest('td').find('.popup-autocomplete:first').val() != ""
                ) {
                var option = $(this).data('option_list');
                if (typeof (option) != 'undefined' && typeof (option[0]) != 'undefined') {
                    $(this).closest('td').find('.popup-hidden:first').val(option[0]['id']);
                    $(this).closest('td').find('.popup-autocomplete:first').val(option[0]['value']);
                }
            }
        });

        container.find(".popup-hidden")
        .not('.template-element')
        .not('[readonly]')
        .bind('data_source_url', function(event, id) {
            var href = '';
            var td = $(this).closest('td');
            var popupSelect = td.find('.popup-select');
            if (popupSelect.length > 0) {
                href = popupSelect.find("option:selected").attr('href');
            } else {
                href = $(this.element[0]).attr('href');
            }
            href.replace('/index', '/view');
            href += ".json?id=" + id;
            return href;
        });

        container.find(".popup-hidden")
        .not('.template-element')
        .not('[readonly]')
        .bind('data_source_url', function(event, id) {
            var href = '';
            var td = $(this).closest('td');
            var popupSelect = td.find('.popup-select');
            if (popupSelect.length > 0) {
                href = popupSelect.find("option:selected").attr('href');
            } else {
                href = $(this.element[0]).attr('href');
            }
            href = href.replace('/index', '/view');
            href += ".json?id=" + id;


            $(this).data('data_source_url', href);
            event.preventDefault();
            return false;
        });
        /*
         $('.popup-autocomplete').on('focusout', function() {
         var popup = $(this);
         var popupHidden = popup.closest('td').find('.popup-hidden');
         //case 1: when the field is a combo box and user can also type value in it
         if (popup.attr('is_combo_box') == '1' && popupHidden.val() == '' && popup.val() != '') {
         popupHidden.val(popup.val());
         }
         //case 2: when the field is not a combo box and user should not type value in it
         else {
         if (popup.attr('is_combo_box') != '1' && popupHidden.val() == '') {
         popup.val('');
         }
         }
         });
         */
        container.find('[aggregation_formula]')
        .not('.template-element')
        .not('[readonly]')
        .aggregation({
            'grid_row_class_name': 'last-data-row',
            'grid_cell_class_name': 'cell-info-grid'
        });

        container.find(".tokeninput-popup-autocomplete").not('.template-element').not('[readonly]')
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
                    try {
                        $.each(element.attrs(), function(k, v) {
                            if (k.indexOf('_column') != -1) {
                                if (typeof (stdColumns[k]) == 'undefined') {
                                    column = k.replace('_column', '');
                                    str += "<input type='hidden'  name='" + v.replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + ($.isset(item[column]) && item[column] != "" ? item[column] : "") + "' >"
                                }
                            }
                        });
                    } catch (e) {

                    }
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
                    var td = $(element).closest('td');
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


        container.find("input.tagsinput").not('.template-element').not('[readonly]')
        .each(function() {
            //var element = $(this);
            //var prepopulate = JSON.parse($(this).attr('prepopulate'));
            var url = $(this).attr('autocomplete_url') + '.json';
            var properties = {
            //   'autocomplete_url':url
            };
            $(this).tagsInput(properties);
        });




        var blocks = container.find('.block');

        blocks.not('.grid').not('.listview-block').each(function() {
            $(this).find('tr:last>td').css('border-bottom', '0px');

        });
        //ui-state-highlight
        container.find('.field-tooltip').each(function() {
            if ($(this).is('span') || $(this).is('th')) {
                var iconClass = $(this).attr('icon_class');
                if ($.trim(iconClass) == "") {
                    iconClass = " ui-icon-info ";
                }
                if (iconClass != 'no-icon') {
                    $(this).html("");
                    $(this).addClass('ui-icon ' + iconClass + ' display-inline-block');
                } else {
                    $(this).addClass(' ' + iconClass + ' display-inline-block');
                }
                $(this).wrap('<div class="field-tooltip-container">');
                var title = $(this).attr('title');
                $(this).tooltip({
                    'content': title,
                    'hide': {
                        'duration': parseInt(CONFIG.tooltip_fadeout_duration)
                    }
                });
            } else if ($(this).is('[disabled]')) {
                var position = $(this).position();
                var overlay = $('<div style="position:absolute;width:' + ($(this).width() + 5) + 'px;height:' + ($(this).height() + 5) + 'px;top:' + position.top + 'px;left:' + position.left + 'px;z-index:1000;"></div>');
                $(this).before(overlay);
                overlay.tooltip({
                    'content': $(this).attr('title'),
                    'hide': {
                        'duration': parseInt(CONFIG.tooltip_fadeout_duration)
                    }
                });
                $(this).removeAttr('title').removeClass('field-tooltip');
            } else {
                $(this).tooltip({
                    'hide': {
                        'duration': parseInt(CONFIG.tooltip_fadeout_duration)
                    }
                });
            }
        });

        container.find('.ui-tabs').each(function(){
            $tab=jQuery(this);
            $tab.find(".ui-tabs-anchor").each(function(){
                $tabAnchor=jQuery(this);
                var url=$tabAnchor.attr('url');
                if($tab.find(url).is(":empty")){
                    $tab.find(url).remove();
                   $tabAnchor.parents("li:first").remove();
                }
            });
        });

        /*
        container.find('select:visible').not(".popup-select").each(function(){
            var select2Params={};
            var uiWidgetContent=jQuery(this).closest('.ui-widget-content');
            if(uiWidgetContent.length){
                select2Params.dropdownParent=uiWidgetContent;
            }
            jQuery(this).select2(select2Params);
        });*/

        container.find('textarea[editor="form-builder"]').each(function(){
            $textarea=jQuery(this);
            $textarea.hide();
            var iframe = document.createElement('iframe');
            var iframeID=uuidv4();
            iframe.src = '/node_modules/formBuilder/form-builder.html?uuid='+iframeID;
            iframe.style='height:600px;width:100%;border:none;';
            iframe.id="form-builder-editor-"+iframeID;
            $textarea.after(iframe);
        
            var modelFields=jQuery('[name="data[web_forms][model_fields]"]').val();
            if(modelFields==""){
                modelFields='[]';
            }
            modelFields=JSON.parse(modelFields);
            var formData=$textarea.val();
            if(formData ==""){
                formData='[]';
            }
            formData=JSON.parse(formData);
            var formOptions=JSON.stringify({"controller":jQuery('[name="data[web_forms][controller]"]').val(),"mode":($textarea.is(":disabled")?"render":"edtor"),"modelFields":modelFields,"formData":formData});
            var receiveMessage=function(event) {
                    if(event.data =="init"){
                        iframe.contentWindow.postMessage(formOptions,"*");
                    }else{
                        $textarea.val(event.data);
                    }
            };
            window.addEventListener('message',receiveMessage, true);
        });

        

        container.find('.cell-info-grid').has('.block').not('.mp').css({
            'margin': 0,
            'padding': 0
        });
        //for triggering click on first tab to open the listview on the first tab having class open_on_focus

        var form = container.find('form');
        if (form.length > 0) {
            var reload_triggered_by = form.attr('reload_triggered_by');
            var tabsActive = [];
            if (reload_triggered_by != '') {
                var id = form.find('[name="' + reload_triggered_by + '"]').closest('.ui-tabs-panel').attr('id');
                if (id != "") {
                    tabsActive = form.find('.ui-tabs-anchor').filter('[url=#' + id + ']');
                    if (tabsActive.length > 0) {
                        tabsActive.trigger('click');
                    }
                }
            }
            if(tabsActive.length ==0){
                form.find('.ui-tabs-active').find('a').trigger('click');
            }
        }
        initChart(container);

        if (form.length > 0) {
            if(form.attr('action').indexOf('edit_selected') != -1){
                form.find(':input')
                .not('[type="hidden"]')
                .not('[type="checkbox"]')
                .not('[type="button"]')
                .not('[type="submit"]')
                .not('button')
                .val('');
                form.find(':input').filter('[type="checkbox"]').prop("checked", false );
                form.find('table.listview').remove();

                form.find('span.not_empty').remove();
            }
        }
    }




    /**
     * Initialize form fields for first load of document
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.initFields($('body'));


    /**
     * UUID generator
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

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
    /**
     * Initialize model view
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.jsContainer = function(html, params) {
        log('jsContainer');

        var uuid = $.uu();
        var params = params || {};
        var defaults = {
            autoOpen: false,
            modal: true,
            width: 'auto',
            dialogClass: 'no-close',
            buttons: {},
            
        };
        /*
        show: {
                                effect: "slide",
                                duration: 500,
                                direction: "right"
                            },
                            hide: {
                                effect: "slide",
                                duration: 500,
                                direction: "right"
                            }
        */
        var setting = $.extend(false, defaults, params);
        var pos = $('.ui-dialog:visible').filter(':last').position();
        $("body").append('<div id="' + uuid + '" class="js-container"><span class="content">Records</span></p></div>');
        $("#" + uuid).find(".content").html(html);
        if ($.isset(setting['maxHeight'])) {
            if ($('#' + uuid).height() > setting['maxHeight']) {
                //setting['height']=setting['maxHeight']
            }
        }
        if ($.isset(setting['maxWidth'])) {
            if ($('#' + uuid).width() > setting['maxWidth']) {
                setting['width'] = setting['maxWidth']
            }
        }
        var isChildDialogWindow=$('.ui-dialog:visible').filter(':last').length > 0?true:false;
        if(!isChildDialogWindow && (setting['width']=='auto' || setting['width'] > 700)){
            setting['width'] = $(document).width()-10;
            setting['height'] = $(window).height()-10;
            if(!$.isset(setting['top'])){
                setting['top'] = '0px';
            }
            if(!$.isset(setting['left']) && !$.isset(setting['right'])){
                setting['left'] ='0px';
            }
        }

        setting["close"] = function(event, ui) {
            $('#main-panel').removeClass('passive');
            $(this).dialog('destroy').remove();
        }
        var formObject=$("#" + uuid).find('form');
        if(formObject.length){
            if(formObject.hasClass('height-100px')){
                setting['height']=100;
            }else if(formObject.hasClass('height-200px')){
                setting['height']=200;
            }else if(formObject.hasClass('height-300px')){
                setting['height']=300;
            }else if(formObject.hasClass('height-400px')){
                setting['height']=400;
            }else if(formObject.hasClass('height-500px')){
                setting['height']=500;
            }else if(formObject.hasClass('height-600px')){
                setting['height']=600;
            }
        }
        $("#" + uuid).dialog(setting).dialog('open');
        $('#main-panel').addClass('passive');
        //To remove this hidden property and activate the default property of overflow the changes are made on line number 9519 in jquery-ui.js
        $('body').css('overflow', 'auto');
        if(!isChildDialogWindow && (setting['width']=='auto' || setting['width'] > 700)){
            $('.ui-dialog:visible').filter(':last').css('top', 0+$(document).prop('scrollHeight')).css('left', 0);
        }
        if ($.isPlainObject(pos)) {
            var ld = $('.ui-dialog:visible').filter(':last');
            if(isChildDialogWindow){
                if (ld.width() > 400 && $(document).width() > (pos.left + 30 + ld.width() + 30)) {
                    ld.css('top', pos.top + 30).css('left', pos.left + 30);
                }
            }
        }

        var form_view_href=formObject.attr('form_view_href');
        if(form_view_href){
            var uiDialogTitlebar=$("#" + uuid).closest('.ui-dialog').find('.ui-dialog-titlebar');
            uiDialogTitlebar.append('<a href="'+form_view_href+'" style="color:#ffffff;float:right;margin-right:50px;" ajax=1>Form Editor</a>');
        }

        return uuid;
    };

    /**
     * Serializes form input into object
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.fn.serializeObject = function() {
        log('serializeObject');

        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            }
            else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    /**
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @eg. $.addObserver({"name":"tushar","onChanged":function(url){console.log(this.name+"--->"+url);}});
     */

    $.observers = {};
    $.addObserver = function(key, observer) {
        $.observers[key] = observer;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.notifyObservers = function(url, ignore) {
        var url = $.trim(url);
        var ignore = ignore || [];
        if ($.isset($.observers)) {
            $.each($.observers, function(key, object) {
                if ($.inArray(key, ignore) == -1 && $.isset(object) && typeof object.notify == "function") {
                    object.notify(url);
                }
            });
        }
    }

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */








    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.splitHtmlScript = function(data) {
        log('splitHtmlScript');
        if (typeof data == undefined)
            data = '';
        var html = "";
        var script = "";
        var urls = [];
        try {
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
        } catch (e) {

        }
        return {
            "html": html,
            "script": script,
            urls: urls
        };
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.loadFiles = function(params) {
        log('loadFiles');

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
        } else {
            if (typeof this.settings.oncomplete == "function") {
                this.settings.oncomplete.call(this, this.settings.params);
            }
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.ajax-filter-popup', function(event) {
        var href = $(this).attr('href');
        var searchView = $(this).attr('search_view');
        var _query = $('#' + searchView).attr('_query');
        $.ajaxPopup($(this).attr('ajax', 1), href + '&_query=' + _query);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', ".save-list-record", function(event) {
        var row = $(this).closest('.record-row');
        var primaryKey = row.attr('primary_key');
        var href = row.attr('href');
        if (href.indexOf('/view') !== -1) {
            href = href.replace('/view', '/edit_selected').split('?')[0];
        } else if (href.indexOf('/edit') !== -1) {
            href = href.replace('/edit', '/edit_selected').split('?')[0];
        } else {
            href = href.replace('/index', '/edit_selected').split('?')[0];
        }
        var payload = row.find(':input').serializeObject();
        $.post(href + '?allow_empty_input=1&id=' + primaryKey, payload, function(data) {
            if ($.isset(data)) {
                if (typeof (data) === "object") {
                    showMessage(data);
                }
            }
        });
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', ".click-record-column,[ajax_popup=1],.ajax-popup,.delete,[ajax=1],button[href],.require_confirmation", function(event) {
        log('click -> .click-record-column,[ajax_popup=1],.ajax-popup,.delete,[ajax=1],button[href]');
        if (!$(event.target).hasClass('ignore-click')) {
            if ($(this).hasClass('click-record-column') || $(this).hasClass('ajax-popup') || $(this).hasClass('delete') || $(this).is('[ajax_popup=1]') || $(this).is('[ajax=1]')) {
                if ($(this).hasClass('no-ajax-popup')) {
                    $.ajaxPopup($(this).attr('ajax', 0));
                } else {
                    $.ajaxPopup($(this).attr('ajax', 1));

                }
            } else if ($(this).hasClass('require_confirmation')) {
                $.ajaxPopup($(this));
            } else {
                document.location.href = $(this).attr('href');
            }
            event.stopImmediatePropagation();
            event.stopPropagation();
            return false;

        }
    });
    $(document).on('click', '#controller-action-panel button[href]', function(event) {
        log('click -> #controller-action-panel button[href]');
        document.location.href = $(this).attr('href');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '[name ="data[action][cancel]"]', function(event) {
        log('click -> [name ="data[action][cancel]"]');
        var jscontainer = $(this).closest('.js-container');
        if (jscontainer.length > 0) {
            $('#' + jscontainer.attr('id')).dialog("destroy").remove();
        } else {
            var http_referer = $(this).attr('href');
            if (typeof (http_referer) == 'undefined' || http_referer == "") {
                http_referer = $("#http_referer").val();
                if (http_referer == "") {
                    http_referer = $.config['base'] + $.config['module'] + "/" + $.config['controller'];
                }
                if (http_referer.indexOf('/edit') != -1) {
                    http_referer = http_referer.replace('/edit', '/index');
                }
            }
            document.location.href = http_referer;

        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.buildURL = function(href, part) {
        if (href.indexOf('?') == -1) {
            href += '?';
        }
        $.each(part, function(k, v) {
            if ($.isArray(v)) {
                var vLength = v.length;
                for (var i = 0; i < vLength; i++) {
                    href += '&' + k + '[]=' + v[i];
                }
            }
            else {
                href += '&' + k + '=' + v;
            }
        });
        return href;
    }

    $.deleteRecord = function(object, href, table, overrideMessage) {
        log('deleteRecord');
        if(!$.isset(overrideMessage)){
            overrideMessage='';
        }
        //var href=$(object).attr('href');
        var ajax = $(object).attr('ajax');
        var tr = $(object).closest('tr');
        if (!$.isset(table)) {
            var table = $(object).closest('table.listview');
        }

        var isTree = table.hasClass('tree');
        var twisty = false;
        if (isTree) {
            var active_level = tr.attr('active_level');
            if ($.isset(active_level) && parseInt(active_level) > 0) {
                active_level = parseInt(active_level);
                active_level = active_level - 1;
                tr = tr.prev();
                var level = tr.attr('active_level');
                if (!$.isset(level))
                    level = 0;
                while (parseInt(level) >= active_level) {
                    if (parseInt(level) == active_level) {

                        twisty = (tr.find('.twisty-open').length > 0 ? tr.find('.twisty-open') : (tr.find('.twisty-close').length > 0 ? tr.find('.twisty-close') : false));
                        if (twisty === false) {
                            twisty = (tr.find('.twisty-open-last').length > 0 ? tr.find('.twisty-open-last') : (tr.find('.twisty-close-last').length > 0 ? tr.find('.twisty-close-last') : false));

                        }
                        break;
                    }
                    tr = tr.prev();
                    level = tr.attr('active_level');
                    if (!$.isset(level))
                        level = 0;
                }
            }

        }
        var params = {
            "width": 250 + "px"
        };

        params['href'] = href;
        params['table_id'] = $(table).attr('id');
        params['panel'] = $(object).closest('.panel');

        params['buttons'] = {
            'Yes': function() {
                $(this).dialog('destroy').remove();
                if (href.indexOf('?') == -1) {
                    href += '?';
                }
                href += '&is_confirm=1';
                if(overrideMessage !=''){
                    href += '&override=1';
                }
                if ($.isset(ajax) && ajax == "0") {
                    document.location.href = href;
                } else {
                    $.get(href, function(data) {
                        if (typeof (data) === "object") {
                            if(data.errors.join('').indexOf('it has dependent') != -1){
                                var overrideMessage=data.message.join('. ')+'. <div style="color:#cd0a0a;"><b>Do you still want to override and continue delete?</b></div>';
                                $.deleteRecord(object, href, table, overrideMessage);
                            }else{
                                showMessage(data);
                                if (typeof (data['javascript']) != 'undefined') {
                                    try {
                                        eval(data['javascript']);
                                    } catch (e) {

                                    }
                                }
                                if (twisty !== false) {
                                    if (twisty.hasClass('twisty-open') || twisty.hasClass('twisty-open-last')) {
                                        var tr = $(object).closest('tr');
                                        var al = tr.attr('active_level');
                                        var paginationRow = tr.nextAll('[active_level="' + al + '"]').filter('.pagination-row:first');
                                        if (paginationRow.length > 0) {
                                            paginationRow.find('.active-paginate-link').trigger('click');
                                        } else {
                                            twisty.trigger('click').trigger('click');
                                        }
                                    } else {
                                        twisty.trigger('click');
                                    }
                                } else {
                                    if ($("#" + params['table_id']).length > 0) {
                                        $("#" + params['table_id']).trigger('reload');
                                    } else if (params['panel'].length > 0) {
                                        document.location.href = href.replace('/delete', '/index');
                                    }
                                //find('.active-paginate-link:first').trigger('click');
                                }
                            }
                        }
                    });
                }
            },
            'No': function() {
                $(this).dialog('destroy').remove();
            }
        };

        var confirmationMessage = $(object).attr('confirmation_message');
        if ($.isEmpty(confirmationMessage)) {
            confirmationMessage = 'Do you want to delete';
        }
        if(overrideMessage !=''){
            confirmationMessage=overrideMessage;
        }
        var uuid = $.jsContainer(confirmationMessage, params);

    }
    $.ajaxPopup = function(object, href, table) {
        log('ajaxPopup');
        var method = 'get';
        var payload = {};

        if ($(object).is(':disabled') || $(object).hasClass('ui-state-disabled')) {
            return false;
        }
        if (!$.isset(href)) {
            var href = $(object).attr('href');
        }
        if (!$.isset(href)) {
            var href = $(object).parents(':first').attr('href');
        }
        $(object).triggerHandler('urlParameters');
        var parameters = $(object).data('url_parameters');
        if ($.isset(parameters)) {
            href += (href.indexOf('?') == -1 ? '?' : '');
            if ($.isPlainObject(parameters)) {
                $.each(parameters, function(k, v) {
                    href += '&' + k + '=' + v;
                });
            } else {
                href += '&' + parameters;
            }
        }

        
        if($(object).hasClass('ai-model-search')){
            if(href.indexOf('?') === -1){
                href += "?";
            }
            var uuid = $.uu();
            $(object).attr('id', uuid);
            href += "&trigger="+uuid;
            method = 'post';
            if($(object).closest('form').length){
                var serializeData=$(object).closest('form').serializeObject();
                payload={"form_data":JSON.stringify(serializeData)};
            }
        }

        

        var twisty = false;
        var listviewTableId = false;
        var baseTableID='';
        var form = $(object).closest('form');
        if(form.length){
            var parser = document.createElement("a");
            parser.href = form.attr('action');
            var searchParams=parser.search.substring(1);
            var urlParams={};
            if(searchParams){
                jQuery.each(searchParams.split("&"),function(k,v){
                    var v=v.split("=");
                    if(v.length==2){
                        urlParams[v[0]]=v[1];
                    }
                });
            }
            if(urlParams["search_view"]){
                var tempBaseTable=$('#'+urlParams["search_view"]);
                if (tempBaseTable.hasClass('listview')) {
                    baseTableID =  tempBaseTable.attr('id');
                } else {
                    baseTableID =  tempBaseTable.find('.listview').attr('id');
                }                   
            }
        }

        if (!$.isset(table)) {
            var table = $(object).closest('table');
        }
        var ajax = $(object).attr('ajax');
        var needConfirmation = false;

        // || $(object).hasClass('action')
        var isDeleteAction = false;
        if ($(object).hasClass('delete') || href.indexOf('/delete') != -1) {
            isDeleteAction = true;
        }
        if ($(object).hasClass('sub-action')) {
            var ids = [];
            var uids = [];
            var searchView = $(object).closest('.action-bar').attr('search_view');
            table = $('#' + searchView);
            table.find('.lco').each(function(k, v) {
                if ($(this).is(':checked')) {
                    payload['id[' + k + ']'] = $(this).val();
                    ids.push($(this).val());
                } else {
                    payload['uid[' + k + ']'] = $(this).val();
                //uids.push($(this).val());
                }
            });
            var form_document_id = $(object).closest('form').find('.form_document_id').val();
            var select_all_records_query = parseJSON(decodeURIComponent(table.find('.lca').val()));
            select_all_records_query['fields'] = ["{{MODEL}}.{{PRIMARY_KEY}}"];
            if (document.location.href.indexOf('/_report') == -1) {
                select_all_records_query['view_controller'] = 'core/listviews';
            } else {
                select_all_records_query['view_controller'] = 'analytics/reports';
            }
            select_all_records_query['view_id'] = table.attr('listview_id');
            [   
                "is_default",
                "show_has_many_records",
                "disable_ui_helper",
                "parent_id_model",
                "hide_row_actions",
                "do_not_inherit",
                "sequence",
                "module_id",
                "module_id_model",
                "__module_id",
                "owned_by",
                "owned_by_model",
                "__owned_by",
                "primary_acl_group_model",
                "is_public",
                "method",
                "description",
                "page",
                "reset"
            ].forEach(function(item){
                if(select_all_records_query.hasOwnProperty(item)){
                    delete select_all_records_query[item];
                }
            });

            var select_all_records = $('#select_all_records-' + searchView).find(':checked').length;
            if (isDeleteAction) {
                var buildURLParams={'id': ids,'select_all_records': select_all_records,'q': encodeURIComponent(JSON.stringify(select_all_records_query))};
                if(form_document_id){
                    buildURLParams['related_to']= form_document_id;
                }
                href = $.buildURL(href, buildURLParams);
            } else {
                var buildURLParams={
                    'select_all_records': select_all_records,
                    'q': encodeURIComponent(JSON.stringify(select_all_records_query))
                };
                if(form_document_id){
                    buildURLParams['related_to']= form_document_id;
                }
                href = $.buildURL(href, buildURLParams);
            }
            payload['data[action][reload]'] = "reload";
            payload['data[listview_id]'] = table.attr('listview_id');
            payload['data[listview_data_model]'] = table.attr('model');
            var listview_data_controller=table.attr('href').split('/');
            if(listview_data_controller.length > 2){
                payload['data[listview_data_controller]'] = listview_data_controller[1]+'/'+listview_data_controller[2];
            }
            method = 'post';
        }
        if (isDeleteAction) {
            $.deleteRecord(object, href, table);
            return;
        }
        var isTree = table.hasClass('tree') || table.hasClass('categorized');
        var tr = $(object).closest('tr');


        if (isTree) {
            if ($(object).hasClass('add')) {
                href = href.split('/id:')[0];
                href += '?related_id=' + $(object).closest('tr').attr('primary_key')
                + '&related_model=' + $(object).closest('.listview').attr('parent');
                twisty = (tr.find('.twisty-open').length > 0 ?
                    tr.find('.twisty-open') : (tr.find('.twisty-close').length > 0 ? tr.find('.twisty-close') : false));
                if (twisty === false) {
                    twisty = (tr.find('.twisty-open-last').length > 0 ?
                        tr.find('.twisty-open-last') : (tr.find('.twisty-close-last').length > 0 ? tr.find('.twisty-close-last') : false));

                }
            } else {
                var active_level = tr.attr('active_level');
                if ($.isset(active_level) && parseInt(active_level) > 0) {
                    active_level = parseInt(active_level);
                    active_level = active_level - 1;
                    tr = tr.prev();
                    var level = tr.attr('active_level');
                    if (!$.isset(level))
                        level = 0;
                    while (parseInt(level) >= active_level) {
                        if (parseInt(level) == active_level) {
                            twisty = (tr.find('.twisty-open').length > 0 ? tr.find('.twisty-open') : (tr.find('.twisty-close').length > 0 ? tr.find('.twisty-close') : false));
                            if (twisty === false) {
                                twisty = (tr.find('.twisty-open-last').length > 0 ? tr.find('.twisty-open-last') : (tr.find('.twisty-close-last').length > 0 ? tr.find('.twisty-close-last') : false));
                            }
                            break;
                        }
                        tr = tr.prev();
                        level = tr.attr('active_level');
                        if (!$.isset(level))
                            level = 0;
                    }
                }
            }
        }
        needConfirmation = $(object).hasClass('delete') || $(object).hasClass('require_confirmation');
        if (twisty === false) {
            if (table.hasClass('listview')) {
                listviewTableId = table.attr('id');
            } else {
                listviewTableId = table.find('.listview').attr('id');
            }
            if (listviewTableId === false || $.trim(listviewTableId) == "") {
                var listviews = $('table.listview');
                if (listviews.length == 1) {
                    listviewTableId = listviews.attr('id');
                }
            }
        }


        if (needConfirmation == true) {
            var params = {
                "width": 250 + "px"
            };

            params['href'] = href;
            params['table_id'] = $(object).closest('table.listview').attr('id');
            params['buttons'] = {
                'Yes': function() {
                    $(this).dialog('destroy').remove();
                    if (href.indexOf('?') == -1) {
                        href += '?';
                    }
                    href += '&is_confirm=1';
                    if ($.isset(ajax) && ajax == "0") {
                        document.location.href = href;
                    } else {
                        $[method](href, payload, function(data) {

                            if ($(object).attr('close_dialog') == 1) {
                                $(object).closest('.js-container').dialog("destroy").remove();
                            }
                            
                            if (typeof data == 'object') {
                                $.afterSaveAjaxForm({
                                    'object': object,
                                    'data': data,
                                    'uuid': 'xxx',
                                    'listview_table_id': listviewTableId,
                                    'base_table_id':baseTableID,
                                    'twisty': twisty,
                                    'href': href
                                });
                            } else {
                                $.initAjaxForm({
                                    'object': object,
                                    'data': data,
                                    'listview_table_id': listviewTableId,
                                    'base_table_id':baseTableID,
                                    'twisty': twisty,
                                    'href': href,
                                    'init': true
                                });
                            }
                        });
                    }
                },
                'No': function() {
                    $(this).dialog('destroy').remove();
                }
            };
            var confirmationMessage = $(object).attr('confirmation_message');
            if ($.isEmpty(confirmationMessage)) {
                confirmationMessage = 'Do you want continue';
            }
            var uuid = $.jsContainer(confirmationMessage, params);
        } else {
            if ($.isset(ajax) && ajax == "0") {
                document.location.href = href;
            }
            else {
                $[method](href, payload, function(data) {
                    if ($(object).attr('close_dialog') == 1) {
                        $(object).closest('.js-container').dialog("destroy").remove();
                    }
                    if($(object).hasClass('trigger-live-event')){
                       keep_alive_session_call();
                    }
                    if (typeof data == 'object') {
                        $.afterSaveAjaxForm({
                            'object': object,
                            'data': data,
                            'uuid': 'xxx',
                            'listview_table_id': listviewTableId,
                            'base_table_id':baseTableID,
                            'twisty': twisty,
                            'href': href
                        });
                    } else {
                        $.initAjaxForm({
                            'object': object,
                            'data': data,
                            'listview_table_id': listviewTableId,
                            'base_table_id':baseTableID,
                            'twisty': twisty,
                            'href': href,
                            'init': true
                        });
                    }
                });
            }
        }


    }





    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.initAjaxForm = function(settings) {
        console.log('initAjaxForm');
        var data = settings['data'] || false;
        var listviewTableId = settings['listview_table_id'] || false;
        var baseTableID = settings['base_table_id']||false;
        var twisty = settings['twisty'] || false;
        var href = settings['href'] || false;
        var containerParams = settings['container_params'] || false;
        var object = settings['object'] || false;
        var init = settings['init'] || false;
        var scripts = settings['scripts'] || {};

        var params = {
            "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
            "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
        };

        if ($.isset(containerParams)) {
            params = $.extend(params, containerParams);
        }


        if ($.isset(href)) {
            params['title'] = popupTitle(href);
        }
        if (object !== false && $(object).hasClass('close-dialog')) {
            $(object).closest('.js-container').dialog("destroy").remove();
        }

        var uuid = $.jsContainer(data, params);
        //@tushar Takkar: Load files and eval script once dom is created.
        $.loadFiles({
            files: (typeof (scripts.urls) != "undefined" ? scripts.urls : []),
            params: (typeof (scripts.script) != "undefined" ? scripts.script : ""),
            oncomplete: function(script) {
                if ($.trim(script) != "") {
                    eval(script);
                }
            }
        });
        //@tushar Takkar: Once form is initialized, then invoke plugins.
        $.initFields($('#' + uuid), init);

        var form = $('#' + uuid).find('form:first');
        form.find('[type="submit"]').addClass('ajax-popup-form');
        //if form has file input, activate iframe form submit
        var frame = false;
        if (form.find('input[type="file"]').length > 0 || form.hasClass('iframe')) {
            frame = $.uu();
        }
        if (frame !== false) {
            $('body').append('<iframe name="' + frame + '" id="' + frame + '"  style="display:none" ></iframe>');
            form.attr('target', frame);
            var action = form.attr('action');
            form.attr('action', action + (action.indexOf('?') == -1 ? '?ajax=1' : '&ajax=1'));
        }
        //else use post to submit
        var should_validate = (typeof (settings.href) != 'undefined' && settings.href.split('?')[0].indexOf('edit_selected') == -1) ? true : false;
        console.log({should_validate:should_validate});
        if (frame !== false) {
            form.submit(function(event) {
                var form = $(this);
                jQuery(this).find('.not-empty-input').attr('REQUIRED','REQUIRED');
                // Validation on form submit
                if (should_validate === true) {
                    if (!form.valid()) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
                if (form.find('[name="data[forms][properties][formula]"]').length > 0) {
                    form.find('[name="data[forms][properties][formula]"]').val(form.find('[name="data[forms][properties][formula]"]').val().replace(/"/g, '&quot;'));
                }
                $("#ajax-loader").show();

                setTimeout(function() {
                    form.find('[type="submit"]').disable();
                }, 100);
                form.find('.grid-template-row').remove();
                $('#' + frame).one('load', function() {
                    var contents = $('#' + frame).contents().find('body').html();
                    //log(contents);

                    var tags = ['pre', 'textarea'];
                    for (var kkk = 0; kkk < tags.length; kkk++) {
                        var tag = '<' + tags[kkk] + '>';
                        //log(contents.substring(0, (tag.length)));
                        //log(contents.substring(contents.length-tag.length-1));
                        if (contents.substring(0, tag.length) == tag) {
                            contents = contents.substring(tag.length, contents.length - tag.length - 1);
                            break;
                        }
                    }
                    log(contents);
                    contents = html_entity_decode(contents);
                    var contentsObj = parseJSON(contents);

                    if (typeof (contentsObj) === "object") {
                        contents = contentsObj;
                    } else if (contents.substring(0, 1) == '{' && contents.substring(contents.length - 1) == "}") {
                        contents = "";
                    }

                    if (contents == "") {
                        contents = {};
                    }
                    $("#ajax-loader").hide();
                    $.afterSaveAjaxForm({
                        'object': object,
                        'data': contents,
                        'uuid': uuid,
                        'listview_table_id': listviewTableId,
                        'base_table_id':baseTableID,
                        'twisty': twisty,
                        'href': href
                    });
                    $('#' + frame).remove();

                });
            });
        } else {
            form.find('[type="submit"]').click(function(event) {
                var form = $(this).closest('form');
                form.find('.not-empty-input').attr('REQUIRED','REQUIRED');
                // Form Validation befor submit
                if (should_validate === true) {
                    if (!form.valid()) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
                if (form.find('[name="data[forms][properties][formula]"]').length > 0) {
                    form.find('[name="data[forms][properties][formula]"]').val(form.find('[name="data[forms][properties][formula]"]').val().replace(/"/g, '&quot;'));
                }
                var data = $(form).serializeObject();
                data[$(this).attr('name')] = $(this).val();
                setTimeout(function() {
                    form.find('[type="submit"]').disable();
                }, 100);

                /*
                 form.find('[type="submit"]')
                 .click(function(event){
                 event.stopPropagation();
                 event.preventDefault();
                 return false;
                 }).disable(true);
                 */
                form.find('.grid-template-row').remove();
                $.post($(form).attr('action').replace('?ajax=1', '?').replace('&ajax=1', ''), data, function(data) {
                    $.afterSaveAjaxForm({
                        'object': object,
                        'data': data,
                        'uuid': uuid,
                        'listview_table_id': listviewTableId,
                        'base_table_id':baseTableID,
                        'twisty': twisty,
                        'href': href
                    });
                });
                event.stopPropagation();
                return false;
            });
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.afterSaveAjaxForm = function(settings) {
        console.log('afterSaveAjaxForm');
        var data = settings['data'] || false;
        var listviewTableId = settings['listview_table_id'] || false;
        var baseTableID = settings['base_table_id']||false;
        var uuid = settings['uuid'] || false;
        var twisty = settings['twisty'] || false;
        var href = settings['href'] || false;
        var containerParams = settings['container_params'] || false;
        var object = settings['object'] || false;


        if(jQuery(object).hasClass('on_click_reload_form')){
            console.log('click -> on_click_reload_form');
            var form = jQuery(object).closest('form');
            form.validate().currentForm = '';
            var button = form.find('input[name="data[action][reload]"]:first');
            if (button.length == 0) {
                form.prepend('<input type="hidden" name="data[action][reload]" value="' + jQuery(object).attr('name') + '" >');
            } else {
                button.val(jQuery(object).attr('name'));
            }
            var button = form.find('[type="submit"]:first');
            if (button.length == 0) {
                form.prepend('<input type="submit" name="submit" style="display:none;">');
                button = form.find('[type="submit"]:first');
            }
            button.trigger('click');
            return false;
        }


        if ($.isset(uuid))
            $('#' + uuid).dialog("destroy").remove();
        if ($.isset(data)) {
            if (typeof (data) === "object") {

                if (typeof (data['refreash_paginate_link']) != 'undefined') {
                    var refreash_paginate_link=[];
                    if(typeof (data['refreash_paginate_link']) == "string"){
                        refreash_paginate_link.push(data['refreash_paginate_link']);
                    }else{
                        refreash_paginate_link=data['refreash_paginate_link'];
                    }
                    if(jQuery.isArray(refreash_paginate_link)){
                        jQuery.each(refreash_paginate_link,function(k,refreash_paginate_linkv){
                            if(refreash_paginate_linkv.indexOf('/') !== -1){
                                jQuery('.active-paginate-link').each(function(){
                                    var activePaginateLink=jQuery(this).attr('href');
                                    if(activePaginateLink){
                                        if(activePaginateLink.indexOf(refreash_paginate_linkv) != -1){
                                            jQuery(this).trigger("click");
                                        }
                                    }
                                });
                            }
                        });
                    }
                }

                if (typeof (data['redirect_to_url']) != 'undefined') {
                    var uid = $.uu();
                    $('body').append('<a href="' + data['redirect_to_url'] + '" id="' + uid + '" style="display:none;" class="ajax-popup">Next Action</a>')
                    $('#' + uid).trigger('click');
                    return;
                }

                if (typeof (data['javascript']) != 'undefined') {
                    try {
                        eval(data['javascript']);
                    } catch (e) {

                    }
                }
                showMessage(data);
                if (typeof data['reload'] !== undefined && data['reload'] !== null && data['reload'] == false) {
                    $(object).attr('reload', 0);
                } else if ($.isset(twisty) && twisty !== false) {
                    var tr = twisty.closest('tr');
                    var active_level = tr.attr('active_level');

                    var paginationRow = false;
                    if ($.isset(active_level) && active_level > 0) {
                        active_level = parseInt(active_level);
                        active_level = active_level + 1;
                        tr = tr.next();
                        var level = tr.attr('active_level');
                        if (!$.isset(level))
                            level = 0;
                        while (parseInt(level) >= active_level) {
                            if (parseInt(level) == active_level && tr.hasClass('pagination-row')) {
                                paginationRow = tr.find('.active-paginate-link:first');
                                if (paginationRow.length <= 0) {
                                    paginationRow = false;
                                }
                                break;
                            }
                            tr = tr.next();
                            level = tr.attr('active_level');
                            if (!$.isset(level))
                                level = 0;
                        }
                    }

                    if (paginationRow !== false) {
                        paginationRow.click();
                    } else {
                        if (twisty.hasClass('twisty-open') || twisty.hasClass('twisty-open-last')) {
                            twisty.trigger('click').trigger('click');
                        } else {
                            twisty.trigger('click');
                        }
                        var listview = twisty.closest('.listview');
                        var model = listview.attr('model');
                        if (typeof data['data'] != undefined && data['data'] != null && typeof data['data'][model] != undefined && typeof data['data'][model]['parent_id'] != undefined) {
                            var ptc = listview.find("tr[primary_key=" + data['data'][model]['parent_id'] + "]");
                            var ptwisty = false;
                            ptwisty = ptc.find('.twisty-open');
                            if (ptwisty.length == 0) {
                                ptwisty = ptc.find('.twisty-open-last');
                            }
                            if (ptwisty.length > 0) {
                                ptwisty.trigger('click').trigger('click');
                            } else {
                                ptwisty = ptc.find('.twisty-close');
                                if (ptwisty.length == 0) {
                                    ptwisty = ptc.find('.twisty-close-last');
                                }
                                if (ptwisty.length > 0) {
                                    ptwisty.trigger('click');
                                }
                            }
                        }
                    }
                } else if ($.isset(listviewTableId) && listviewTableId != false) {
                    $("#" + listviewTableId).trigger('reload');
                } else if ($.isset(baseTableID) && baseTableID != false) {
                    $("#" + baseTableID).trigger('reload');
                }

                $(object).trigger('request_end');

            } else {
                var a = $.splitHtmlScript(data);
                $.initAjaxForm({
                    'object': object,
                    'data': a.html,
                    'listview_table_id': listviewTableId,
                    'base_table_id':baseTableID,
                    'twisty': twisty,
                    'href': href,
                    'scripts': a
                });

            }
        }
    }

    $(document).on('reload', '.listview', function() {
        log('reload -> .listview');

        var active_paginate_link = $(this).find('.active-paginate-link:first');
        if (active_paginate_link.length > 0) {
            active_paginate_link.trigger('click');
        } else {
            active_paginate_link = $(this).attr('active_paginate_link');
            if (!$.isEmpty(active_paginate_link)) {
                $(this).find('th:first').append('<a href="' + active_paginate_link + '" class="active-paginate-link ui-helper-hidden">reload</a>');
                $(this).find('.active-paginate-link:first').trigger('click');
            }
        }
    });
    $(document).on('request_end', '.ui-button[ajax=1]', function() {
        log('request_end -> .ui-button[ajax=1]');
        if ($(this).attr('reload') != 0) {
            var actionMenu = $(this).closest('[search_view]');
            if (actionMenu.length > 0) {
                $('#' + actionMenu.attr('search_view')).trigger('reload');
            }
        } else {
            $(this).removeAttr('reload');
        }
    });


    /*
     *	@author	tushar takkar
     *	@todo
     *	@access public
     *	@param .
     *	@return
     *	@internal . This function is use to get list of all attributes of note as a javascript object.
     */
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
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    function resizeHomePanel() {
        log('resizeHomePanel');

        var homePanelWidth = $('.home-panel').width() / 3;
        homePanelWidth = homePanelWidth - 10;
        $('.home-panel').find('td').each(function() {
            $(this).width((homePanelWidth * $(this).attr('colspan')));
        });

        $('.home-content-container').each(function() {
            var width = $(this).parents(':first').width();
            $(this).width(width - 5);
            $(this).find('div:first').width(width - 5);
        });
    }
    //resizeHomePanel();


    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    //initChart($(document));

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */



    $(document).on('click', '.grid-row-up', function(event) {
        log('click -> .grid-row-up');
        var grid = $(this).closest('.grid');
        var tr = $(this).closest('.last-data-row');
        if (!tr.prev().hasClass('grid-template-row')) {
            tr.prev().before(tr);
            gridSequence(grid);
            grid.trigger('row_moveup');
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.grid-row-down', function(event) {
        log('click -> .grid-row-down');
        var grid = $(this).closest('.grid');
        var tr = $(this).closest('.last-data-row');
        if (!tr.next().hasClass('grid-action-row')) {
            tr.next().after(tr);
            gridSequence(grid);
            grid.trigger('row_movedown');
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
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
        log('click -> .grid-row-delete');
        var grid = $(this).closest('.grid');
        var min = grid.attr('min');
        var tr = $(this);
        if (!isNaN(min)) {
            if ((gridRows(grid) <= min)) {
                $.jsContainer('<span>Minimum number of allowed rows are ' + min + '</span>');
                return;
            }
        }
        var primary = tr.find(".primary:first").val();
        if (!$.isset(primary) || primary == '') {
            tr.remove();
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

    //$(document).on('grid_row_add', '.grid', function(event) {
    //    $(this).find('.grid-row-add:first').triggerHandler('click');
    //});

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

    $(document).on('grid_row_add', '.grid', function(event,data) {
        var grid = $(this);
        console.log(data);
        var gridId = grid.attr('id');
        var max = grid.attr('max');
        if (!isNaN(max)) {
            if (!(gridRows(grid) < max)) {
                $.jsContainer('<span>Maximum number of allowed rows are ' + max + '</span>');
                return;
            }
        }
        var count = $('#row_counter_' + gridId).val();
        if (count == null) {
            count = -1;
        }
        count++;

        $('#row_counter_' + gridId).val(count);
        var after = {};
        if (grid.find('.last-data-row:last').length > 0) {
            after = grid.find('.last-data-row:last')
        } else {
            after = grid.find('.grid-template-row:last');
        }
        var clone = grid.find('.grid-template-row').clone(true).removeClass('grid-template-row')
        .addClass('last-data-row')
        .find(':input').each(function() {

            var name = $(this).attr('name');
            var id = $(this).attr('id');
            if (name != null && name != '') {
                $(this).attr('name', name.replace('[_X_]', '[' + count + ']'))
                .removeAttr('disabled').filter('[is_disabled="1"]')
                .attr('disabled', 'disabled');
            }
            if (id != null && id != '') {
                $(this).attr('id', id.replace('_X_', '' + count + ''));
            }
            $(this).attr('grid_row_number', count);
            $(this).removeClass('template-element');

        }).end().insertAfter(after);
        $.initFields(grid.find('.last-data-row:last').show());
        gridSequence(grid);
        //$.initFields(clone);
        grid.trigger('row_add');
        if (grid.attr('trigger_change') != 0) {
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });


    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    function gridSequence(grid) {
        log('gridSequence');

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
        log('gridRows');

        var count = 0;
        grid.find('.last-data-row').each(function(i, k) {
            if ($(this).find(".deleted:first").val() != 1) {
                count++;
            }
        });
        return count;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.continuous-paginate').scroll(function(event) {
        log('continuous-paginate');
        var scrollHeight = $(this).get(0).scrollHeight;
        var scrollTop = $(this).scrollTop();
        var href = $(this).attr('href');
        var is_paging = $(this).attr('is_paging');
        var scroll = $(this);
        if (is_paging != null && is_paging == 1)
            return;
        if (scrollHeight - scrollTop > 600) {
            return;
        } else {
            if (href == '')
                return;
            scroll.attr('is_paging', 1);
            href = href.split('/page:');
            var param = href[1].split('?');
            var page = (parseInt(param[0]) + 1);
            href = href[0] + '/page:' + page + '?' + param[1];
            scroll.find('.pagination-row > td').append('&nbsp;<a class="continuous-paginate-link" href="#">' + page + '</a>&nbsp;');
            $.get(href, function(data) {
                var data = $(data);
                scroll.attr('href', data.attr('href'));
                data.find('.listview:first').find('.record-row').addClass('continuous-page-' + page).insertBefore(scroll.find('.listview:first').find('tr:last'));
                scroll.attr('is_paging', 0);
            });
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.continuous-paginate-link', function(event) {
        log('click -> .continuous-paginate-link');
        var continuousPaginate = $(this).closest('.continuous-paginate');
        var page = parseInt($(this).text());
        var scrollTop = continuousPaginate.find('.continuous-page-' + page).position();
        scrollTop = Math.ceil(scrollTop['top']) - 200;
        continuousPaginate.scrollTop(scrollTop);

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    //$('#calculator').calculator({showOn: 'focus'});

    $("#reset-current-filter").click(function(event) {
        log('#reset-current-filter');

        $('#current-filter-id').val('');
        $('#current-filter').val('');

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });



    $('#data-current_listview').change(function() {
        document.location.href = $.config['base'] + $.config['module'] + '/' + $.config['controller'] + '/index?current_listview=' + $(this).val();
    });

    $(document).on('change', '[on_change_reload_form=1]', function(event) {
        log('change -> [on_change_reload_form=1]');

        if($(this).val() != ""){
            var form = $(this).closest('form');
            // preventing form jquery form validation 
            form.validate().currentForm = '';
            var button = form.find('input[name="data[action][reload]"]:first');
            if (button.length == 0) {
                form.prepend('<input type="hidden" name="data[action][reload]" value="' + $(this).attr('name') + '" >');
            } else {
                button.val($(this).attr('name'));
            }
            var button = form.find('[type="submit"]:first');
            if (button.length == 0) {
                form.prepend('<input type="submit" name="submit" style="display:none;">');
                button = form.find('[type="submit"]:first');
            }

            if (button.hasClass('ajax-popup-form')) {
                button.trigger('click');
            //button.triggerHandler('click');
            } else {
                button.trigger('click');
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $('.no-enter-submit').bind('keypress', function(event) {
        if (event.which == 13)
            event.preventDefault();
    });


    $(document).on('keypress', '.search_basic_view_set', function(event) {
        log('keypress -> .search_basic_view_set');

        if (event.which == 13) {
            event.preventDefault();
            $(this).parents(':first').find('.search_trigger').trigger('click');
        }
    });

    initMessagePanel();

    $(document).on('click', '.ui-tabs-anchor', function(event) {
        log('click -> .ui-tabs-anchor');
        $($(this).attr('href')).find('.show-dashboard-listview').trigger('click');
    });

    $(document).on('click', '.ui-tabs-anchor', function(event) {
        log('click -> .ui-tabs-anchor');

        $($(this).attr('href')).find('iframe.auto-resize-iframe').each(function(){
            autoResizeIframe(jQuery(this).get(0));
        });

        $($(this).attr('href')).find('.show-listview').each(function() {
            if ($(this).hasClass('open_on_focus')) {
                $(this).closest('fieldset').find('.collapsible').trigger('click');
            }
        });
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });


    $(document).on('click', '.collapsible', function(event) {
        log('click -> .collapsible');
        var block = '';
        if ($(this).parents('legend').length > 0) {
            block = $(this).closest('fieldset').find('.block:first');
            if (block.length == 0) {
                block = $(this).closest('fieldset').find('div:first');
            }
        } else {
            block = $(this).closest('.block');
        }

        if ($(this).hasClass('ui-icon-circle-plus')) {
            $(this).removeClass('ui-icon-circle-plus')
            .addClass('ui-icon-circle-minus');
            if (block.is('div')) {
                block.removeClass('collapsible-hide').show().find('.show-listview').trigger('click')
            } else {
                block.find('tr:first').parents(':first').children('tr.collapsible-hide').removeClass('collapsible-hide').show().end().find('.show-listview').trigger('click');
            }
            block.find('[editor="WYSIWYG"]').not('.template-element').each(function() {
                var editor = $(this).cleditor()[0];
                editor.refresh();
            });
        } else {
            $(this).removeClass('ui-icon-circle-minus').addClass('ui-icon-circle-plus');
            if (block.is('div')) {
                block.addClass('collapsible-hide').hide();
            } else {
                block.find('tr:first').parents(':first').children('tr:visible').not('.block-header').addClass('collapsible-hide').hide();
            }

        }
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    setTimeout(function() {
        $('.sub-listview .twisty-close,.sub-listview .twisty-close-last').trigger('click');

    }, CONFIG['delay_load_left_panel']);

    $(document).on('click', '.search-row-trigger', function(event) {
        log('click -> .search-row-trigger');
        var searchRow = $(this).closest('.listview').find('.search-row:first');
        if (searchRow.is(':visible')) {
            searchRow.hide();
        } else {
            searchRow.show();
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.erase_search_inline_column', function(event) {
        log('click -> .erase_search_inline_column');
        $(this).parents('.search_inline_table').find('.search_inline_column').val('');


        var table = $(this).closest('.listview');
        var col = $(this).closest('.search_inline_table').find('.search_inline_column');
        var searchInline = [];
        var name = extractName(col.attr('name'));
        searchInline.push({
            'column': col.attr('name'),
            'value': col.val()
        });
        $.listviewSearch(table, {
            'search_inline': searchInline //,'reset':1
        });



        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.load-listviews a', function(event) {
        log('click -> .load-listviews a');
        document.location.href = $.config['base'] + $.config['module'] + "/" + $.config['controller'] + '/index?current_listview=' + $(this).closest('tr').attr('primary_key');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.load-reports a', function(event) {
        log('click -> .load-reports a');
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('propertychange keyup input paste', '.data_field', function() {
        var io = $(this).val().length ? 1 : 0;
        $(this).next('.icon_clear').stop().fadeTo(300, io);
    }).on('click', '.icon_clear', function() {
        $(this).delay(300).fadeTo(300, 0).prev('input').val('');
    });

    /**
     * To make the "Click here" shown in form validations failure go to the desired field
     * @author Shubham Singh<ssingh@primarymodules.com>
     * @link https://github.com/primod/maax/issues/583
     * @since 2013-12-28
     * @internal
     *  1. Intercept event and get the id of element to be focussed
     *  2. If its a hidden field append __ before the id
     *  3. Find index of the tab which should be focussed before focussing the field
     *  4. Now trigger click on that tab li element
     *  5. At last focus the field because it is now shown and not hidden
     */
    $(document).on('click', '.error-element-anchor', function(event) {
        // id of element to be focussed
        var elementID = '';
        if ($(this).attr("href")) {
            elementID = $(this).attr("href");
        }
        if (elementID != '') {
            // in case element was not found or is a hidden field try using __ before field name because it can be a hidden field
            if ($(elementID).length === 0 || $(elementID).attr("type") === "hidden") {
                elementID = elementID.split('-');
                elementID[elementID.length - 1] = "__" + elementID[elementID.length - 1];
                elementID = elementID.join("-");
            }
            elementID = $(elementID);
            var index = elementID.closest('.ui-tabs-panel').index() - 1;
            elementID.closest('.tab').find('.ui-tabs-nav:first').find('li:eq(' + index + ')').find('a').trigger('click');
            // now focus the field as it is exposed now
            elementID.focus();
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    /**
     * To make the "Click here" vanish once the user clicks on it
     * @author Shubham Singh<ssingh@primarymodules.com>
     * @link https://github.com/primod/maax/issues/583
     * @since 2014-09-01
     * @internal
     *  1. Intercept event and get the closest anchor
     *  2. If the click is on that anchor add the style for vanishing the message
     */
    $('.message-panel-container').find('#message-panel').click(function(event) {
        if (
            typeof ($(event.target)["context"]) != "undefined"
            &&
            typeof ($(this).closest("a")["context"]) != "undefined"
            )
            {
            if ($(event.target)["context"] != $(this).closest("a")["context"])
            {
                $(this).attr("style", "display:none;");
            }
        }
    });

    $(document).on('click', '.go_to_prev_page', function() {
        $(this).closest('form').find('.page-body').hide().end().find('.page-action').hide().end().end().closest('.page').prev().find('.page-body').show().end().find('.page-action').show();
    });
    $(document).on('click', '.go_to_next_page', function() {
        $(this).closest('form').find('.page-body').hide().end().find('.page-action').hide().end().end().closest('.page').next().find('.page-body').show().end().find('.page-action').show();
    });
    
    $(document).on('click','.compute-file-diff',function(event){
        var url=$(this).attr('url'); 
        var diff=$(this).closest('.diff-container').find('#diff').load(url);
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    $(document).on('click','.action-comet',function(event){
        var url=$(this).attr('url');
        //var comet=$(this).attr('comet')
        var diff=$(this).closest('form').next('iframe').attr('src',url);
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });

    if($.config["subview"]){
        $('body').append('<a id="tigger-subview" class="ajax-popup" href="'+$.config["subview"]+'"  ajax=1 style="display:none;" >&nbsp;<a>');
        $("#tigger-subview").trigger("click");
    }
    
    
});

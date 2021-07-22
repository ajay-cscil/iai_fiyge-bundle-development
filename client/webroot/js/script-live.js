/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function getString(arr){
    if(typeof arr =='string'){
        return arr;
    }
    else{
        var str='';
        for(var i in arr){
            str += ' '+i+'="'+arr[i]+'"';
        }
        return str;
    }
    return '';
}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function showError(msg){
    var message="";
    if(typeof msg =='object' ){
        if($.isArray(msg)){
            for(var i=0;i< msg.length ;i++){
                message += "<li >"+msg[i]+"</li>";
            }
            if(i > 1){
                message = "<ol style='text-align:left;' class='ui-state-error-text'>"+message+"</ol>";
                $.jsContainer(message,{
                    height:300,
                    width:400
                });
            }else{
                message=msg.pop();
                var titlebar= $('.ui-dialog-title');
                if(titlebar.length > 0){
                    if($(titlebar).next().hasClass('title-message-panel') == false){
                        $(titlebar).after('<span class="title-message-panel"></span>');
                    }
                    var next=$(titlebar).next();
                    next.html(message);
                    var bodyWidth=titlebar.closest('.ui-dialog-titlebar').width();
                    var ajaxLoaderWidth=next.width();
                    var ajaxLoaderLeft=(bodyWidth-ajaxLoaderWidth-titlebar.width())/2;
                    next.css({
                        "left":ajaxLoaderLeft,
                        "position":"relative"
                    }).show().removeClass('ui-state-highlight')
                    .addClass('ui-state-error').delay(4000).hide('highlight', {}, 1000 );
                }
                else{
                    $("#message-panel").removeClass('ui-helper-hidden').removeClass('ui-state-highlight')
                    .addClass('ui-state-error').html(message).show().delay(4000).hide('highlight', {}, 1000 );
                }
            }

        }else{
            $.each(msg,function(k,v){
                for(var i=0;i< v.length ;i++){
                    message += "<li>"+v[i]+"</li>";
                }
            });
            message = "<ol style='text-align:left;' class='ui-state-error-text'>"+message+"</ol>";
            $.jsContainer(message,{
                height:300,
                width:400
            });
        }

    }else{
        message=msg;
        $("#message-panel").removeClass('ui-helper-hidden').removeClass('ui-state-highlight')
        .addClass('ui-state-error').html(message).show().delay(4000).hide('highlight', {}, 1000 );

    }

}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function showMessage(response){
    if(typeof response !='object' || !$.isset(response)){
        return ;
    }

    if($.isset(response.errors) && !$.isEmpty(response.errors) ){
        showError(response.errors);
    }else if($.isset(response.message)  && !$.isEmpty(response.message) ){
        var msg=response.message;
        var message='';
        if($.isArray(msg) ){
            var length=msg.length;
            for(var i=0; i < length ; i++){
                message +=msg[i]+'<br />';
            }
        }else{
            message +=msg;
        }
        if($.isArray(msg) && msg.length > 1){
            $.jsContainer(message,{
                height: 300,
                width:400
            });
        }else{
            var titlebar= $('.ui-dialog-title');
            if(titlebar.length > 0){
                if($(titlebar).next().hasClass('title-message-panel') == false){
                    $(titlebar).after('<span class="title-message-panel"></span>');
                }
                var next=$(titlebar).next();
                next.html(message);
                var bodyWidth=titlebar.closest('.ui-dialog-titlebar').width();
                var ajaxLoaderWidth=next.width();
                var ajaxLoaderLeft=(bodyWidth-ajaxLoaderWidth-titlebar.width())/2;
                next.css({
                    "left":ajaxLoaderLeft,
                    "position":"relative"
                }).show().removeClass('ui-state-error')
                .addClass('ui-state-highlight').delay(4000).hide('highlight', {}, 1000 );
            }else{
                $("#message-panel").removeClass('ui-helper-hidden').removeClass('ui-state-error')
                .addClass('ui-state-highlight').html(message).show().delay(4000).hide('highlight', {}, 1000 );
            }
        }
    }

}
function parseJSON(string){
    var json='';
    try{
        json=JSON.parse(string);
    }
    catch(e){

    }
    return json;
}
function initMessagePanel(){
    $("#message-panel:visible").show().delay(4000).hide('highlight', {}, 1000 );
}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function hideMessage(){
    $("#message-panel").addClass('ui-helper-hidden').html('');
}
function addThemeRoller(){
    if (!/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
        alert('Sorry, this tool only works in Firefox');
        return false;
    };
    if(window.jquitr){
        jquitr.addThemeRoller();
    } else{
        jquitr = {};
        jquitr.s = document.createElement('script');
        jquitr.s.src = $.config['base']+'js/themeroller.js';
        document.getElementsByTagName('head')[0].appendChild(jquitr.s);
    }
}
function extractName(name){
    name=name.replace(/[\[\]]/g,':').split(':');
    if(name[(name.length-1)]==''){
        name= name.slice(0,-1);
    }
    return name;
}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
jQuery('document').ready(function($){
    /**
     * check if variable defined
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @param mixed variable
     * @return boolean true/false
     */
    $.isset=function(variable){
        return (typeof variable != 'undefined' && variable != 'undefined');
    };
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.ucWords=function(str) {
        // split string on spaces
        var arrStr = str.split(" ");

        var strOut ="";

        for (var i=0,length=arrStr.length;i<length;i++){
            // split string
            var firstChar = arrStr[i].substring(0,1);
            var remainChar = arrStr[i].substring(1);

            // convert case
            firstChar = firstChar.toUpperCase();
            remainChar = remainChar.toLowerCase();

            strOut += firstChar + remainChar + ' ';
        }

        // return string, but drop the last space
        return strOut.substring(0, strOut.length - 1);
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.ccWords=function(str) {
        // split string on spaces
        var arrStr = str.split(" ");

        var strOut =arrStr[0].toLowerCase();

        for (var i=1,length=arrStr.length;i<length;i++){
            // split string
            var firstChar = arrStr[i].substring(0,1);
            var remainChar = arrStr[i].substring(1);

            // convert case
            firstChar = firstChar.toUpperCase();
            remainChar = remainChar.toLowerCase();

            strOut += firstChar + remainChar + ' ';
        }

        // return string, but drop the last space
        return strOut.substring(0, strOut.length - 1);
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */


    $.getConfig=function(key,value){
        value=($.isset(value)?value:"");
        keys=key.split(".");
        return $.getValue(keys,value,$.projectConfiguration);
    }

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.getValue=function(path,value,data){
        var value=value || "";
        var requiredValue=data;
        $.each(path,function(k,v){
            if(!$.isset(requiredValue[v])){
                return value;
            }else{
                requiredValue=requiredValue[v];
            }
        });
        return requiredValue;
    }

    $.mergeAll=function(arguments){
        var data={
            'array':[],
            'object':{}
        };
        var length=arguments.length;
        for(var i=0; i < length; i++){
            if($.isPlainObject(arguments[i])){
                data['object']=$.extend(true,data['object'],arguments[i]);
            }else{
                data['array']=$.merge(data['array'],arguments[i]);
            }
        }
        var objectEmpty=$.isEmpty(data['object']);
        var arrayEmpty=$.isEmpty(data['array']);
        if(!objectEmpty && !arrayEmpty){
            data['object'][0]=data['array'];
            return data['object'];
        }else if(!objectEmpty){
            return data['object'];
        }else if(!arrayEmpty){
            return data['array'];
        }
        return {};
    }

    $.fn.disable = function() {
        return this.addClass('ui-state-disabled').attr('disabled','disabled').filter('[button]').addClass('ui-button-disabled');
    }

    $.fn.enable = function() {
        return this.removeClass('ui-state-disabled').removeClass('ui-button-disabled').removeAttr('disabled');

    }

    $.string_repeat=function(string,multiplier){
        for(var i=0 ; i < multiplier; i++){
            string += string;
        }
        return string;
    }

    /**
     * Initialize default ajax loader.
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $("body").append('<div id="ajax-loader" class="ui-state-highlight" style="display:none;z-index:100002">Loading...</div>');
    var bodyWidth=$("body").width();
    var ajaxLoaderWidth=$("#ajax-loader").width();
    var ajaxLoaderTop=1;
    var ajaxLoaderLeft=(bodyWidth/2)-(ajaxLoaderWidth/2);
    var ajaxLoaderCounter=0;
    $("#ajax-loader").css({
        "top":ajaxLoaderTop,
        "left":ajaxLoaderLeft,
        "position":"fixed"
    })
    .ajaxStart(function(){
        $.showLoader();
    })
    .ajaxStop(function(){
        $.hideLoader();
    });
    $.showLoader=function (stat){
        if($.isset(stat))
            ajaxLoaderCounter +=stat;
        var obj=$("#ajax-loader");
        $(obj).html('Loading...').show();
        setTimeout(function(){
            if(obj.is(':visible')){
                obj.html('Still Loading...');
            }
        },3000);
    }
    $.hideLoader=function(stat){
        if($.isset(stat))
            ajaxLoaderCounter -= stat;

        if(ajaxLoaderCounter <= 0){
            $("#ajax-loader").hide();
        }
    }
    $(document).ajaxError(function(e, xhr, settings, exception) {
        var responseText=xhr.responseText;
        if(typeof responseText =='string' && $.isEmpty(responseText)){
            showMessage('Your request could not be processed');
        }else{
            if(typeof responseText == 'string'
                && responseText.indexOf('{"errors"') == -1
                && responseText.indexOf('{"message"') == -1
                ){
                var data=$(responseText);
                $.initAjaxForm({
                    'data':data,
                    'listview_table_id':false,
                    'twisty':false,
                    'href':$(data).attr('action')
                });
            }else{
                if(typeof responseText != 'object'){
                    responseText=parseJSON(responseText);
                }
                showMessage(responseText);
            }
        }
    });

    /**
     * implement bulk select in listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $('.lco').live('click',function(){
        if($(this).is(':checked')){
            $.setActionMenu(this,'active');
        }else if($(this).closest('.listview').find('.lco:checked').length ==0) {
            $.setActionMenu(this,'inactive');
        }
    });
    $(".lca").live('click',function(){
        var index= $(this).closest('td').index();
        var listview=$(this).closest('.listview');
        var checkboxes=listview.find('.lco');

        $('#select_all_records-'+listview.attr("id")).remove();
        if($(this).is(':checked')){
            checkboxes.attr('checked','checked');
            $.setActionMenu(this,'active',true);
            listview.before('<div class="all-records-selection ui-state-default" id="select_all_records-'+listview.attr("id")+'"><input name="select_all_records" type="checkbox" value="1">'+listview.attr("select_all_label")+'</div>');
        }else{
            checkboxes.removeAttr('checked');
            $.setActionMenu(this,'inactive',false);
        }
    });
    $.setActionMenu=function(obj,action){
        var searchView=$(obj).closest('.listview').attr('id');
        var actionBar=$('.action-bar[search_view="'+searchView+'"]');
        if(actionBar.length > 0){
            if(action =='active'){
                actionBar.find('.sub-action')
                .enable();
            }else if(action =='inactive'){
                actionBar.find('.sub-action')
                .disable();
            }
        }
    }
    /**
     * implement column search in listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $('.search_inline_column').live('keypress', function(event){
        if ( event.which == 13 ){
            event.preventDefault();
            var col=$(this);
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
        }
    });

    $('#advance_search input').live('keypress', function(event){
        if ( event.which == 13 ){
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

    $('.search_inline_form').live('submit',function(event){
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



    /**
     * Intercepts click event for finding result count incase of lazy pagination.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(".paginate_count").live('click',function(event){
        var paginateCountObj=this;
        $.get($(this).attr('href'),{}, function(data){
            $(paginateCountObj).replaceWith('<span>'+data+'</span>');
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
    $('.twisty-close,.twisty-close-last').live('click',function(event,href,tobeDeleted){
        if($(this).hasClass('ui-state-disabled'))
            return false;
        var $this=this;
        var tobeDeleted=tobeDeleted;
        var table=$(this).addClass('ui-state-disabled').closest('table');
        var query=table.attr('query');
        var collapseCategoryColumns=table.attr('collapse_category_columns');
        if(typeof collapseCategoryColumns == 'undefined'){
            collapseCategoryColumns=0;
        }
        if(typeof href =='undefined'){
            var href=table.attr('href');
        }
        href=href.replace('page=','old_page=');
        var active_level =$(this).attr('active_level');
        active_level=parseInt(active_level)+1;
        query=parseJSON(decodeURIComponent(query));
        query['active_level']=active_level;
        var td=$(this).closest('td');
        var tr=td.closest('tr');
        var where={};
        var treeNode=$(td).hasClass('tree-node');
        if(treeNode){
            where[$(this).closest('table').attr('foreign_column_name')]=$.trim($(this).closest('tr').attr('primary_key'));
        }else{
            var val=$.trim(td.text());
            if(val ==''){
                where[0]={
                    'OR':[td.attr('column_name')+' IS NULL',td.attr('column_name')+'=""']
                };
            }else{
                where[td.attr('column_name')]=val;
            }
        }
        if(collapseCategoryColumns ==1 ){
            var tr_active_level =tr.attr('active_level');
            if(!$.isset(tr_active_level)){
                tr_active_level=0;
            }
            tr_active_level=parseInt(tr_active_level);
            var ptar=tr.prev();
            if(ptar.hasClass('record-row')){
                var ctr_active_level='';
                while(typeof ptar =='object'){
                    ctr_active_level=ptar.attr('active_level');
                    ctr_active_level=parseInt(!$.isset(ctr_active_level)?0:ctr_active_level);
                    if(ctr_active_level < tr_active_level){
                        ptar.find('.category').each(function(){
                            where[$(this).attr('column_name')]=$.trim($(this).text());
                        });
                        tr_active_level=ctr_active_level;
                    }
                    if(ptar.hasClass('record-row') && !$.isset(ptar.attr('active_level'))){
                        break;
                    }
                    ptar=ptar.prev();
                }
            }

        }else{
            td.prevAll('.category').each(function(){
                where[$(this).attr('column_name')]=$.trim($(this).text());
            });
        }
        if(typeof query['where'] == 'undefined')
            query['where']={};
        if($.isArray(query['where']))
            query['where'].push(where);
        else
            query['where']=$.extend(query['where'],where);
        href=href.split('q:')[0];
        href=href.split('q=')[0];

        href=href.replace('search_basic','sb').replace('search_advance','sa').replace('[search]','il');
        $.get(href,{
            "q":encodeURIComponent(JSON.stringify(query))
        },function(data){
            if(typeof tobeDeleted != 'undefined' && tobeDeleted.length > 0){
                for(var i=0,max=tobeDeleted.length; i< max;i++){
                    tobeDeleted[i].remove();
                }
            }
            var data=$(data);
            var padding='';
            var treeMarkup='';
            if(treeNode  || collapseCategoryColumns ==1 ){
                for(var k=0; k < active_level; k++){
                    padding += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                    treeMarkup +='<div class="twisty-i" ></div>';
                }
            }

            if( treeNode || collapseCategoryColumns ==1 ){
                var paginationRow=data.find('.pagination-row');
                var tds=data.find('.record-row:first>td');
                var colspan=parseInt(tds.length);
                var actionTdMarkup=false;
                if(tds.last().hasClass('list-row-action')){
                    colspan --;
                    actionTdMarkup='<td style="background-color: white;">&nbsp;</td>';
                }
                var tdMarkup=false;
                if(tds.first().find('.lco').length > 0){
                    colspan --;
                    tdMarkup = '<td style="background-color: white;">&nbsp;</td>';
                }


                if(paginationRow.find('.paginate-link').not('.active-paginate-link').length > 0){
                    paginationRow.attr({
                        'active_level':active_level
                    }).find('td:first').attr('colspan',colspan).prepend('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+padding).end();
                    if(tdMarkup !== false){
                        paginationRow.prepend(tdMarkup);
                    }
                    if(actionTdMarkup !== false){
                        paginationRow.append(actionTdMarkup);
                    }
                    paginationRow.insertAfter(tr);
                }
                var activeLevels=[];
                var num=0;
                tr.nextAll().not('.pagination-row').each(function(k,v){
                    num=parseInt($(this).attr('active_level'));
                    activeLevels.push((isNaN(num)?0:num));
                });
                //data.find('.record-row').find('.tree-node,.category').prepend(padding).end().attr('active_level',active_level).insertAfter(tr);
                data.find('.record-row').each(function(){
                    var row=$(this);
                    if(!$(this).is('[active_level]')){
                        $(this).find('.tree-node,.category').prepend(treeMarkup);
                        $(this).attr('active_level',active_level);
                    }
                    row.find('.twisty-i').each(function(k,v){
                        var found=0;
                        for(var kk=0 ; kk < activeLevels.length ; kk++){
                            if(activeLevels[kk] == k){
                                found=1;
                            }
                            if(activeLevels[kk] < k){
                                break;
                            }
                        }
                        if(found==0){
                            $(this).removeClass('twisty-i').addClass('twisty-b');
                        }
                    });
                }).insertAfter(tr);
            //data.find('.record-row').attr('active_level',active_level).insertAfter(tr);
            }else{
                if(data.find('.pagination-row').find('.paginate-link').not('.active-paginate-link').length > 0){
                    var tdMarkup='';
                    for(var k=0; k < active_level; k++){
                        tdMarkup += '<td style="background-color: white;">&nbsp;</td>';
                    }
                    var tds=data.find('.record-row:first>td');
                    var colspan=parseInt(tds.length)-active_level;
                    var paginationRow=data.find('.pagination-row');
                    var actionTdMarkup=false;
                    if(tds.last().hasClass('list-row-action')){
                        colspan --;
                        actionTdMarkup='<td style="background-color: white;">&nbsp;</td>';
                    }
                    paginationRow.attr({
                        'active_level':active_level
                    }).find('td:first').attr('colspan',colspan).end().prepend(tdMarkup);
                    if(actionTdMarkup !== false){
                        paginationRow.append(actionTdMarkup);
                    }
                    paginationRow.insertAfter(tr);
                }
                var recordsCount=data.find('.record-row').length;
                data.find('.record-row').attr('active_level',active_level).insertAfter(tr);
                if(recordsCount > 0)
                    $($this).closest('tr').addClass('ui-state-default').find('.list-row-action:first').css('background-color','white').end().end().closest('td').prevAll().css('background-color','white');
            }
            $($this).removeClass('ui-state-disabled');
        });
        if($(this).hasClass('twisty-close-last')){
            $(this).removeClass('twisty-close-last').addClass('twisty-open-last').next('.twisty-fclose').removeClass('twisty-fclose').addClass('twisty-fopen');

        }else{
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
    $('.twisty-open,.twisty-open-last').live('click',function(event){
        if($(this).hasClass('ui-state-disabled'))
            return false;

        var tr=$(this).addClass('ui-state-disabled').closest('tr');
        var active_level=tr.attr('active_level');
        var tobeDeleted=[];
        if(typeof active_level =='undefined'){
            active_level=0;
        }
        active_level=parseInt(active_level);
        tr=tr.next();
        var level=tr.attr('active_level');
        while(level != 'undefined' && parseInt(level) > active_level ){
            tobeDeleted.push(tr);
            tr=tr.next();
            level=tr.attr('active_level');
        }
        if(tobeDeleted.length > 0){
            var max=0;
            for(var i=0,max=tobeDeleted.length; i < max;i++){
                tobeDeleted[i].remove();
            }
        }
        $(this).closest('tr').removeClass('ui-state-default');

        if($(this).hasClass('twisty-open-last')){
            $(this).removeClass('ui-state-disabled').removeClass('twisty-open-last').addClass('twisty-close-last')
            .next('.twisty-fopen').removeClass('twisty-fopen').addClass('twisty-fclose');
        }else{
            $(this).removeClass('ui-state-disabled').removeClass('twisty-open').addClass('twisty-close')
            .next('.twisty-fopen').removeClass('twisty-fopen').addClass('twisty-fclose');
        }
        event.stopPropagation();
        return false;
    });


    $('.search_trigger').live('click',function(event){
        var val=$(this).parents(':first').find('[name="search_basic"]').val();
        var searchView='#'+$(this).attr('search_view');
        var params={
            'search_basic':val
        };
        $.listviewSearch(searchView,params);
        event.stopPropagation();
        return false;
    });

    $.listviewSearch=function(searchView,params){
        var href=$(searchView).attr('href');
        if(!$.isset(href)){
            href=$(searchView).find('.paginate-link:first').attr('href');
        }
        if(href.indexOf('?') ==-1){
            href +='?';
        }
        href=href.replace(/page:[0-9]*/,'').replace('search_advance','sa').replace('search_basic','sb').replace('[search]','[si]');
        if($.isset(params['search_inline'])){
            $.each(params['search_inline'],function(k,v){
                href += '&'+v['column']+'='+v['value'];
            });
        }
        if($.isset(params['search_basic'])){
            href += '&search_basic='+params['search_basic'];
        }
        if($.isset(params['search_advance'])){
            if($.isArray(params['search_advance']) || $.isPlainObject(params['search_advance'])){
                params['search_advance']=encodeURIComponent(JSON.stringify(params['search_advance']))
            }
            href += '&search_advance='+params['search_advance'];
        }
        href += '&page=1';
        if($.isset(params['reset'])){
            href += '&reset='+params['reset'];
        }
        $.get(href,{},function(data){
            $.replaceListview($(searchView),data);
        });
    //link.attr('href',href).trigger('click');
    }


    /**
     * Intercept paginate-link click event
     * Used in case of categorized/tree listview sublevels pagination.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $('.paginate-link').live('click',function(event){
        var paginateLink=$(this);
        if(typeof $(this).closest('tr').attr('active_level') != 'undefined'){
            if($(this).hasClass('ui-state-disabled'))
                return false;
            var tr=$(this).siblings('.paginate-link').addClass('ui-state-disabled').end().addClass('ui-state-disabled').closest('tr');
            var active_level=tr.attr('active_level');
            var tobeDeleted=[tr];
            var href=$(this).attr('href');
            if(typeof active_level !='undefined'){
                active_level=parseInt(active_level);
                tr=tr.prev();
                var level=tr.attr('active_level');
                while(level != 'undefined' && parseInt(level) >= active_level ){
                    tobeDeleted.push(tr);
                    tr=tr.prev();
                    level=tr.attr('active_level');
                }
            }
            tr.find('.twisty-open,.twisty-open-last').each(function(){
                if($(this).hasClass('twisty-open-last')){
                    $(this).removeClass('twisty-open-last').addClass('twisty-close-last').trigger('click',[href,tobeDeleted]);
                }else{
                    $(this).removeClass('twisty-open').addClass('twisty-close').trigger('click',[href,tobeDeleted]);
                }
            });
        }else{
            if($(this).hasClass('ui-state-disabled'))
                return false;
            var tr=$(this).siblings('.paginate-link').addClass('ui-state-disabled').end().addClass('ui-state-disabled').closest('tr');
            var href=$(this).attr('href');
            var table=$(this).closest('table');
            $.get(href,{},function(data){
                if(typeof(data) === "object"){
                    showMessage(data);
                    var oldUrl=paginateLink.attr('old_href');
                    if($.isset(oldUrl))
                        paginateLink.attr('href',oldUrl);
                    $(tr).find('.paginate-link').removeClass('ui-state-disabled');
                }else{
                    $.replaceListview(table,data);


                }
            });
        }
        event.stopPropagation();
        return false;

    });
    $.replaceListview=function(replacedView,data){
        var data=$(data);
        var requiredTable=(data.hasClass('listview')?data:data.find('.listview:first'));
        if(replacedView.hasClass('table-no-td-border')){
            requiredTable.addClass('table-no-td-border');
        }
        var viewId=replacedView.attr('id');
        replacedView.replaceWith(requiredTable);
        if($.isset(viewId)){
            $(requiredTable).attr({
                'id':viewId
            });
        }
        initChart(data);
    }
    /**
     * Intercept sort-link click event
     * Used in case of all listviews.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $('.sort').live('click',function(event){
        var href=$(this).attr('href');
        var table=$(this).parents('table:eq(1)');
        $.get(href,{},function(data){
            $.replaceListview(table,data);
        });
        event.stopPropagation();
        return false;
    });

    //$.address.change(function(event){
    //    $(".tab").tabs( "select" , window.location.hash )
    //});

    $('.date_toggle').live('click',function(){
        if($(this).hasClass('toggle_enabled')){
            $(this).parents(':first').find('.date').datepicker("destroy");
            $(this).removeClass('toggle_enabled').addClass('toggle_disabled').text('Show Picker');
        }else{
            $(this).parents(':first').find('.date').datepicker();
            $(this).removeClass('toggle_disabled').addClass('toggle_enabled').text('Enter manually');
        }

    });
    $('.datetime_toggle').live('click',function(){
        if($(this).hasClass('toggle_enabled')){
            $(this).parents(':first').find('.datetime').datepicker("destroy");
            $(this).removeClass('toggle_enabled').addClass('toggle_disabled').text('Show Picker');
        }else{
            var ampm=false;
            if($.isset($.config) && $.isset($.config.hour_format))
                ampm=$.config.hour_format;
            $(this).parents(':first').find('.datetime').datetimepicker({
                "ampm":ampm,
                "timeFormat": "hh:mm:ss TT",
                "showSecond": true
            });
            $(this).removeClass('toggle_disabled').addClass('toggle_enabled').text('Enter manually');
        }
    });



    $.initFields=function(container){
        /**
         * Initialize jquery tab
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */

        container.find(".tab").not('.template-element').each(function(){
            var selected=$(this).attr("selected");
            $(this).tabs({
                "selected":selected,
                "cookie": {}
            }).bind("tabsselect", function(event, ui) {
                window.location.hash = ui.tab.hash;
            })
        // when the tab is selected update the url with the hash
        });

        container.find("input[type='submit'],input[type='reset'],input[type='button'],input[type='cancel'],button")
        .removeClass('ui-state-active').each(function(){
            if($(this).is('button')){
                $(this).css({
                    'padding':'1px'
                });
            }
            $(this).button();
        });

        /**
         * Initialize WYSIWYG editor
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('[editor="WYSIWYG"]').not('.template-element').each(function(){
            var properties={};
            var height=parseInt($(this).css('height'));
            if($.isset(height) && height> 250)
                properties['height'] =height;

            var width=parseInt($(this).css('width'));
            if($.isset(width) && width > 500)
                properties['width'] =width;
            else
                properties['width'] ='100%';

            $(this).cleditor(properties);
        });

        container.find('[editor="markup"]').not('.template-element').each(function(){
            var base=($.isset($.config) && $.isset($.config.base) ?  $.config.base:false);
            $(this).markItUp(mySettings);
            $('#emoticons a').click(function() {
                emoticon = $(this).attr("title");
                $.markItUp( {
                    replaceWith:emoticon
                } );
            });
        });

        /**
         * Initialize date picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */

        var dateFormat=$.getConfig('dateFormat');
        container.find('input.date')
        .not('.template-element').each(function(){
            if($(this).attr('is_readonly') != 0){
                $(this).attr('readonly','readonly');
            }else{
                $(this).after('<a href="#" class="date_toggle toggle_enabled">Enter manually</a>');
            }
        })
        .datepicker().next().after('<span class="field-help">'+(dateFormat !='' ? "("+dateFormat+")":"")+'</span>');

        container.find('span.date')
        .not('.template-element')
        .after('<span class="field-help">'+(dateFormat !='' ? "("+dateFormat+")":"")+'</span>');

        /**
         * Initialize date time picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('input.datetime')
        .not('.template-element')
        .each(function(){

            var ampm=false;
            if($.isset($.config) && $.isset($.config.hour_format))
                ampm=$.config.hour_format;

            if($(this).attr('is_readonly') != 0){
                $(this).attr('readonly','readonly');
            }
            else{
                $(this).after('<a href="#" class="datetime_toggle toggle_enabled" >Enter manually</a>');
            }
            $(this).datetimepicker({
                "ampm":ampm,
                "timeFormat": "hh:mm:ss TT",
                "showSecond": true
            });
        }).next().after('<span class="field-help">'+(dateFormat !='' ? "("+dateFormat+" hh:mm:ss)":"")+'</span>');

        container.find('span.datetime').not('.template-element')
        .after('<span class="field-help">'+(dateFormat !='' ? "("+dateFormat+" hh:mm:ss)":"")+'</span>');

        /**
         * Initialize time picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('input.time').not('.template-element').attr('readonly','readonly').each(function(){
            var ampm=(parseInt($(this).attr('ampm'))==1?true:false);
            $(this).timepicker({
                "ampm":ampm,
                "timeFormat": "hh:mm:ss tt",
                "showSecond": true
            });
        });








        /**
         * Initialize jquery autocomplete
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */

        container.find(".popup-autocomplete").not('.template-element').not('[readonly]').autocomplete({
            minLength: 0,
            select: function(event,ui){
                var popupSelect=$(this).closest('td').find('.popup-select');
                $(this).closest('td').find('.popup-hidden:first').val(ui.item.id).attr('for_text',ui.item.value).trigger('change');
            },
            source: function(request,response){
                var href='';
                var q='';
                var td=$(this.element[0]).closest('td');
                var term = [];
                var termP=request.term.split("/");
                for(var i=0; i < termP.length ; i++){
                    term.push($.trim(termP[i].split('[')[0]));
                }
                term=term.join('/');
                var forText=td.find('.popup-hidden').attr('for_text').split('[')[0];
                if($.trim(forText) != term ){
                    td.find('.popup-hidden').val('');
                }
                var popupSelect=td.find('.popup-select');
                if(popupSelect.length > 0){
                    var option=popupSelect.find("option:selected");
                    href=option.attr('href');
                    q=option.attr('q');
                }else{
                    href=$(this.element[0]).attr('href');
                    q=$(this.element[0]).attr('q');
                }

                q=decodeURIComponent(q);
                if(!$.isEmpty(href)){
                    if($.trim(q) =='' || !$.isset(q))
                        q='{}';
                    q=parseJSON(q);
                    if(!$.isPlainObject(q))
                        q={};
                    q["paginate_as"]="lazy";
                    q['limit']=20;
                    q['fields']=['{{MODEL}}'+'.'+'{{DISPLAY_FIELD}}','{{MODEL}}'+'.'+'{{PRIMARY_KEY}}'];
                    if(!$.isset(q['where'])){
                        q['where']=[];
                    }
                    where={};
                    where['{{MODEL}}'+'.'+'{{DISPLAY_FIELD}}'+' LIKE ']=request.term;
                    /*
                    var term = request.term;
                    var termP=term.split("/");
                    var termP=request.term;
                    where['{{MODEL}}'+'.'+'{{DISPLAY_FIELD}}'+' LIKE ']=termP.pop();
                    if(termP.length > 0)
                        where['{{PARENT}}'+'.'+'{{DISPLAY_FIELD}}']=termP.pop();
                     */


                    q['fetch']=1;
                    q['autocomplete']=1;
                    q['where']=$.mergeAll([q['where'],where]);
                    $(this.element[0]).data('q',q);
                    $(this.element[0]).triggerHandler('beforeSearch');
                    q=$(this.element[0]).data('q');
                    if(q !== false){
                        $.getJSON( href+'.json',{
                            'q':encodeURIComponent(JSON.stringify(q))
                        }, function( paginate, status, xhr ) {
                            var list=[];
                            var primaryKey=paginate['primary_key'];
                            var displayField=paginate['display_field'];
                            $.each(paginate.data,function(k,v){
                                list.push({
                                    'id':v[primaryKey],
                                    'value':(v[displayField] != v[primaryKey]? v[displayField]+' ['+v[primaryKey]+']':v[displayField])
                                });
                            });
                            response(list);
                        });
                    }

                }

            }
        }).click(function(){
            $(this).autocomplete('search');

        });

        var blocks=container.find('.block');

        blocks.not('.grid').not('.listview-block').each(function(){
            $(this).find('tr:last>td').css('border-bottom','0px');

        });
        //ui-state-highlight
        container.find('.field-tooltip').html("").addClass('ui-icon ui-icon-info display-inline-block')
        .wrap('<span class="field-tooltip-container">')
        .tooltip();
        container.find('.cell-info-grid').has('.block').css({
            'margin':0,
            'padding':0
        });


        initChart(container);




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

    $.uu=function(){
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
     * Check if input is empty
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.isEmpty=function(str){
        if($.isArray(str) && str.length == 0){
            return true;
        }else if($.isPlainObject(str) &&  $.isEmptyObject(str)){
            return true;
        }else if($.trim(str) =='')
            return true;
        return false;
    };
    /**
     * Initialize model view
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.jsContainer=function(html,params){
        var uuid=$.uu();
        var params= params || {};
        var defaults={
            autoOpen: false,
            modal: true,
            width: 'auto',
            dialogClass: 'no-close',
            buttons: {}
        };
        /*
         *buttons: {
                Close: function() {
                    $(this).dialog('destroy').remove();
                }
            }*/
        var setting=$.extend(false,defaults,params);
        $("body").append('<div id="'+uuid+'" class="js-container"><span class="content">Records</span></p></div>');
        $("#"+uuid).find(".content").html(html);





        if($.isset(setting['maxHeight'])){
            if($('#'+uuid).height() > setting['maxHeight']){
                setting['height']=setting['maxHeight']
            }
        }
        if($.isset(setting['maxWidth'])){
            if($('#'+uuid).width() > setting['maxWidth']){
                setting['width']=setting['maxWidth']
            }
        }
        $("#"+uuid).dialog(setting).dialog('open');

        return uuid;
    };

    $( ".js-container" ).live("dialogclose", function(event, ui) {
        $('#'+$(this).attr('id')).dialog("destroy").remove();
    });


    /**
     * Serializes form input into object
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.fn.serializeObject = function(){
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

    /**
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @eg. $.addObserver({"name":"tushar","onChanged":function(url){console.log(this.name+"--->"+url);}});
     */

    $.observers={};
    $.addObserver=function(key,observer){
        $.observers[key]=observer;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.notifyObservers=function(url,ignore){
        var url=$.trim(url);
        var ignore=ignore || [];
        if($.isset($.observers)){
            $.each($.observers,function(key,object){
                if($.inArray(key,ignore) == -1 && $.isset(object) && typeof object.notify =="function"){
                    object.notify(url);
                }
            });
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.select').live('click',function(event){
        var href=$(this).attr('href');
        if(!$.isset(href))
            return false;
        href=href.split('?');
        var base=href[0] || '';
        var get=href[1] || '';
        var length=0;
        base=base.split('/');
        var params={};
        var index='';
        var p1='';
        var p2='';
        for(var i=0,length=base.length; i < length ;i++){
            index=base[i].indexOf(':');
            if(index != -1){
                p1=base[i].substring(0,index);
                p2=base[i].substring(index+1);
                if(!$.isEmpty(p1) && !$.isEmpty(p2))
                    params[p1]=p2;
            }
        }
        if(!$.isEmpty(get))
            get=get.split('&');
        var getParams={};
        var pair=[];
        for(var i=0,length=get.length; i < length ;i++){
            pair=get[i].split('=');
            if($.isset(pair[0]) && $.isset(pair[1]) && !$.isEmpty(pair[0])  && !$.isEmpty(pair[1]) )
                getParams[pair[0]]=pair[1];
        }
        if($.isset(params['id']) && $.isset(getParams['trigger'])){
            var td=$('#'+getParams['trigger']).parents(':first');


            var listview=$(this).parents("table.listview:first");
            var displayField=listview.attr('display_field');
            var primaryKey=listview.attr('primary_key');

            var label=(displayField == primaryKey?params['id']:$(this)
                .closest('tr').find("[column_name='"+displayField+"']").text() );
            $(this).parents("div.ui-widget-content:first").dialog('destroy').remove();

            label=(label!= params['id']?label+' ['+params['id']+']':label);
            td.find('.popup-autocomplete').val($.trim(label));
            td.find('.popup-hidden').val(params['id']).attr('for_text',$.trim(label)).trigger('change');
        }
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.popup-add').live('click',function(event){
        var uuid=$.uu();
        $(this).attr('id',uuid);
        var href='';
        var q='';
        var td=$(this).parents(':first');
        var popupSelect=td.find('.popup-select');

        if(popupSelect.length > 0){
            var popupAutocomplete=td.find('.popup-autocomplete');
            if(popupSelect.find("option:selected").length ==0){
                popupSelect.get(0).selectedIndex=0;
            }
            var option=popupSelect.find("option:selected");
            href=option.attr('href');
            q=option.attr('q');
        }else{
            var popupAutocomplete=td.find('.popup-autocomplete');
            href=popupAutocomplete.attr('href');
            q=popupAutocomplete.attr('q');
        }
        q=decodeURIComponent(q);
        if($.trim(href) !=''){
            if($.trim(q) =='' || !$.isset(q))
                q='{}';
            q=parseJSON(q);
            if(!$.isPlainObject(q)){
                q={};
            }
            q['limit']=16;
            q['actions']=['select'];
            if(!$.isset(q['where'])){
                q['where']=[];
            }
            q['fetch']=1;
            q['merge_paginate']=1;
            $(popupAutocomplete).data('q',q);
            $(popupAutocomplete).triggerHandler('beforeSearch');
            q=$(popupAutocomplete).data('q');
            href += (href.indexOf('?') == -1 ?'?':'')+'&action_menu_bar=1';
            if(q !== false){
                $.get( href,{
                    'q':encodeURIComponent(JSON.stringify(q)),
                    'trigger':uuid
                },function(data){
                    var width=$('body').width();
                    width=(width/100)*80;
                    var params={
                        "width":width+"px",
                        "height": 550
                    };
                    params['title']=popupTitle(href);
                    var uuid=$.jsContainer(data,params);
                    $.initFields($('#'+uuid));

                });
            }
        }
        event.stopPropagation();
        return false;
    });
    function popupTitle(href){
        if(typeof href =='string'){
            var title=href.split($.config['base']).pop().split('?')[0].split("/");
            title.shift();
            return "&raquo;&nbsp;"+title.join("&nbsp;&raquo;&nbsp;").replace('_',' ');
        }
        else{
            return'';
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.popup-clear').live('click',function(event){
        $(this).closest('td').find('.popup-autocomplete').val('').end().find('.popup-hidden').val('').end();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.popup-select').live('change',function(){
        $(this).closest('td').find('.popup-autocomplete').val('').end().find('.popup-hidden').val('').end();
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */








    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.splitHtmlScript=function(data){
        var html="";
        var script="";
        var urls=[];
        var html= data.replace(/<script\s*[^>]*>([\S\s]*?)<\/script>/ig,"").replace(/<link\s*[^>]*>/ig,"");   //data.split('<script type="text/javascript">')[0];
        var match = data.match(/<script\s*[^>]*>([\S\s]*?)<\/script>/ig);
        if(match != null){
            $.each(match,function(k,v){
                if(v.indexOf("src=") !== -1 ){
                    var src=$(v).attr("src");
                    if(src!="");
                    urls.push(src);
                }
            });
        }
        script=(match!=null? match.join("").replace(/<script\s*[^>]*>/ig,"").replace(/<\/script>/ig,""):"");
        var match = data.match(/<link\s*[^>]*>/ig);
        if(match != null){
            $.each(match,function(k,v){
                if(v.indexOf("stylesheet") !== -1 ){
                    $("head").append(v);
                }
            });
        }

        return {
            "html":html,
            "script":script,
            urls:urls
        };
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.loadFiles=function(params){
        var defaults={
            oncomplete:{},
            params:{}
        };
        this.settings=$.extend(true,defaults,params);
        this.filesToLoad=this.settings.files.length;
        this.filesLoaded=0;
        if(this.filesLoaded != this.filesToLoad){
            (function(obj){
                $.each(obj.settings.files,function(k,url){
                    $.ajax({
                        url: url,
                        dataType: 'script',
                        success: function(){
                            obj.filesLoaded++;
                            if(obj.filesToLoad == obj.filesLoaded){
                                if(typeof obj.settings.oncomplete =="function" ){
                                    obj.settings.oncomplete.call(obj,obj.settings.params);
                                }
                            }
                        }
                    });
                });
            })(this);
        }else{
            if(typeof this.settings.oncomplete =="function" ){
                this.settings.oncomplete.call(this,this.settings.params);
            }
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(".click-record-column").live('click',function(event){
        if($(this).hasClass('ajax-popup') || $(this).is('[ajax_popup=1]')){
            $.ajaxPopup(this);
        }else{
            document.location.href=$(this).attr('href');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $('[ajax_popup=1]').live('click',function(event){
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.ajax-popup').live('click',function(event){
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });

    $('.delete').live('click',function(event){
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    $('[ajax=1]').live('click',function(event){
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.buildURL=function(href,part){
        if(href.indexOf('?') == -1){
            href +='?';
        }
        $.each(part,function(k,v){
            if($.isArray(v)){
                var vLength=v.length;
                for(var i=0;i < vLength ; i++){
                    href += '&'+k+'[]='+v[i];
                }
            }else{
                href += '&'+k+'='+v;
            }
        });
        return href;
    }

    $.deleteRecord=function(object,href,table){
        //var href=$(object).attr('href');
        var ajax=$(object).attr('ajax');
        var tr=$(object).closest('tr');
        if(!$.isset(table)){
            var table=$(object).closest('table.listview');
        }

        var isTree=table.hasClass('tree');
        var twisty=false;
        if(isTree){
            var active_level=tr.attr('active_level');
            if($.isset(active_level)){
                active_level=parseInt(active_level);
                active_level =active_level-1;
                tr=tr.prev();
                var level=tr.attr('active_level');
                if(!$.isset(level))
                    level=0;
                while(parseInt(level) >= active_level ){
                    if(parseInt(level) == active_level){

                        twisty=(tr.find('.twisty-open').length > 0?tr.find('.twisty-open'):(tr.find('.twisty-close').length > 0?tr.find('.twisty-close'):false));
                        if(twisty === false){
                            twisty=(tr.find('.twisty-open-last').length > 0?tr.find('.twisty-open-last'):(tr.find('.twisty-close-last').length > 0?tr.find('.twisty-close-last'):false));

                        }
                        break;
                    }
                    tr=tr.prev();
                    level=tr.attr('active_level');
                    if(!$.isset(level))
                        level=0;
                }
            }

        }
        var params={
            "width":250+"px"
        };

        params['href']=href;
        params['table_id']=$(table).attr('id');
        params['buttons']={
            'Yes': function(){
                $(this).dialog('destroy').remove();
                if(href.indexOf('?') == -1){
                    href +='?';
                }
                href +='&is_confirm=1';
                if($.isset(ajax) && ajax=="0"){
                    document.location.href=href;
                }else{
                    $.get(href,function(data){
                        if(typeof(data) === "object"){
                            showMessage(data);
                            if(twisty !== false){
                                if(twisty.hasClass('twisty-open') || twisty.hasClass('twisty-open-last'))
                                    twisty.trigger('click').trigger('click');
                                else
                                    twisty.trigger('click');
                            }else{
                                $("#"+params['table_id']).find('.active-paginate-link:first').trigger('click');
                            }
                        }
                    });
                }
            },
            'No': function(){
                $(this).dialog('destroy').remove();
            }
        };
        var uuid=$.jsContainer('Do you want to delete',params);

    }
    $.ajaxPopup= function(object,href,table){
        if(!$.isset(href)){
            var href=$(object).attr('href');
        }
        var twisty=false;
        var listviewTableId=false;
        if(!$.isset(table)){
            var table=$(object).closest('table');
        }
        var ajax=$(object).attr('ajax');
        var needConfirmation=false;


        // || $(object).hasClass('action')
        if($(object).hasClass('sub-action')){
            var ids=[];
            var searchView=$(object).closest('.action-bar').attr('search_view');
            table=$('#'+searchView);
            table.find('.lco:checked').each(function(){
                ids.push($(this).val());
            });
            var select_all_records=$('#select_all_records-'+searchView).find(':checked').length;
            href=$.buildURL(href,{
                'id':ids,
                'select_all_records':select_all_records,
                'q':table.find('.lca').val()
            });
        }
        if($(object).hasClass('delete') || href.indexOf('/delete') != -1 ){
            $.deleteRecord(object,href,table);
            return ;
        }
        var isTree=table.hasClass('tree');
        var tr=$(object).closest('tr');


        if(isTree){
            if($(object).hasClass('add')){
                href=href.split('/id:')[0];
                href += '?related_id='+$(object).closest('tr').attr('primary_key')
                +'&related_model='+$(object).closest('.listview').attr('parent');
                twisty=(tr.find('.twisty-open').length > 0?
                    tr.find('.twisty-open'):(tr.find('.twisty-close').length > 0?tr.find('.twisty-close'):false));
                if(twisty===false){
                    twisty=(tr.find('.twisty-open-last').length > 0?
                        tr.find('.twisty-open-last'):(tr.find('.twisty-close-last').length > 0?tr.find('.twisty-close-last'):false));

                }
            }else{
                var active_level=tr.attr('active_level');
                if($.isset(active_level)){
                    active_level=parseInt(active_level);
                    active_level =active_level-1;
                    tr=tr.prev();
                    var level=tr.attr('active_level');
                    if(!$.isset(level))
                        level=0;
                    while(parseInt(level) >= active_level ){
                        if(parseInt(level) == active_level){
                            twisty=(tr.find('.twisty-open').length > 0?tr.find('.twisty-open'):(tr.find('.twisty-close').length > 0?tr.find('.twisty-close'):false));
                            if(twisty === false){
                                twisty=(tr.find('.twisty-open-last').length > 0?tr.find('.twisty-open-last'):(tr.find('.twisty-close-last').length > 0?tr.find('.twisty-close-last'):false));
                            }
                            break;
                        }
                        tr=tr.prev();
                        level=tr.attr('active_level');
                        if(!$.isset(level))
                            level=0;
                    }
                }
            }
        }
        needConfirmation=$(object).hasClass('delete');
        if(twisty === false){
            if(table.hasClass('listview')){
                listviewTableId=table.attr('id');
            }else{
                listviewTableId=table.find('.listview').attr('id');
            }
            if(listviewTableId === false || $.trim(listviewTableId) ==""){
                var listviews=$('table.listview');
                if(listviews.length ==1){
                    listviewTableId=listviews.attr('id');
                }
            }
        }


        if(needConfirmation == true){
            var params={
                "width":250+"px"
            };
            params['href']=href;
            params['table_id']=$(this).closest('table.listview').attr('id');
            params['buttons']={
                'Yes': function(){
                    $(this).dialog('destroy').remove();
                    if(href.indexOf('?') == -1){
                        href +='?';
                    }
                    href +='&is_confirm=1';
                    if($.isset(ajax) && ajax=="0"){
                        document.location.href=href;
                    }else{
                        $.get(href,{},function(data){
                            if(typeof data =='object'){
                                $.afterSaveAjaxForm({
                                    'object':object,
                                    'data':data,
                                    'uuid':'xxx',
                                    'listview_table_id':listviewTableId,
                                    'twisty':twisty,
                                    'href':href
                                });
                            }else{
                                $.initAjaxForm({
                                    'object':object,
                                    'data':data,
                                    'listview_table_id':listviewTableId,
                                    'twisty':twisty,
                                    'href':href
                                });
                            }
                        });
                    }
                },
                'No': function(){
                    $(this).dialog('destroy').remove();
                }
            };
            var uuid=$.jsContainer('Do you want continue',params);
        }else{
            if($.isset(ajax) && ajax=="0"){
                document.location.href=href;
            }else{
                $.get(href,{},function(data){
                    if(typeof data =='object'){
                        $.afterSaveAjaxForm({
                            'object':object,
                            'data':data,
                            'uuid':'xxx',
                            'listview_table_id':listviewTableId,
                            'twisty':twisty,
                            'href':href
                        });
                    }else{
                        $.initAjaxForm({
                            'object':object,
                            'data':data,
                            'listview_table_id':listviewTableId,
                            'twisty':twisty,
                            'href':href
                        });
                    }
                });
            }
        }


    }


    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('[name ="data[action][cancel]"]').live('click',function(event){
        var jscontainer=$(this).closest('.js-container');
        if(jscontainer.length > 0){
            $('#'+jscontainer.attr('id')).dialog("destroy").remove();
        }else{
            var http_referer=$("#http_referer").val();
            if(http_referer ==""){
                http_referer=$.config['base']+$.config['module']+"/"+$.config['controller'];
            }
            if(http_referer.indexOf('/edit') != -1){
                http_referer=http_referer.replace('/edit','/index');
            }
            document.location.href=http_referer;
        }
        event.stopPropagation();
        return false;
    });


    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.initAjaxForm=function(settings){
        var data=settings['data'] || false;
        var listviewTableId=settings['listview_table_id'] || false;
        var twisty=settings['twisty'] || false;
        var href=settings['href'] || false;
        var containerParams=settings['container_params'] || false;
        var object=settings['object'] || false;


        var width=$('body').width();
        width=(width/100)*80;
        var params={
            "width":width+"px",
            "maxHeight": 550
        };
        if($.isset(containerParams)){
            params=$.extend(params, containerParams);
        //console.log(params);
        }


        if($.isset(href)){
            params['title']=popupTitle(href);
        }

        var uuid=$.jsContainer(data,params);
        $.initFields($('#'+uuid));
        var form =$('#'+uuid).find('form:first');
        form.find('input[type="submit"]').addClass('ajax-popup-form');
        //if form has file input, activate iframe form submit
        var frame=false;
        if(form.find('input[type="file"]').length > 0 || form.hasClass('iframe')){
            frame=$.uu();
        }
        if(frame !==false){
            $('body').append('<iframe name="' + frame + '" id="' + frame + '"  style="display:none" ></iframe>');
            form.attr('target',frame);
            var action=form.attr('action');
            form.attr('action',action+(action.indexOf('?') == -1?'?ajax=1':'&ajax=1'));
        }
        //else use post to submit
        if(frame !== false){
            form.submit(function(event){
                var form=$(this);
                $("#ajax-loader").show();
                $('#'+frame).one('load',function(){
                    var contents = $('#'+frame).contents().find('body').html();
                    if(contents.substring(0,5) =='<pre>'){
                        contents=contents.substring(5).replace('</pre>','');
                    }
                    var contentsObj=parseJSON(contents);
                    if(typeof(contentsObj) ==="object")
                        contents=contentsObj;
                    $("#ajax-loader").hide();
                    $.afterSaveAjaxForm({
                        'object':object,
                        'data':contents,
                        'uuid':uuid,
                        'listview_table_id':listviewTableId,
                        'twisty':twisty,
                        'href':href
                    });
                    $('#'+frame).remove();

                });
            });
        }else{
            form.find('input[type="submit"]').click(function(event){
                var form=$(this).closest('form');
                var data=$(form).serializeObject();
                data[$(this).attr('name')]=$(this).val();
                $.post($(form).attr('action'),data,function(data){
                    $.afterSaveAjaxForm({
                        'object':object,
                        'data':data,
                        'uuid':uuid,
                        'listview_table_id':listviewTableId,
                        'twisty':twisty,
                        'href':href
                    });
                });
                event.stopPropagation();
                return false;

                event.stopPropagation();
                return false;
            });
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.afterSaveAjaxForm=function(settings){
        var data=settings['data'] || false;
        var listviewTableId=settings['listview_table_id'] || false;
        var uuid=settings['uuid'] || false;
        var twisty=settings['twisty'] || false;
        var href=settings['href'] || false;
        var containerParams=settings['container_params'] || false;
        var object=settings['object'] || false;

        if($.isset(uuid))
            $('#'+uuid).dialog("destroy").remove();



        if($.isset(data)){
            if(typeof(data) === "object"){
                showMessage(data);

                if($.isset(twisty) && twisty!== false){
                    var tr=twisty.closest('tr');
                    var active_level=tr.attr('active_level');

                    var paginationRow=false;
                    if($.isset(active_level) && active_level > 0){
                        active_level=parseInt(active_level);
                        active_level =active_level+1;
                        tr=tr.next();
                        var level=tr.attr('active_level');
                        if(!$.isset(level))
                            level=0;
                        while(parseInt(level) >= active_level ){
                            if(parseInt(level) == active_level && tr.hasClass('pagination-row')){
                                paginationRow=tr.find('.active-paginate-link:first');
                                if(paginationRow.length <= 0){
                                    paginationRow=false;
                                }
                                break;
                            }
                            tr=tr.next();
                            level=tr.attr('active_level');
                            if(!$.isset(level))
                                level=0;
                        }
                    }

                    if(paginationRow !== false){
                        paginationRow.click();
                    }else{
                        if(twisty.hasClass('twisty-open') || twisty.hasClass('twisty-open-last')){
                            twisty.trigger('click').trigger('click');
                        }else{
                            twisty.trigger('click');
                        }
                    }
                }else if($.isset(listviewTableId) && listviewTableId != false){
                    $("#"+listviewTableId).trigger('reload');
                }
                $(object).trigger('request_end');
            }else{
                var a=$.splitHtmlScript(data);
                $.initAjaxForm({
                    'object':object,
                    'data':a.html,
                    'listview_table_id':listviewTableId,
                    'twisty':twisty,
                    'href':href
                });
                $.loadFiles({
                    files:a.urls,
                    params:a.script,
                    oncomplete:function(script){
                        eval(script);
                    }
                });
            }
        }
    }

    $('.listview').live('reload',function(){
        $(this).find('.active-paginate-link:first').trigger('click');
    });
    $('.ui-button[ajax=1]').live('request_end',function(){
        var actionMenu =$(this).closest('[search_view]');
        if(actionMenu.length > 0){
            $('#'+actionMenu.attr('search_view')).trigger('reload');
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
    $.fn.attrs=function(events){
        var events = events || false;
        var attributes={};
        var attrs=$(this).get(0).attributes;
        $.each(attrs,function(k,v){
            if(events === true)
                attributes[v.nodeName]=v.nodeValue;
            else{
                if(v.nodeName.indexOf('on') == -1)
                    attributes[v.nodeName]=v.nodeValue;
            }
        });
        return attributes;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    function resizeHomePanel(){
        var homePanelWidth=$('.home-panel').width()/3;
        homePanelWidth=homePanelWidth-10;
        $('.home-panel').find('td').each(function(){
            $(this).width((homePanelWidth*$(this).attr('colspan')));
        });

        $('.home-content-container').each(function(){
            var width=$(this).parents(':first').width();
            $(this).width(width-5);
            $(this).find('div:first').width(width-5);
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

    $('.grid-row-delete').live('click',function(){
        var grid=$(this).closest('.grid');
        var min=grid.attr('min');
        if(!isNaN(min)){
            if( ( gridRows(grid) <= min) ){
                $.jsContainer('<span>Minimum number of allowed rows are '+min+'</span>');
                return;
            }
        }
        var tr=$(this).closest('tr');
        var primary=tr.find(".primary:first").val();
        if(!$.isset(primary) || primary ==''){
            tr.remove();
        }else{
            $(this).closest('tr').removeClass('last-data-row').hide().find(".deleted:first").val(1).end();
        }
        gridSequence(grid);
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.grid-row-add').live('click',function(){
        var grid=$(this).closest('.grid');
        var gridId=grid.attr('id');
        var max=grid.attr('max');
        if(!isNaN(max)){
            if( !( gridRows(grid) < max) ){
                $.jsContainer('<span>Maximum number of allowed rows are '+max+'</span>');
                return;
            }
        }
        var count=$('#row_counter_'+gridId).val();
        if(count == null){
            count=-1;
        }
        count++;

        $('#row_counter_'+gridId).val(count);
        var after={};
        if(grid.find('.last-data-row:last').length > 0){
            after=grid.find('.last-data-row:last')
        }else{
            after=grid.find('.grid-template-row:last');
        }


        var clone=grid.find('.grid-template-row').clone(true).removeClass('grid-template-row').addClass('last-data-row').find(':input').each(function(){
            var name=$(this).attr('name');
            var id=$(this).attr('id');
            if(name != null && name!=''){
                $(this).attr('name',name.replace('[_X_]','['+count+']')).removeAttr('disabled');
            }
            if(id != null && id!=''){
                $(this).attr('id',id.replace('_X_',''+count+''));
            }
            $(this).removeClass('template-element');
        }).end().insertAfter(after);
        $.initFields(grid.find('.last-data-row:last').show());
        gridSequence(grid);
        $.initFields(clone);
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    function gridSequence(grid){
        grid.find('.last-data-row').each(function(i,k){
            $.each($(this).find('.cell-seq-grid:first').find('.sequence'),function(k,v){
                if($(this).is('input')){
                    $(this).val((i+1));
                }else{
                    $(this).text((i+1));
                }
            });
        });
    }
    function gridRows(grid){
        var count=0;
        grid.find('.last-data-row').each(function(i,k){
            if($(this).find(".deleted:first").val() != 1){
                count ++;
            }
        });
        return count;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.continuous-paginate').scroll(function(){
        var scrollHeight=$(this).get(0).scrollHeight;
        var scrollTop=$(this).scrollTop();
        var href=$(this).attr('href');
        var is_paging=$(this).attr('is_paging');
        var scroll=$(this);
        if(is_paging != null && is_paging ==1)
            return ;
        if(scrollHeight - scrollTop > 600){
            return;
        }else{
            if(href =='')
                return;
            scroll.attr('is_paging',1);
            href=href.split('/page:');
            var param=href[1].split('?');
            var page=(parseInt(param[0])+1);
            href=href[0]+'/page:'+page+'?'+param[1];
            scroll.find('.pagination-row > td').append('&nbsp;<a class="continuous-paginate-link" href="#">'+page+'</a>&nbsp;');
            $.get(href,function(data){
                var data=$(data);
                scroll.attr('href',data.attr('href'));
                data.find('.listview:first').find('.record-row').addClass('continuous-page-'+page).insertBefore(scroll.find('.listview:first').find('tr:last'));
                scroll.attr('is_paging',0);
            });
        }
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.continuous-paginate-link').live('click',function(){
        var continuousPaginate=$(this).closest('.continuous-paginate');
        var page=parseInt($(this).text());
        var scrollTop=continuousPaginate.find('.continuous-page-'+page).position();
        scrollTop=Math.ceil(scrollTop['top'])-200;
        continuousPaginate.scrollTop(scrollTop);

    });

    //$('#calculator').calculator({showOn: 'focus'});

    $("#reset-current-filter").click(function(){
        $('#current-filter-id').val('');
        $('#current-filter').val('');
    });

    $('#controller-action-panel button[href]').live('click',function(event){
        document.location.href=$(this).attr('href');
        event.stopImmediatePropagation();
        return false;
    });


    $('button[href]').live('click',function(event){
        if($(this).hasClass('delete') === false && $(this).hasClass('ajax-popup') === false ){
            var href=$(this).attr('href');
            document.location.href=href;
        }
        event.stopPropagation();
        return false;
    });

    $('#data-current_listview').change(function(){
        document.location.href=$.config['base']+$.config['module']+'/'+$.config['controller']+'/index?current_listview='+$(this).val();
    });

    $('[on_change_reload_form=1]').live('change',function(){
        var form=$(this)
        .closest('form');
        var button=form.find('input[name="data[action][reload]"]:first');
        if(button.length ==0){
            form.prepend('<input type="hidden" name="data[action][reload]" value="'+$(this).attr('name')+'" >');
        }else{
            button.val($(this).attr('name'));
        }
        var button=form.find('input[type="submit"]:first');
        if(button.hasClass('ajax-popup-form')){
            button.trigger('click');
        //button.triggerHandler('click');
        }else{
            button.trigger('click');
        }
    });
    $('.no-enter-submit').bind('keypress', function(event){
        if ( event.which == 13 ) event.preventDefault();
    });


    $('.search_basic_view_set').live('keypress', function(event){
        if ( event.which == 13 ){
            event.preventDefault();
            $(this).parents(':first').find('.search_trigger').trigger('click');
        }
    });

    initMessagePanel();


    $('.collapsible').live('click',function(){
        var block='';
        if($(this).parents('legend').length > 0){
            block =$(this).closest('fieldset').find('.block:first');
            if(block.length ==0){
                block =$(this).closest('fieldset').find('div:first');
            }
        }else{
            block =$(this).closest('.block');
        }

        if($(this).hasClass('ui-icon-circle-plus')){
            $(this).removeClass('ui-icon-circle-plus')
            .addClass('ui-icon-circle-minus');
            if(block.is('div')){
                block.removeClass('collapsible-hide').show().find('.show-listview').trigger('click')
            }else{
                block.find('tr:first').parents(':first').children('tr.collapsible-hide').removeClass('collapsible-hide').show().end().find('.show-listview').trigger('click');
            }
            block.find('[editor="WYSIWYG"]').not('.template-element').each(function(){
                $(this).cleditor()[0].refresh();
            });
        }else{
            $(this).removeClass('ui-icon-circle-minus').addClass('ui-icon-circle-plus');
            if(block.is('div')){
                block.addClass('collapsible-hide').hide();
            }else{
                block.find('tr:first').parents(':first').children('tr:visible').not('.block-header').addClass('collapsible-hide').hide();
            }

        }
    });

    $('.sub-listview .twisty-close,.sub-listview .twisty-close-last').trigger('click');

    $('.search-row-trigger').live('click',function(){
        var searchRow=$(this).closest('.listview').find('.search-row:first');
        if(searchRow.is(':visible')){
            searchRow.hide();
        }else{
            searchRow.show();
        }
    })
    $('.erase_search_inline_column').live('click',function(){
        $(this).parents('.search_inline_table').find('.search_inline_column').val('');
    });

    $('.load-listviews a').live('click',function(event){
        document.location.href=$.config['base']+$.config['module']+"/"+$.config['controller']+'/index?current_listview='+$(this).closest('tr').attr('primary_key');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $('.load-reports a').live('click',function(event){
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });


});









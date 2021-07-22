<?php
$menu = '';

if (\kernel\request::authenticate()) {
    $listviewName = $this->get('listview_name');
    $menu = \kernel\html::application_menu($this->request);
    ?>
    <script type="text/javascript">


        jQuery(document).ready(function($) {
            var sfMenu = jQuery('#application-sf-menu');
            sfMenu.children('li:last').find('a:first').addClass('last-child');

            var ele = new Array();
    <?php
    if (!empty($this->request->controller)) {
        ?>
                    var ele = sfMenu.find('li[url ^="<?php
        echo $this->request->module . '/' . $this->request->controller . '/' . $this->request->action;
        ?>" ]');

        <?php
    }
    if (isset($this->request->moduleOverwritten) && isset($this->request->controllerOverwritten)) {
        echo '
if (ele.length == 0) {
ele=sfMenu.find(\'li[url ^="' . $this->request->moduleOverwritten . '/' . $this->request->controllerOverwritten . '"]:first\');
}
';
    }
    ?>

    <?php
    $requestUrl = $this->request->param('request_url');
    $requestedURL = '';
    if (!empty($requestUrl) && stripos($requestUrl, 'filter:') === false) {
        $requestedURL = explode('/', $requestUrl);
        $requestedURL = __($requestedURL[1], 'module');
    }
    if (!empty($requestUrl)) {
        echo '
           
if (ele.length == 0) {
ele=sfMenu.find(\'li[url *="request_url=' . $requestUrl . '"]:first\');
}
';
    }
    ?>


            if (ele.length == 0) {
                ele = sfMenu.find('li[url^="<?php echo $this->request->module . '/' . $this->request->controller; ?>" ]:first');
            }
            //.parents('li').addClass('current ')
            ele.addClass('current ').parents('li').addClass('current ');
            //checking if the user is on 3rd level depth
            if (ele.attr('depth') == '3' && ele.parent(':first').parent(':first').attr('depth') != '1') {
                //name of breadcrumb
                var name = ele.parent(':first').parent(':first').attr('name')
                var icon = '';
                //taking its closest "menu" parent on top level
                var firstLevelParent = ele.closest('[depth="1"]');
                //creating the markup for the breadcrumb of second level
                icon = ele.parent(':first').parent(':first').find('a:first').find('.menu-icon').attr('class');
                //its label
                var breadCrumb = ' <span style="padding-left:4px;padding-right:3px;"> &#8725;</span> <span class="' + icon + '" style="display:inline-block;"></span><span class="menu_item_label">' + name + '</span>';
                firstLevelParent.find('a:first').children().last().append(breadCrumb);
            }


            var subMenuNavBar = $("#sub-menu-nav-bar");
            var children = $('.current:last');
            var parent = children.parent(':first');
            if (parent.hasClass('sf-menu')) {
                children = children.find('ul:first').children();
            } else {
                children = parent.children();
            }
            //$.each($('.current:first > ul > li') ,function(){

            $.each(children, function() {
                if ($(this).hasClass('current')) {
                    $(this).find('a:first').clone().wrap('<td class="current ui-state-highlight" >').parents(':first').appendTo(subMenuNavBar);
                } else {
                    $(this).find('a:first').clone().wrap('<td  >').parents(':first').appendTo(subMenuNavBar);

                }
            }

        );

    <?php
    if (!empty($requestedURL)) {
// echo 'subMenuNavBar.find(".current .menu_item_label").append("&nbsp;=>&nbsp;'.$requestedURL.'");';
    }
    ?>
            subMenuNavBar.append('<td  id="sub-menu-nav-last"  >&nbsp;</td>');
            var docWidth = $('#user_menu').position();
            docWidth = docWidth.left;
            var optionToShow = false;//Math.floor(docWidth/150);
            var counter = 0;
            sfMenu.children('li').each(function(k, v) {
                counter += $(this).width() + 130;
                if (counter > docWidth && optionToShow === false) {
                    optionToShow = k;
                }
            });
            if (optionToShow !== false) {
                var afterOptions = sfMenu.children('li').filter('.after-more');
                var afterOptionsClone = false;
                if (afterOptions.length > 0) {
                    afterOptionsClone = afterOptions.clone();
                    afterOptions.remove();
                }
                var hiddenOptions = sfMenu.children('li:gt(' + (optionToShow - 1) + ')').not('.ignore-more');
                if (hiddenOptions.length > 0) {
                    var hiddenOptionsClone = hiddenOptions.clone();
                    hiddenOptions.remove();
                    sfMenu.append('<li class="' + (hiddenOptionsClone.hasClass('current') ? 'current' : '') + '"><a href="#"><span style="background: url(\'<?php echo $this->request->getStaticURL(); ?>img/icons.png\') no-repeat top left;  background-position: -153px 0; width: 16px; height: 16px;"  class="menu-icon">&nbsp;&nbsp;&nbsp;&nbsp;</span><span><?php echo __('More'); ?></span></a><ul id="application-menu-more-options"></ul></li>');
                    $('#application-menu-more-options').append(hiddenOptionsClone);
                }

                if (afterOptionsClone !== false) {
                    sfMenu.append(afterOptionsClone);
                }
                                                                
            }
            if(typeof(hiddenOptions) != 'undefined' && hiddenOptions.length > 0){
                $.each(hiddenOptions,function(){
                    if($(this).hasClass('current')){
                        var name = $(this).attr('name');
                        var i = '';
                        if($(this).find('a:first').children().first().hasClass('menu-icon')){
                            i = $(this).find('a:first').children().first().attr('class');
                        }
                        var breadCrumb = ' <span style="padding-left:4px;padding-right:3px;"> &#8725;</span> <span class="' + i + '" style="display:inline-block;"></span><span class="menu_item_label">' + name + '</span>';
                        sfMenu.find('.current:first').find('a:first').children().last().append(breadCrumb);
                    }
                });
            }
            sfMenu.superfish();

            var title=[];
            sfMenu.find('.current').each(function(){
                title.push($.trim($(this).find('a:first').text()));
            });
    <?php
    if (!empty($this->request->action)) {
        $id = $this->request->param('id', false);
        echo 'title.push("' . __((empty($this->request->action) ? '   ' : $this->request->action), 'module') . (!empty($id) ? "&nbsp;[{$id}]" : "") . '");';
    }
    if (!empty($listviewName)) {
        echo 'title.push("' . $listviewName . '");';
    }
    ?>
            try {
                $('TITLE').html(title.join('&nbsp;&raquo;&nbsp;'));
            } catch (e) {

            }


        });


    </script>
    <?php
}
?>
<div id="application-menu">
    <ul class="sf-menu" id="application-sf-menu" style="border:0px;" >
        <?php echo $menu; ?>
        <div id="sub-menu-nav-container" class="ui-widget-header">
            <table class=" sub-menu-nav" cellspacing=0 cellpadding="0">
                <tr id="sub-menu-nav-bar">

                </tr>
            </table>
        </div>
</div>

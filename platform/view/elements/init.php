<?php
$dateFormat = str_replace(
        array('yyyy', 'MM'), array('yy', 'mm'), \kernel\locale::getDatePattern(\kernel\request::$locale)
);
$timeFormat = \kernel\locale::getTimePattern(\kernel\request::$locale);
$hourFormat = stripos($timeFormat, 'a') !== false ? 12 : 24;
$timeFormat = str_replace('a', '', $timeFormat);

// jquery ui css based on current skin.
echo \kernel\html::css($this->request, 'jquery-ui');
\kernel\html::ob_start('/css/cache', 'css');
//markItUp! toolbar theme
//markItUp! theme
//css file for WYSIWYG editor.
echo \kernel\html::css($this->request, '/module/cleditor/jquery.cleditor');
echo \kernel\html::css($this->request, '/module/superfish/css/superfish');
// file for app level css.
echo \kernel\html::css($this->request, '/css/style');
echo \kernel\html::css($this->request, '/css/common');
echo \kernel\html::css($this->request, '/css/jquery.tokeninput');

echo \kernel\html::css($this->request, '/module/markitup/sets/bbcode/style');
echo \kernel\html::css($this->request, '/module/markitup/skins/markitup/style');
echo \kernel\html::css($this->request, '/css/jquery.tagsinput');

\kernel\html::ob_flush($this->request, 'css');
// css file for current module/controller.
echo \kernel\html::css($this->request, '/skins/' . $this->request->skin . '/style');
echo \kernel\html::css($this->request, '/module/' . $this->request->module . '/css/' . $this->request->controller);

echo \kernel\html::css($this->request, 'ui-bootstrap');

echo \kernel\html::css($this->request, '/css/social-buttons/zocial');

// Required for jaquery validation plugun

$jsConfig = \kernel\configuration::read('js', array());
if (!is_array($jsConfig)) {
    $jsConfig = array();
}
$jsConfig = json_encode(array_merge($jsConfig, array(
    'is_mobile' => (\kernel\request::$mobile ? 1 : 0),
    'base' => $this->request->base,
    'static_url' => $this->request->getStaticURL(),
    'module' => $this->request->module,
    'controller' => $this->request->controller,
    'action' => $this->request->action,
    'locale' => \kernel\request::$locale,
    'skin' => $this->request->skin,
    'hour_format' => $hourFormat,
    'date_format' => $dateFormat,
    'current_application_url'=> \kernel\configuration::read('current_application_url'),
    'delay_load_left_panel' => \kernel\configuration::read('delay_load_left_panel', 5000),
    'delay_load_right_panel' => \kernel\configuration::read('delay_load_right_panel', 5000),
    'debug_js' => \kernel\configuration::read('debug_js', 0),
    'use_minified_files' => \kernel\configuration::read('use_minified_files', 0),
    'subview'=> (\kernel\request::authenticate() && $this->request->param('subview')?base64_decode($this->request->param('subview')):'')
        )));
//pr($jsConfig);
//var_dump(\kernel\configuration::read('staticURL'));
// jquery arrary.
echo \kernel\html::js($this->request, '/js/jquery');
// jquery ui javascript.
echo \kernel\html::js($this->request, '/js/jquery-ui');
?>
<script type="text/javascript">
    function autoResizeIframe(iframe) {
            var autoResizeIframeHeight=jQuery(iframe).contents().find('html').height();
            console.log(autoResizeIframeHeight);
            if(autoResizeIframeHeight < 30){
                autoResizeIframeHeight=30;
            }
            jQuery(iframe).height(autoResizeIframeHeight);
    }

    jQuery(document).ready(function($) {

<?php if (\kernel\configuration::read('show_http_loader_image')) { ?>
            var width = (jQuery('body').width() - 100) / 2;
            var height = 200;//jQuery('body').height()/2;
            jQuery('body').append('<img id="ajax-loader-http" style="position:absolute;left:' + width + 'px;top:' + height + 'px;" src="<?php echo $this->request->getStaticURL(); ?>img/ajax-loader-http.gif" />')
<?php } ?>

        $("button")
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
    });
    var CONFIG =<?php echo $jsConfig ?>;
    jQuery(function() {
        jQuery.config =<?php echo $jsConfig; ?>;
        //jQuery.preferCulture("<?php echo \kernel\request::$locale; ?>");
        $.datepicker.setDefaults($.datepicker.regional["<?php echo \kernel\request::$locale; ?>"]);
        $.datepicker.setDefaults({
            changeMonth: true,
            changeYear: true,
            showOn: "button",
            buttonImageOnly: true,
            buttonImage: "<?php echo $this->request->getStaticURL(); ?>img/calendar.gif",
            dateFormat: "<?php echo $dateFormat; ?>",
            buttonText: "Pick Date and time"
        });

        //$.timepicker.setDefaults({"ampm":<?php echo $hourFormat == 12 ? 'true' : 'false'; ?>,"showSecond": true,"timeFormat":"<?php echo $timeFormat; ?>"});


    });
</script>
<?php
echo \kernel\html::js($this->request, '/module/superfish/js/superfish');

echo \kernel\html::js($this->request, '/module/pdf/pdf.min');
echo \kernel\html::css($this->request, '/module/pdf/pdf_viewer.min');

echo \kernel\html::css($this->request, '/module/jquery-comments/jquery-comments');
echo \kernel\html::js($this->request, '/module/jquery-comments/jquery-comments');
echo \kernel\html::js($this->request, '/module/jquery-comments/jquery.textcomplete');

?>



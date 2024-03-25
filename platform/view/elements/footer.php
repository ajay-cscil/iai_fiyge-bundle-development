<?php
if (\kernel\configuration::read('debug') == true) {
    echo kernel\view\helper\log::html();
}
?>
<div class=" split-bar ui-widget-header"></div>
<div id="footer-panel"  >
    <span style="float:left;">
        <?php
        /*
        $organizationName = \select("name")
                                ->from(\module\crm_base\model\organizations::getInstance())
                                ->where(array("OR" => array("parent_id is NULL", "parent_id" => 0)))
                                ->inserted()
                                ->limit(1)
                                ->execute()->fetch(\PDO::FETCH_COLUMN);

          echo "{$organizationName}<br />";   
        */                   
        ?>
        <?php echo __('Server response time'); ?>:&nbsp;<?php
        global $requestStartTime;
        echo round((microtime(true) - $requestStartTime), 3), ' ', __('seconds')
        ?>

        <?php
        if (\kernel\configuration::read('show_memory_usage') == true) {
            echo ', ' . __('Server memory'), ': ', round(memory_get_usage() / 1024, 4), 'kb', '(normal)', ' / ', round(memory_get_peak_usage() / 1024, 4), 'kb', '(peak)';
        }
        ?>

    </span>

    <span style="float:right;"><?php echo __('Powered By'); ?><br /><span class="fiyge">Fiyge&copy; Framework <?php echo "v" . \kernel\configuration::read('fiyge_version'); ?></span></span>
</div>
<?php
// locale file for datepicker.
echo \kernel\html::js($this->request, '/js/locale/datepicker/jquery.ui.datepicker-' . \kernel\request::$locale);
// locale file for globalization.
echo \kernel\html::js($this->request, '/js/locale/globalization/jquery.glob.' . \kernel\request::$locale);

\kernel\html::ob_start('/js/cache', 'js');
// jquery validation plugin
echo \kernel\html::js($this->request, '/js/jquery.validate');
echo \kernel\html::js($this->request, '/js/jquery.validate.mapping');
// jquery.formula plugin to compute formula
echo \kernel\html::js($this->request, '/js/jquery.formula');
// json javascript helper.
echo \kernel\html::js($this->request, '/js/json');
// jquery ui timepicker javascript.
echo \kernel\html::js($this->request, '/js/jquery-ui-timepicker');
//script file for WYSIWYG editor.
//echo \kernel\html::js($this->request, '/module/cleditor/jquery.cleditor');
echo \kernel\html::js($this->request, '/js/jquery.cookie');
// file for app level javascript.
//script file for markItUp editor.
echo \kernel\html::js($this->request, '/module/markitup/sets/bbcode/set');
echo \kernel\html::js($this->request, '/module/markitup/jquery.markitup');
echo \kernel\html::js($this->request, '/js/jquery.tokeninput');
echo \kernel\html::js($this->request, '/js/jquery.glob');
echo \kernel\html::js($this->request, '/js/jquery.tagsinput');
echo \kernel\html::js($this->request, '/js/jquery.depends_on');
echo \kernel\html::js($this->request, '/js/jquery.filter_by');
echo \kernel\html::js($this->request, '/js/jquery.aggregation');
echo \kernel\html::js($this->request, '/node_modules/clipboard/dist/clipboard');

//echo \kernel\html::js($this->request, '/node_modules/formBuilder/dist/form-builder.min');


echo \kernel\html::js($this->request, 'script');
echo \kernel\html::js($this->request, 'common');


$path = \kernel\html::ob_flush($this->request, 'js', true);
// script file for current module/controller.
echo \kernel\html::js($this->request, '/skins/' . $this->request->skin . '/script');
echo \kernel\html::js($this->request, '/module/' . $this->request->module . '/js/' . $this->request->controller);
// jquery globalization javascript.

$googleMapsKey=\kernel\configuration::read('google_maps_key');
echo \kernel\html::js($this->request, 'https://maps.googleapis.com/maps/api/js'.(!empty($googleMapsKey)?"?key={$googleMapsKey}":""), true);
?>
<script type="text/javascript">
    setTimeout(function() {
        var loader = document.createElement('script');
        loader.src = "<?php echo trim(isset($path[0])?$path[0]:'');?>";
        // most browsers
        console.log('initControllerAction',loader.src,loader.src=="");
        if (typeof (initControllerAction) != 'undefined') {
            if(loader.src != ""){
                loader.onload = initControllerAction;
                // IE 6 & 7
                loader.onreadystatechange = function() {
                    if (this.readyState == 'complete') {
                        initControllerAction();
                    }
                }
            }else{
                initControllerAction();
            }
        }
        document.getElementsByTagName('head')[0].appendChild(loader);
    }, 200);
</script>
<script>
    (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-51074360-1', 'fiyge.com');
    ga('send', 'pageview');
</script>
<script type="text/javascript">
    jQuery(document).ready(function($) {
        setTimeout(function() {
            jQuery('#ajax-loader-http').remove();
        }, <?php echo \kernel\configuration::read('http_loader_image_delay'); ?>);
    });
</script>
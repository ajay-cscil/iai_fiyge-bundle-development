<?php
if (\kernel\configuration::read('debug') == true) {
    $slowQueryTime = \kernel\configuration::read('slow_query_time');
    if ($slowQueryTime == false) {
        $slowQueryTime = 10;
    }
    echo "<fieldset class='ui-widget-content'>
        <legend class='ui-widget-header' >
        <span class='collapsible ui-icon ui-icon-circle-plus  float-left'>*</span> ",
    __('DEBUG HTTP Request ID'),
    ': ',
    \kernel\request::$requestID,
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
    "</legend>";
    echo '<table cellspacing=0 cellpadding=0 class="block" ><tr class="collapsible-hide"><td><ol>';
    foreach (\kernel\logger::$sqlLog as $entry) {
        if (!is_object($entry['message'])) {
            $q = str_replace('?', "'%s'", str_replace("%", "PERCENT_SIGN", $entry['message']));
            $msg = '';
            if (isset($entry['params']) && is_array($entry['params'])) {
                $msg = @\vsprintf($q, \json_decode(str_replace("'", "\'", \json_encode($entry['params'])), true));
            }
            if (empty($msg)) {
                $msg = $entry['message'] . (isset($entry['params']) && !empty($entry['params']) ? "<br/>Params:" . \json_encode($entry['params']) : "");
            }
            $q = $msg;
            $q = str_replace("PERCENT_SIGN", "%", $q);
            $q = trim($q);
            $class = "";
            if (isset($q[0])) {
                switch ($q[0]) {
                    case 'S':
                        $class = "";
                        break;
                    case 'I':
                        $class = "btn-success";
                        break;
                    case 'U':
                        $class = "btn-info";

                        break;
                    case 'D':
                        $class = "btn-danger";
                        break;
                }
            }
        }
        $timeTaken = '';
        if (isset($entry['time_taken'])) {
            $timeTaken = round(($entry['time_taken'] * 1000), 5);
            $timeTaken = "&nbsp;[<span style='font-weight:bold;' " . ($timeTaken >= $slowQueryTime ? " class='ui-state-error-text'" : '') . ">" . $timeTaken . " ms</span>]";
        }

        echo "<li class='{$class}' style='border-bottom: 1px solid #F1F5F9;padding-bottom:5px;'>", $entry['event_type'], $timeTaken, " : ";
        if (!is_object($entry['message'])) {
            echo $q;
        } else {
            echo get_class($entry['message']);
            echo "<fieldset class='ui-widget-content'>
                    <legend class='ui-widget-header'>
                    <span class='collapsible ui-icon ui-icon-circle-plus  float-left'>*</span>
                    </legend>
                    <table cellspacing=0 cellpadding=0 class='block' ><tr class='collapsible-hide'>
                    <td>";
            pr($entry['message']);
            echo '</td></tr></table></fieldset>';
        }
        echo "</li>";
    }


    if (!empty(\kernel\model::$errors)) {
        echo "<li style='border-bottom: 1px solid #F1F5F9;padding-bottom:5px;'>", json_encode(\kernel\model::$errors), "</li>";
    }
    echo '</ol></td></tr></table>';
    echo '</fieldset>';
}
?>
<div class=" split-bar ui-widget-header"></div>
<div id="footer-panel"  >
    <span style="float:left;">
        © MaaxFrame Inc. 2013 onwards - All rights reserved&reg;. <br />
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

    <span style="float:right;"><?php echo __('Powered By'); ?><br /><span class="maaxframe">MaaxFrame <?php echo "v" . \kernel\configuration::read('maaxframe_version'); ?></span></span>
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
echo \kernel\html::js($this->request, '/module/cleditor/jquery.cleditor');
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

echo \kernel\html::js($this->request, 'script');
echo \kernel\html::js($this->request, 'common');

$path = \kernel\html::ob_flush($this->request, 'js', true);
// script file for current module/controller.
echo \kernel\html::js($this->request, '/skins/' . $this->request->skin . '/script');
echo \kernel\html::js($this->request, '/module/' . $this->request->module . '/js/' . $this->request->controller);
// jquery globalization javascript.
echo \kernel\html::js($this->request, 'https://maps.googleapis.com/maps/api/js', true);
?>
<script type="text/javascript">
    setTimeout(function() {
        var loader = document.createElement('script');
        loader.src = "<?php echo $path[0]; ?>";
        // most browsers
        if (typeof (initControllerAction) != 'undefined') {
            loader.onload = initControllerAction;
            // IE 6 & 7
            loader.onreadystatechange = function() {
                if (this.readyState == 'complete') {
                    initControllerAction();
                }
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

    ga('create', 'UA-51074360-1', 'maaxframe.com');
    ga('send', 'pageview');
</script>
<script type="text/javascript">
    jQuery(document).ready(function($) {
        setTimeout(function() {
            jQuery('#ajax-loader-http').remove();
        }, <?php echo \kernel\configuration::read('http_loader_image_delay'); ?>);
    });
</script>
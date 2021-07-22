<?php
\kernel\html::ob_start('/css/cache.mobile', 'css');
echo \kernel\html::css($this->request, 'ui-bootstrap');
echo \kernel\html::css($this->request, 'jquery.mobile');
echo \kernel\html::css($this->request, 'jquery.mobile.icon.pack');
echo \kernel\html::css($this->request, 'jquery.mobile.datebox');
// file for app level css.
echo \kernel\html::css($this->request, 'style.mobile');
echo \kernel\html::css($this->request, 'common');
echo \kernel\html::css($this->request, 'jquery.ui.datepicker.mobile');
echo \kernel\html::css($this->request, '/css/jquery.tokeninput');
echo \kernel\html::css($this->request, '/css/jquery.tagsinput');
\kernel\html::ob_flush($this->request, 'css');

// css file for current module/controller.
echo \kernel\html::css($this->request, '/module/' . $this->request->module . '/css/' . $this->request->controller . '.mobile');

// jquery kernel arrary.
$datePattern = \kernel\locale::getDatePattern(\kernel\request::$locale);
$timePattern = \kernel\locale::getTimePattern(\kernel\request::$locale);
$dateFormat = str_replace(array('y', 'm', 'd'), array('Y', 'M', 'D'), $datePattern);
$hourFormat = stripos($timePattern, 'a') !== false ? 12 : 24;
if (stripos($timePattern, 'a') !== false) {
    $timeFormat = str_replace(array('h', 'm', 'a'), array('G', 'i', 'AA'), $timePattern);
} else {
    $timeFormat = str_replace(array('h', 'm'), array('H', 'i'), $timePattern);
}
$jsConfig = \kernel\configuration::read('js', array());
if (!is_array($jsConfig)) {
    $jsConfig = array();
}
$jsConfig = array_merge(
        $jsConfig, array(
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
    'delay_load_left_panel' => \kernel\configuration::read('delay_load_left_panel', 5000),
    'delay_load_right_panel' => \kernel\configuration::read('delay_load_right_panel', 5000),
    'debug_js' => \kernel\configuration::read('debug_js', 0),
    'use_minified_files' => \kernel\configuration::read('use_minified_files', 0),
        ));

//\kernel\html::ob_start('/js/cache.mobile.init', 'js');
echo \kernel\html::js($this->request, 'jquery-m');
echo \kernel\html::js($this->request, 'bootstrap');
echo \kernel\html::js($this->request, 'jquery.mobile');
//\kernel\html::ob_flush($this->request, 'js', false);

$jsConfig = json_encode($jsConfig);
?>
<script type="text/javascript">
    var CONFIG =<?php echo $jsConfig; ?>;
    jQuery(function() {
        jQuery.config =<?php echo $jsConfig; ?>;
    });
</script>
<?php
$dateFormat = str_ireplace(array('YYYY', 'YY', 'MM', 'M', 'DD', 'D'), array('Y', 'Y', 'm', 'm', 'd', 'd'), $dateFormat);
$dateFormat = str_ireplace(array('Y', 'm', 'd'), array('%Y', '%m', '%d'), $dateFormat);
// json javascript helper.
echo \kernel\html::js($this->request, '/js/locale/globalization/jquery.glob.' . \kernel\request::$locale);
echo '
        <script  type="text/javascript">
		$(document).ready(function(){
                    $("li.empty_cell").remove();
                    $("input.date").attr({"data-role":"datebox","data-options":\'{"mode":"flipbox","dateFormat":"' . $dateFormat . '"}\'});
                    $("input.time").attr({"data-role":"datebox","data-options":\'{"mode":"timeflipbox","timeFormat":"' . (stripos(\kernel\locale::getTimePattern(\kernel\request::$locale), 'a') !== false ? 12 : 24) . '"}\'});
		    
                    /*
                    $.iconList=[];
                    if(typeof document.styleSheets !== "undefined"){
                        $.each(document.styleSheets, function(k,v){
                            if(typeof v["href"] !== undefined && v["href"].indexOf("icon") != -1 && v["cssRules"]){
                                $.each(v["cssRules"],function(k1,v1){
                                    $.iconList.push(v1["selectorText"]);
                                 });
                            }
                        });
                    }*/
                    
                    
                });
	</script>
  <script  type="text/javascript">
  //reset type=date inputs to text
  $(document).bind("mobileinit", function(){
       $.mobile.defaultPageTransition = "slide";
       $.mobile.defaultDialogTransition = "slide";
       $.mobile.pushStateEnabled = false;
  });
  </script>
  ';
?>



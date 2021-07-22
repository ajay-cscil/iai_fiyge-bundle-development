<?php

use kernel\configuration;

$links = array();
$menu = array();
$class = '\\module\\development_base\\model\\menus';
//$controllerMenu = \kernel\request::session('controller_menu');
if (!isset($controllerMenu[$this->request->module . "/" . $this->request->controller])) {
    $modelObj = $class::getInstance();
    $menu = array();
    
}
?>
<div data-role="footer" class="ui-bar" data-position="fixed">
    <div class="controller-action-panel"  data-position="fixed" data-inline="true" data-role="controlgroup"
         data-type="horizontal" >
             <?php
             if (!empty($menu)) {
                 foreach ($menu as $m) {
                     if (!in_array($m['name'], array('index', 'edit', 'view')))
                             echo '<a href="' . (empty($m['url']) ? '#' : $this->request->base . $m['url'])
                         . '" class="' . $m['class'] . '"  data-role="button" data-ajax="false"  >' . __($m['name']) . '</a>';
                 }
             }
             foreach (\kernel\configuration::read('controllerActions', array()) as $key => $value) {
                 echo '<a href="' . (isset($value['url']) && empty($value['url']) ? $this->request->base . $m['url'] : '#')
                 . '" class="  ui-button ui-widget ui-state-default ui-button-text-only  '
                 . (isset($value['class']) ? $value['class'] : '') . '"  id="' . $key . '"  data-role="button" data-ajax="false"  >' . __($key) . '</a>';
             }
             ?>

    </div>
</div>
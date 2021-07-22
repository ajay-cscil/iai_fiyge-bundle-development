<?php

use kernel\configuration;

if (isset($this)) {
    $view = &$this;
}
$subActions = array('index', 'edit', 'view', 'delete');
if (\kernel\request::authenticate()) {
    $links = array();
    $modelObj = \module\development_base\model\menus::getInstance();
    $uuid = $this->request->get('search_view');
    ?>
    <div class="action-menu ui-widget-content action-bar"  search_view="<?php echo $uuid; ?>"   style="clear: both; height: 30px;">
        <form method="post" action="<?php
    echo $view->request->base
    . $view->request->module . '/'
    . $view->request->controller . '/index';
    ?>">
            <table style="width: 100%;" class="no-mp">
                <tr  class="no-mp">
                    <td  class="no-mp">
                        <div id="controller-action-panel" class="controller-action-panel">
                            <?php
                            $id = $view->get(array('id'), false);
                            // build controller menu

                            $viewName = $view->get('__current_listview');
                            if (strtolower($viewName) != 'recycle bin') {
                                $key = $view->request->module . '.' . $view->request->controller . '.' . $view->request->action . '.' . (\kernel\request::$mobile === true ? 'm' : 'w') . '.' . \kernel\user::read('role_key');
                                $cacheMenu = (bool) \kernel\configuration::read('cache_action_menu');
                                $menu ="";
                                if ($cacheMenu && \kernel\cache::check('/menus/' . $key)) {
                                    $menu = \kernel\cache::read('/menus/' . $key);
                                } 
                                if(empty($menu)){
                                    $menu = \kernel\html::controllerSubactionBar($view, $view->request->module, $view->request->controller, $view->request->action);
                                    if($cacheMenu){
                                        \kernel\cache::write('/menus/' . $key, $menu);
                                    }
                                }
                                echo $menu;
                            }
                            ?>
                        </div>
                    </td>
                    <td id="current_listview_container" valign="middle" >
                        <div class="float-right">
                            <?php
                            $listview = array(
                                'helper' => '\\kernel\\form'
                                , 'method' => 'popup'
                                , 'name' => array('current_listview')
                                , 'value' => $view->get('current_listview')
                                , 'text' => $view->get('__current_listview')
                                , 'class' => 'big'
                                , 'clear' => false
                                , 'children' => array(
                                    array(
                                        'helper' => '\\kernel\\form'
                                        , 'model' => 'listviews'
                                        , 'method' => 'popupoption'
                                        , 'q' => '%7B%22where%22%3A%7B%22listviews.controller%22%3A%22'
                                        . $view->request->module . '%5C%2F'
                                        . $view->request->controller . '%22%7D%7D'
                                        , 'href' => 'core/listviews/index'
                                    )
                                )
                            );
                            echo \kernel\form::popup($view, $listview);
                            echo "<a href='{$view->request->base}core/listviews/advance_search/id:{$view->get('current_listview')}' ajax=1 class=''  >Edit</a>";
                            echo "<a href='{$view->request->base}core/listviews/delete/id:{$view->get('current_listview')}' class='delete ' >Delete</a>";
                            ?>
                        </div>
                        <div class="float-right" id="listview_label">
                            <?php
                            echo '<span class="listview-label">' . __('List view') . '</span> : ';
                            ?>
                        </div>
                    </td>
                </tr>
            </table>
        </form>
    </div>
    <?php
}
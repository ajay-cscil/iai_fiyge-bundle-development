<div data-role="header" data-theme="b"  role="banner" >
    <?php
    $showAppName = false;

    $isHomeDisplayed = false;
    if ($this->request->action == 'app_menu') {

        if ($this->request->param('id') != false) {////"' . $this->httpReferer() . '"
            echo '<a data-icon="arrow-l" data-mini="true"  href="#" onClick="history.go(-1);return false;"
       data-ajax="false" title="' . __("Back") . '" data-theme="b" >' . __("Back") . '</a> ';
        } else {
            echo '<a data-mini="true" href="' . $this->request->base . 'access_controls/users/logout"
       data-ajax="false" title="' . __("Back") . '" data-theme="b" >' . __("Logout") . '</a> ';
        }
        $showAppName = true;
    } elseif (
            (isset($this->params['detail']) && $this->params['detail'] !== false) ||
            ($this->request->param('related_model') != "" && $this->request->param('related_id') != "" )
    ) {
        echo '<a data-icon="arrow-l" data-mini="true"  href="#" onClick="history.go(-1);return false;"
       data-ajax="false" title="' . __("Back") . '" data-theme="b" >' . __("Back") . '</a> ';
    } else {
        echo '<a data-mini="true" class="home-page-link" data-direction="reverse" data-iconpos="notext" data-icon="home"
       href="' . $this->request->base . 'development_base/menus/app_menu"
       data-ajax="false" title="' . __("Home") . '" data-theme="b" ></a> ';
        $isHomeDisplayed = true;
    }
    ?>

    <h1><?php
    if ($showAppName) {
        echo \kernel\configuration::read('document_title');
    } else {
        //$requestURL=$this->request->get('request_url');
        $modelObj = \module\development_base\model\menus::getInstance(array(), true);
        $node = $modelObj->find(
                        array(
                            'fields' => array('menus.*'),
                            'where' => array(
                                'menus.type' => 'controller',
                                'menus.is_active' => 1,
                                'menus.url LIKE ' => $this->request->module . '/' . $this->request->controller . '/'
                            ),
                            'limit' => 0
                        )
                )
                ->fetch(\PDO::FETCH_ASSOC);
        if (!empty($node)) {
            $img = '';
            $baseURL = $this->request->getStaticURL();
            if (isset($node['icon_class']) && !empty($node['icon_class'])) {
                $img = '<span style="display:inline-block;" class="menu-icon ' . $node['icon_class'] . '">&nbsp;</span>';
            } else if ($baseURL !== false && isset($node['img']) && !empty($node['img'])) {
                if (!in_array(substr($node['img'], -4), array('.png', '.jpg', '.gif'))) {
                    $img = '<span style="' . str_replace('{{BASE}}', $baseURL, $node['img']) . ';display:inline-block;" class="menu-icon">&nbsp;</span>';
                } else {
                    $img = '<img src="' . $baseURL . $node['img'] . '" class="menu-icon">';
                }
            }

            echo $img; //<img src="' . $this->request->getStaticURL() . $menu['img'] . '" class="ui-li-icon">';
        }
        echo '<span class="menu_item_label">' . __(humanize($this->request->controller), 'module') . '</span>';
    }
    ?></h1>



    <?php
    if (isset($this)) {
        $view = &$this;
    }
    $requestURL = $this->request->get('request_url', false);
    if ($this->request->action != 'app_menu' && $requestURL === false) {
        if (!isset($this->params['controller_actions']) || $this->params['controller_actions'] !== false) {
            $controllers = array();
            if (\kernel\configuration::read('inherit_views', 0) == 1 && $this->get('inherit_views', 1) == 1) {
                $controllers = \get_parent_controllers("{$this->request->module}/{$this->request->controller}");
            }

            $listviewObject = \module\core\model\listviews::getInstance();
            $sc = $listviewObject->schema();
            if (!empty($controllers) && isset($sc['do_not_inherit'])) {
                $where = array(
                    'OR' => array(
                        "listviews.controller" => "{$this->request->module}/{$this->request->controller}",
                        array("listviews.controller" => $controllers, 'listviews.do_not_inherit !=' => 1)
                    )
                );
                $controllers[] = "{$this->request->module}/{$this->request->controller}";
            } else {
                $controllers[] = "{$this->request->module}/{$this->request->controller}";
                $where = array("listviews.controller" => $controllers);
            }
            //$controllers[] = "{$this->request->module}/{$this->request->controller}";
            //$where = array("listviews.controller" => $controllers);


            $q = array(
                'page_title' => __(str_replace('_', ' ', $this->request->controller), 'module'),
                'track_open' => 0,
                'sortable' => 0,
                'paginate_as' => 'lazy',
                'name' => __('Pick List-view'),
                'where' => $where
            );
            $listview = array(
                'field_collection' => 0,
                'helper' => '\\kernel\\form'
                , 'method' => 'popup'
                , 'name' => array('current_listview')
                , 'value' => $view->get('current_listview')
                , 'select_label' => __('Views')
                , 'select_icon' => 'arrow-d'
                , 'select_theme' => 'b'
                , 'select_iconpos' => 'right'
                , 'class' => 'big'
                , 'clear' => false
                , 'processed' => 1
                , 'field_collection' => 0
                , 'wrap_action_buttons' => false
                , 'children' => array(
                    array(
                        'helper' => '\\kernel\\form'
                        , 'model' => 'listviews'
                        , 'method' => 'popupoption'
                        , 'q' => rawurlencode(json_encode($q))
                        , 'href' => 'core/listviews/index?current_listview=SYSTEM MOBILE VIEW'
                    )
                )
            );
            echo \kernel\form::popup($view, $listview);
            $isHomeDisplayed = true;
        }
    } else if ($this->request->action == 'app_menu') {
        echo '<a data-mini="true" href="' . $this->request->base . 'access_controls/users/view/id:' . \kernel\user::read('id') . '"
       data-ajax="false" class="ui-btn-right" >' . __("My Profile") . '</a> ';
        $isHomeDisplayed = true;
    }

    if ($isHomeDisplayed == false) {
        echo '<a data-mini="true" class="home-page-link ui-btn-righ" data-direction="reverse" data-iconpos="notext" data-icon="home"
       href="' . $this->request->base . 'development_base/menus/app_menu"
       data-ajax="false" title="' . __("Home") . '" data-theme="b" ></a> ';
    }
    ?>
</div>

<?php
echo ($this->request->getMsg() != '' ? '
                    
				<div class="ui-bar ui-bar-e message-container" style="margin-top: 10px; ">
					<div style="display:inline-block; float: left; margin-top: 10px; ">' . $this->request->getMsg() . ' </div>
                                        <div style="display:inline-block; float: right; margin-top: 0px;">
                                         <a href="#" data-role="button" data-icon="delete"  id="message-panel"  data-iconpos="notext">Dismiss</a>
                                      </div>	
                               </div>
' : '');
?>
<div id="dvLoading"></div>
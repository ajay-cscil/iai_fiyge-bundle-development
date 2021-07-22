<?php

/*
  $listview = array(
  'collapsible' => 0,
  'module' => 'core',
  'controller' => 'listviews',
  'action' => 'index',
  'auto_build_where' => 0,
  'auto_load' => true,
  'load_menu' => false,
  'template_markup' => '{{CONTENT_AREA}}',
  'listview' => 'SYSTEM WEB VIEW',
  'no_records_message' => '',
  'disable_search' => true,
  'permission' => EDIT,
  'q' => array(
  'track_open' => 0
  , 'popup_view_record' => 0
  , 'search_criteria' => 0
  , 'list_row_action_label' => ''
  , 'LISTVIEW_FOR' => __(str_replace('_', ' ', $this->request->controller), 'module')
  , 'sortable' => 0
  , 'paginate_as' => 'lazy'
  , 'row_class' => '\\module\\core\\helper\\presentation\\listviews::view_icon'
  , 'show_search_row' => 0
  , 'inline_hyperlink_click' => 1
  , 'table_class' => 'sub-listview'
  , 'lca' => 0
  , 'reset_params' => 1
  , 'actions' => array(
  'view' => array('presentation' => '\\module\\core\\helper\\presentation\\config_menu::format_action')
  , 'edit' => array('class' => 'ajax-popup'), 'delete'
  )
  , 'where' => array("listviews.controller" => "{$this->request->module}/{$this->request->controller}")
  )
  );
  echo \kernel\form::listview($this, $listview);
 */
$views = array();
$controllers = array();
$replace = array();
if (\kernel\configuration::read('inherit_views', 0) == 1 && $this->get('inherit_views', 1) == 1) {
    $controllers = \get_parent_controllers("{$this->request->module}/{$this->request->controller}");
}
$replace = array();
foreach ($controllers as $controller) {
    $controller = explode("/", $controller);
    $replace[$controller[1]] = __($this->get('model'), 'module');
    $replace[$controller[1]] = __($this->get('alias'), 'module');
    $replace[singularize($controller[1])] = __($this->get('singular'), 'module');
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

$controllers = array_flip($controllers);
if (\kernel\user::read('is_admin', false) || \kernel\user::read('id') < 1) {
    
} else {
    $where['category.name != '] = 'System View';
}
$listviews = $listviewObject->find(array(
            'fields' => array("listviews.name", "listviews.controller", "category.name as 'category'", "listviews._acl",
                "listviews._acl_edit", "listviews._acl_delete", "listviews.query",
                "listviews.id")
            , 'where' => $where
            , 'order' => array("category.sequence", "listviews.sequence")
            , 'limit' => 0
        ))->fetchAll(\PDO::FETCH_ASSOC);

//$listviewsList=array();
foreach ($listviews as $info) {
    set_path_value($info['category'], $views, $info, true);
}
$listviews = array();
$from = array_keys($replace);
$to = array_values($replace);
$controller = "{$this->request->module}/{$this->request->controller}";
foreach ($views as $k => $view1) {
    $listviews[$k] = array();
    foreach ($view1 as $k1 => $v1) {
        $key = $v1['name'];
        $v1['name'] = __($v1['name']); //str_ireplace($from, $to, $v1['name']);
        $t = ($controller != $v1['controller']);
        if ($t) {
            $v1['_acl_edit'] = '';
            $v1['_acl_delete'] = '';
            $v1['override_acl'] = false;
        }
        if (!isset($listviews[$k][$key])) {
            $listviews[$k][$key] = $v1;
        } elseif (!$t) {
            $listviews[$k][] = $v1;
        } else {
            $c1 = $listviews[$k][$key]['controller'];
            if ($controllers[$c1] < $controllers[$v1['controller']]) {
                $listviews[$k][$key] = $v1;
            }
        }
    }
    $listviews[$k] = array_values($listviews[$k]);
}

echo "<table class='listview  ui-listview categorized sub-listview '>";
echo '<tr class="ui-state-default  header-row">
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " >' . __($this->request->controller, 'module') . ' </th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';
$currentListview = $this->request->get('current_listview', $this->get('current_listview'));
$links = array();
$links['view'] = $this->request->module . "/" . $this->request->controller . '/index?current_listview=';
$links['edit'] = 'core/listviews/edit/id:';
$links['delete'] = 'core/listviews/delete/id:';


$ignoreACL = \module\access_controls\behaviour\acl::ignoreACL($listviewObject);
\module\core\helper\data_view\tree::build($this, $listviews, $links, $currentListview, $ignoreACL);
echo "</table>";

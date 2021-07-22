<?php

$controllers = array();
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

$reportObject = \module\analytics\model\reports::getInstance();
$sc = $reportObject->schema();
if (!empty($controllers) && isset($sc['do_not_inherit'])) {
    $where = array(
        'OR' => array(
            "reports.controller" => "{$this->request->module}/{$this->request->controller}",
            array("reports.controller" => $controllers, 'reports.do_not_inherit !=' => 1)
        )
    );
    $controllers[] = "{$this->request->module}/{$this->request->controller}";
} else {
    $controllers[] = "{$this->request->module}/{$this->request->controller}";
    $where = array("reports.controller" => $controllers);
}
$aros = \kernel\user::read('aros', false);
$views = array();
foreach ($reportObject->find(array(
    'fields' => array("category.name as 'category'", "reports._acl", "reports._acl_edit",
        "reports._acl_delete", "reports.name",
        "reports.query", "reports.id", "reports.controller")
    , 'where' => $where
    , 'order' => array("category.sequence", "reports.controller", "reports.sequence")
    , 'limit' => 0
))->fetchAll(\PDO::FETCH_ASSOC)
as $info
) {
    set_path_value($info['category'], $views, $info, true);
}
$controllers = array_flip($controllers);
$listviews = array();
$from = array_keys($replace);
$to = array_values($replace);
$controller = "{$this->request->module}/{$this->request->controller}";
foreach ($views as $k => $view1) {
    $listviews[$k] = array();
    foreach ($view1 as $k1 => $v1) {
        $key = $v1['name'];
        $v1['name'] = __($v1['name']); //str_ireplace($from, $to, $v1['name']);
        if ($controller != $v1['controller']) {
            $v1['_acl_edit'] = '';
            $v1['_acl_delete'] = '';
            $v1['override_acl'] = false;
        }
        if (!isset($listviews[$k][$key])) {
            $listviews[$k][$key] = $v1;
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
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " > ' . (isset($this->params['name']) ? __($this->params['name']) : __('Reports')) . '</th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';

$currentListview = $this->request->get('current_report', $this->get('current_report'));
$links = array();
$links['view'] = $this->request->module . "/" . $this->request->controller . "/_report?current_report=";
$links['edit'] = 'analytics/reports/edit/id:';
$links['delete'] = 'analytics/reports/delete/id:';
$ignoreACL = \module\access_controls\behaviour\acl::ignoreACL($reportObject);
\module\core\helper\data_view\tree::build($this, $listviews, $links, $currentListview, $ignoreACL);
echo "</table>";




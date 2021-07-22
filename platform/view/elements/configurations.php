<?php

$urls = array();
$currentModelObj = "\\module\\{$this->request->module}\\model\\{$this->request->controller}";
$configModels = get_config_models($currentModelObj, $this->request->module);
$configModels = array_unique($configModels);
foreach ($configModels as $configModel) {
    $configModel = explode(NS, $configModel);
    $configModel = "{$configModel[2]}/{$configModel[4]}/index";
    $urls[$configModel] = $configModel;
}

if (!empty($urls)) {
    $urls = array_values($urls);
    $compatibleWith = (\kernel\request::$mobile == true ? 'mobile_compatible' : 'web_compatible');
    $modelObj = \module\development_base\model\menus::getInstance(array(), true);
    $urls = $modelObj->find(
                    array(
                        'fields' => array("{$modelObj->alias}.url_key"),
                        'where' => array("{$modelObj->alias}.url_key" => $urls, "{$modelObj->alias}.is_active" => 1, "{$modelObj->alias}.{$compatibleWith}" => 1),
                        'order' => array("{$modelObj->alias}.lft"),
                        'limit' => 0
                    )
            )->fetchAll(\PDO::FETCH_COLUMN);
}
$controllers = array();
foreach ($urls as $url) {
    $url = explode("/", $url);
    $url1 = "{$url[0]}/{$url[1]}";
    $controllers[$url[1]] = $url1;
}

ksort($controllers);
$controllers = array_values($controllers);

if (!empty($controllers)) {
    $aros = \kernel\user::read('aros', false);
    $views = array();
    $listviewObject = \module\core\model\listviews::getInstance();
    foreach ($listviewObject->find(array(
        'fields' => array("listviews._acl", "listviews._acl_edit", "listviews._acl_delete", "listviews.name", "listviews.query", "listviews.id", "listviews.controller")
        , 'where' => array("listviews.controller" => $controllers, "listviews.is_default" => 1)
        , 'order' => array("listviews.controller", "listviews.sequence")
        , 'limit' => 0
        , 'group' => "listviews.controller"
    ))->fetchAll(\PDO::FETCH_ASSOC)
    as $info
    ) {
        if (!isset($views[$info['controller']])) {
            $views[$info['controller']] = $info;
        }
    }

    echo "<table class='listview  ui-listview categorized sub-listview '>";
    echo '<tr class="ui-state-default  header-row">
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " > ' . (isset($this->params['name']) ? __($this->params['name']) : __('Configurations')) . '</th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';

    $ignoreACL = \module\access_controls\behaviour\acl::ignoreACL($listviewObject);
   
    $currentListview = $this->request->get('current_listview', $this->get('current_listview'));
    foreach ($controllers as $controller) {
        if (!isset($views[$controller])) {
            continue;
        }
        $v = $views[$controller];
        $controller1 = explode("/", $controller);
        $controller1 = humanize(str_replace('config_', '', $controller1[1]));
        $q = json_decode($v['query'], true);
        if (!isset($q['render_as'])) {
            $q['render_as'] = 'index';
        }
        $uh = '';
        if (isset($q['ui_helper'])) {
            $uh = explode('::', $q['ui_helper']);
            $uh = $uh[1];
        }
        $classdecider = ($currentListview == $v['id']);
        $classtobe = $classdecider == FALSE ? "<tr class=' record-row " : "<tr class=' ";
        echo $classtobe . "{$q['render_as']}  " . str_replace(" ", "-", strtolower($v['name'])) . " " . ($currentListview == $v['id'] ? ' ui-widget-header ' : '') . " " . $uh . "'>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class='twisty-file'></div>
                    <a href='" . $this->request->base . $this->request->module . "/" . $this->request->controller . "/index?request_url=" . $controller . '/index?current_listview=' . $v['id'] . "'>" . __($controller1, 'module') . "</a>
                </td>
                <td class='list-row-action'  style='padding-left:4px;padding-right:4px;'>
                    ";
        //\kernel\user::read('is_admin', false) || \kernel\configuration::read('disable_data_acl') == true || 
        if ($ignoreACL || array_intersect(explode(" ", implode(" ", \array_intersect_key($v, array("_acl_edit" => 1, "_acl_tmp_edit" => 1)))), $aros)) {

            echo"         
            <a title='edit' style='display: inline-block;' 
                    data-ajax='false' 
                    class='ui-state-highlight edit ajax-popup'
            href='" . $this->request->base . 'core/listviews/edit/id:' . $v['id'] . "'>
            <span class='ui-icon ui-icon-pencil'></span>
            </a>";
        }
        //\kernel\user::read('is_admin', false) || \kernel\configuration::read('disable_data_acl') == true || 
        if ($ignoreACL || array_intersect(explode(" ", implode(" ", \array_intersect_key($v, array("_acl_delete" => 1, "_acl_tmp_delete" => 1)))), $aros)) {

            echo "
            <a title='delete' style='display: inline-block;' 
            data-ajax='false' 
            class='ui-state-error delete'
            href='" . $this->request->base . 'core/listviews/delete/id:' . $v['id'] . "'>
            <span class='ui-icon ui-icon-close'></span>
            </a>";
        }

        echo "</td></tr>";
    }
    echo "</table>";
}
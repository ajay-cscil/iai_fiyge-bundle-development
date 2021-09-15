<?php

$fl = module_path($this->request->module) . DS . 'model' . DS . $this->request->controller . '.php';
if (file_exists($fl)) {
    $currentModelObj = "\\module\\{$this->request->module}\\model\\{$this->request->controller}";
    $urls = array();
    if (class_name_exists($currentModelObj)) {
        $currentModelObj = $currentModelObj::getInstance(array(), true);
        foreach ($currentModelObj->associations as $asscoName => $assocInfo) {
            if ($assocInfo['assocType'] == "hasMany" || $assocInfo['assocType'] == "hasAndBelongsToMany") {
                if(isset($assocInfo['foreignKey']) &&  in_array($assocInfo['foreignKey'],["created_by","modified_by","deleted_by"])){
                    continue;
                }
                //access_controls/users
                $className = explode(NS, $assocInfo['className']);
                $className = "$className[2]/$className[4]/index";
                $urls[$className] = $className;
            }
        }
    }
    if (!empty($urls)) {
        $urls = array_values($urls);
        $compatibleWith = (\kernel\request::$mobile == true ? 'mobile_compatible' : 'web_compatible');
        $modelObj = \module\development_base\model\menus::getInstance(array(), true);
        $urls = $modelObj->find(
                        array(
                            'fields' => array("{$modelObj->alias}.url_key"),
                            'where' => array(
                                "{$modelObj->alias}.url_key" => $urls
                            ),
                            'order' => array("{$modelObj->alias}.sequence"),
                            'limit' => 0
                        )
                )->fetchAll(\PDO::FETCH_COLUMN);
    }
    $modelList = array();
    foreach ($urls as $url) {
        $url = explode("/", $url);
        $url = "{$url[0]}/{$url[1]}";
        $modelList[$url] = $url;
    }
    $modelList = array_values($modelList);
    $controllers = array();
    $compatibleWith = (\kernel\request::$mobile == true ? 'mobile_compatible' : 'web_compatible');
    if (!empty($urls)) {
        $aros = \kernel\user::read('aros', false);
        $views = $views1 = array();
        $listviewObject = \module\core\model\listviews::getInstance();
        foreach ($listviewObject->find(array(
            'fields' => array("listviews._acl", "listviews._acl_edit", "listviews._acl_delete", "listviews.name", "listviews.query", "listviews.id", "listviews.controller")
            , 'where' => array("listviews.controller" => $modelList, "listviews.is_default" => 1)
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
        foreach (array_diff_key(array_flip($modelList), $views) as $controller => $v) {
            $cp = explode("/", $controller);
            if (class_name_exists("\\module\\{$cp[0]}\\controller\\{$cp[1]}")) {
                $views[$controller] = array("_acl" => "", "_acl_edit" => "", "_acl_delete" => "", "name" => $controller, "query" => "", "id" => null, "controller" => $controller);
            }
        }
        echo "<table class='listview  ui-listview categorized sub-listview '>";
        echo '<tr class="ui-state-default  header-row">
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " > ' . (isset($this->params['name']) ? __($this->params['name']) : __('Has Many Relations')) . '</th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';

        $currentListview = $this->request->get('current_listview', $this->get('current_listview'));
        $ignoreACL = \module\access_controls\behaviour\acl::ignoreACL($listviewObject);
        foreach ($views as $controller => $v) {
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
                    <a href='" . $this->request->base . $this->request->module . "/" . $this->request->controller . "/index?request_url=" . $controller . '/index' . (!empty($v['id']) ? '?current_listview=' . $v['id'] : '') . "'>{$controller1}</a>
                </td>
                <td class='list-row-action'  style='padding-left:4px;padding-right:4px;'>
                    ";
            if (!empty($v['id'])) {
                //\kernel\user::read('is_admin', false) || \kernel\configuration::read('disable_data_acl') == true || 
                if ($ignoreACL || array_intersect(explode(" ", implode(" ", \array_intersect_key($v, array( "_acl_edit" => 1, "_acl_tmp_edit" => 1)))), $aros)) {

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
            }

            echo "</td></tr>";
        }
        echo "</table>";
    }
}
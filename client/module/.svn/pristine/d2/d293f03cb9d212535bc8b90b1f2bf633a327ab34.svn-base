<?php

if (!isset($listViewID)) {
    $listViewID = $this->request->get('current_listview', $this->get('current_listview'));
}
$views = \module\documentation\model\sections::getInstance()->find(array(
            'fields' => array("*")
            , 'limit' => 0
            , 'order' => array('lft asc')
        ))->fetchAll(\PDO::FETCH_ASSOC);
$views = \tushar\app::threaded($views);
echo "<table class='listview  ui-listview categorized sub-listview '>";
echo '<tr class="ui-state-default  header-row">
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " >' . __(humanize($this->request->controller), 'module') . ' ' . __(humanize('categories'), 'module') . '</th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';
$links = array();
$links['view'] = $this->request->module . "/" . $this->request->controller . '/' . $this->request->action . '?current_listview=';
\module\documentation\helper\data_view\tree::build($this, $views, $links, $listViewID);
echo "</table>";

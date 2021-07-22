<?php

if (!isset($listViewID)) {
    $listViewID = $this->request->get('current_listview', $this->get('current_listview'));
}
$tree = array();
$positionList = module\documentation\model\related_topics::getInstance()->topicsASTree($tree, $parentID = 0);

$views = isset($tree['children']) ? $tree['children'] : array();
echo "<table class='listview  ui-listview categorized sub-listview '>";
echo '<tr class="ui-state-default  header-row">
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " >' . __(humanize($this->request->controller), 'module') . '</th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';

$links = array();
//$links['view'] = $this->request->module . "/" . $this->request->controller . '/__view?';
$links = array();
$links['view'] = $this->request->module . "/" . $this->request->controller . '/__view' . '?';
$currentTopicID = $this->data('topics.id');
var_dump($currentTopicID);
\module\documentation\helper\data_view\tree::build($this, $views, $links, $listViewID, $currentTopicID);
echo "</table>";

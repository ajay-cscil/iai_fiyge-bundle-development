<?php

if (!isset($listViewID)) {
    $listViewID = $this->request->get('current_listview', $this->get('current_listview'));
}
$tree = array();
$relatedTopicsObj = module\documentation\model\related_topics::getInstance();
$views = \select(array("{$relatedTopicsObj->alias}.*", "(
                                            SELECT COUNT(depth_table.parent_id) FROM " . $relatedTopicsObj->table . " as depth_table
                                            WHERE depth_table.lft < " . $relatedTopicsObj->alias . ".lft
                                            AND depth_table.rgt > " . $relatedTopicsObj->alias . ".rgt
                                        ) AS depth"))->from($relatedTopicsObj)->inserted()
                ->limit(0)
                ->order("{$relatedTopicsObj->alias}.lft ASC")
                ->execute()->fetchAll(\PDO::FETCH_ASSOC);

$nodeList = array();
foreach ($views as $v) {
    $nodeList[] = $v['id'];
}
$views = \tushar\app::threaded($views);
echo "<table class='listview  ui-listview categorized sub-listview '>";
echo '<tr class="ui-state-default  header-row">
        <th data_type="VAR_STRING"  class=" ui-li-highlight VAR_STRING  category  left-to-right " >' . __(humanize($this->request->controller), 'module') . '</th>
        <th class="list-row-action-label" style="width: 12%;"></th>
        </tr>';

$links = array();
$links['view'] = $this->request->module . "/" . $this->request->controller . '/__view' . '?';
$currentTopicID = $this->data('topics.id');
\module\documentation\helper\data_view\tree::build($this, $views, $links, $listViewID, $currentTopicID);
echo "</table>";

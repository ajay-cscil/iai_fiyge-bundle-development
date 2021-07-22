<?php

/**
 *
 * write any custom code in this class, build operation wont overwrite this class once generated;
 */

namespace module\documentation\model;

class related_topics_domain_logic extends \design_model {
    /*
      public function topicsASTree(&$tree, $parentID=0, $depth=0) {
      $list = array();
      if (!isset($tree['children'])) {
      $tree['children'] = array();
      }
      $depth++;
      if ($parentID == false) {
      $tree['children'] = \select(array('topics.*', "child_relation.id as position_id"))
      ->from($this->{'topics'})
      ->inserted()
      ->join('child_relation')
      ->where(array("child_relation.parent_id IS NULL"))
      ->limit(0)
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
      } else {
      $tree['children'] = \select(array('topics.*', "{$this->alias}.id as position_id"))
      ->from($this)
      ->inserted()
      ->join('topics')
      ->where(array("{$this->alias}.parent_id" => $parentID))
      ->limit(0)
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
      }
      foreach ($tree['children'] as $k => $v) {
      $tree['children'][$k]['depth'] = $depth;
      $list[$v['position_id']] = $v['id'];
      $returnList = $this->topicsASTree($tree['children'][$k], $v['id'], $depth);
      $list = array_merge($list, $returnList);
      }
      return $list;
      }


      public function topicsASTree(&$tree, $parentID=0, $depth=0) {
      $list = array();
      if (!isset($tree['children'])) {
      $tree['children'] = array();
      }
      $depth++;
      $tree['children'] = \select(array('topics.*', 'related_topics.id as node_id'))
      ->from($this)
      ->inserted()
      ->join('topics')
      ->where(array("{$this->alias}.parent_id" => $parentID))
      ->limit(0)
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
      foreach ($tree['children'] as $k => $v) {
      $tree['children'][$k]['depth'] = $depth;
      $list[] = $v['node_id'];
      $returnList = $this->topicsASTree($tree['children'][$k], $v['id'], $depth);
      $list = array_merge($list, $returnList);
      }
      return $list;
      }


      public $dataOld = array();

      public function beforeSave() {
      parent::beforeSave();
      if (isset($this->data['id']) && !empty($this->data['id'])) {
      $this->dataOld = current($this->read($this->data['id'], false));
      }
      }

      public function beforeDelete() {
      parent::beforeDelete();
      if (isset($this->data['id']) && !empty($this->data['id'])) {
      $this->dataOld = current($this->read($this->data['id'], false));
      }
      }

      public function afterSave($created) {
      parent::afterSave($created);
      $topicIDS = array($this->data['topic_id'] => false);
      if (!empty($this->dataOld)) {
      $topicIDS[$this->dataOld['topic_id']] = true;
      }
      $this->processPlaceholderRecords($topicIDS);
      }

      public function afterDelete() {
      parent::afterDelete();
      $topicIDS = array();
      if (!empty($this->dataOld)) {
      $topicIDS[$this->dataOld['topic_id']] = true;
      }
      $this->processPlaceholderRecords($topicIDS);
      }

      protected function processPlaceholderRecords($ids) {
      foreach ($ids as $id => $status) {
      switch ($status) {
      // if $status is true then check if there exixts atleast one record, else enter one with parent = 0
      case true:
      if (select("id")->from($this)->inserted()
      ->where('topic_id', $id)
      ->limit(1)
      ->execute()->fetch(\PDO::FETCH_COLUMN, 0) == false
      ) {
      $this->saveModel(array("topic_id" => $id, 'parent_id' => 0), array('atomic' => true));
      }
      break;
      // if $status is false then check if there exixts a record with parent=0, delete it.
      case false:
      if (select("id")->from($this)->inserted()
      ->where(array('topic_id' => $id, 'parent_id' => 0))
      ->limit(1)
      ->execute()->fetch(\PDO::FETCH_COLUMN, 0) == true
      ) {
      \delete(array())->from($this)->where(array('topic_id' => $id, 'parent_id' => 0))->execute();
      }
      }
      }
      }

     */

    public function beforeValidate() {
        parent::beforeValidate();
        if (isset($this->data['topic_id']) && !empty($this->data['topic_id'])) {
            $topicInfo = current($this->{'topics'}->read($this->data['topic_id'], false));
            if (!empty($topicInfo)) {
                $this->data['name'] = $topicInfo['title'];
            }
        }
        if (isset($this->data['parent_id']) && !empty($this->data['parent_id'])) {
            $topicInfo = current($this->read($this->data['parent_id'], false));
            if (!empty($topicInfo)) {
                $this->data['parent_topic_id'] = $topicInfo['topic_id'];
            }
        }
    }

}
<?php
 /**
  *
  * Dont write any custom code in this class, build operation will overwrite this class;
  */
  namespace module\documentation\model;
  class related_topics extends \module\documentation\model\related_topics_domain_logic
  {
       public $source = 'default';
       public $table = 'documentation__related_topics';
       public $parentClass = '\\design_model';
       public $displayField = 'name';
       public $primaryKey = 'id';
       public $softDeleteColumn = 'deleted';
       public $sequenceColumnName = 'seq';
       public $isSequentialData = '0';
       public $isConfig = '0';
       public $overrideCallToParent = '0';
       public $fields = array (
  'id' => 
  array (
    'column' => 'id',
    'ntype' => 'int',
    'length' => '19',
  ),
  'parent_topic_id' => 
  array (
    'column' => 'parent_topic_id',
    'ntype' => 'int',
    'is_sortable' => '0',
    'is_searchable' => '0',
    'is_exportable' => '0',
  ),
  'topic_id' => 
  array (
    'column' => 'topic_id',
    'ntype' => 'int',
    'length' => '11',
  ),
  'parent_id' => 
  array (
    'column' => 'parent_id',
    'ntype' => 'int',
    'length' => '11',
  ),
  'owned_by' => 
  array (
    'column' => 'owned_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  'created_by' => 
  array (
    'column' => 'created_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  'modified_by' => 
  array (
    'column' => 'modified_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  'created' => 
  array (
    'column' => 'created',
    'ntype' => 'datetime',
  ),
  'modified' => 
  array (
    'column' => 'modified',
    'ntype' => 'datetime',
  ),
  'deleted' => 
  array (
    'column' => 'deleted',
    'ntype' => 'int',
    'length' => '1',
  ),
  'revision' => 
  array (
    'column' => 'revision',
    'ntype' => 'int',
    'length' => '19',
  ),
  'flags' => 
  array (
    'column' => 'flags',
    'ntype' => 'int',
    'length' => '19',
  ),
);
       public $associations = array (
  'parent_related_topic' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\documentation\\model\\related_topics',
    'associationAlias' => 'parent_related_topic',
    'foreignKey' => 'parent_id',
    'show_link' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'owned_by_user' => 
  array (
    'className' => '\\module\\access_controls\\model\\users',
    'assocType' => 'belongsTo',
    'foreignKey' => 'owned_by',
    'associationAlias' => 'owned_by_user',
  ),
  'created_by_user' => 
  array (
    'className' => '\\module\\access_controls\\model\\users',
    'assocType' => 'belongsTo',
    'foreignKey' => 'created_by',
    'associationAlias' => 'created_by_user',
  ),
  'modified_by_user' => 
  array (
    'className' => '\\module\\access_controls\\model\\users',
    'assocType' => 'belongsTo',
    'foreignKey' => 'modified_by',
    'associationAlias' => 'modified_by_user',
  ),
  'topics' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\documentation\\model\\topics',
    'associationAlias' => 'topics',
    'foreignKey' => 'topic_id',
    'show_link' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'parent_topic' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\documentation\\model\\topics',
    'associationAlias' => 'parent_topic',
    'foreignKey' => 'parent_topic_id',
    'show_link' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
);
  }
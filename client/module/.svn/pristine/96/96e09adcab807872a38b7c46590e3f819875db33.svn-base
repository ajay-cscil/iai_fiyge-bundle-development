<?php
 /**
  *
  * Dont write any custom code in this class, build operation will overwrite this class;
  */
  namespace module\documentation\model;
  class comments extends \module\documentation\model\comments_domain_logic
  {
       public $source = 'default';
       public $table = 'documentation__comments';
       public $parentClass = '\\data_model';
       public $displayField = 'comment';
       public $primaryKey = 'id';
       public $softDeleteColumn = 'deleted';
       public $sequenceColumnName = 'seq';
       public $isSequentialData = '0';
       public $isConfig = '0';
       public $overrideCallToParent = '0';
       public $fields = array (
  'comment' => 
  array (
    'column' => 'comment',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'topic_id' => 
  array (
    'column' => 'topic_id',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'is_publish' => 
  array (
    'column' => 'is_publish',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'created_by' => 
  array (
    'column' => 'created_by',
    'ntype' => 'int',
    'length' => '11',
  ),
  'modified_by' => 
  array (
    'column' => 'modified_by',
    'ntype' => 'int',
    'length' => '11',
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
    'length' => '4',
  ),
  'revision' => 
  array (
    'column' => 'revision',
    'ntype' => 'int',
    'length' => '11',
  ),
  'flags' => 
  array (
    'column' => 'flags',
    'ntype' => 'int',
    'length' => '11',
  ),
  'owned_by' => 
  array (
    'column' => 'owned_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  'id' => 
  array (
    'column' => 'id',
    'ntype' => 'int',
    'length' => '19',
  ),
);
       public $associations = array (
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
  'owned_by_user' => 
  array (
    'className' => '\\module\\access_controls\\model\\users',
    'assocType' => 'belongsTo',
    'foreignKey' => 'owned_by',
    'associationAlias' => 'owned_by_user',
  ),
);
       public $behaviours = array (
  '\\module\\access_controls\\behaviour\\acl' => 
  array (
    'cacheClass' => '1',
    'name' => '\\module\\access_controls\\behaviour\\acl',
  ),
);
       public $filters = array (
  'topic_id' => 
  array (
    0 => 
    array (
      'rule' => '1024',
      'params' => 
      array (
        'options' => 
        array (
          0 => '\\tushar\\validation',
          1 => 'notEmpty',
        ),
      ),
    ),
  ),
  'comment' => 
  array (
    0 => 
    array (
      'rule' => '1024',
      'params' => 
      array (
        'options' => 
        array (
          0 => '\\tushar\\validation',
          1 => 'notEmpty',
        ),
      ),
    ),
  ),
);
  }
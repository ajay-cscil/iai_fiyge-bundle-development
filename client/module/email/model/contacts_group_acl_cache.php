<?php
 /**
  *
  * Dont write any custom code in this class, build operation will overwrite this class;
  */
  namespace module\email\model;
  class contacts_group_acl_cache extends \module\email\model\contacts_group_acl_cache_domain_logic
  {
       public $source = 'acl';
       public $table = 'email__contacts_group_acl_cache';
       public $parentClass = '\\acl_model';
       public $displayField = 'id';
       public $primaryKey = 'id';
       public $paginateAs = 'lazy';
       public $softDeleteColumn = 'deleted';
       public $sequenceColumnName = 'seq';
       public $isSequentialData = '0';
       public $isConfig = '0';
       public $overrideCallToParent = '0';
       public $fields = array (
  'group_id' => 
  array (
    'column' => 'group_id',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'id' => 
  array (
    'is_searchable' => '1',
    'column' => 'id',
    'ntype' => 'int',
    'length' => '19',
  ),
  'is_demo_data' => 
  array (
    'column' => 'is_demo_data',
    'ntype' => 'int',
    'length' => '1',
  ),
);
       public $associations = array (
  'groups' => 
  array (
    'className' => '\\module\\access_controls\\model\\groups',
    'associationAlias' => 'groups',
    'assocType' => 'belongsTo',
    'foreignKey' => 'group_id',
    'show_link' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
);
       public $filters = array (
  'group_id' => 
  array (
    0 => 
    array (
      'rule' => 1024,
      'params' => 
      array (
        'options' => 
        array (
          0 => '\\kernel\\validation',
          1 => 'notEmpty',
        ),
      ),
    ),
  ),
);
  }
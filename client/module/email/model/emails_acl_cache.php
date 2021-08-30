<?php
 /**
  *
  * Dont write any custom code in this class, build operation will overwrite this class;
  */
  namespace module\email\model;
  class emails_acl_cache extends \module\email\model\emails_acl_cache_domain_logic
  {
       public $displayField = 'id';
       public $primaryKey = 'id';
       public $parentClass = '\\acl_model';
       public $source = 'acl';
       public $table = 'email__emails_acl_cache';
       public $fields = array (
  'user_id' => 
  array (
    'column' => 'user_id',
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
    'length' => '11',
  ),
);
       public $associations = array (
  'users' => 
  array (
    'className' => '\\module\\access_controls\\model\\users',
    'associationAlias' => 'users',
    'assocType' => 'belongsTo',
    'foreignKey' => 'user_id',
    'show_link' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
);
       public $filters = array (
  'user_id' => 
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
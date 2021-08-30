<?php
 /**
  *
  * Dont write any custom code in this class, build operation will overwrite this class;
  */
  namespace module\email\model;
  class contacts extends \module\email\model\contacts_domain_logic
  {
       public $source = 'default';
       public $table = 'email__contacts';
       public $parentClass = '\\data_model';
       public $displayField = 'name';
       public $primaryKey = 'id';
       public $paginateAs = 'lazy';
       public $singular = 'contact';
       public $softDeleteColumn = 'deleted';
       public $sequenceColumnName = 'seq';
       public $isSequentialData = '0';
       public $isConfig = '0';
       public $overrideCallToParent = '0';
       public $associations = array (
  'created_by_user' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\access_controls\\model\\users',
    'associationAlias' => 'created_by_user',
    'foreignKey' => 'created_by',
    'show_link' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'modified_by_user' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\access_controls\\model\\users',
    'associationAlias' => 'modified_by_user',
    'foreignKey' => 'modified_by',
    'show_link' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'owned_by_user' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\access_controls\\model\\users',
    'associationAlias' => 'owned_by_user',
    'foreignKey' => 'owned_by',
    'show_link' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'imported_by_user' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\access_controls\\model\\users',
    'associationAlias' => 'imported_by_user',
    'foreignKey' => 'imported_by',
    'show_link' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'config_departments' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\crm\\model\\config_departments',
    'associationAlias' => 'config_departments',
    'foreignKey' => 'department',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'show_link' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'config_salutations' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\masters\\model\\config_salutations',
    'associationAlias' => 'config_salutations',
    'foreignKey' => 'salutation',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'show_link' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'addresses' => 
  array (
    'assocType' => 'hasMany',
    'className' => '\\module\\crm_base\\model\\addresses',
    'associationAlias' => 'addresses',
    'foreignKey' => 'related_to',
    'on' => 
    array (
      0 => '{{PRIMARY}}.{{PRIMARY_KEY}}={{FOREIGN}}.{{FOREIGN_KEY}}',
      1 => '\'{{PRIMARY}}\'={{FOREIGN}}.related_to_model',
    ),
    'show_link' => '1',
    'isAclChild' => '1',
    'isSubModel' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
  ),
  'email_addresses' => 
  array (
    'assocType' => 'hasMany',
    'className' => '\\module\\crm_base\\model\\email_addresses',
    'associationAlias' => 'email_addresses',
    'foreignKey' => 'related_to',
    'on' => 
    array (
      0 => '{{PRIMARY}}.{{PRIMARY_KEY}}={{FOREIGN}}.{{FOREIGN_KEY}}',
      1 => '\'{{PRIMARY}}\'={{FOREIGN}}.related_to_model',
    ),
    'show_link' => '1',
    'isAclChild' => '1',
    'isSubModel' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
  ),
  'phone_numbers' => 
  array (
    'assocType' => 'hasMany',
    'className' => '\\module\\crm_base\\model\\phone_numbers',
    'associationAlias' => 'phone_numbers',
    'foreignKey' => 'related_to',
    'on' => 
    array (
      0 => '{{PRIMARY}}.{{PRIMARY_KEY}}={{FOREIGN}}.{{FOREIGN_KEY}}',
      1 => '\'{{PRIMARY}}\'={{FOREIGN}}.related_to_model',
    ),
    'show_link' => '1',
    'isAclChild' => '1',
    'isSubModel' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
  ),
  'config_industries' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\crm\\model\\config_industries',
    'associationAlias' => 'config_industries',
    'foreignKey' => 'industry',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'show_link' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'unread_records' => 
  array (
    'assocType' => 'hasMany',
    'className' => '\\module\\logging\\model\\action_history',
    'associationAlias' => 'unread_records',
    'foreignKey' => 'record_id',
    'on' => 
    array (
      0 => '{{FOREIGN}}.controller=\'{{PRIMARY}}\'',
      1 => ' {{FOREIGN}}.record_id={{PRIMARY}}.{{PRIMARY_KEY}}',
      2 => '{{FOREIGN}}.created_by={{CURRENT_USER}}',
    ),
    'isSearchable' => '1',
    'isAclParent' => '0',
    'show_link' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'primary_countries' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\masters\\model\\countries',
    'associationAlias' => 'primary_countries',
    'foreignKey' => 'primary_country',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'show_link' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
  'groups' => 
  array (
    'assocType' => 'belongsTo',
    'className' => '\\module\\access_controls\\model\\groups',
    'associationAlias' => 'groups',
    'foreignKey' => 'primary_acl_group',
    'show_link' => '1',
    'isSearchable' => '1',
    'isAclParent' => '0',
    'isAclChild' => '0',
    'isSubModel' => '0',
  ),
);
       public $behaviours = array (
  '\\module\\access_controls\\behaviour\\acl' => 
  array (
    'name' => '\\module\\access_controls\\behaviour\\acl',
    'readAccess' => '4',
    'editAccess' => '4',
    'deleteAccess' => '4',
    'cacheClass' => '1',
    'ownAcl' => '1',
    'isSearchable' => '0',
  ),
  '\\module\\brules\\behaviour\\business_rules' => 
  array (
    'name' => '\\module\\brules\\behaviour\\business_rules',
    'isSearchable' => '0',
  ),
  '\\module\\core\\behaviour\\revision_log' => 
  array (
    'name' => '\\module\\core\\behaviour\\revision_log',
  ),
);
       public $fields = array (
  'salutation' => 
  array (
    'column' => 'salutation',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'first_name' => 
  array (
    'column' => 'first_name',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'last_name' => 
  array (
    'column' => 'last_name',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'name' => 
  array (
    'column' => 'name',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'title' => 
  array (
    'column' => 'title',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'department' => 
  array (
    'column' => 'department',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'fax' => 
  array (
    'column' => 'fax',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'related_to' => 
  array (
    'column' => 'related_to',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'related_to_model' => 
  array (
    'column' => 'related_to_model',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'training' => 
  array (
    'column' => 'training',
    'ntype' => 'string',
    'is_sortable' => '0',
    'is_searchable' => '0',
    'is_multi_value' => '0',
  ),
  'industry' => 
  array (
    'column' => 'industry',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'do_not_call' => 
  array (
    'column' => 'do_not_call',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'reference' => 
  array (
    'column' => 'reference',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'notify_owner' => 
  array (
    'column' => 'notify_owner',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'assistant' => 
  array (
    'column' => 'assistant',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'birthday' => 
  array (
    'column' => 'birthday',
    'ntype' => 'date',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'created_by' => 
  array (
    'column' => 'created_by',
    'ntype' => 'int',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  '_acl' => 
  array (
    'column' => '_acl',
    'ntype' => 'string',
    'is_sortable' => '0',
    'is_searchable' => '0',
    'is_multi_value' => '0',
  ),
  '_acl_edit' => 
  array (
    'column' => '_acl_edit',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  '_acl_delete' => 
  array (
    'column' => '_acl_delete',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  '_acl_tmp' => 
  array (
    'column' => '_acl_tmp',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  '_acl_tmp_edit' => 
  array (
    'column' => '_acl_tmp_edit',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  '_acl_tmp_delete' => 
  array (
    'column' => '_acl_tmp_delete',
    'ntype' => 'string',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'imported' => 
  array (
    'column' => 'imported',
    'ntype' => 'datetime',
    'is_sortable' => '1',
    'is_searchable' => '1',
    'is_exportable' => '1',
  ),
  'primary_acl_group' => 
  array (
    'column' => 'primary_acl_group',
    'ntype' => 'int',
    'is_sortable' => '0',
    'is_searchable' => '1',
    'is_exportable' => '0',
  ),
  'id' => 
  array (
    'is_searchable' => '1',
    'column' => 'id',
    'ntype' => 'int',
    'length' => '19',
  ),
  'description' => 
  array (
    'is_searchable' => '1',
    'column' => 'description',
    'ntype' => 'string',
  ),
  'modified_by' => 
  array (
    'is_searchable' => '1',
    'column' => 'modified_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  'owned_by' => 
  array (
    'is_searchable' => '1',
    'column' => 'owned_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  'created' => 
  array (
    'is_searchable' => '1',
    'column' => 'created',
    'ntype' => 'datetime',
  ),
  'modified' => 
  array (
    'is_searchable' => '1',
    'column' => 'modified',
    'ntype' => 'datetime',
  ),
  'deleted' => 
  array (
    'is_searchable' => '1',
    'column' => 'deleted',
    'ntype' => 'int',
    'length' => '1',
  ),
  'revision' => 
  array (
    'is_searchable' => '1',
    'column' => 'revision',
    'ntype' => 'int',
    'length' => '19',
  ),
  'flags' => 
  array (
    'is_searchable' => '1',
    'column' => 'flags',
    'ntype' => 'int',
    'length' => '19',
  ),
  'imported_by' => 
  array (
    'is_searchable' => '1',
    'column' => 'imported_by',
    'ntype' => 'int',
    'length' => '19',
  ),
  '_fulltext' => 
  array (
    'column' => '_fulltext',
    'ntype' => 'string',
    'length' => '1000',
    'is_sortable' => '0',
    'is_searchable' => '0',
    'is_multi_value' => '0',
  ),
);
       public $filters = array (
  'email_opt_out' => 
  array (
    0 => 
    array (
      'rule' => 257,
      'params' => 
      array (
      ),
    ),
  ),
  'first_name' => 
  array (
    0 => 'required',
    1 => 
    array (
      'rule' => '\\kernel\\validation::notEmpty',
      'params' => 
      array (
      ),
    ),
  ),
  'last_name' => 
  array (
    0 => 'required',
    1 => 
    array (
      'rule' => '\\kernel\\validation::notEmpty',
      'params' => 
      array (
      ),
    ),
  ),
  'name' => 
  array (
    0 => 
    array (
      'rule' => '1024',
      'params' => 
      array (
        'options' => 
        array (
          0 => '\\kernel\\transformation',
          1 => 'name',
        ),
      ),
      'sanitize' => 1,
    ),
  ),
);
  }
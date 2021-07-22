<?php

class data_model extends \kernel\model {

    public $acl = array();

    public function beforeFind() {
        parent::beforeFind();
    }

    // @question - is this function used only for owned_by scenario, or used for record ACL too. Couldn't other people who are not owners not be able to read it ?
    // @answer - explain down , This methods are overwritten by ACL behavious if applicable
    public function isNotReadable($id) {
        $perm = parent::isNotReadable($id);
        if ($perm) {
            return $perm;
        }
        if (!empty($id) && !$this->isOwnerOrCreator($id)) {
            return sprintf(__('You dont have permission to %s %s [%s] as you are not owner or creator'), __('read'), __($this->singular, 'module'), $id);
        }
        return false;
    }

    // @question - very important for us to have the pre-commit hook and formatting - this is very difficult for me to read - I already formatted the previous one
    // @answer - Ya true, last time i did but netbeans removed it at certain places
    public function isNotDeletable($id) {
        $perm = parent::isNotDeletable($id);
        if ($perm) {
            return $perm;
        }
        if (!empty($id) && !$this->isOwnerOrCreator($id)) {
            return sprintf(__('You dont have permission to %s %s [%s] as you are not owner or creator'), __('delete'), __($this->singular, 'module'), $id);
        }
        return false;
    }

    public function isNotEditable($id = null) {
        $perm = parent::isNotEditable($id);
        if ($perm) {
            return $perm;
        }
        if (!empty($id) && !$this->isOwnerOrCreator($id)) {
            return sprintf(__('You dont have permission to %s %s [%s] as you are not owner or creator'), __('edit'), __($this->singular, 'module'), $id);
        }
        return false;
    }

    protected function isOwnerOrCreator($id = null) {
        return (bool) $this->find(array(
                    'fields' => array("{$this->alias}.{$this->primaryKey}")
                    , 'where' => array(
                        "{$this->alias}.{$this->primaryKey}" => $id
                        , "OR" => array("{$this->alias}.created_by" => \kernel\user::read('id', 0), "{$this->alias}.owned_by" => array(0, \kernel\user::read('id', 0)))
                    )
                    , 'limit' => 1
                ))->fetch(\PDO::FETCH_COLUMN, 0);
    }

    public function beforeSave() {
        if (isset($this->data[$this->primaryKey]) && !empty($this->data[$this->primaryKey])) {
            $this->dataOld = current($this->read($this->data[$this->primaryKey], array()));
        }

        parent::beforeSave();
    }

    public function afterSave($created) {
        if ($this->callbackLog('beforeSave') === false) {
            throw new \Exception(sprintf(__('You are not calling "parent::%s" in "%s" or one of its parent class as required by data ACL'), 'beforeSave', $this->modelClass));
        }
        parent::afterSave($created);
    }

    public function init() {
        parent::init();
        $this->acl = array();
    }

}
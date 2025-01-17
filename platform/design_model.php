<?php

class design_model extends \kernel\model {

    public $behaviours = array('\\kernel\\behaviour\\tree');
    public $computeDepth = true;

    public function cloned($data, $options=array()) {
        //10. Set defaults
        $options = array_merge($this->saveOptions, $options);
        $return = array();
        try {
            if ($options['validate'] === 'before' && $this->__validate($data, $options['fields']) === false) {
                return false;
            }
            if ($options['atomic'] === false) {
                \kernel\source::getInstance($this->source)->transaction('begin');
            }
            $this->computeDepth = false;
            //20. call _save
            $newModuleID=(isset($data[$this->alias]) && isset($data[$this->alias]['module_id'])?$data[$this->alias]['module_id']:'');
            $return = $this->__save($data, $options);

            $dataNew = $data;
            $dataOld = current($this->read($this->cloned));

            $oldModuleID=(isset($dataOld['module_id'])?$dataOld['module_id']:'');
            

            if (!empty(static::$errors)) {
                if ($options['atomic'] === false) {
                    \kernel\source::getInstance($this->source)->transaction('rollback');
                }
                return false;
            }
            if ($this->cloned !== false) {
                    $data = $this->find(
                                    array(
                                        'fields' => '{{MODEL}}.*',
                                        'where' => [],
                                        'order' => array('{{MODEL}}.sequence ASC'), 
                                        'limit' => 0,
                                        'with_recursive'=>['{{MODEL}}.{{PRIMARY_KEY}}' => $this->cloned]
                                    )
                            )->fetchAll(\PDO::FETCH_ASSOC);

                    


                    if (isset($data[0]) && isset($data[0]['parent_id'])) {
                        $data[0]['parent_id'] = null;
                    }
                    $data = \kernel\app::threaded($data);
                    if (!empty($data)) {
                        $data = current($data);
                        $data = isset($data['children']) ? $data['children'] : array();
                        $this->cloneChildren($data, $this->id, $dataOld, $this->data, $oldModuleID, $newModuleID);
                    }
            }
            if (!empty(static::$errors)) {
                if ($options['atomic'] === false) {
                    \kernel\source::getInstance($this->source)->transaction('rollback');
                }
                return false;
            }

            $this->computeDepth = true;
            $this->call('updateDepth', array(array("{$this->alias}.depth" => 0)), array('\\kernel\\behaviour\\tree'));

            if ($options['atomic'] === false) {
                \kernel\source::getInstance($this->source)->transaction('commit');
            }
        } catch (\Exception $e) {
            if ($options['atomic'] === false) {
                \kernel\source::getInstance($this->source)->transaction('rollback');
            }
            static::$errors[] = $e->getMessage();
            return false;
        }
        $return = current($return);
        $this->computeDepth = true;


        return $return;
    }

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @param type $form
     * @param type $parentId
     */
    public function cloneChildren($records, $parentId, $dataOld, $dataNew, $oldModuleID='', $newModuleID='') {
        $data = array();
        foreach ($records as $record) {
            $ignoreColumns = array_flip($this->standardColumns);
            $ignoreColumns["{$this->primaryKey}"] = 1;
            $ignoreColumns["children"] = 1;
            $data[$this->alias] = array_diff_key($record, $ignoreColumns);

            $data[$this->alias]['parent_id'] = $parentId;

            if(!empty($oldModuleID) && !empty($newModuleID)){
                if(isset($data[$this->alias]['module_id']) && $data[$this->alias]['module_id'] == $oldModuleID){
                    $data[$this->alias]['module_id']=$newModuleID;
                }
            }

            $modelClass = $this->modelClass;
            $aparentId = $modelClass::getInstance()->save($data, array('atomic' => true));
            if ($aparentId === false) {
                static::$errors[] = sprintf(__("Failed cloning child record due to above reasons: Failed Record is %s %s"), '<br />', json_encode(array_diff_key($record, array('children' => 1))));
                return;
            }
            if ($aparentId && isset($record['children']) && !empty($record['children'])) {
                $this->cloneChildren($record['children'], $aparentId, $dataOld, $dataNew, $oldModuleID, $newModuleID);
            }
        }
    }

    public function beforeDelete() {
        if (is_array($this->associations)) {
            foreach ($this->associations as $assocModel => $assocInfo) {
                if (!isset($assocInfo['isSubModel']) || $assocInfo['isSubModel'] == false) {
                    if (isset($assocInfo['foreignKey']) && $assocInfo['foreignKey'] == $this->parentKey) {
                        $this->associations[$assocModel]['skipForeignKeyCheck'] = 1;
                        //unset($this->associations[$assocModel]);
                    }
                }
            }
        }
        if (isset($this->associations['design_acl'])) {
            $this->associations['design_acl']['skipForeignKeyCheck'] = 1;
        }
        parent::beforeDelete();
    }

    public function indexRecursiveTree($parentID=null){
        $sequence=1;
        $instance = \kernel\source::getInstance($this->source);
        $data = select(array("{$this->alias}.*"))
                        ->from($this)
                        ->where(['parent_id'=>$parentID,'deleted !='=>1])
                        ->order(['`left` ASC'])
                        ->limit(0)
                        ->execute()
                        ->fetchAll(\PDO::FETCH_ASSOC);

        foreach( $data as $record){
            $update = [
                'fields' => ["sequence" => $sequence],
                'table' => ['db' => $this->db, 'table' => $this->table],
                'type' => 'update', 
                'where' => ["id"=>$record['id']]
            ];
            $instance->save($update, false);
            $sequence++;
            $this->indexRecursiveTree($record['id']);
        }

        if(is_null($parentID) || empty($parentID)){
                $parentID="";
                $schema=$this->schema();
                $records=select(array("{$this->alias}.*"))
                            ->from($this)
                            ->withRecursive(['parent_id'=>''])
                            ->order(['sequence ASC'])
                            ->limit(0)
                            ->execute()
                            ->fetchAll(\PDO::FETCH_ASSOC);
                            
                 foreach($records as $record){
                    $update = [
                        'fields' => ["full_name" => $record['full_name']],
                        'table' => ['db' => $this->db, 'table' => $this->table],
                        'type' => 'update', 
                        'where' => ["id"=>$record['id']]
                    ];
                    $instance->save($update, false);
                 }
                        
        }


    }

}
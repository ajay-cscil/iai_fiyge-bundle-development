<?php

class design_controller extends \kernel\controller {

    public function edit($request) {
        $request->layout = "detail";
        $return = parent::edit($request);

        $modelObj = $this->modelObj;
        $request->layout = "detail";
        $id = $request->param(array('data', $modelObj->alias, $modelObj->primaryKey), false);
        if ($id === false)
            $id = $request->param('id');
        if (!empty($id))
            $request->subPanelElements = array('tags', 'list_tags');

        $request->set('singleton_key', $request->singletonKey());

        return $return;
    }

    public function view($request) {
        $request->layout = "detail";
        $return = parent::view($request);
        $request->layout = "detail";

        $modelObj = $this->modelObj;
        $id = $request->param(array('data', $modelObj->alias, $modelObj->primaryKey), false);
        if ($id === false)
            $id = $request->param('id');
        if (!empty($id))
            $request->subPanelElements = array('tags', 'list_tags');

        $data = $request->response('data');
        $request->set('jvar', array('data' => $data));
        return $return;
    }

// @question - these seem like tree behaviour
// @answer - This are not tree behaviour, They are controller actions. This actions inturn trigger "move" method of tree behaviour
    public function up($request) {
        $modelObj = $this->modelObj();
        $id = $request->param('id');
        $dir = 'up';
        if (empty($id)) {
            throw new \Exception(__('Missing record id'));
        }
        $modelObj->call('move', array($id, $dir), array('\\kernel\\behaviour\\tree'));
        $request->setMsg(sprintf(__('Record is moved %s'), $dir));
        return("{$request->module}/{$request->controller}/index");
    }

    public function down($request) {
        $modelObj = $this->modelObj();
        $id = $request->param('id');
        $dir = 'down';
        if (empty($id)) {
            throw new \Exception(__('Missing record id'));
        }
        $modelObj->call('move', array($id, $dir), array('\\kernel\\behaviour\\tree'));
        $request->setMsg(sprintf(__('Record is moved %s'), $dir));
        return("{$request->module}/{$request->controller}/index");
    }

    //public function edit_selected($request) {
    //    throw new \Exception('This action is not supported');
    //}

    public function delete_selected($request) {
        throw new \Exception('This action is not supported');
    }

    public function reindex($request) {
        $modelObj = $this->modelObj();
        $this->render = 'comet';
        $request->set('title', sprintf(__('Computing index(lft/rgt) for model "%s"'), __($modelObj->singular)));
        $request->set('pull_request_url', "{$request->module}/{$request->controller}/_reindex_process");
    }

    public function _reindex_process($request) {
        set_time_limit(0);
        $request->push(__('Start'));
        $modelObj = $this->modelObj();
        $sc = $modelObj->schema();
        $instance = \kernel\source::getInstance($modelObj->source);
        //$instance->execute("UNLOCK TABLES");
        if ($sc[$modelObj->parentKey]['const'] === INT) {
            $where = array(
                'OR' => array("{$modelObj->parentKey} IS NULL", "{$modelObj->parentKey}" => '0')
            );
        } else {
            $where = array(
                'OR' => array("{$modelObj->parentKey} IS NULL", "{$modelObj->parentKey}" => '')
            );
        }
        
        $request->push(__('Searching records'));
        $records = \select(["*"])
                ->from($modelObj)
                ->inserted()
                ->withRecursive($where)
                ->order("sequence ASC")
                ->limit(0)
                ->execute()
                ->fetchAll(\PDO::FETCH_ASSOC);

        $parents=[];
        foreach($records as $record){
            $parentID=(is_null($record['parent_id']) || $record['parent_id']==""?"root":$record['parent_id']);
            if(!isset($parents[$parentID])){
                $parents[$parentID]=1;
            }
            $instance->save(
                    array(
                        'fields' => array(
                            "sequence" => $parents[$parentID]
                        ),
                        'table' => array(
                            'db' => $modelObj->db,
                            'table' => $modelObj->table
                        ),
                        'where' => array("{$modelObj->primaryKey}" => $record['id'])
                    ),
                     true);
            $parents[$parentID]++;
        }        
        $request->push(__('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;End processing'));
        
        $request->push(__('End'));
        exit;
    }

    private function recursive($modelObj, $parentID) {
        $records = \select(array($modelObj->primaryKey, $modelObj->parentKey))
                ->from($modelObj)
                ->inserted()
                ->where(array("$modelObj->parentKey" => $parentID))
                ->order(array("{$modelObj->parentKey} ASC", "sequence ASC"))
                ->limit(0)
                ->execute()
                ->fetchAll(\PDO::FETCH_ASSOC);
        $ids = array();
        foreach ($records as $record) {
            $ids[] = $record[$modelObj->primaryKey];
        }
        if (!empty($ids)) {
            $rr = $this->recursive($modelObj, $ids);
            if (is_array($rr)) {
                $records = array_merge($records, $rr);
            }
        }
        return $records;
    }

    protected function recordLabel($request) {
        $id = $this->id($request);
        $modelObj = $this->modelObj();
        $label = (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record');
        return $label;
    }

    public function _update_module_id($request) {
        set_time_limit(0);
        $modelObj = $this->modelObj();
        $schema = $modelObj->schema();
        $classColumnName = null;
        if (isset($schema['model_class'])) {
            $classColumnName = 'model_class';
        } else if (isset($schema['controller_class'])) {
            $classColumnName = 'controller_class';
        }
        if (!is_null($classColumnName)) {
            $modules = array();
            foreach (\select(array('name', 'id'))
                    ->from(\module\development_base\model\modules::getInstance())
                    ->limit(0)
                    ->inserted()
                    ->execute()
                    ->fetchAll(\PDO::FETCH_ASSOC) as $info) {
                $modules[$info['name']] = $info['id'];
            }
            $infoList = \select("*")
                    ->from($modelObj)
                    ->where(array("{$classColumnName} is NOT NULL", "{$classColumnName} !=" => ""))
                    ->limit(0)
                    ->execute()
                    ->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($infoList as $info) {
                $class = $info[$classColumnName];
                $class = explode('\\', $class);
                if (isset($class[2]) && isset($modules[$class[2]])) {
                    $moduleID = $modules[$class[2]];
                    \update(array("module_id" => $moduleID))
                            ->from($modelObj)
                            ->where(
                                    array(
                                        "id" => $info['id'], "OR" => array("module_id is NULL", "module_id" => "")
                                    )
                            )
                            ->execute();
                    $this->private_update_module_id($modelObj, $moduleID, $info['id']);
                }
            }
        }
    }

    private function private_update_module_id($modelObj, $moduleID, $parentID) {
        \update(array("module_id" => $moduleID))
                ->from($modelObj)
                ->where(
                        array(
                            "parent_id" => $parentID, "OR" => array("module_id is NULL", "module_id" => "")
                        )
                )
                ->execute();

        foreach (\select(array("id"))
                ->from($modelObj)
                ->where(
                        array(
                            "parent_id" => $parentID
                        )
                )->limit(0)
                ->execute()
                ->fetchAll(\PDO::FETCH_COLUMN) as $parentID) {
            $this->private_update_module_id($modelObj, $moduleID, $parentID);
        }
    }

    public function __indexrecursivetree(){
        set_time_limit(0);
        $modelObj = $this->modelObj();
        $schema = $modelObj->schema();
        echo "START";
        if ($modelObj->has('column', 'lft')) {
            $modelObj->indexRecursiveTree(null);
        }
        echo "COMPLETE";
    }

}
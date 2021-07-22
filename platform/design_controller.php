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
        //$modelObj->alias = $modelObj->table;
        $instance->execute("ALTER TABLE {$modelObj->dbTable} DISABLE KEYS");
        //$instance->execute("LOCK TABLES {$modelObj->table} as '{$modelObj->table}' WRITE");

        $request->push(__('Searching top most parent records'));
        $records = \select(array($modelObj->primaryKey, $modelObj->parentKey))
                ->from($modelObj)
                ->inserted()
                ->where(
                        $where
                )
                ->order("{$modelObj->leftKey} ASC")
                ->limit(0)
                ->execute()
                ->fetchAll(\PDO::FETCH_ASSOC);

        $request->push(__('Child records search start'));
        foreach ($records as $record) {
            $rr = $this->recursive($modelObj, $record[$modelObj->primaryKey]);
            if (is_array($rr)) {
                $records = array_merge($records, $rr);
            }
        }
        $request->push(sprintf(__('Child records search completed with total "%s" records'), count($records)));
        $request->push(__('Reseting left/right to "0"'));
        \update(array($modelObj->leftKey => 0, $modelObj->rightKey => 0))->from($modelObj)->inserted()->limit(0)->execute();

        $request->push(__('Computation of left and right values start'));
        foreach ($records as $recordNo => $record) {
            $request->push(sprintf(__('&nbsp;&nbsp;%s. Start processing record with ID "%s"'), $recordNo, $record[$modelObj->primaryKey]));
            if (empty($record[$modelObj->parentKey])) {
                $left = \select(array("MAX({$modelObj->rightKey})"))
                        ->from($modelObj)
                        ->inserted()
                        ->limit(0)
                        ->execute()
                        ->fetch(\PDO::FETCH_COLUMN);
                $left = $left + 1;
                $right = $left + 1;
            } else {
                $left = \select(array($modelObj->rightKey))
                        ->from($modelObj)
                        ->inserted()
                        ->limit(1)
                        ->where($modelObj->primaryKey, $record[$modelObj->parentKey])
                        ->execute()
                        ->fetch(\PDO::FETCH_COLUMN);
                $right = $left + 1;
            }
            $instance->save(array(
                'fields' => array(
                    $modelObj->leftKey => "({$modelObj->leftKey}+2)"
                ),
                'table' => array(
                    'db' => $modelObj->db,
                    'table' => $modelObj->table
                ),
                'where' => array("{$modelObj->leftKey} >= " => $left)
                    ), true);
            $instance->save(array(
                'fields' => array(
                    $modelObj->rightKey => "({$modelObj->rightKey}+2)"
                ),
                'table' => array(
                    'db' => $modelObj->db,
                    'table' => $modelObj->table
                ),
                'where' => array("{$modelObj->rightKey} >= " => $left)
                    ), true);
            $instance->save(array(
                'fields' => array($modelObj->leftKey => $left, $modelObj->rightKey => $right),
                'table' => array(
                    'db' => $modelObj->db,
                    'table' => $modelObj->table
                ),
                'where' => array($modelObj->primaryKey => $record[$modelObj->primaryKey])
                    ), true);
            $request->push(sprintf(__('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;End processing record with ID "%s"'), $record[$modelObj->primaryKey]));
        }
        /*
          $instance->transaction('commit');
          } catch (\Exception $e) {
          $instance->transaction('rollback');
          $request->pushError(sprintf(__('Rolling back changes due to error %s'), $e->getMessage()));
          $request->pushWarning("Operation terminated due to error. Try again");
          }
         */
        //$instance->execute("UNLOCK TABLES");
        $instance->execute("ALTER TABLE {$modelObj->dbTable} ENABLE KEYS");
        $request->push(__('End'));
        exit;
    }

    private function recursive($modelObj, $parentID) {
        $records = \select(array($modelObj->primaryKey, $modelObj->parentKey))
                ->from($modelObj)
                ->inserted()
                ->where(array("$modelObj->parentKey" => $parentID))
                ->order(array("{$modelObj->parentKey} ASC", "lft ASC"))
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

}
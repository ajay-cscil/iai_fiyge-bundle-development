<?php

class data_controller extends \kernel\controller {
    /*
     * Generated add/edit view
     *
     * @author Tushar Takkar
     * @param object $request Request object encapsulating all information.
     * @return mixed output of view.
     * @eg module/controller/edit/id:123
     */

    public function edit($request) {
        $return = null;
        $modelClass = $this->modelClass;
        $modelObj = $this->modelObj();

        $request->layout = "detail";

        $id = $this->id($request);
        if (!empty($id)) {
            $request->subPanelElements = array('tags', 'list_tags');
        }

        $formPermission = EDIT;
        // check for editable permission.
        if($this->overrideACLCheck==false){
            if (!($this->preGenerateID == true && $this->addRecord === true)) {
                if ($modelObj->restore === false && $request->action !== 'cloned') {
                    $isNot = $modelObj->call('isNotEditable', $id);
                    if ($isNot !== false) {
                        if ($request->is('get') && $modelObj->call('isNotReadable', $id) === false) {
                            $formPermission = VIEW;
                        } else {
                            throw new \Exception($isNot);
                        }
                    }
                }
            }
        }

        $multiPageForm = $this->setCurrentFormPage($request);

        // @question - can you explain bunch of lines below
        // @answer - explanation is written
        // read schema
        $schema = $modelObj->schema(false, 'submodel_1');
        // read data "$data[model][column]=>value"
        $data = $request->data;
        $updated = false;
        $request->set('data', $data);
        $isValid = true;
        if ($request->is('post') && !empty($request->data)) {
            // check for singleton insert
            //$isValid = $request->isSingleton();
            //if ($isValid === false) {
            //    \kernel\model::$errors[] = __('This form has expired, try to create new record.');
            //}
            // check for singleton update
            if (!empty($id) && $isValid === true) {
                $isValid = $this->isValidLastModified($request, $id);
                if ($isValid === false) {
                    $request->setMsg(
                            \sprintf(
                                    __('This record has been modified, %d click here %d to load modified record.'), '<a data-ajax = "false" href="' . $request->base . $request->module
                                    . '/' . $request->controller . '/' . $request->action . '/' . $id . '">', '</a>'
                            )
                    );
                }
            }
        }
        //pr($data);
        //exit;
        $saveHandler = $this->saveHandler;
        $modelObj->saveHandler = $saveHandler;

        $isProcessRules=false;
        if ($isValid === true) {
            // if valid request
            if ($request->is('post') && !empty($request->data) && $multiPageForm !== -1) {
                // normalize data
                $data = \kernel\locale::normalize($request->data, $modelObj->schema(false, 'submodel', true, true));
                // set currenty performed form action into data
                if (isset($data['action']) && isset($data[$modelObj->alias])){
                    if(!isset($data[$modelObj->alias]['action']) || empty($data[$modelObj->alias]['action'])){
                        $data[$modelObj->alias]['action'] = $data['action'];
                    }
                }
                if(isset($data[$modelObj->alias]['action'])){
                    $data[$modelObj->alias]['action']=[str_ireplace(['_&_continue','_and_continue'], ['',''], key($data[$modelObj->alias]['action']))=>current($data[$modelObj->alias]['action'])];
                }

                $modelObj->operation="write";
                $modelObj->processRules($data, true);
                $isProcessRules=true;
                if (
                        $this->preGenerateID == true &&
                        !empty($modelObj->softDeleteColumn) && isset($data[$modelObj->alias])
                ) {
                    $data[$modelObj->alias][$modelObj->softDeleteColumn] = 0;
                }

                
                
                // try to save data
                $skipValidation = (isset($data['skip_validation'])?$data['skip_validation']:"");
                $isReload = (isset($data['action']) && isset($data['action']['reload']));
                if ($isReload === false) {
                    $options=[];
                    if($skipValidation == true && isset($data['action']) && md5(key($data['action'])) == $skipValidation ){
                        $options["validate"]=false;
                    }

                    $this->saveHandlerOutput = $modelObj->$saveHandler($data,$options);
                    if ($this->saveHandlerOutput) {
                        $id = $modelObj->id;

                        $request->setMsg(
                                '<a  data-ajax = "false"  ajax=1 href="' . $request->base . "{$request->module}/{$request->controller}/view/id:{$modelObj->id}" . '">'
                                . $this->recordLabel($request) . '</a> '
                                . sprintf(__('%s successfully')
                                        , $this->actionLabel($request, isset($data[$modelObj->alias]['action']) ? $data[$modelObj->alias]['action'] : 'save')
                                )
                        );
                        $shouldContinue=(isset($data['action']) && is_array($data['action']) && stripos(key($data['action']),"_continue") !== false);
                        if ($multiPageForm !== 1) {
                            $return = ["{$request->module}/{$request->controller}/view/id:{$modelObj->id}",$shouldContinue,$shouldContinue];
                        } else {
                            $return = array("{$request->module}/{$request->controller}/{$request->action}/id:{$id}?current_form_page=" . $request->response('current_form_page'), true, true);
                        }
                    } else {
                        $actionLabel=(isset($data[$modelObj->alias]) && isset($data[$modelObj->alias]['action'])?$data[$modelObj->alias]['action']:"");
                        $request->setMsg(sprintf(__('%s could not be %s'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $this->actionLabel($request, $actionLabel)));
                        if ($multiPageForm === 1) {
                            $this->setCurrentPageAsActive($request);
                        }
                    }
                }
                $updated = true;
                // try to read data from model.
            }


            if (!empty($id)) {
                if ($updated === false || $multiPageForm === 1) {
                    $data = $modelObj->read($id);
                } else {
                    $modelData = current($modelObj->read($id, array()));
                    if (!isset($data[$modelObj->alias])) {
                        $data[$modelObj->alias] = array();
                    }
                    if (is_array($modelData)) {
                        $data[$modelObj->alias] = array_merge($modelData, $data[$modelObj->alias]);
                    }
                }
            }
        }
        if($isProcessRules==false){
            if(!isset($data[$modelObj->alias])){
                $data[$modelObj->alias]=[];
            }
            $data[$modelObj->alias]["related_entity"]=$request->get();
            $modelObj->operation="read";
            $modelObj->processRules($data, true);
        }

        $this->processSentData($request, $data);
        $request->set('primary_key', $modelObj->primaryKey);
        $request->set('display_field', $modelObj->displayField);

        $request->set('model', $modelObj->alias);
        $request->set('model_class', $modelObj->modelClass);
        $request->set('model_associations', $modelObj->associations);
        $request->set('invalid_associations', $modelObj->invalidAssociations);
        $request->set('is_pseudo_design_element', isset($modelObj->isPseudoDesignElement) && $modelObj->isPseudoDesignElement == true ? 1 : 0 );



        $request->set('model_behaviours', $modelObj->behaviours);
        $request->set('singleton_key', $request->singletonKey());
        if (!empty($id) && empty($data[$modelObj->alias])) {
            $isDeleted = $modelObj->isDeleted($id);
            $id = '';
            if ($isDeleted) {
                throw new \Exception($isDeleted);
            }
            throw new \Exception(
            sprintf(__('Requested record not found, either you dont have permission to access it or its missing')));
        }
        $modelObj->callAfterProcessData($data);
        $request->set('schema', $schema);
        $request->set('filterRules', $modelObj->filterRules($data, true));
        $request->set('permissions', $modelObj->permissions);
        $form = $this->form();

        if (!empty($form)) {
            $form['permission'] = $formPermission;
            $request->set('form', $form);
        }

        if ($this->preGenerateID == true && $this->id($request) == '') {
            $id = $modelObj->save(array($modelObj->softDeleteColumn => 1), array('atomic' => true, 'type' => 'insert', 'validate' => false));
            if (!is_array($data)) {
                $data = array();
            }
            if (!isset($data[$modelObj->alias])) {
                $data[$modelObj->alias] = array($modelObj->primaryKey => $id);
            } elseif (!isset($data[$modelObj->alias][$modelObj->primaryKey])) {
                $data[$modelObj->alias][$modelObj->primaryKey] = $id;
            }
        }

        $request->set('id', $id);
        $request->set('data', $data);
        $request->set('name',isset($data[$modelObj->alias]) && isset($data[$modelObj->alias][$modelObj->displayField])?$data[$modelObj->alias][$modelObj->displayField]:"");
        
        $request->set('rebaseline', []);
        if(isset($modelObj->baselineFields) && !empty($modelObj->baselineFields)){
            $rebaseline=\module\core\model\rebaseline::getInstance()->getBaseline($modelObj,$id);
            $request->set('rebaseline',$rebaseline );
        }

        $request->set('allow_comments',($id && $modelObj->call('isNotCommentable', $id) === false?1:0));

        if (!is_null($return)) {
            return $return;
        }
    }

    /*
     * Generated view
     *
     * @author Tushar Takkar
     * @param object $request Request object encapsulating all information.
     * @return mixed output of view.
     * @eg module/controller/view/id:123
     */

    public function view($request) {
        $request->layout = "detail";
        $request->subPanelElements = array('tags', 'list_tags');
        $modelClass = $this->modelClass;
        $modelObj = $this->modelObj();
        $id = $this->id($request);
        $schema = $modelObj->schema(false, 'submodel_1');
        //\kernel\model::softdelete(false);
        if($this->overrideACLCheck==false){
            $isNot = $modelObj->call('isNotReadable', $id);
            if ($isNot !== false) {
                throw new \Exception($isNot);
            }
        }

        $request->set('is_editable', $modelObj->call('isNotEditable', $id) === false?1:0);

        $request->set('primary_key', $modelObj->primaryKey);
        $request->set('display_field', $modelObj->displayField);
        $request->set('model', $modelObj->alias);
        $request->set('model_class', $modelObj->modelClass);
        $request->set('id', $id);
        
        $data = $modelObj->read($id);
        //\kernel\model::softdelete(true);
        $request->set('is_record_deleted', (int)isset($data[$modelObj->alias][$modelObj->softDeleteColumn]) && $data[$modelObj->alias][$modelObj->softDeleteColumn]==true);


        
        if (!empty($id) && empty($data[$modelObj->alias])) {
            $id = '';
            throw new \Exception(
            sprintf(__('Requested record not found, either you dont have permission to access it or its missing')));
        }
        $modelObj->operation="read";
        $modelObj->processRules($data, true);
        $request->set('permissions', $modelObj->permissions);
        $modelObj->callAfterProcessData($data);
        $request->set('model_associations', $modelObj->associations);
        $request->set('invalid_associations', $modelObj->invalidAssociations);
        $request->set('is_pseudo_design_element', isset($modelObj->isPseudoDesignElement) && $modelObj->isPseudoDesignElement == true ? 1 : 0 );

        $request->set('model_behaviours', $modelObj->behaviours);
        $request->set('data', $data);
        $request->set('name',isset($data[$modelObj->alias]) && isset($data[$modelObj->alias][$modelObj->displayField])?$data[$modelObj->alias][$modelObj->displayField]:"");
        $request->set('schema', $schema);
        $request->set('filterRules', $modelObj->filterRules($data, true));
        $form = $this->form();
        if (!empty($form)) {
            $form['permission'] = VIEW;
            $request->set('form', $form);
        }
        
        $request->set('rebaseline', []);
        if(isset($modelObj->baselineFields) && !empty($modelObj->baselineFields)){
            $rebaseline=\module\core\model\rebaseline::getInstance()->getBaseline($modelObj,$id);
            $request->set('rebaseline',$rebaseline );
        }

        $request->set('allow_comments',($id && $modelObj->call('isNotCommentable', $id) === false?1:0));

        if ($this->setCurrentFormPage($request) == true) {
            return array("{$request->module}/{$request->controller}/{$request->action}/id:{$id}", true, true);
        }
    }

    /*
     * Deleted record.
     *
     * @author Tushar Takkar
     * @param object $request Request object encapsulating all information.
     * @return mixed output of view.
     * @eg module/controller/delete/id:123
     * @todo to be done.
     */

    public function delete($request) {
        $id = $this->id($request);
        if (empty($id)) {
            throw new \Exception(__('Missing record id to be deleted'));
        }
        if ($request->param('is_confirm', 0) != true) {
            return array("core/confirmation/edit?action=" . $request->getURL(), true);
        }
        if ($this->modelClass == false) {
            throw new \Exception(\sprintf(__('Missing model class in file %s on line %s'), __FILE__, __LINE__));
        }
        $modelObj = $this->modelObj();
        $isNot = $modelObj->call('isNotDeletable', $id);
        if ($isNot !== false) {
            throw new \Exception($isNot);
        }

        if ($request->param('override', 0) == true) {
            if (is_array($modelObj->associations)) {
                foreach ($modelObj->associations as $assocModel => $assocInfo) {
                    $modelObj->associations[$assocModel]['skipForeignKeyCheck'] = 1;
                }
            }
        }
        $this->saveHandlerOutput = $modelObj->delete($id);
        if ($this->saveHandlerOutput) {
            $request->setMsg(__('Record deleted successfully'));
            return $request->param('http_referer', "{$request->module}/{$request->controller}/index/");
        }
        $request->setMsg(__('Record could not be deleted.' . ' ' . current(\kernel\model::$errors)));
        return ("{$request->module}/{$request->controller}/index/");
    }

    public function delete_selected($request) {
        \set_time_limit(0);
        $modelObj = $this->modelObj();
        $ids = $this->id($request);
        $selectAllRecords = $this->selectAllRecords($request);
        if ($selectAllRecords !== false) {
            $ids = $selectAllRecords;
        }

        if (empty($ids)) {
            throw new \Exception(__('Missing record id to be deleted'));
            return false;
        }
        if (!is_array($ids)) {
            $ids = array($ids);
        }
        $isNotEmpty = false;
        if (is_array($ids)) {
            foreach ($ids as $id) {
                if (!empty($id)) {
                    $isNotEmpty = true;
                    break;
                }
            }
        }
        if ($isNotEmpty === false) {
            throw new \Exception(__('Select records to delete'));
            return false;
        }
        if ($selectAllRecords !== false) {
            $request->setMsg(sprintf(__('Trying to delete %s records'), count($selectAllRecords)));
        }
        foreach ($ids as $id) {
            $modelObj = $this->modelObj(false);
            if ($request->param('override', 0) == true) {
                if (is_array($modelObj->associations)) {
                    foreach ($modelObj->associations as $assocModel => $assocInfo) {
                        $modelObj->associations[$assocModel]['skipForeignKeyCheck'] = 1;
                    }
                }
            }
            $isNot = $modelObj->call('isNotDeletable', $id);
            if ($isNot !== false) {
                $request->setMsg($isNot);
                continue;
            }
            if ($modelObj->delete($id)) {
                $request->setMsg(sprintf(__('Record [%s] deleted successfully'), $id));
            } else {
                $request->setMsg(sprintf(__('Record [%s] could not be deleted'), $id));
            }
        }
        return false;
    }

    public function edit_selected($request) {
        \set_time_limit(0);
        $this->render = 'edit';
        $request->lauout = 'detail';
        $data = $request->data;
        $modelObj = $this->modelObj();
        $schema = $modelObj->schema(false, 'submodel_1');
        $ids = $this->id($request);
        $allowEmptyInput=$request->param('allow_empty_input');
        if (!is_array($ids)) {
            $ids = array($ids);
        }

        $saveHandler = $this->saveHandler;
        $modelObj->saveHandler = $saveHandler;

        $selectAllRecords = $this->selectAllRecords($request);
        if ($selectAllRecords !== false) {
            $ids = $selectAllRecords;
        }

        $isNotEmpty = false;
        if (is_array($ids)) {
            foreach ($ids as $id) {
                if (!empty($id)) {
                    $isNotEmpty = true;
                    break;
                }
            }
        }
        if ($isNotEmpty === false) {
            throw new \Exception(__('Select records to edit'));
            return false;
        }
        /*
        if (isset($modelObj->behaviours) && isset($modelObj->behaviours['\\module\\flexflow\\behaviour\\flexflow'])) {
            $request->setMsg(__('This model has dynamic form. Dynamic forms change based on option selected in form. Bulk edit is therefore is not allowed on dynamic form for data consistency reason.'));
            return false;
        }*/
        $isValid = true;
        $successCount = 0;
        // now save changes.
        $errors = array();
        if ($request->is('post')) {
            // check for singleton insert
            $isValid = $request->isSingleton();
            if ($isValid === false) {
                $errors[] = __('This form has expired, try to create new record.');
            } else {
                $dataACL=[];
                $updatingValuesInGrid="Append to the Grid";
                if (isset($data[$modelObj->alias]) && is_array($data[$modelObj->alias])) {
                    foreach ($data[$modelObj->alias] as $column => $value) {
                        if (empty($value) && !is_array($value)) {
                            if (!is_numeric($value) && !$allowEmptyInput) {
                                unset($data[$modelObj->alias][$column]);
                            }
                        }
                    }
                    $dataACL=array_intersect_key($data[$modelObj->alias], ["_acl"=>1,"_acl_edit"=>1,"_acl_delete"=>1]);
                    if(array_key_exists("updating_values_in_grid", $data[$modelObj->alias])){
                        $updatingValuesInGrid=$data[$modelObj->alias]["updating_values_in_grid"];
                    }
                }
                $updatingValuesInGrid=strtolower($updatingValuesInGrid);
                if(!$allowEmptyInput){
                    rm_empty_input($data, false, true, true);
                }
                $data = \kernel\locale::normalize($data, $modelObj->schema(false, true, true, true));
                //$modelObj->processRules($data, true);
                $successCount = 0;
                if ($selectAllRecords !== false) {
                    $request->setMsg(sprintf(__('Trying to update %s records'), count($selectAllRecords)));
                }
                foreach ($ids as $id) {
                    $modelObj = $this->modelObj(false);
                    $saveHandler = $this->saveHandler;
                    $modelObj->saveHandler = $saveHandler;

                    // check for editable permission.
                    $isNot = $modelObj->call('isNotEditable', $id);
                    if ($isNot !== false) {
                        $errors[] = $isNot;
                        continue;
                    }
                    if (!empty($id) && $request->is('post') && !empty($request->data)) {
                        // check for singleton update
                        if ($isValid === true) {
                            $isValid = $this->isValidLastModified($request, $id);
                            if ($isValid === false) {
                                $errors[] = \sprintf(
                                        __('This record record[%s] has been modified, %d click here %d to view modified record.'), $id, '<a  data-ajax = "false"  href="' . $request->base . $request->module
                                        . '/' . $request->controller . '/view/' . $id . '">', '</a>'
                                );
                            }
                        }


                        if ($isValid === true) {
                            // if valid request
                            if ($request->is('post') && !empty($data)) {

                                // try to save data
                                $isReload = (isset($data['action']) && isset($data['action']['reload']));
                                if ($isReload === false) {
                                    $dataCopy = $modelObj->read($id);
                                    if (!is_array($dataCopy[$modelObj->alias])) {
                                        $errors[] = sprintf(__('%s [%s] could not be %s'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $id, __('updated'));
                                        continue;
                                    }
                                    pr($dataCopy);

                                    \kernel\registry::write('request_action', 'edit_selected');
                                    foreach ($dataCopy[$modelObj->alias] as $kkk => $vvv) {
                                        if (empty($vvv) && !is_numeric($vvv)) {
                                            unset($dataCopy[$modelObj->alias][$kkk]);
                                        }
                                    }
                                    $submodels=[];
                                    if (is_array($modelObj->associations)) {
                                        foreach ($modelObj->associations as $assocModel => $assocInfo) {
                                            if(isset($assocInfo['isSubModel']) && $assocInfo['isSubModel']==1 && $assocInfo['assocType'] =='hasMany'){
                                                $submodels[$assocModel]=[];
                                                if(
                                                    isset($data[$modelObj->alias][$assocModel]) 
                                                    && !empty($data[$modelObj->alias][$assocModel])
                                                    && is_array($data[$modelObj->alias][$assocModel])){
                                                        if(
                                                            isset($dataCopy[$modelObj->alias][$assocModel])
                                                            && is_array($dataCopy[$modelObj->alias][$assocModel])
                                                        ){
                                                            if($updatingValuesInGrid =="replace the current grid"){
                                                                foreach($dataCopy[$modelObj->alias][$assocModel] as $sKey=>$sValue){
                                                                    $dataCopy[$modelObj->alias][$assocModel][$sKey]["deleted"]=1;
                                                                }
                                                            }
                                                        }
                                                    if(!is_array($dataCopy[$modelObj->alias][$assocModel])){
                                                        $dataCopy[$modelObj->alias][$assocModel]=[];
                                                    }        
                                                    $dataCopy[$modelObj->alias][$assocModel]=array_merge(
                                                        $dataCopy[$modelObj->alias][$assocModel],
                                                        $data[$modelObj->alias][$assocModel]
                                                    );
                                                }
                                            }
                                        }
                                    }
                                    if($updatingValuesInGrid =="replace the current grid"){
                                        $dataCopy[$modelObj->alias]=array_diff_key($dataCopy[$modelObj->alias], $dataACL);
                                        foreach($dataACL as $dataACLKey=>$dataACLValue){
                                            if(!empty($dataACLValue)){
                                                $dataCopy[$modelObj->alias][$dataACLKey]=$dataACLValue;
                                            }
                                        }
                                    }else{
                                        foreach($dataACL as $dataACLKey=>$dataACLValue){
                                            if(!empty($dataACLValue)){
                                                if(!is_array($dataCopy[$modelObj->alias][$dataACLKey])){
                                                    $dataCopy[$modelObj->alias][$dataACLKey]=[];
                                                }
                                                $dataCopy[$modelObj->alias][$dataACLKey]=array_merge($dataCopy[$modelObj->alias][$dataACLKey],$dataACLValue);
                                            }
                                        }
                                    }

                                    $dataCopy[$modelObj->alias] = array_merge_recursive_distinct(
                                        $dataCopy[$modelObj->alias], 
                                        array_diff_key($data[$modelObj->alias],$submodels)
                                    );
                                    
                                    $dataCopy[$modelObj->alias][$modelObj->primaryKey] = $id;
                                    $dataCopyAction = $this->action($request);
                                    if (isset($data['action'])){
                                        $dataCopyAction = $data['action'];
                                    }
                                    if(isset($dataCopyAction) && is_array($dataCopyAction)){
                                        $dataCopyActionKey=str_ireplace(['_&_continue','_and_continue'], ['',''], key($dataCopyAction));
                                        $dataCopyActionValue=current($dataCopyAction);
                                        $dataCopyAction=[$dataCopyActionKey=>$dataCopyActionValue];
                                    }
                                    $dataCopy[$modelObj->alias]['action'] = $dataCopyAction;
                                    if(isset($data[$modelObj->alias]['stage_log'])){
                                        $dataCopy[$modelObj->alias]['stage_log'] = $data[$modelObj->alias]['stage_log'];  
                                    }
                                    $modelObj->id = '';
                                    \kernel\model::$errors = array();
                                    pr($dataCopy);
                                    $this->saveHandlerOutput = $modelObj->$saveHandler($dataCopy);
                                    if ($this->saveHandlerOutput) {
                                        $successCount++;
                                        $msg = sprintf(__('%s [%s] %s successfully'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $id, __('updated'));
                                        $request->setMsg($msg);
                                        $errors[] = $msg;
                                    } else {
                                        $messages = array();
                                        foreach (\kernel\model::$errors as $k => $v) {
                                            if (is_array($messages)) {
                                                $messages = array_merge($messages, (is_array($v)?$v:[$v]));
                                            } else {
                                                $messages[] = $v;
                                            }
                                        }
                                        $messages = implode(', ', $messages);
                                        $errors[] = sprintf(__('%s [%s] could not be %s due to validation check: %s'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $id, __('updated'), $messages);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        $request->overrideRequestMethod('get');
        $this->edit($request);
        $request->overrideRequestMethod(false);
        
        \kernel\model::$errors = $errors;
        if ($successCount == count($ids)) {
            return("{$request->module}/{$request->controller}/index");
        }

        $unifiedJumpToStages=false;
        $unifiedOpenStages=false;
        $workflowGlobalActions=false;
        foreach ($ids as $id) {
                $modelObj = $this->modelObj(false);
                $dataCopy = $modelObj->read($id);
                if(isset($dataCopy[$modelObj->alias]['workflow_jump_to_stages'])){
                    $unifiedJumpToStages1=[];
                    foreach($dataCopy[$modelObj->alias]['workflow_jump_to_stages'] as $jumpToStage){
                        $unifiedJumpToStages1[$jumpToStage['id']]=$jumpToStage['name'];
                    }
                    if($unifiedJumpToStages === false){
                         $unifiedJumpToStages=$unifiedJumpToStages1;
                    }else{
                        $unifiedJumpToStages=array_intersect_key($unifiedJumpToStages,$unifiedJumpToStages1);
                    }
                }
                if(isset($dataCopy[$modelObj->alias]['open_nodes'])){
                    $unifiedOpenStages1=[];
                    foreach($dataCopy[$modelObj->alias]['open_nodes'] as $openNode){
                        $unifiedOpenStages1[$openNode['stage_id']]=$openNode['stage_name'];
                    }
                    if($unifiedOpenStages === false){
                         $unifiedOpenStages=$unifiedOpenStages1;
                    }else{
                        $unifiedOpenStages=array_intersect_key($unifiedOpenStages,$unifiedOpenStages1);
                    }
                }
                if(isset($dataCopy[$modelObj->alias]['workflow_global_actions'])){
                    $workflowGlobalActions1=[];
                    foreach($dataCopy[$modelObj->alias]['workflow_global_actions'] as $globalAction){
                        $workflowGlobalActions1[$globalAction['id']]=$globalAction;
                    }
                    if($workflowGlobalActions === false){
                         $workflowGlobalActions=$workflowGlobalActions1;
                    }else{
                        $workflowGlobalActions=array_intersect_key($workflowGlobalActions,$workflowGlobalActions1);
                    }
                }
        }

        $data=$request->data;

        if($modelObj->has('behaviour','\\module\\flexflow\\behaviour\\flexflow')){
            $data[$modelObj->alias]['is_workflow_log_set']=1;
            if(!empty($unifiedJumpToStages)){
                if(!isset($data) || !is_array($data)){
                    $data=[$modelObj->alias=>[]];
                }
                $data[$modelObj->alias]['workflow_jump_to_stages']=[];
                foreach($unifiedJumpToStages as $unifiedJumpToStageID=>$unifiedJumpToStageName){
                    $data[$modelObj->alias]['workflow_jump_to_stages'][]=[
                        "id"=>$unifiedJumpToStageID,
                        "name"=>$unifiedJumpToStageName
                    ];
                }
            }
            if(!empty($unifiedOpenStages)){
                if(!isset($data) || !is_array($data)){
                    $data=[$modelObj->alias=>[]];
                }
                $data[$modelObj->alias]['open_stages']=[];
                foreach($unifiedOpenStages as $unifiedOpenStageID=>$unifiedOpenStageName){
                    $data[$modelObj->alias]['open_stages'][]=[
                        "stage_id"=>$unifiedOpenStageID,
                        "stage_name"=>$unifiedOpenStageName
                    ];
                } 
                if(!isset($data[$modelObj->alias]["stage_log"])){
                    $data[$modelObj->alias]["stage_log"]=[];
                }
                $data[$modelObj->alias]["stage_log"]["stage_id"]=key($unifiedOpenStages);
            }

            if(!empty($workflowGlobalActions)){
                $data[$modelObj->alias]['workflow_global_actions']=$workflowGlobalActions;
            }
        }


        $this->processSentData($request, $data);
        $request->set('primary_key', $modelObj->primaryKey);
        $request->set('display_field', $modelObj->displayField);
        $request->set('model', $modelObj->alias);
        $request->set('model_class', $modelObj->modelClass);
        $request->set('id', $ids);
        $request->set('singleton_key', $request->singletonKey());
        $request->set('data', $data);
        $request->set('schema', $schema);
        $request->set('filterRules', $modelObj->filterRules($data, true));
        $request->set('permissions', $modelObj->permissions);

        $request->set('model_associations', $modelObj->associations);
        $request->set('invalid_associations', $modelObj->invalidAssociations);
        $request->set('model_behaviours', $modelObj->behaviours);

        $form = $this->form();
        if (!empty($form)) {
            $request->set('form', $form);
        }
    }

    public function share_selected($request) {
        \set_time_limit(0);
        $this->render = 'edit';
        $request->lauout = 'detail';
        $data = $request->data;
        $modelObj = $this->modelObj();
        $schema = $modelObj->schema(false, 'submodel_1');
        $ids = $this->id($request);
        $allowEmptyInput=$request->param('allow_empty_input');
        if (!is_array($ids)) {
            $ids = array($ids);
        }

        $saveHandler = $this->saveHandler;
        $modelObj->saveHandler = $saveHandler;

        $selectAllRecords = $this->selectAllRecords($request);
        if ($selectAllRecords !== false) {
            $ids = $selectAllRecords;
        }

        $isNotEmpty = false;
        if (is_array($ids)) {
            foreach ($ids as $id) {
                if (!empty($id)) {
                    $isNotEmpty = true;
                    break;
                }
            }
        }
        if ($isNotEmpty === false) {
            throw new \Exception(__('Select records to edit'));
            return false;
        }
        
        $isValid = true;
        $successCount = 0;
        // now save changes.
        $errors = array();
        if ($request->is('post')) {
            // check for singleton insert
            $isValid = $request->isSingleton();
            if ($isValid === false) {
                $errors[] = __('This form has expired, try to create new record.');
            } else {
                $dataACL=[];
                $updatingValuesInGrid="Append to the Grid";
                if (isset($data[$modelObj->alias]) && is_array($data[$modelObj->alias])) {
                    foreach ($data[$modelObj->alias] as $column => $value) {
                        if (empty($value) && !is_array($value)) {
                            if (!is_numeric($value) && !$allowEmptyInput) {
                                unset($data[$modelObj->alias][$column]);
                            }
                        }
                    }
                    $dataACL=array_intersect_key($data[$modelObj->alias], ["_acl"=>1,"_acl_edit"=>1,"_acl_delete"=>1]);
                    if(array_key_exists("updating_values_in_grid", $data[$modelObj->alias])){
                        $updatingValuesInGrid=$data[$modelObj->alias]["updating_values_in_grid"];
                    }
                }
                $updatingValuesInGrid=strtolower($updatingValuesInGrid);
                if(!$allowEmptyInput){
                    rm_empty_input($data, false, true, true);
                }
                $data = \kernel\locale::normalize($data, $modelObj->schema(false, true, true, true));
                //$modelObj->processRules($data, true);
                $successCount = 0;
                if ($selectAllRecords !== false) {
                    $request->setMsg(sprintf(__('Trying to update %s records'), count($selectAllRecords)));
                }
                $selectedUserIDS=[];
                if($data[$modelObj->alias]["revoke_custom_access_of_role_id"]){
                    $selectedUserIDS=\select("user_id")
                                    ->from(\module\access_controls\model\roles_users::getInstance())
                                    ->where(["role_id"=>$data[$modelObj->alias]["revoke_custom_access_of_role_id"]])
                                    ->execute()
                                    ->fetchAll(\PDO::FETCH_COLUMN,0);

                }
                foreach ($ids as $id) {
                    $modelObj = $this->modelObj(false);
                    $saveHandler = $this->saveHandler;
                    $modelObj->saveHandler = $saveHandler;

                    // check for editable permission.
                    $isNot = $modelObj->call('isNotEditable', $id);
                    if ($isNot !== false) {
                        $errors[] = $isNot;
                        continue;
                    }
                    if (!empty($id) && $request->is('post') && !empty($request->data)) {
                        // check for singleton update
                        if ($isValid === true) {
                            $isValid = $this->isValidLastModified($request, $id);
                            if ($isValid === false) {
                                $errors[] = \sprintf(
                                        __('This record record[%s] has been modified, %d click here %d to view modified record.'), $id, '<a  data-ajax = "false"  href="' . $request->base . $request->module
                                        . '/' . $request->controller . '/view/' . $id . '">', '</a>'
                                );
                            }
                        }


                        if ($isValid === true) {
                            // if valid request
                            if ($request->is('post') && !empty($data)) {

                                // try to save data
                                $isReload = (isset($data['action']) && isset($data['action']['reload']));
                                if ($isReload === false) {
                                    $dataCopy = $modelObj->read($id);
                                    if (!is_array($dataCopy[$modelObj->alias])) {
                                        $errors[] = sprintf(__('%s [%s] could not be %s'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $id, __('updated'));
                                        continue;
                                    }

                                    \kernel\registry::write('request_action', 'share_selected');
                                    foreach ($dataCopy[$modelObj->alias] as $kkk => $vvv) {
                                        if (empty($vvv) && !is_numeric($vvv)) {
                                            unset($dataCopy[$modelObj->alias][$kkk]);
                                        }
                                    }
                                    foreach(["_acl","_acl_edit","_acl_delete","_acl_comment"] as $aclTYPE){
                                        if(
                                            isset($dataCopy[$modelObj->alias][$aclTYPE]) 
                                            && 
                                            is_array($dataCopy[$modelObj->alias][$aclTYPE])
                                        ){
                                            foreach($dataCopy[$modelObj->alias][$aclTYPE] as $aclRecordKey=>$aclRecordValue){
                                                if(isset($aclRecordValue["aro_id"]) && $aclRecordValue["aro_id_model"] =="users" && in_array($aclRecordValue["aro_id"], $selectedUserIDS)){
                                                    $dataCopy[$modelObj->alias][$aclTYPE][$aclRecordKey]["deleted"]=1;
                                                }
                                            }
                                        }
                                    }
                                    $submodels=[];
                                    if (is_array($modelObj->associations)) {
                                        foreach ($modelObj->associations as $assocModel => $assocInfo) {
                                            if(isset($assocInfo['isSubModel']) && $assocInfo['isSubModel']==1){
                                                $submodels[$assocModel]=[];
                                                if(
                                                    isset($data[$modelObj->alias][$assocModel]) 
                                                    && !empty($data[$modelObj->alias][$assocModel])
                                                    && is_array($data[$modelObj->alias][$assocModel])){
                                                        if(
                                                            isset($dataCopy[$modelObj->alias][$assocModel])
                                                            && is_array($dataCopy[$modelObj->alias][$assocModel])
                                                        ){
                                                            if($updatingValuesInGrid =="replace the current grid"){
                                                                foreach($dataCopy[$modelObj->alias][$assocModel] as $sKey=>$sValue){
                                                                    $dataCopy[$modelObj->alias][$assocModel][$sKey]["deleted"]=1;
                                                                }
                                                            }
                                                        }
                                                    if(!is_array($dataCopy[$modelObj->alias][$assocModel])){
                                                        $dataCopy[$modelObj->alias][$assocModel]=[];
                                                    }        
                                                    $dataCopy[$modelObj->alias][$assocModel]=array_merge(
                                                        $dataCopy[$modelObj->alias][$assocModel],
                                                        $data[$modelObj->alias][$assocModel]
                                                    );
                                                }
                                            }
                                        }
                                    }
                                    if($updatingValuesInGrid =="replace the current grid"){
                                        $dataCopy[$modelObj->alias]=array_diff_key($dataCopy[$modelObj->alias], $dataACL);
                                        foreach($dataACL as $dataACLKey=>$dataACLValue){
                                            if(!empty($dataACLValue)){
                                                $dataCopy[$modelObj->alias][$dataACLKey]=$dataACLValue;
                                            }
                                        }
                                    }else{
                                        foreach($dataACL as $dataACLKey=>$dataACLValue){
                                            if(!empty($dataACLValue)){
                                                if(!is_array($dataCopy[$modelObj->alias][$dataACLKey])){
                                                    $dataCopy[$modelObj->alias][$dataACLKey]=[];
                                                }
                                                $dataCopy[$modelObj->alias][$dataACLKey]=array_merge($dataCopy[$modelObj->alias][$dataACLKey],$dataACLValue);
                                            }
                                        }
                                    }

                                    $dataCopy[$modelObj->alias] = array_merge_recursive_distinct(
                                        $dataCopy[$modelObj->alias], 
                                        array_diff_key($data[$modelObj->alias],$submodels)
                                    );
                                    
                                    $dataCopy[$modelObj->alias][$modelObj->primaryKey] = $id;
                                    $dataCopyAction = $this->action($request);
                                    if (isset($data['action'])){
                                        $dataCopyAction = $data['action'];
                                    }
                                    if(isset($dataCopyAction) && is_array($dataCopyAction)){
                                        $dataCopyActionKey=str_ireplace(['_&_continue','_and_continue'], ['',''], key($dataCopyAction));
                                        $dataCopyActionValue=current($dataCopyAction);
                                        $dataCopyAction=[$dataCopyActionKey=>$dataCopyActionValue];
                                    }
                                    $dataCopy[$modelObj->alias]['action'] = $dataCopyAction;
                                    if(isset($data[$modelObj->alias]['stage_log'])){
                                        $dataCopy[$modelObj->alias]['stage_log'] = $data[$modelObj->alias]['stage_log'];  
                                    }
                                    $modelObj->id = '';
                                    \kernel\model::$errors = array();
                                    $this->saveHandlerOutput = $modelObj->$saveHandler($dataCopy,["validate"=>false]);
                                    if ($this->saveHandlerOutput) {
                                        $successCount++;
                                        $msg = sprintf(__('%s [%s] %s successfully'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $id, __('updated'));
                                        $request->setMsg($msg);
                                        $errors[] = $msg;
                                    } else {
                                        $messages = array();
                                        foreach (\kernel\model::$errors as $k => $v) {
                                            if (is_array($messages)) {
                                                $messages = array_merge($messages, (is_array($v)?$v:[$v]));
                                            } else {
                                                $messages[] = $v;
                                            }
                                        }
                                        $messages = implode(', ', $messages);
                                        $errors[] = sprintf(__('%s [%s] could not be %s due to validation check: %s'), (!is_null($modelObj->singular) ? __($modelObj->singular) : 'Record'), $id, __('updated'), $messages);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        $request->overrideRequestMethod('get');
        $this->edit($request);
        $request->overrideRequestMethod(false);
        
        \kernel\model::$errors = $errors;
        if ($successCount == count($ids)) {
            return("{$request->module}/{$request->controller}/index");
        }
        $data=$request->data;
        $this->processSentData($request, $data);
        $request->set('primary_key', $modelObj->primaryKey);
        $request->set('display_field', $modelObj->displayField);
        $request->set('model', $modelObj->alias);
        $request->set('model_class', $modelObj->modelClass);
        $request->set('id', $ids);
        $request->set('singleton_key', $request->singletonKey());
        $request->set('data', $data);
        $request->set('schema', $schema);
        $request->set('filterRules', $modelObj->filterRules($data, true));
        $request->set('permissions', $modelObj->permissions);

        $request->set('model_associations', $modelObj->associations);
        $request->set('invalid_associations', $modelObj->invalidAssociations);
        $request->set('model_behaviours', $modelObj->behaviours);

        $form = $this->form();
        $permissionFormActions=$form['children'][0];
        $permissionFormActions['children']=[];
        $permissionFormActions['children'][]=[
                                            'helper' => '\\kernel\\form', 
                                            'method' => 'cancel', 
                                            'template' => 'cancel', 
                                        ];
       $permissionFormActions['children'][]=[ 
                                            'name' => ['action', 'save_progress'], 
                                            'label' => 'Update Permissions', 
                                            'value' => 'Update Permissions', 
                                            '__value' => 'Update Permissions', 
                                            'is_web_compatible' => '1', 
                                            'is_mobile_compatible' => '1', 
                                            'helper' => '\\kernel\\form', 
                                            'method' => 'submit', 
                                            'template' => 'submit', 
                                            'mw' => false, 
                                        ];

        $permissionForm=array ( 'name' => array ( 0 => 'ACL & Revisions', ), 'label' => 'Permissions', 'sub_form_model_class' => '\\module\\core\\model\\listviews', 'sub_form_name' => 'SYSTEM_ACL_REVISIONS', 'overwrite_sub_form_model' => '1', 'is_web_compatible' => '1', 'rules_grid' => '1', 'roles_grid' => '1', 'helper' => '\\kernel\\form', 'method' => 'subform', 'is_mobile_compatible' => '0', 'show_collapsed' => '0', 'allow_copy_to_clipboard' => '0', 'allow_user_to_specify_user_level_default' => '0', 'business_key' => '656601b5-16d4-4925-b409-497aac69033c', 'template' => 'subform', 'packaged_with_module' => 'crm', 'mw' => false, );
        $form['children']=[$permissionFormActions,$permissionForm];                            
        if (!empty($form)) {
            $request->set('form', $form);
        }
    }

}

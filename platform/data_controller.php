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

        if ($isValid === true) {
            // if valid request
            if ($request->is('post') && !empty($request->data) && $multiPageForm !== -1) {
                // normalize data
                $data = \kernel\locale::normalize($request->data, $modelObj->schema(false, 'submodel', true, true));

                $modelObj->processRules($data, true);
                if (
                        $this->preGenerateID == true &&
                        !empty($modelObj->softDeleteColumn) && isset($data[$modelObj->alias])
                ) {
                    $data[$modelObj->alias][$modelObj->softDeleteColumn] = 0;
                }

                // set currenty performed form action into data
                if (isset($data['action']) && isset($data[$modelObj->alias]))
                    $data[$modelObj->alias]['action'] = $data['action'];
                // try to save data
                $isReload = (isset($data['action']) && isset($data['action']['reload']));
                if ($isReload === false) {
                    $this->saveHandlerOutput = $modelObj->$saveHandler($data);
                    if ($this->saveHandlerOutput) {
                        $id = $modelObj->id;

                        $request->setMsg(
                                '<a  data-ajax = "false"  ajax=1 href="' . $request->base . "{$request->module}/{$request->controller}/view/id:{$modelObj->id}" . '">'
                                . $this->recordLabel($request) . '</a> '
                                . sprintf(__('%s successfully')
                                        , $this->actionLabel($request, isset($data[$modelObj->alias]['action']) ? $data[$modelObj->alias]['action'] : 'save')
                                )
                        );

                        if ($multiPageForm !== 1) {
                            $return = "{$request->module}/{$request->controller}/view/id:{$modelObj->id}";
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
        $modelObj->processRules($data, true);


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
        $isNot = $modelObj->call('isNotReadable', $id);
        if ($isNot !== false) {
            throw new \Exception($isNot);
        }

        $request->set('primary_key', $modelObj->primaryKey);
        $request->set('display_field', $modelObj->displayField);
        $request->set('model', $modelObj->alias);
        $request->set('model_class', $modelObj->modelClass);
        $request->set('id', $id);
        $data = $modelObj->read($id);
        if (!empty($id) && empty($data[$modelObj->alias])) {
            $id = '';
            throw new \Exception(
            sprintf(__('Requested record not found, either you dont have permission to access it or its missing')));
        }
        $modelObj->processRules($data, true);
        $request->set('permissions', $modelObj->permissions);
        $modelObj->callAfterProcessData($data);
        $request->set('model_associations', $modelObj->associations);
        $request->set('invalid_associations', $modelObj->invalidAssociations);
        $request->set('is_pseudo_design_element', isset($modelObj->isPseudoDesignElement) && $modelObj->isPseudoDesignElement == true ? 1 : 0 );

        $request->set('model_behaviours', $modelObj->behaviours);
        $request->set('data', $data);
        $request->set('schema', $schema);
        $request->set('filterRules', $modelObj->filterRules($data, true));
        $form = $this->form();
        if (!empty($form)) {
            $form['permission'] = VIEW;
            $request->set('form', $form);
        }

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

        if (isset($modelObj->behaviours) && isset($modelObj->behaviours['\\module\\flexflow\\behaviour\\flexflow'])) {
            $request->setMsg(__('This model has dynamic form. Dynamic forms change based on option selected in form. Bulk edit is therefore is not allowed on dynamic form for data consistency reason.'));
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
                if (isset($data[$modelObj->alias]) && is_array($data[$modelObj->alias])) {
                    foreach ($data[$modelObj->alias] as $column => $value) {
                        if (empty($value) && !is_array($value)) {
                            if (!is_numeric($value)) {
                                unset($data[$modelObj->alias][$column]);
                            }
                        }
                    }
                }
                rm_empty_input($data, false, true, true);
                $data = \kernel\locale::normalize($data, $modelObj->schema(false, true, true, true));
                $modelObj->processRules($data, true);
                $successCount = 0;
                if ($selectAllRecords !== false) {
                    $request->setMsg(sprintf(__('Trying to update %s records'), count($selectAllRecords)));
                }
                foreach ($ids as $id) {
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

                                    \kernel\registry::write('request_action', 'edit_selected');
                                    foreach ($dataCopy[$modelObj->alias] as $kkk => $vvv) {
                                        if (empty($vvv) && !is_numeric($vvv)) {
                                            unset($dataCopy[$modelObj->alias][$kkk]);
                                        }
                                    }
                                    $dataCopy[$modelObj->alias] = array_merge_recursive_distinct($dataCopy[$modelObj->alias], $data[$modelObj->alias]);

                                    $dataCopy[$modelObj->alias][$modelObj->primaryKey] = $id;
// set currenty performed form action into data
                                    $dataCopy[$modelObj->alias]['action'] = $this->action($request);
                                    $modelObj->id = '';
                                    \kernel\model::$errors = array();
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
                                                $messages = array_merge($messages, $v);
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
        } else {
            $this->edit($request);
        }
        \kernel\model::$errors = $errors;
        if ($successCount == count($ids)) {
            return("{$request->module}/{$request->controller}/index");
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

}

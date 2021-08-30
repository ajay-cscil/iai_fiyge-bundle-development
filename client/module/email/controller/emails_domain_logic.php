<?php
 /**
  *
  * write any custom code in this class, build operation wont overwrite this class once generated;
  */
  namespace module\email\controller;
  class emails_domain_logic extends \data_controller{


    public function edit($request)
    {
        $request->data['normalized'] = 1;
        $return = parent::edit($request);
        $modelObj = $this->modelObj;
        $responseData = array();
        if (isset($request->response['data']) && is_array($request->response['data'])) {
            $responseData = current($request->response['data']);
        }
        foreach (array('email_to_recipients', 'email_cc_recipients', 'email_bcc_recipients') as $assocModel) {
            if (isset($responseData[$assocModel]) && !empty($responseData[$assocModel])) {
                if (!isset($request->response['data'][$modelObj->alias][$assocModel]['__email_address_id'])) {
                    $data = $responseData[$assocModel];
                    $__emailAddressId = '';
                    $emailAddressId = array();
                    foreach ($data as $d) {
                        $d['email_address'] = trim($d['email_address']);
                        if (!empty($d['email_address'])) {
                            $__emailAddressId .= $d['email_address'] . ', ';
                            if (!empty($d['email_address_id'])) {
                                $emailAddressId[] = array($d['email_address_id'], $d['email_address']);
                            }
                        }
                    }
                    $request->response['data'][$modelObj->alias][$assocModel] = array(
                        '__email_address_id' => $__emailAddressId
                        , 'email_address_id' => json_encode($emailAddressId)
                        , 'email_address_id_model' => 'email_addresses'
                    );
                }
            }
        }
        return $return;
    }

    public function view($request)
    {

        $return = parent::view($request);
        $modelObj = $this->modelObj;
        $responseData = current($request->response['data']);
        foreach (array('email_to_recipients', 'email_cc_recipients', 'email_bcc_recipients') as $assocModel) {
            if (isset($responseData[$assocModel]) && !empty($responseData[$assocModel])) {
                $data = $responseData[$assocModel];
                $__emailAddressId = '';
                $emailAddressId = array();
                foreach ($data as $d) {
                    $d['email_address'] = trim($d['email_address']);
                    if (!empty($d['email_address'])) {
                        $__emailAddressId .= $d['email_address'] . ', ';
                        if (!empty($d['email_address_id'])) {
                            $emailAddressId[] = array($d['email_address_id'], $d['email_address']);
                        }
                    }
                }
                $request->response['data'][$modelObj->alias][$assocModel] = array(
                    '__email_address_id' => $__emailAddressId
                    , 'email_address_id' => json_encode($emailAddressId)
                    , 'email_address_id_model' => 'email_addresses'
                );
            }
        }
        return $return;
    }
    
  }
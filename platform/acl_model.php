<?php

class acl_model extends \kernel\model
{

    public $source = 'acl';


    /*
            if($request->param('related_to') && stripos($paginate['model_class'], '_group_acl_cache') !== false){
                $dataModelClass=str_replace('_group_acl_cache', '', $paginate['model_class']);
                $dataModelClassObject=$dataModelClass::getInstance();
                $relatedToEditACLCache=$dataModelClassObject->getEditACLCache($request->param('related_to'));
                $relatedToDeleteACLCache=$dataModelClassObject->getDeleteACLCache($request->param('related_to'));
                
                pr($relatedToEditACLCache);
                pr($relatedToDeleteACLCache);
                exit;
            }*/


    public function afterFind(&$data) {
        parent::afterFind($data);
        $request=\kernel\request::getInstance();
        $relatedTo=$request->param('related_to');
        if($relatedTo && stripos($data['model_class'], '_group_acl_cache') !== false){
            $dataModelClass=str_replace('_group_acl_cache', '', $data['model_class']);
            $dataModelClassObject=$dataModelClass::getInstance();
            $relatedToEditACLCache=$dataModelClassObject->getEditACLCache($relatedTo);
            $relatedToDeleteACLCache=$dataModelClassObject->getDeleteACLCache($relatedTo);
            $canEdit=isset($data['data'][0]['CAN EDIT']) && isset($data['data'][0]['GROUP ID']);
            $canDelete=isset($data['data'][0]['CAN DELETE']) && isset($data['data'][0]['GROUP ID']);
            foreach($data['data'] as $k=>$v){
                $data['data'][$k]['CAN EDIT']='No';
                $data['data'][$k]['CAN DELETE']='No';
                if($canEdit){
                    $data['data'][$k]['CAN EDIT']=(in_array("g{$v['GROUP ID']}",$relatedToEditACLCache)?'Yes':'No');
                }
                if($canEdit){
                    $data['data'][$k]['CAN DELETE']=(in_array("g{$v['GROUP ID']}",$relatedToDeleteACLCache)?'Yes':'No');
                }
            }
        }else if($relatedTo && stripos($data['model_class'], '_acl_cache') !== false){
            $dataModelClass=str_replace('_acl_cache', '', $data['model_class']);
            $dataModelClassObject=$dataModelClass::getInstance();
            $relatedToEditACLCache=$dataModelClassObject->getEditACLCache($relatedTo);
            $relatedToDeleteACLCache=$dataModelClassObject->getDeleteACLCache($relatedTo);
            $canEdit=isset($data['data'][0]['CAN EDIT']) && isset($data['data'][0]['USER ID']);
            $canDelete=isset($data['data'][0]['CAN DELETE']) && isset($data['data'][0]['USER ID']);
            foreach($data['data'] as $k=>$v){
                $data['data'][$k]['CAN EDIT']='No';
                $data['data'][$k]['CAN DELETE']='No';
                if($canEdit){
                    $data['data'][$k]['CAN EDIT']=(in_array("u{$v['USER ID']}",$relatedToEditACLCache)?'Yes':'No');
                }
                if($canEdit){
                    $data['data'][$k]['CAN DELETE']=(in_array("u{$v['USER ID']}",$relatedToDeleteACLCache)?'Yes':'No');
                }
            }
        }  
    }            

}

?>

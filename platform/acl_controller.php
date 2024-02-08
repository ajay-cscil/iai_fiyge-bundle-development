<?php

class acl_controller extends \kernel\controller {
    
    protected function indexQuery($request, &$query) {
    	parent::indexQuery($request, $query);
    	$modelObj = $this->modelObj();
    	if(str_contains($modelObj->alias, 'group_acl_cache')== true){
    		$query["fields"] = [
	            [$modelObj->alias.'.groups.name' => [
	                            'field_type' => 'Data-Field',
	                            '__column' => $modelObj->alias.'.groups.name',
	                            'sortable' => 1,
	                            'searchable' => 1,
	                            'is_invisible' => 0,
	                            'clickable_link' => 0,
	                            'compute_column_total' => 0
	                    ]]
	        ];
    	}else if(str_contains($modelObj->alias, 'acl_cache')== true){
	    	$query["fields"] = [
	            [$modelObj->alias.'.users.name' => [
	                            'field_type' => 'Data-Field',
	                            '__column' => $modelObj->alias.'.users.name',
	                            'sortable' => 1,
	                            'searchable' => 1,
	                            'is_invisible' => 0,
	                            'clickable_link' => 0,
	                            'compute_column_total' => 0
	                    ]],
	            ['IF('.$modelObj->alias.'.users.is_active, "Yes", "No")' => [
	                            'field_type' => 'Database Command',
	                            'alias' => 'Is Active',
	                            'sortable' => 1,
	                            'searchable' => 1,
	                            'is_invisible' => 0,
	                            'clickable_link' => 0,
	                            'compute_column_total' => 0
	                    ]],
	            [$modelObj->alias.'.users.organizations.name' => [
	                            'field_type' => 'Data-Field',
	                            '__column' => $modelObj->alias.'.users.organizations.name',
	                            'alias' => 'Organization',
	                            'sortable' => 1,
	                            'searchable' => 1,
	                            'is_invisible' => 0,
	                            'clickable_link' => 0,
	                            'compute_column_total' => 0
	                     ]],
	            [$modelObj->alias.'.user_id' => [
	                            'field_type' => 'Data-Field',
	                            '__column' => $modelObj->alias.'.user_id',
	                            'alias' => 'CAN EDIT',
	                            'sortable' => 1,
	                            'searchable' => 1,
	                            'is_invisible' => 0,
	                            'clickable_link' => 0,
	                            'compute_column_total' => 0
	                    ]],
	            [$modelObj->alias.'.user_id' => [
	                            'field_type' => 'Data-Field',
	                            '__column' => $modelObj->alias.'.user_id',
	                            'alias' => 'CAN DELETE',
	                            'sortable' => 1,
	                            'searchable' => 1,
	                            'is_invisible' => 0,
	                            'clickable_link' => 0,
	                            'compute_column_total' => 0
	                    ]]

	            
	        ];
	    }
        
    }
}

?>

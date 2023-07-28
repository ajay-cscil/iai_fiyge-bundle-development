<?php
/*
CREATE FUNCTION `md5_to_uuid`(`md5` VARCHAR(36) CHARSET utf8mb4) RETURNS VARCHAR(36) CHARSET utf8mb4 DETERMINISTIC MODIFIES SQL DATA SQL SECURITY INVOKER RETURN CONCAT( SUBSTR(md5, 1, 8), '-', SUBSTR(md5, 9, 4), '-', SUBSTR(md5, 13, 4), '-', SUBSTR(md5, 17, 4), '-', SUBSTR(md5, 21));
*/

system('cls');
system('clear');
define('DS', DIRECTORY_SEPARATOR);
define('ROOT', __DIR__);
define('DEBUG', false);
require_once 'client'.DS.'config'.DS.'connection.php';


$inputline=inputline('Do you want to changed system wide int primary key to UUID(except users/groups) y/n:');
if(	strtolower($inputline) == "y"){
		nl("STARTED");
		nl("DELETE FOLDER ".ROOT.DS.'client'.DS.'tmp');
		rrmdir(ROOT.DS.'client'.DS.'tmp');
		converttouuid();
		rrmdir(ROOT.DS.'client'.DS.'tmp');
		nl("COMPLETED");
	exit();
}else{
	nl("terminated, this operation not supported");
}



function converttouuid(){
	global $connections;
	$globalSkipTables=[
										"sessions",
										"core__revision_log",
										"crm_base__addresses_revision_log",
										"crm_base__email_addresses_revision_log",
										"crm_base__phone_numbers_revision_log"
					];

	

	$globalSkipColumns=[
		"created_by","flags","modified_by","owned_by",
		"revision","primary_acl_group","sequence","seq",
		"stage_flags","user_id","group_id","imported_by",
		"deleted_by","referred_by_agent_id","old_business_rule_id"
	];
	$databases=[
		$connections['acl'], 
	 	$connections['design'], 
		$connections['default']
	];
	$tables = [];
	foreach($databases as $database){
		$mysqli = new mysqli(
			$database['host'], 
			$database['login'], 
			$database['password'], 
			$database['database']
		);
		$sql="
			SELECT DISTINCT TABLE_NAME,TABLE_SCHEMA FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE 	TABLE_SCHEMA = '{$database['database']}'
		";
		echo PHP_EOL.$sql;
		$result = $mysqli->query($sql);
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			if(!in_array($row["TABLE_NAME"], $globalSkipTables)){
				$tables[$row["TABLE_SCHEMA"]."/".$row["TABLE_NAME"]]=$row;
			}
		}
	}

	
		foreach($tables as $tableKey=>$table){
			if(in_array($table['TABLE_NAME'], [
				"access_controls__users",
				"access_controls__groups",
				"logging__action_history",
				"logging__event_log"
			])){
				$cols=$mysqli->query("
					SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE 
					TABLE_NAME = '{$table['TABLE_NAME']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					DATA_TYPE='int' AND
					COLUMN_NAME NOT IN('".implode("','",array_merge($globalSkipColumns,["id","parent_id"]))."')
					AND COLUMN_NAME NOT LIKE '%user_id%'	
					AND COLUMN_NAME NOT LIKE '%group_id%'	
					AND COLUMN_NAME NOT LIKE 'is_%'	
					AND 
					(
						COLUMN_NAME LIKE 'id'
						OR
						COLUMN_NAME LIKE '%_id'
						OR
						COLUMN_NAME LIKE '%related_to%'
						OR
						COLUMN_NAME LIKE '%state%'
						OR
						COLUMN_NAME LIKE '%country%'
						OR
						COLUMN_NAME LIKE '%status%'
					)
				")->fetch_all(MYSQLI_ASSOC);
				$tables[$tableKey]["columns"]=array_column($cols,"COLUMN_NAME");
			}else if(in_array($table['TABLE_NAME'],["core__revision_log", "crm_base__addresses_revision_log",
										"crm_base__email_addresses_revision_log", "crm_base__phone_numbers_revision_log"])){
				$cols=$mysqli->query("
					SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE 
					TABLE_NAME = '{$table['TABLE_NAME']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					COLUMN_NAME NOT IN('".implode("','",$globalSkipColumns)."')
					AND COLUMN_NAME NOT LIKE '%user_id%'	
					AND COLUMN_NAME NOT LIKE '%group_id%'	
					AND COLUMN_NAME NOT LIKE 'is_%'	
					AND 
					(
						COLUMN_NAME = 'related_to'
					)
				")->fetch_all(MYSQLI_ASSOC);
				$tables[$tableKey]["columns"]=array_column($cols,"COLUMN_NAME");

			}else if(in_array($table['TABLE_NAME'], ["dashboards__widgets"])){
				$cols=$mysqli->query("
					SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE 
					TABLE_NAME = '{$table['TABLE_NAME']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					COLUMN_NAME NOT IN('".implode("','",$globalSkipColumns)."')
					AND COLUMN_NAME NOT LIKE '%user_id%'	
					AND COLUMN_NAME NOT LIKE '%group_id%'	
					AND COLUMN_NAME NOT LIKE 'is_%'	
					AND 
					(
						COLUMN_NAME = 'panel_id'
					)
				")->fetch_all(MYSQLI_ASSOC);
				$tables[$tableKey]["columns"]=array_column($cols,"COLUMN_NAME");
				
			}else if(in_array($table['TABLE_NAME'],["campaigns__campaign_log","campaigns__campaign_log_summary",
										"campaigns__campaign_run_log","campaigns__campaign_run_status", 
										"campaigns__campaign_actions"])){
				$cols=$mysqli->query("
					SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE
					TABLE_NAME = '{$table['TABLE_NAME']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					DATA_TYPE='int' AND
					COLUMN_NAME NOT IN('".
						implode("','",array_merge($globalSkipColumns,["id","action","action_code"]))
						."') 
					AND COLUMN_NAME NOT LIKE '%user_id%'	
					AND COLUMN_NAME NOT LIKE '%group_id%'	
					AND COLUMN_NAME NOT LIKE 'is_%'	
					AND 
					(
						COLUMN_NAME LIKE 'id'
						OR
						COLUMN_NAME LIKE '%_id'
						OR
						COLUMN_NAME LIKE '%related_to%'
						OR
						COLUMN_NAME LIKE '%state%'
						OR
						COLUMN_NAME LIKE '%country%'
						OR
						COLUMN_NAME LIKE '%status%'
					)
				")->fetch_all(MYSQLI_ASSOC);
				$tables[$tableKey]["columns"]=array_column($cols,"COLUMN_NAME");
			}else{
				$cols=$mysqli->query("
					SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE 
					TABLE_NAME = '{$table['TABLE_NAME']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
					DATA_TYPE='int' AND
					COLUMN_NAME NOT IN('".implode("','",$globalSkipColumns)."')
					AND COLUMN_NAME NOT LIKE '%user_id%'	
					AND COLUMN_NAME NOT LIKE '%group_id%'	
					AND COLUMN_NAME NOT LIKE 'is_%'	
					
					AND 
					(
						COLUMN_NAME LIKE 'id'
						OR
						COLUMN_NAME LIKE '%_id'
						OR
						COLUMN_NAME LIKE '%related_to%'
						OR
						COLUMN_NAME LIKE '%state%'
						OR
						COLUMN_NAME LIKE '%country%'
						OR
						COLUMN_NAME LIKE '%status%'
						
					)
				")->fetch_all(MYSQLI_ASSOC);
				$tables[$tableKey]["columns"]=array_column($cols,"COLUMN_NAME");
			}
			$tables[$tableKey]["all_columns"]=[];
			foreach($mysqli->query("
										SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
										WHERE 
										TABLE_NAME = '{$table['TABLE_NAME']}' AND 
										TABLE_SCHEMA='{$table['TABLE_SCHEMA']}' AND 
										TABLE_SCHEMA='{$table['TABLE_SCHEMA']}'
					")->fetch_all(MYSQLI_ASSOC) as $column){
				$tables[$tableKey]["all_columns"][$column["COLUMN_NAME"]]=$column;
			}
		}
	echo PHP_EOL."---------------------START-------------------------------";
	$notNullTable=['campaigns__campaign_run_status'];
	foreach($tables as $table){
		if(!empty($table["columns"])){
			$columnSQL=[];
			foreach($table["columns"] as $column){
				$schemaSQL="ALTER TABLE {$table["TABLE_SCHEMA"]}.{$table["TABLE_NAME"]} CHANGE {$column} {$column} VARCHAR(36) ".($column !="id" && !in_array($table["TABLE_NAME"], $notNullTable)?" default null ":"");	

				echo PHP_EOL.$schemaSQL;
				$mysqli->query($schemaSQL);
				
				
				$relatedToModel="{$column}_model";
				if(array_key_exists($relatedToModel, $table["all_columns"])){
					$columnSQL[]="{$column} = IF({$column} IS NOT NULL AND {$column} != 0 AND {$column} != '0' AND {$column} != '' AND {$relatedToModel} NOT IN ('users','groups','access_controls_groups','access_controls_users'),md5_to_uuid(md5({$column})),{$column})";
				}else{
					$columnSQL[]="{$column} = IF({$column} IS NOT NULL AND {$column} != 0 AND {$column} != '0' AND {$column} != '',md5_to_uuid(md5({$column})),{$column})";	
				}
			}
			$dataSQL="UPDATE {$table["TABLE_SCHEMA"]}.{$table["TABLE_NAME"]} SET ".implode(", ",$columnSQL);
			echo PHP_EOL.$dataSQL;
			$mysqli->query($dataSQL);
		}
	}

	
	$result = $mysqli->query("
					SELECT distinct model_class,id FROM 
					{$connections['design']["database"]}.development_base__models 
					WHERE deleted=0
				");
	$modelClasses=[];
	while($row = $result->fetch_array(MYSQLI_ASSOC)){
		$modelClasses[$row["model_class"]]=$row["id"];
	}
	ksort($modelClasses);
	pr($modelClasses);

	
	foreach($tables as $table){
		$modelClass=explode("__",$table["TABLE_NAME"]);
		if(count($modelClass) ==2){
			$modelClass="\\module\\{$modelClass[0]}\\model\\{$modelClass[1]}";
			if(isset($modelClasses[$modelClass])){
				$modelID=$modelClasses[$modelClass];
				$fields = $mysqli->query("
						SELECT * FROM 
						{$connections['design']["database"]}.development_base__models 
						WHERE deleted=0 AND parent_id='{$modelID}' AND template='fields'
					")->fetch_all(MYSQLI_ASSOC);
				foreach($fields as $field){
					if(in_array($field['name'], $table['columns'])){
						$field['properties']=json_decode($field['properties'],true);
						if(isset($field['properties'][$field['name']])){
							$field['properties'][$field['name']]['ntype']='string';
							$field['properties'][$field['name']]['length']=36;
							$field['properties']=json_encode($field['properties']);

							$metaSQL="UPDATE {$connections['design']["database"]}.development_base__models 
								     SET properties='{$mysqli->real_escape_string($field['properties'])}' WHERE id='{$field['id']}' ";
							echo PHP_EOL.$metaSQL;	
							$mysqli->query($metaSQL);     
						}
					}
				}
				$modelClasses[$modelClass]=[$modelClasses[$modelClass],"META UPDATED"];
			}
		}
	}
	pr($modelClasses);
	exit;
}

function pr($data){
		print_r($data);
}

function rscandir($dir, &$results = array()) {
	if(is_dir($dir)){
	    $files = scandir($dir);
	    foreach ($files as $key => $value) {
	        $path = realpath($dir . DIRECTORY_SEPARATOR . $value);
	        if (!is_dir($path)) {
	            $results[] = $path;
	        } else if ($value != "." && $value != ".." && !in_array($value,['webroot','storage','.svn']) ) {
	            rscandir($path, $results);
	            $results[] = $path;
	        }
	    }
	}
    return $results;
}
function renamedir($dir, $oldName, $newName) {
    $files = scandir($dir);
    foreach ($files as $key => $value) {
        $path = realpath($dir . DIRECTORY_SEPARATOR . $value);
        if (!is_dir($path)) {
        } else if ($value != "." && $value != ".." && !in_array($value,['webroot','storage','.svn'])) {
        	renamedir($path, $oldName, $newName);
        	if($value==$oldName){
        		nl("RENAMED FOLDER {$path}=> ".$dir . DIRECTORY_SEPARATOR.$newName);
        		if(!constant('DEBUG')){
        			rename($path, $dir . DIRECTORY_SEPARATOR.$newName);
        		}
        	}
        }
    }
}
function rrmdir($dir, $deleteRootFolder=true) { 
	   if (is_dir($dir)) { 
		     $objects = scandir($dir);
		     foreach ($objects as $object) { 
		       if ($object != "." && $object != ".." ) { 
		         if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object))
		           rrmdir($dir. DIRECTORY_SEPARATOR .$object);
		         else
		           unlink($dir. DIRECTORY_SEPARATOR .$object); 
		       } 
		     }
		    if($deleteRootFolder){
		    	 rmdir($dir); 
		 	}
	   } 
 }
function nl($message,$type="NOTICE"){
	echo PHP_EOL.PHP_EOL."{$type}: {$message}";
}
function inputline($message,$match=true){
	do{
		$input = trim(readline($message));
	}while( ($match == true && empty($input)) || (is_array($match) &&  !in_array($input,$match)) );
	return $input;
}
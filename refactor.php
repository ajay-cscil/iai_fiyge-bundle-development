<?php
system('cls');
system('clear');
define('DS', DIRECTORY_SEPARATOR);
define('ROOT', __DIR__);
define('DEBUG', false);
require_once 'client'.DS.'config'.DS.'connection.php';

$action=inputline('Please enter the ACTION name(update, delete):',['update','delete']);
$entity=inputline('please enter the ENTITY TYPE(module, controller, model, column):',['module','controller','model','column']);
$search=["from"=>[], "to"=>[], "old_plural"=>"", "new_plural"=>"", "old_singular"=>"", "new_singular"=>""];

if($action =="update"){
	if($entity == "module"){
		$moduleName = $oldName = inputline('please enter old MODULE name(lowercase):');
		$newName = inputline('please enter new MODULE name(lowercase):');
	}elseif($entity == "controller"){
		$moduleName=inputline('please enter the MODULE name(lowercase):');
		$oldName = inputline('please enter old CONTROLLER name(lowercase):');
		$newName = inputline('please enter new CONTROLLER name(lowercase):');
	}elseif($entity == "model"){
		$moduleName=inputline('please enter the MODULE name(lowercase):');
		$oldName = inputline('please enter old MODEL name(lowercase):');
		$newName = inputline('please enter new MODEL name(lowercase):');
	}elseif($entity == "column"){
		$moduleName=inputline('please enter the MODULE name(lowercase):');
		$oldName = inputline('please enter old COLUMN name(lowercase):');
		$newName = inputline('please enter new COLUMN name(lowercase):');
	}
	if(in_array($entity,['module', 'controller', 'model'])){
		$search["old_plural"] = inputline('please enter old PLURAL LABEL(case sensitive):');
		$search["new_plural"] = inputline('please enter new PLURAL LABEL(case sensitive):');
		
		$search["old_singular"] = inputline('please enter old SINGULAR LABEL(case sensitive):');
		$search["new_singular"] = inputline('please enter new SINGULAR LABEL(case sensitive):');
	}else if(in_array($entity,['column'])){
		$search["old_plural"] = inputline('please enter old LABEL(case sensitive):');
		$search["new_plural"] = inputline('please enter new LABEL(case sensitive):');
	}
}else if($action =="delete"){
	if($entity == "module"){
		$moduleName = $oldName = $newName = inputline('please enter MODULE name(lowercase):');
		//$search["old_plural"] = inputline('please enter PLURAL LABEL(case sensitive):');
		//$search["old_singular"] = inputline('please enter SINGULAR LABEL(case sensitive):');	
	}elseif($entity == "controller"){
		$moduleName=inputline('please enter the MODULE name(lowercase):');
		$oldName = $newName = inputline('please enter CONTROLLER name(lowercase):');
		//$search["old_plural"] = inputline('please enter PLURAL LABEL(case sensitive):');
		//$search["old_singular"] = inputline('please enter SINGULAR LABEL(case sensitive):');
	}elseif($entity == "model"){
		$moduleName=inputline('please enter the MODULE name(lowercase):');
		$oldName = $newName = inputline('please enter MODEL name(lowercase):');
		//$search["old_plural"] = inputline('please enter PLURAL LABEL(case sensitive):');
		//$search["old_singular"] = inputline('please enter SINGULAR LABEL(case sensitive):');
	}else if($entity == "column"){
		$moduleName = inputline('please enter MODULE name(lowercase):');
		$oldName = inputline('please enter MODEL name(lowercase):');
		$newName = inputline('please enter COLUMN name(lowercase), keep empty for auto-clean:',false);
	}else{
		nl("terminated, this operation not supported");
	}
}


if(strtolower(inputline('should we continue(Y/N):')) !== "y" ){
	exit();
}


nl("STARTED");
nl("DELETE FOLDER ".ROOT.DS.'client'.DS.'tmp');
rrmdir(ROOT.DS.'client'.DS.'tmp');
$functionName="{$action}_{$entity}";
if(is_callable($functionName)){
	$functionName($moduleName,$oldName,$newName,$search);
}
rrmdir(ROOT.DS.'client'.DS.'tmp');
nl("COMPLETED");

function update_module($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);
	renamedir(ROOT.DS.'client'.DS.'module'.DS.$moduleName, $oldName, $newName);

	// find all files and rename
	alter_filename($oldName,$newName,$search,[ROOT.DS.'client'.DS.'module'.DS.$moduleName]);

	// replace module name within module
	$fileReplacement=$search;
	$fileReplacement["from"][]=$oldName;
	$fileReplacement["to"][]=$newName;
	update_filecontent($oldName,$newName,$fileReplacement,rscandir(ROOT.DS.'client'.DS.'module'.DS.$moduleName));

	// replace module_class within other modules
	$fileReplacement=["from"=>["module\\\\{$oldName}"], "to"=>["module\\\\{$newName}"]];
	update_filecontent($oldName,$newName,$fileReplacement,
		array_filter(rscandir(ROOT.DS.'client'), function($file)use($moduleName){  return stripos($moduleName,"/{$moduleName}/") !== false; } )
	);

	// find all tables and rename
	alter_tablename("{$oldName}__","{$newName}__",$search);
	
	// find all records and rename
	$search["old_name"]="{$oldName}";
	$search["new_name"]="{$newName}";
	update_matadata($moduleName,'','','','module',$search);
}
function update_controller($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);
	renamedir(ROOT.DS.'client'.DS.'module'.DS.$moduleName.DS, $oldName, $newName);

	// find all files and rename
	alter_filename($oldName,$newName,$search,[ROOT.DS.'client'.DS.'module'.DS.$moduleName]);

	// replace module name within module
	$fileReplacement=$search;
	$fileReplacement["from"][]=$oldName;
	$fileReplacement["to"][]=$newName;
	update_filecontent($oldName,$newName,$fileReplacement,rscandir(ROOT.DS.'client'.DS.'module'.DS.$moduleName));


	// replace module_class within other modules
	$fileReplacement=[
		"from"=>["module\\\\{$moduleName}\\\\controller\\\\{$oldName}", "module\\\\{$moduleName}\\\\model\\\\{$oldName}"],
		"to"=>["module\\\\{$moduleName}\\\\controller\\\\{$newName}", "module\\\\{$moduleName}\\\\model\\\\{$newName}"]
	];
	update_filecontent($oldName,$newName,$fileReplacement,
		array_filter(
			rscandir(ROOT.DS.'client'), function($file)use($moduleName){  return stripos($moduleName,"/{$moduleName}/") !== false; } 
		)
	);

	// find all tables and rename
	alter_tablename("{$moduleName}__{$oldName}","{$moduleName}__{$newName}",$search);
	
	// find all records and rename
	$search["old_name"]=$oldName;
	$search["new_name"]=$newName;
	update_matadata($moduleName,$oldName,$oldName,'','controller',$search);
}
function update_model($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);
	renamedir(ROOT.DS.'client'.DS.'module'.DS.$moduleName.DS, $oldName, $newName);

	// find all files and rename
	alter_filename($oldName,$newName,$search,[ROOT.DS.'client'.DS.'module'.DS.$moduleName]);

	// replace module name within module
	$fileReplacement=$search;
	$fileReplacement["from"][]=$oldName;
	$fileReplacement["to"][]=$newName;
	update_filecontent($oldName,$newName,$fileReplacement,rscandir(ROOT.DS.'client'.DS.'module'.DS.$moduleName));

	// replace module_class within other modules
	$fileReplacement=[
		"from"=>["module\\\\{$moduleName}\\\\model\\\\{$oldName}"],
		"to"=>["module\\\\{$moduleName}\\\\model\\\\{$newName}"]
	];
	update_filecontent($oldName,$newName,$fileReplacement,
		array_filter(
			rscandir(ROOT.DS.'client'), function($file)use($moduleName){  return stripos($moduleName,"/{$moduleName}/") !== false; } 
		)
	);

	// find all tables and rename
	alter_tablename("{$moduleName}__{$oldName}","{$moduleName}__{$newName}",$search);
	
	// find all records and rename
	$search["old_name"]=$oldName;
	$search["new_name"]=$newName;
	update_matadata($moduleName,$oldName,$oldName,'','model',$search);
}

function update_column($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);
	
	// replace module name within module
	$fileReplacement=$search;
	$fileReplacement["from"][]=$oldName;
	$fileReplacement["to"][]=$newName;
	update_filecontent($oldName,$newName,$fileReplacement,rscandir(ROOT.DS.'client'.DS.'module'.DS.$moduleName));

	// find all tables and rename
	alter_columnname($moduleName,$oldName,$newName);
	
	// find all records and rename
	$search["old_name"]=$oldName;
	$search["new_name"]=$newName;
	update_matadata($moduleName,'','','','column',$search);
}

function delete_module($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);

	// delete module folder
	if(!constant('DEBUG')){
		rrmdir(ROOT.DS.'client'.DS.'module'.DS.$moduleName.DS,false);
	}

	// find all tables and delete
	alter_tablename("{$moduleName}__","{$moduleName}__",$search,true);

	// list file outside module to be edited manually.
	$fileReplacement=$search;
	$fileReplacement["from"][]="\\\\module\\\\{$moduleName}\\\\";
	$fileReplacement["from"][]="\\\\module\\\\{$moduleName}\\\\";
	search_filecontent($oldName, $newName, $fileReplacement, 
		array_filter(rscandir(ROOT.DS.'client'),function($file)use($moduleName){ return substr($file, -4) ==".php" &&  stripos($file,'/locale/') === false &&  stripos($file,"/{$moduleName}/") === false; } )
	);
	delete_matadata($moduleName, '', '', '', 'module');
}
function delete_controller($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);

	// delete matching files in module
	alter_filename($oldName,$newName,$search,[ROOT.DS.'client'.DS.'module'.DS.$moduleName],true);

	// delete matching tables
	alter_tablename("{$moduleName}__{$oldName}","{$moduleName}__{$newName}",$search,true);

	// list file outside module to be edited manually.
	$fileReplacement=$search;
	$fileReplacement["from"][]="\\\\module\\\\{$moduleName}\\\\controller\\\\{$oldName}";
	$fileReplacement["from"][]="\\\\module\\\\{$moduleName}\\\\model\\\\{$oldName}";
	search_filecontent($oldName, $newName, $fileReplacement, 
		array_filter(rscandir(ROOT.DS.'client'),function($file){ return substr($file, -4) ==".php"  &&  stripos($file,'/locale/') === false; } )
	);
	delete_matadata($moduleName, $oldName, $oldName, '', 'controller');
}
function delete_model($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$oldName=strtolower($oldName);
	$newName=strtolower($newName);

	// delete matching files in module
	alter_filename($oldName,$newName,$search,[ROOT.DS.'client'.DS.'module'.DS.$moduleName],true);

	// delete matching tables
	alter_tablename("{$moduleName}__{$oldName}","{$moduleName}__{$newName}",$search,true);

	// list file outside module to be edited manually.
	$fileReplacement=$search;
	$fileReplacement["from"][]="\\\\module\\\\{$moduleName}\\\\model\\\\{$oldName}";
	search_filecontent($oldName, $newName, $fileReplacement, 
		array_filter(rscandir(ROOT.DS.'client'),function($file){ return substr($file, -4) ==".php"  &&  stripos($file,'/locale/') === false; } )
	);
	delete_matadata($moduleName, $oldName, $oldName, '', 'model');
}
function delete_column($moduleName, $oldName, $newName, $search){
	// find all files and rename
	$moduleName=strtolower($moduleName);
	$model=$controller=$oldName=strtolower($oldName);
	$column=$newName=strtolower($newName);
	delete_matadata($moduleName, $controller, $model, $column, 'column');
}

function alter_filename($oldName, $newName, $search, $paths, $dropFile=false){
	$fileslist=[];
	foreach($paths as $path){
		$files=rscandir($path);
		foreach($files as $k=>$file){
			if(stripos($file,$oldName) !== false){
				if($dropFile){
					nl("DELETED FILE {$file}");
					if(!constant('DEBUG')){
						unlink($file);
					}
				}else{
					$newfile=str_replace($oldName,$newName,$file);
					nl("RENAME FILE {$file}=> ".$newfile);
					if(!constant('DEBUG')){
						rename($file, $newfile);
						$files[$k]=$newfile;
					}
				}
			}
		}
		$fileslist = array_merge($fileslist,$files);
	}
	return $fileslist;
}
function update_filecontent($oldName, $newName, $search, $files){
	$fileReplacement=$search;
	// file all file content and rename
	nl("FILES CONTENT REPLACE");
	foreach($files as $k=>$file){
		$content=file_get_contents($file);
		$content=str_replace($fileReplacement["from"],$fileReplacement["to"],$content);

		if(isset($search["old_plural"]) && isset($search["new_plural"])){
			$content=str_replace($search["old_plural"],"OLD-PLURAL-TXT",$content);
		}
		if(isset($search["old_singular"]) && isset($search["new_singular"])){
			$content=str_replace($search["old_singular"],"OLD-SINGULAR-TXT",$content);
		}
		if(isset($search["old_plural"]) && isset($search["new_plural"])){
			$content=str_replace("OLD-PLURAL-TXT",$search["new_plural"],$content);
		}
		if(isset($search["old_singular"]) && isset($search["new_singular"])){
			$content=str_replace("OLD-SINGULAR-TXT",$search["new_singular"],$content);
		}
		if(!constant('DEBUG')){
			file_put_contents($file, $content);	
		}
	}
}
function search_filecontent($oldName, $newName, $search, $files){
	$fileReplacement=$search;
	// file all file content and rename
	nl("FILES CONTENT REPLACE");
	//$fileReplacement["from"][]=$search["old_plural"];
	//$fileReplacement["from"][]=$search["old_singular"];
	$fileReplacement["from"]=array_unique(array_filter($fileReplacement["from"]));
	foreach($files as $k=>$file){
		$content=file_get_contents($file);
		$matches=[];
		foreach($fileReplacement["from"] as $needle){
			if(stripos($content,$needle) !== false){
				$matches[]=$needle;
			}
		}
		if(!empty($matches)){
			nl("Edit file '{$file}' to remove reference to '".implode(", ",$matches)."'","TODO");
		}
	}
}
function alter_tablename($oldName, $newName, $search, $dropTable=false){
	global $connections;
	$databases=[
		$connections['acl'], 
		$connections['design'], 
		$connections['default']
	];
	foreach($databases as $database){
		$mysqli = new mysqli(
			$database['host'], 
			$database['login'], 
			$database['password'], 
			$database['database']
		);
		$result = $mysqli->query("
			SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_NAME LIKE '%{$oldName}%' AND TABLE_SCHEMA='{$database['database']}'
		");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			if($dropTable){
				nl("DROP TABLE {$row['TABLE_NAME']}");
				if(!constant('DEBUG')){
					$mysqli->query("DROP TABLE {$row['TABLE_NAME']}");
				}
			}else{
				$newTableName=str_replace($oldName,$newName,$row['TABLE_NAME']);
				nl("RENAME TABLE {$row['TABLE_NAME']} => {$newTableName}");
				if(!constant('DEBUG')){
					$mysqli->query("ALTER TABLE {$row['TABLE_NAME']} RENAME {$newTableName}");
				}	
			}
		}
	}
}

function alter_columnname($moduleName,$oldName,$newName){
	global $connections;
	$databases=[
		$connections['acl'], 
		$connections['design'], 
		$connections['default']
	];
	foreach($databases as $database){
		$mysqli = new mysqli(
			$database['host'], 
			$database['login'], 
			$database['password'], 
			$database['database']
		);
		$result = $mysqli->query("
			SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_NAME LIKE '{$moduleName}_%' AND TABLE_SCHEMA='{$database['database']}' AND COLUMN_NAME ='{$oldName}'
		");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			nl("RENAME TABLE COLUMN {$row['TABLE_NAME']}.{$oldName} => {$row['TABLE_NAME']}.{$newName}");
			if(!constant('DEBUG')){
				$mysqli->query("ALTER TABLE {$row['TABLE_NAME']} RENAME COLUMN {$oldName} TO {$newName}");
			}
		}
	}
}

function update_matadata($moduleName,$controller='',$model='',$column='',$type='',$search=[]){
		global $connections;
		
		if(empty($model)){
			$model=$controller;
		}
		$database=$connections['design'];
		$mysqli = new mysqli(
			$database['host'], 
			$database['login'], 
			$database['password'], 
			$database['database']
		);

		$moduleInfo = ($mysqli->query("
				SELECT * from {$database['database']}.development_base__modules WHERE name='{$moduleName}'
			"))->fetch_array(MYSQLI_ASSOC);		

		switch($type){
				case "module":
					nl("module metadata");
					
						$sql="SELECT * FROM {$database['database']}.development_base__modules WHERE id='{$moduleInfo['id']}'";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__modules",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__acl_roles WHERE module_id='{$moduleInfo['id']}'";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__acl_roles",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__change_log WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__change_log",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__configurations WHERE module_id='{$moduleInfo['id']}'";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__configurations",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.core__listviews WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.core__listviews",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.core__printviews WHERE module_id='{$moduleInfo['id']}'";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.core__printviews",
								$search,
								$mysqli->query($sql)
							);
						}

					
				case "controller":
					nl("controller metadata");
					
						$sql="SELECT * FROM {$database['database']}.development_base__controllers WHERE module_id='{$moduleInfo['id']}'";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__controllers",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__dependencies WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__dependencies",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__menus WHERE module_id='{$moduleInfo['id']}'";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__menus",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="
								SELECT {$database['database']}.development_base__locale_translations.*  FROM {$database['database']}.development_base__locale_translations 
								INNER JOIN  {$database['database']}.development_base__locales ON({$database['database']}.development_base__locale_translations.locale_id={$database['database']}.development_base__locales.id)
								WHERE {$database['database']}.development_base__locales.module_id='{$moduleInfo['id']}'  
						";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__locale_translations",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="
								SELECT * FROM {$database['database']}.core__listviews 
								WHERE 
								module_id='{$moduleInfo['id']}' 
								AND 
								controller='{$moduleInfo['name']}/{$controller}'  
						";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.core__listviews",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="
								SELECT * FROM {$database['database']}.core__printviews 
								WHERE 
								module_id='{$moduleInfo['id']}' 
								AND 
								controller='{$moduleInfo['name']}/{$controller}'  
						";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.core__printviews",
								$search,
								$mysqli->query($sql)
							);
						}

					

				case "model":
					nl("model metadata");
					

						$sql="SELECT * FROM {$database['database']}.development_base__models WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__models",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__forms WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__forms",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.core__listviews WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.core__listviews",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.analytics__reports WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.analytics__reports",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="
								SELECT * FROM {$database['database']}.development_base__associations WHERE 
								(
									foreign_model_class LIKE '%\\module\\{$moduleInfo['name']}\\%' 
									OR 
									primary_model_class LIKE '%\\{$moduleInfo['name']}\\%' 
								) 
							";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__associations",
								$search,
								$mysqli->query($sql)
							);
						}
					
					break;
				case "column":
					nl("column metadata");
					$sql="SELECT * FROM {$database['database']}.development_base__models WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__models",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.development_base__forms WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__forms",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.core__listviews WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.core__listviews",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="SELECT * FROM {$database['database']}.analytics__reports WHERE module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.analytics__reports",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="
								SELECT * FROM {$database['database']}.development_base__associations WHERE 
								(
									foreign_model_class LIKE '%\\module\\{$moduleInfo['name']}\\%' 
									OR 
									primary_model_class LIKE '%\\{$moduleInfo['name']}\\%' 
								) 
							";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__associations",
								$search,
								$mysqli->query($sql)
							);
						}

						$sql="
								SELECT {$database['database']}.development_base__locale_translations.* 
								FROM {$database['database']}.development_base__locale_translations 
								INNER JOIN {$database['database']}.development_base__locales 
								ON({$database['database']}.development_base__locale_translations.locale_id={$database['database']}.development_base__locales.id) 
								WHERE {$database['database']}.development_base__locales.module_id='{$moduleInfo['id']}' ";
						nl($sql,"SQL");
						if(!constant('DEBUG')){
							update_matadata_tablerecords(
								$moduleName,
								"{$database['database']}.development_base__locale_translations",
								$search,
								$mysqli->query($sql)
							);
						}


						break;
		}
}
function delete_matadata($moduleName,$controller='',$model='',$column='',$type=''){
		global $connections;
		
		if(empty($model)){
			$model=$controller;
		}
		$database=$connections['design'];
		$mysqli = new mysqli(
			$database['host'], 
			$database['login'], 
			$database['password'], 
			$database['database']
		);

		$moduleInfo = ($mysqli->query("
				SELECT * from {$database['database']}.development_base__modules WHERE name='{$moduleName}'
			"))->fetch_array(MYSQLI_ASSOC);		

		switch($type){
				case "module":
					nl("delete module metadata");
					if(!constant('DEBUG')){
						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__modules 
							WHERE id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__acl_roles 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__change_log 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__configurations 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.core__listviews 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.core__printviews 
							WHERE module_id='{$moduleInfo['id']}' 
						");
					}
				case "controller":
					nl("delete controller metadata");
					if(!constant('DEBUG')){
						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__controllers 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__dependencies 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__menus 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__locale_translations 
							INNER JOIN  {$database['database']}.development_base__locales ON({$database['database']}.development_base__locale_translations.locale_id={$database['database']}.development_base__locales.id)
							WHERE {$database['database']}.development_base__locales.module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__locales 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.core__listviews 
							WHERE 
							module_id='{$moduleInfo['id']}' 
							AND 
							controller='{$moduleInfo['name']}/{$controller}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.core__printviews 
							WHERE 
							module_id='{$moduleInfo['id']}' 
							AND 
							controller='{$moduleInfo['name']}/{$controller}' 
						");
					}

				case "model":
					nl("delete model metadata");
					if(!constant('DEBUG')){
						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__models 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__forms 
							WHERE module_id='{$moduleInfo['id']}' 
						");

						$mysqli->query("
							DELETE FROM {$database['database']}.development_base__associations WHERE 
							(
								foreign_model_class LIKE '%\\module\\{$moduleInfo['name']}\\%' 
								OR 
								primary_model_class LIKE '%\\{$moduleInfo['name']}\\%' 
							)
						");
					}
					break;
				case "column":
					nl("delete column metadata");
						$modelInfo = (
								$mysqli->query("
								SELECT * FROM {$database['database']}.development_base__models 
								WHERE 
									module_id='{$moduleInfo['id']}' 
								AND template='model' 
								AND model_class='\\\\module\\\\{$moduleInfo['name']}\\\\model\\\\{$model}'
						"))->fetch_array(MYSQLI_ASSOC);
						if(is_array($modelInfo)){
							$modelInfo['properties']=json_decode($modelInfo['properties'],true);
						}
						$tableName= is_array($modelInfo) && isset($modelInfo['properties']) && isset($modelInfo['properties']['table'])?$modelInfo['properties']['table']:"{$moduleInfo['name']}__{$modelInfo['name']}";

						$tableFields = $mysqli->query("
							SELECT DISTINCT COLUMN_NAME,TABLE_NAME,TABLE_SCHEMA FROM INFORMATION_SCHEMA.COLUMNS 
							WHERE TABLE_SCHEMA='{$connections['default']['database']}' AND TABLE_NAME='{$tableName}'
						")->fetch_all(MYSQLI_ASSOC);
						

						$modelFields=array_column($mysqli->query("
							SELECT name FROM {$database['database']}.development_base__models 
							WHERE parent_id='{$modelInfo['id']}' AND template='fields'
						")->fetch_all(MYSQLI_ASSOC),'name');

						$standardFields=[
							'id',
							'data_conflict', 'is_commit_pending', 'deleted', 'lft', 'rgt', 'created_by', 
							'modified_by', 'owned_by', 'created', 'modified', 'revision', 'flags','left',
							'right','imported','imported_by','inherited_read_acl',
							'message_error','message_info','message_warn',
							'__created_by','__modified_by','__owned_by','__imported_by',
							'__id','id_business_key','__primary_acl_group','primary_acl_group','is_demo_data'
						];
						$modelFields=array_merge($standardFields,$modelFields);

						if(!empty($column)){
							$modelFields=array_diff($modelFields, [$column]);
						}

						$cleanupFields=[];
						$k=0;
						foreach($tableFields as $tableField){
							if(!in_array($tableField['COLUMN_NAME'], $modelFields)){
								$cleanupFields[++$k]=$tableField;
							}
						}
						if(!empty($cleanupFields)){
							foreach($cleanupFields as $k=>$cleanupField){
								echo PHP_EOL."{$k}. {$cleanupField['TABLE_NAME']}.{$cleanupField['COLUMN_NAME']}";
							}
							echo PHP_EOL;
							$tobedeleted=inputline("Please specify comma seperated list of field-no to be deleted:");
							$tobedeleted=explode(",",$tobedeleted);
								foreach($cleanupFields as $k=>$cleanupField){
									if(in_array($k, $tobedeleted)){
										nl("DROP COLUMN {$cleanupField['TABLE_SCHEMA']}.{$cleanupField['TABLE_NAME']}.{$cleanupField['COLUMN_NAME']} ");
										if(!constant('DEBUG')){
											$mysqli->query("
												ALTER TABLE {$cleanupField['TABLE_SCHEMA']}.{$cleanupField['TABLE_NAME']} 
												DROP COLUMN {$cleanupField['COLUMN_NAME']};
											");
											$mysqli->query("
												DELETE FROM {$database['database']}.development_base__models 
												WHERE 
												parent_id='{$modelInfo['id']}' AND template='fields' AND name='{$cleanupField['COLUMN_NAME']}'
											");
										}
									}
								}
						}
		}
}
function update_matadata_tablerecords($moduleName,$tableName,$search,$resultList){
			global $connections;
			$database=$connections['design'];
			$mysqli = new mysqli(
					$database['host'], 
					$database['login'], 
					$database['password'], 
					$database['database']
			);

			$rowCount=0;
			while($resultRow=$resultList->fetch_array(MYSQLI_ASSOC)){	
				$resultRow=json_encode($resultRow);
				
				if(isset($search["old_name"]) && isset($search["new_name"])){
					$resultRow=str_replace($search["old_name"],"OLD-NAME-TXT",$resultRow);
				}
				if(isset($search["old_plural"]) && isset($search["new_plural"])){
					$resultRow=str_replace($search["old_plural"],"OLD-PLURAL-TXT",$resultRow);
				}
				if(isset($search["old_singular"]) && isset($search["new_singular"])){
					$resultRow=str_replace($search["old_singular"],"OLD-SINGULAR-TXT",$resultRow);
				}

				if(isset($search["old_name"]) && isset($search["new_name"])){
					$resultRow=str_replace("OLD-NAME-TXT",$search["new_name"],$resultRow);
				}
				if(isset($search["old_plural"]) && isset($search["new_plural"])){
					$resultRow=str_replace("OLD-PLURAL-TXT",$search["new_plural"],$resultRow);
				}
				if(isset($search["old_singular"]) && isset($search["new_singular"])){
					$resultRow=str_replace("OLD-SINGULAR-TXT",$search["new_singular"],$resultRow);
				}

				$resultRow=json_decode($resultRow,true);
				if(!constant('DEBUG')){
					$up=[];
					foreach($resultRow as $k=>$v){
						$up[]="`{$k}`=?";
					}
					$up=implode(", ",$up);
					$sql = "UPDATE {$tableName} SET {$up} WHERE `id`=?";
					nl("SQL: {$sql}");
					$stmt = $mysqli->prepare($sql);
					$params=array_merge(array_values($resultRow),[$resultRow['id']]);
					$stmt->execute($params);
				}
				$rowCount++;
			}
			nl("SCANNED ROWS {$rowCount}");
}
function update_data_tablerecords($moduleName, $search){
	global $connections;
	$dataReplacement=$search;
	$database=$connections['default'];
	$mysqli = new mysqli(
			$database['host'], 
			$database['login'], 
			$database['password'], 
			$database['database']
	);

		$result = $mysqli->query("
			SELECT DISTINCT TABLE_NAME 
			FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE 
			TABLE_SCHEMA='{$database['database']}' AND TABLE_NAME LIKE '{$moduleName}__%'
		");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			
			$resultList=$mysqli->query("SELECT * FROM {$database['database']}.{$row['TABLE_NAME']}");
			$rowCount=0;
			while($resultRow=$resultList->fetch_array(MYSQLI_ASSOC)){	
				$resultRow=json_encode($resultRow);
				if(isset($search["old_name"]) && isset($search["new_name"])){
					$resultRow=str_replace($search["old_name"],"OLD-NAME-TXT",$resultRow);
				}
				if(isset($search["old_plural"]) && isset($search["new_plural"])){
					$resultRow=str_replace($search["old_plural"],"OLD-PLURAL-TXT",$resultRow);
				}
				if(isset($search["old_singular"]) && isset($search["new_singular"])){
					$resultRow=str_replace($search["old_singular"],"OLD-SINGULAR-TXT",$resultRow);
				}

				if(isset($search["old_name"]) && isset($search["new_name"])){
					$resultRow=str_replace("OLD-NAME-TXT",$search["new_name"],$resultRow);
				}
				if(isset($search["old_plural"]) && isset($search["new_plural"])){
					$resultRow=str_replace("OLD-PLURAL-TXT",$search["new_plural"],$resultRow);
				}
				if(isset($search["old_singular"]) && isset($search["new_singular"])){
					$resultRow=str_replace("OLD-SINGULAR-TXT",$search["new_singular"],$resultRow);
				}

				$resultRow=json_decode($resultRow,true);
				if(!constant('DEBUG')){
					$up=[];
					foreach($resultRow as $k=>$v){
						$up[]="`{$k}`=?";
					}
					$up=implode(", ",$up);
					$sql = "UPDATE {$tableName} SET {$up} WHERE `id`=?";
					nl("SQL: {$sql}");
					$stmt = $mysqli->prepare($sql);
					$params=array_merge(array_values($resultRow),[$resultRow['id']]);
					$stmt->execute($params);
				}
				$rowCount++;
			}
			nl("SCANNED ROWS {$rowCount}");
		}
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
<?php

function env($key) {
    if ($key == 'HTTPS') {
        if (isset($_SERVER['HTTPS'])) {
            return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        }
        return (strpos(env('SCRIPT_URI'), 'https://') === 0);
    }
    if ($key == 'SCRIPT_NAME') {
        if (env('CGI_MODE') && isset($_ENV['SCRIPT_URL'])) {
            $key = 'SCRIPT_URL';
        }
    }
    $val = null;
    if (isset($_SERVER[$key])) {
        $val = $_SERVER[$key];
    } elseif (isset($_ENV[$key])) {
        $val = $_ENV[$key];
    } elseif (getenv($key) !== false) {
        $val = getenv($key);
    }
    if ($key === 'REMOTE_ADDR' && $val === env('SERVER_ADDR')) {
        $addr = env('HTTP_PC_REMOTE_ADDR');
        if ($addr !== null) {
            $val = $addr;
        }
    }
    if ($val !== null) {
        return $val;
    }
    switch ($key) {
        case 'SCRIPT_FILENAME':
            if (defined('SERVER_IIS') && SERVER_IIS === true) {
                return str_replace('\\\\', '\\', env('PATH_TRANSLATED'));
            }
            break;
        case 'DOCUMENT_ROOT':
            $name = env('SCRIPT_NAME');
            $filename = env('SCRIPT_FILENAME');
            $offset = 0;
            if (!strpos($name, '.php')) {
                $offset = 4;
            }
            return substr($filename, 0, strlen($filename) - (strlen($name) + $offset));
            break;
        case 'PHP_SELF':
            return str_replace(env('DOCUMENT_ROOT'), '', env('SCRIPT_FILENAME'));
            break;
        case 'CGI_MODE':
            return (PHP_SAPI === 'cgi');
            break;
        case 'HTTP_BASE':
            $host = env('HTTP_HOST');
            if (substr_count($host, '.') !== 1) {
                return preg_replace('/^([^.])*/i', null, env('HTTP_HOST'));
            }
            return '.' . $host;
            break;
    }
    return null;
}

function uuid() {
    $node = env('SERVER_ADDR');
    $pid = null;
    if (strpos($node, ':') !== false) {
        if (substr_count($node, '::')) {
            $node = str_replace('::', str_repeat(':0000', 8 - substr_count($node, ':')) . ':', $node);
        }
        $node = explode(':', $node);
        $ipv6 = '';
        foreach ($node as $id) {
            $ipv6 .= str_pad(base_convert($id, 16, 2), 16, 0, STR_PAD_LEFT);
        }
        $node = base_convert($ipv6, 2, 10);
        if (strlen($node) < 38) {
            $node = null;
        } else {
            $node = crc32($node);
        }
    } elseif (empty($node)) {
        $host = env('HOSTNAME');
        if (empty($host)) {
            $host = env('HOST');
        }
        if (!empty($host)) {
            $ip = gethostbyname($host);
            if ($ip === $host) {
                $node = crc32($host);
            } else {
                $node = ip2long($ip);
            }
        }
    } elseif ($node !== '127.0.0.1') {
        $node = ip2long($node);
    } else {
        $node = null;
    }
    if (empty($node)) {
        $node = crc32('AIzaSyAN4NaUPmJtZ2033WZmoDZ-9SJnmWl2lt4');
    }
    if (function_exists('zend_thread_id')) {
        $pid = zend_thread_id();
    } else {
        $pid = getmypid();
    }
    if (!$pid || $pid > 65535) {
        $pid = mt_rand(0, 0xfff) | 0x4000;
    }
    $array = explode(' ', microtime());
    list ($timeMid, $timeLow) = $array;
    $uuid = sprintf("%08x-%04x-%04x-%02x%02x-%04x%08x", (int) $timeLow, (int) substr($timeMid, 2) & 0xffff, mt_rand(0, 0xfff) | 0x4000, mt_rand(0, 0x3f) | 0x80, mt_rand(0, 0xff), $pid, $node);
    return $uuid;
}

$server = "md1ughby29pw44y.cabzokx6bmyi.us-east-1.rds.amazonaws.com";
$username = "admin";
$password = "admin";


$appDB = "uat_maax_app";
$designDB = "uat_maax_design";
$aclDB = "uat_maax_acl";
$link_identifier = mysql_connect($server, $username, $password);

function column($sql) {
    global $link_identifier, $appDB, $designDB, $aclDB;
    echo "<br />{$sql}";
    mysql_query($sql, $link_identifier);
}

foreach (
array(
    /*
      Add UUID to
      forms,
      affected columns
      id=>uid
      parent_id=>puid
      1. generate uuid for every id and store in kid.
      2. add pid from parent_id = id.
     */
    array("{$designDB}.development_base__forms", null)
    /*
      menus,
      id=>uid
      parent_id=>puid
      1. generate uuid for every id and store in kid.
      2. add pid from parent_id = id.
     */
    , array("{$designDB}.development_base__models", null)
    , array("{$designDB}.development_base__controllers", null)
    , array("{$designDB}.development_base__menus", "updateDesignACL")
    , array("{$appDB}.brules__business_rules", 'updateBusinessRules')
) as $ii
) {
    list($table, $method) = $ii;
    column("alter table {$table} ADD  `uid` varchar(36) DEFAULT NULL;");
    column("alter table {$table} ADD  `parent_uid` varchar(36) DEFAULT NULL;");

    $result = mysql_query("select id,parent_id from {$table};", $link_identifier);
    $ids = array();
    while ($record = mysql_fetch_assoc($result)) {
        $ids[$record['id']] = array('uuid' => uuid(), 'parent_id' => $record['parent_id']);
    }
    foreach ($ids as $id => $info) {
        $result = mysql_query("update {$table} set uid='{$info['uuid']}',parent_uid='"
                . (isset($ids[$info['parent_id']]) ? $ids[$info['parent_id']]['uuid'] : '')
                . "'   where id='{$id}';", $link_identifier);
    }

    if (function_exists($method)) {
        $method($table, $ids);
    }
}

function updateDesignACL($mtable, $ids) {
    global $link_identifier, $appDB, $designDB, $aclDB;
    /*
      3. design_acl
      aco_uid : replace aco_id with new uuid.
     */
    $table = "{$designDB}.access_controls__design_acl";
    column("alter table {$table} ADD `aco_uid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.aco_id = {$mtable}.id)
                    SET {$table}.aco_uid ={$mtable}.uid;", $link_identifier);
}

function updateBusinessRules($mtable, $ids) {
    global $link_identifier, $appDB, $designDB, $aclDB;

    $table = "{$appDB}.flexflow__types";
    //rule_id
    column("alter table {$table} ADD `buid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.rule_id = {$mtable}.id)
                    SET {$table}.buid ={$mtable}.uid;", $link_identifier);


    $table = "{$appDB}.flexflow__stages";
    //before_enter_rule_id
    //before_exit_rule_id

    column("alter table {$table} ADD `before_enter_rule_buid` varchar(36) DEFAULT NULL;");
    column("alter table {$table} ADD `before_exit_rule_buid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.rule_id = {$mtable}.id)
                    SET {$table}.before_enter_rule_buid ={$mtable}.uid;", $link_identifier);
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.rule_id = {$mtable}.id)
                    SET {$table}.before_exit_rule_buid ={$mtable}.uid;", $link_identifier);



    $table = "{$appDB}.flexflow__notifications_stages";
    //rule_id
    column("alter table {$table} ADD `buid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.rule_id = {$mtable}.id)
                    SET {$table}.buid ={$mtable}.uid;", $link_identifier);



    $table = "{$appDB}.brules__business_rule_run_log";
    //'business_rule_id'
    column("alter table {$table} ADD `buid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.business_rule_id = {$mtable}.id)
                    SET {$table}.buid ={$mtable}.uid;", $link_identifier);


    $table = "{$appDB}.flexflow__actions_notifications";
    //'rule_id'
    column("alter table {$table} ADD `buid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.rule_id = {$mtable}.id)
                    SET {$table}.buid ={$mtable}.uid;", $link_identifier);



    $table = "{$appDB}.flexflow__actions";
    //'rule_id'
    column("alter table {$table} ADD `buid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.rule_id = {$mtable}.id)
                    SET {$table}.buid ={$mtable}.uid;", $link_identifier);
}

foreach (array(
/*
  list-views,
  id=>uiid
  acl_cache id=>uid
  acl_grp_cahce id=>uid
 */

array(
"{$designDB}.core__listviews",
 "{$aclDB}.core__listviews_acl_cache",
 "{$aclDB}.core__listviews_group_acl_cache",
 null
),
 /*
  reports,
  id=>uid
  acl_cache id=>uid
  acl_grp_cahce id=>uid
 */

array(
"{$designDB}.analytics__reports",
 "{$aclDB}.analytics__reports_acl_cache",
 "{$aclDB}.analytics__reports_group_acl_cache",
 null
),
 /*
  widgets,
  id=>uid
  acl_cache id=>uid
  acl_grp_cahce id=>uid
 */
array(
"{$appDB}.dashboards__widgets",
 "{$aclDB}.dashboards__widgets_acl_cache",
 "{$aclDB}.dashboards__widgets_group_acl_cache",
 'populateWidgetPermissions'
)
, array(
"{$designDB}.core__printviews",
 null,
 null,
 null
)
) as $ii) {
    list($table, $uacl, $gacl, $method) = $ii;
    column("alter table {$table} ADD `uid` varchar(36) DEFAULT NULL;");
    if (!is_null($uacl)) {
        column("alter table {$uacl} ADD `uid` varchar(36) DEFAULT NULL;");
    }
    if (!is_null($gacl)) {
        column("alter table {$gacl} ADD `uid` varchar(36) DEFAULT NULL;");
    }
    $result = mysql_query("select id from {$table}", $link_identifier);
    $ids = array();
    while ($record = mysql_fetch_assoc($result)) {
        $ids[$record['id']] = array('uuid' => uuid(), 'parent_id' => '');
    }
    foreach ($ids as $id => $info) {
        $result = mysql_query("update {$table} set uid='{$info['uuid']}' where id='{$id}';", $link_identifier);

        if (!is_null($uacl)) {
            $result = mysql_query("update {$uacl} set uid='{$info['uuid']}' where id='{$id}';", $link_identifier);
        }
        if (!is_null($gacl)) {
            $result = mysql_query("update {$gacl} set uid='{$info['uuid']}' where id='{$id}';", $link_identifier);
        }
    }
    if (function_exists($method)) {
        $method($table, $uacl, $gacl, $ids);
    }
}

function populateWidgetPermissions($mtable, $uacl, $gacl, $ids) {
    global $link_identifier, $appDB, $designDB, $aclDB;
    $table = "{$appDB}.dashboards__widget_permissions";
    column("alter table {$table} ADD `uid` varchar(36) DEFAULT NULL;");
    mysql_query("update {$table} 
                    INNER JOIN {$mtable} ON({$table}.widget_id = {$mtable}.id)
                    SET {$table}.uid ={$mtable}.uid;", $link_identifier);
}

/*
brules 
 	id=>uid
	parent_id=>puid
        all related models to use id.
*/


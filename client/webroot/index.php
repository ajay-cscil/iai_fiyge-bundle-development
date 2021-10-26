<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // cache for 1 day

}
// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

   

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);
//ini_set('error_reporting', E_ALL);
//phpinfo();exit();
$requestStartTime = microtime(true);
/*
 * Define app level constant
 */
define('NS', '\\');
define('DS', DIRECTORY_SEPARATOR);
define('ROOT', dirname(dirname(__DIR__)));
define('APP_NAME', basename(dirname(__DIR__)));
define('PLATFORM_NAME', 'platform');
define('APP', ROOT . DS . APP_NAME);
define('PLATFORM', ROOT . DS . PLATFORM_NAME);
define('TMP', APP . DS . 'tmp');
define('WEBROOT', APP . DS . 'webroot');
define('TUSHAR', ROOT . DS . 'kernel');


set_include_path(TUSHAR . PATH_SEPARATOR);

/*
 * Load utility functions including __autoload()
 */
require_once TUSHAR . DS . 'function.php';
require_once TUSHAR . DS . 'dispatcher.php';

/*
 * Load dispatcher for current request.
 */
try {
    echo \kernel\dispatcher::dispatch($_SERVER['REQUEST_URI']);
} catch (\Exception $e) 
{
    echo $e->getMessage();
}
if (isset($_REQUEST['debug_request_time']) && $_REQUEST['debug_request_time'] == 1) {
    echo '<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Time taken as of last code line:&nbsp;' . round((microtime(true) - $requestStartTime), 3), ' ', __('seconds') . '</div>';
}
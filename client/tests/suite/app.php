<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class AppTests extends TestSuite {
    function AppTests(){
        $this->TestSuite('All tests for App');
        $unitCases=\kernel\app::getFiles(APP.DS.'tests'.DS.'unit');
        /*
        $unitCases=array();
        $unitCases[]='tests/unit/test_of_app.php';
        $unitCases[]='tests/unit/test_of_cache.php';
        $unitCases[]='tests/unit/test_of_controller.php';
        $unitCases[]='tests/unit/test_of_dispatcher.php';
        $unitCases[]='tests/unit/test_of_driver.php';
        $unitCases[]='tests/unit/test_of_function.php';
        $unitCases[]='tests/unit/test_of_form.php';
        $unitCases[]='tests/unit/test_of_html.php';
        $unitCases[]='tests/unit/test_of_locale.php';
        $unitCases[]='tests/unit/test_of_mql.php';
        $unitCases[]='tests/unit/test_of_registry.php';
        $unitCases[]='tests/unit/test_of_request.php';
        */
        
        foreach($unitCases as $case){
            if(stripos($case,'test_of') !== false){
                $this->addFile(APP.DS.$case);
            }
        }
    }
}
?>

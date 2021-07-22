<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class AllTests extends TestSuite {
    function AllTests(){
        $this->TestSuite('All tests for SimpleTest ');
        $this->addFile(APP.DS.'tests'.DS.'unit'.DS.'test.php');
    }
}
?>

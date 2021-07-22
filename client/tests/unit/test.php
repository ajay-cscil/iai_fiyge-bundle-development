<?php
class TestOfAcl extends UnitTestCase{
	public function testAddEntityToUser(){
		$this->assertTrue(true);
	}
	public function testAddEntityToGroup(){
            $this->assertTrue(true);
	}
	public function testAddUserToGroup(){
            $this->assertTrue(true);
	}
	public function testAddGroupToGroup(){
            $this->assertFalse(true);
	}
	public function testDeleteEntityFromUser(){
	
	}
	public function testDeleteEntityFromGroup(){
	
	}
	public function testDeleteUserFromGroup(){
	
	
	}
	public function testDeleteGroupFromGroup(){
	
	
	}
}


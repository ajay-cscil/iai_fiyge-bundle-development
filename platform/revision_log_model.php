<?php


class revision_log_model extends \data_model{
    public $behaviours = array(
        '\\module\\access_controls\\behaviour\\acl' =>
        array(
            'cacheClass' => '1',
            'ownAcl' => '0'
        ),
    );
}
?>

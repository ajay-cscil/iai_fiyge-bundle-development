<?php

/**
 *
 * write any custom code in this class, build operation wont overwrite this class once generated;
 */

namespace module\documentation\controller;

class topics_domain_logic extends \data_controller{

    function __index($request) {
        if ($request->param('current_listview', false) == false) {
            $request->overwrite(true, 'current_listview', 'topics');
        }
        $this->render = 'index';
        $request->layout = 'public_default';
        return parent::index($request);
    }

    function __view($request) {
        $return = parent::view($request);
        $this->render = '__view';
        $request->layout = 'public_detail';
        return $return;
    }

}
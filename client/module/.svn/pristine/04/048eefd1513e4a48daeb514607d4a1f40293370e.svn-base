<?php

/**
 *
 * write any custom code in this class, build operation wont overwrite this class once generated;
 */

namespace module\documentation\controller;

class related_topics_domain_logic extends \design_controller {

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
        $modelObj = $this->modelObj();
        $data = $request->response('data');
        if (!empty($data) && isset($data['related_topics'])) {
            $data['topics'] = current($modelObj->{'topics'}->read($data['related_topics']['topic_id']));
        }
        $request->set('data', $data);
        return $return;
    }

}
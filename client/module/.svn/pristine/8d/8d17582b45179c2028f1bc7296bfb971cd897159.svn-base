<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of graph
 *
 * @author admin
 */

namespace module\documentation\helper\data_view;

class tree {

    public static function build($viewObj, $views, $links, $currentListview, $id) {
        $aros = \tushar\user::read('aros', array());
        foreach ($views as $k => $v) {
            echo "<tr ><td  colspan='2'>" . str_repeat("&nbsp;&nbsp;&nbsp;&nbsp;", isset($v['depth']) ? $v['depth'] : 0)
            . "<div class='twisty-fopen'></div>
            <a  class='" . ($id == $v['topic_id'] ? 'ui-state-active' : '') . "' href='" . $viewObj->request->base . $links['view'] . "id={$v['id']}' >{$v['name']}</a></td></tr>";
            if (isset($v['children']) && is_array($v['children'])) {
                static::build($viewObj, $v['children'], $links, $currentListview, $id);
            }
        }
    }

}

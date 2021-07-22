<?php

namespace module\accounting\helper\presentation;

/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 * Rule to Show add action only for account type of "View"
 */
class accounts {

    public static function add_action(&$action, &$actionParams, $request, $paginate, $primaryKey, $record) {
        if (\array_key_exists('Type', $record) && $record['Type'] != 'View') {
            $actionParams['url'] = '#';
            $actionParams['str'] = str_replace('ui-state-active', ' ui-state-active ui-state-disabled ', $actionParams['str']);
        }
    }

}
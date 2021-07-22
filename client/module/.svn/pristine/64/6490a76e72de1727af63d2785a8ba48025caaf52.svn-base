<?php

/**
 *
 * write any custom code in this class, build operation wont overwrite this class once generated;
 */

namespace module\accounting\controller;

class taxes_domain_logic extends \tushar\controller{

    public function _compute_tax_amount($request) {
        $taxList = $request->param('tax_list');
        if ($taxList != false) {
            $modelObj = $this->modelObj();
            $taxList = json_decode($taxList, true);
            foreach ($taxList as $k => $list) {
                $taxList[$k]['tax_amount'] = $modelObj->computeTaxAmount($list['tax_id'], $list['amount']);
            }
            $request->set('tax_list', $taxList);
        } else {
            $taxID = $request->param('tax_id');
            $amount = $request->param('amount');
            $request->set('tax_id', $taxID);
            $request->set('amount', $amount);
            $request->set('tax_amount', $this->modelObj()->computeTaxAmount($taxID, $amount));
        }
        
        return false;
    }

}
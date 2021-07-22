<?php

/**
 *
 * write any custom code in this class, build operation wont overwrite this class once generated;
 */

namespace module\accounting\model;

class invoice_line_taxes_domain_logic extends \tushar\model{

    public function beforeSave() {
        $taxObj = $this->{'taxes'};
        if (isset($this->data['tax_id']) && !empty($this->data['tax_id'])) {
            $this->data['tax_amount'] = $this->{'taxes'}->computeTaxAmount($this->data['tax_id'], $this->parentData['amount']);
        }
    }

}
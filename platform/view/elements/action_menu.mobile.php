<?php

use kernel\configuration;

$id = $this->get(array('id'), false);
if (isset($this)) {
    $view = &$this;
}

if (\kernel\request::authenticate()) {
    ?>
    <?php

    if ($this->request->action != 'app_menu') {
        $urlParamString = "";
        foreach (array("request_by","related_to","related_id", "related_model", "related_model_class", "current_controller") as $fld) {
            $fldv = $this->request->get($fld, "");
            if (!empty($fldv)) {
                $urlParamString .= "&{$fld}=$fldv";
            }
        }

        if (!isset($this->params['controller_actions']) || $this->params['controller_actions'] !== false) {
            echo '
                         <div data-role="footer" class="ui-bar"  data-position="fixed" >
        <div class="controller-action-panel" data-inline="true" data-role="controlgroup"  data-type="horizontal" data-mini="true" >';

            echo \kernel\html::controllerActions($view, $view->request->module, $view->request->controller, true, $urlParamString);

            echo ' </div></div>';
        }
    }
    ?>

    <?php

}
?>

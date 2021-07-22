<?php

use kernel\configuration;

if (isset($this)) {
    $view = &$this;
}
$subActions = array('index', 'edit', 'view', 'delete');
if (\kernel\request::authenticate()) {
    $links = array();
    $modelObj = \module\development_base\model\menus::getInstance();

    $uuid = $this->request->get('search_view');
    ?>
    <div class="action-menu action-bar" search_view="<?php echo $uuid; ?>"  style="clear: both;margin:0px;">
        <table style="width: 100%;" class="no-mp">
            <tr  class="no-mp">
                <td  class="no-mp">
                    <div id="controller-action-panel" class="controller-action-panel float-left" style="margin-top: 0px;">
                        <?php
                        if ($view->request->action !== 'dashboard' && ($this->render == 'error' || $this->request->layout != 'detail')) {
                            $id = $view->get(array('id'), false);

                            if ($this->render == 'error') {
                                $requestURI = $this->request->server('HTTP_HOST') . $this->request->server('REQUEST_URI');
                                $error_message = "\n\n" . date('Y-m-d H:i:s') . "\t" . $requestURI . "\t" . $this->get('error_type', 'Errors') . "\t" . \implode("\n", $this->get('errors', array()));
                                file_put_contents(TMP . DS . 'logs' . DS . 'error.log', $error_message, FILE_APPEND);
                                if (class_file_exists('\\module\\activities\\model\\emails')) {
                                    \module\activities\model\emails::getInstance()
                                            ->send(
                                                    array(
                                                        'from_email' => \kernel\configuration::read('administrator_email')
                                                        , 'email_to_recipients' => \kernel\configuration::read('primod_administrator_email')
                                                        , 'subject' => 'System has generated exception'
                                                        , 'body' => "URL: " . $requestURI . "<br /><br />" . $error_message
                                                    )
                                    );
                                }
                                $actions = array();
                                $href = $this->httpReferer();
                                if (stripos($href, "{$this->request->module}/{$this->request->controller}/{$this->request->action}") !== false) {
                                    $href = \kernel\configuration::read('defaultModuleControllerAction');
                                }

                                $actions[] = \kernel\form::cancel($this, array('href' => $href, 'value' => 'Go Back'), true);

                                //$actions[] = array('name' => 'Notify System Admin', 'type' => 'button');
                                //if ($this->request->get('id') != '') {
                                //    $actions[] = array('name' => 'Request Access', 'type' => 'button');
                                //}
                                foreach ($actions as $action) {
                                    echo \kernel\html::start('button', $action);
                                    echo __((isset($action['value']) ? $action['value'] : $action['name']), 'module');
                                    echo \kernel\html::end('button'), '&nbsp;';
                                }
                            } else {
                                $viewName = $view->get('__current_listview');
                                if (strtolower($viewName) != 'recycle bin') {
                                    echo \kernel\html::controllerSubactionBar(
                                            $view, $view->request->requestedModule, $view->request->requestedController, $view->request->requestedAction
                                    );
                                }
                            }
                        }
                        ?>
                    </div>
                </td>
            </tr>
        </table>
    </div>
    <?php
}
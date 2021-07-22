
<?php

/* <a href="', $this->request->base, $this->request->module
  , '/', $this->request->controller, '">'
  , dgettext('module', $this->request->module), '</a> &raquo; ' */
$id = $this->request->param('id', false);
if (!empty($this->request->controller)) {
    echo '&nbsp;&raquo;&nbsp;'
    , '<a data-ajax="false" class="ui-state-error-text" href="', $this->request->base, $this->request->module, '/', $this->request->controller, '">'
    , __($this->request->controller,'module')
    , '</a>';
}
if (!empty($this->request->action)) {
    echo '&nbsp;&raquo;&nbsp;'
    , '<a data-ajax="false"  class="ui-state-error-text"  href="', $this->request->base, $this->request->getURL(), '">'
    , __( (empty($this->request->action) ? '   ' : $this->request->action),'module'), (!empty($id) ? "&nbsp;[{$id}]"
                : "")
    , '</a>';
}
$listviewId = $this->get('listview_id');
if (!empty($listviewId)) {
    $listviewName = $this->get('listview_name');
    echo '&nbsp;&raquo;&nbsp;', '<a data-ajax="false"  class="ui-state-error-text"  href="', $this->request->base, $this->request->getURL(), '?current_listview=', $listviewId, '">', $listviewName, '</a>';
}
?>

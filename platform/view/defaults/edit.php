<?php
$form = $this->get('form', false);
//($this->get('data', false));
if ($form !== false) \kernel\form::render($this, $form);
else throw new \Exception(__('Form definition not found in edit view'));
?>
<script type="text/javascript">
    var filters=<?php echo json_encode((isset($this->filters) ? $this->filters : array())); ?>;
    var jvar=<?php echo json_encode($this->get('jvar',
                                                                                                                                                                                  array())); ?>;
</script>

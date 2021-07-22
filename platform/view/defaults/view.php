<div class="">
    <?php
    $form = $this->get('form', false);
    if ($form !== false) \kernel\form::render($this, $form);
    else throw new \Exception(__('Form definition not found in read view'));
    ?>
</div>
<script type="text/javascript">
    jQuery(function($){
        var filters=<?php echo json_encode((isset($this->filters)
                        ? $this->filters : array())); ?>;
        var jvar=<?php
    echo json_encode($this->get('jvar', array()));
    ?>;
            });
</script>

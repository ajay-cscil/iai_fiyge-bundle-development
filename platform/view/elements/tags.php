<form></form>
<?php
$controllerClass = "\\module\\tags\\controller\\tag_cloud";
$controllerObj = $controllerClass::getInstance($this->request);
pr($this);exit;
if ($controllerObj->isGrantedAccess('add') === true) {
    ?>
    <div class="tag-panel">
        <form id="add-tag" name="add-tag" method="post" action="<?php
    echo $this->request->base . 'tags/tag_cloud/edit';
    ?>" >
                  <?php
                  echo \kernel\html::start('input', array(
                      'type' => 'hidden',
                      'name' => 'http_referer',
                      'value' => $this->request->base . $this->request->module . '/'
                      . $this->request->controller . '/' . $this->request->action
                          )
                  );
                  ?>

            <input type="hidden"  name="data[tag_cloud][entity_id_model]"
                   value="<?php
              echo $this->get(array('model'));
                  ?>">
            <input type="hidden"  name="data[tag_cloud][entity_id]"
                   value="<?php
               echo $this->get(array('data', $this->get(array('model')), $this->get(array('primary_key'))));
                  ?>">
                   <?php
                   $collection = array(
                       'helper' => '\\kernel\\form',
                       'method' => 'collection',
                       'label' => 'Report',
                       'children' => array(
                           array(
                               'helper' => '\\kernel\\form',
                               'method' => 'block',
                               'label' => 'Add Tags',
                               'cols' => '1',
                               'children' => array(
                                   array('helper' => '\\kernel\\form', 'method' => 'input', 'label' => 'Tag',
                                       'type' => 'text', 'name' => array('tag_cloud', '__tag_id'), 'value' => ''),
                               )
                           ), array(
                               'helper' => '\\kernel\\form',
                               'method' => 'panel',
                               'class' => 'align-center',
                               'children' => array(
                                   array('helper' => '\\kernel\\form', 'method' => 'submit', 'permission' => EDIT, 'name' => array('action', 'submit'), 'value' => 'Add'),
                               )
                       ))
                   );
                   \kernel\form::collection($this, $collection);
                   
                   ?>
        </form>
    </div>


    <script type="text/javascript">

        $(document).ready(function($){
            $('#add-tag').submit(function(event){
                var form=$(this);
                $.post(form.attr('action')+'.json',form.serializeObject(),function(data){
                    if(typeof(data) === "object"){
                        $(form).get(0).reset();
                        showMessage(data.message);
                        $('.tag-list').triggerHandler('refresh');
                    }
                });
                event.stopPropagation();
                return false;
            });
        });

    </script>
    <?php
}
?>

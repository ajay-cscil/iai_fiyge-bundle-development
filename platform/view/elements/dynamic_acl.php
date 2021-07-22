<div class="dynamic-acl">
    <div class="heading ui-widget-header" ><?php echo __('Add Dynamic ACL'); ?></div>
    <form id="add-dynamic-acl" method="post" action="<?php echo $this->request->base . 'access_controls/dynamic_acl/edit'; ?>" >
        <?php echo \kernel\html::start('input',
                                                                                                                                                                                                                                                                                     array('type' => 'hidden', 'name' => 'http_referer', 'value' => $this->request->base . $this->request->module . '/' . $this->request->controller . '/' . $this->request->action)); ?>

        <input type="hidden"  name="data[dynamic_acl][entity_id_model]"
               value="<?php echo $this->get(array('model')); ?>">
        <input type="hidden"  name="data[dynamic_acl][entity_id]"
               value="<?php
        echo $this->get(array('data', $this->get(array('model')), $this->get(array('primary_key'))));
        ?>">
        <table cellspacing="0" class="sub-container" >
            <tr>
                <td class="cell-label"><label for="data[dynamic_acl][from]"> <span class="not_empty">*</span><?php echo __('From'); ?></label></td>
                <td  class="cell-info"><input name="data[dynamic_acl][from]" class="date" value=""></td>
            </tr>
            <tr>
                <td class="cell-label"><label for="data[dynamic_acl][to]"><span class="not_empty">*</span> <?php echo __('To'); ?></label></td>
                <td  class="cell-info"><input type="text" name="data[dynamic_acl][to]" class="date" value="" ></td>
            </tr>
            <tr>
                <td class="cell-label"><label for="data[dynamic_acl][__actor_id]"> <span class="not_empty">*</span><?php echo __('Actor'); ?></label></td>
                <td  class="cell-info"><input type="hidden" class="popup-hidden"  name="data[dynamic_acl][actor_id]"
                                              value="">
                                              <?php
                                              echo \kernel\html::select(array('class' => 'float-left popup-select ',
                                                  'empty' => false,
                                                  'name' => 'data[dynamic_acl][actor_id_model]',
                                                  'children' => array(
                                                      array('text' => 'User', 'value' => 'users',
                                                          'href' => $this->request->base . 'access_controls/users/index',
                                                          'q' => '', 'model' => 'users',
                                                          'display_field' => 'name',
                                                          'primary_key' => 'users.id'),
                                                      array('text' => 'Group', 'value' => 'groups',
                                                          'href' => $this->request->base . 'access_controls/groups/index',
                                                          'q' => '', 'model' => 'groups', 'display_field' => 'name',
                                                          'primary_key' => 'groups.id')
                                                  )
                                                      )
                                              )
                                              ?>
                    <input type="text" class=" popup-autocomplete  float-left" href="" q="" display_field=""
                           autocomplete="" name="data[dynamic_acl][__actor_id]"
                           value="<?php
                                              echo \kernel\html::escape(
                                                      $this->get(
                                                              array('data', 'dynamic_acl', '__actor_id'))
                                              );
                                              ?>">
                    <span class="popup-add ui-icon ui-icon-pencil  float-left" title="Click here to select">*</span>
                    <span class="popup-clear ui-icon ui-icon-minus  float-left" title="Click here to clear">*</span>
                    </td>
                    </tr>
                    <tr>
                        <td class="cell-label"><label for="data[dynamic_acl][description]"> <?php echo __('Note'); ?>
                            </label></td>
                        <td  class="cell-info"><textarea name="data[dynamic_acl][description]" ></textarea></td>
                    </tr>
                    <tr><td colspan="2"  class="align-center">
                            <input type="submit" name="data[action][submit]" value="<?php echo __('Add'); ?>"
                                    >
                        </td></tr>
                    </table>
                    </form>
                    </div>

                    <script type="text/javascript">
                        $(document).ready(function($){
                            $('#add-dynamic-acl').submit(function(event){
                                var form=$(this);
                                $.post(form.attr('action')+'.json',form.serializeObject(),function(data){
                                    if(typeof(data) === "object"){
                                        if($.isset(data.message)){
                                            $(form).get(0).reset();
                                            showMessage(data.message);
                                        }else if($.isset(data.errors)){
                                            showError(data.errors);
                                        }
                                        $('.list-dynamic-acl').triggerHandler('refresh');
                                    }
                                });
                                event.stopPropagation();
                                return false;
                            });
                        });
                    </script>


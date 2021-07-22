
<div class="list-dynamic-acl">
    <div class="heading ui-widget-header"><?php echo __('Applied ACL Rules'); ?></div>
    <div class="dynamic-acl-list sub-container">

    </div>
</div>

<script type="text/javascript">

    $(document).ready(function($){
        $('.list-dynamic-acl').bind('refresh',function(event){

            var container=$(this).find('.dynamic-acl-list');
            var href="<?php echo $this->request->base . 'access_controls/dynamic_acl/index'; ?>";
            var model="<?php echo $this->get(array('model')); ?>";
            var id="<?php echo $this->get(array('id')); ?>";
            var q={};
            q['paginate_as']='lazy';
            q['sortable']=0;
            q['pfooter']=1;
            q['fields']=['dynamic_acl.actor_id_model','dynamic_acl.__actor_id','dynamic_acl.from','dynamic_acl.to'];
            q['actions']={'edit':{'ajax_popup':1},'delete':{'1':1}};
            if(model !='' && id !=''){
                q['where']=[];
                q['where'].push({"dynamic_acl.entity_id":id});
                q['where'].push({"dynamic_acl.entity_id_model":model});
            }
            $.get(href,{'q':encodeURIComponent(JSON.stringify(q))},function(data){
                container.html(data);
            });
            event.stopPropagation();
            return false;
        }).triggerHandler('refresh');

    });

</script>

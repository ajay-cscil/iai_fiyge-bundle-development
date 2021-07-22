<?php
$controllerClass = "\\module\\tags\\controller\\tag_cloud";
$controllerObj = $controllerClass::getInstance($this->request);
if($controllerObj->isGrantedAccess('index') === true){
?>
<div class="list-tag-panel">

    <?php
    $collection = array(
        'helper' => '\\kernel\\form',
        'method' => 'collection',
        'children' => array(
            array(
                'helper' => '\\kernel\\form',
                'method' => 'panel',
                'label' => 'Applied Tags',
                'children' => array(
                    array('helper' => '\\kernel\\form', 'method' => 'string', 'string' => '<div class="tag-list sub-container"></div>')
                )
            )
        )
    );

    \kernel\form::collection($this, $collection);
    ?>
</div>
<script type="text/javascript">

    $(document).ready(function($){
        $('.tag-list').bind('refresh',function(event){
            var container=$(this);
            var href="<?php echo $this->request->base . 'tags/tag_cloud/index'; ?>";
            var model="<?php echo $this->get(array('model')); ?>";
            var id="<?php echo $this->get(array('id')); ?>";
            var q={};
            q['paginate_as']='lazy';
            q['fields']=['distinct tags.name','tags.weight'];
            if(model !='' && id !=''){
                q['where']=[];
                q['where'].push({"tag_cloud.entity_id":id});
                q['where'].push({"tag_cloud.entity_id_model":model});
            }
            $.get(href+'.json',{'q':encodeURIComponent(JSON.stringify(q))},function(data){
                container.html("");
                if(typeof data =='object'){
                    if($.isset(data['data'])){
                        var fMax=18;
                        var cMax=1;
                        var cMin=1;
                        var size=1;//((fMax*(count-cMin))/(cMax-cMin));
                        var weight=1;
                        var size=8;
                        var tagList={};
                        $.each(data['data'],function(k,v){
                            weight=parseInt(v['tags.weight']);
                            if(weight > cMax)
                                cMax =weight;
                            tagList[v['tags.name']]=v['tags.weight'];
                        });
                        $.each(tagList,function(k,v){
                            weight=parseInt(v);
                            size=Math.ceil(((fMax*(weight-cMin))/(cMax-cMin)));
                            if(size < 8)
                                size=8;
                            container.append('<a class="tag " style="margin:2px;font-size:'
                                +size+'px;" href="#">'+k+'</a>');

                        });
                    }
                }
            });




            event.stopPropagation();
            return false;
        }).triggerHandler('refresh');

    });

</script>
<?php
}
?>

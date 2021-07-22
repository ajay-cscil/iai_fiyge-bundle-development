
<form method="GET" class="nav navbar-search" action="<?php
echo $this->request->base . $this->request->module . '/' . $this->request->controller . '/'.(isset($searchAction)?$searchAction:'index');
?>">
    <input name="current_listview" type="hidden" value="<?php
      echo $this->get('current_listview', '');
?>"  >
           <?php
           if ($this->request->controller != $this->request->requestedController) {
               echo '<input name="request_url" type="hidden" value="' . $this->request->requestedModule . '/' . $this->request->requestedController . '/' . $this->request->requestedAction . '">';
           }
           ?>
    <input name="search_basic" class="" placeholder="Search"  value="<?php
           echo $this->request->get('search_basic', '');
           ?>"  >
    <button type="submit" style="margin-top: -1px;padding: 0 6px;
  font-size: 10.5px;
  -webkit-border-radius: 3px;
     -moz-border-radius: 3px;
          border-radius: 3px;" class="btn"><?php echo __('Search'); ?></button>
    <?php
    if ($this->request->action == 'index') {
       
        ?>

        <button class="ajax-filter-popup ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" search_view="<?php echo $this->request->get('search_view');?>"  href="<?php
    echo $this->request->base . 'core/listviews/advance_search?search_model='
    . $this->get('modelClass')
    . '&data[listviews][search_view]=' . $this->request->get('search_view') . '&data[listviews][controller]='
    . $this->request->requestedModule . '/'
    . $this->request->requestedController;
        ?>"> <?php
    echo __('Filters');
        ?></button>

        <button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" onclick="jQuery('[name=\'search_basic\']').val('');jQuery.listviewSearch('#<?php echo $this->request->get('search_view'); ?>',{})"> <?php
                echo __('Reset Search');
        ?></button>
            <?php
        }
        ?>
</form>

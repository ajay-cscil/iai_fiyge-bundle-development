<?php

/**
 * Contains framework level configuration defauls
 * This overrides platform (kernel folder) level configuration 
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */


/*
 * Sequence in which to show Label, sort and search icons for Left to Right and Right to left data types
 */
$configuration['web']['pagination']['ltrFormat'] = '{{LABEL}} {{SORT}} {{SEARCH}}';
$configuration['web']['pagination']['rtlTypes'] = array('NEWDECIMAL'); //,'LONG'-FOR INTEGERS
$configuration['web']['pagination']['rtlFormat'] = '{{SEARCH}} {{SORT}} {{LABEL}}';

/*
 * Additional information for display on login screen
 */
$configuration['login_information'] = '';

/*
 * Should inherited modules also inherit all list views
 * For example: cruise-crm extends the crm module
 * 				If inherit_views is set to 0, then cruise-crm will list only it's own views
 *				If inherit_views is set to 1, cruise-crm will show list views of it's parent (crm) and it's own
 */
$configuration['inherit_views'] = 1;


$configuration['js']['tooltip_fadeout_duration'] = 2000;
$configuration['fiyge_version'] = '5.0.0';

/*
 * Button placement in Left, Center and Right
 * form buttons (cancel and submit) are shown in left - these are required for HTML form processing and not kept in Menus and nor is permission required to be granted on these
 * workflow ones in center and 
 * Any actions specified in Menus and granted permissions are show right aligned
 */
$configuration['button_set_position'] = array('_form', '_workflow', '_menus');


/*
 * Useful for Audit purposes or Troubleshooting. 
 */
$configuration['disable_data_acl'] = false;
$configuration['debug'] = true;



$configuration['enable_update_check'] = 0;
$configuration['check_for_update'] = 0;

$configuration['allow_author_override'] = true;



/*
 * Shows memory at bottom left of every page
 */
$configuration['show_memory_usage'] = false;

/*
 * Useful for Audit purposes or Troubleshooting. Slows the system down, please use sparingly
 */
//$configuration['sql_log']='\\module\\logging\\model\\sql_log';


/*
 * Deprecated
 */
// $configuration['delay_load_left_panel'] = 0;
// $configuration['delay_load_right_panel'] = 0;
$configuration['small_data_set_size'] = 50; // number of records to be installed as small data set, maximum 1000;


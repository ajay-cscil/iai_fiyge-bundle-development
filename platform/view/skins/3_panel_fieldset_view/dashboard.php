<?php header('Content-type: text/html; charset=utf-8'); ?>
<!DOCTYPE HTML>
<html>
    <head>
        <title><?php echo \kernel\configuration::read('document_title'); ?></title>
        <link REL="Fiyge Icon" href="<?php echo \kernel\html::logo_path('favicon_image'); ?>" />
        <?php include $this->element('init', true); ?>
        <?php echo $resourceForLayout; ?>

        <script type="text/javascript">
    jQuery(function(){
<?php echo $scriptForLayout; ?>
    });
        </script>
    </head>
    <body class="ui-widget" style="<?php echo \kernel\configuration::read('document_body_style'); ?>">
        <div id="header-panel">
            <?php include $this->element('application_menu', true); ?>
            <?php include $this->element('user_menu', true); ?>
        </div>


        <table width="100%" class="no-mp  sub-panel">
            <tbody  class="no-mp">
                <tr   class="no-mp">
                    <td  style="width:20%;"  class="no-mp  logo-panel">
                        <img src="<?php echo \kernel\html::logo_path('organization_image'); ?>" border="0">
                    </td>
                    <td style="width:80%;"  valign="top" class="no-mp">
                        <div class="search-panel"  style="clear:both;">
                            <?php if($this->hasAccess('dashboards/widgets/allow_dashboard_filters')){ ?>
                                <form action="<?php echo $this->request->server('REQUEST_URI'); ?>" method="post">
                                    <table class="float-right company_fiscal_year_container" style="clear: both;margin:0px;border-spacing: 0px;border: 1px solid #efefef;">
                                        <tr style="vertical-align: middle;">
                                        <?php 
                                             $globalFilterScope=\kernel\view::$globalFilters["global_filter_scope"];
                                             $globalFilterScopeText=\kernel\view::$globalFilters["global_filter_scope_text"];
                                             $globalFilterScopeModel=\kernel\view::$globalFilters["global_filter_scope_model"];
                                             $globalFilterDateRange=\kernel\view::$globalFilters["global_filter_date_range"];
                                             $globalFilterDateRangeStep=\kernel\view::$globalFilters["global_filter_date_range_step"];
                                             $globalFilterStartDate=\kernel\view::$globalFilters["global_filter_start_date"];
                                             $globalFilterEndDate=\kernel\view::$globalFilters["global_filter_end_date"];
                                       ?>
                                       <td class="cell-label"  style="border-bottom:0px;">
                                            <label for="data-peoples-filing_option_id">User/Group</label>
                                       </td>
                                       <td style="padding:5px;">
                                       <?php     
                                            $props=[
                                                "name"=>"global_filter_scope",
                                                "value"=>$globalFilterScope,
                                                "__value"=>$globalFilterScopeText,
                                                "value_model"=>$globalFilterScopeModel,
                                                "empty"=>"All",
                                                "children"=>[
                                                    ["href"=>"access_controls/users/index","model"=>"users"],
                                                    ["href"=>"access_controls/groups/index","model"=>"groups"],
                                            ]];
                                            if($globalFilterScopeModel==""){
                                                    $props["DISABLED"]="DISABLED";
                                                    $props["is_readonly"]=1;
                                            }
                                            echo \kernel\form::popup($this,$props);

                                        ?>
                                        </td>
                                       <td class="cell-label" style="border-bottom:0px;">
                                            <label for="data-peoples-filing_option_id">Date</label>
                                       </td>  
                                       <td style="padding:5px;">
                                       <?php     
                                            echo \kernel\html::select([
                                                'name'=>"global_filter_date_range",
                                                "value"=>$globalFilterDateRange,
                                                "empty"=>false,
                                                'children'=>[
                                                    ["text"=>"All","value"=>"All"],
                                                    ["text"=>"Year","value"=>"Year"],
                                                    ["text"=>"Quarter","value"=>"Quarter"],
                                                    ["text"=>"Month","value"=>"Month"],
                                                    ["text"=>"Week","value"=>"Week"],
                                                    ["text"=>"Day","value"=>"Day"]
                                                ]]);
                                        ?>
                                        </td>
                                        <td style="padding:5px;">
                                        <?php   
                                                
                                                $props=[
                                                    'class'=>'no-field-help-date_format',
                                                    'name'=>"global_filter_start_date",
                                                    "value"=>\kernel\locale::localize($globalFilterStartDate,DATE) 
                                                ];
                                                if($globalFilterDateRange=="All"){
                                                    $props["DISABLED"]="DISABLED";
                                                    $props["is_readonly"]=1;
                                                }
                                                \kernel\form::date($this, $props); 
                                        ?>
                                        </td>
                                        <td style="padding:5px;">
                                          <?php   
                                                $props=[
                                                    'class'=>'no-field-help-date_format',
                                                    'name'=>"global_filter_end_date",
                                                    "value"=>\kernel\locale::localize($globalFilterEndDate,DATE)
                                                ];
                                                if($globalFilterDateRange=="All"){
                                                    $props["DISABLED"]="DISABLED";
                                                    $props["is_readonly"]=1;
                                                }
                                                \kernel\form::date($this, $props); 
                                        ?>
                                        </td> 
                                        <td>
                                            <input type="hidden" name="global_filter_date_range_step" id="global_filter_date_range_step">
                                            <a class="ui-state-highlight" id="global_filter_date_range_previous" style="display:inline-block;vertical-align:middle;"><span class="ui-icon ui-icon-triangle-1-w"></span></a>
                                        </td>
                                        <td> 
                                            <a class="ui-state-highlight"  id="global_filter_date_range_next" style="display:inline-block;vertical-align:middle;"><span class="ui-icon ui-icon-triangle-1-e"></span></a>
                                        </td>
                                    
                                    </tr>
                                 </table>
                                </form>
                            <?php } ?>
                        </div>
                        <?php
                        $msg = $this->request->getMsg(true);
                        $hasMsg = $this->request->hasMsg();
                        ?>
                        <div class="message-panel-container" >
                            <div id="message-panel" style="text-align:center;margin:auto;" class="ui-state-highlight
                                 <?php echo($hasMsg ? "" : " ui-helper-hidden ") ?>"><?php echo (is_array($msg) ? implode('<br />', $msg) : $msg); ?>                </div>
                        </div>
                    </td>
                </tr>
            </tbody>

        </table>

        <script type="text/javascript">
        jQuery(document).ready(function(){
            $("#global_filter_date_range,#global_filter_start_date,#global_filter_end_date").change(function(){
                $(this).closest('form').submit();
            });
            $("#global_filter_date_range_previous").click(function(){
                $('#global_filter_date_range_step').val('previous');
                $(this).closest('form').submit();
            });
            $("#global_filter_date_range_next").click(function(){
                $('#global_filter_date_range_step').val('next');
                $(this).closest('form').submit();
            });
            $("#data-global_filter_scope").change(function(){
                $(this).closest('form').submit();
            });
        });
        </script>



        <table width="100%" class="no-mp  main-panel">
            <tbody  class="no-mp">
                <tr   class="no-mp">
                    <td width="100%" valign="top" class="no-mp">
                        <div id="content-panel" style="clear: both"><?php echo $contentForLayout; ?></div>
                    </td>
                </tr>
            </tbody>

        </table>
        <?php include $this->element('footer', true); ?>
    </body>
</html>

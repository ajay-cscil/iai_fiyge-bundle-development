<?php header('Content-type: text/html; charset=utf-8'); ?>
<!DOCTYPE HTML>
<html lang="<?php $l = explode("_", \kernel\request::$locale);
echo $l[0]; ?>">
    <head>
        <title><?php echo \kernel\configuration::read('document_title'); ?></title>
        <link REL="Fiyge Icon" href="<?php echo \kernel\html::logo_path('favicon_images'); ?>" />
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

        <table class="no-mp  main-panel"  id="main-panel" >
            <tbody  class="no-mp">
                <tr   class="no-mp sub-panel">
                    <td  style="width:20%;"  class="no-mp logo-panel">
                        <img src="<?php echo \kernel\html::logo_path('organization_images'); ?>" border="0">
                    </td>
                    <td style="width:80%;"  valign="top" class="no-mp" colspan="2">
                        <table style="width:100%" class="no-mp"><tr  class="no-mp"><td  class="no-mp">
                                    <div class="search-panel"  style="clear:both;">
                                        <?php include $this->element('search_panel', true); ?>
                                    </div>

                                    <?php
                                    $msg = $this->request->getMsg(true);
                                    $hasMsg = $this->request->hasMsg();
                                    ?>
                                    <div class="message-panel-container" align="center">
                                        <div id="message-panel" class="ui-state-highlight
                                             <?php echo($hasMsg ? "" : " ui-helper-hidden ") ?>"><?php
                                             echo (is_array($msg) ? implode('<br />', $msg) : $msg);
                                             ?>
                                        </div>
                                    </div>
                                </td></tr><tr><td>


                                    <?php
                                    include $this->element(
                                                    'action_menu', true
                                    );
                                    ?>

                                </td></tr></table>

                    </td>
                </tr>

                <tr   class="no-mp">
                    <td class="container" id="left-panel-container"  style="width:20%;"  valign="top"  class="no-mp">
                        <div id="left-panel" style="clear: both">

                            <?php
                            /*
                              include $this->element(
                              'listviews', true
                              );
                              include $this->element(
                              'reports', true
                              );
                              include $this->element(
                              'configurations', true
                              );
                              include $this->element(
                              'has_many_relations', true
                              );
                             * 
                             */
                            foreach (\kernel\html::widget_menu($this) as $widget) {
                                if (!empty($widget['url'])) {
                                    include $this->element($widget['url'], true, $widget);
                                }
                            }
                            ?>


                        </div>
                    </td>
                    <td style="width:65%;"  valign="top" class="no-mp">
                        <div id="content-panel" style="clear: both;position:relative;<?php echo $this->render == 'error' ? '' : 'top:-47px;'; ?>"><?php echo $contentForLayout; ?></div>
                    </td>
                  <!--  <td class="container" id="detail-subpanel-container"   style="width:15%;"  valign="top"  class="no-mp">
                        <div id="detail-subpanel" -->    
                    <?php
                    /*
                      if (is_array($this->request->subPanelElements)) {
                      foreach ($this->request->subPanelElements as $element) {
                      include $this->element($element, true);
                      }
                      }
                     * 
                     */
                    ?>
                    <!--/div-->
                    </td>
                </tr>
            </tbody>

        </table>
        <?php include $this->element('footer', true); ?>
    </body>
</html>

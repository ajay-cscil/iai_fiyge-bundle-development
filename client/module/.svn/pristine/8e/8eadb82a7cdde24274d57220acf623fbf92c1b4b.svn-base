<?php header('Content-type: text/html; charset=utf-8'); ?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">
<html>
    <head>
        <title><?php echo \tushar\configuration::read('document_title'); ?></title>
        <link REL="MaaxFrame Icon" HREF="<?php echo $this->request->base ?>img/favicon.ico" />

        <?php include $this->element('init', true); ?>
        <?php echo $resourceForLayout; ?>

        <script type="text/javascript">
            jQuery(function(){
<?php echo $scriptForLayout; ?>
    });
        </script>
    </head>
    <body  class="ui-widget">
        <div class="ui-widget-header" style="margin-top:30px;"> &nbsp;</div>
        <table class="no-mp main-panel" id="main-panel" >
            <tbody  class="no-mp">
                <tr   class="no-mp sub-panel">
                    <td  style="width:20%;" class="no-mp logo-panel">
                        <img src="<?php echo \tushar\configuration::read('logo_path');?>" border="0">
                    </td>
                    <td style="width:80%;"  valign="top" class="no-mp">
                        <div class="search-panel"  style="clear:both;">
                            <?php
                            $searchAction = $this->request->action;
                            include $this->element(
                                            'search_panel', true
                            );
                            ?>
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

                    </td>
                </tr>

                <tr   class="no-mp">
                    <td  id="left-panel-container"  class="container"  style="width:20%;"  valign="top"  class="no-mp">
                        <div id="left-panel" style="clear: both">
                            <?php
                            include $this->element(
                                            'topics', true
                            );
                            ?>


                        </div>
                    </td>
                    <td style="width:80%;"  valign="top" class="no-mp">
                        <div id="content-panel" style="clear: both">
                            <div class="ui-widget-content" style="padding:10px;">
                                <?php echo $contentForLayout; ?>
                                <div> <a href="index.php">Previous</a> | <a  href="index.php">Next</a></div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>

        </table>
        <?php
        include $this->element(
                        'footer', true
        );
        ?>
    </body>
</html>

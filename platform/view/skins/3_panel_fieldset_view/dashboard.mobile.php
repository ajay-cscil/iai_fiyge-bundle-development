<!DOCTYPE html>
<HTML>
    <HEAD>
        <TITLE>Fiyge</TITLE>
        <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
        <meta http-equiv="content-type" content="text/html;charset=utf-8">

        <?php echo $this->element('init.mobile'); ?>
        <?php echo $resourceForLayout; ?>

        <script type="text/javascript">
            jQuery(function(){
<?php echo $scriptForLayout; ?>
    });
        </script>
    </HEAD>
    <BODY>
        <div data-role="page"  data-theme="d">
            <?php echo $this->element('header.mobile'); ?>
            <div id="content-panel" data-role="content">
                <?php echo $contentForLayout; ?></div>
        </div>
        <?php include $this->element('footer.script.mobile', true); ?>
    </BODY>
</HTML>

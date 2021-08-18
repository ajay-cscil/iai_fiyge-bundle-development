<div id="footer-panel" data-role="footer" data-theme="d" class="ui-li-desc" style="padding:15px;">
    <?php echo __('Time'); ?>:<?php global $requestStartTime;
    echo round((microtime(true) - $requestStartTime), 3),' ',__('seconds') ?>
</div>
<!--script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-51074360-1', 'fiyge.com');
  ga('send', 'pageview');
</script-->

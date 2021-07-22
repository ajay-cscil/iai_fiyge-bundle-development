
<div style="margin:auto; max-width:400px;" >

    <div data-role="header" data-theme="d" class="error-header">
        <?php echo __($this->get('error_type', 'Errors')); ?>
    </div>
    <div class="ui-body ui-body-d">
        <p>
            <?php
            $errors = $this->get('errors', array());
            if (count($errors) > 1) {
                echo '<ol>';
                foreach ($errors as $error) {
                    echo '<li>' . $error . '</li>';
                }
                echo '</ol>';
            } else {
                echo current($errors);
            }
            ?>
        </p>
    </div>
    <div  class="ui-li-desc ui-footer ui-bar-d administrator_info" data-theme="d" data-role="footer" id="footer-panel" role="contentinfo">
        Contact your administrator for further help.<br/>
        Email: <?php echo \kernel\configuration::read('administrator_email'); ?><br/>
        Phone: <?php
            $phone = \kernel\configuration::read('administrator_phone_number');
            echo (!empty($phone) ? '<a data-role="none" href="tel:' . $phone . '">' . $phone . '</a>' : '');
            ;
            ?><br/>
    </div>
</div>

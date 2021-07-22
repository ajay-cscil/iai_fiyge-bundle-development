<table class="listview" style="width: 100%; height: 200px"
       align="center">
    <tr>
        <td>
            <table align="center" class="ui-widget" style="width:50%">
                <tr class="ui-state-error">
                    <td ><?php echo __('Errors'); ?></td>
                </tr>
                <tr class="ui-widget-content">
                    <td>
                        <ol>
                            <?php
                            foreach ($this->get('errors', array()) as $error) {
                                echo '<li>', $error, '</li>';
                            }
                            ?>
                        </ol>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

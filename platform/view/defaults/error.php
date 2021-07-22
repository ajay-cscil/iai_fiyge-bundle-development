<table class="listview ui-listview" style="width: 100%; height: 200px"
       align="center">
    <tr>
        <td>
            <table align="center" class="ui-widget" style="width:50%">
                <tr class="ui-state-error">
                    <td ><?php echo __($this->get('error_type', 'Errors')); ?></td>
                </tr>
                <tr class="ui-widget-content">
                    <td>
                        <br/>
                        <ol>
                            <?php
                            foreach ($this->get('errors', array()) as $error) {
                                echo '<li>', $error, '</li>';
                            }
                            ?>
                        </ol>
                        <br/>
                    </td>
                </tr>
                <tr >
                    <td class="administrator_info gray">
                        Contact your administrator for further help.<br/>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

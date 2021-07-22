<table style="width: 100%; height: 400px;align:center">
    <tr>
        <td style="vertical-align: top;">
            <table  class="ui-widget" align="center">
                <tr>
                    <td>
                        <div style="background-color:#FFFFFF; padding:5px;">
                            <img
                                src="<?php echo $this->request->base ?>img/logo-large.png" border="0">
                        </div>
                    </td>
                </tr>
                <?php
                $title = $this->get('title');
                if (!empty($title)) {
                    echo '<tr class="ui-widget-header">
                    <td>
                        ' . $title . '
                    </td>
                </tr>';
                }
                ?>
                <tr class="ui-widget-content">
                    <td>
                        <span>
                            <?php
                            echo $this->get('message');
                            ?>
                        </span>
                        <a  class="ui-priority-secondary float-right"  
                            href="<?php echo $this->request->base() . $this->get('url'); ?>"
                            > <?php echo __('Continue'); ?></a>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

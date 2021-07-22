<?php

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=' . $this->get('filename', 'filename') . '.csv');
$paginate = $this->get('paginate', array(), false);
$paginate['ui_helper'] = '\\kernel\\paginate_ui::csv';
//ob_start();
\kernel\html::paginate($this, $paginate);
$csv_data_sql = $this->get('csv_data_sql');
if (!empty($csv_data_sql)) {
    $output = \fopen('php://output', 'w');
    fputcsv($output, array("DEBUG", $csv_data_sql));
}
exit;
//$html = ob_get_contents();
//ob_end_clean();
//echo $html;
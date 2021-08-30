<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
set_time_limit(0);
\library('zend.php');
$base = TMP . DS . 'pdfs';
if (!is_dir($base)) {
    mkdir($base);
}
$pdfDocs = array();
$uuid = uuid();
$i = 0;
$css = '';

/*
  $uiStyle = \kernel\html::getPath($this->request, 'jquery-ui', 'css');
  if (!empty($uiStyle))
  $css .= file_get_contents($uiStyle[2]);
  $style = \kernel\html::getPath($this->request, 'style', 'css');
  if (!empty($style))
  $css .= file_get_contents($style[2]);



  if (!empty($css))
  $css = '<style>' . $css . '</style>';
 * 
 */
$img_path = '';
$logoWidth = 0;
$headerTitle = '';
$headerString = '';
$footerStr = '';
$pages = $this->get('pages', array());
foreach ($pages as $path => $info) {
    $i++;
    $name = $base . DS . $uuid . '-' . $i . '.pdf';
// create new PDF document
    $companyObj = \module\crm_base\model\organizations::getInstance(array(), true);
    $companyID = \kernel\user::read('organization_id');
    $companyData_def = \select("*")
            ->from($companyObj)
            ->where('id', $companyID)
            ->execute()
            ->fetch(\PDO::FETCH_ASSOC);
    $companyData_def['images'] = \select("*")
            ->from($companyObj->images)
            ->where(array('related_to' => $companyID, 'related_to_model' => 'organizations'))
            ->execute()
            ->fetch(\PDO::FETCH_ASSOC);
    //$companyData_def = current($companyObj->read(\kernel\user::read('company_id')));
    if (isset($companyData_def['header_data']) && !empty($companyData_def['header_data'])) {
        eval($companyData_def['header_data']);
    }
    $pdfConf = array();
    //$footerStr='';
    $templateInfo = $this->get('template');
    if (!empty($templateInfo) && isset($templateInfo['header']) && !empty($templateInfo['header'])) {
        eval($templateInfo['header']);
    }
    if (!empty($templateInfo) && isset($templateInfo['footer']) && !empty($templateInfo['footer'])) {
        $footer_String = $templateInfo['footer'];
    }
    if (isset($pageOrientation) && !empty($pageOrientation)) {
        $pdfConf['pdf_page_orientation'] = $pageOrientation;
    }
    if (isset($pdfUnit) && !empty($pdfUnit)) {
        $pdfConf['pdf_unit'] = $pdfUnit;
    }
    if (isset($headerFontFamily) && !empty($headerFontFamily)) {
        $pdfConf['header_font_family'] = $headerFontFamily;
    }
    if (isset($headerFontStyle) && !empty($headerFontStyle)) {
        $pdfConf['header_font_style'] = $headerFontStyle;
    }
    if (isset($headerFontSize) && !empty($headerFontSize)) {
        $pdfConf['header_font_size'] = $headerFontSize;
    }
    if (isset($footer_String) && !empty($footer_String)) {
        $footerStr = $footer_String;
    }
    //var_dump($pdfConf);
    //exit;
    $pdf = \kernel\pdf::getInstance($pdfConf, true);
    if (!empty($companyData_def) && !empty($companyData_def['images'])) {
        $img_path = APP . DS . $companyData_def['images']['storage_path'] . DS . $companyData_def['images']['path'];
    }
    $pdf->setHeaderData($img_path, $logoWidth, $headerTitle, $headerString); //,$c_header_title
    $pdf->setFooterString($footerStr);
    // add a page
    $pdf->AddPage();
    if (isset($info['document']) && $info['document'] == true) {
        if (isset($info['id'])) {
            if ($info['mime_type'] == 'application/pdf') {
                $name = APP . DS . $info['storage_path'] . $info['path'];
                $pdfDocs[$name] = false;
            }
        }
    } else {



        $value = $this->generate(TMP . DS . $path, $this->response);
        //file_put_contents(TMP . DS . 'bf.html', $value);
        //$tidy = tidy_parse_string($value, array('output-xhtml' => TRUE));
        //$value = trim(tidy_get_body($tidy)->value);
        //$value = substr($value, 6, -7);
        //file_put_contents(TMP . DS . 'af.html', $value);
        $value = $css . $value;
        $pdf->writeHTML($value);
        $pdf->Output($name, 'F');
        $pdfDocs[$name] = true;
    }
    //\unlink(TMP . DS . $path);
}

$pdfNew = new \Zend_Pdf();
foreach ($pdfDocs as $file => $isTemp) {
    if (file_exists($file) && is_readable($file)) {
        $pdf = \Zend_Pdf::load($file);
        $extractor = new Zend_Pdf_Resource_Extractor();
        foreach ($pdf->pages as $page) {
            $pdfNew->pages[] = $extractor->clonePage($page);
        }
    }
    if ($isTemp === true)
        \unlink($file);
}

$mergePdf = $base . DS . $uuid . '.pdf';
$pdfNew->properties['Title'] = $this->data(array('contracts', 'name'));
$pdfNew->properties['Author'] = \kernel\user::read('first_name') . ' ' . \kernel\user::read('last_name');
$pdfNew->save($mergePdf);
$name = trim($templateInfo['name']) . ".pdf";
//$modelObj=\module\contract_management\model\contract_downloads::getInstance();
$log = array();
$log['related_to'] = $this->data(array('contracts', 'id'));
$log['related_to_model'] = 'contracts';
$log['tmp_name'] = $mergePdf;
$log['name'] = $name;
$log['type'] = 'application/pdf';
$log['error'] = \UPLOAD_ERR_OK;

try {
    //$modelObj->save(array($modelObj->alias=>$log));
} catch (\Exception $e) {
    echo $e->getMessage();
}



header('Content-type:"application/pdf"');
header('Content-Disposition:attachment;filename="' . $name . '"');
header("Pragma: no-cache");
header("Expires: 0");
echo $pdfNew->render();
exit;
?>

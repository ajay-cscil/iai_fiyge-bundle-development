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

$imgPath = '';
$logoWidth = 0;
$headerTitle = '';
$headerString = '';
$footerString = '';
$pages = $this->get('pages', array());
$modelName=$this->get('model');
$record=isset($data[$modelName])?$data[$modelName]:[];
$organizationObj = \module\crm_base\model\organizations::getInstance();
$organizationID = $record['organization_id'];
$organizationData = current($organizationObj->read($organizationID));
if(!isset($organizationData['organization_image'])){
    $organizationData['organization_image']=[];
}

$pageOrientation='P';
$pdfUnit='mm';
$headerFontFamily='times';
$headerFontStyle='initial';
$headerFontSize=10;

$headerString=[];
$headerString[]=$organizationData['primary_address_line_1'];
if(!empty($organizationData['primary_address_line_2'])){
    $headerString[]=$organizationData['primary_address_line_2'];
}

$headerString[]="{$organizationData['primary_city']}, {$organizationData['primary_state']}, {$organizationData['__primary_country']} - {$organizationData['primary_zip']}";

$contactHeaderString=[];
if(!empty($organizationData['email'])){
    $contactHeaderString[]="Email - {$organizationData['email']}";
}
if(!empty($organizationData['primary_phone_number'])){
    $contactHeaderString[]="Tel - {$organizationData['primary_phone_number']}";
}
if(!empty($contactHeaderString)){
    $headerString[]=implode(", ",$contactHeaderString);
}
$headerString=implode(PHP_EOL, $headerString);
$headerTitle=$organizationData['name'];


foreach ($pages as $path => $info) {
    $i++;
    $name = $base . DS . $uuid . '-' . $i . '.pdf';
// create new PDF document
    //if (isset($organizationData['header_data']) && !empty($organizationData['header_data'])) {
    //    eval($organizationData['header_data']);
    //}
    $pdfConf = array();
    $templateInfo = $this->get('template');
    if (!empty($templateInfo) && isset($templateInfo['header']) && !empty($templateInfo['header'])) {
        eval($templateInfo['header']);
    }
    if (!empty($templateInfo) && isset($templateInfo['footer']) && !empty($templateInfo['footer'])) {
        $footerString = $templateInfo['footer'];
    }

    if (isset($pageOrientation) && !empty($pageOrientation)) {
        $pdfConf['pdf_page_orientation'] = $pageOrientation;
    }
    if (isset($pdfUnit) && !empty($pdfUnit)) {
        $pdfConf['pdf_unit'] = $pdfUnit;
    }
    if (isset($pageFormat) && !empty($pageFormat)) {
        $pdfConf['pdf_page_format'] = $pageFormat;
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

    if (isset($contentFontFamily) && !empty($contentFontFamily)) {
        $pdfConf['content_font_family'] = $contentFontFamily;
    }
    if (isset($contentFontStyle) && !empty($contentFontStyle)) {
        $pdfConf['content_font_style'] = $contentFontStyle;
    }
    if (isset($contentFontSize) && !empty($contentFontSize)) {
        $pdfConf['content_font_size'] = $contentFontSize;
    }

    if (isset($footerFontFamily) && !empty($footerFontFamily)) {
        $pdfConf['footer_font_family'] = $footerFontFamily;
    }
    if (isset($footerFontStyle) && !empty($footerFontStyle)) {
        $pdfConf['footer_font_style'] = $footerFontStyle;
    }
    if (isset($footerFontSize) && !empty($footerFontSize)) {
        $pdfConf['footer_font_size'] = $footerFontSize;
    }

    $pdf = \kernel\pdf::getInstance($pdfConf, true);
    if (!empty($organizationData) && !empty($organizationData['organization_image'])) {
        $imgPath = APP . DS . $organizationData['organization_image']['storage_path'] . $organizationData['organization_image']['path'];
    }
    if($logoWidth==0){
        $logoWidth=50;
    }
    $pdf->setHeaderData($imgPath, $logoWidth, $headerTitle, $headerString); //,$c_header_title
    if(isset($footerString) && !empty($footerString)){
        $pdf->footer_text=$footerString;
    }
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
        $tidy = tidy_parse_string($value, array('output-xhtml' => TRUE));
        $value = trim(tidy_get_body($tidy)->value);
        $value = substr($value, 6, -7);

        $htmlBreakPages=explode('page-break-html',$value);
        $htmlBreakPagesTotal=count($htmlBreakPages);
        foreach($htmlBreakPages as $htmlBreakPageKey=>$htmlBreakPage){
            $pdf->writeHTML(($htmlBreakPageKey ==0 ? $css:"").$htmlBreakPage);
            if($htmlBreakPageKey < ($htmlBreakPagesTotal-1)){
                $pdf->AddPage();
            }
        }
        $pdf->Output($name, 'F');
        $pdfDocs[$name] = true;
    }
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
    if ($isTemp === true){
        \unlink($file);
    }
}

$mergePdf = $base . DS . $uuid . '.pdf';
$pdfNew->properties['Title'] = $this->data(array('contracts', 'name'));
$pdfNew->properties['Author'] = \kernel\user::read('first_name') . ' ' . \kernel\user::read('last_name');
$pdfNew->save($mergePdf);
$name = trim( $record['name']." ".$templateInfo['name']) . ".pdf";
$this->output["filepath"]=$mergePdf;

if($this->request->return !=4 ){
    header('Content-type:"application/pdf"');
    header('Content-Disposition:attachment;filename="' . $name . '"');
    header("Pragma: no-cache");
    header("Expires: 0");
    echo $pdfNew->render();
    exit;
}


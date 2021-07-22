<?php

error_reporting(0);
ob_start();
//$form['override'] = true;
if(is_path_set("children.0.children",$form)){
    $form["children"][0]["children"]=$form["children"][0]["children"][0];
}

\kernel\form::render($this, $form);
$html = ob_get_contents();
ob_end_clean();
$css = '';
$uiStyle = \kernel\html::getPath($this->request, 'jquery-ui', 'css');
if (!empty($uiStyle)) $css .= file_get_contents($uiStyle[2]);
$style = \kernel\html::getPath($this->request, 'style', 'css');
if (!empty($style)) $css .= file_get_contents($style[2]);
\kernel\html::pdf($this->request, $html, $css,
                  $this->request->module . '-' . $this->request->controller . '-'. $this->request->get('id'), 'D');
?>
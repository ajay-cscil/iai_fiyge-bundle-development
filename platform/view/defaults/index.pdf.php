<?php

error_reporting(0);
ob_start();
$paginate = $this->get('paginate', array(), false);
$paginate['export'] = true;
$paginate['lca'] = $paginate['actions'] = $paginate['pheader'] = $paginate['pfooter'] = $paginate['show_search_row'] = $paginate['searchable'] = $paginate['sortable'] = false;

foreach($paginate['header'] as $i=>$info){
      if(isset($paginate['header'][$i]['style'])){
          unset($paginate['header'][$i]['style']);
      }
}
\kernel\html::paginate($this, $paginate);
$html = ob_get_contents();
ob_end_clean();

$css = '';
$uiStyle = \kernel\html::getPath($this->request, 'jquery-ui', 'css');
if (!empty($uiStyle)) $css .= file_get_contents($uiStyle[2]);
$style = \kernel\html::getPath($this->request, 'style', 'css');
if (!empty($style)) $css .= file_get_contents($style[2]);

\kernel\html::pdf($this->request, $html, $css, $this->get('filename', $this->request->controller), 'D');
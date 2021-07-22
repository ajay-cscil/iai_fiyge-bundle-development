<?php

\kernel\html::ob_start('/js/cache.mobile', 'js');
// // jquery validation plugin
echo \kernel\html::js($this->request, 'json');
echo \kernel\html::js($this->request, '/js/jquery.validate');
echo \kernel\html::js($this->request, '/js/jquery.validate.mapping');
echo \kernel\html::js($this->request, '/js/jquery.tokeninput');
echo \kernel\html::js($this->request, '/js/jquery.formula');
echo \kernel\html::js($this->request, '/js/jquery.validate');
echo \kernel\html::js($this->request, '/js/jquery.validate.mapping');
echo \kernel\html::js($this->request, '/js/jquery.glob');
echo \kernel\html::js($this->request, 'common');
echo \kernel\html::js($this->request, '/js/jquery.tagsinput');
echo \kernel\html::js($this->request, 'jQuery.ui.datepicker');
echo \kernel\html::js($this->request, 'jquery.ui.datepicker.mobile');
echo \kernel\html::js($this->request, '/js/jquery.depends_on');
echo \kernel\html::js($this->request, '/js/jquery.filter_by');
echo \kernel\html::js($this->request, 'script.mobile');
$path = \kernel\html::ob_flush($this->request, 'js', false);
// script file for current module/controller.
echo \kernel\html::js($this->request, '/module/' . $this->request->module . '/js/' . $this->request->controller . '.mobile');
echo \kernel\html::js($this->request, 'https://maps.googleapis.com/maps/api/js?sensor=false', true);

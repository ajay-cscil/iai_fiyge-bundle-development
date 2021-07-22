<?php

$paginate = $this->get('paginate', array(), false);
\kernel\html::paginate($this, $paginate);

echo $this->request->jsonp(json_encode($paginate), true);
?>
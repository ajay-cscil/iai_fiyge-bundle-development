<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

set_include_path(get_include_path().PATH_SEPARATOR.ROOT.DS.'library'.PATH_SEPARATOR);
require_once __DIR__.'/svndiff/Diff.php';
require_once __DIR__.'/svndiff/Diff/Renderer/Abstract.php';
require_once __DIR__.'/svndiff/Diff/Renderer/Html/SideBySide.php';

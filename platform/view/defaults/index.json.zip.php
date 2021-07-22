<?php

$archiveFileName = tempnam(TMP, 'listview');
$zip = new ZipArchive();
$res = $zip->open($archiveFileName, ZipArchive::CREATE);
if ($res === TRUE) {
    $zip->addFromString('data.json', json_encode($this->get('paginate', array())));
    $zip->close();
    header("Content-Disposition: attachment; filename=data.zip");
    header("Pragma: no-cache");
    header("Expires: 0");
    readfile("$archiveFileName");
    unlink($archiveFileName);
    exit;
}


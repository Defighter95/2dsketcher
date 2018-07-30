<?php
$files = $_FILES; // полученные файлы

// переместим файлы из временной директории в указанную
$file = $files[0];
    $file_name = $file['name']; 
    $sData = file_get_contents($file['tmp_name']);
    //print_r($sData);

//    if (move_uploaded_file($file['tmp_name'], "$uploaddir/$file_name")) {
//        $done_files[] = realpath("$uploaddir/$file_name");
//    }


//$data = $done_files ? array('files' => $done_files) : array('error' => 'Ошибка загрузки файлов.');

echo $sData;

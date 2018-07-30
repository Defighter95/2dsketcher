<?php
$filePath = "uploads/" . $_POST["file"];
$sData = file_get_contents($filePath);
    echo $sData;


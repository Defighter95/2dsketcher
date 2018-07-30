<?php

require_once '../core/dbConnection.php';

$elements = json_decode($_POST['elements']);
$sketch = json_decode($_POST['sketch']);
$hardware = json_decode($_POST['hardware']);
$svg = json_decode($_POST['svg']);

$svgElements = [];

//print_r([$elements, $sketch, $hardware, $svg]);

foreach($elements as $d) {
    if($d) {
       $svgElements[] = $d;
    }
}

$totalData = [
    "elements" => $svgElements,
    "sketch" => $sketch,
    "hardware" => $hardware,
    "svg" => $svg,
];

$sketchName = $sketch->name;
$fileName = strtolower(str_replace(" ", "", $sketch->name)) . date ("dmYHis") . ".2ds";
$creationTime = time();

$res = mysqli_query($mysqli, "INSERT INTO sketch(name, filepath, created_at) VALUES ('$sketchName', '$fileName', $creationTime);");

//print_r($res);

$fp = fopen("uploads/" . $fileName, 'w');
fwrite($fp, json_encode($totalData));
fclose($fp);


//print_r($totalData);

echo json_encode(["fileName" => $fileName]);


<?php

require_once '../core/dbConnection.php';

$res = $mysqli->query("SELECT * FROM sketch ORDER BY id DESC");

$data = [];

$res->data_seek(0);

while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);


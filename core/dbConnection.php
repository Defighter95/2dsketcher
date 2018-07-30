<?php

$mysqli = new mysqli("localhost:3306", "mysql", "mysql", "2dsketch");

if ($mysqli->connect_errno) {
    echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}


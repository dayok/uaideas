<?php
include("../config/sys/config.php");
header ("Content-Type: text/html; charset=utf-8");

$method = $_SERVER['REQUEST_METHOD'];
if(isset($_COOKIE['USER_IN'])) {
    if ($method == "GET") {
        $condition = "";

        $name = $_GET['region_name'];
        if ($name != "")
            $condition = " AND name='" . $name . "'";

        $sql = "SELECT * FROM region WHERE 1" . $condition;

        $result = mysql_query($sql, $con);

        $region_id;

        $data = array();

        while ($row = mysql_fetch_array($result)) {
            $region_id = $row['id'];
            $name = $row['name'];

            $array = array(
                'region_id' => $region_id,
                'name' => $name
            );

            array_push($data, $array);
        }

        $json = json_encode($data, JSON_UNESCAPED_UNICODE);

        echo $json;
    }
}
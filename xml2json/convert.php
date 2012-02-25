<?php

require_once('xml2json.php');

$currentyear = date("Y");
$url = "http://events.ccc.de/congress/$currentyear/Fahrplan/schedule.en.xml";

$xmlStringContents = file_get_contents($url);
$jsonContents = xml2json::transformXmlStringToJson($xmlStringContents);

if (!is_dir('../json')) {
	mkdir('../json');
}

if($jsonContents) {
	$jsonFile = dirname(dirname(__FILE__)) . '/json/schedule.en.json';
	$lastUpdateFile = dirname(dirname(__FILE__)) . '/json/lastUpdate.json';
	if(@file_get_contents($jsonFile) != $jsonContents) {
		file_put_contents($jsonFile, $jsonContents);
		file_put_contents($lastUpdateFile, json_encode(filemtime($jsonFile)));
	}
}

?>

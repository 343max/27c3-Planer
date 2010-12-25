<?php

require_once('xml2json.php');

$xmlStringContents = file_get_contents('http://events.ccc.de/congress/2010/Fahrplan/schedule.en.xml');
$jsonContents = xml2json::transformXmlStringToJson($xmlStringContents);

if($jsonContents) {
	$jsonFile = dirname(dirname(__FILE__)) . '/json/schedule.en.json';
	$lastUpdateFile = dirname(dirname(__FILE__)) . '/json/lastUpdate.json';
	if(@file_get_contents($jsonFile) != $jsonContents) {
		file_put_contents($jsonFile, $jsonContents);
		file_put_contents($lastUpdateFile, json_encode(filemtime($jsonFile)));
	}
}
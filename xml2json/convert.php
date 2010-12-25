<?php

require_once('xml2json.php');

$xmlStringContents = file_get_contents('http://events.ccc.de/congress/2010/Fahrplan/schedule.en.xml');
$jsonContents = xml2json::transformXmlStringToJson($xmlStringContents);

if($jsonContents) {
	file_put_contents(dirname(dirname(__FILE__)) . '/json/schedule.en.json', $jsonContents);
}
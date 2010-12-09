<?php

require_once('xml2json.php');

$xmlStringContents = file_get_contents('http://events.ccc.de/congress/2010/Fahrplan/schedule.en.xml');
$jsonContents = xml2json::transformXmlStringToJson($xmlStringContents);

echo $jsonContents;
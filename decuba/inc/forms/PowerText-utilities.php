<?php


/**
 * Converts form post data to acceptable
 * POST array for PowerText
 * Note - the data isn't validated.
 *				It is assumed that the data has
 *				already been validated & sanitized.
 *				This function is purely for organising
 *				the data structure
 *
 * @param 	array
 * @return 	array
 * @author 	Chris Jones
 **/
function dataToPowerTextArray($data)
{
	$array = array(
		'accountID' => '165',
		'sourceID' => '9787',
		'groupIDs[1]' => '',
		'formURL' => CURRENT_URL,
		'version' => '5Raw',
		'optinFields' => 'allowEmail',
		'allowEmail' => 'N'
	);

	// Merge in the data
	$array = array_merge($array, $data);

	return $array;
}


/**
 * Sends form post data to PowerText
 *
 * @param 	array
 * @return 	bool
 * @author 	Chris Jones
 * @depend 	Curl
 **/
function sendToPowerText($data)
{
	$array = dataToPowerTextArray($data);

	// echo "<pre>" . print_r($array, true) . "</pre>";
	// echo "<br /><br />";
	// echo "NO MESSAGE SENT - UNCOMMENT";
	// exit;
	// return false;

	// define LinkIT API URL
	define ('API_URL', 'https://www.powertext.co.uk/LinkIt/processor.php');

	// Open the Curl session
	$timeout = 6;
	$ch = curl_init(API_URL);
	$postData = http_build_query($array);
	curl_setopt ($ch, CURLOPT_POST, true);
	curl_setopt ($ch, CURLOPT_POSTFIELDS, $postData);

	// Don't return HTTP headers. Do return the contents of the call
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	$result = curl_exec($ch); // Make the call and proxy data

	if ($result === false)
	{
		report_curl_error($ch, API_URL, $postData);
		curl_close($ch); // close the session
		return false;
	}

	curl_close($ch); // close the session

	parse_str(trim($result), $resultarray);

	if ($resultarray['status'] == 'ERROR')
	{
		// print_r($resultarray); exit;
		return $resultarray;
	}

	return true;
}

?>

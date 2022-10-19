<?php


/**
 * Converts form post data to acceptable
 * POST array for Ripple API
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
function dataToPartyProArray($method, $data)
{
	$fallback = [
		'apiKey' => defined('RIPPLE_BOOKING_API_KEY') && !empty(RIPPLE_BOOKING_API_KEY) ? RIPPLE_BOOKING_API_KEY : '' ,
		'barId' => 0,
		'typeId' => '',
		'name' => '',
		'email' => '',
		'mobileNo' => '',
		'utmMedium' => '',
		'utmSource' => '',
		'utmCampaign' => '',
		'utmContent' => ''
	];

	$array = [
		'jsonrpc' => '2.0',
		'method' => $method,
		'id' => 1,
	];

	// Merge in the data
	$array['params'] = array_merge($fallback, $data);

	return $array;
}


/**
 * Sends form post data to Ripple
 *
 * @param 	array
 * @return 	bool
 * @author 	Chris Jones
 * @depend 	Curl
 **/
function sendToPartyPro($method, $data)
{
	$array = dataToPartyProArray($method, $data);
	$postData = json_encode($array);

	// echo "<pre>" . var_dump($array) . "</pre>";
	// echo "<pre>" . var_dump(json_encode($array)) . "</pre>";
	// echo "<pre>" . RIPPLE_BOOKING_API_URL . "</pre>";
	// echo "<br /><br />";
	// echo "NO MESSAGE SENT - UNCOMMENT";
	// exit;
	// return false;


	// Open the Curl session
	$timeout = 6;
	$ch = curl_init(RIPPLE_BOOKING_API_URL);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	$result = curl_exec($ch); // Make the call and proxy data

	if ($result === false)
	{
		report_curl_error($ch, RIPPLE_BOOKING_API_URL, $postData);
	}


	curl_close($ch); // close the session


	// If the booking failed: $result->error !== null
	// Look at $result->error->message for the reason.
	// Otherwise, $result->result->bookingRef will
	// contain the booking reference
	return $result === false ? false : json_decode($result);
}



/**
 * Sends form post data to Ripple
 *
 * @param 	array
 * @return 	bool
 * @author 	Chris Jones
 * @depend 	Curl
 **/
function sendToPartyProViaRest($method, $data)
{
	$postData = http_build_query($data);

	// echo "<pre>" . var_dump($data) . "</pre>";
	// echo "<pre>" . var_dump(json_encode($data)) . "</pre>";
	// echo "<pre>" . RCLOUD_REST_API_URL . $method . "</pre>";
	// echo "<br /><br />";
	// echo "NO MESSAGE SENT - UNCOMMENT";
	// exit;
	// return false;


	// Open the Curl session
	$timeout = 6;
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, RCLOUD_REST_API_URL . $method);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, ['ApiKey: ' . (defined('RCLOUD_REST_API_KEY') && !empty(RCLOUD_REST_API_KEY) ? RCLOUD_REST_API_KEY : '')]);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	$result = curl_exec($ch);
	$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

	if($result === false)
	{
		report_curl_error($ch, RCLOUD_REST_API_URL, $postData);
	}

	curl_close($ch);


	// Response
	if ($status === 200)
	{
		return $result;
	}
	else
	{
		$output_obj = json_decode($result);
		// var_dump(RCLOUD_REST_API_URL . $method);
		// var_dump($data);
		// var_dump($status);
		// var_dump($output_obj);
		// exit;

		// throw new \RuntimeException($output_obj->errors->message);
		return $output_obj;
	}

	return false;
}




/**
 * Sends revolution card data to Party Pro
 *
 * @param 	data
 * @return 	response
 * @author 	Chris Jones
 * @depend 	Curl
 **/

function registerCard($cardType, $cardNumber, $forename, $surname, $email, $mobile, $dateOfBirth, $gender, $barId, $optIn, $universityBarId="", $graduationYear="", $headOfficeRegistered="0", $serverEnv="")
{

	// SAMPLE CURL =============================================
	// curl -H 'ApiKey: ZDY0MjYxNWY0NGZiMTVjNTcxMzRmYWNkNTE1OTJlNGUwMTAxNDY5NzBmM2QxNTAxYzlkNDdhNjZiZGMwYWFiZg==' -X POST --data "card_type=rev_card_2018&card_number=99999999&forename=Chris&surname=Jones&email=chris.jones@wearecube3.com&bar_id=206&mobile=07712345678&opt_in=0&date_of_birth=1984-06-21&gender=M" https://api.revolutionbarsgroup.com/rest/card/register
	// ==========================================================

	if (!empty($serverEnv) && $serverEnv !== 'production' && $serverEnv !== 'live') {
		$apiURL = "https://uat.api.revolution-bars.co.uk/rest/card/register";
	} else {
		$apiURL = "https://api.revolutionbarsgroup.com/rest/card/register";
	}


	$postData = array(
	  'card_type' => $cardType,
	  'card_number' => $cardNumber,
	  'forename' => $forename,
	  'surname' => $surname,
	  'email' => $email,
	  'mobile' => $mobile,
	  'date_of_birth' => $dateOfBirth,
	  'gender' => $gender,
	  'bar_id' => $barId,
	  'opt_in' => $optIn,
		'university_bar_id' => $universityBarId,
		'graduation_year' => $graduationYear,
		'head_office_registered' => $headOfficeRegistered,
	);


// echo $apiURL . "\r\n";
// print_r($postData);
// exit;


	$timeout = 6;
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $apiURL);
	curl_setopt($ch, CURLOPT_POST, 1);

	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		'ApiKey: ZDY0MjYxNWY0NGZiMTVjNTcxMzRmYWNkNTE1OTJlNGUwMTAxNDY5NzBmM2QxNTAxYzlkNDdhNjZiZGMwYWFiZg=='
	));
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData) );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = curl_exec($ch);

	if($data === false)
	{
		$error = curl_error($ch);
		$postString = json_encode($postData);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$errorNumber = curl_errno($ch);

		// Log the error ------
		return array(
			"success" => false,
			"errors" => array(
				"fields" => array(
					array(
						"error" => "We are currently experiencing technical difficulties. Please contact your local bar for assistance."
					)
				)
			),
			"debug" => "Curl error|" . $error . "|Curl error no|" . $errorNumber . "|HTTP code|" . $httpCode . "|Curl Url|" . $apiURL . "|Curl Data|" . $postString . "|Theme|V2.0|Request|" . $_SERVER['REQUEST_URI']
		);
	}

	return json_decode($data);
}




/**
 * Sends revolution card data to Party Pro using the legacy API call
 *
 * @param 	data
 * @return 	response
 * @author 	Chris Jones
 * @depend 	Curl
 **/

function registerCard_LegacyMethod($cardType, $cardNumber, $firstName, $lastName, $email, $mobile, $dateOfBirth, $gender, $localBarHome, $localBarUniversity, $graduationYear, $userType, $optIn)
{

	$postLoyalty = '{
		"jsonrpc" : "2.0",
		"method" : "registerCard",
		"id" : "1",
		"params" : {
			"apiKey" : "cb9301827291f946e8a8e3170991ee60",
			"cardType" : "'. $cardType .'",
			"cardNumber" : "'. $cardNumber .'",
			"firstName" : "'. $firstName .'",
			"lastName" : "'. $lastName .'",
			"email" : "'. $email .'",
			"mobile" : "'. $mobile .'",
			"dateOfBirth" : "'. $dateOfBirth .'",
			"gender" : "'. $gender .'",
			"localBarHome" : "'. $localBarHome.'",
			"localBarUniversity" : "'. $localBarUniversity .'",
			"graduationYear" : "'. $graduationYear .'",
			"userType" : "'. $userType .'",
			"optIn" : "'. $optIn .'"
		}
	}';


	$timeout = 6;
	$ch = curl_init('https://api.revolutionbarsgroup.com/api/website.php');
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postLoyalty);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	    'Content-Type: application/json',
	    'Content-Length: ' . strlen($postLoyalty))
	);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	return curl_exec($ch);
}


?>

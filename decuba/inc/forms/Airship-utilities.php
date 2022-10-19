<?php


/**
 * Converts form post data to acceptable
 * POST array for Airship
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
function dataToAirshipArray($data)
{
	$array = array(
		'contact' => array(
			'sourceid' => AIRSHIP_SOURCE_ID,
		),
		'groups' => array(
		),
		'udfs' => array(
		),
		'consents' => array(
		),
		'eflyers' => array(
		)
	);

	// Merge in the data
	if(!empty($data['groups']))
	{
		$array['groups'] = array_unique(array_merge($array['groups'], $data['groups']));
		unset($data['groups']);
	}
	if(!empty($data['udfs']))
	{
		$array['udfs'] = array_merge($array['udfs'], $data['udfs']);
		unset($data['udfs']);
	}
	if(!empty($data['consents']))
	{
		$array['consents'] = array_merge($array['consents'], $data['consents']);
		unset($data['consents']);
	}
	if(!empty($data['eflyers']))
	{
		$array['eflyers'] = array_unique(array_merge($array['eflyers'], $data['eflyers']));
		unset($data['eflyers']);
	}

	// Merge everything that's left into the contact field
	if(!empty($data))
	{
		$array['contact'] = array_merge($array['contact'], $data);
	}

	return $array;
}


/**
 * Sends form post data to Airship
 *
 * @param 	array
 * @return 	bool
 * @author 	Chris Jones
 * @depend 	Curl
 **/
function sendToAirship($data)
{
	// echo "<pre>" . print_r($data, true) . "</pre>";
	// echo "<br /><br />";

	$array = dataToAirshipArray($data);

	// echo "<pre>" . print_r($array, true) . "</pre>";
	// echo "<br /><br />";
	// echo "NO MESSAGE SENT - UNCOMMENT";
	// return false;
	// exit;

	$contact = $array;
	unset($contact['eflyers']);
	$eflyers = $array['eflyers'];

	// define API URL
	ini_set("soap.wsdl_cache_enabled", "0");
	$wsdl = 'https://secure.airship.co.uk/SOAP/V3/Contact.wsdl';
	$client = new SoapClient($wsdl);

	try
	{
		$contactID = $client->createContact(AIRSHIP_USERNAME, AIRSHIP_PASSWORD, $contact['contact'], $contact['groups'], $contact['udfs'], $contact['consents']);
	}
	catch (SoapFault $sf)
	{
		report_soap_error($sf, $wsdl, $array);
		return $sf->getMessage();
	}

	if(!empty($eflyers))
	{
		$wsdl = "https://secure.airship.co.uk/SOAP/V3/Broadcast.wsdl"; 
		$client = new SoapClient($wsdl);

		foreach ($eflyers as $eflyerID) 
		{
			try
			{
				$broadcastID = $client->sendForcedEflyer(AIRSHIP_USERNAME, AIRSHIP_PASSWORD, $eflyerID, array($contact['contact']['email']));
			}
			catch (SoapFault $sf)
			{
				report_soap_error($sf, $wsdl, $array);
			}
		}
	}

	return true;
}

?>

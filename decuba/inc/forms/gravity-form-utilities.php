<?php

	/**
	 *
	 * Gravity Form Utilities Class v.1.1
	 *
	 */

	class Gravity_Form_Utilities
	{

		/**
	 	 * Prepop a gravity form based on the classes of each field.
		 * Classes take the form prepop--xxxx where xxxx is the
		 * name of a prepop type
	 	 *
		 * @param 	Form obj
	 	 * @return 	bool
	 	 * @author 	Chris Jones
	 	 **/
	 	public static function prepopFormFromFieldClasses( &$form )
		{
			// Loop through the form fields
			foreach($form['fields'] as &$field)
			{
				// If the field does not have our designated CSS class, skip it
				if(strpos($field['cssClass'], 'prepop--') === false)
					continue;

				// If the field was already processed (e.g. multiple instances on page)
				if(isset($field['isPrepoped']))
					continue;

				// Prepop based on class name
				preg_match_all("|prepop--(\w+?)|U", $field['cssClass'], $matches);


				foreach ($matches[1] as $match)
				{
					$parts = explode('_', $match);
					switch ($parts[0])
					{
						case 'random':
							if($field->type === 'select')
							{
								$max = count($field['choices']) - 1;
								$ind = rand(0, $max);
								$field->choices[$ind]['isSelected'] = true;
								$field->isPrepoped = true;
							}
							break;
					}
				}

			}
		}


		/**
	 	 * Validate a gravity form based on the classes of each field.
		 * Classes take the form validate-xxxx where xxxx is the
		 * name of a validation type
	 	 *
		 * @param 	Form obj
	 	 * @return 	bool
	 	 * @author 	Chris Jones
	 	 **/
	 	public static function validateFormFromFieldClasses( &$form )
		{
			// Assume we'll pass validation
			$all_valid = true;

			// Get the current page being validated
			$current_page = rgpost('gform_source_page_number_' . $form['id']) ? rgpost('gform_source_page_number_' . $form['id']) : 1;

			// Loop through the form fields
			foreach($form['fields'] as &$field)
			{
				// If the field does not have our designated CSS class, skip it
				if(strpos($field['cssClass'], 'validate-') === false)
					continue;

				// Get the field's page number
				$field_page = $field['pageNumber'];

				// Check if the field is hidden by GF conditional logic
				$is_hidden = RGFormsModel::is_field_hidden($form, $field, array());

				// If the field is not on the current page OR if the field is hidden, skip it
				if($field_page != $current_page || $is_hidden)
					continue;

				// Get the submitted value from the $_POST
				if(is_array( $field['inputs'] ))
				{
					$field_value = array();

					//this is a complex fieldset (name, adress, etc.) - get individual field info
					foreach ( $field['inputs'] as $input )
					{
						//get name of individual field, replace period with underscore when pulling from post
						$input_name = 'input_' . str_replace( '.', '_', $input['id'] );
						$field_value[] = rgpost( $input_name );
					}
				}
				else
				{
					$field_value = rgpost("input_{$field['id']}");
				}

				// Validate based on class name
				$is_valid = true;
				$reason = '';
				preg_match_all("|validate-(\w+?)|U", $field['cssClass'], $matches);


				foreach ($matches[1] as $match)
				{
					$parts = explode('_', $match);
					switch ($parts[0])
					{
						case 'nonzero':
							if ($field_value === '0')
							{
								$is_valid = false;
								$reason = 'This field is required.';
							}
							break;

						case 'maxlength':
							if (strlen($field_value) > $parts[1])
							{
								$is_valid = false;
								$reason = 'This field can not be more than ' . $parts[1] . ' characters long';
							}
							break;

						case 'mobile':
							$field_value = trim($field_value);
							if (!preg_match('|^07\d{3}\s?\d{3}\s?\d{3}$|', $field_value) || empty($field_value) )
							{
								$is_valid = false;
								$reason = 'Please enter a valid mobile number';
							}
							break;

						case 'futuredate':
							$field_value = trim($field_value);
							$date = $field_value;
							$dateArr = explode("/", $field_value);

							// Selected with jQuery UI
							if(count($dateArr) == 3)
							{
								$date = $dateArr[2] . "-" . $dateArr[1] . "-" . $dateArr[0];
							}
							$today = strtotime(date('Y-m-d'));
							$date = strtotime($date);

							if ($date < $today)
							{
								$is_valid = false;
								$reason = 'Date cannot be in the past';
							}
							break;

						case 'consent':
							$test_value = is_array($field_value) ? implode("|", array_filter($field_value)) : $field_value;
							if ($test_value !== 'consent')
							{
								$is_valid = false;
								$reason = 'You must provide explicit consent';
							}
							break;

						default:
								# code...
							break;
					}
				}

				// If the field is valid we don't need to do anything, skip it
				if($is_valid) { continue; }

				// The field failed validation, so first we'll need to fail the validation for the entire form
				$all_valid = false;

				// Mark the specific field that failed and add a custom validation message
				$field['failed_validation'] = true;
				$field['validation_message'] = $reason;
			}

			return $all_valid;
		}



		/**
	 	 * Validate a gravity form based on the form itself and
	 	 * the data that was submitted.
	 	 *
		 * @param 	Form obj
	 	 * @return 	bool
	 	 * @author 	Chris Jones
	 	 **/
	 	public static function validateFormFromTypeAndData( &$form )
		{
			// Initialise
			$all_valid = true;

			switch ($form['id'])
			{
				default:
					break;
			}

			return $all_valid;
		}





		/**
	 	 * Post form data to 3rd party system(s)
	 	 *
		 * @param 	Form obj
	 	 * @return 	bool (success)
	 	 * @author 	Chris Jones
	 	 **/
	 	public static function postTo3rdPartySystems( $form )
		{
			// Initialise
			$post_success = true;

			// Map values to field name
			$mappedData = Gravity_Form_Utilities::mapPostedDataToFieldLabel($form);


			// Party Pro? --------
			if($post_success && isset($mappedData['p2pp']) && $mappedData['p2pp'] !== "false")
			{
				// Send to Pary Pro
				$post_success = Gravity_Form_Utilities::postToPartyPro($form, $mappedData['p2pp'], isset($mappedData['p2pp-method']) ? $mappedData['p2pp-method'] : null);
			}


			// Airship - OLD? --------
			if($post_success && isset($mappedData['p2pt']) && $mappedData['p2pt'] === "true")
			{
				// Send to PowerText
				$post_success = Gravity_Form_Utilities::postToPowerText($form);
			}

			// Airship - SOAP API? --------
			if($post_success && isset($mappedData['p2as']) && $mappedData['p2as'] === "true")
			{
				// Send to Airship
				$post_success = Gravity_Form_Utilities::postToAirship($form);
			}

			return $post_success;
		}



		/**
	 	 * Post form data to Party Pro
	 	 *
		 * @param 	Data Array
	 	 * @return 	bool (success)
	 	 * @author 	Chris Jones
	 	 **/
	 	private static function postToPartyPro( $form, $method, $requestType = null, $preloadedData = null )
		{
			// Load dependencies
			require_once('PartyPro-utilities.php');

			// Preload the data array if provided
			$data = array();
			if (!is_null($preloadedData))
			{
				$data = $preloadedData;
			}


			// Loop through all fields and map to PowerText values
			foreach($form['fields'] as $field)
			{
				// If the field does not have our designated CSS class, skip it
				if(strpos($field['cssClass'], 'p2pp--') === false)
					continue;

				// See if this is a complex field (will have inputs)
				$field_value = "";
				if(!empty($field['dateType']))
				{
					if($field['dateType'] === "datedropdown" || $field['dateType'] === "datefield")
					{
						$parts = rgpost("input_{$field['id']}");
						$field_value = $parts[2] . "-" . $parts[1] . "-" . $parts[0];
					}
					else
					{
						// Other date types here...
					}
				}
				elseif ( is_array( $field['inputs'] ) )
				{
					//this is a complex fieldset (name, adress, etc.) - get individual field info
					foreach ( $field['inputs'] as $input )
					{
						//get name of individual field, replace period with underscore when pulling from post
						$input_name = 'input_' . str_replace( '.', '_', $input['id'] );
						$field_value .= rgpost( $input_name ) . "|";
					}

					$field_value = rtrim($field_value, "|");
				}
				else
				{
					$field_value = rgpost("input_{$field['id']}");
				}


				// Get the mapped key
				preg_match_all("|p2pp--(\w+?)|U", $field['cssClass'], $matches);


				foreach ($matches[1] as $match)
				{
//					$parts = explode('_', $match);		// NOT WITH P2PP!!
					switch ($match)
					{
						case 'dob':
							$subparts = explode('/', $field_value);

							// Check we haven't already dealt with this because it's a dateType field
							if(count($subparts) === 3)
							{
								$data[$match] = $subparts[2].'-'.$subparts[1].'-'.$subparts[0];
							}
							else
							{
								$data[$match] = $field_value;
							}
							break;

						case 'barId':
						case 'bar_id':
							$result = preg_match_all("|p2pp--(\w+?)|U", $field_value, $submatches);
							$data[$match] = $result && count($submatches) >= 2 ? $submatches[1][0] : $field_value;
							$data[$match] = intval($data[$match]);
							break;

						case 'typeId':
							$data[$match] = intval($field_value);
							break;

						case 'opt_in':
						case 'email_opt_in':
						case 'sms_opt_in':
						case 'phone_opt_in':
						case 'marketing_opt_in':
						case 'include_head_office':
							$data[$match] = !empty($field_value);
							break;

						case 'opt_out':
							$data['opt_in'] = empty($field_value);
							break;

						case 'email_opt_out':
							$data['email_opt_in'] = empty($field_value);
							break;

						case 'sms_opt_out':
							$data['sms_opt_in'] = empty($field_value);
							break;

						case 'phone_opt_out':
							$data['phone_opt_in'] = empty($field_value);
							break;

						case 'marketing_opt_out':
							$data['marketing_opt_in'] = empty($field_value);
							break;

						case 'exclude_head_office':
							$data['include_head_office'] = empty($field_value);
							break;

						default:
							$data[$match] = $field_value;
							break;
					}
				}
			}

			// Fix name
			if(isset($data["firstName"]) && isset($data["lastName"]))
			{
				$data['name'] = $data["firstName"] . " " . $data["lastName"];
				unset($data["firstName"]); unset($data["lastName"]);
			}


			// Add UTM data
			if($method === "addBooking" || $method === "addQuickEnquiry")
			{
				global $tracking;
				$data['utmMedium'] = js_sanitize($tracking['utm_medium']);
				$data['utmSource'] = js_sanitize($tracking['utm_source']);
				$data['utmCampaign'] = js_sanitize($tracking['utm_campaign']);
				$data['utmContent'] = js_sanitize($tracking['utm_content']);
	//			$data['utmOffer'] = js_sanitize($tracking['o']);
			}




			// Send
			if($requestType === 'rest')
			{
				$result = sendToPartyProViaRest($method, $data);
			}
			else
			{
				$result = sendToPartyPro($method, $data);
			}


			// Failed?
			if($result === false)
			{
				global $gform_message;
				$gform_message = '<div class="validation_error validation_error--force">We are currently experiencing technical difficulties. To continue your enquiry, please contact the bar directly. We apologise for any inconvenience caused.</div>';
				$result = false;
			}
			elseif(is_object($result) && property_exists($result, 'error') && !is_null($result->error))
			{
				global $gform_message;
				$gform_message = '<div class="validation_error validation_error--force">' . $result->error->message . '</div>';
				$result = false;
			}
			elseif(is_object($result) && property_exists($result, 'errors') && !is_null($result->errors))
			{
				global $gform_message;
				$gform_message = '<div class="validation_error validation_error--force"><ul>';
				foreach ($result->errors->fields as $field) {
					$gform_message .= '<li>' . $field->error . '</li>';
				}
				$gform_message .= '</ul></div>';
				$result = false;
			}
			// anything else on success? The booking ref maybe?
			else
			{
// echo "<pre>" . print_r($result, true) . "</pre>";
// echo "<pre>" . var_dump(json_encode($result)) . "</pre>";
				$result = true;
			}

			return $result;
		}



		/**
	 	 * Post form data to PowerText
	 	 *
		 * @param 	Data Array
	 	 * @return 	bool (success)
	 	 * @author 	Chris Jones
	 	 **/
	 	private static function postToPowerText( $form, $preloadedData = null )
		{
			// Load dependencies
			require_once('PowerText-utilities.php');

			// Preload the data array if provided
			$data = array();
			if (!is_null($preloadedData))
			{
				$data = $preloadedData;
			}


			// Loop through all fields and map to PowerText values
			foreach($form['fields'] as $field)
			{
				// If the field does not have our designated CSS class, skip it
				if(strpos($field['cssClass'], 'p2pt--') === false)
					continue;

				// See if this is a complex field (will have inputs)
				$field_value = "";
				if(!empty($field['dateType']))
				{
					switch($field['dateType'])
					{
						case "datedropdown":
						case "datefield":
							$parts = rgpost("input_{$field['id']}");
							$field_value = $parts[0] . "/" . $parts[1] . "/" . $parts[2];
							break;

						default:
							$field_value = rgpost("input_{$field['id']}");
							break;
					}
				}
				elseif ( is_array( $field['inputs'] ) )
				{
					//this is a complex fieldset (name, adress, etc.) - get individual field info
					foreach ( $field['inputs'] as $input )
					{
						//get name of individual field, replace period with underscore when pulling from post
						$input_name = 'input_' . str_replace( '.', '_', $input['id'] );
						$field_value .= rgpost( $input_name ) . "|";
					}

					$field_value = rtrim($field_value, "|");
				}
				else
				{
					$field_value = rgpost("input_{$field['id']}");
				}

				// Get the mapped key
				preg_match_all("|p2pt--(\w+?)|U", $field['cssClass'], $matches);


				foreach ($matches[1] as $match)
				{
					$parts = explode('_', $match);
					switch ($parts[0])
					{
						case 'dob':
							$subparts = explode('/', $field_value);

							// Check we haven't already dealt with this because it's a dateType field
							if(count($subparts) === 3)
							{
								$data['dobDay'] = $subparts[0];
								$data['dobMonth'] = $subparts[1];
								$data['dobYear'] = $subparts[2];
							}
							else
							{
								$data[$match] = $field_value;
							}
							break;

						case 'allowEmail':
							$data['allowEmail'] = empty($field_value) ? "N" : "Y";
							break;

						case 'disallowEmail':
							$data['allowEmail'] = empty($field_value) ? "Y" : "N";
							break;

						case 'allowSMS':
							$data['allowSMS'] = empty($field_value) ? "N" : "Y";
							break;

						case 'disallowSMS':
							$data['allowSMS'] = empty($field_value) ? "Y" : "N";
							break;

						case 'allowCall':
							$data['allowCall'] = empty($field_value) ? "N" : "Y";
							break;

						case 'disallowCall':
							$data['allowCall'] = empty($field_value) ? "Y" : "N";
							break;

						case 'groupIDs':
							// Try for groupID specific value
							$result = preg_match_all("|p2pt--".$parts[1]."--(\w+?)|U", $field_value, $submatches);
							// Otherwise a PowerText specific value
							if(!$result) { $result = preg_match_all("|p2pt--(\w+?)|U", $field_value, $submatches); }
							// Assign a value based on the success of the above tests
							$data['groupIDs['.$parts[1].']'] = $result && count($submatches) >= 2 ? $submatches[1][0] : $field_value;
							break;


						case 'UDFIDs':
							$data['UDFIDs['.$parts[1].']'] = $field_value;
							break;

						default:
							$data[$match] = $field_value;
							break;
					}
				}
			}

			// Send and deal with the result
			$result = sendToPowerText($data);

			if($result === false)
			{
				global $gform_message;
				$gform_message = '<div class="validation_error validation_error--force">We are currently experiencing technical difficulties. To continue your enquiry, please contact the bar directly. We apologise for any inconvenience caused.</div>';
				$result = false;
			}
			elseif(is_array($result) && strtolower($result['status']) === "error")
			{
				global $gform_message;
				$gform_message = '<div class="validation_error validation_error--force">' . $result['message'] . '</div>';
				$result = false;
			}

			return $result;
		}



		/**
	 	 * Post form data to Airship's SOAP API
	 	 *
		 * @param 	Data Array
	 	 * @return 	bool (success)
	 	 * @author 	Chris Jones
	 	 **/
	 	private static function postToAirship( $form, $preloadedData = null )
		{
			// Load dependencies
			require_once('Airship-utilities.php');

			// Preload the data array if provided
			$data = array();
			if (!is_null($preloadedData))
			{
				$data = $preloadedData;
			}


			// Loop through all fields and map to PowerText values
			foreach($form['fields'] as $field)
			{
				// If the field does not have our designated CSS class, skip it
				if(strpos($field['cssClass'], 'p2as--') === false)
					continue;

				// See if this is a complex field (will have inputs)
				$field_value = "";
				if(!empty($field['dateType']))
				{
					switch($field['dateType'])
					{
						case "datedropdown":
						case "datefield":
							$parts = rgpost("input_{$field['id']}");
							$field_value = $parts[0] . "/" . $parts[1] . "/" . $parts[2];
							break;

						default:
							$field_value = rgpost("input_{$field['id']}");
							break;
					}
				}
				elseif ( is_array( $field['inputs'] ) )
				{
					//this is a complex fieldset (name, adress, etc.) - get individual field info
					foreach ( $field['inputs'] as $input )
					{
						//get name of individual field, replace period with underscore when pulling from post
						$input_name = 'input_' . str_replace( '.', '_', $input['id'] );
						$field_value .= rgpost( $input_name ) . "|";
					}

					$field_value = rtrim($field_value, "|");
				}
				else
				{
					$field_value = rgpost("input_{$field['id']}");
				}

				// Get the mapped key
				preg_match_all("|p2as--(\w+?)|U", $field['cssClass'], $matches);


				foreach ($matches[1] as $match)
				{
					$parts = explode('_', $match);
					switch ($parts[0])
					{
						case 'dob':
							$subparts = explode('/', $field_value);

							// Check we haven't already dealt with this because it's a dateType field
							if(count($subparts) === 3)
							{
								$data[$match] = $subparts[2].'-'.$subparts[1].'-'.$subparts[0];
							}
							else
							{
								$data[$match] = $field_value;
							}
							break;

						case 'allowemail':
						case 'allowEmail':
							$field_value = strtoupper($field_value);
							if($field_value == "Y") { $data['allowemail'] = "Y"; }
							elseif(empty($field_value) || $field_value == "N") { $data['allowemail'] = "N"; }
							break;

						case 'allowsms':
						case 'allowSMS':
							$field_value = strtoupper($field_value);
							if($field_value == "Y") { $data['allowsms'] = "Y"; }
							elseif(empty($field_value) || $field_value == "N") { $data['allowsms'] = "N"; }
							break;

						case 'allowcall':
						case 'allowCall':
							$field_value = strtoupper($field_value);
							if($field_value == "Y") { $data['allowcall'] = "Y"; }
							elseif(empty($field_value) || $field_value == "N") { $data['allowcall'] = "N"; }
							break;

						case 'groupid':
							$result = preg_match_all("|p2as--(\w+?)|U", $field_value, $submatches);

							// Assign a value based on the success of the above tests
							if($result && count($submatches) >= 2)
							{
								foreach ($submatches[1] as $submatch) { $data['groups'][] = $submatch; }
							}
							else
							{
								$data['groups'][]	= $field_value;
							}
							break;

						case 'udf':
							$data['udfs'][] = array("udfnameid"=>$parts[1], "data"=>$field_value, "type"=>"Text");
							break;

						case 'consent':
							$field_value = strtoupper($field_value);
							if($field_value == "Y")
							{
								$data['consents'][] = array("consenttypeid"=>$parts[1], "consentstatus"=>"Y");
							}
							elseif(empty($field_value) || $field_value == "N")
							{
								$data['consents'][] = array("consenttypeid"=>$parts[1], "consentstatus"=>"N");
							}
							break;

						case 'eflyer':
							$result = preg_match_all("|p2as--(\w+?)|U", $field_value, $submatches);

							// Assign a value based on the success of the above tests
							if($result && count($submatches) >= 2)
							{
								foreach ($submatches[1] as $submatch) { $data['eflyers'][] = $submatch; }
							}
							else
							{
								$data['eflyers'][]	= $field_value;
							}
							break;

						case 'udf':
							$data['udfs'][] = array("udfnameid"=>$parts[1], "data"=>$field_value, "type"=>"Text");
							break;

						default:
							$data[$match] = $field_value;
							break;
					}
				}
			}

			// Send and deal with the result
			$result = sendToAirship($data);

			if(is_string($result) || $result === false)
			{
				$message = 'We are currently experiencing technical difficulties. To continue your enquiry, please contact the bar directly. We apologise for any inconvenience caused.';

				if(is_string($result))
				{
					$whitelist = array(
						'Mobile number is invalid',
						'Post code is invalid',
						'Email address is invalid'
					);
					if(in_array($result, $whitelist))
					{
						$message = '<div class="validation_error validation_error--force">' . $result . '</div>';
					}
				}

				global $gform_message;
				$gform_message = $message;
				$result = false;
			}
			elseif(is_array($result) && strtolower($result['status']) === "error")
			{
				global $gform_message;
				$gform_message = '<div class="validation_error validation_error--force">' . $result['message'] . '</div>';
				$result = false;
			}

			return $result;
		}



		/**
	 	 * Map posted data with field label
	 	 *
		 * @param 	Data Array
	 	 * @return 	bool (success)
	 	 * @author 	Chris Jones
	 	 **/
	 	private static function mapPostedDataToFieldLabel( $form )
		{
			$mappedData = array();

			foreach($form['fields'] as $field)
			{
				if(array_key_exists('label', $field) && !empty($field['label']))
				{
					$mappedData[$field['label']] = rgpost("input_{$field['id']}");
				}
			}

			return $mappedData;
		}



	}

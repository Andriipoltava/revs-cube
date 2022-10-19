<?php  
	require "vendor/twitteroauth/autoload.php";

	use Abraham\TwitterOAuth\TwitterOAuth;

	function get_tweets($handle){
		$consumer_key = 'Jj0jMXCxtVxgpBZCa6pp2ZV7x';
		$consumer_secret = 'XdWcx3CJuVVidmy4fIBls1dDRGhY37RRXejUbnjXrwFgJ9lyaK';
		$access_token = '227463482-57aTQjDtKqEPdzpJmDAi8SYpNHbTd8vDhmzWPA9L';
		$access_token_secret = 'jCrK4WisSRgcuXOkzeqFtDmHzvcqqz4aEPA9tJ33eCsJz';

		$connection = new TwitterOAuth($consumer_key, $consumer_secret, $access_token, $access_token_secret);
		$content = $connection->get("account/verify_credentials");

		$tweets = $connection->get(
			"statuses/user_timeline", 
			[
				"screen_name" => $handle,
				"exclude_replies" => true,
				'include_rts' => false
			]
		);

		foreach ($tweets as $tweet) {
			$tweet->text = preg_replace("/((http)+(s)?:\/\/[^<>\s]+)/i", "<a href=\"\\0\" target=\"_blank\" class=\"tweet__link\">\\0</a>", $tweet->text );
			$tweet->text = preg_replace("/[@]+([A-Za-z0-9-_]+)/", "<a href=\"https://twitter.com/\\1\" target=\"_blank\">\\0</a>", $tweet->text );
			$tweet->text = preg_replace("/[#]+([A-Za-z0-9-_]+)/", "<a href=\"https://twitter.com/search?q=%23\\1\" target=\"_blank\">\\0</a>", $tweet->text );
		}

		return $tweets;
	}
?>

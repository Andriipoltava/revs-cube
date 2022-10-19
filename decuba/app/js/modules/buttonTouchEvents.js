var buttonTouchEvents = (function($) {
	'use strict';

	var _bind = function() {
		if (Modernizr.touchevents) {
		  // supported
		  // $('.button').on('touchstart', function(event) {
		  // 	console.log('trig');
		  // 	$(this).blur();
		  // });
		} else {
		  // not-supported
		}
	};

	function init() {
		_bind();
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	buttonTouchEvents.init();
});
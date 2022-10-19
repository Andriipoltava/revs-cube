var mobileAccordian = (function($) {
	'use strict';

	var _bind = function() {
		$('[data-mobile-accordian]').click(function (event) {
			event.preventDefault();

			$(this).toggleClass('open');
			$('[data-mobile-accordian-target]').toggleClass('open');
		});
	};

	function init() {
		_bind();
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	mobileAccordian.init();
});
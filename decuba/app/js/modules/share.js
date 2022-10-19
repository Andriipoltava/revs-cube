var share = (function($) {
	'use strict';

	function init() {
		$('.button--share').on('click', function(event) {
			event.preventDefault();

			$('.share__list').toggleClass('active');
		});
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	share.init();
});
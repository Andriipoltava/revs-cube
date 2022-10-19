var app = (function($) {
	'use strict';
	var isLocationSet = false;
	var locationData = {};

	if (Cookies.get('savedLocation')) {
			isLocationSet = true;
			locationData = JSON.parse(Cookies.get('savedLocation'));
	}

	$('html').addClass(isLocationSet ? 'locationset' : 'no-locationset');
 
	var _scrollFade = function() {
		$('.rdc-modal, .menu, .locations, .video-modal, .useful-info, .rdc-fixr-modal').each(function(index, el) {
			$(el).scroll(function() {
				$('.masthead__logo--inner').css({'opacity':( 100-$(el).scrollTop() )/100});
			});
		});
		
	}; 

	var _scrollDown = function(el) {
		$('html, body').animate({
		    scrollTop: $(el).offset().top
		}, 500);
	};

	function init() {
		_scrollFade();

		var browserdata = browserDetection();

		$('html').addClass(browserdata.browser).addClass('v-'+browserdata.version).addClass(browserdata.os);

		$('.hero__slide__scroll .button').on('click', function(event) {
			event.preventDefault();
			var nextEl = $(this).parents('.hero').next();

			_scrollDown(nextEl);
		});

		if ($('.hero').length === 0) {
			$('.masthead').addClass('no-hero');
		}

		var spaceBelow = $(window).height() - $('.footer')[0].getBoundingClientRect().bottom;

		if (spaceBelow > 0) {
			$('body').addClass('sticky-footer');
		}
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	app.init();
});
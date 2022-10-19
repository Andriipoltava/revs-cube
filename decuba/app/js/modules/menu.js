var menu = (function($) {
	'use strict';

	var _bind = function() {
		$('.button--menu').on('click', function(event) {
			event.preventDefault();

			$(this).toggleClass('active');
			$('body').toggleClass('disable-scroll');
			$('.menu').toggleClass('active');

			if ($('.masthead').hasClass('active')) {
				setTimeout(function() {
					$('.masthead').removeClass('active');
				}, 600);
			} else {
				$('.masthead').addClass('active');
			}
			// If menus open, make sure nav is present and disable other actions
			if ($('body').hasClass('disable-scroll')) {
				var animateIn = anime({
		      		duration: 10,
		    		easing: 'easeOutCubic',
				  	targets: '.masthead',
				  	translateY: '0',
				});
			}

			$('.button--menu .burger').toggleClass('orange');
		}).circlespread({
			background: '#fff'
		});
	};

	var _hasTooltip = function() {
		$('.has-tooltip').mouseenter(function(event) {
			$(this).addClass('active');
		}).mouseleave(function(event) {
			$(this).removeClass('active');
		});

		if ($('html.touchevents').length > 0) { 
			$('.masthead__navigation .has-tooltip:not(.active) a').on('click', function(e) {
				e.preventDefault();
				$(this).blur().unbind();
			});
		}

	};

	function init() {
		_bind();
		_hasTooltip();
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	menu.init();
});
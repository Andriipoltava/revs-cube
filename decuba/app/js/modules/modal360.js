var modal360 = (function($) {
	'use strict';

	var _bind = function() {
		var _removeClass = function (el) {
			var r = $.Deferred();

			$('.circle').removeClass('circleEffect');

			setTimeout(function () {
				r.resolve();
			}, 600);

			return r;
		};

		var _removeEl = function (el) {
			$('.circle').remove();
			DECUBA.modalopen = false;
		};
		
		$('[data-modal="360"]').on('click', function(event) {
			event.preventDefault();

			$(this).toggleClass('active');
			$('body').toggleClass('disable-scroll');
			$('.modal360, .button--menu').toggleClass('active');

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

			$('.button--menu .burger').addClass('pink');

			$('.button--menu').unbind('click');

			$('.button--menu').on('click', function(event) {
				event.preventDefault();
				
				_removeClass().done(function(){
					_removeEl();
				});

				$('body').removeClass('disable-scroll');
				$('.modal360, .button--menu, .masthead').removeClass('active');
				$('.button--menu .burger').removeClass('pink');

				$(this).unbind('click');
				menu.init();

				open = false;
			});
		}).circlespread({
			background: '#FFAE2D'
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
	modal360.init();
});
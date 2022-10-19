var useful = (function($) {
	'use strict';

	var self = {};
	_.extend(self, APP.Mediator);

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
	};

	var _modalToggle = function(title, data) {
		$('body').addClass('disable-scroll');
		$('.useful-info, .button--menu').addClass('active');

		if ($('.masthead').hasClass('active')) {
			setTimeout(function() {
				$('.masthead').removeClass('active');
			}, 600);
		} else {
			$('.masthead').addClass('active');
			 var animateIn = anime({
		    	duration: 10,
		    	easing: 'easeOutCubic',
			  	targets: '.masthead',
			  	translateY: '0',
			});
		}

		$('[data-info-container]').empty().append(
			'<h3>'+ title +'</h3>'+
			'<div class="useful-info__content">'+ data +'</div>'+
			'<a href="" class="button button--regular button--regular--pink useful-info--close">' +
				'<span data-text="Got it!">Got it!</span>' +
			'</a>'
		);

		$('.button--menu .burger').addClass('pink');

		$('.button--menu').unbind('click');

		$('.button--menu, .useful-info__content, .useful-info--close').on('click', function(event) {
			event.preventDefault();

			_removeClass().done(function(){
				_removeEl();
				DECUBA.modalopen = false;
			});

			$('body').removeClass('disable-scroll');
			$('.useful-info, .button--menu, .masthead').removeClass('active');
			$('.button--menu .burger').removeClass('pink');

			$(this).unbind('click');
			menu.init();
		});
	};

	function init() {

		$('body').on('click', '[data-useful-info]', function(e) {

			var thisInfo = $(this).data('useful-info');
			var idToUse = undefined;

			if ($(this).attr('data-api-id')) {
				idToUse = $(this).attr('data-api-id')
			}
			else if(BarPageAPIID) {
				idToUse = BarPageAPIID;
			}

			if(!idToUse || idToUse.length === 0) { return false; }

			$(this).circlespread({
				background: '#252632'
			});

			var e2 = new jQuery.Event("click.circlespread");
			e2.pageX = e.pageX;
			e2.pageY = e.pageY;
			$(this).trigger(e2);


			self.query("barInfo", idToUse).then(function(data) {

				switch(thisInfo) {
					case 'wifi':
						_modalToggle('Wifi', '<p>Here at Revolución de Cuba, we keep you connected with fast, free Wi-Fi available in all our bars.<br>Now you’re free to surf, shop or scroll through endless dog videos without using all your data.<br>While you’re here, why not grab yourself a drink and <a href="'+ window.location.origin +'/blog/">immerse yourself in Havana’s heyday over on our Cuba Blog?</a></p>');
						break;
					case 'disabled':
						_modalToggle('Disabled Access', data.disabled_access);
						break;
					case 'dress':
						_modalToggle('Dress Code', data.dress_code);
						break;
				}
			});
		});
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	useful.init();
});
(function() {
	"use strict";

	var DECUBA = {};

	DECUBA.modalopen = false;

	window.DECUBA = DECUBA;
}());

jQuery.fn.circlespread = function(opts){

	var _removeClass = function (el) {
		var r = $.Deferred();

		$('.circle'+el).removeClass('circleEffect');

		setTimeout(function () {
			r.resolve();
		}, 600);

		return r;
	};

	var _removeEl = function (el) {
		$('.circle'+el).remove();
	};

	jQuery.fn.circlespread.defaults = {
	    background: '#00A0AF'
	};

	var options = $.extend( {}, jQuery.fn.circlespread.defaults, opts );
	var rand = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;

	this.addClass('js-circle-'+rand);

	this.on('click.circlespread', function(e) {
		if (!DECUBA.modalopen) {
			var x = e.pageX;
			var y = e.pageY - $(window).scrollTop();
			var buttonWidth = $('body').width()*2;
			var buttonHeight =  $('body').height()*2;
			 
			$('body').prepend('<span class="circle js-circle-'+ rand +'"></span>');

			if(buttonWidth >= buttonHeight) {
				buttonHeight = buttonWidth;
			} else {
				buttonWidth = buttonHeight; 
			}

			$('.circle').css({
				'width': buttonWidth,
				'height': buttonHeight,
				'top': y,
				'left': x,
				'background-color': options.background
			}).addClass('circleEffect');

			DECUBA.modalopen = true;

			// If menus open, make sure nav is present and disable other actions
			if ($('body').hasClass('disable-scroll')) {
				var animateIn = anime({
		      		duration: 10,
		    		easing: 'easeOutCubic',
				  	targets: '.masthead',
				  	translateY: '0',
				});
			}
		} else {
			var el = '.js-circle-'+ rand;

			_removeClass(el).done(function(){
				_removeEl(el);
			});

			DECUBA.modalopen = false;
		}
	});
};
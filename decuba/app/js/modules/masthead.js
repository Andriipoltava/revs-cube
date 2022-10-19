var masthead = (function($) {
	'use strict';

	var _behaviourScroll = function() {

		
		// Default offset sticky
		var offsetSticky = 200;
		if ($(window).width() > 1024 ) {
			offsetSticky = window.innerHeight/2;
		}

		// custom offset for hero special
		if ($('.hero--special').length > 0 && $(window).width() < 1024 ) {
			offsetSticky = 25;
		}

		if($(window).scrollTop() === 0) {
		    var animateIn = anime({
		    	duration: 10,
		    	easing: 'easeOutCubic',
			  	targets: '.masthead',
			  	translateY: '0',
			});
		} else {
		    var animateOut = anime({
		    	duration: 10,
		    	easing: 'easeOutCubic',
			  	targets: '.masthead',
			  	translateY: '-100',
			});
		}
		var lastScrollTop = 0;
		$(window).scroll(function() {

			// If menus open, make sure nav is present and disable other actions
			if ($('body').hasClass('disable-scroll')) {
				return;
			}

	    	var st = $(this).scrollTop();
	    	// console.log(st);
	    	// console.log(lastScrollTop);

		   	if($(window).scrollTop() < offsetSticky) {
		   		var animateIn = anime({
		      		duration: 10,
		    		easing: 'easeOutCubic',
				  	targets: '.masthead',
				  	translateY: '0',
				});
		   	} else if (st > lastScrollTop){
		       var animateOut = anime({
			       	duration: 10,
			    	easing: 'easeOutCubic',
				  	targets: '.masthead',
				  	translateY: '-100',
				});
		   	} else if (st < lastScrollTop - 25) {
		      	var animateIn = anime({
		      		duration: 10,
		    		easing: 'easeOutCubic',
				  	targets: '.masthead',
				  	translateY: '0',
				});
		   	}
		   	lastScrollTop = st;

			if($(window).scrollTop() != 0) {
				$('body').addClass('offtop');
			} else {
				$('body').removeClass('offtop');
			}
		});

	};

	function init() {
		_behaviourScroll();
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	masthead.init();
});
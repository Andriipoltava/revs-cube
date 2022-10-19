var icons = (function() {
	'use strict';
	var wasScrolled = false;
	var path        = false;
	var motionPath  = false;
	var handRotate  = false;
	var showTail    = false;

	function isElementVisible(el) {
		var rect     = el.getBoundingClientRect(),
			vWidth   = window.innerWidth || doc.documentElement.clientWidth,
			vHeight  = window.innerHeight || doc.documentElement.clientHeight,
			efp      = function (x, y) { return document.elementFromPoint(x, y); };

		// Return false if it's not in the viewport
		if (rect.right < 0 || rect.bottom < 0  || rect.left > vWidth || rect.top > vHeight)
			return false;

		// Return true if any of its four corners are visible
		return (
			  el.contains(efp(rect.left,  rect.top)) ||  el.contains(efp(rect.right, rect.top)) ||  el.contains(efp(rect.right, rect.bottom)) ||  el.contains(efp(rect.left,  rect.bottom))
		);
	}

	var _animateGesture = function(el) {
		$(el).append(
			'<div class="finger-prompt">'+
				'<svg width="46px" height="46px" viewBox="0 0 45.35 45.35">' +
					'<g id="gesture" class="finger-prompt__gesture">' +
						'<path id="Hand" class="swipe-x" d="M32.23,25.4a3.43,3.43,0,0,0-1-.17,2.77,2.77,0,0,0-3.58-3.36,2.78,2.78,0,0,0-1.82-2.59,3.52,3.52,0,0,0-2.07-.09l2.45-6.73a3.3,3.3,0,0,0,.11-2.14,2.38,2.38,0,0,0-1.52-1.54,2.7,2.7,0,0,0-.93-.17,2.84,2.84,0,0,0-2.61,2L15.57,26.39l-1.32-3a3.24,3.24,0,0,0-6,.27,3.2,3.2,0,0,0,.09,2.46s1.17,2.9,2.93,6.68l.29.62c1.66,3.6,3.1,6.63,7.64,8.29a10.08,10.08,0,0,0,3.48.62h0a7.94,7.94,0,0,0,5.74-2.67c2-1.9,5.26-10.77,5.4-11.14a2.25,2.25,0,0,0-.19-1.87A2.66,2.66,0,0,0,32.23,25.4Zm.48,2.7c-.91,2.5-3.6,9.3-5.1,10.72-1.34,1.27-2.73,2.41-4.92,2.41a9.11,9.11,0,0,1-3.07-.61c-4.08-1.48-5.35-4.24-7-7.74l-.29-.62c-1.75-3.75-2.89-6.59-2.91-6.65a2.07,2.07,0,0,1,1.88-2.93,2,2,0,0,1,1.84,1.17l1.92,4.38a.58.58,0,0,0,.56.36.59.59,0,0,0,.54-.39l6.19-17.13a1.57,1.57,0,0,1,2-1.16,1.22,1.22,0,0,1,.8.79,2.16,2.16,0,0,1-.1,1.37L21.29,22.47a.59.59,0,1,0,1.12.41L23,21.39a1.72,1.72,0,0,1,1.69-1.13,2.31,2.31,0,0,1,.78.14,1.58,1.58,0,0,1,.95,2l-.74,2a.59.59,0,1,0,1.12.41l.34-.93a1.58,1.58,0,1,1,3,1.08l-.88,2.42a.59.59,0,1,0,1.12.41l.52-1.42h.28a2.51,2.51,0,0,1,.74.1,1.52,1.52,0,0,1,.78.68A1.12,1.12,0,0,1,32.72,28.1Z"/>' +
					'</g>' +
				'</svg>' +
			'</div>');
		
		setTimeout(function() {
			$('.finger-prompt').addClass('active');
		}, 10);
	};

	function init() {
		if (Modernizr.touchevents && $(window).width() < 1024) {
			$('.owl-carousel').each(function(index, el) {
				var myWaypoint = new Waypoint({
					element: el,
					handler: function(direction) {
						if (direction === 'down') {
							if ($(el).children('.finger-prompt').length < 1 && !$(el).hasClass('interacted')) {
								setTimeout(function() {
									_animateGesture(el);
								}, 1000);
							} else {
								$(el).children('.finger-prompt').removeClass('active');

								setTimeout(function() {
									$(el).children('.finger-prompt').remove();
								}, 600);
							}
						} else {
							$(el).children('.finger-prompt').removeClass('active');
						}
					},
					offset: 'bottom-in-view'
				});
			});
		}
	}

	return {
		init:init
	};
}());

jQuery(document).ready(function($) {
	icons.init();
});
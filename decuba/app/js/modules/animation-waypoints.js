var animWaypoints = (function($) {
	'use strict';

	var _bind = function() {

		$('.parallaxme').imagesLoaded( { background: true }, function() {
		  var s = skrollr.init({
				forceHeight: false,
				documentElement : false
			});
		});

	};

	var _blogPostScrollBehaviour = function() {

		var itemQueue = []
		var delay = 200
		var queueTimer

		function processItemQueue () {
			if (queueTimer) return // We're already processing the queue
				queueTimer = window.setInterval(function () {
				if (itemQueue.length) {
				    $(itemQueue.shift()).addClass('inview');
				    processItemQueue()
				} else {
			    window.clearInterval(queueTimer)
			    queueTimer = null
			  }
			}, delay)
		}	

		$('.blog-post:not(.inview)').each(function(index, el) {

			// $(el).waypoint(function(direction) {
			//   if (direction === 'down') {

		 //    	itemQueue.push(this.element)
   //  			processItemQueue()

			//   }
			// }, {
			//   offset: '90%'
			// });

			var waypoint = new Waypoint({
			  	element: el,
			  	handler: function(direction) {
			    	if (direction === 'down') {

			    		if (!$(this).hasClass('inview')) {
					    	itemQueue.push(this.element);
					    	processItemQueue();
					    }

					}
			  	},
			  	offset: '75%'
			})


		});

	};

	var _contentBlockScrollBehaviour = function() {

		var offset = '65%';
		if ($(window).width() > 1024 ) {
			offset = '65%';
		}

		$('.page-about__block__content, .page-about__block__image').each(function(index, el) {

			var waypoint = new Waypoint({
			  	element: el,
			  	handler: function(direction) {
			    	if (direction === 'down') {

				    	$(this.element).addClass('inview');

					}
			  	},
			  	offset: offset
			})


		});
	};

	var _packegeBlockScrollBehaviour = function() {

		var offset = '90%';
		if ($(window).width() > 1024 ) {
			offset = '90%';
		}

		$('.package').each(function(index, el) {

			$(this).closest('.packages__container').addClass('hasAnim');

			var waypoint = new Waypoint({
			  	element: el,
			  	handler: function(direction) {
			    	if (direction === 'down') {

				    	$(this.element).addClass('inview');

					}
			  	},
			  	offset: offset
			})


		});
	};

	var _featuredCTASetImageSizes = function() 
	{
		$('.featured-cta').each(function(index, el) {

			var self = this;
			$(this).removeClass('hasAnim');

			setTimeout(function()
			{
				var imgHeight = $(self).find('.featured-cta__image img').height();
				var imgWidth = $(self).find('.featured-cta__image img').width();

				$(self).addClass('hasAnim');

				$(self).find('.featured-cta__image img').height(imgHeight).width(imgWidth);
			}, 0);
		});
	};


	var _featuredCTAScrollBehaviour = function() {

		var offset = '75%';
		if ($(window).width() > 1024 ) {
			offset = '75%';
		} 

		$('.featured-cta').each(function(index, el) {

			var waypoint = new Waypoint({
			  	element: el,
			  	handler: function(direction) {
			    	if (direction === 'down') {

				    	$(this.element).addClass('inview');

						}
			  	},
			  	offset: offset
			})

		});
	};

	var _featuredCTAResizeBehaviour = function() {

		$('.featured-cta').each(function(index, el) {

			if ($(this).hasClass('hasAnim')) {
				$(this).find('.featured-cta__image img').height('').width('');
			}

		});
	};

	function init() {
		_bind();
	}

	return {
		init:init,
		contentBlockScrollBehaviour: _contentBlockScrollBehaviour,
		blogPostScrollBehaviour: _blogPostScrollBehaviour,
		packegeBlockScrollBehaviour: _packegeBlockScrollBehaviour,
		featuredCTASetImageSizes: _featuredCTASetImageSizes,
		featuredCTAScrollBehaviour: _featuredCTAScrollBehaviour,
		featuredCTAResizeBehaviour: _featuredCTAResizeBehaviour
	};
}(jQuery));

jQuery(document).ready(function($) {
	if(!(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera) && $('.parallaxme').length > 0 ) {
		animWaypoints.init();
	}
	if ($('.blog-post').length > 0 ) {
		animWaypoints.blogPostScrollBehaviour();
	}
	if ($('.page-about__block__content').length > 0 ) {
		animWaypoints.contentBlockScrollBehaviour();
	}
	if ($('.package').length > 0 ) {
		animWaypoints.packegeBlockScrollBehaviour();
	}
	if ($('.featured-cta').length > 0 ) {
		animWaypoints.featuredCTASetImageSizes();
		animWaypoints.featuredCTAScrollBehaviour();
	}
});

$(window).on('load', function() {
	animWaypoints.featuredCTASetImageSizes();
});

$(window).resize(function() {
	animWaypoints.featuredCTAResizeBehaviour();
});
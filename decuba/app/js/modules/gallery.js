var gallery = (function($) {
	var init = function() {
		if ($('.gallery--large__image').length > 1) {
			_largeSlider();
		}
		if ($('.christmas-gallery--large__image').length > 1) {
			_christmasLargeSlider();
		}
		if ($('.christmas-gallery--small__image').length > 1) {
			_christmasSmallSlider();
		}
		if ($('.christmas-gallery--celebration__image').length > 1) {
			_christmasCelebrationSlider();
		}
		if ($('.gallery--fullscreen__image').length > 1) {
			_fullscreenSlider();
		}
		_thumbSlider();
		_fullScreen();
	};


	var _sidebarSetHeight = function() {
		// var sidebar_height = $('.gallery__sidebar').outerHeight();

		// $('.gallery--large__container ').css('min-height', (sidebar_height + 100)+'px');

		$('.gallery__sidebar__container').matchHeight({
		    property: 'min-height',
		    target: $('.gallery__sidebar'),
		});
	};

	var _largeSlider = function() {
		$(".gallery--large").addClass('owl-carousel');
		var large_slider = $(".gallery--large").owlCarousel({
			center: true,
			items: 1,
			loop: true,
			margin: 0,
			lazyLoad: true,
			stagePadding: 0,
		});

		large_slider.on('changed.owl.carousel',function(event){
			var current = event.page.index;
			var element   = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}

			$('[data-gallery-dot]').removeClass('active');
			$('[data-gallery-dot="'+ current +'"]').addClass('active');
		});

		$('[data-gallery-dot]').on('click', function() {
			var slide = $(this).data('gallery-dot');
			
			large_slider.trigger('to.owl.carousel', slide);
		});

		$('.dots__arrow--prev').on('click', function() {
			large_slider.trigger('prev.owl.carousel');
		});

		$('.dots__arrow--next').on('click', function() {
			large_slider.trigger('next.owl.carousel');
		});
	};
	var _christmasCelebrationSlider = function() {
		$(".christmas-gallery--celebration").addClass('owl-carousel');
		var large_slider = $(".christmas-gallery--celebration").owlCarousel({
			center: false,
			items: 1.7,
			loop: true,
			margin: 46,
			lazyLoad: true,
			stagePadding: 0,
			startPosition: 1,
			onInitialized  : counter,
			onTranslated : counter,
			responsive:{
				1366:{
					items:1.8,
					center: false,
				},
				1136:{
					items:1.5,
					center: false,
				},
				1000:{
					items:1.1,
					center: false,
				},
				320:{
					items:1,
					center: true,
				}
			}
		});

		function counter(event) {       
			 var items = event.item.count;  
			 var item  = event.item.index + 1;    
		   if(item > items) {
			 item = item - items
		   }
		   $('#slider_celebration_counter').html("0"+item)
		 }

		large_slider.on('changed.owl.carousel',function(event){
			var current = event.page.index;
			var element   = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}

			$('[data-gallery-dot]').removeClass('active');
			$('[data-gallery-dot="'+ current +'"]').addClass('active');
		});

		$('[data-gallery-dot]').on('click', function() {
			var slide = $(this).data('gallery-dot');
			
			large_slider.trigger('to.owl.carousel', slide);
		});

		$('.dots__arrow__ch--prev').on('click', function() {
			large_slider.trigger('prev.owl.carousel');
		});

		$('.dots__arrow__ch--next').on('click', function() {
			large_slider.trigger('next.owl.carousel');
		});
	};
	var _christmasSmallSlider = function() {
		$(".christmas-gallery--small").addClass('owl-carousel');
		var large_slider = $(".christmas-gallery--small").owlCarousel({
			center: false,
			items: 1.5,
			loop: true,
			margin: 46,
			lazyLoad: true,
			stagePadding: 0,
			startPosition: 1,
			onInitialized  : counter,
			onTranslated : counter,
			responsive:{
				320:{
					items:1.5,
					margin: 16,
				},
				520:{
					items:2.5,
					center: true,
				},
				1125:{
					items:4,
					center: false,
				}
			}
		});

		function counter(event) {       
			 var items = event.item.count;  
			 var item  = event.item.index + 1;    
		   if(item > items) {
			 item = item - items
		   }
		   $('#slider_counter').html("0"+item)
		 }

		large_slider.on('changed.owl.carousel',function(event){
			var current = event.page.index;
			var element   = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}

			$('[data-gallery-dot]').removeClass('active');
			$('[data-gallery-dot="'+ current +'"]').addClass('active');
		});

		$('[data-gallery-dot]').on('click', function() {
			var slide = $(this).data('gallery-dot');
			
			large_slider.trigger('to.owl.carousel', slide);
		});

		$('.dots__arrow--prev').on('click', function() {
			large_slider.trigger('prev.owl.carousel');
		});

		$('.dots__arrow--next').on('click', function() {
			large_slider.trigger('next.owl.carousel');
		});
	};
	var _christmasLargeSlider = function() {
		$(".christmas-gallery--large").addClass('owl-carousel');
		var large_slider = $(".christmas-gallery--large").owlCarousel({
			center: false,
			items: 1.5,
			loop: true,
			margin: 46,
			lazyLoad: true,
			stagePadding: 0,
			startPosition: 1,
			onInitialized  : counter,
			onTranslated : counter,
		});

		function counter(event) {
			var element   = event.target;       
			 var items     = event.item.count;  
			 var item      = event.item.index + 1;    
		   if(item > items) {
			 item = item - items
		   }
		   $('#counter').html("0"+item)
		 }

		large_slider.on('changed.owl.carousel',function(event){
			var current = event.page.index;
			var element   = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}

			$('[data-gallery-dot]').removeClass('active');
			$('[data-gallery-dot="'+ current +'"]').addClass('active');
		});

		$('[data-gallery-dot]').on('click', function() {
			var slide = $(this).data('gallery-dot');
			
			large_slider.trigger('to.owl.carousel', slide);
		});

		$('.dots__arrow--prev').on('click', function() {
			large_slider.trigger('prev.owl.carousel');
		});

		$('.dots__arrow--next').on('click', function() {
			large_slider.trigger('next.owl.carousel');
		});
	};
	var _fullscreenSlider = function() {
		$(".gallery--fullscreen__container").addClass('owl-carousel');
		var fullscreen_slider = $(".gallery--fullscreen__container").owlCarousel({
			center: true,
			items: 1,
			loop: true,
			margin: 0,
			lazyLoad: true,
			stagePadding: 0
		});

		fullscreen_slider.on('changed.owl.carousel',function(event){
			var current = event.page.index;
			var element = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}
		});

		$('.gallery--fullscreen__arrow--prev').on('click', function(evt) {
			evt.preventDefault();
			fullscreen_slider.trigger('prev.owl.carousel');
		});

		$('.gallery--fullscreen__arrow--next').on('click', function(evt) {
			evt.preventDefault();
			fullscreen_slider.trigger('next.owl.carousel');
		});
	};

	var _thumbSlider = function() {
		$(".gallery--thumbs").addClass('owl-carousel');
		var thumbs_slider = $(".gallery--thumbs").owlCarousel({
			center: true,
			items: 1,
			loop: true,
			margin: 0,
			stagePadding: 0,
			rewind: false,
			lazyLoad: false,
			responsive:{
				410:{
					items: 2,
					stagePadding: 0,
				},
				500:{
					items: 3,
				},
				900:{
					items: 4,
				},
				1250:{
					items: 5,
				}
			}
		});
		$('.gallery--thumbs__nav__prev').on('click', function() {
			thumbs_slider.trigger('prev.owl.carousel');
		});

		$('.gallery--thumbs__nav__next').on('click', function() {
			thumbs_slider.trigger('next.owl.carousel');
		});

		$('.gallery--thumbs__nav__center').on('click', function() {
			thumbs_slider.trigger('to.owl.carousel', 0);
		});

		thumbs_slider.on('changed.owl.carousel',function(event){
			var element   = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}
		});
	};

	var _fullScreen = function() {
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

		$('.menu-block--image').click(function (event) {
			event.preventDefault();

			$(this).addClass('active');
			$('body').addClass('disable-scroll');
			$('.full-gallery, .button--menu').addClass('active');

			if ($('.masthead').hasClass('active')) {
				setTimeout(function() {
					$('.masthead').removeClass('active');
				}, 600);
			} else {
				$('.masthead').addClass('active');
			}

			$('.button--menu').unbind('click');

			$('.button--menu').on('click', function(event) {
				event.preventDefault();
				
				_removeClass().done(function(){
					_removeEl();
				});

				$('body').removeClass('disable-scroll');
				$('.full-gallery, .button--menu, .masthead').removeClass('active');

				$(this).unbind('click');
				menu.init();

				open = false;
			});
		}).circlespread({
			background: '#252632'
		});

		$(".gallery--full__container").addClass('owl-carousel');
		
		var full_slider = $(".gallery--full__container").owlCarousel({
			center: true,
			items: 1,
			loop: true,
			margin: 0,
		}).trigger('refresh.owl.carousel');

		$('.gallery--full__arrow--prev').on('click', function(e) {
			e.preventDefault();
			full_slider.trigger('prev.owl.carousel');
		});

		$('.gallery--full__arrow--next').on('click', function(e) {
			e.preventDefault();
			full_slider.trigger('next.owl.carousel');
		});

		full_slider.on('changed.owl.carousel',function(event){
			var element   = event.target;

			if (!$(element).hasClass('interacted')){
				$(element).addClass('interacted');
				$(element).children('.finger-prompt').removeClass('active');
				setTimeout(function() {
					$(element).children('.finger-prompt').remove();
				}, 600);
			}
		});
	};

	return {
		init: init,
		fullScreen:_fullScreen,
		sidebarSetHeight:_sidebarSetHeight
	};
})(jQuery);

jQuery(document).ready(function($) {
	gallery.init();
});

var conveyor = (function($) {
	var init = function() {
		_initSlider();
	};

	var _initSlider = function() {
		$(".conveyor").addClass('owl-carousel');
		var conveyor_slider = $(".conveyor").owlCarousel({
			// center: true,
			items: 1,
			loop: true,
			margin: 10,
			stagePadding: 20,
			rewind: false,
			lazyLoad: true,
			responsive:{
				410:{
					stagePadding: 25,
				},
				630:{
					stagePadding: 25,
				},
				768:{
					items: 2,
					stagePadding: 50,
				},
				1024:{
					items: 3,
					stagePadding: 100,
					margin: 50,
				}
			}
		});

		$('.conveyor__nav__prev').on('click', function() {
			conveyor_slider.trigger('prev.owl.carousel');
		});

		$('.conveyor__nav__next').on('click', function() {
			conveyor_slider.trigger('next.owl.carousel');
		});

		$('.conveyor__nav__center').on('click', function() {
			conveyor_slider.trigger('to.owl.carousel', 0);
		});

		conveyor_slider.on('changed.owl.carousel',function(event){
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
	};
})(jQuery);

jQuery(document).ready(function($) {
	conveyor.init();
});

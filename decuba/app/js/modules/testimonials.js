var testimonials = (function($) {
	var testimonial_slider = false;

	var init = function() {
		if ($(window).width() < 1400 || $('.testimonial__container .package').length > 3) {
			_initSlider();
		}

		$(window).resize(function() {
			if ($(window).width() < 1400 || $('.testimonial__container .package').length > 3) {
				_initSlider();
			} else {
				if (testimonial_slider) {
					testimonial_slider.trigger('destroy.owl.carousel');
					testimonial_slider = false;
				}
			}
		});
	};

	var _initSlider = function() {
		$(".testimonial__container").each(function(index, el) {
			$(this).addClass('owl-carousel');

			testimonial_slider = $(this).owlCarousel({
				items: 1,
				loop: true,
				margin: 10,
				stagePadding: 40,
				rewind: false,
				responsive: {
					730:{
						items: 1,
						stagePadding: 150,
					},
					840:{
						items: 1,
						stagePadding: 200,
					},
					930:{
						items: 2,
						stagePadding: 20,
					},
					1000:{
						items: 2,
						stagePadding: 50,
					},
					1100:{
						items: 2,
						stagePadding: 100,
					},
					1200:{
						items: 2,
						stagePadding: 150,
					},
					1320:{
						items: 2,
						stagePadding: 200,
					},
					1440:{
						items: 3,
					},
					1600:{
						items: 4,
					}
				},
			});
			
			testimonial_slider.on('changed.owl.carousel',function(event){
				var element   = event.target;

				if (!$(element).hasClass('interacted')){
					$(element).addClass('interacted');
					$(element).children('.finger-prompt').removeClass('active');
					setTimeout(function() {
						$(element).children('.finger-prompt').remove();
					}, 600);
				}
			});
		});
	};

	return {
		init: init,
	};
})(jQuery);

jQuery(document).ready(function($) {
	if ($('.testimonial__container').length > 0) {
		testimonials.init(); 
	}
});

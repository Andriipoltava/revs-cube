var christmas = (function($) {
	var init = function() {
		_christmasSlider();
		_christmasMenus();

		if (typeof BarPageAPIID !== 'undefined') {
			_getInfo();
		}
	};

	var _christmasMenus = function() {
		$('.christmas__menus__tabs__tab').on('click', function(event) {
			event.preventDefault();
			
			var thisBtn = $(this).data('christmas-button');

			$('[data-christmas-menu], [data-christmas-button]').removeClass('active');
			$(this).addClass('active');
			$('[data-christmas-menu="'+ thisBtn +'"]').addClass('active');
		});

		$('.christmas__menus__mobile__tab').on('click', function(event) {
			event.preventDefault();
			
			var thisBtn = $(this).data('christmas-button');

			$('[data-christmas-menu], [data-christmas-button]').removeClass('active');
			$(this).addClass('active');
			$('[data-christmas-menu="'+ thisBtn +'"]').addClass('active');

			var fromtop = $('.christmas__menus__mobile__menu[data-christmas-menu="'+ thisBtn +'"]').offset().top;
			fromtop = fromtop - 159;

			$('html, body').animate({
			    scrollTop: fromtop+'px'
			}, 0);
		});
	};

	var _initMap = function(bar) {
		var barLocation = {
			lat: Number(bar.latitude),
			lng: Number(bar.longitude),
		};

		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 18,
			center: barLocation
		});

		var marker = new google.maps.Marker({
			position: barLocation,
			map: map
		});

		if (bar.food_times) {
			$('.christmas__sidebar__times__section--food').append(bar.food_times);
		} else {
			$('.christmas__sidebar__times__section--food').remove();
		}

		if (bar.happyHourTimes) {
			$('.christmas__sidebar__times__section--happy').append(bar.happyHourTimes);
		} else {
			$('.christmas__sidebar__times__section--happy').remove();
		}

		$('.christmas__sidebar__address').append('<p class="christmas__sidebar__address__address"><span class="icon-pin"></span>'+ bar.address.replace('\r\n', '<br />') + '<br />' + bar.postcode +'</p>'+'<p class="christmas__sidebar__address__phone">'+ bar.phone +'</p>');
	};

	var _getInfo = function() {
		var self = {};
		_.extend(self, APP.Mediator);

		self.query("barInfo", BarPageAPIID).then(function(data) {
			_initMap(data);
		});
	};

	var _christmasSlider = function() {
		$(".christmas__slider").addClass('owl-carousel');

		var christmas_slider = $(".christmas__slider").owlCarousel({
			center: true,
			items: 1,
			loop: true,
			margin: 0,
			lazyLoad: true,
			stagePadding: 0
		});

		christmas_slider.on('changed.owl.carousel',function(event){
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
			
			christmas_slider.trigger('to.owl.carousel', slide);
		});

		$('.dots__arrow--prev').on('click', function() {
			christmas_slider.trigger('prev.owl.carousel');
		});

		$('.dots__arrow--next').on('click', function() {
			christmas_slider.trigger('next.owl.carousel');
		});
	};

	return {
		init: init,
	};
})(jQuery);

jQuery(document).ready(function($) {
	christmas.init();
});

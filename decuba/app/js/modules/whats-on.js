var whatson = (function($) {

	var self = {};
	_.extend(self, APP.Mediator);

	var storedEvents = [];
	var origHeight = '';

	var settings = {
		masterSlider: '.whats-on__slider__container',
		activeDate: null,
	};



	var init = function() {
		_populate();
		_getFeatured();

		// $(window).on('resize', function () {
		// 	origHeight = $('[data-info] .whats-on__info').outerHeight();
		// 	$('[data-info]').css('min-height', origHeight);
		// });
	};

	var _setHeight = function() {
		// var sidebar_height = $('.gallery__sidebar').outerHeight();

		// $('.gallery--large__container ').css('min-height', (sidebar_height + 100)+'px');

		$('.featured-event').matchHeight({
		    property: 'min-height',
		    target: $('.featured-event__sidebar'),
		});
	};

	var _getFeatured = function() {

		self.query("barEvents", BarPageAPIID, "featured").then(function(event) {
			event = event[0];

			var eventDate = moment(event.validDays[0].date).format("DD");
			var eventDay = moment(event.validDays[0].date).format("dddd");
			var eventMonth = moment(event.validDays[0].date).format("MMM");

			var image;

			if (event.image && event.image.data.url) {
				image = event.image.data.url.replace(/\s+/g, '%20');
			} else {
				var category = event.category;
				if (category === null) {
					category = 'other';
				}
				image = document.location.origin + '/wp-content/themes/decuba/app/img/fallbacks/whatson/featured/desktop/' + category + '.jpg';
			}

			// Manual character limit for layout consistency, needs party pro implementation
			// var content = event.content;
			// if (content.length > 250) {
			// 	content = content.substring(0,250);
			// }

			$('.featured-event__container').append(
				'<div class="featured-event">' + 
					'<div class="featured-event__sidebar">' +
						'<div class="sidebar sidebar--text">' +
							'<div class="sidebar__event">' +
								'<div class="event-date">' +
									'<div class="event-date__date">'+ eventDate +'<span>'+ eventMonth +'</span></div>'+
									'<div class="event-date__info">' +
										'<div class="event-date__info__day">'+ eventDay +'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
							'<h4 class="sidebar__title">'+ event.title +'</h4>' +
							'<div class="sidebar__description">'+ event.truncatedContent +'</div>' +
							'<div class="sidebar__button">' +
								'<a href="'+ event.bookLink +'" class="button button--regular button--regular--pink">' +
									'<span data-text="'+ event.bookText +'">'+ event.bookText +'</span>' +
								'</a>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div class="featured-event__image" style="background-image: url('+ image +');"></div>' +
					'<div class="featured-event__tag">' +
						'<a class="tag tag--pink">Unmissable!</a>' +
					'</div>' +
				'</div>'
			);
			setTimeout(function() {
				_setHeight();
			}, 50);
		});
	};

	var _getEvents = function(eventids) {
		var ids = eventids;
		$('[data-info]').remove();

		var eventsLength = ids.length;

		$.each(ids, function(index, val) {

			var result = $.grep(storedEvents, function(e){ return e.id == val; });

			$('.whats-on__slider').addClass('active');

			// console.log(result);
			if (result.length > 0) {
				// $('[data-info]').remove();
				var image;

				if (result[0].image && result[0].image.data.url) {
					image = result[0].image.data.url.replace(/\s+/g, '%20');
				} else {
					var category = result[0].category;
					if (category === null) {
						category = 'other';
					}
					image = document.location.origin + '/wp-content/themes/decuba/app/img/fallbacks/whatson/small/' + category + '.jpg';
				}

				// Manual character limit for layout consistency, needs party pro implementation
				// var content = result[0].content;
				// if (content.length > 250) {
				// 	content = content.substring(0,250);
				// }

				$('.whats-on .whats-on__items').append(
					'<div data-info="0" class="pre-show' + ' whats-on__item--' + eventsLength + '">'+
						'<div class="whats-on__info">'+
							'<h4 class="whats-on__info__title">'+ result[0].title +'</h4>'+
							'<div class="whats-on__info__image" style="background-image: url('+ image +');"></div>'+
							'<div class="whats-on__info__content">'+
								'<h4 class="whats-on__info__title">'+ result[0].title +'</h4>'+
								'<div class="whats-on__info__description">'+ result[0].truncatedContent +'</div>'+
								'<a href="' + result[0].bookLink + '" class="button button--regular button--regular--skyblue">' +
									'<span data-text="' + result[0].bookText + '">' + result[0].bookText + '</span>' +
								'</a>' +
							'</div>' +
						'</div>'+
					'</div>'
				);

				origHeight = $('[data-info] .whats-on__info').outerHeight();

				$('[data-info]').addClass('active').removeClass('pre-show');
				$('.whats-on__info, .whats-on__info__image').addClass('active');

				$('.single-bar__whatson').removeClass('loading');

			} else {
				// $('[data-info]').remove();

				$('.whats-on .whats-on__items').append(
					'<div data-info="0" class="active' + ' whats-on__item--' + eventsLength + '">'+
						'<div class="whats-on__info">'+
							'<h4 class="whats-on__info__title">Sorry!</h4>'+
							'<div class="whats-on__info__description"><p>This event can\'t be found</p></div>'+
						'</div>'+
					'</div>'
				);

				$('.single-bar__whatson').removeClass('loading');
			}
		});
		
	};

	var _clickBehaviour = function() {

		$('.event-date').on('click', function() {
			var eventItems = [];

			var itemIndex = $(this).parent().index();

			$(".whats-on__slider__container").trigger("to.owl.carousel", [itemIndex, 250]);

			settings.activeDate = $(this);

			$(settings.masterSlider).find('.event-date').removeClass('eventopen');
			$(settings.activeDate).addClass('eventopen');
			// var id = $(this).data('event-id');

			$(this).find('[data-event-id]').each(function(index, el) {
				eventItems.push($(el).data('event-id'));
			});

			_getEvents(eventItems);
		});

		if ($(window).width() < 885) {
			$('body').on('touchend', '[data-info] .whats-on__info__title', function(e) {
				e.preventDefault();

				var node = $(this).closest('[data-info]');

				if ($(node).hasClass('open')) {
					$('[data-info]').removeClass('open');
				} else {
					$('[data-info]').removeClass('open');
					$(node).addClass('open');
				}
			});
		};

		
	};

	var _onloadBehaviour = function() {
		// Get first Item Event ID
		var eventItems = [];

		settings.activeDate = $(settings.masterSlider).find('.owl-stage .owl-item').first().find('.event-date');

		$(settings.masterSlider).find('.owl-stage .owl-item').first().find('[data-event-id]').each(function(index, el) {
			eventItems.push($(el).data('event-id'));
		});

		// Sets class for Visual updates
		$(settings.activeDate).addClass('eventopen');
		
		//IF Events are empty
		if (eventItems.length === 0) {
			$('.whats-on__slider').remove();
			$('.whats-on').append(
				'<div class="noevent">'+
//					'<p>Sorry, We haven&#39;t got any events scheduled.</p>'+
//
					'<p>Unfortunately until our doors reopen, we have no upcoming events to show you. Apologies amigos, but please do keep checking back for any updates. Believe us when we say, we\'re as keen to get the fiesta started as you are!</p>'+
				'</div>'
			);
			$('.single-bar__whatson').removeClass('loading');
		} else {
			// Fetches first dates events
			_getEvents(eventItems);
		}

	};

	var _initSlider = function() {
		$(".whats-on__slider__container").addClass('owl-carousel');

		if ($('.whats-on__slider__container .event-date').length > 4) {
			max_items = 5;
			// loop = true;
		} else {
			max_items = $('.whats-on__slider__container .event-date').length;
			// loop = false;
		}

		var changetrigger = false;

		var whatson_slider = $(".whats-on__slider__container").owlCarousel({
			items: 1,
			loop: false,
			dots: false,
			rewind: false,
			margin: 0,
			responsive:{
				885:{
					items: 3,
				},
				1250:{
					items: 5,
				},
				1900:{
					items: max_items,
				}
			},
			onInitialized: initializedSlides,
			onTranslated: afterSlideChange,
			onResized: afterSlideChange,
		}).on('dragged.owl.carousel', function(event) {
		    changetrigger = true;
		});
		function initializedSlides(event) {
			var element   = event.target;      
			var firstItem = $(element).find('.owl-item').first();
		    var lastItem = $(element).find('.owl-item').last();

			if ( $(lastItem).hasClass('active')) {
                $(element).parent().find('.whats-on__next').fadeOut();
            }
			if ( $(firstItem).hasClass('active') ) {
				$(element).parent().find('.whats-on__prev').fadeOut();            	
            }  

		};
		function afterSlideChange(event) {
		    var element   = event.target;      
		    var firstItem = $(element).find('.owl-item').first();
		    var lastItem = $(element).find('.owl-item').last();

		    if ( $(lastItem).hasClass('active')) {
                $(element).parent().find('.whats-on__next').fadeOut();
            } else {
				$(element).parent().find('.whats-on__next').fadeIn();
            }

            if ( $(firstItem).hasClass('active') ) {
				$(element).parent().find('.whats-on__prev').fadeOut();            	
            } else {
				$(element).parent().find('.whats-on__prev').fadeIn();
            }


            // Settings for fetching new events from active carousel item
            settings.activeDate = $(settings.masterSlider).find('.owl-stage .owl-item').eq(event.item.index).find('.event-date');
            $(settings.masterSlider).find('.event-date').removeClass('eventopen');
			$(settings.activeDate).addClass('eventopen');

			if (changetrigger) {
				var eventItems = [];

				$(settings.activeDate).find('[data-event-id]').each(function(index, el) {
					eventItems.push($(el).data('event-id'));
				});
				_getEvents(eventItems);
			}
			changetrigger = false;

		};

		$('.whats-on__prev').on('click', function(event) {
			event.preventDefault();
			changetrigger = true;
			whatson_slider.trigger('prev.owl.carousel');
		});

		$('.whats-on__next').on('click', function(event) {
			event.preventDefault();
			changetrigger = true;
			whatson_slider.trigger('next.owl.carousel');
		});
	};

	var _populate = function() {
		var self = {};
		_.extend(self, APP.Mediator);

		self.query("barEvents", BarPageAPIID, "daily").then(function(events) {
			$.each(events, function(index, val) {
				var date = moment(val.date).format("DD");
				var day = moment(val.date).format("dddd");
				var month = moment(val.date).format("MMM");
				var eventList = [];

				$.each(this.events, function(index, val) {
					storedEvents.push(this);
					eventList.push('<div class="event-date__info__event" data-event-id="'+ this.id +'"></div>');
				});

				var eventCount = eventList.length;

				var countplural = '';
				if (eventCount != 1) {
					countplural = 's';
				}

				eventList = eventList.join('');



				$('.whats-on__slider__container').append(
					'<div class="event-date" data-item="'+ index +'">'+
						'<div class="event-date__date"><div class="event-date__day_month">'+ date +'<span>'+ month +'</span></div>'+
						'<div class="event-date__count">'+ eventCount +'<span>event'+ countplural +'</span></div>'+
						'</div>'+
						'<div class="event-date__info">'+
							'<div class="event-date__info__day">'+ day +'</div>'+
							eventList +
						'</div>'+
					'</div>'
				);
			});

			// $('.whats-on__slider__container').append(
			// 	'<div class="event-date blank"></div><div class="event-date blank"></div>'
			// );

			_initSlider();
			_clickBehaviour();
			_onloadBehaviour();
		});
	};

	return {
		init: init,
	};
})(jQuery);

jQuery(document).ready(function($) {
	if ($('.whats-on .whats-on__items').length && typeof BarPageAPIID !== 'undefined') {
		whatson.init();
	}
});

var hero = (function($) {
	var init = function() {
		_initSlider();
	};

	var _initSlider = function() {
		$(".js-hero-slider").addClass('owl-carousel');
		var hero_slider = $(".js-hero-slider").owlCarousel({
			center: true,
			items: 1,
			loop: true,
			margin: 0,
			stagePadding: 0,
		});

		$('.hero__slide__content__controls__arrow--prev').on('click', function() {
			hero_slider.trigger('prev.owl.carousel');
		});

		$('.hero__slide__content__controls__arrow--next').on('click', function() {
			hero_slider.trigger('next.owl.carousel');
		});
		hero_slider.on('changed.owl.carousel',function(event){
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


	var _initSpecialHero = function() {	
		
		var slides = [];
		var specialCarousel =  $('.hero--special');

		$(window).on('resize.hero--special', function()
		{
			var max = 0;
			$('.hero--special .hero__slide__content-container').each(function()
			{
				max = Math.max(max, $(this).height());
			});
			$('.hero--special .hero__slide__content .container').height(max);
		});
		$(window).trigger('resize.hero--special');


		$('.hero--special .hero__slide').each(function(i){
			var $block = $(this);
			i = i - 1;
			// api

			// screen
			var screen = {
				index: i + 1,
				target: 'slide-' + (i + 1),
				$block: $block,
			};
			// save screen
			slides.push(screen);

		});


		var currentTarget = slides[0];
		var slideTotal = slides.length;


		$('.hero__slide__content__controls__arrow').on('click', function(e) {

			var target = '';
			if ($(specialCarousel).hasClass('anim-in-progress')) {
				return false;
			}

			e.preventDefault();
			if ($(this).hasClass('hero__slide__content__controls__arrow--prev')) {
				target = currentTarget.index - 1;
				oldSlide = currentTarget;
				back = true;

				// console.log(currentTarget);
				// console.log(target);
				// console.log(slides[target]);

				if (target < 0) {
					currentTarget = slides[slideTotal - 1];
					// console.log('you got to the start');
				} else {
					currentTarget = slides[target];
				}
				var slidecolor = $(currentTarget.$block[0]).data('slide-color');
				$(specialCarousel).attr('data-activecolor', slidecolor);

				transistionBackAnim(oldSlide, currentTarget, slides, back);

			} else if ($(this).hasClass('hero__slide__content__controls__arrow--next')) {
				target = currentTarget.index + 1;
				oldSlide = currentTarget;
				back = false;

				// console.log(currentTarget);
				// console.log(target);
				// console.log(slides[target]);

				if (target >= slideTotal) {
					currentTarget = slides[0];
					// console.log('you got to the end');
				} else {
					currentTarget = slides[target];
				}
				var slidecolor = $(currentTarget.$block[0]).data('slide-color');
				$(specialCarousel).attr('data-activecolor', slidecolor);
				
				transistionBackAnim(oldSlide, currentTarget, slides, back);
			}
			
		});
		
	};

	var transistionBackAnim = function(oldSlide, newSlide, slides, back) {

		// Elements
		var oldslidecontent = {
				slide: $(oldSlide.$block[0]),
				strip: $(oldSlide.$block[0]).find('.hero--special__strip'),
				image: $(oldSlide.$block[0]).find('.hero__slide__image-clip'),
				contentContainer: $(oldSlide.$block[0]).find('.hero__slide__content'),
				contentTitleFlair: $(oldSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__title span'),
				contentTitle: $(oldSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__title'),
				contentCopy: $(oldSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__content'),
				contentButton: $(oldSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__button'),
				controls: $(oldSlide.$block[0]).find('.hero__slide__content-container .hero__slide__controls'),
				controlsInnerArrows: $(oldSlide.$block[0]).find('.hero__slide__content-container .hero__slide__controls .hero__slide__content__controls__arrow'),				
			},
			newslidecontent = {
				slide: $(newSlide.$block[0]),
				strip: $(newSlide.$block[0]).find('.hero--special__strip'),
				image: $(newSlide.$block[0]).find('.hero__slide__image-clip'),
				contentContainer: $(newSlide.$block[0]).find('.hero__slide__content'),
				contentContainerContainer: $(newSlide.$block[0]).find('.hero__slide__content-container'),
				imageContainer: $(newSlide.$block[0]).find('.hero__slide__image-container'),
				contentTitleFlair: $(newSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__title span'),
				contentTitle: $(newSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__title'),
				contentCopy: $(newSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__content'),
				contentButton: $(newSlide.$block[0]).find('.hero__slide__content-container .hero__slide__content__button'),
				controls: $(newSlide.$block[0]).find('.hero__slide__content-container .hero__slide__controls'),
				controlsInnerArrows: $(newSlide.$block[0]).find('.hero__slide__content-container .hero__slide__controls .hero__slide__content__controls__arrow'),
			},
			commonslidecontent  = {
				strip: $('.hero--special .hero__slide .hero--special__strip'),
				firstSlideStrip: $('.hero--special').eq(0).find('.hero--special__strip')
			};


		var oldslidecontentItems = [oldslidecontent.controls, oldslidecontent.contentButton, oldslidecontent.contentCopy, oldslidecontent.contentTitle, oldslidecontent.contentTitleFlair];
		var newslidecontentItems = [newslidecontent.contentTitleFlair, newslidecontent.contentTitle, newslidecontent.contentCopy, newslidecontent.contentButton, newslidecontent.controls];

		var backStripValues = null;
		var backStripFinishValues = null;

		if (back) {
			backStripValues = {
				zIndex: 5,
				right: 0,
				left: 'auto',
				skew: '-25deg',
				x: '60%'
			}
			backStripFinishValues = {
				width: '100%',
				ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1")
			}
		} else {
			backStripValues = {
				zIndex: 5,
			}
			backStripFinishValues = {
				width: '100%',
				ease:  CustomEase.create("custom", "M0,0 C0.366,0.03 0.262,0.628 1,1")
			}
		}

		var transistionBackTL = new TimelineLite({
			onStart: addProgressClass,
			onStartParams: [oldslidecontent.slide, newslidecontent.slide],
			onComplete: removeProgressClass,
			onCompleteParams: [oldslidecontent.slide, newslidecontent.slide],
		});

		transistionBackTL.set(commonslidecontent.firstSlideStrip, {
			clearProps:'right, left, transform',
		}).set(oldslidecontent.slide, {
			position: 'absolute'
		}).set(newslidecontent.slide, {
			position: 'relative'
		}).set(newslidecontent.image, {
			height: '100%',
			y: '40',
			opacity: 0,
			zIndex: 7,
		}).set(commonslidecontent.strip, {
			zIndex: 4,
		}).set(newslidecontent.strip, backStripValues).set(oldslidecontent.contentContainer, {
			zIndex: 6,
			position: 'relative',
		}).staggerTo(oldslidecontentItems, 0.2, {
			x: '-40',
			zIndex: 1,
			opacity: 0
		}, 0.05).set(oldslidecontent.controlsInnerArrows, {
			marginTop: '50'
		}).to(oldslidecontent.image, .5, {
			y: '25',
			opacity: 0,
			zIndex: 5,
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		}, .2).set(newslidecontent.imageContainer, {
			zIndex: 6,
		}).set(newslidecontent.contentContainer, {
			zIndex: 7,
		}).set(newslidecontent.controlsInnerArrows, {
			marginTop: '51'
		}).staggerTo(newslidecontentItems, 0.5, {
			x: '0',
			zIndex: 8,
			opacity: 1
		}, 0.2, .7).set(newslidecontent.contentContainerContainer, {
			zIndex: 8,
		}).to(newslidecontent.image, .5, {
			y: '0',
			opacity: 1,
			zIndex: 7,
			boxShadow:"0px 20px 25px -15px rgba(0,0,0,0.4)",
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		},"-=1").to(newslidecontent.strip, 1, backStripFinishValues,"-=0.8").set(oldslidecontent.strip, {
			width: '0%',
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1")
		},"+=0.2");

	};

	var addProgressClass = function(oldSlide, newSlide) {
		var specialCarousel =  $('.hero--special');
		$(specialCarousel).addClass('anim-in-progress');
		$(oldSlide).addClass('out-going').removeClass('active');
		$(newSlide).addClass('in-coming').addClass('active');
	};
	var removeProgressClass = function(oldSlide, newSlide) {
		var specialCarousel =  $('.hero--special');
		$(specialCarousel).removeClass('anim-in-progress');
		$(oldSlide).removeClass('out-going');
		$(newSlide).removeClass('in-coming');
	};

	return {
		init: init,
		initSpecialHero: _initSpecialHero
	};
})(jQuery);

jQuery(document).ready(function($) {
	if ($('.js-hero-slider .hero__slide').length > 1) {
		hero.init();
	}
});

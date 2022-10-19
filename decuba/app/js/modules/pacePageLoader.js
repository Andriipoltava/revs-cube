var pageLoader = (function($) {
	'use strict';
 
	var _genericPageLoaded = function() {
		
	};

	var _heroSpecialIntroAnimation = function() {

		var specialCarousel =  $('.hero--special');
		// Elements
		var elements = {
				strip: $('.hero--special .hero__slide.active .hero--special__strip'),
				image: $('.hero--special .hero__slide.active .hero__slide__image-clip'),
				contentContainer: $('.hero--special .hero__slide.active  .hero__slide__content'),
				contentTitleFlair: $('.hero--special .hero__slide.active .hero__slide__content-container .hero__slide__content__title span'),
				contentTitle: $('.hero--special .hero__slide.active .hero__slide__content-container .hero__slide__content__title'),
				contentCopy: $('.hero--special .hero__slide.active .hero__slide__content-container .hero__slide__content__content'),
				contentButton: $('.hero--special .hero__slide.active .hero__slide__content-container .hero__slide__content__button'),
				controls: $('.hero--special .hero__slide.active .hero__slide__content-container .hero__slide__controls'),
				sliderArrowPrev: $('.hero--special .hero__slide__content__controls__arrow--prev'),
				sliderArrowNext: $('.hero--special .hero__slide__content__controls__arrow--next'),
			},
			commonslidecontent  = {
				strip: $('.hero--special .hero__slide .hero--special__strip'),
				firstSlideStrip: $('.hero--special').eq(0).find('.hero--special__strip')
			};



		var contentItems = [elements.contentTitleFlair, elements.contentTitle, elements.contentCopy, elements.contentButton, elements.controls];
		var heroIntroIn = new TimelineLite({
			onStart: addProgressClass,
			onComplete: removeProgressClass,
		});

		heroIntroIn.set(elements.contentContainer, {
			zIndex: 6,
			position: 'relative',
		}).to(elements.image, .8, {
			height: '100%',
			zIndex: 6,
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		},"-=0.7").to(elements.image, .4, {
			boxShadow:"0px 20px 25px -15px rgba(0,0,0,0.4)",
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		},"-=0.4").to(elements.contentTitleFlair, .3, {
			opacity: 1,
			zIndex: 7,
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		},"-=0.4").staggerTo(contentItems, 1, {
			x: 0,
			zIndex: 8,
			opacity: 1
		}, 0.2, 0.5).to([elements.sliderArrowPrev, elements.sliderArrowNext], .3, {
			marginTop: '51',
			y: 0,
			opacity: 1,
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		},1.2).to([elements.sliderArrowPrev, elements.sliderArrowNext], .2, {
			boxShadow:"0px 20px 50px -10px rgba(0,0,0,0.4)",
			ease: CustomEase.create("custom", "M0,0 C0.19,1 0.22,1 1,1"),
		},"-=0.3");

		if ($('.hero--special').length > 0) {
			hero.initSpecialHero();
		}

	};

	var addProgressClass = function() {
		var specialCarousel =  $('.hero--special');
		$(specialCarousel).addClass('anim-in-progress')
	};
	var removeProgressClass = function() {
		var specialCarousel =  $('.hero--special');
		$(specialCarousel).removeClass('anim-in-progress')
	};
	
	function init() {
		_genericPageLoaded();
	}

	return {
		init:init,
		heroSpecialIntroAnimation:_heroSpecialIntroAnimation
	};
}(jQuery));

Pace.on('done', function(e) {
	pageLoader.init();
	pageLoader.heroSpecialIntroAnimation();
});
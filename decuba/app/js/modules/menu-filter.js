var menufilter = (function($) {
	'use strict';

	var _dropdown = function() {
		$('.menu-filter__tab').on('click', function() {
			$(this).parents('.menu-filter').toggleClass('active');
			$(this).toggleClass('active');
			$(this).siblings('.menu-filter__options').toggleClass('active');
		});
	};

	var closeFilters = function(target) {
		$(target).parents('.menu-filter').removeClass('active');
		$(target).removeClass('active');
		$(target).siblings('.menu-filter__options').removeClass('active');
	};
	var _filters = function() {
		$('.menu-filter__reset').on('click', function(e) {
			e.preventDefault();
			$(this).closest('[data-menu-container]').find("input[type='checkbox']").prop('checked', false);
			$(this).closest('[data-menu-container]').find('.product-menu-item').removeClass('fade');
			$('.product-menu .menu-block').show();
			if ($(window).width() > 990 ) {
				$('[data-menu-container].open .product-menu__container').packery();
			}
			menufilter.closeFilters($(this).closest('.menu-filter').find('.menu-filter__tab'));
		});
	};

	function init() {
		_dropdown();
		_filters();
	}

	return {
		init:init,
		closeFilters: closeFilters
	};
}(jQuery));
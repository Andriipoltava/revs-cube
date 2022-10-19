var productMenu = (function($) {
	'use strict';

	var _filter = function() {
		$('select', '.product-menu__container').selectric().on('change', function() {
			if ($(this).val() === 'all') {
				$('.product-menu-item').show();
				$('.menu-block').show();
				$('.menu-block__subheader').show();
			} else {
				$('.menu-block').show();
				$('.menu-block__subheader').show();

				$('.product-menu-item').hide();
				$('.product-menu-item[data-'+ $(this).val() +']').show();

				$('.menu-block').each(function(index, el) {
					if ($(this).find('.product-menu-item:visible').length === 0) {
						$(this).hide();
					} else {
						$(this).show();
					}
				});

				$('.menu-block__subheader').each(function(index, el) {
					if ($(this).next('.menu-block__items').find('.product-menu-item:visible').length === 0){
						$(this).hide();
					} else {
						$(this).show();
					}
				});
			}
		});
	};

	function init() {
		_filter();
		
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	if ($('.product-menu__container').length) {
		productMenu.init();
	}
});


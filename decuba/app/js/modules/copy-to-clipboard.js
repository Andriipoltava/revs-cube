var clopyToClip = (function() {
	'use strict';

	function copyTextToClipboard(text, el) {
		var textArea = document.createElement("textarea");

		textArea.style.position = 'fixed';
		textArea.style.top = 0;
		textArea.style.left = 0;
		textArea.style.width = '2em';
		textArea.style.height = '2em';
		textArea.style.padding = 0;
		textArea.style.border = 'none';
		textArea.style.outline = 'none';
		textArea.style.boxShadow = 'none';
		textArea.style.background = 'transparent';

		textArea.value = text;

		document.body.appendChild(textArea);

		textArea.select();

		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';

			if (successful) {
				$(el).find('.tooltip').addClass('active').find('.tooltip__inner').html('Link copied to clipboard');
			} else {
				$(el).find('.tooltip').addClass('active').find('.tooltip__inner').html('Sorry, your browser does not support autocopy');
			}

			$(el).hover(function() {}, function() {
				$('.tooltip').removeClass('active');
			});

			setTimeout(function() {
				$('.tooltip').removeClass('active');
			}, 3000);
		} catch (err) {
			$(el).find('.tooltip').addClass('active').find('.tooltip__inner').html('Oops, unable to copy');

			$(el).hover(function() {}, function() {
				$('.tooltip').removeClass('active');
			});

			setTimeout(function() {
				$('.tooltip').removeClass('active');
			}, 3000);
		}

		document.body.removeChild(textArea);
	}

	function init() {
		$('body').on('click', '.js-copy' ,function(event) {
			event.preventDefault();
			var self = this;
			if (window.location.pathname === '/book/' || $(this).hasClass('useHREF') ) {

				var CopyText = $(self).find('.tooltip').attr('href');

				copyTextToClipboard(CopyText, self);
			} else {
				copyTextToClipboard(window.location.href, self);
			}
		});
	}

	return {
		init:init
	};
}());

jQuery(document).ready(function($) {
	clopyToClip.init();
});
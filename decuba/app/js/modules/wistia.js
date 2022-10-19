var wistia = (function($) {

	var _closeModal = function($this) {

	};

	var _modal = function(id) {
		var $player = $('#player').eq(0);
		var modalHTML = '<div id="wistia_' + id + '"' + ' class="wistia_embed">&nbsp;</div>';

		$player.addClass('player-wistia').append(modalHTML);

		var wistiaEmbed = Wistia.embed(id, {
		    autoPlay: true,
		    controlsVisibleOnLoad: true,
		    volumeControl: false,
		    playbar: true,
		    fullscreenButton: false,
		    smallPlayButton: true,
		    videoFoam: true,
		});

		wistiaEmbed.bind("end", function () {
			_closeModal();
		});
	};

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
	};

	function init() {
		$('[data-wistiaid]').on('click', function(event) {
			event.preventDefault();
			var thisID = $(this).data('wistiaid');

			$('body').addClass('disable-scroll');
			$('.video-modal, .button--menu').addClass('active');

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
				$('#player').removeClass('player-wistia').empty();

				_removeClass().done(function(){
					_removeEl();
					DECUBA.modalopen = false;
				});

				$('.js-locations-toggle').removeClass('active');
				$('body').removeClass('disable-scroll');
				$('.video-modal, .button--menu, .masthead').removeClass('active');

				$(this).unbind('click');
				menu.init();
			});

			_modal(thisID);
		}).circlespread({
			background: '#FFAE2D'
		});
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	wistia.init();
});

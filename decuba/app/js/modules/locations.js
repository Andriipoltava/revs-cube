var locations = (function($) {
	var self = this;

	var init = function() {

		_setBarLinks();
		_bind();
		

		$('.locations__options__option--find-me').on('click', function(event) 
		{
			event.preventDefault();

			var $this = $(this);
			var locPromise = _getNearestLocation();
			locPromise.then(function(position)
			{
				_topNearest(position);
				_locationsLoaded();
			})
			.catch(function(error)
			{
				var errors = {
					1: 'The browser refused access to your geolocation. You can reset this choice in your browser\'s settings.',
					2: 'We can not detect your location at this time.',
					3: 'The connection timed out.'
				};

				// If a PositionError object was passed
				if(_.isInteger(error.code)) { error = errors[error.code]; }

				// Replace the button
				$this.replaceWith("<div class='locations__options__option locations__options__option--geo-error'>" + error + "</div>")
				_locationsLoaded();
			});
		});
	};

	var _topNearest = function(position) {

		// Use's the Geo API to list top 5 closet bars for the user to select.

		var pageURL = window.location;
		// console.log(pageURL);
		var menuRedirect = '';
		if (pageURL.pathname === '/menus/' || pageURL.pathname.indexOf('/menus/') > -1) {
			menuRedirect = '&menus=true';
		} else if (pageURL.pathname === '/christmas/' || pageURL.pathname.indexOf('/christmas/') > -1) {
			menuRedirect = '&christmas=true';
		}

		window.location = pageURL.origin + '/locations/' + '?lat=' + position.coords.latitude + '&lng=' + position.coords.longitude + menuRedirect;

	};

	var _bind = function() {
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

		$('.js-locations-toggle').click(function (event) {
			event.preventDefault();

			$(this).addClass('active');
			$('body').addClass('disable-scroll');
			$('.locations, .button--menu').addClass('active');

			if ($('.masthead').hasClass('active')) {
				setTimeout(function() {
					$('.masthead').removeClass('active');
				}, 600);
			} else {
				$('.masthead').addClass('active');
			}

			$('.button--menu .burger').addClass('pink');

			$('.button--menu').unbind('click');

			$('.button--menu').on('click', function(event) {
				event.preventDefault();

				_removeClass().done(function(){
					_removeEl();
					DECUBA.modalopen = false;
				});

				$('.js-locations-toggle').removeClass('active');
				$('body').removeClass('disable-scroll');
				$('.locations, .button--menu, .masthead').removeClass('active');
				$('.button--menu .burger').removeClass('pink');

				$(this).unbind('click');
				menu.init();
			});

			setTimeout(function() {
				$('.js-location-search').focus();
			}, 2000);
		}).circlespread({
			background: '#252632'
		});

		$('body').on('click', '.js-save-location', function(event) {
			event.preventDefault();

			_locationsLoader();

			var cms_id    = $(this).data('cms-id');
			var api_id    = $(this).data('api-id');
			var name     = $(this).data('name');
			var link     = $(this).data('url');

			var data = {
				'cms_id': cms_id, 
				'api_id': api_id,
				'name': name, 
				'link': link,
				'version': CookieVersion
			};

			Cookies.set('savedLocation', JSON.stringify(data), {expires: 150});

			window.location = $(this).attr('href');
		});
	};

	var _locationsLoader = function() {
		$('[data-modal="locations"] .locations__options').addClass('loading');
	};

	var _locationsLoaded = function() {
		$('[data-modal="locations"] .locations__options').removeClass('loading');
	};

	var _setBarLinks = function() {

		var deferred = Q.defer();
		// If Coming from Global Menu page redirect to Local Menu page
		var pageURL = window.location;
		// console.log(pageURL);
		var menuRedirect = '';
		if (pageURL.pathname === '/menus/' || pageURL.pathname.indexOf('/menus/') > -1) {
			menuRedirect = 'menus/';
		} 
		else if (pageURL.pathname === '/christmas/' || pageURL.pathname.indexOf('/christmas/') > -1) {
			menuRedirect = 'christmas/';
		}
		else if (pageURL.pathname === '/christmas-global/' || pageURL.pathname.indexOf('/christmas-global/') > -1) {
			menuRedirect = 'christmas/';
		}
		$('.locations__options__option__venues a').each(function(index, el) {

			// Sets Page Condtional URLS for Chirstmas or Menus
			var saveHref = $(el).attr('href');
			var newHref = (saveHref + menuRedirect);
			$(el).attr('href', newHref);

		});

		$('.locations__options__option__venues a').each(function(index, el) {
		
			var locationID = $(el).data('api-id').toString();

			_.forEach(Bars, function(bar) {
			  	if (bar.api_id === locationID) {
			  		$(el).attr('data-address', bar.address);
			  		$(el).attr('data-phone', bar.phone);
			  	}
			});
			
		});

	};

	var _distance = function(lat1, lon1, lat2, lon2, name, link) {
		var p = 0.017453292519943295;
		var a = 0.5 - Math.cos((lat2 - lat1) * p)/2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))/2;

		var resultKM = 12742 * Math.asin(Math.sqrt(a));

		return resultKM;
	};

	var _getNearestLocation = function() {
		var deferred = Q.defer();

		_locationsLoader();

		if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition( function(position) {
				deferred.resolve(position);
			}, 
			function(error) {
				deferred.reject(error);
			}, { enableHighAccuracy: true });
		} 
		else 
		{
			deferred.reject('Your browser does not support geolocation.');
		}

		return deferred.promise;
	};

	return {
		init: init
	};

})(jQuery);

jQuery(document).ready(function($) {
	locations.init();
});


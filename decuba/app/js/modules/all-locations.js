var allLocations = (function($) {
	'use strict';

	var urlQuery = window.location.search;
	var self = {};
	_.extend(self, APP.Mediator);

	var bar_data = {};

	var _openingTimes = function(times, $el) {
		var size = Object.keys(times).length;

		var days = [];

		for(var i = 0; i < size; i++) {
			if (times[i].open) {
				days[i] = moment(times[i].open, 'HH:mm').format("ha") + ' - ' + moment(times[i].close, 'HH:mm').format("ha");
			} else {
				days[i] = null;
			}
		}

		var start = [];
		var startIndex = [];
		var end = [];

		for (var j = 0; j < days.length; j++) {
			if (days[j] && days[j] !== days[j - 1]) {
				start.push(moment(j, 'e').format('ddd'));
				startIndex.push(days[j]);

				if (j - 1 > 0) {
					end.push(moment(j - 1 , 'e').format('ddd'));
				}
			} else if (j === days.length - 1) {
				end.push(moment(j , 'e').format('ddd'));
			}
		}

		var full_string = [];

		for (var k = 0; k < start.length; k++) {
			var final_days;

			if (start[k] == end[k] || !end[k]) {
				final_days = start[k];
			} else {
				final_days = start[k] + ' - ' + end[k];
			}

			$el.append('<p><span class="days">'+ final_days +'</span><span class="hours">'+ startIndex[k] +'</span></p>');
		}
	};

	var _setInfo = function(content, target) {

		$(target).append(content);
	};

	var _distance = function(lat1, lon1, lat2, lon2, name, link) {
		var p = 0.017453292519943295;
		var a = 0.5 - Math.cos((lat2 - lat1) * p)/2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))/2;

		var resultKM = 12742 * Math.asin(Math.sqrt(a));

		return resultKM;
	};

	var _setClosestLocations = function() {

		function getParameterByName(name, url) {
		    if (!url) url = window.location.href;
		    name = name.replace(/[\[\]]/g, "\\$&");
		    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		        results = regex.exec(url);
		    if (!results) return null;
		    if (!results[2]) return '';
		    return decodeURIComponent(results[2].replace(/\+/g, " "));
		}

		var deferred = Q.defer();
				
		var barByDistance = [];
		var menuRedirect = '';

		if (urlQuery) {
			// Add Menu or Christmas Redirects if users come from either pages.
			if (urlQuery.indexOf("menus=true") != -1) {
				menuRedirect = 'menus/';
			} else if (urlQuery.indexOf("christmas=true") != -1 ) {
				menuRedirect = 'christmas/';
			}

			if (urlQuery.match("lat=").length > 0 && urlQuery.match("lng=").length > 0) {
				
				var user_lat = getParameterByName('lat');
				var user_lng = getParameterByName('lng');

				$.each(Bars, function(index, val) {
					Bars[index].barDistance = parseInt((_distance(user_lat, user_lng, val.lat, val.lng)).toFixed(0));
				});					 
			}
		}

		var newData = _.orderBy(Bars, 'barDistance', 'asc');
		var reducedNewData = newData.slice(0, 5);

		$.each(reducedNewData, function(index, val) {

			// Fetch bar Image
			var barImage = '';
			var barLink = '';

			$('.all-locations__container').append(
				'<a href="' + val.link+menuRedirect + '" class="locations_card js-set-location-to-cookie" data-index="index" data-cms-id="' + val.id + '" data-api-id="' + val.api_id + '" data-url="/bar/' + val.slug + '" data-name="' + val.bar_name + '">' + 
					'<div class="locations_card__inner">' +
						'<div class="locations_card__image">' +
							'<img src="' + barImage + '" alt="" />' +
						'</div>' +
						'<div class="locations_card__info"> ' +
							'<h4>'+ val.bar_name +'</h4>' +
							'<p class="locations_card__address">' + val.address + ' ' + val.postcode + '</p>' +
							'<p class="locations_card__phone">' + val.phone + '</p>' +
							'<p class="locations_card__distance"><i class="icon-pin"></i><span>' + val.barDistance + '</span> miles away</p>' +
						'</div>' +
						'<div class="locations_card__link">' +
							'<div class="button button--text"><span class="icon-arrow-right"></span></div>' +
						'</div>' +
					'</div>' +
				'</a>'
			);

		});

		$('.js-set-location-to-cookie').on('click', function(e) {
			e.preventDefault();

			var cms_id   = $(this).data('cms-id');
			var api_id   = $(this).data('api-id');
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

	var _getAllLocationsInfo = function() {
		var deferred = Q.defer();
				
		$('.locations_card').each(function(index, el) {
		
			var locationID = $(el).data('api-id').toString();
			var address = $(el).find('.locations_card__address');
			var phone = $(el).find('.locations_card__phone');
			var distance = $(el).find('.locations_card__distance span');

			_.forEach(Bars, function(bar) {
			  	if (bar.api_id == locationID) {
			  		_setInfo(bar.address + ' ' + bar.postcode, address);
			  		_setInfo(bar.phone, phone);
			  	}
			});

		});
		
	};

	function init() {
		if (urlQuery) {
			_setClosestLocations();
		} else {
			_getAllLocationsInfo();
		}
	}

	return {
		init: init
	};

})(jQuery);

jQuery(document).ready(function($) {
	if ($('.all-locations__container').length) {
		allLocations.init();
	}
});


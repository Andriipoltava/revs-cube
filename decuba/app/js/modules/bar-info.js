var barInfo = (function() {
	'use strict';

	var self = {};
	_.extend(self, APP.Mediator);

	var thisBar;

	var letterNumber = /^[0-9a-zA-Z]+$/;  

	var _address = function(address) {
		address = address.trim();
		address = address.split(',');

		for (var i = 0; i <= address.length; i++) {
			if (address[i]) {
				address[i] = '<p>'+address[i]+'</p>';
			} else {
				address.splice(i, 1);
			}
		}

		address = address.join("");

		$('.sidebar--location__address').empty().append(address);
		// updates min-height to maintain good layout
		setTimeout(function() {
			gallery.sidebarSetHeight();
		}, 50);
		
	};

	var _phone = function(phone) {
		var phoneStripped = phone.replace(/\s/g, '');
		$('.sidebar--location__phone').empty().append('<p><a href="tel:'+phoneStripped+'">'+phone+'</a></p>');

		$('.hero__info__button--small.phone').attr('href', 'tel:'+phone);
	};

	var _location = function(name, lat, lng) {
		var link = 	'<a href="https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng + '" target="_blank">'+
						'<span class="icon-pin pin"></span><span class="text">Find us on Google maps</span>'+
					'</a>';

		$('.sidebar--location__pin').empty().append(link);
		$('.hero__info__button--small.pin').attr('href', 'https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng);
	};

	var _deliveroo = function(storePage) {
		if (!storePage) {
			return;
		}
		
		var link = 	'<a href="' + storePage + '" target="_blank">'+
						'<span class="icon-deliveroo-logo-white-outline deliveroo"></span><span class="text">Now on Deliveroo!</span>'+
					'</a>';

		$('.sidebar--location__deliveroo').empty().append(link);
		$('.hero__info__button--small.deliveroo').attr('href', storePage);
	};

	var _today = function(times) {
		/**********
			NEEDS LOOKING AT:

			Line 45 - Need to replace the 3 with a variable containing the correct hour.
		**********/

		var hour = new Date();
			hour.setHours(hour.getHours() - 3);

		var today = moment(hour).isoWeekday();

		var close_today = times[today].close;
			close_today = moment(close_today, 'HH:mm').format("hA");

		$('.sidebar--location__times__today').empty().append('<p>OPEN TODAY UNTIL '+ close_today +'</p>');
	};

	var _openingTimes = function(times, $el) {
		var size = Object.keys(times).length;

		var days = [];

		/** 
			Loop through times object.
			If there's an opening time, convert the opening and closing times from 24hr format to 12hr with am/pm, and add to days array.
		**/
		for(var i = 0; i < size; i++) {
			if (times[i].open) {
				days[i] = moment(times[i].open, 'HH:mm').format("ha") + ' - ' + moment(times[i].close, 'HH:mm').format("ha");
			} else {
				days[i] = null;
			}
		}

		/** 
			Initialize the days arrays. These will hold the days where the opening / closing times are the same.
		**/
		var start = [];
		var startIndex = [];
		var end = [];

		/** 
			Loop through days array.
			If the opening times of this day different to yesterday, push this day (converted to day name, e.g '0 => Sun') to the start array.
			Add the day the times stop being the same to the end array. 
			If it's the last day. Add it to the end array.
		**/
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

		/** 
			If the start and end days are the same, just take the start day otherwise, add the start and end days to the final_days variable.
			Append the string to the provided $el, add the days that correspond with the opening hours.
		**/
		for (var k = 0; k < start.length; k++) {
			var final_days;

			if (start[k] == end[k] || !end[k]) {
				final_days = start[k];
			} else {
				final_days = start[k] + ' - ' + end[k];
			}

			$el.empty().append('<p><span class="days">'+ final_days +'</span><span class="hours">'+ startIndex[k] +'</span></p>');
		}
	};

	var _ajaxOpentimes = function(id) {
		var deferred = Q.defer();

		$.ajax({
			type: 'GET',
			url: MyAjax.ajaxurl,
			data: {
				action	: 'get_bar_data',
				data_type : 'info',
				api_id 	: id
			},
			success: function(data)
			{ 
				$('.sidebar--location__block2 .sidebar--location__times').empty();

				_.forEach(data.CMS.openingtimes, function(openTime) {
					if (openTime.acf_fc_layout === 'opening_times') {
						$('.sidebar--location__block2 .sidebar--location__times').append('<div class="sidebar--location__times__section sidebar--location__times__section--opening"><p class="title">Opening times:</p></div>');
						_.forEach(openTime.rows, function(row) {
							$('.sidebar--location__block2 .sidebar--location__times .sidebar--location__times__section--opening').append('<p><span class="days">' + row.days +'</span><span class="hours">' + row.hours +'</span></p>');
						});
					} else if (openTime.acf_fc_layout === 'food_serving') {
						$('.sidebar--location__block2 .sidebar--location__times').append('<div class="sidebar--location__times__section  sidebar--location__times__section--food"><p class="title">Food serving times:</p></div>');
						_.forEach(openTime.rows, function(row) {
							$('.sidebar--location__block2 .sidebar--location__times .sidebar--location__times__section--food').append('<p><span class="days">' + row.days +'</span><span class="hours">' + row.hours +'</span></p>');
						});
					} else if (openTime.acf_fc_layout === 'happy_hours') {
						$('.sidebar--location__block2 .sidebar--location__times').append('<div class="sidebar--location__times__section  sidebar--location__times__section--happy"><p class="title">Happy Hours:</p></div>');
						_.forEach(openTime.rows, function(row) {
							$('.sidebar--location__block2 .sidebar--location__times .sidebar--location__times__section--happy').append('<p><span class="days">' + row.days +'</span><span class="hours">' + row.hours +'</span></p>');
						});
					}
				});
				$('.sidebar--book').removeClass('loading');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				deferred.resolve('error');
				$('.sidebar--book').removeClass('loading');
			}
		});

	};

	var _updateUsefulInfo = function(id) {
		$('.sidebar--location__info [data-useful-info]').each(function(index, el) {
			$(el).attr('data-api-id', id);
		});
	};

	var _PP_fallback = function(times) {

		self.query("barInfo", BarPageAPIID).then(function(data) {

			if (data.opening_times) {
				$('.sidebar--location__times__section--opening').append(data.opening_times);
			} else {
				$('.sidebar--location__times__section--opening').remove();
			}

			if (data.food_times) {
				$('.sidebar--location__times__section--food').append(data.food_times);
			} else {
				$('.sidebar--location__times__section--food').remove();
			}


			if (data.happyHourTimes) {
				$('.sidebar--location__times__section--happy').append(data.happyHourTimes);
			} else {
				$('.sidebar--location__times__section--happy').remove();
			}
		});
	};

	var _getInfo = function() {
		
		self.query("barInfo", BarPageAPIID).then(function(data) 
		{
			var address = (data.address + '<br>' + data.postcode);
			_address(address);
			_phone(data.phone);
			_location(data.bar_name, data.latitude, data.longitude);
			_deliveroo(data.deliveroo_page);			

			if ($('.use_PP_fallback').length > 0) {
				_PP_fallback();
			}
			// _today(data.opening_times);

			// _openingTimes(data.opening_times, $('.sidebar--location__times__section--opening'));
			// _openingTimes(data.food_times, $('.sidebar--location__times__section--food'));
			// _openingTimes(data.happy_hours, $('.sidebar--location__times__section--happy'));
		});
	};

	function init() {
		_getInfo();

		$('.js-fixr-toggle').click(function (e) {
			e.preventDefault();
			$('.rdc-fixr-modal').addClass('active');
		});

		$('.rdc-fixr-modal__close').click(function () {
			$('.rdc-fixr-modal').removeClass('active');
		});
	}

	return {
		init:init,
		_address:_address,
		_phone:_phone,
		_location:_location,
		_ajaxOpentimes: _ajaxOpentimes,
		_updateUsefulInfo:_updateUsefulInfo

	};
}());

jQuery(document).ready(function($) {
	if (typeof BarPageAPIID !== 'undefined') {
		barInfo.init();
	}
});
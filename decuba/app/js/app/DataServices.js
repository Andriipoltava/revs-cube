/* globals window, Q, _, APP */

// Class for responding to all data requests.
// Over time we'll move all functionality in legacy/dataservice.js
// over to this pub/sub class. Need to decide if it's still better
// to deal with this as a lazyloaded service though. Primarily only
// utilised by bar / food pages at the moment.

(function() {
	"use strict";

	var _lastBarInfoPromise = undefined;
	var _lastBarInfoAPIID = undefined;

	var _lastBarEventsAPIID = undefined;
	var _lastBarEvents = undefined;
	var _lastBarFeaturedEvents  = undefined;
	var _lastBarUnfeaturedEvents  = undefined;
	var _lastBarEventsPerDay = undefined;

	var _lastBarMenu = undefined;
	var _lastBarMenuAPIID = undefined;

	var _lastBarGalleriesPromise = undefined;
	var _lastBarGalleriesAPIID = undefined;


	APP.DataServices = function()
	{
		// Extend mediator
		var self = this;
		_.extend(this, APP.Mediator);

		// Pass self back
		return this;
	}

	// Initialise
	APP.DataServices.prototype.init = function()
	{
		var self = this;

		self._bindListeners();
	}




	// 'Private' methods ==========================

	APP.DataServices.prototype._bindListeners = function()
	{
		var self = this;

		// Listen for requests to add new elements to the list
		self.respond("closestBar", function()
		{
			var barDefer = Q.defer();

			if (navigator.geolocation)
			{
				navigator.geolocation.getCurrentPosition(function(position)
				{
					var closestBar = self._getClosestBars(position, 1);
					barDefer.resolve(closestBar);
				},
				function(error)
				{
					var errors = {
						1: 'The browser refused access to your geolocation',
						2: 'We can not detect your location at this time',
						3: 'The connection timed out'
					};
					barDefer.reject({
						success: false,
						code: error.code,
						message: errors[error.code]
					});

				}, { enableHighAccuracy: true });
			}
			else
			{
				alert('Sadly your browser doesn\'t support geolocation');
			}


			return barDefer.promise;
		});


		// Listen for requests to get a bar's info
		self.respond("barInfo", function(apiId)
		{
			if(_.isUndefined(_lastBarInfoPromise) || apiId != _lastBarInfoAPIID)
			{
				_lastBarInfoAPIID = apiId;
				_lastBarInfoPromise = Q.defer();
				
				$.ajax({
					type: 'GET',
					url: MyAjax.ajaxurl,
					data: {
						action	: 'get_bar_data',
						data_type : 'info',
						api_id 	: apiId
					},
					success: function(data)
					{ 
						var bar = _.merge(data.data, data.CMS);

						// Clean up
						bar.overview = self._sanitizeAPIData(bar.overview);
						bar.opening_times = self._sanitizeAPIData(bar.opening_times, false);
						bar.dress_code = self._sanitizeAPIData(bar.dress_code);
						bar.music_policy = self._sanitizeAPIData(bar.music_policy);
						bar.disabled_access = self._sanitizeAPIData(bar.disabled_access);
						bar.food_times = self._sanitizeAPIData(bar.food_times, false);

						_lastBarInfoPromise.resolve(bar);
					},
					error: function(msg, url, line) {
						_lastBarInfoPromise.reject({msg: msg, url: url, line: line});
					}
				});
			}
				
			return _lastBarInfoPromise.promise;
		});


		// Listen for requests to get a bar's events
		self.respond("barEvents", function(apiId, returnFormat)
		{
			if(_.isUndefined(returnFormat)) { returnFormat = 'daily'; }

			var barInfoPromise = self.query("barInfo", apiId);
			var barEventsPromise = Q.defer();

			if(apiId !== _lastBarEventsAPIID)
			{
				_lastBarEventsAPIID = apiId;
				barInfoPromise.then(function(bar)
				{
					if(!bar || !bar.events)
					{
						_lastBarEvents = _lastBarFeaturedEvents = _lastBarUnfeaturedEvents = _lastBarEventsPerDay = [];
					}
					else
					{
						self._formatEvents(bar);
					}
				})
				.done();
			}

			barInfoPromise.then(function(bar)
			{
				switch(returnFormat)
				{
					case 'featured':
						barEventsPromise.resolve(_lastBarFeaturedEvents);
						break;

					case 'unfeatured':
						barEventsPromise.resolve(_lastBarUnfeaturedEvents);
						break;

					case 'daily':
						barEventsPromise.resolve(_lastBarEventsPerDay);
						break;

					case 'raw':
					default:
						barEventsPromise.resolve(_lastBarEvents);
						break;
				}
			});

			return barEventsPromise.promise;

		});


		// Listen for requests to get a bar's food menu
		self.respond("barMenu", function(apiId, type, category)
		{
			if(_.isUndefined(type)) { type = 'food'; }
			type = type + '_menu';

			var barInfoPromise = self.query("barInfo", apiId);
			var barMenuPromise = Q.defer();

			if(apiId !== _lastBarMenuAPIID || _.isUndefined(_lastBarMenu) || !_lastBarMenu.hasOwnProperty(type))
			{
				if(apiId !== _lastBarMenuAPIID)
				{
					_lastBarMenuAPIID = apiId;
					_lastBarMenu = {};
					_lastBarMenu[type] = [];
				}

				barInfoPromise.then(function(bar)
				{
					if(!bar || !bar[type])
					{
						_lastBarMenu = undefined;
					}
					else
					{
						self._formatMenu(bar, type);
					}
				})
				.done();
			}

			barInfoPromise.then(function(bar)
			{
				var filteredMenu = _lastBarMenu[type];
				if(_.isString(category) && category !== '')
				{
					filteredMenu = _.filter(filteredMenu, function(section) 
					{ 
						return _.filter(section.categories.data, {'name': category}).length > 0; 
					});
				}
				barMenuPromise.resolve(filteredMenu);
			});

 
			return barMenuPromise.promise;

		});

	}



	// Private methods

	APP.DataServices.prototype._sanitizeAPIData = function(data, useParaOverSingleBreaks)
	{
		if(!_.isString(data)) { return data; }
		if(_.isUndefined(useParaOverSingleBreaks)) { useParaOverSingleBreaks = true; }

		var singleReplace = '</p><p>';
		if(useParaOverSingleBreaks === false) { singleReplace = '<br />'; }

		return "<p>" +
							data.replace(/\\([\/])/gi, '$1') 										// Remove escape characters
									.replace(/^\s+|\s+$/g, '') 											// Trim newlines
									.replace(/(\n\s*)+/gi, singleReplace)						// Convert newlines to html
									.replace(/(<br\s*\/?>\s*){2,}/gi, '</p><p>')		// Break consecutive <br /> tags into paragraphs
						+ "</p>";
	};



	APP.DataServices.prototype._getClosestBars = function(position, returnCount)
	{
		returnCount = typeof returnCount !== "undefined" ?  returnCount : 1;

		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var acr = position.coords.accuracy;
		var barFilter = [];

		function deg2rad(deg) { return deg * (Math.PI/180); }
		function rad2deg(rad) { return rad * (180/Math.PI); }

		_.each(bars, function(bar)
		{
			var thisBar = _.cloneDeep(bar);
			var theta = lng - bar.lng;
			var dist = Math.sin(deg2rad(lat)) * Math.sin(deg2rad(bar.lat)) +  Math.cos(deg2rad(lat)) * Math.cos(deg2rad(bar.lat)) * Math.cos(deg2rad(theta));
		  dist = rad2deg(Math.acos(dist));
			thisBar.miles = dist * 60 * 1.1515;

			barFilter.push(thisBar);
		});

		barFilter = _.sortBy(barFilter, 'miles').slice(0, returnCount);

		return barFilter;
	}



	APP.DataServices.prototype._formatEvents	= function(bar)
	{
		var self = this;
		var start = moment();
		var end = moment().add(4, 'w');

		_lastBarEvents = _.chain(bar.events.data)
			.cloneDeep()
			.forEach(function(ev)
			{
				ev.rawContent = ev.content;
				ev.truncatedContent = self._sanitizeAPIData(ev.content.substring(0,250));
				ev.content = self._sanitizeAPIData(ev.content);
				ev.validDays = [];
				ev.firstDay = null;
				// Book a Table as default
				ev.bookText = ev.booking_link === "2" ? "Book now" : "Book now";
				ev.bookLink = ev.booking_link === "2" ? "/book/" : "/book/";
				ev.twitterShare = "text=Check out what's happening at Revolución de Cuba " + encodeURIComponent(bar.barName) + "&url=" + encodeURIComponent(document.URL);
			})
			.value();

		_lastBarEventsPerDay = [];
		for (var m = start; m.isBefore(end); m.add(1, 'days'))
		{
			var dates = {
		  	"date": 				m.format('YYYY-MM-DD'),
			  "day": 					m.format('DD'),
			  "weekday": 			m.format('dddd'),
			  "shortMonth": 	m.format('MMM'),
			  "month": 				m.format('MMMM'),
			  "year": 				m.format('YYYY'),
			  "shortYear": 		m.format('YY'),
			};

		  var formattedDay = _.extend({
		  	"events" : 			[]
		  }, dates);

		  var innerIndex = 0;
		  _.forEach(_lastBarEvents, function(ev)
		  {
		  	if(
		 			// The event "belongs" with the current day
		 			(
			  		// Weekly event
		 				(ev.type == 3 && ev.day === formattedDay.weekday) ||
			  		// One-off event
		 				(ev.type == 4)
		 			) &&
	  			// Is the current date within the events valid range
		 			(
			  		m.isAfter(ev.start_date) &&
			  		(
		  		 		ev.end_date == "-1" ||
		  		 		ev.end_date == "0000-00-00 00:00:00" ||
		  		 		m.isBefore(ev.end_date)
		  		 	)
		 			)
		  	)
		  	{
			  	ev.validDays.push(dates);
			  	if(_.isNull(ev.firstDay)) ev.firstDay = dates.date;

			  	var evClone = _.cloneDeep(ev);
			  	evClone.index = innerIndex;
			  	innerIndex++;

			  	formattedDay.events.push(evClone);
			  }
		  });

		  _lastBarEventsPerDay.push(formattedDay);
		}

		_lastBarEvents = _.filter(_lastBarEvents, function(ev) { return !_.isEmpty(ev.firstDay); });
		_lastBarEventsPerDay = _.filter(_lastBarEventsPerDay, function(day) { return day.events.length != 0; })


		_lastBarFeaturedEvents = _.filter(_lastBarEvents, {featured: true});
		_lastBarUnfeaturedEvents = _.filter(_lastBarEvents, {featured: false});
	}
 


	APP.DataServices.prototype._formatMenu	= function(bar, type)
	{
		_lastBarMenu[type] = _.cloneDeep(bar[type].data);

		_.forEach(_lastBarMenu[type], function(section)
		{
			section.slug = section.title.toLowerCase().replace(/[^a-zA-Z 0-9]+/g, "");		// Remove special characters
			section.slug = section.slug.replace(/\s/g, "-");		// Replace spaces
			section.slug = section.slug.replace(/(\-){2,}/gi, '-')		// Replace consecutive hyphens with one
			section.slug = section.slug.replace(/^(\-){1,}/gi, '').replace(/(\-){1,}$/gi, '')		// Trim hyphens

			_.forEach(section.options.data, function(option)
			{
				option.slug = option.title.toLowerCase().replace(/[^a-zA-Z 0-9]+/g, "");		// Remove special characters
				option.slug = option.slug.replace(/\s/g, "-");		// Replace spaces
				option.slug = option.slug.replace(/(\-){2,}/gi, '-')		// Replace consecutive hyphens with one
				option.slug = option.slug.replace(/^(\-){1,}/gi, '').replace(/(\-){1,}$/gi, '')		// Trim hyphens
			});
		});
 

		// For debugging ------------
		// _.forEach(_lastBarMenu[type], function(section)
		// {
		// 	console.log(section.slug);

		// 	_.forEach(section.options, function(option)
		// 	{
		// 		console.log("    " + option.slug);
		// 	});
		// });


		return _lastBarMenu[type];
	}


})();

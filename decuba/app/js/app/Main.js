/* globals window, $, Q, _, APP */
(function($) 
{
	"use strict";


	// Cookie management - repeat here as page caching 
	// might mean the PHP equivalent is never hit
	var isLocationSet = false;
	var storedBar =	false;
	var locationData = {};

	if (Cookies.get('savedLocation')) 
	{
		var cookie = JSON.parse(Cookies.get('savedLocation'));
		if(!cookie.hasOwnProperty('version') || cookie.version < CookieVersion)
		{
			Cookies.remove('savedLocation');
		}
		else
		{
			isLocationSet = true;
			locationData = cookie;
			var bar = _.filter(Bars, {'api_id': parseInt(locationData['api_id'])});
			if(bar.length != 0) { storedBar = bar[0]; }
		}
	}


	APP.Main = function()
	{ 
		var self = this;

		_.extend(this, APP.Mediator);


		// Init internal vars
		this.toggleScopes = {};
		self.delayAccumulator = 0;
		self.activeDelays = [];
		self.gformMap = {};



		// Load Utilities ===================
		var util = new APP.Utilities();



		// Create global event listeners ===================
		var ev = new APP.Events();



		// Create breakpoint event listeners ===================
		var _matches = [
			// Mobile
			{name: "mob", 			match: "(max-width: 30em)" },
			// Not Mobile
			{name: "not-mob", 	match: "(min-width: 30.0625em)" },
			// Phablet
			{name: "phab", 			match: "(max-width: 48em)" },
			// Not Phablet
			{name: "not-phab", 	match: "(min-width: 48.0625em)" },
			// Landscape Tablet
			{name: "ltab", 			match: "(min-width: 48.0625em) and (max-width: 64em)" },
			// Tablet (Not Mobile & Not Desktop)
			{name: "tab", 			match: "(min-width: 30.0625em) and (max-width: 64em)" },
			// Portable (Mobile & Tablet, i.e. Not Desktop)
			{name: "port", 			match: "(max-width: 64em)" },
			// Tablet (Not Mobile & Not Desktop)
			{name: "desk", 			match: "(min-width: 64.0625em)" },
		]
		var resp = new APP.Responsive(_matches);



		// Add performance enhancements ===================
		var perf = new APP.Performance();
		perf.init();



		// Add App listeners ==================
		self._addAppListeners();




		// Create local event listeners ===================

		this.subscribe("contentInjected", function($scope)
		{
			self._initPlugins($scope);
			self._addEventListeners($scope);
		});



		// Add data services ==========================
		var dataServices = new APP.DataServices();
		dataServices.init();



		// Finally, perform FTT set-up by simulating an "injection" of the document
		// We queue this so that any other onReady() calls have chance to set-up their
		// own pub/sub listeners before we fire.
		self.publish("queueExecution", function()
		{
			self.publish("contentInjected", $('html'));
		});



		return this;
	};



	// 'Private' vars

	APP.Main.prototype._addAppListeners = function()
	{
		var self = this;


		// Toggle scopes
		self.subscribe("toggleState", function(state, thisScope)
		{
			self.toggleScopes[thisScope].state = state;

			var matches = $("[data-toggle-scope='" + thisScope +"']");
			matches.each(function(i, match)
			{
				var classStates = $(match).data('toggle-state');
				$(match).removeClass(state ? classStates.deactive : classStates.active);
				$(match).addClass(state ? classStates.active : classStates.deactive);
				self.publish("elementClassChanged", $(match));
			});

			self.publish("stateToggled", state, thisScope);
		});



		// Grav Form confirmations =============================

		self.subscribe("contentInjected", function($content)
		{
			var $scripts = $("[data-gform-script]", $content);
			$scripts.each(function()
			{
				var $dummyScript = $(this);
				var $script = $("<script></script>");
				$script.html($dummyScript.html());
				$dummyScript.replaceWith($script);
			});
		});

		// AJAX confirmations
		$(document).bind('gform_confirmation_loaded', function(event, formId)
		{
			// Map formId back to orig as all the below will use the original ID value
			if(self.gformMap.hasOwnProperty(formId)) { formId = self.gformMap[formId]; }

			// Toggle triggers connected to completed forms
			var scopes = [];
			$("[data-gform-complete-toggle-trigger='"+formId+"'][data-toggle-scope]").each(function()
			{
				var thisScope = $(this).data('toggle-scope');
				if(_.findIndex(scopes, thisScope) === -1)
				{
					self.publish("toggleState", true, thisScope);
					scopes.push(thisScope);
				}
			});

			var $target = $("[data-gform-confirmation='" + formId + "']:not([data-gform-injection-processed])");
			self.publish("contentInjected", $target);
			$target.attr('data-gform-injection-processed', 'true');
		});
		
		// Loaded
		$(document).bind('gform_post_render', function(event, formId, pageId)
		{
			// Don't map here as this will use the new form value
			self.publish('contentInjected', $('#gform_wrapper_'+formId))
		});



		// Google Maps
		self.subscribe('loadMap', function($el, lat, lng)
		{
			var location = {
				lat: Number(lat),
				lng: Number(lng),
			};

			var map = new google.maps.Map($el[0], {
				zoom: 18,
				center: location
			});

			var marker = new google.maps.Marker({
				position: location,
				map: map
			});
		});



		// Stored Bar
		self.respond('storedBar', function()
		{
			return storedBar;
		});
	};




	APP.Main.prototype._addEventListeners = function($scope)
	{
		var self = this;


		// Set call scope
		$scope = typeof $scope !== 'undefined' ? $scope : $(document);



		// Cookie Data ================
		$("[data-stored-bar-info]", $scope).each(function(i, element)
		{
			if (!storedBar) { return; }

			var $this = $(this);
			var type = $this.data('stored-bar-info');

			switch(type)
			{
				case 'link': 
					$this.attr('href', storedBar[type] + $this.attr('href'));
					break;

				default: 
					$this.html(storedBar[type]);
					break;
			}
		});


		$("[data-stored-bar-state], [data-no-stored-bar-state]", $scope).each(function(i, element)
		{
			var $this = $(this);
			var dataKey = $this.data('stored-bar-state') ? 'stored-bar-state' : 'no-stored-bar-state';

			// Should we continue processing?
			if(dataKey === 'stored-bar-state' && !storedBar) { return; }
			else if(dataKey === 'no-stored-bar-state' && storedBar) { return; }

			// Any conditions on us processing?
			var condition = $this.data('stored-bar-condition');
			var passed = true;

			// Any conditions? E.g. "subpages|menus" meaning bar has a 'menus' subpage
			if(storedBar && condition)
			{
				condition = condition.split("|");
				if(!storedBar.hasOwnProperty(condition[0])) { return false; }
				var val = storedBar[condition[0]];

				// Convert objects to arrays
				if(_.isObject(val))
				{
					val = _.map(val, function(v){ return v; });
				}

				if(_.isArray(val))
				{
					passed = (_.indexOf(val, condition[1]) != -1);
				}
				else
				{
					passed = (val == condition[1]);
				}
			}

			// Did we pass all tests?
			if(passed)
			{
				$this.addClass($this.data(dataKey));
			}
		});



		// Scoped Toggles ========================

		// Get all new scopes
		$('[data-toggle-scope]', $scope).each(function(i, item)
		{
			var key = $(item).data('toggle-scope');
			if(!self.toggleScopes.hasOwnProperty(key))
			{
				self.toggleScopes[$(item).data('toggle-scope')] = { state : false };
			}
		});


		// For each scope...
		_.each(self.toggleScopes, function(data, thisScope)
		{
			// Init all new elements belonging to a scope
			var matches = $("[data-toggle-scope='" + thisScope +"']", $scope);
			matches.each(function(i, match)
			{
				$(match).data('toggle-state', {'active': '', 'deactive': ''});
				var classes = $(match).data('toggle-class');
				if(classes && classes.length > 0)
				{
					classes = classes.split("|");
					$(match).data('toggle-state').active = classes[0];
					if(classes.length > 1)
					{
						$(match).data('toggle-state').deactive = classes[1];
					}
				}
			});

			// FTT init (incase the state was already toggled in a different $scope)
			// (i.e if state is already true)
			if(self.toggleScopes[thisScope].state)
			{
				self.publish("toggleState", self.toggleScopes[thisScope].state, thisScope);
			}

			// Add events to triggers
			$("[data-toggle-scope='" + thisScope +"'][data-toggle-trigger]", $scope)
			.on('click.toggle', function(evt)
			{
				evt.preventDefault();

				// Cancel if togglable state if singular value
				var allowedTriggers = $(this).data('toggle-trigger');
				if(allowedTriggers === 'on' && self.toggleScopes[thisScope].state === true) { return; }
				if(allowedTriggers === 'off' && self.toggleScopes[thisScope].state !== true) { return; }

				self.publish("toggleState", !self.toggleScopes[thisScope].state, thisScope);

				// Do we need to turn any others off at the same time?
				if($(this).data('toggle-group'))
				{
					var group = $(this).data('toggle-group') || "";

					$("[data-toggle-group='"+group+"']").not("[data-toggle-scope='"+thisScope+"']").each(function()
					{
						self.publish("toggleState", false, $(this).data('toggle-scope'));
					});
				}

			});
		});



		// ScrollTo ============
		$("a[href^='#'], [data-scrollTo]", $scope).each(function()
		{
			var $this = $(this);
			var selector = $this.attr('data-scrollTo') || $this.attr('href');

			$this.on('click.scrollTo', function(evt)
			{
				if($(selector).length > 0)
				{
					self.publish("scrollWindowTo", $(selector), null, 100);
					evt.preventDefault();
				}
			});
		});



		// No event ============
		$("[data-no-event]", $scope).each(function()
		{
			var evtName = $(this).data('no-event') || 'click';
			$(this).on(evtName, function(evt)
			{
				evt.preventDefault();
			});
		});


		// Tracking ============
		$("[data-track]", $scope).each(function()
		{
			var evtName = $(this).data('track-event') || 'click';
			$(this).on(evtName, function(evt)
			{
				var track = $(this).data('track');
				if($(this).find(":selected").length) { track = $(this).find(':selected').data('track'); }
				self.publish("trackEvent", track);
			});
		});

		$("[data-track-view]", $scope).each(function()
		{
			var evtName = $(this).data('track-event') || 'click';
			$(this).on(evtName, function(evt)
			{
				var track = $(this).data('track-view');
				if($(this).find(":selected").length) { track = $(this).find(':selected').data('track-view'); }
				self.publish("trackPageView", track);
			});
		});


		// Share ==========
		$("[data-share]", $scope).on('click', function(evt)
		{
			var shareTo = $(this).data('share');
			var url = $(this).attr('href');

			switch (shareTo.toLowerCase())
			{
				case 'facebook':

					evt.preventDefault();

					var winWidth = 520;
					var winHeight = 350;
					var winTop = (screen.height / 2) - (winHeight / 2);
					var winLeft = (screen.width / 2) - (winWidth / 2);

					window.open(url, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);

					break;

				default:

					break
			}
		});




		// Inview Class Toggles ===========

		$("[data-inview-class]", $scope).each(function(i, element)
		{
			var $element = $(element);

			self.publish("registerFirstInView", $element);

			self.subscribe("elementFirstInView", function($inViewElement)
			{
				if(!$element.is($inViewElement)) return;
				$element.toggleClass($element.data('inview-class'));
			});
		});


		// Staggered Inview Triggers ===========

		$("[data-inview-animation]", $scope).each(function(i, element)
		{
			var $element = $(element);
			var thisDelay = parseFloat($element.data('inview-animation-delay') || 0.1);

			self.publish("registerFirstInView", $element);

			self.subscribe("elementFirstInView", function($inViewElement)
			{
				if(!$element.is($inViewElement)) return;

				self.delayAccumulator+=thisDelay;
				self.activeDelays.push($element);

				$element.css({
					'animation-delay': (self.delayAccumulator) + 's'
				})
				.addClass('animate animating')
				.one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function()
				{
					if(_.indexOf(self.activeDelays, $element) !== -1)
					{
						_.pull(self.activeDelays, $element);
						self.delayAccumulator-=thisDelay;
//	 					$element.css({'animation-delay': ''});
	 					$element.removeClass('animating');
					}
				});
			});
		});


		// Forms (including Grav Forms) ==================
		self.publish("queueExecution", function()
		{
			$(".field, .gfield", $scope).each(function()
			{
				var $this = $(this);
				$this.on('focusin.fieldStyles', function() { $this.removeClass('field--no-focus').addClass('field--is-focus'); });
				$this.on('focusout.fieldStyles', function() { $this.removeClass('field--is-focus').addClass('field--no-focus'); });
			});
		});


		// Map form IDs to their original (DB) IDs so we can match confirmation events later
		$("[class*='gform_wrapper_original_id_']", $scope).each(function()
		{
			var $this = $(this);
			var origID = $this.attr('class').match(/(^|\s)gform_wrapper_original_id_(.*?)(\s|$)/);
			var newID = $this.attr('id').match(/(^|\s)gform_wrapper_(.*?)(\s|$)/);
			if(origID.length > 3 && newID.length > 3)
			{
				// Store the map
				origID = origID[2];
				newID = newID[2];
				self.gformMap[newID] = origID;

				// Fix the scroll anchor otherwise it'll be undefined one the confirmation injects (and break subsequent JS)
				$("<span id='gf_" + newID + "' class='vis-clip gform_anchor' />").insertBefore($this);
			}
		});

	};



	APP.Main.prototype._initPlugins = function($scope)
	{
		var self = this;


		// Selects
		$('.ginput_container_select, .ginput_container_date', $scope).each(function() 
		{
			var $this = $(this);
			$('select', $this).addClass('selectric');

			// Prepops gravity forms bar selects
			var filterTerm = null;
			if (typeof BarPageCMSID !== "undefined") {
				filterTerm = 'barid--' + BarPageCMSID;
			} else if (isLocationSet) {
				filterTerm = 'name--' + locationData.name.replace(/ /g,"_");
			}

			if(filterTerm)
			{
				$('select option', $this).each(function(index, el) 
				{
					var value = $(el).val();
					if (value.indexOf(filterTerm) >= 0) {
						$(this).prop('selected', true);
					}
				});
			}
		});

		$('.selectric', $scope).selectric();



		// Revs booking app
		$("[data-booking-widget]", $scope).each(function()
		{
			var $this = $(this);
			var domNode = $this.get(0);
			var instanceId = null;
			var booking = {};
			var settings = $.extend({
				layout : self.query("isBreakpoint", "mob") ? 'widget' : 'full'
			}, $this.data('booking-settings'));
			var prepop = $this.data('booking-prepop') || {};
			var stepProgress = 0;

			if(Cookies.get('liveSourceTracking'))
			{
				var tracking = JSON.parse(decodeURIComponent(Cookies.get('liveSourceTracking')));
				prepop = $.extend(prepop, tracking);
			}

			// Prepop stored bar if not already set
			if(!prepop.hasOwnProperty('bar_id') && storedBar)
			{
				prepop['bar_id'] = storedBar.api_id;
			}

			var broadcastEvent = function(type, data)
			{
				if(typeof data == 'undefined')
				{
					data = {
						id: instanceId,
						step: stepProgress,
						booking: booking,
					};
				}

				var event = new CustomEvent('revs-booking-' + type, {detail: data});
				domNode.dispatchEvent(event);
			}

			var onComplete = function()
			{
				// Clear tracking data
				Cookies.remove('sourceTracking', { path: '/' });

				// Push Analytics event
				self.publish("trackEvent", [
					'API booking',
					'complete',
					booking.party_type_name,
					parseInt(booking.value),		 // PBR value
					false
				]);

				if(typeof window.fbq != 'undefined')
				{
					window.fbq('track', 'Form',
					{
						id: prepop.cube_form_id,
						title: 'RCloud Rest API',
						occasion: booking.party_type_name,
						pbr: booking.value,     // PBR value
						type: 'rcloud-rest-api',
						action: 'submitted'
					});
				}

				broadcastEvent('complete');
			}

			var fieldUpdate = function(field, value, oldValue)
			{
				booking[field] = value;

				if(field == 'booking_id' && value !== null)
				{
					onComplete();
				}
				else if(field == 'session_id')
				{
					instanceId = value
				}
				else if(field == 'step')
				{
					for(var i = (stepProgress+1); i <= value; i++)
					{
						self.publish("trackEvent", [
							'API booking funnel',
							'step ' + i,
							booking.party_type_name,
							null,
							(i == 0)
						]);
						stepProgress = i;
					}

					broadcastEvent('progress');
				}

				broadcastEvent('field-update', instanceId, field, value);
			}

			var bookingUpdate = function(data)
			{
				if(!instanceId && data.session_id) { instanceId = data.session_id; }
        booking = _.defaults(_.clone(booking), data);
        broadcastEvent('update');
			}

			var sizeUpdate = function(data)
			{
				broadcastEvent('size-update')
			}

			var onClose = function(data)
			{
				broadcastEvent('close')				
			}

			Bookings.init(domNode, {
				brand: 'decuba',
				pre_filled_data: prepop,
				onFieldUpdate: fieldUpdate,
				onBookingUpdate: bookingUpdate,
				sizeUpdate: sizeUpdate,
//				onClose: onClose,
			});

			self.publish('bookingWidgetLoaded', domNode, settings, prepop);
		});


		// Generic maps
		$("[data-map]", $scope).each(function()
		{
			var $this = $(this);
			self.publish("loadMap", $this, $this.data['lat'], $this.data['lng']);
		});


		// Bar maps
		$("[data-bar-map]", $scope).each(function()
		{
			var $this = $(this);
			self.query("barInfo", $this.data('bar-map')).then(function(data) 
			{
				self.publish("loadMap", $this, data['latitude'], data['longitude']);
			});
		});

	}


	// OnReady, instantiate Main
	$(function()
	{
		// _APP for debug ONLY.
		// Avoid referring to it - use pub/sub or query/respond instead
		window._APP = new APP.Main();

		$("html").addClass("js--ready");


		function checkCookies() {
			var cookieEnabled = Cookies.get('cookieConfirm');

			if(cookieEnabled) {
				cookieEnabled = true
			} else {
				cookieEnabled = false
			}

			return (cookieEnabled);
		}

		var cookieCheck = checkCookies();

		if (!cookieCheck) {
			$('.cookie-popup').addClass('show');
		}

		$('#cookie-consent').on('click', function() {
			$('.cookie-popup').removeClass('show');
			Cookies.set('cookieConfirm', true);
		});
	});

})(jQuery);





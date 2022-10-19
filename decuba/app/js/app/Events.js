/* globals window, _, APP, Q */
(function() {
	"use strict";

	APP.Events = function()
	{
		var self = this;

		_.extend(this, APP.Mediator);



		// WINDOW ========================

		// Window resize
		$(window).on("resize", function(event)
		{
			self.publish("windowResize", event, $(window).width(), $(window).height() );
		});


		var resizeTimer;
		self.subscribe("windowResize", function(event, w, h)
		{
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function()
			{ 
				self.publish("delayedWindowResize", event, w, h );
			}, 150);
		});


		// Window loaded
		$(window).on("load", function(event)
		{
			self.publish("windowLoaded", event);
		});



		// SCROLL ========================

		var previousScroll = 0;
		var previousScrollDir = 0;
		$(window).scroll(function(event)
		{
			var currentScroll = $(this).scrollTop();
			var scrollDelta = currentScroll - previousScroll;
			var currentScrollDir = scrollDelta / Math.abs(scrollDelta);

			// Window scrolled
			self.publish("windowScrolled", currentScroll, scrollDelta, currentScrollDir, event);

			// Window scrolled up
			if(currentScrollDir < 0)
			{
				self.publish("windowScrolledUp", currentScroll, scrollDelta, currentScrollDir, event);
			}

			// Window scrolled up
			if(currentScrollDir > 0)
			{
				self.publish("windowScrolledDown", currentScroll, scrollDelta, currentScrollDir, event);
			}

			if(currentScrollDir !== previousScrollDir)
			{
				// Window scroll inverted
				self.publish("windowScrollInverted", currentScroll, scrollDelta, currentScrollDir, event);

				// Window scroll inverted up
				if(currentScrollDir < 0)
				{
					self.publish("windowScrollInvertedUp", currentScroll, scrollDelta, currentScrollDir, event);
				}

				// Window scroll inverted down
				if(currentScrollDir > 0)
				{
					self.publish("windowScrollInvertedDown", currentScroll, scrollDelta, currentScrollDir, event);
				}
			}

			previousScroll = currentScroll;
			previousScrollDir = currentScrollDir;
		});



		// Scroll browser window to an element
		self.subscribe("scrollWindowTo", function(element, speed, withOffsets)
		{
			if(!(element instanceof jQuery) || element.length === 0) return;
			if(element.length > 1) { console.log(element); element = element.first(); }

  		withOffsets = typeof withOffsets !== 'number' || typeof withOffsets !== 'boolean' || typeof withOffsets !== 'string' ? withOffsets: true;
  		speed = typeof speed === 'number' ? speed : 750;

  		var offsetIsNumeric = typeof withOffsets === "number";

			var offset = offsetIsNumeric ? withOffsets : 0;
			if(withOffsets !== false && !offsetIsNumeric)
			{
				var selectorScope = typeof withOffsets === "string" ? withOffsets : '';
				$("[data-scrollTo-offset='" + selectorScope + "']").each(function()
				{
					offset += $(this).height();
				});
			}

			self.publish("windowWillScrollTo", element);
//			$('html').css('overflow', 'hidden');		// Bit weird on Windows

			$.scrollTo(element, speed, {
				offset: {top:-offset, left:0},
				onAfter: function(target, settings)
				{
//					$('html').css('overflow', '');		// Bit weird on Windows
					self.publish("windowDidScrollTo", element);
				}
			});
		});


		// Register query responders
		self.respond("scrollValue", function()
		{
			return previousScroll;
		});

		self.respond("scrollDirection", function()
		{
			return previousScrollDir;
		});


		// Trigger scroll event if we're not at the top
		// (e.g. page refresh part way down the page)
		if($(window).scrollTop() !== 0)
		{
			$(window).trigger("scroll");
		}


		// ANALYTICS =====================

		self.subscribe("trackEvent", function(track)
		{
			if(!window.dataLayer) { return; }

			if(_.isString(track))
			{
				track = track.split("|");
			}

			// Must have a non-empty array by this point
			if(!$.isArray(track)) { return; }
			if(track.length === 0) { return; }


			// Add event (which might be omitted)
			if(track[0] !== "gaTriggerEvent") { track.unshift("gaTriggerEvent"); }

			// Determine non-interaction hit value
			var nonInteractionHit = true;		// Assume true
			if(!(_.isUndefined(track[5])))
			{
				if(_.isString(track[5]) && track[5].toLowerCase() === 'false')
				{
					nonInteractionHit = false;
				}
				else if(_.isBoolean(track[5]))
				{
					nonInteractionHit = track[5];
				}
			}

			dataLayer.push({
				'event': track[0],
				'gaEventCategory': track[1] || '',
				'gaEventAction': track[2] || '',
				'gaEventLabel': track[3] || '',
				'gaEventValue': track[4] || '',
				'gaNonInteractionHit' : nonInteractionHit
			});

		});


		self.subscribe("trackPageView", function(track)
		{
			if(!window.dataLayer) { return; }

			if(_.isString(track))
			{
				track = track.split("|");
			}

			// Must have an array by this point
			if(!_.isArray(track)) { return; }


			// Add event (which might be omitted)
			if(track[0] !== "gaTriggerPageView") { track.unshift("gaTriggerPageView"); }


			dataLayer.push({
				'event': track[0],
				'gaVirtualPageUrl': track[1] || '',
				'gaVirtualPageTitle': track[2] || ''
			});

		});




	};
}());

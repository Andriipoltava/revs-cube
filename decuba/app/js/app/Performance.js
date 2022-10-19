/* globals window, Q, _, APP */
(function() {
	"use strict";

	APP.Performance = function()
	{
		// Extend mediator
		var self = this;
		_.extend(this, APP.Mediator);

		// Pass self back
		return this;
	}

	// Initialise
	APP.Performance.prototype.init = function()
	{
		this._inview();							// In view
		this._lazyload();						// Lazy Loading
	}


	// 'Private' methods ---------

	APP.Performance.prototype._inview = function()
	{
		var self = this;

		// Listen for requests to add new elements to the list
		this.subscribe("registerFirstInView", function($elements)
		{
			$elements.on("inview.auto", function(event, isInView, visiblePartX, visiblePartY)
			{
				if(isInView)
				{
					self.publish("elementFirstInView", $(this));
					$(this).off("inview.auto");
				}
			});
		});

				// Add InView events to all injected content
		self.subscribe("contentInjected", function($scope)
		{
			// Register lazyload elements for FTT inview detection
			this.publish("registerFirstInView", $("[data-inview]", $scope));
		});


	}


	APP.Performance.prototype._lazyload = function()
	{
		var self = this;


		// Listen for publishes to "unlazy"
		self.subscribe("unlazy", function($element)
		{
			// Sanity check
			if(!$element.is("[data-lazy]")) return;

			// Swap over any other attributes
			_.forEach($element.get(0).attributes, function(attr)
			{
				// If the attribute is specified and is a lazy load attribute, unlazy it
		    if(attr.specified && attr.name.substr(0, 10) === "data-lazy-")
		    {
		    	var newAttrName = attr.name.substr(10);
		    	var newAttrValue = ($element.attr(newAttrName) || '') + " " + attr.value;
		    	$element.attr(newAttrName, newAttrValue);
		    	$element.removeAttr(attr.name);
		    }
		  });

			// If this is an image which still doesn't have a src, try the lazy attr instead
			if($element.is('img') && $element.attr('src') === undefined)
			{
				$element.attr('src', $element.attr('data-lazy'));
			}

			// We don't bother checking if the attr exists, waste of processing
			$element.removeAttr("data-lazy");
		});


		// Add Lazy load events to all injected content
		self.subscribe("contentInjected", function($scope)
		{
			// Register lazyload elements for FTT inview detection
			this.publish("registerFirstInView", $("[data-lazy]", $scope));
		});


		// Perform actions when they are in view
		this.subscribe("elementFirstInView", function($element)
		{
			self.publish("unlazy", $element);
		});
	}

})();

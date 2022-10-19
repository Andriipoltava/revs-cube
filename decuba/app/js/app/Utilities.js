/* globals window, _, APP, Q */
(function() {
	"use strict";

	APP.Utilities = function()
	{
		var self = this;
		_.extend(this, APP.Mediator);


		// Loading external scripts
		self.subscribe("loadScript", function(src)
		{
			var deferred = Q.defer();

      var script = document.createElement("script");
      script.src = src;
      document.body.appendChild(script);
			script.onload = function()
			{
				self.publish("scriptLoaded", src);
				deferred.resolve();
			};

			return deferred;
		});



		// Force a redraw
		// Better to do it on a per element basis where possible
		self.subscribe("redraw", function()
		{
			$('<style></style>').appendTo($(document.body)).remove();
		});


		// Force a redraw of each element in a set
		self.subscribe("redrawElements", function($elements)
		{
			$elements.each(function(i, el) { $(el).html($(el).html()); });
		});


		// Control execution calls
		self.subscribe("queueExecution", function(callback, delay)
		{
			delay = typeof delay !== "undefined" ? delay : 0;
			setTimeout(callback, delay);
		});

	};
}());

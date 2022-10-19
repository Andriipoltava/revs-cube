/* globals window, _, APP, Q, enquire */
(function() {
	"use strict";

 
	/**
	 * Constructor
	 *
	 * Pass an array of breakpoints with names.
	 * For example:
	 *
	 * 		breakpointMatches = [
	 *			{name: "mob", 		match: "(max-width: 30em)" },
	 *			{name: "not-mob", match: "(min-width: 30.0625em)" },
	 *		]
	 */
	APP.Responsive = function(breakpointMatches)
	{
		var self = this;

		_.extend(this, APP.Mediator);

 
		// Properties vars
		self.breakpoints = [];
		self.breakpointMatches = _.isArray(breakpointMatches) ? breakpointMatches : [];


		// 'Private' properties vars
		self._publishTimeout = null;


		// Register breakpoint handlers
		_.forEach(self.breakpointMatches, function(breakpoint)
		{
			enquire.register("screen and " + breakpoint.match, {
				match : function() { self._registerBreakpoint(breakpoint.name); },
				unmatch : function() { self._unregisterBreakpoint(breakpoint.name); }
			});
		});


		// Register query response
		self.respond("isBreakpoint", function(breakpoint)
		{
			return _.includes(self.breakpoints, breakpoint);
		});
 
	};



	// 'Private' vars
	APP.Responsive.prototype._registerBreakpoint = function(breakpoint)
	{
		var self = this;
		self.breakpoints = _.union(self.breakpoints, [breakpoint]);
		self._publishBreakpoints();
	};


	APP.Responsive.prototype._unregisterBreakpoint = function(breakpoint)
	{
		var self = this;
		self.breakpoints = _.without(self.breakpoints, breakpoint);
		self._publishBreakpoints();
	};


	// This function ensures all breakpoint matches/unmatches have
	// evaluated before the event is fired. Timeout of zero pushes
	// execution of the function to the back of the queue.
	APP.Responsive.prototype._publishBreakpoints = function(breakpoint)
	{
		var self = this;

		clearTimeout(self._publishTimeout);
		self._publishTimeout = setTimeout(function()
		{
			self.publish("breakpointChange", self.breakpoints);
		}, 0);
	}


}());

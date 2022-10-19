/**
 * MEDIATOR - Singleton Version
 * 
 * Chris Jones, The Codery
 * thecodery.co.uk
 **/


(function() {
	"use strict";

	// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript
	// Apply to other objects using _.extend(newObj, APP.Mediator);
	APP.Mediator = function()
	{
		// Storage for topics that can be broadcast or listened to
		var pubSubTopics = {};
		var queResTopics = {};


		// Uncomment for debugging
		// this._pubSubTopics = pubSubTopics;
		// this._queResTopics = queResTopics;


		// Subscribe to a topic, supply a callback to be executed
		// when that topic is broadcast to
		var subscribe = function( topic, fn )
		{
			var split = topic.split(".");
			topic = split[0];
			var namespace = split[1] || undefined;

			if ( !pubSubTopics[topic] ){
				pubSubTopics[topic] = [];
			}

			pubSubTopics[topic].push( { context: this, callback: fn, namespace: namespace } );

			return this;
		};


		// Unsubscribe from a topic. Optionally, supply the topic to
		// unsubsribe from. Defaults to all
		var unsubscribe = function( topic )
		{
			// Init vars
			var predicate = { context: this };


			// If a topic was supplied
			if(_.isString(topic))
			{
				// Check for namespacing
				var split = topic.split(".");
				topic = split[0];
				var namespace = split[1] || undefined;
				if(!_.isUndefined(namespace))  predicate.namespace = namespace;
			}


			// Remove subscriptions
			if(!_.isUndefined(topic))
			{
				if(pubSubTopics.hasOwnProperty(topic))  _.remove( pubSubTopics[topic], predicate );
			}
			else
			{
				_.forOwn(pubSubTopics, function(subscriptions, topic) {  _.remove( subscriptions, predicate );  });
			}

			// Any empty topics?
			_.forOwn(pubSubTopics, function(subscriptions, topic)
			{
				// console.log(topic, pubSubTopics[topic].length)
				if(_.isEmpty(pubSubTopics[topic])) {	delete pubSubTopics[topic]; }
			});
			// console.log("pubsub", _.clone(pubSubTopics));


			return this;
		};



		// Publish/broadcast an event to the rest of the application
		var publish = function( topic )
		{

			var args;

			if ( !pubSubTopics[topic] ){
				return false;
			}

			args = Array.prototype.slice.call( arguments, 1 );

			// Run backwards incase the subscriber removes itself
			// from the topic and ruins the index (e.g. a 'destroy' topic)
			// NOTE - Does mean that callbacks fire in reverse order.
			//				This might be important!
			var len = pubSubTopics[topic].length;
			while (len--)
			{
				var subscription = pubSubTopics[topic][len];
				if(!subscription.callback){ console.log(subscription); };
				subscription.callback.apply( subscription.context, args );
			}

			return this;
		};



		// Respond to a query, supply a function to call AND return
		// when that query is broadcast
		var respond = function( topic, response )
		{
			var split = topic.split(".");
			topic = split[0];
			var namespace = split[1] || undefined;


			if ( !queResTopics[topic] ){
				queResTopics[topic] = [];
			}


			queResTopics[topic].push( { context: this, response: response, namespace: namespace } );

			return this;
		};



		// Unrespond to a query. Optionally, supply the topic to
		// unrespond to. Defaults to all
		var unrespond = function( topic )
		{
			// Init vars
			var predicate = { context: this };


			// If a topic was supplied
			if(_.isString(topic))
			{
				// Check for namespacing
				var split = topic.split(".");
				topic = split[0];
				var namespace = split[1] || undefined;
				if(!_.isUndefined(namespace))  predicate.namespace = namespace;
			}


			// Remove responses
			if(!_.isUndefined(topic))
			{
				if(queResTopics.hasOwnProperty(topic))  _.remove(queResTopics[topic], predicate );
			}
			else
			{
				_.forOwn(queResTopics, function(responses, topic) {  _.remove( responses, predicate );  });
			}

			// Any empty topics?
			_.forOwn(queResTopics, function(subscriptions, topic)
			{
				// console.log(topic, queResTopics[topic].length)
				if(_.isEmpty(queResTopics[topic])) {	delete queResTopics[topic]; }
			});
			//console.log("pubsub", _.clone(queResTopics));

			return this;
		};



		// Query for a response from the rest of the application
		var query = function( topic )
		{
			var args;

			if ( !queResTopics[topic] ){
				return false;
			}

			var firstResponse = undefined;
			args = Array.prototype.slice.call( arguments, 1 );

			// Run backwards incase the responder removes itself
			// from the topic and ruins the index (e.g. a 'destroy' topic)
			// NOTE - Does mean that callbacks fire in reverse order.
			//				This might be important!
			var len = queResTopics[topic].length;
			while (len--)
			{
				var responder = queResTopics[topic][len];
				var theResponse = _.isFunction(responder.response) ? responder.response.apply( responder.context, args ) : responder.response;

				if(_.isUndefined(theResponse)) continue;

				firstResponse = theResponse;
				break;
			}

			return firstResponse;
		};



		// Query for all responses from the rest of the application
		var queryAll = function( topic )
		{
			var args;

			if ( !queResTopics[topic] ){
				return false;
			}

			var responses = [];
			args = Array.prototype.slice.call( arguments, 1 );


			// Run backwards incase the responder removes itself
			// from the topic and ruins the index (e.g. a 'destroy' topic)
			var len = queResTopics[topic].length;
			while (len--)
			{
				var responder = queResTopics[topic][len];
				var theResponse = _.isFunction(responder.response) ? responder.response.apply( responder.context, args ) : responder.response;

				if(_.isUndefined(theResponse)) continue;

				responses.push(theResponse);
			}

			return responses;
		};
		// Storage for topics that can be broadcast or listened to
		var pubSubTopics = {};
		var queResTopics = {};



		return {
			publish: publish,
			subscribe: subscribe,
			unsubscribe: unsubscribe,
			query: query,
			queryAll: queryAll,
			respond: respond,
			unrespond: unrespond
		};

	}();
}());

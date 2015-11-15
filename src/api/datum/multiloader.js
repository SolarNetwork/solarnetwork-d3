import "loader";
import "../../core/log";

/**
 * Load data from multiple {@link sn.api.datum.loader} objects, invoking a callback function
 * after all data has been loaded. Call {@link #load()} to start loading the data.
 * 
 * @class
 * @param {sn.api.datum.loader[]} loaders - array of {@link sn.api.datum.loader} objects
 * @returns {sn.api.datum.multiLoader}
 * @preserve
 */
sn.api.datum.multiLoader = function(loaders) {
	var that = {
			version : '1.0.0'
	};

	var finishedCallback,
		q = queue();
		
	/**
	 * Get or set the callback function, invoked after all data has been loaded. The callback
	 * function will be passed two arguments: an error and an array of result arrays returned
	 * from {@link sn.api.datum.loader#load()} on each supplied loader.
	 * 
	 * @param {function} [value] the callback function to use
	 * @return when used as a getter, the current callback function, otherwise this object
	 * @memberOf sn.api.datum.multiLoader
	 */
	that.callback = function(value) {
		if ( !arguments.length ) { return finishedCallback; }
		if ( typeof value === 'function' ) {
			finishedCallback = value;
		}
		return that;
	};
	
	/**
	 * Initiate loading the data. This will call {@link sn.api.datum.loader#load()} on each
	 * supplied loader, in parallel.
	 * 
	 * @memberOf sn.api.datum.multiLoader
	 */
	that.load = function() {
		loaders.forEach(function(e) {
			q.defer(e.load);
		});
		q.awaitAll(function(error, results) {
			if ( finishedCallback ) {
				finishedCallback.call(that, error, results);
			}
		});
		return that;
	};

	return that;
};

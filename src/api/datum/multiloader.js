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
	var that = load;
	that.version = '1.0.0';

	var finishedCallback,
		q = queue();

	function load(callback) {
		// to support queue use, allow callback to be passed directly to this function
		if ( typeof callback === 'function' ) {
			finishedCallback = callback;
		}
		loaders.forEach(function(e) {
			q.defer(e.load);
		});
		q.awaitAll(function(error, results) {
			if ( finishedCallback ) {
				finishedCallback.call(that, error, results);
			}
		});
		return that;
	}
	/**
	 * Get or set the callback function, invoked after all data has been loaded. The callback
	 * function will be passed two arguments: an error and an array of result arrays returned
	 * from {@link sn.api.datum.loader#load()} on each supplied loader.
	 *
	 * @param {function} [value] the callback function to use
	 * @return when used as a getter, the current callback function, otherwise this object
	 * @memberOf sn.api.datum.multiLoader
	 * @preserve
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
	 * supplied loader, in parallel. As an alternative to configuring the callback function via
	 * the {@link #callback(value)} method, a callback function can be passed as an argument
	 * to this function. This allows this function to be passed to <code>queue.defer</code>,
	 * for example.
	 *
	 * This method is an alias for just invoking the loader function directly. That is,
	 * <code>multiLoader.load(...)</code> is equivalent to <code>multiLoader(...)</code>.
	 *
	 * @param {function} [callback] a callback function to use
	 * @return this object
	 * @memberOf sn.api.datum.multiLoader
	 * @preserve
	 */
	that.load = load;

	return that;
};

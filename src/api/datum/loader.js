import "datum";
import "../../core/log";
import "../../net/net";

/**
 * Load data for a set of source IDs, date range, and aggregate level using the
 * {@code dateTimeListURL} endpoint. This object is designed
 * to be used once per query. After creating the object and configuring an asynchronous
 * callback function with {@link #callback(function)}, call {@link #load()} to start
 * loading the data. The callback function will be called once all data has been loaded.
 *
 * @class
 * @param {string[]} sourceIds - array of source IDs to load data for
 * @param {function} urlHelper - a {@link sn.api.node.nodeUrlHelper} or {@link sn.api.loc.locationUrlHelper}
 * @param {date} start - the start date, or {@code null}
 * @param {date} end - the end date, or {@code null}
 * @param {string} aggregate - aggregate level
 * @returns {sn.api.datum.loader}
 * @preserve
 */
sn.api.datum.loader = function(sourceIds, urlHelper, start, end, aggregate) {

	var that = load;

	var jsonClient = d3.json;
	var finishedCallback;
	var urlParameters;

	var state = 0; // keys are source IDs, values are 1:loading, 2:done
	var results;

	// setup core properties
	Object.defineProperties(that, {
		version								: { value : '1.1.0' }
	});

	function load(callback) {
		// to support queue use, allow callback to be passed directly to this function
		if ( typeof callback === 'function' ) {
			finishedCallback = callback;
		}
		state = 1;
		loadData();
		return load;
	}

	function requestCompletionHandler(error) {
		state = 2; // done

		// check if we're all done loading, and if so call our callback function
		if ( finishedCallback ) {
			finishedCallback.call(that, error, results);
		}
	}

	function loadData(offset) {
		var pagination = {},
			url,
			dataExtractor,
			offsetExtractor;
		if ( offset ) {
			pagination.offset = offset;
		}
		url = urlHelper.dateTimeListURL(start, end, aggregate, sourceIds, pagination);
		if ( urlParameters ) {
			(function() {
				var tmp = sn_net_encodeURLQueryTerms(urlParameters);
				if ( tmp.length ) {
					url += '&' + tmp;
				}
			}());
		}
		dataExtractor = function(json) {
			if ( json.success !== true || json.data === undefined || Array.isArray(json.data.results) !== true ) {
				return undefined;
			}
			return json.data.results;
		};
		offsetExtractor = function(json) {
			return (json.data.returnedResultCount + json.data.startingOffset < json.data.totalResults
					? (json.data.returnedResultCount + json.data.startingOffset)
					: 0);
		};
		jsonClient(url, function(error, json) {
			var dataArray,
				nextOffset;
			if ( error ) {
				sn.log('Error requesting data for {0}: {2}', urlHelper.keyDescription(), error);
				return;
			}
			dataArray = dataExtractor(json);
			if ( dataArray === undefined ) {
				sn.log('No data available for {0}', urlHelper.keyDescription());
				requestCompletionHandler(error);
				return;
			}

			if ( results === undefined ) {
				results = dataArray;
			} else {
				results = results.concat(dataArray);
			}

			// see if we need to load more results
			nextOffset = offsetExtractor(json);
			if ( nextOffset > 0 ) {
				loadData(nextOffset);
			} else {
				requestCompletionHandler(error);
			}
		});
	}

	/**
	 * Get or set the callback function, invoked after all data has been loaded. The callback
	 * function will be passed two arguments: an error and the results.
	 *
	 * @param {function} [value] the callback function to use
	 * @return when used as a getter, the current callback function, otherwise this object
	 * @memberOf sn.api.datum.loader
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
	 * Get or set additional URL parameters. The parameters are set as object properties.
	 * If a property value is an array, multiple parameters for that property will be added.
	 *
	 * @param {object} [value] the URL parameters to include with the JSON request
	 * @return when used as a getter, the URL parameters, otherwise this object
	 * @memberOf sn.api.datum.loader
	 * @preserve
	 */
	that.urlParameters = function(value) {
		if ( !arguments.length ) return urlParameters;
		if ( typeof value === 'object' ) {
			urlParameters = value;
		}
		return that;
	};

	/**
	 * Get or set a JSON client function to use. The function must be compatible with <code>d3.json</code>
	 * and in fact defaults to that. You could set it to a <code>sn.net.securityHelper</code> instance
	 * to use security token API requests, for example.
	 *
	 * @param {function} [value] the JSON client function, compatible with <code>d3.json</code>.
	 * @return when used as a getter, the JSON client function, otherwise this object
	 * @since 1.1
	 * @preserve
	 */
	that.jsonClient = function(value) {
		if ( !arguments.length ) return jsonClient;
		if ( typeof value === 'function' ) {
			jsonClient = value;
		}
		return that;
	};

	/**
	 * Initiate loading the data. As an alternative to configuring the callback function via
	 * the {@link #callback(value)} method, a callback function can be passed as an argument
	 * to this function. This allows this function to be passed to <code>queue.defer</code>,
	 * for example.
	 *
	 * This method is an alias for just invoking the loader function directly. That is,
	 * <code>loader.load(...)</code> is equivalent to <code>loader(...)</code>.
	 *
	 * @param {function} [callback] a callback function to use
	 * @return this object
	 * @memberOf sn.api.datum.loader
	 * @preserve
	 */
	that.load = load;

	return that;
};

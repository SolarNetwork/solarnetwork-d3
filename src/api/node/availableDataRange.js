import "node";

sn.api.node.availableDataRange = sn_api_node_availableDataRange;

/**
 * Call the {@code reportableIntervalURL} web service for a set of source IDs and
 * invoke a callback function with the results.
 *
 * <p>The callback function will be passed the same 'data' object returned
 * by the {@code reportableIntervalURL} endpoint, but the start/end dates will be
 * a combination of the earliest available and latest available results for
 * every different node ID provided.
 *
 * @param {Array} sourceSets An array of objects, each with a {@code sourceIds} array
 *                property and a {@code nodeUrlHelper} {@code sn.api.node.nodeUrlHelper}
 *                or {@code locationUrlHelper} {@code sn.api.loc.locationUrlHelper}
 *                propery.
 * @param {d3.json} [jsonClient] A <code>d3.json</code> compatible object.
 * @param {Function} [callback] A callback function which will be passed the result object.
 * @preserve
 */
function sn_api_node_availableDataRange(sourceSets, jsonClient, callback) {
	var q = queue(),
		helpers = [];

	if ( callback === undefined ) {
		callback = jsonClient;
		jsonClient = d3.json;
	}

	// submit all queries to our queue
	(function() {
		var i,
			url,
			urlHelper;
		for ( i = 0; i < sourceSets.length; i += 1 ) {
			if ( sourceSets[i].nodeUrlHelper ) {
				urlHelper = sourceSets[i].nodeUrlHelper;
			} else if ( sourceSets[i].locationUrlHelper ) {
				urlHelper = sourceSets[i].locationUrlHelper;
			} else {
				urlHelper = sourceSets[i].urlHelper;
			}
			if ( urlHelper && urlHelper.reportableIntervalURL ) {
				helpers.push(urlHelper);
				url = urlHelper.reportableIntervalURL(sourceSets[i].sourceIds);
				q.defer(jsonClient, url);
			}
		}
	}());

	function extractReportableInterval(results) {
		var result,
			i = 0,
			repInterval;
		for ( i = 0; i < results.length; i += 1 ) {
			repInterval = results[i];
			if ( repInterval.data === undefined || repInterval.data.endDate === undefined ) {
				sn.log('No data available for {0} sources {1}',
					helpers[i].keyDescription(), sourceSets[i].sourceIds.join(','));
				continue;
			}
			repInterval = repInterval.data;
			if ( result === undefined ) {
				result = repInterval;
			} else {
				// merge start/end dates
				// note we don't copy the time zone... this breaks when the tz are different!
				if ( repInterval.endDateMillis > result.endDateMillis ) {
					result.endDateMillis = repInterval.endDateMillis;
					result.endDate = repInterval.endDate;
				}
				if ( repInterval.startDateMillis < result.startDateMillis ) {
					result.startDateMillis = repInterval.startDateMillis;
					result.startDate = repInterval.startDate;
				}
			}
		}
		return result;
	}

	q.awaitAll(function(error, results) {
		if ( error ) {
			sn.log('Error requesting available data range: ' +error);
			return;
		}
		var intervalObj = extractReportableInterval(results);
		if ( intervalObj.startDateMillis !== undefined ) {
			intervalObj.sDate = new Date(intervalObj.startDateMillis);
			//intervalObj.sLocalDate = sn.format.dateTimeFormatLocal.parse(intervalObj.startDate);
		}
		if ( intervalObj.endDateMillis !== undefined ) {
			intervalObj.eDate = new Date(intervalObj.endDateMillis);
		}

		if ( typeof callback === 'function' ) {
			callback(intervalObj);
		}
	});
}

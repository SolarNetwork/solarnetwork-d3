import "node";

sn.api.node.availableSources = sn_api_node_availableSources;

/**
 * Call the {@code availableSourcesURL} web service and invoke a callback function with the results.
 *
 * <p>The callback function will be passed an error object and the array of sources.
 *
 * @param {sn.api.node.nodeUrlHelper} urlHelper A {@link sn.api.node.nodeUrlHelper} or
                                             {@link sn.api.loc.locationUrlHelper} object.
 * @param {d3.json} [jsonClient] A <code>d3.json</code> compatible object.
 * @param {Function} callback A callback function which will be passed an error object
 *                            and the result array.
 * @preserve
 */
function sn_api_node_availableSources(urlHelper, jsonClient, callback) {
	if ( callback === undefined ) {
		callback = jsonClient;
		jsonClient = d3.json;
	}
	if ( !(urlHelper && urlHelper.availableSourcesURL && callback) ) {
		return;
	}
	var url = urlHelper.availableSourcesURL();
	jsonClient(url, function(error, json) {
		var sources;
		if ( error ) {
			callback(error);
		} else if ( !json ) {
			callback('No data returned from ' +url);
		} else if ( json.success !== true ) {
			callback(json.message ? json.message : 'Query not successful.');
		} else {
			sources = (Array.isArray(json.data) ? json.data.sort() : []);
			sources.sort();
			callback(null, sources);
		}
	});
}

import "node";
import "../../config/config";
import "../../util/util";

sn.api.node.registerUrlHelperFunction = sn_api_node_registerUrlHelperFunction;

var sn_api_node_urlHelperFunctions;

/**
 * A node-specific URL utility object.
 * 
 * @class
 * @constructor
 * @param {Number} node The node ID to use.
 * @param {Object} configuration The configuration options to use.
 * @returns {sn.api.node.nodeUrlHelper}
 */
sn.api.node.nodeUrlHelper = function(node, configuration) {
	var that = {
		version : '1.1.0'
	};
	
	var nodeId = node;
	
	var config = sn.util.copy(configuration, {
		host : 'data.solarnetwork.net',
		tls : true,
		path : '/solarquery',
		secureQuery : false
	});
	
	/**
	 * Get a URL for just the SolarNet host, without any path.
	 *
	 * @returns {String} the URL to the SolarNet host
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function hostURL() {
		return ('http' +(config.tls === true ? 's' : '') +'://' +config.host);
	}
	
	/**
	 * Get a URL for the SolarNet host and the base API path, e.g. <code>/solarquery/api/v1/sec</code>.
	 *
	 * @returns {String} the URL to the SolarNet base API path
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function baseURL() {
		return (hostURL() +config.path +'/api/v1/' +(config.secureQuery === true ? 'sec' : 'pub'));
	}
	
	/**
	 * Get a URL for the "reportable interval" for this node, optionally limited to a specific source ID.
	 *
	 * @param {Array} sourceIds An array of source IDs to limit query to. If not provided then all available 
	 *                sources will be returned.
	 * @returns {String} the URL to find the reportable interval
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function reportableIntervalURL(sourceIds) {
		var url = (baseURL() +'/range/interval?nodeId=' +nodeId);
		if ( Array.isArray(sourceIds) ) {
			url += '&' + sourceIds.map(function(e) { return 'sourceIds='+encodeURIComponent(e); }).join('&')
		}
		return url;
	}
	
	/**
	 * Get a available source IDs for this node, optionally limited to a date range.
	 *
	 * @param {Date} startDate An optional start date to limit the results to.
	 * @param {Date} endDate An optional end date to limit the results to.
	 * @returns {String} the URL to find the available source
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function availableSourcesURL(startDate, endDate) {
		var url = (baseURL() +'/range/sources?nodeId=' +nodeId);
		if ( startDate !== undefined ) {
			url += '&start=' +encodeURIComponent(sn.dateFormat(startDate));
		}
		if ( endDate !== undefined ) {
			url += '&end=' +encodeURIComponent(sn.dateFormat(endDate));
		}
		return url;
	}
	
	/**
	 * Generate a SolarNet {@code /datum/list} URL.
	 * 
	 * @param {Date} startDate The starting date for the query, or <em>null</em> to omit
	 * @param {Date} endDate The ending date for the query, or <em>null</em> to omit
	 * @param {String|Number} agg A supported aggregate type (e.g. Hour, Day, etc) or a minute precision Number
	 * @param {Array} sourceIds Array of source IDs to limit query to
	 * @param {Object} pagination An optional pagination object, with <code>offset</code> and <code>max</code> properties.
	 * @return {String} the URL to perform the list with
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function dateTimeListURL(startDate, endDate, agg, sourceIds, pagination) {
		var url = (baseURL() +'/datum/list?nodeId=' +nodeId);
		if ( startDate ) {
			url += '&startDate=' +encodeURIComponent(sn.dateTimeFormatURL(startDate));
		}
		if ( endDate ) {
			url += '&endDate=' +encodeURIComponent(sn.dateTimeFormatURL(endDate));
		}
		if ( agg ) {
			url += '&aggregate=' + encodeURIComponent(agg);
		}
		if ( Array.isArray(sourceIds) && sourceIds.length > 0 ) {
			url += '&' + sourceIds.map(function(e) { return 'sourceIds='+encodeURIComponent(e); }).join('&')
		}
		if ( pagination !== undefined ) {
			if ( pagination.max > 0 ) {
				url += '&max=' + encodeURIComponent(pagination.max);
			}
			if ( pagination.offset > 0 ) {
				url += '&offset=' + encodeURIComponent(pagination.offset);
			}
		}
		return url;
	}
		
	/**
	 * Generate a SolarNet {@code /datum/mostRecent} URL.
	 * 
	 * @param {Array} sourceIds Array of source IDs to limit query to
	 * @return {String} the URL to perform the most recent query with
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function mostRecentURL(sourceIds) {
		var url = (baseURL() + '/datum/mostRecent?nodeId=' + nodeId);
		if ( Array.isArray(sourceIds) ) {
			url += '&' + sourceIds.map(function(e) { return 'sourceIds='+encodeURIComponent(e); }).join('&')
		}
		return url;
	}
	
	/**
	 * Get or set the node ID to use.
	 * 
	 * @param {String} [value] the node ID to use
	 * @return when used as a getter, the node ID, otherwise this object
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function nodeID(value) {
		if ( !arguments.length ) return nodeId;
		nodeId = value;
		return that;
	}
	
	/**
	 * Get a description of this helper object.
	 *
	 * @return {String} The description of this object.
	 * @memberOf sn.api.node.nodeUrlHelper
	 */
	function keyDescription() {
		return ('node ' +nodeId);
	}
	
	// setup core properties
	Object.defineProperties(that, {
		secureQuery				: { get : function() { return (config.secureQuery === true); }, enumerable : true },
		keyDescription			: { value : keyDescription },
		nodeId					: { get : function() { return nodeId; }, enumerable : true },
		nodeID					: { value : nodeID },
		hostURL					: { value : hostURL },
		baseURL					: { value : baseURL },
		reportableIntervalURL 	: { value : reportableIntervalURL },
		availableSourcesURL		: { value : availableSourcesURL },
		dateTimeListURL			: { value : dateTimeListURL },
		mostRecentURL			: { value : mostRecentURL }
	});
	
	// allow plug-ins to supply URL helper methods, as long as they don't override built-in ones
	(function() {
		if ( Array.isArray(sn_api_node_urlHelperFunctions) ) {
			sn_api_node_urlHelperFunctions.forEach(function(helper) {
				if ( that.hasOwnProperty(helper.name) === false ) {
					Object.defineProperty(that, helper.name, { value : function() {
						return helper.func.apply(that, arguments);
					} });
				}
			});
		}
	}());

	return that;
};

/**
 * Register a custom function to generate URLs with {@link sn.api.node.nodeUrlHelper}.
 * 
 * @param {String} name The name to give the custom function. By convention the function
 *                      names should end with 'URL'.
 * @param {Function} func The function to add to sn.api.node.nodeUrlHelper instances.
 */
function sn_api_node_registerUrlHelperFunction(name, func) {
	if ( typeof func !== 'function' ) {
		return;
	}
	if ( sn_api_node_urlHelperFunctions === undefined ) {
		sn_api_node_urlHelperFunctions = [];
	}
	name = name.replace(/[^0-9a-zA-Z_]/, '');
	sn_api_node_urlHelperFunctions.push({name : name, func : func});
}


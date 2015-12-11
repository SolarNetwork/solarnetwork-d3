import "loc";
import "../../config/config";
import "../../util/util";

sn.api.loc.registerUrlHelperFunction = sn_api_loc_registerUrlHelperFunction;

var sn_api_loc_urlHelperFunctions;

/**
 * A location-specific URL utility object.
 * 
 * @class
 * @constructor
 * @param {Number} location The location ID to use.
 * @param {Object} configuration The configuration options to use.
 * @returns {sn.api.loc.locationUrlHelper}
 * @preserve
 */
sn.api.loc.locationUrlHelper = function(location, configuration) {
	var that = {
		version : '1.0.0'
	};
	
	var locationId = location;
	
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
	 * @preserve
	 */
	function hostURL() {
		return ('http' +(config.tls === true ? 's' : '') +'://' +config.host);
	}
	
	/**
	 * Get a URL for the SolarNet host and the base API path, e.g. <code>/solarquery/api/v1/sec</code>.
	 *
	 * @returns {String} the URL to the SolarNet base API path
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
	function baseURL() {
		return (hostURL() +config.path +'/api/v1/' +(config.secureQuery === true ? 'sec' : 'pub'));
	}
	
	/**
	 * Get a URL for the "reportable interval" for this location, optionally limited to a specific source ID.
	 *
	 * @param {Array} sourceIds An array of source IDs to limit query to. If not provided then all available 
	 *                sources will be returned.
	 * @returns {String} the URL to find the reportable interval
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
	function reportableIntervalURL(sourceIds) {
		var url = (baseURL() +'/location/datum/interval?locationId=' +locationId);
		if ( Array.isArray(sourceIds) ) {
			url += '&sourceIds=' + sourceIds.map(function(e) { return encodeURIComponent(e); }).join(',');
		}
		return url;
	}
	
	/**
	 * Get a available source IDs for this location, optionally limited to a date range.
	 *
	 * @param {Date} startDate An optional start date to limit the results to.
	 * @param {Date} endDate An optional end date to limit the results to.
	 * @returns {String} the URL to find the available source
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
	function availableSourcesURL(startDate, endDate) {
		var url = (baseURL() +'/location/datum/sources?locationId=' +locationId);
		if ( startDate !== undefined ) {
			url += '&start=' +encodeURIComponent(sn.format.dateFormat(startDate));
		}
		if ( endDate !== undefined ) {
			url += '&end=' +encodeURIComponent(sn.format.dateFormat(endDate));
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
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
	function dateTimeListURL(startDate, endDate, agg, sourceIds, pagination) {
		var url = (baseURL() +'/location/datum/list?locationId=' +locationId);
		if ( startDate ) {
			url += '&startDate=' +encodeURIComponent(sn.format.dateTimeFormatURL(startDate));
		}
		if ( endDate ) {
			url += '&endDate=' +encodeURIComponent(sn.format.dateTimeFormatURL(endDate));
		}
		if ( agg ) {
			url += '&aggregate=' + encodeURIComponent(agg);
		}
		if ( Array.isArray(sourceIds) ) {
			url += '&sourceIds=' + sourceIds.map(function(e) { return encodeURIComponent(e); }).join(',');
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
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
	function mostRecentURL(sourceIds) {
		var url = (baseURL() + '/location/datum/mostRecent?locationId=' + locationId);
		if ( Array.isArray(sourceIds) ) {
			url += '&sourceIds=' + sourceIds.map(function(e) { return encodeURIComponent(e); }).join(',');
		}
		return url;
	}
	
	/**
	 * Get or set the location ID to use.
	 * 
	 * @param {String} [value] the location ID to use
	 * @return when used as a getter, the location ID, otherwise this object
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
	function locationID(value) {
		if ( !arguments.length ) return locationId;
		locationId = value;
		return that;
	}
	
	/**
	 * Get a description of this helper object.
	 *
	 * @return {String} The description of this object.
	 * @memberOf sn.api.node.nodeUrlHelper
	 * @preserve
	 */
	function keyDescription() {
		return ('node ' +nodeId);
	}
	
	// setup core properties
	Object.defineProperties(that, {
		keyDescription			: { value : keyDescription },
		locationId				: { get : function() { return locationId; }, enumerable : true },
		locationID				: { value : locationID },
		hostURL					: { value : hostURL },
		baseURL					: { value : baseURL },
		reportableIntervalURL 	: { value : reportableIntervalURL },
		availableSourcesURL		: { value : availableSourcesURL },
		dateTimeListURL			: { value : dateTimeListURL },
		mostRecentURL			: { value : mostRecentURL }
	});
	
	// allow plug-ins to supply URL helper methods, as long as they don't override built-in ones
	(function() {
		if ( Array.isArray(sn_api_loc_urlHelperFunctions) ) {
			sn_api_loc_urlHelperFunctions.forEach(function(helper) {
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
 * Register a custom function to generate URLs with {@link sn.api.loc.locationUrlHelper}.
 * 
 * @param {String} name The name to give the custom function. By convention the function
 *                      names should end with 'URL'.
 * @param {Function} func The function to add to sn.api.loc.locationUrlHelper instances.
 * @preserve
 */
function sn_api_loc_registerUrlHelperFunction(name, func) {
	if ( typeof func !== 'function' ) {
		return;
	}
	if ( sn_api_loc_urlHelperFunctions === undefined ) {
		sn_api_loc_urlHelperFunctions = [];
	}
	name = name.replace(/[^0-9a-zA-Z_]/, '');
	sn_api_loc_urlHelperFunctions.push({name : name, func : func});
}

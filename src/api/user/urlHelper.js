import "user";
import "../node/urlHelper";
import "../../config/config";
import "../../util/util";

sn.api.user.registerUrlHelperFunction = sn_api_user_registerUrlHelperFunction;

var sn_api_user_urlHelperFunctions;

function sn_api_user_baseURL(urlHelper) {
	return (urlHelper.hostURL() 
		+(sn.config && sn.config.solarUserPath ? sn.config.solarUserPath : '/solaruser')
		+'/api/v1/sec');
}

/**
 * An active user-specific URL utility object. This object does not require
 * any specific user ID to be configured, as all requests are assumed to apply
 * to the active user credentials.
 * 
 * @class
 * @constructor
 * @param {Object} configuration The configuration options to use.
 * @returns {sn.api.user.userUrlHelper}
 * @preserve
 */
sn.api.user.userUrlHelper = function(configuration) {
	var self = {
		version : '1.0.0'
	};
	
	var config = sn.util.copy(configuration, {
		host : 'data.solarnetwork.net',
		tls : true,
		path : '/solaruser',
		secureQuery : true
	});
	
	/**
	 * Get a URL for just the SolarNet host, without any path.
	 *
	 * @returns {String} the URL to the SolarNet host
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
	function hostURL() {
		return ('http' +(config.tls === true ? 's' : '') +'://' +config.host);
	}
	
	/**
	 * Get a URL for the SolarNet host and the base API path, e.g. <code>/solaruser/api/v1/sec</code>.
	 *
	 * @returns {String} the URL to the SolarUser base API path
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
	function baseURL() {
		return (hostURL() +config.path +'/api/v1/' +(config.secureQuery === true ? 'sec' : 'pub'));
	}
	
	/**
	 * Get a description of this helper object.
	 *
	 * @return {String} The description of this object.
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
	function keyDescription() {
		return 'user';
	}
	
	/**
	 * Generate a SolarUser {@code /nodes} URL.
	 * 
	 * @return {String} the URL to access the active user's nodes
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
	function viewNodesURL() {
		var url = (baseURL() + '/nodes');
		return url;
	}
	
	// setup core properties
	Object.defineProperties(self, {
		keyDescription			: { value : keyDescription },
		hostURL					: { value : hostURL },
		baseURL					: { value : baseURL },
		viewNodesURL 			: { value : viewNodesURL }
	});
	
	// allow plug-ins to supply URL helper methods, as long as they don't override built-in ones
	(function() {
		if ( Array.isArray(sn_api_user_urlHelperFunctions) ) {
			sn_api_user_urlHelperFunctions.forEach(function(helper) {
				if ( self.hasOwnProperty(helper.name) === false ) {
					Object.defineProperty(self, helper.name, { value : function() {
						return helper.func.apply(self, arguments);
					} });
				}
			});
		}
	}());

	return self;
};

/**
 * Register a custom function to generate URLs with {@link sn.api.user.userUrlHelper}.
 * 
 * @param {String} name The name to give the custom function. By convention the function
 *                      names should end with 'URL'.
 * @param {Function} func The function to add to sn.api.user.userUrlHelper instances.
 * @preserve
 */
function sn_api_user_registerUrlHelperFunction(name, func) {
	if ( typeof func !== 'function' ) {
		return;
	}
	if ( sn_api_user_urlHelperFunctions === undefined ) {
		sn_api_user_urlHelperFunctions = [];
	}
	name = name.replace(/[^0-9a-zA-Z_]/, '');
	sn_api_user_urlHelperFunctions.push({name : name, func : func});
}

/*
 * Node URL helper functions
 */
 
sn_api_node_registerUrlHelperFunction('viewInstruction', sn_api_user_viewInstruction);
sn_api_node_registerUrlHelperFunction('viewActiveInstructionsURL', sn_api_user_viewActiveInstructionsURL);
sn_api_node_registerUrlHelperFunction('viewPendingInstructionsURL', sn_api_user_viewPendingInstructionsURL);
sn_api_node_registerUrlHelperFunction('updateInstructionStateURL', sn_api_user_updateInstructionStateURL);
sn_api_node_registerUrlHelperFunction('queueInstructionURL', sn_api_user_queueInstructionURL);

function sn_api_user_viewInstruction(instructionID) {
	return (sn_api_user_baseURL(this) +'/instr/view?id=' +encodeURIComponent(instructionID));
}

function sn_api_user_viewActiveInstructionsURL() {
	return (sn_api_user_baseURL(this) +'/instr/viewActive?nodeId=' +this.nodeId);
}

function sn_api_user_viewPendingInstructionsURL() {
	return (sn_api_user_baseURL(this) +'/instr/viewPending?nodeId=' +this.nodeId);
}

function sn_api_user_updateInstructionStateURL(instructionID, state) {
	return (sn_api_user_baseURL(this) 
		+'/instr/updateState?id=' +encodeURIComponent(instructionID)
		+'&state=' +encodeURIComponent(state));
}

/**
 * Generate a URL for posting an instruction request.
 *
 * @param {String} topic - The instruction topic.
 * @param {Array} parameters - An array of parameter objects in the form <code>{name:n1, value:v1}</code>.
 * @preserve
 */
function sn_api_user_queueInstructionURL(topic, parameters) {
	var url = (sn_api_user_baseURL(this) 
		+'/instr/add?nodeId=' +this.nodeId
		+'&topic=' +encodeURIComponent(topic));
	if ( Array.isArray(parameters) ) {
		var i, len;
		for ( i = 0, len = parameters.length; i < len; i++ ) {
			url += '&' +encodeURIComponent('parameters['+i+'].name') +'=' +encodeURIComponent(parameters[i].name)
				+ '&' +encodeURIComponent('parameters['+i+'].value') +'=' +encodeURIComponent(parameters[i].value);
		}
	}
	return url;
}

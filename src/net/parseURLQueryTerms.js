import "net";

sn.net.parseURLQueryTerms = sn_net_parseURLQueryTerms;

/**
 * Parse the query portion of a URL string, and return a parameter object for the
 * parsed key/value pairs.
 * 
 * <p>Multiple parameters of the same name will be stored as an array on the returned object.</p>
 * 
 * @param {String} search the query portion of the URL, which may optionally include 
 *                        the leading '?' character
 * @return {Object} the parsed query parameters, as a parameter object
 * @preserve
 */
function sn_net_parseURLQueryTerms(search) {
	var params = {};
	var pairs;
	var pair;
	var i, len, k, v;
	if ( search !== undefined && search.length > 0 ) {
		// remove any leading ? character
		if ( search.match(/^\?/) ) {
			search = search.substring(1);
		}
		pairs = search.split('&');
		for ( i = 0, len = pairs.length; i < len; i++ ) {
			pair = pairs[i].split('=', 2);
			if ( pair.length === 2 ) {
				k = decodeURIComponent(pair[0]);
				v = decodeURIComponent(pair[1]);
				if ( params[k] ) {
					if ( !Array.isArray(params[k]) ) {
						params[k] = [params[k]]; // turn into array;
					}
					params[k].push(v);
				} else {
					params[k] = v;
				}
			}
		}
	}
	return params;
}

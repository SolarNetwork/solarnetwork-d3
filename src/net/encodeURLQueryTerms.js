import "net";

sn.net.encodeURLQueryTerms = sn_net_encodeURLQueryTerms;

/**
 * Encode the properties of an object as a URL query string.
 * 
 * <p>If an object property has an array value, multiple URL parameters will be encoded for that property.</p>
 * 
 * @param {Object} an object to encode as URL parameters
 * @return {String} the encoded query parameters
 * @preserve
 */
function sn_net_encodeURLQueryTerms(parameters) {
	var result = '',
		prop,
		val,
		i,
		len;
	function handleValue(k, v) {
		if ( result.length ) {
			result += '&';
		}
		result += encodeURIComponent(k) + '=' + encodeURIComponent(v);
	}
	if ( parameters ) {
		for ( prop in parameters ) {
			if ( parameters.hasOwnProperty(prop) ) {
				val = parameters[prop];
				if ( Array.isArray(val) ) {
					for ( i = 0, len = val.length; i < len; i++ ) {
						handleValue(prop, val[i]);
					}
				} else {
					handleValue(prop, val);
				}
			}
		}
	}
	return result;
}

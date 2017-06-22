import "net";

/**
 * Helper for secure SolarNetwork API access. Configure a <code>token</code> and <code>secret</code>
 * and then use the <code>json</code> function to make secure SolarNetwork API requests. The returned
 * object is also a function that can be called directly, instead of using the <code>json</code> property.
 *
 * @class
 * @param {String} [apiToken] - An initial token to use.
 * @param {String} [apiTokenSecret] - An initial token secret to use.
 * @returns {sn.net.securityHelper}
 * @require uri-js https://github.com/garycourt/uri-js
 * @preserve
 */
sn.net.securityHelper = function(apiToken, apiTokenSecret) {
	'use strict';
	var that = json;

	var kFormUrlEncodedContentTypeRegex = /^application\/x-www-form-urlencoded/i;

	// our in-memory credentials
	var cred = {token: apiToken, secret: apiTokenSecret, signingKey: null, signingKeyExpiry: null};

	// setup core properties
	Object.defineProperties(that, {
		version								: { value : '1.4.0' },
		hasTokenCredentials					: { value : hasTokenCredentials },
		token								: { value : token },
		secret								: { value : secret },
		hasSecret 							: { value : hasSecret },
		clearSecret 						: { value : clearSecret },
		generateAuthorizationHeaderValue 	: { value : generateAuthorizationHeaderValue },
		parseURLQueryTerms 					: { value : parseURLQueryTerms },
		json 								: { value : json },
		computeAuthorization				: { value : computeAuthorization },
	});

	/**
	 * Return <em>true</em> if both a token and a secret have been set, <em>false</em> otherwise.
	 *
	 * @return {Boolean} <em>true</em> if a token and secret have been set.
	 * @preserve
	 */
	function hasTokenCredentials() {
		return (cred.token && cred.token.length > 0 && cred.secret && cred.secret.length > 0);
	}

	/**
	 * Get or set the in-memory security token to use.
	 *
	 * @param {String} [value] The value to set, or <code>null</code> to clear.
	 * @returs When used as a getter, the current token value, otherwise this object.
	 * @preserve
	 */
	function token(value) {
		if ( !arguments.length ) return cred.token;
		cred.token = (value && value.length > 0 ? value : undefined);
		return that;
	}

	/**
	 * Set the in-memory security token secret to use.
	 *
	 * @param {String} [value] The value to set.
	 * @returns This object.
	 * @preserve
	 */
	function secret(value) {
		if ( arguments.length ) {
			cred.secret = value;
		}
		return that;
	}

	/**
	 * Return <em>true</em> if a secret has been set, <em>false</em> otherwise.
	 *
	 * @return {Boolean} <em>true</em> if a secret has been set.
	 * @preserve
	 */
	function hasSecret() {
		return (cred.secret && cred.secret.length > 0);
	}

	/**
	 * Clear the in-memory secret.
	 *
	 * @returns This object.
	 * @preserve
	 */
	function clearSecret() {
		cred.secret = undefined;
		return that;
	}

	/**
	 * Test if a Digest header should be included in the request, based on the
	 * request content type.
	 *
	 * @param {String} contentType the content type
	 * @returns {Boolean} <em>true</em> if including the Digest hash is appropriate
	 */
	function shouldIncludeContentDigest(contentType) {
		// we don't send Digest for form data, because server treats this as URL parameters
		return (contentType && contentType.match(kFormUrlEncodedContentTypeRegex));
	}

	/**
	 * Generate the canonical request message for a set of request parameters.
	 *
	 * @param {Object} params the request parameters
	 * @param {String} params.method the HTTP request method
	 * @param {Object} params.uri a parsed URI object for the request
	 * @param {String} params.queryParams the canonical query parameters string
	 * @param {Object} params.headers the canonical headers object
	 * @param {Object} params.bodyDigest the CryptoJS body content digest
	 * @return {String} the message
	 * @preserve
	 */
	function generateCanonicalRequestMessage(params) {
		var msg =
			(params.method === undefined ? 'GET' : params.method.toUpperCase()) + '\n'
			+params.uri.path +'\n'
			+(params.queryParams ? params.queryParams : '') +'\n';
		params.headers.headerNames.forEach(function(name) {
			msg += name + ':' +params.headers.headers[name] + '\n';
		});
		msg += params.headers.headerNames.join(';') +'\n';
		msg += CryptoJS.enc.Hex.stringify(params.bodyDigest);
		return msg;
	}

	function generateSigningMessage(date, canonRequestMsg) {
		var msg = 'SNWS2-HMAC-SHA256\n'
			+iso8601Date(date, true) +'\n'
			+CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(canonRequestMsg));
		return msg;
	}

	/**
	 * Generate the V2 HTTP Authorization header.
	 *
	 * @param {String} token the SN token ID
	 * @param {Array} signedHeaders the sorted array of signed header names
	 * @param {Object} signKey the key to encrypt the signature with
	 * @param {String} signingMsg the message to sign
	 * @return {String} the HTTP header value
	 * @preserve
	 */
	function generateAuthorizationHeaderValue(signedHeaders, signKey, signingMsg) {
		var signature = CryptoJS.HmacSHA256(signingMsg, signKey);
		var authHeader = 'SNWS2 Credential=' +cred.token
			+',SignedHeaders=' +signedHeaders.join(';')
			+',Signature=' +CryptoJS.enc.Hex.stringify(signature);
		return authHeader;
	}

	/**
	 * Parse the query portion of a URL string, and return a parameter object for the
	 * parsed key/value pairs.
	 *
	 * <p>Multiple parameters of the same name are <b>not</b> supported.</p>
	 *
	 * @param {String} search the query portion of the URL, which may optionally include
	 *                        the leading '?' character
	 * @return {Object} the parsed query parameters, as a parameter object
	 * @preserve
	 */
	function parseURLQueryTerms(search) {
		var params = {};
		var pairs;
		var pair;
		var i, len;
		if ( search !== undefined && search.length > 0 ) {
			// remove any leading ? character
			if ( search.match(/^\?/) ) {
				search = search.substring(1);
			}
			pairs = search.split('&');
			for ( i = 0, len = pairs.length; i < len; i += 1 ) {
				pair = pairs[i].split('=', 2);
				if ( pair.length === 2 ) {
					params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
				}
			}
		}
		return params;
	}

	function _encodeURIComponent(str) {
	  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
		return '%' + c.charCodeAt(0).toString(16);
	  });
	}

	function canonicalQueryParameters(uri, data, contentType) {
		var params = parseURLQueryTerms(data && contentType.match(kFormUrlEncodedContentTypeRegex)
			? data : uri.query);
		var sortedKeys = [],
			key,
			i,
			len,
			first = true,
			result;

		for ( key in params ) {
			sortedKeys.push(key);
		}
		sortedKeys.sort();
		for ( i = 0, len = sortedKeys.length; i < len; i += 1 ) {
			if ( first ) {
				first = false;
				result = '';
			} else {
				result += '&';
			}
			key = sortedKeys[i];
			result +=  _encodeURIComponent(key);
			result += '=';
			result += _encodeURIComponent(params[key]);
		}
		return result;
	}

	/**
	 * Create an object with the canonical header names and their associated values.
	 *
	 * @param {Object} uri           a parsed URI object for the request
	 * @param {String} contentType   the request content type
	 * @param {Date} date            the request date
	 * @param {Object} contentSHA256 the CryptoJS digest object of the request body content
	 * @return {Object} An object with a sorted <code>headerNames</code> property array of strings, and
	 *                  a <code>headers</code> object of the header name values for keys and
	 *                  associated header values as values.
	 */
	function canonicalHeaders(uri, contentType, date, contentSHA256) {
		var result = {
			headerNames : ['host', 'x-sn-date'],
			headers : {
				'host' : uri.host + (uri.port && uri.port !== 80 && uri.port !== 443 ? ':'+uri.port : ''),
				'x-sn-date' : date.toUTCString()
			}
		};
		if ( shouldIncludeContentDigest(contentType) ) {
			result.headerNames.push('content-type');
			result.headers['content-type'] = contentType;
			result.headerNames.push('digest');
			result.headers['digest'] = 'sha-256='+CryptoJS.enc.Base64.stringify(contentSHA256);
		}
		result.headerNames.sort();
		return result;
	}

	function bodyContentSHA256(data, contentType) {
		return CryptoJS.SHA256(data && !contentType.match(kFormUrlEncodedContentTypeRegex)
			? data
			: '');
	}

	function iso8601Date(date, includeTime) {
		return ''+date.getUTCFullYear()
				+(date.getUTCMonth() < 9 ? '0' : '') +(date.getUTCMonth()+1)
				+(date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate()
				+(includeTime ?
					'T'
					+(date.getUTCHours() < 10 ? '0' : '') + date.getUTCHours()
					+(date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes()
					+(date.getUTCSeconds() < 10 ? '0' : '') +date.getUTCSeconds()
					+'Z'
					: '');
	}

	function signingKey(date) {
		var dateString,
			key = cred.signingKey,
			expireDate;
		date = date || new Date();
		if ( !key || date.getTime() > cred.signingKeyExpiry ) {
			dateString = iso8601Date(date);
			key = CryptoJS.HmacSHA256('snws2_request', CryptoJS.HmacSHA256(dateString, 'SNWS2' + cred.secret));
			cred.signingKey = key;

			expireDate = new Date(date);
			expireDate.setUTCHours(0);
			expireDate.setUTCMinutes(0);
			expireDate.setUTCSeconds(0);
			expireDate.setUTCMilliseconds(0);
			cred.signingKeyExpiry = expireDate.getTime() + (7 * 24 * 60 * 60 * 1000);
		}
		return key;
	}

	/**
	 * Invoke the web service URL, adding the required SolarNetworkWS authorization
	 * headers to the request.
	 *
	 * <p>This method will construct the <code>X-SN-Date</code> and <code>Authorization</code>
	 * header values needed to invoke the web service. It returns a d3 XHR object,
	 * so you can call <code>.on()</code> on that to handle the response, unless a callback
	 * parameter is specified, then the request is issued immediately, passing the
	 * <code>method</code>, <code>data</code>, and <code>callback</code> parameters
	 * to <code>xhr.send()</code>.</p>
	 *
	 * @param {String} url the web service URL to invoke
	 * @param {String} method the HTTP method to use; e.g. GET or POST
	 * @param {String} [data] the data to upload
	 * @param {String} [contentType] the content type of the data
	 * @param {Function} [callback] if defined, a d3 callback function to handle the response JSON with
	 * @return {Object} the computed header value details; the
	 * @preserve
	 */
	function computeAuthorization(url, method, data, contentType, date) {
		date = (date || new Date());

		var uri = URI.parse(url);

		var canonQueryParams = canonicalQueryParameters(uri, data, contentType);

		var canonHeaders = canonicalHeaders(uri, contentType, date, bodyContentDigest);

		var bodyContentDigest = bodyContentSHA256(data, contentType);

		var canonRequestMsg = generateCanonicalRequestMessage({
			method: method,
			uri: uri,
			queryParams : canonQueryParams,
			headers : canonHeaders,
			bodyDigest: bodyContentDigest
		});

		var signingMsg = generateSigningMessage(date, canonRequestMsg);

		var signKey = signingKey(date);

		var authHeader = generateAuthorizationHeaderValue(canonHeaders.headerNames, signKey, signingMsg);
		return {
			header: authHeader,
			date: date,
			dateHeader: canonHeaders.headers['x-sn-date'],
			verb: method,
			canonicalUri: uri.path,
			canonicalQueryParameters: canonQueryParams,
			canonicalHeaders: canonHeaders,
			bodyContentDigest: bodyContentDigest,
			canonicalRequestMessage: canonRequestMsg,
			signingMessage: signingMsg,
			signingKey: signKey
		};
	}

	/**
	 * Invoke the web service URL, adding the required SolarNetworkWS authorization
	 * headers to the request.
	 *
	 * <p>This method will construct the <code>X-SN-Date</code> and <code>Authorization</code>
	 * header values needed to invoke the web service. It returns a d3 XHR object,
	 * so you can call <code>.on()</code> on that to handle the response, unless a callback
	 * parameter is specified, then the request is issued immediately, passing the
	 * <code>method</code>, <code>data</code>, and <code>callback</code> parameters
	 * to <code>xhr.send()</code>.</p>
	 *
	 * @param {String} url the web service URL to invoke
	 * @param {String} method the HTTP method to use; e.g. GET or POST
	 * @param {String} [data] the data to upload
	 * @param {String} [contentType] the content type of the data
	 * @param {Function} [callback] if defined, a d3 callback function to handle the response JSON with
	 * @return {Object} d3 XHR object
	 * @preserve
	 */
	function json(url, method, data, contentType, callback) {
		var requestUrl = url;
		// We might be passed to queue, and then our callback will be the last argument (but possibly not #5
		// if the original call to queue didn't pass all arguments) so we check for that at the start and
		// adjust what we consider the method, data, and contentType parameter values.
		if ( arguments.length > 0 ) {
			if ( arguments.length < 5 && typeof arguments[arguments.length - 1] === 'function' ) {
				callback = arguments[arguments.length - 1];
			}
			if ( typeof method !== 'string' ) {
				method = undefined;
			}
			if ( typeof data !== 'string' ) {
				data = undefined;
			}
			if ( typeof contentType !== 'string' ) {
				contentType = undefined;
			}
		}
		method = (method === undefined ? 'GET' : method.toUpperCase());
		if ( method === 'POST' || method === 'PUT' ) {
			// extract any URL request parameters and put into POST body
			if ( !data ) {
				(function() {
					var queryIndex = url.indexOf('?');
					if ( queryIndex !== -1 ) {
						if ( queryIndex + 1 < url.length - 1 ) {
							data = url.substring(queryIndex + 1);
						}
						requestUrl = url.substring(0, queryIndex);
						contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
					}
				}());
			}
		}
		var xhr = d3.json(requestUrl);
		if ( contentType !== undefined ) {
			xhr.header('Content-Type', contentType);
		}
		xhr.on('beforesend', function(request) {
			var authorization = computeAuthorization(url, method, data, contentType, new Date());

			// set the headers on our request
			request.setRequestHeader('Authorization', authorization.header);
			if ( bodyContentDigest && shouldIncludeContentDigest(contentType) ) {
				request.setRequestHeader('Digest', authorization.canonicalHeaders.headers['digest']);
			}
			request.setRequestHeader('X-SN-Date', authorization.canonicalHeaders.headers['x-sn-date']);
		});

		// register a load handler always, just so one is present
		xhr.on('load.internal', function() {
			//sn.log('URL {0} response received.', url);
		});

		if ( callback !== undefined ) {
			xhr.send(method, data, callback);
		}
		return xhr;
	}

	return that;
};

// provide a global singleton helper on sn.net.sec
sn.net.sec = sn.net.securityHelper();


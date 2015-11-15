sn.util = {
	arraysAreEqual : sn_util_arraysAreEqual,
	copy : sn_util_copy,
	copyAll : sn_util_copyAll,
	superMethod : sn_util_superMethod
};

/**
 * Copy the enumerable own properties of `obj1` onto `obj2` and return `obj2`.
 * 
 * @param {Object} obj1 - The object to copy enumerable properties from.
 * @param {Object} [obj2] - The optional object to copy the properties to. If not
 *                          provided a new object will be created.
 * @returns {Object} The object whose properties were copied to.
 * @since 0.0.5
 * @preserve
 */
function sn_util_copy(obj1, obj2) {
	var prop, desc;
	if ( obj2 === undefined ) {
		obj2 = {};
	}
	for ( prop in obj1 ) {
		if ( obj1.hasOwnProperty(prop) ) {
			desc = Object.getOwnPropertyDescriptor(obj1, prop);
			if ( desc ) {
				Object.defineProperty(obj2, prop, desc);
			} else {
				obj2[prop] = obj1[prop];
			}
		}
	}
	return obj2;
}

/**
 * Copy the enumerable and non-enumerable own properties of `obj` onto `obj2` and return `obj2`.
 * 
 * @param {Object} obj1 - The object to copy enumerable properties from.
 * @param {Object} [obj2] - The optional object to copy the properties to. If not
 *                          provided a new object will be created.
 * @returns {Object} The object whose properties were copied to.
 * @since 0.0.5
 * @preserve
 */
function sn_util_copyAll(obj1, obj2) {
	var keys = Object.getOwnPropertyNames(obj1),
		i, len,
		key,
		desc;
	if ( obj2 === undefined ) {
		obj2 = {};
	}
	for ( i = 0, len = keys.length; i < len; i += 1 ) {
		key = keys[i];
		desc = Object.getOwnPropertyDescriptor(obj1, key);
		if ( desc ) {
			Object.defineProperty(obj2, key, desc);
		} else {
			obj2[key] = obj1[key];
		}
	}
	return obj2;
}

/**
 * Compare two arrays for equality, that is they have the same length and same values
 * using strict quality.
 *
 * @param {Array} a1 The first array to compare.
 * @param {Array} a2 The second array to compare.
 * @return {Boolean} True if the arrays are equal.
 * @since 0.2.0
 * @preserve
 */
function sn_util_arraysAreEqual(a1, a2) {
	var i, len;
	if ( !(Array.isArray(a1) && Array.isArray(a2)) ) {
		return false;
	}

	// compare lengths first
	if ( a1.length !== a2.length) {
		return false;
	}

	for ( i = 0, len = a1.length; i < len; i += 1 ) {
		// support nested arrays
		if ( Array.isArray(a1[i]) && Array.isArray(a2[i]) && arraysAreEqual(a1[i], a2[i]) !== true ) {
			return false;
		} else if ( a1[i] !== a2[i] ) {
			return false;
		}
	}
	return true;
}

/**
 * Get a proxy method for a "super" class' method on the `this` objct.
 * 
 * @param {String} name - The name of the method to get a proxy for.
 * @returns {Function} A function that calls the `name` function of the `this` object.
 * @since 0.0.4
 * @preserve
 */
function sn_util_superMethod(name) {
	var that = this,
		method = that[name];
	return function() {
		return method.apply(that, arguments);
    };
}


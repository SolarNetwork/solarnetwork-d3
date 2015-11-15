/**
 * A configuration utility object.
 * 
 * For any properties passed on {@code initialMap}, getter/setter accessors will be defined
 * on the returned {@code sn.Configuration} instance, so you can use normal JavaScript
 * accessor methods to get/set those values. You can always get/set arbitrary values using
 * the {@link #value(key, newValue)} function.
 * 
 * @class
 * @constructor
 * @param {Object} initialMap the initial properties to store (optional)
 * @returns {sn.Configuration}
 * @preserve
 */
sn.Configuration = function(initialMap) {
	this.map = {};
	if ( initialMap !== undefined ) {
		var me = this;
		(function() {
			var createGetter = function(prop) { return function() { return me.map[prop]; }; };
			var createSetter = function(prop) { return function(value) { me.map[prop] = value; }; };
			var prop;
			for ( prop in initialMap ) {
				if ( initialMap.hasOwnProperty(prop) && !me.hasOwnProperty(prop) ) {
					Object.defineProperty(me, prop, {
						enumerable : true,
						configurable : true,
						get : createGetter(prop),
						set : createSetter(prop)
					});
				}
				me.map[prop] = initialMap[prop];
			}
		}());
	}
};
sn.Configuration.prototype = {
	/**
	 * Test if a key is enabled, via the {@link #toggle} function.
	 * 
	 * @param {String} key the key to test
	 * @returns {Boolean} <em>true</em> if the key is enabled
	 * @preserve
	 */
	enabled : function(key) {
		if ( key === undefined ) {
			return false;
		}
		return (this.map[key] !== undefined);
	},

	/**
	 * Set or toggle the enabled status of a given key.
	 * 
	 * <p>If the <em>enabled</em> parameter is not passed, then the enabled
	 * status will be toggled to its opposite value.</p>
	 * 
	 * @param {String} key they key to set
	 * @param {Boolean} enabled the optional enabled value to set
	 * @returns {sn.Configuration} this object to allow method chaining
	 * @preserve
	 */
	toggle : function(key, enabled) {
		var val = enabled;
		if ( key === undefined ) {
			return this;
		}
		if ( val === undefined ) {
			// in 1-argument mode, toggle current value
			val = (this.map[key] === undefined);
		}
		return this.value(key, (val === true ? true : null));
	},
	
	/**
	 * Get or set a configuration value.
	 * 
	 * @param {String} key The key to get or set the value for 
	 * @param [newValue] If defined, the new value to set for the given {@code key}.
	 *                   If {@code null} then the value will be removed.
	 * @returns If called as a getter, the associated value for the given {@code key},
	 * otherwise this object.
	 * @preserve
	 */
	value : function(key, newValue) {
		var me = this;
		if ( arguments.length === 1 ) {
			return this.map[key];
		}
		if ( newValue === null ) {
			delete this.map[key];
			if ( this.hasOwnProperty(key) ) {
				delete this[key];
			}
		} else {
			this.map[key] = newValue;
			if ( !this.hasOwnProperty(key) ) {
				Object.defineProperty(this, key, {
					enumerable : true,
					configurable : true,
					get : function() { return me.map[key]; },
					set : function(value) { me.map[key] = value; }
				});
			}
		}
		return this;
	}
};

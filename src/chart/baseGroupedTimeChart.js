import "baseTimeChart";

sn.chart.baseGroupedTimeChart = function(containerSelector, chartConfig) {
	var parent = sn.chart.baseTimeChart(containerSelector, chartConfig),
		superReset = parent.reset;
	var self = sn.util.copyAll(parent);
	self.me = self;
	
	// raw data, by groupId
	var originalData = {};
	
	// a numeric scale factor, by groupId
	var scaleFactors = {};

	var dataCallback = undefined;
	var colorCallback = undefined; // function accepts (groupId, sourceId) and returns a color
	var sourceExcludeCallback = undefined; // function accepts (groupId, sourceId) and returns true to exclue group
	var layerPostProcessCallback = undefined; // function accepts (groupId, result of d3.nest()) and should return same structure

	// our computed layer data
	var groupIds = [];
	var otherData = {};

	function fillColor(groupId, d, i) {
		if ( colorCallback === undefined ) {
			return 'black';
		}
		return colorCallback(groupId, d.sourceId, i);
	}

	/**
	 * Insert aggregate time normalized elements into all layer data arrays.
	 * The <code>layerData</code> object must be an array of objects, each object
	 * having a <code>values</code> array of data objects. This method will
	 * clone data objects and insert them into the <code>values</code> array in-place,
	 * in order to create a time-normalized series of elements.
	 * 
	 * @param layerData The array of layer (data group) objects.
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	function insertNormalizedDurationIntoLayerData(layerData) {
		var i, j, row, datum,
			plotPropName = self.plotPropertyName,
			plotReversePropName = self.plotReversePropertyName;
		for ( j = 0; j < layerData.length; j += 1 ) {
			row = layerData[j].values;
			for ( i = 0; i < row.length - 1; i += 1 ) {
				if ( self.isNormalizedDuration(row[i].date, row[i+1].date) !== true ) {
					datum = sn.util.copy(row[i]);
					datum.date = self.addNormalizedDuration(datum.date);
					datum[plotPropName] = null;
					datum[plotReversePropName] = null;
					row.splice(i + 1, 0, datum);
				}
			}
		}
	}
	
	/**
	 * Clear out all data associated with this chart. Does not redraw. If 
	 * {@link hoverLeaveCallback} is defined, it will be called with no arguments.
	 * 
	 * @return this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.reset = function() {
		superReset();
		originalData = {};
		groupIds = [];
		otherData = {};
		return self.me;
	};
	
	/**
	 * Add data for a single group in the chart. The data is appended if data has 
	 * already been loaded for the given groupId. This does not redraw the chart. 
	 * Once all groups have been loaded, call {@link #regenerate()} to redraw.
	 * 
	 * @param {Array} rawData - the raw chart data to load
	 * @param {String} groupId - the ID to associate with the data; each stack group must have its own ID
	 * @returns this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.load = function(rawData, groupId) {
		if ( originalData[groupId] === undefined ) {
			groupIds.push(groupId);
			originalData[groupId] = rawData;
		} else {
			originalData[groupId] = originalData[groupId].concat(rawData);
		}
		return self.me;
	};
	
	/**
	 * Get the data for a specific group ID previously loaded via {@link #load()}.
	 *
	 * @param {String} groupId - the group ID of the data to get
	 * @returns the data, or <code>undefined</code>
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.data = function(groupId) {
		return originalData[groupId];
	};
	
	/**
	 * Stash data for a single group in the chart. The data is appended if data has 
	 * already been stashed for the given groupId. This data is auxiliary data that clients
	 * may want to associate with the chart and draw later, for example via the 
	 * {@link #drawAnnotationsCallback()} function.
	 * 
	 * @param {Array} rawData - the raw chart data to stash
	 * @param {String} groupId - the group ID to associate with the data
	 * @param {Boolean} replace - If <em>true</em> then do not append to existing data, replace it instead.
	 * @returns this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.stash = function(rawData, groupId, replace) {
		if ( otherData[groupId] === undefined || replace === true ) {
			otherData[groupId] = rawData;
		} else {
			otherData[groupId] = otherData[groupId].concat(rawData);
		}
		return self.me;
	};
	
	/**
	 * Get the data for a specific group ID previously stashed via {@link #stash()}.
	 *
	 * @param {String} groupId - the group ID of the data to get
	 * @returns the data, or <code>undefined</code>
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.stashedData = function(groupId) {
		return otherData[groupId];
	};
	
	/**
	 * Get or set the scale factor for specific group IDs. If called without any arguments,
	 * all configured scale factors will be returned as an object, with group IDs as property
	 * names with corresponding scale factor values. If called with a single Object argument
	 * then set all scale factors using group IDs as object property names with corresponding 
	 * number values for the scale factor.
	 *
	 * @param {String} groupId - The group ID of the scale factor to set.
	 * @param {Number} value - The scale factor to set.
	 * @returns If called without any arguments, all configured scale factors as an object.
	 *          If called with a single String <code>groupId</code> argument, the scale factor for the given group ID,
	 *          or <code>1</code> if not defined.
	 *          If called with a single Object <code>groupId</code> argument, set
	 *          Otherwise, this object.
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.scaleFactor = function(groupId, value) {
		var v;
		if ( !arguments.length ) return scaleFactors;
		if ( arguments.length === 1 ) {
			if ( typeof groupId === 'string' ) {
				v = scaleFactors[groupId];
				return (v === undefined ? 1 : v);
			}
			
			// for a single Object argument, reset all scaleFactors
			scaleFactors = groupId;
		} else if ( arguments.length == 2 ) {
			scaleFactors[groupId] = value;
		}
		return self.me;
	};
	
	/**
	 * Get or set the data callback function. This function will be called as the
	 * chart iterates over the raw input data as it performs grouping and normalization
	 * operations. The callback will be passed the group ID and the data as arguments.
	 * 
	 * @param {function} [value] the data callback
	 * @return when used as a getter, the current data callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.dataCallback = function(value) {
		if ( !arguments.length ) return dataCallback;
		if ( typeof value === 'function' ) {
			dataCallback = value;
		} else {
			dataCallback = undefined;
		}
		return self.me;
	};

	/**
	 * Get or set the color callback function. The callback will be passed the group ID 
	 * and a source ID as arguments.
	 * 
	 * @param {function} [value] the color callback
	 * @return when used as a getter, the current color callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.colorCallback = function(value) {
		if ( !arguments.length ) return colorCallback;
		if ( typeof value === 'function' ) {
			colorCallback = value;
		} else {
			colorCallback = undefined;
		}
		return self.me;
	};
	
	/**
	 * Get or set the source exclude callback function. The callback will be passed the group ID 
	 * and a source ID as arguments. It should true <em>true</em> if the data set for the given
	 * group ID and source ID should be excluded from the chart.
	 * 
	 * @param {function} [value] the source exclude callback
	 * @return when used as a getter, the current source exclude callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.sourceExcludeCallback = function(value) {
		if ( !arguments.length ) return sourceExcludeCallback;
		if ( typeof value === 'function' ) {
			sourceExcludeCallback = value;
		} else {
			sourceExcludeCallback = undefined;
		}
		return self.me;
	};

	/**
	 * Get or set the layer post-process callback function. The callback will be passed a 
	 * group ID and that group's result of the d3.nest() operator, after all layer data 
	 * arrays have been normalized to contain the same number of elements. 
	 * 
	 * @param {function} [value] the layer post-process callback
	 * @return when used as a getter, the current layer post-process callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
	self.layerPostProcessCallback = function(value) {
		if ( !arguments.length ) return layerPostProcessCallback;
		if ( typeof value === 'function' ) {
			layerPostProcessCallback = value;
		} else {
			layerPostProcessCallback = undefined;
		}
		return self.me;
	};

	Object.defineProperties(self, {
		// extending classes should re-define this property so method chaining works
		fillColor : { value : fillColor },
		insertNormalizedDurationIntoLayerData : { value : insertNormalizedDurationIntoLayerData },
		
		groupIds : { get : function() { return groupIds; } },
	});
	return self;
};

import "baseGroupedTimeChart";

/**
 * An abstract class to support groups of stacked layer charts.
 * 
 * Extending classes should re-define the <code>me</code> property to themselves, so that
 * method chaining works correctly.
 * 
 * @class
 * @abstract
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.powerAreaOverlapChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.baseGroupedStackTimeChart}
 * @preserve
 */
sn.chart.baseGroupedStackTimeChart = function(containerSelector, chartConfig) {
	var parent = sn.chart.baseGroupedTimeChart(containerSelector, chartConfig),
		superReset = parent.reset,
		superParseConfiguration = parent.parseConfiguration,
		superYAxisTicks = parent.yAxisTicks;
	var self = sn_util_copyAll(parent);
	self.me = self;

	var discardId = '__discard__';

	// the d3 stack offset method, or function
	var stackOffset = undefined;
	
	// toggle on/off the reverse plot property support
	var negativeOffsetFromReversePlotProperty = true;
	
	// our computed layer data
	var groupLayers = {};
	
	// useful to change to true for line-based charts
	var normalizeDataTimeGaps = false;

	function parseConfiguration() {
		superParseConfiguration();
		stackOffset = (self.config.value('wiggle') === true ? 'wiggle' : 'zero');
		negativeOffsetFromReversePlotProperty = (self.config.value('reverseValueSupport') === true ? true : false);
	}
	
	// get the opacity level for a given group
	function groupOpacityFn(d, i) {
		!d; // work around UglifyJS warning https://github.com/mishoo/UglifyJS2/issues/789
		var grade = (self.config.value('opacityReduction') || 0.1);
		return (1 - (i * grade));
	}
	
	function internalStackOffsetFn(layerData) {
		var plotReversePropName = self.plotReversePropertyName,
			fn;
		if ( stackOffset !== 'zero' ) {
			fn = d3.layout.stack().offset(stackOffset).offset();
		} else {
			fn = function(data) {
				// data is 3d array: 1) layers 2) time 3) [x,y];
				// we return 2d array based on time dimension of overall layer offset
				var i, 
					iLen = data[0].length, 
					j, jLen = data.length,
					sum, val, valR,
					y0 = [];
				for ( i  = 0; i < iLen; i += 1 ) {
					sum = 0;
					for ( j = 0; j < jLen; j += 1 ) {
						val = data[j][i][1];
						valR = (negativeOffsetFromReversePlotProperty ? layerData[j].values[i][plotReversePropName] : 0);
						if ( val < 0 ) {
							sum += val;
							data[j][i][1] = -val; // flip the height of the stack back to positive
						} else if ( valR ) {
							sum -= valR; // shift column; height already adjusted in stack.y function
						}
					}
					y0[i] = sum;
				}
				return y0;
			};
		}
		return fn;
	}
	
	function setup() {
		var plotPropName = self.plotPropertyName,
			plotReversePropName = self.plotReversePropertyName;
		var minX, maxX;
		var minY, maxY;
		var stack = d3.layout.stack()
			.values(function(d) { 
				return d.values;
			})
			.x(function(d) { 
				return d.date; 
			})
			.y(function(d) { 
				var y = d[plotPropName],
					yR = 0,
					scale = parent.scaleFactor(d[parent.internalPropName].groupId);
				if ( y === undefined || y === null || (stackOffset !== 'zero' && y < 0) ) {
					y = 0;
				} else if ( negativeOffsetFromReversePlotProperty && stackOffset === 'zero' && d[plotReversePropName] !== undefined ) {
					yR = d[plotReversePropName];
				}
				return ((y + yR) * scale);
			});
		groupLayers = {};
		self.groupIds.forEach(function(groupId) {
			var dummy,
				layerData,
				rawGroupData = self.data(groupId);
			if ( !rawGroupData || !rawGroupData.length > 1 ) {
				return;
			}
			
			layerData = d3.nest()
				.key(function(d) {
					if ( !d.hasOwnProperty(self.internalPropName) ) {
						d[self.internalPropName] = {groupId : groupId};
						if ( self.dataCallback() ) {
							self.dataCallback().call(self.me, groupId, d);
						} else if ( d.date === undefined ) {
							// automatically create Date
							d.date = sn.api.datum.datumDate(d);
						}
					}
					
					// remove excluded sources...
					if ( self.sourceExcludeCallback() ) {
						if ( self.sourceExcludeCallback().call(self.me, groupId, d.sourceId) ) {
							return discardId;
						}
					}
					
					return d.sourceId;
				})
				.sortKeys(d3.ascending)
				.entries(rawGroupData);
			
			// remove discarded sources...
			layerData = layerData.filter(function(d) {
				return (d.key !== discardId);
			});
			
			if ( layerData.length < 1 ) {
				return;
			}
			
			// fill in "holes" for each stack layer, if more than one layer. we assume data already sorted by date
			dummy = {};
			dummy[plotPropName] = null;
			dummy[self.internalPropName] = {groupId : groupId};
			sn.nestedStackDataNormalizeByDate(layerData, dummy);
			
			if ( normalizeDataTimeGaps === true ) {
				// now look to fill in "zero" values to make interpolation look better
				parent.insertNormalizedDurationIntoLayerData(layerData);
			}
			
			if ( self.layerPostProcessCallback() ) {
				layerData = self.layerPostProcessCallback().call(self.me, groupId, layerData);
			}
			
			var rangeX = [rawGroupData[0].date, rawGroupData[rawGroupData.length - 1].date];
			if ( minX === undefined || rangeX[0].getTime() < minX.getTime() ) {
				minX = rangeX[0];
			}
			if ( maxX === undefined || rangeX[1].getTime() > maxX.getTime() ) {
				maxX = rangeX[1];
			}
			stack.offset(internalStackOffsetFn(layerData)); // pass layer data to offset, to calculate reverse and negative shifts
			var layers = stack(layerData);
			groupLayers[groupId] = layers;
			var rangeY = [d3.min(layers[0].values, function(d) { return d.y0; }), 
							d3.max(layers[layers.length - 1].values, function(d) { return d.y0 + d.y; })];
			if ( minY === undefined || rangeY[0] < minY ) {
				minY = rangeY[0];
			}
			if ( maxY === undefined || rangeY[1] > maxY ) {
				maxY = rangeY[1];
			}
		});
		
		// setup X domain
		if ( minX !== undefined && maxX !== undefined ) {
			self.x.domain([minX, maxX]);
		}
		
		// setup Y domain
		if ( minY !== undefined && maxY !== undefined ) {
			self.y.domain([minY, maxY]).nice();
		}
		
		self.computeUnitsY();
	}
	
	function yAxisTicks() {
		return (self.wiggle() === true 
			? [] // no y-axis in wiggle mode
			: superYAxisTicks());
	}
	
	/**
	 * Clear out all data associated with this chart. Does not redraw.
	 * 
	 * @return this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
	self.reset = function() {
		superReset();
		groupLayers = {};
		return self.me;
	};
	
	/**
	 * Get or set the d3 stack offset.
	 * 
	 * This can be any supported d3 stack offset, such as 'wiggle' or a custom function.
	 * 
	 * @param {string|function} [value] the stack offset to use
	 * @return when used as a getter, the stack offset value, otherwise this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
	self.stackOffset = function(value) {
		if ( !arguments.length ) return stackOffset;
		stackOffset = value;
		return self.me;
	};
	
	/**
	 * Get or set the "wiggle" stack offset method.
	 * 
	 * This is an alias for the {@link #stackOffset} function, specifically to set the {@code wiggle}
	 * style offset if passed <em>true</em> or the {@code zero} offset if <em>false</em>.
	 * 
	 * @param {boolean} [value] <em>true</em> to use the {@code wiggle} offset, <em>false</em> to use {@code zero}
	 * @return when used as a getter, <em>true</em> if {@code wiggle} is the current offset, <em>false</em> otherwise;
	 *         when used as a setter, this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
	self.wiggle = function(value) {
		if ( !arguments.length ) return (stackOffset === 'wiggle');
		return self.stackOffset(value === true ? 'wiggle' : 'zero');
	};
	
	/**
	 * Get or set the flag to normalize the data for time gaps.
	 * Defaults to <b>false</b>.
	 * 
	 * @param {function} [value] the flag value
	 * @return when used as a getter, the current flag value, otherwise this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
	self.normalizeDataTimeGaps = function(value) {
		if ( !arguments.length ) return normalizeDataTimeGaps;
		normalizeDataTimeGaps = (value === true);
		return self.me;
	};
	
	/**
	 * Iterate over the time values in the chart's data, calling a function for each date.
	 * The callback function will be passed an object with source IDs for keys with corresponding
	 * data value objects as values. If a source does not have a value for a given date, that key
	 * will not be defined. The callback function will be passed a second Date argument representing
	 * the date of the associated data. The callback's <code>this</code> object will be set to this chart object.
	 * 
	 * @param {function} callback - The callback function to invoke.
	 * @return This object.
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
	self.enumerateDataOverTime = function(callback) {
		if ( typeof callback !== 'function' ) {
			return self.me;
		}
		var groupIds = self.groupIds,
			layerContext = {},
			callbackData,
			date = self.xDomain()[0];
		if ( !groupIds || groupIds.length < 1 ) {
			return self.me;
		}
		// there can be holes in the data, and each group can have different data array lengths, 
		// so our iteration over time is a bit more complicated than simply iterating over array elements 
		while ( true ) {
			callbackData = { date : date, data : {} };
			groupIds.forEach(function(groupId) {
				var groupArray = groupLayers[groupId];
				if ( layerContext[groupId] === undefined ) {
					layerContext[groupId] = { index : 0 };
				}
				if ( !groupArray || groupArray.length < 1 || groupArray[0].values.length <= layerContext[groupId].index ) {
					return;
				}
				if ( layerContext[groupId].date === undefined ) {
					layerContext[groupId].date = groupArray[0].values[0].date;
				}
				if ( groupArray[0].values[layerContext[groupId].index].date.getTime() === date.getTime() ) {
					groupArray.forEach(function(sourceLayer) {
						callbackData.data[sourceLayer.key] = sourceLayer.values[layerContext[groupId].index];
					});
					layerContext[groupId].index += 1;
					layerContext[groupId].date = (layerContext[groupId].index < groupArray[0].values.length 
						? groupArray[0].values[layerContext[groupId].index].date 
						: null);
				}
			});
			callback.call(self.me, callbackData.data, date);
			
			// move to the next available date, which is the smallest in our layer context or null if no more data
			date = layerContext[groupIds.reduce(function(l, r) {
				var lDate = layerContext[l].date,
					rDate = layerContext[r].date;
				if ( !lDate ) {
					return r;
				}
				if ( !rDate ) {
					return l;
				}
				return (lDate < rDate ? l : r);
			})].date;
			if ( !date ) {
				break;
			}
		}
		return self.me;
	};

	Object.defineProperties(self, {
		negativeOffsetFromReversePlotProperty : { get : function() { return negativeOffsetFromReversePlotProperty; }, set : function(v) { negativeOffsetFromReversePlotProperty = v; } },
		groupOpacityFn : { value : groupOpacityFn },
		discardId : { value : discardId },
		groupLayers : { get : function() { return groupLayers; } }
	});
	parseConfiguration();
	
	// override config function
	self.parseConfiguration = parseConfiguration;
	
	// override our setup funciton
	self.setup = setup;

	// override yAxisTicks to support wiggle
	self.yAxisTicks = yAxisTicks;

	return self;
};

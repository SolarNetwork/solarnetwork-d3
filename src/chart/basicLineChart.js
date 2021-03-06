import "baseTimeChart";

/**
 * @typedef sn.chart.basicLineChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[30, 0, 30, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [ruleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {number} [vertRuleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @preserve
 */

/**
 * A basic line chart without groupings.
 *
 * @class
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.basicLineChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.basicLineChart}
 * @preserve
 */
sn.chart.basicLineChart = function(containerSelector, chartConfig) {
	var parent = sn.chart.baseTimeChart(containerSelector, chartConfig),
		superDraw = sn.util.superMethod.call(parent, 'draw');
	var self = sn_util_copyAll(parent);
	self.me = self;

	// properties
	var sourceExcludeCallback;

	var originalData = {}, // line ID -> raw data array
		lineIds = [], // ordered array of line IDs
		linePlotProperties = {}, // line ID -> plot property name
		lineDrawData = [];

	var linePathGenerator = d3.svg.line()
		.interpolate('monotone')
		.x(function(d) {
			return (Math.round(parent.x(d.date) + 0.5) - 0.5);
		})
		.y(function(d) {
			var lineId = this.getAttribute('class'),
				plotProp = (linePlotProperties[lineId] ? linePlotProperties[lineId] : parent.plotPropertyName),
				val = d[plotProp];
			return (Math.round(parent.y(val === undefined ? null : val) + 0.5) - 0.5);
		});

	var colorArray;
	var colors = d3.scale.ordinal()
		.range(colorbrewer.Set3[12]);

	/**
	 * Add data for a single line in the chart. The data is appended if data has
	 * already been loaded for the given line ID. This does not redraw the chart.
	 * Once all line data has been loaded, call {@link #regenerate()} to draw.
	 *
	 * @param {Array} rawData - The raw chart data to load.
	 * @param {String} lineId - The ID to associate with the data; each line must have its own ID
	 * @param {String} plotProperty - A property of the raw data to plot for the line. If not specified,
	 *                                the chart-wide plot property for the configured aggregate level will
	 *                                be used.
	 * @returns this object
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
	self.load = function(rawData, lineId, plotProperty) {
		if ( originalData[lineId] === undefined ) {
			lineIds.push(lineId);
			originalData[lineId] = rawData;
		} else {
			originalData[lineId] = originalData[lineId].concat(rawData);
		}
		if ( plotProperty ) {
			linePlotProperties[lineId] = plotProperty;
		} else if ( linePlotProperties[lineId] ) {
			delete linePlotProperties[lineId];
		}
		return self.me;
	};

	/**
	 * Get or set the source exclude callback function. The callback will be passed the line ID
	 * as an argument. It should true <em>true</em> if the data set for the given argument
	 * should be excluded from the chart.
	 *
	 * @param {function} [value] the source exclude callback
	 * @return when used as a getter, the current source exclude callback function, otherwise this object
	 * @memberOf sn.chart.basicLineChart
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
	 * Get or set a range of colors to display. The order of the the data passed to the {@link load()}
	 * function will determine the color used from the configured {@code colorArray}.
	 *
	 * @param {Array} array An array of valid SVG color values to set.
	 * @return when used as a getter, the current color array, otherwise this object
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
	self.colors = function(array) {
		if ( !arguments.length ) return colors.range();
		colorArray = array;
		colors.range(array);
		return self.me;
	};

	/**
	 * Get the d3 ordinal color scale.
	 *
	 * @return {Object} A D3 ordinal scale of color values.
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
	self.colorScale = function() {
		return colors;
	};

	self.data = function(lineId) {
		return originalData[lineId];
	};

	self.reset = function() {
		parent.reset();
		originalData = {};
		lineIds.length = 0;
		linePlotProperties = {};
		lineDrawData.length = 0;
		return self.me;
	};

	function setup() {
		var plotPropName = parent.plotPropertyName,
			rangeX = [null, null],
			rangeY = [null, null];

		lineDrawData = [];

		lineIds.forEach(function(lineId) {
			var rawLineData = self.data(lineId);

			if ( rawLineData ) {
				rawLineData.forEach(function(d) {
					var y;

					// set up date for X axis
					if ( d.date === undefined ) {
						// automatically create Date
						d.date = sn.api.datum.datumDate(d);
					}

					if ( !sourceExcludeCallback || !sourceExcludeCallback.call(this, lineId) ) {
						// adjust X axis range
						if ( rangeX[0] === null || d.date < rangeX[0] ) {
							rangeX[0] = d.date;
						}
						if ( rangeX[1] === null || d.date > rangeX[1] ) {
							rangeX[1] = d.date;
						}

						// adjust Y axis range
						y = d[linePlotProperties[lineId] ? linePlotProperties[lineId] : plotPropName];
						if ( y !== undefined ) {
							if ( rangeY[0] === null || y < rangeY[0] ) {
								rangeY[0] = y;
							}
							if ( rangeY[1] === null || y > rangeY[1] ) {
								rangeY[1] = y;
							}
						}
					}
				});
			}

			lineDrawData.push(rawLineData);
		});

		// setup colors
		colors.domain(lineIds.length);
		if ( !(colorArray && colorArray.length > 0) ) {
			// set an automatic color range based on the number of lines
			colors.range(colorbrewer.Set3[lineIds.length < 3 ? 3 : lineIds.length > 11 ? 12 : lineIds.length]);
		}

		// setup X domain
		parent.x.domain(rangeX);

		// setup Y domain
		parent.y.domain(rangeY).nice();

		parent.computeUnitsY();
	}

	// return a class attribute value of the line ID, to support drawing in the line generator
	function lineClass(d, i) {
		!d; // work around UglifyJS warning https://github.com/mishoo/UglifyJS2/issues/789
		return lineIds[i];
	}

	function lineStroke(d, i) {
		!d; // work around UglifyJS warning https://github.com/mishoo/UglifyJS2/issues/789
		return colors(i);
	}

	function lineOpacity(d, i) {
		!d; // work around UglifyJS warning https://github.com/mishoo/UglifyJS2/issues/789
		var hidden = (sourceExcludeCallback ? sourceExcludeCallback.call(this, lineIds[i]) : false);
		return (hidden ? 1e-6 : 1);
	}

	function lineCommonProperties(selection) {
		selection
				.style('opacity', lineOpacity)
				.attr('stroke', lineStroke)
				.attr('d', linePathGenerator);
	}

	function draw() {
		var transitionMs = parent.transitionMs(),
			lines;

		lines = parent.svgDataRoot.selectAll('path').data(lineDrawData, function(d, i) {
			!d; // work around UglifyJS warning https://github.com/mishoo/UglifyJS2/issues/789
			return lineIds[i];
		});

		lines.attr('class', lineClass)
			.transition().duration(transitionMs)
				.call(lineCommonProperties);

		lines.enter().append('path')
				.attr('class', lineClass)
				.call(lineCommonProperties);

		lines.exit().transition().duration(transitionMs)
			.style('opacity', 1e-6)
			.remove();

		superDraw();
		// TODo: drawAxisXRules();
	}
	/* TODO
	function axisXVertRule(d) {
		return (Math.round(parent.x(d) + 0.5) - 0.5);
	}

	function drawAxisXRules(vertRuleTicks) {
		var transitionMs = parent.transitionMs(),
			axisLines,
			labelTicks;

		labelTicks = trimToXDomain(vertRuleTicks);
		axisLines = svgVertRuleGroup.selectAll("line").data(labelTicks, keyX),

		axisLines.transition().duration(transitionMs)
	  		.attr("x1", valueXVertRule)
	  		.attr("x2", valueXVertRule);

		axisLines.enter().append("line")
			.style("opacity", 1e-6)
			.attr("x1", valueXVertRule)
	  		.attr("x2", valueXVertRule)
	  		.attr("y1", 0)
	  		.attr("y2", parent.height + 10)
		.transition().duration(transitionMs)
			.style("opacity", vertRuleOpacity())
			.each('end', function() {
				// remove the opacity style
				d3.select(this).style("opacity", null);
			});

		axisLines.exit().transition().duration(transitionMs)
			.style("opacity", 1e-6)
			.remove();
	}
	*/

	/**
	 * Iterate over the time values in the chart's raw data, calling a function for each date.
	 * The callback function will be passed an object with source IDs for keys with corresponding
	 * data value objects as values. If a source does not have a value for a given date, that key
	 * will not be defined. The callback function will be passed a second Date argument representing
	 * the date of the associated data. The callback's <code>this</code> object will be set to this chart object.
	 *
	 * @param {function} callback - The callback function to invoke, provided with the data and date arguments.
	 * @return This object.
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
	self.enumerateDataOverTime = function(callback) {
		if ( typeof callback !== 'function' ) {
			return self.me;
		}
		if ( !lineIds || lineIds.length < 1 ) {
			return self.me;
		}

		// merge all data into single array, then sort by time for iteration
		var dataArray = [],
			datumDate = sn.api.datum.datumDate,
			callbackData = { date: null, data: {} };

		lineIds.forEach(function(lineId) {
			dataArray.push(originalData[lineId]);
		});
		dataArray = d3.merge(dataArray).sort(function(l, r) {
			var lD = datumDate(l);
			if ( !l.date ) {
				l.date = lD;
			}
			var lR = datumDate(r);
			if ( !r.date ) {
				r.date = rD;
			}
			return (lD < lR ? -1 : lD > lR ? 1 : 0);
		});

		dataArray.forEach(function(d) {
			var date = datumDate(d);
			if ( callbackData.date && date > callbackData.date ) {
				// moving to new date... invoke callback with current data
				callback.call(self.me, callbackData.data, callbackData.date);
				callbackData.date = date;
				callbackData.data = {};
			} else if ( !callbackData.date ) {
				callbackData.date = date;
			}
			callbackData.data[d.sourceId] = d;
		});

		return self.me;
	};

	// wire up implementations
	parent.setup = setup;
	parent.draw = draw;

	return self;
};

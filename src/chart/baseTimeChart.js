import "chart";
import "../api/datum/date";
import "../config/Configuration";
import "../ui/pixelWidth";
import "../util/util";

sn.chart.baseTimeChart = function(containerSelector, chartConfig) {
	var self = {
		version : '1.0.0'
	};
	
	var me = self;
	
	var internalPropName = '__internal__';
	var aggregates = ['FiveMinute', 'TenMinute','FifteenMinute','Hour', 'HourOfDay', 'SeasonalHourOfDay', 
			'Day', 'DayOfWeek', 'SeasonalDayOfWeek', 'Month'];

	var config = (chartConfig || new sn.Configuration());
	
	// default to container's width, if we can
	var containerWidth = sn.ui.pixelWidth(containerSelector);
	
	var p = (config.padding || [10, 0, 20, 30]),
		w = (config.width || containerWidth || 812) - p[1] - p[3],
		h = (config.height || 300) - p[0] - p[2],
    	x = d3.time.scale.utc().range([0, w]),
		y = d3.scale.linear().range([h, 0]);

	// String, one of supported SolarNet aggregate types: Month, Day, Hour, or Minute
	var aggregateType;
	
	// mapping of aggregateType keys to associated data property names, e.g. 'watts' or 'wattHours'
	var plotProperties;
	
	var transitionMs; // will default to 600
	var ruleOpacity; // will default to 0.1
	var vertRuleOpacity; // will default to 0.05
	
	var svgRoot,
		svgTickGroupX,
		svgDataRoot,
		svgRuleRoot,
		svgAnnotRoot,
		svgHoverRoot,
		svgPointerCapture;
	
	var displayFactorCallback = undefined; // function accepts (maxY) and should return the desired displayFactor
	var drawAnnotationsCallback = undefined; // function accepts (svgAnnotRoot)
	var xAxisTickCallback = undefined; // function accepts (d, i, x, numTicks)

	var hoverEnterCallback = undefined,
		hoverMoveCallback = undefined,
		hoverLeaveCallback = undefined,
		rangeSelectionCallback = undefined,
		doubleClickCallback = undefined;

	// keep track of callback handlers attached to specific events
	var userInteractionHandlerCount = (function() {
		var counts = {};
		Object.keys(sn.tapEventNames).forEach(function(n) {
			counts[sn.tapEventNames[n]] = 0;
		});
		return counts;
	}());
	var lastUserInteractionInfo = { time : 0 };
	
	// display units in kW if domain range > 1000
	var displayFactor = 1;
	var displayFormatter = d3.format(',d');

	var xAxisTickCount = 12;
	var yAxisTickCount = 5;
	
	var draw = function() {	
		// extending classes should do something here...
		drawAxisX();
		drawAxisY();
	};
	
	var handleHoverEnter = function() {
		if ( !hoverEnterCallback ) {
			return;
		}
        hoverEnterCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
	};
	
	var handleHoverMove = function() {
		if ( !hoverMoveCallback ) {
			return;
		}
        hoverMoveCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
	};
	
	var handleHoverLeave = function() {
		if ( !hoverLeaveCallback ) {
			return;
		}
        hoverLeaveCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
	};
	
	var handleClick = function() {
		if ( !clickCallback ) {
			return;
		}
        clickCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
	};
	
	var handleDoubleClick = function() {
		if ( !doubleClickCallback ) {
			return;
		}
        doubleClickCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
	};
	
	function registerUserInteractionHandler(tapEventName, container, handler) {
		var eventName = sn.tapEventNames[tapEventName];
		if ( !eventName ) {
			return;
		}
		if ( !container.on(eventName) ) {
			container.on(eventName, handler);
		}
		userInteractionHandlerCount[eventName] += 1;
	}
	
	function unregisterUserInteractionHandler(tapEventName, container, handler) {
		var eventName = sn.tapEventNames[tapEventName];
		if ( !eventName ) {
			return;
		}
		userInteractionHandlerCount[eventName] -= 1;
		if ( userInteractionHandlerCount[eventName] < 1 ) {
			container.on(eventName, null);
		}
	}
		
	function handleClickInternal() {
		var event = d3.event,
			time = new Date().getTime(),
			dt = time - lastUserInteractionInfo.time,
			that = this;
		lastUserInteractionInfo.time = time;
		if ( event.type === 'dblclick' || (sn.hasTouchSupport && dt < 500) ) {
			// double click
			if ( lastUserInteractionInfo.timer ) {
				clearTimeout(lastUserInteractionInfo.timer);
				delete lastUserInteractionInfo.timer;
			}
			handleDoubleClick.call(that);
		} else if ( sn.hasTouchSupport ) {
			// set timeout for single click
			lastUserInteractionInfo.timer = setTimeout(function() {
				var prevEvent = d3.event;
				try {
					d3.event = event;
					handleClick.call(that);
				} finally {
					d3.event = prevEvent;
				}
			}, 500);
			event.preventDefault();
		} else {
			handleClick.call(that);
		}
	}
	
	function parseConfiguration() {
		self.aggregate(config.aggregate);
		self.plotProperties(config.value('plotProperties'));
		transitionMs = (config.value('transitionMs') || 600);
		ruleOpacity = (config.value('ruleOpacity') || 0.1);
		vertRuleOpacity = (config.value('vertRuleOpacity') || 0.05);
	}
	
	svgRoot = d3.select(containerSelector).select('svg');
	if ( svgRoot.empty() ) {
		svgRoot = d3.select(containerSelector).append('svg:svg');
	}
	svgRoot.attr('class', 'chart')
		.attr('width', w + p[1] + p[3])
		.attr('height', h + p[0] + p[2])
		.selectAll('*').remove();
	
	svgDataRoot = svgRoot.append('g')
		.attr('class', 'data-root')
		.attr('transform', 'translate(' + p[3] +',' +p[0] +')');
		
	svgTickGroupX = svgRoot.append('g')
		.attr('class', 'ticks')
		.attr('transform', 'translate(' + p[3] +',' +(h + p[0] + p[2]) +')');

	svgRoot.append('g')
		.attr('class', 'crisp rule')
		.attr('transform', 'translate(0,' + p[0] + ')');

	svgRuleRoot = svgRoot.append('g')
		.attr('class', 'rule')
		.attr('transform', 'translate(' + p[3] +',' +p[0] +')');
		
	svgAnnotRoot = svgRoot.append('g')
		.attr('class', 'annot-root')
		.attr('transform', 'translate(' + p[3] +',' +p[0] +')');

	function computeUnitsY() {
		var fmt;
		var maxY = d3.max(y.domain(), function(v) { return Math.abs(v); });
		displayFactor = 1;
		
		if ( displayFactorCallback ) {
			displayFactor = displayFactorCallback.call(me, maxY);
		} else if ( maxY >= 1000000000 ) {
			displayFactor = 1000000000;
		} else if ( maxY >= 1000000 ) {
			displayFactor = 1000000;
		} else if ( maxY >= 1000 ) {
			displayFactor = 1000;
		}

		if ( displayFactor === 1 ) {
			fmt = ',d';
		} else {
			fmt = ',g';
		}
		
		displayFormatter = d3.format(fmt);
	}
	
	function displayFormat(d) {
		return displayFormatter(d / displayFactor);
	}
	
	function plotPropertyName() {
		return plotProperties[aggregateType];
	}

	function plotReversePropertyName() {
		return plotProperties[aggregateType] + 'Reverse';
	}

	function setup() {
		// extending classes should do something here...
				
		computeUnitsY();
	}
	
	function axisYTransform(d) {
		// align to half-pixels, to 1px line is aligned to pixels and crisp
		return "translate(0," + (Math.round(y(d) + 0.5) - 0.5) + ")"; 
	}

	function axisRuleClassY(d) {
		return (d === 0 ? 'origin' : 'm');
	}

	function axisTextClassY(d) {
		return (d === 0 ? 'origin' : null);
	}

	function axisXTickClassMajor(d) {
		return (aggregateType.indexOf('Minute') >= 0 && d.getUTCHours() === 0)
			|| (aggregateType === 'Hour' && d.getUTCHours() === 0)
			|| (aggregateType === 'Day' && d.getUTCDate() === 1)
			|| (aggregateType === 'Month' && d.getUTCMonth() === 0);
	}
	
	function xAxisTicks() {
		return x.ticks(xAxisTickCount);
	}
	
	function xAxisTickFormatter() {
		var fxDefault = x.tickFormat(xAxisTickCount);
		return function(d, i) {
			if ( xAxisTickCallback ) {
				return xAxisTickCallback.call(me, d, i, x, fxDefault);
			} else {
				return fxDefault(d, i);
			}
		};
	}

	function drawAxisX() {
		if ( d3.event && d3.event.transform ) {
			d3.event.transform(x);
		}
		var ticks = xAxisTicks();
		var fx = xAxisTickFormatter();

		// Generate x-ticks
		var labels = svgTickGroupX.selectAll('text').data(ticks)
				.classed({
						major : axisXTickClassMajor
					});
		
		labels.transition().duration(transitionMs)
				.attr('x', x)
				.text(fx);
		
		labels.enter().append('text')
				.attr('dy', '-0.5em') // needed so descenders not cut off
				.style('opacity', 1e-6)
				.attr('x', x)
				.classed({
						major : axisXTickClassMajor
					})
			.transition().duration(transitionMs)
				.style('opacity', 1)
				.text(fx)
				.each('end', function() {
						// remove the opacity style
						d3.select(this).style('opacity', null);
					});
		labels.exit().transition().duration(transitionMs)
			.style('opacity', 1e-6)
			.remove();
	}
	
	function yAxisTicks() {
		return y.ticks(yAxisTickCount);
	}
	
	function drawAxisY() {
		var yTicks = yAxisTicks();
		var axisLines = svgRoot.select('g.rule').selectAll('g').data(yTicks, Object);
		var axisLinesT = axisLines.transition().duration(transitionMs);
		
		axisLinesT.attr('transform', axisYTransform).select('text')
				.text(displayFormat)
				.attr('class', axisTextClassY);
		axisLinesT.select('line')
				.attr('class', axisRuleClassY);
		
	  	axisLines.exit().transition().duration(transitionMs)
	  			.style('opacity', 1e-6)
	  			.remove();
	  			
		var entered = axisLines.enter()
				.append('g')
				.style('opacity', 1e-6)
	  			.attr('transform', axisYTransform);
		entered.append('line')
				.attr('x2', w + p[3])
				.attr('x1', p[3])
				.attr('class', axisRuleClassY);
		entered.append('text')
				.attr('x', p[3] - 10)
				.text(displayFormat)
				.attr('class', axisTextClassY);
		entered.transition().duration(transitionMs)
				.style('opacity', 1)
				.each('end', function() {
					// remove the opacity style
					d3.select(this).style('opacity', null);
				});
	}

	/**
	 * Scale a date for the x-axis.
	 * 
	 * @param {Date} the Date to scale
	 * @return {Number} the scaled value
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.scaleDate = function(date) { return x(date); };

	/**
	 * Scale a value for the y-axis.
	 * 
	 * @param {Number} the value to scale
	 * @return {Number} the scaled value
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.scaleValue = function(value) { return y(value); };
	
	/**
	 * Get the x-axis domain (minimum and maximum dates).
	 * 
	 * @return {number[]} an array with the minimum and maximum values used in the x-axis of the chart
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.xDomain = function() { return x.domain(); };

	/**
	 * Get the y-axis domain (minimum and maximum values).
	 * 
	 * @return {number[]} an array with the minimum and maximum values used in the y-axis of the chart
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.yDomain = function() { return y.domain(); };
	
	/**
	 * Get the scaling factor the y-axis is using. By default this will return {@code 1}.
	 * After calling the {@link #load()} method, however, the chart may decide to scale
	 * the y-axis for clarity. You can call this method to find out the scaling factor the
	 * chart ended up using.
	 *  
	 * @return the y-axis scale factor
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.yScale = function() { return (displayFactorCallback ? displayFactorCallback() : displayFactor); };

	/**
	 * Get the current {@code aggregate} value in use.
	 * 
	 * @param {number} [value] the number of consumption sources to use
	 * @returns when used as a getter, the count number, otherwise this object
	 * @returns the {@code aggregate} value
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.aggregate = function(value) { 
		if ( !arguments.length ) return aggregateType;
		var idx = aggregates.indexOf(value);
		aggregateType = (idx < 0 ? 'Hour' : value);
		return me;
	};
	
	/**
	 * Get the expected normalized duration, in milliseconds, based on the configured aggregate level.
	 * 
	 * @returns The expected normalized millisecond duration for the configured aggregate level.
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.aggregateNormalizedDuration = function() {
		if ( aggregateType === 'FiveMinute' ) {
			return (1000 * 60 * 5);
		}
		if ( aggregateType === 'TenMinute' ) {
			return (1000 * 60 * 10);
		}
		if ( aggregateType === 'FifteenMinute' ) {
			return (1000 * 60 * 15);
		}
		if ( aggregateType === 'Hour' || aggregateType === 'HourOfDay' || aggregateType === 'SeasonalHourOfDay' ) {
			return (1000 * 60 * 60);
		}
		if ( aggregateType === 'Day' || aggregateType === 'DayOfWeek' || aggregateType === 'SeasonalDayOfWeek' ) {
			return (1000 * 60 * 60 * 24);
		}
		if ( aggregateType === 'Month' ) {
			return (1000 * 60 * 60 * 24 * 30); // NOTE: this is approximate!
		}
		return (1000 * 60); // otherwise, default to minute duration
	};
	
	/**
	 * Test if two dates are the expected aggregate normalized duration apart.
	 *
	 * @returns True if the two dates are exactly one normalized aggregate duration apart.
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.isNormalizedDuration = function(d1, d2) {
		var diff, 
			expectedDiff = self.aggregateNormalizedDuration(),
			v1;
		if ( !(d1 && d2) ) {
			return false;
		}
		diff = Math.abs(d2.getTime() - d1.getTime());
		if ( diff === expectedDiff ) {
			return true;
		}
		
		// make sure d1 < d2
		if ( d2.getTime() < d1.getTime() ) {
				v1 = d1;
				d1 = d2;
				d2 = v1;
		}
		
		if ( aggregateType === 'Month' ) {
			// test if months are only 1 apart
			return (d3.time.month.utc.offset(d1, 1).getTime() === d2.getTime());
		}
		
		if ( aggregateType === 'SeasonalHourOfDay' ) {
			// test just if hour only 1 apart
			v1 = d1.getUTCHours() + 1;
			if ( v1 > 23 ) {
				v1 = 0;
			}
			return (d2.getUTCHours() === v1 && d1.getTime() !== d2.getTime());
		}
		
		if ( aggregateType === 'SeasonalDayOfWeek' ) {
			// test just if DOW only 1 apart
			v1 = d1.getUTCDay() + 1;
			if ( v1 > 6 ) {
				v1 = 0;
			}
			return (d2.getUTCDay() === v1 && d1.getTime() !== d2.getTime());
		}
		
		return false;
	};
	
	/**
	 * Add an aggregate normalized time duration to a given date.
	 *
	 * @param date The date to add to.
	 * @returns A new Date object.
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.addNormalizedDuration = function(date) {
		if ( !date ) {
			return undefined;
		}
		if ( aggregateType === 'Month' ) {
			return d3.time.month.utc.offset(date, 1);
		}
		return new Date(date.getTime() + self.aggregateNormalizedDuration());
	};
	
	/**
	 * Clear out all data associated with this chart. Does not redraw. If 
	 * {@link hoverLeaveCallback} is defined, it will be called with no arguments.
	 * 
	 * @return this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.reset = function() {
		if ( svgHoverRoot ) {
			handleHoverLeave();
		}
		return me;
	};
	
	/**
	 * Regenerate the chart, using the current data.
	 * 
	 * @returns this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.regenerate = function() {
		parseConfiguration();
		self.setup();
		self.draw();
		if ( drawAnnotationsCallback ) {
			drawAnnotationsCallback.call(me, svgAnnotRoot);
		}
		return me;
	};
	
	/**
	 * Get or set the animation transition time, in milliseconds.
	 * 
	 * @param {number} [value] the number of milliseconds to use
	 * @return when used as a getter, the millisecond value, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.transitionMs = function(value) {
		if ( !arguments.length ) return transitionMs;
		transitionMs = +value; // the + used to make sure we have a Number
		return me;
	};

	/**
	 * Get or set the plot property names for all supported aggregate levels.
	 * 
	 * When used as a setter, an Object with properties of the following names are supported:
	 * 
	 * <ul>
	 *   <li>FiveMinute</li>
	 *   <li>TenMinute</li>
	 *   <li>FifteenMinute</li>
	 *   <li>Hour</li>
	 *   <li>HourOfDay</li>
	 *   <li>SeasonalHourOfDay</li>
	 *   <li>Day</li>
	 *   <li>DayOfWeek</li>
	 *   <li>SeasonalDayOfWeek</li>
	 *   <li>Month</li>
	 * </ul>
	 * 
	 * Each value should be the string name of the datum property to plot on the y-axis of the chart.
	 * If an aggregate level is not defined, it will default to {@code watts}.
	 * 
	 * @param {object} [value] the aggregate property names to use
	 * @return when used as a getter, the current plot property value mapping object, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.plotProperties = function(value) {
		if ( !arguments.length ) return plotProperties;
		var p = {};
		aggregates.forEach(function(e) {
			p[e] = (value !== undefined && value[e] !== undefined ? value[e] : 'watts');
		});
		plotProperties = p;
		return me;
	};

	/**
	 * Get or set the display factor callback function. The callback will be passed the absolute maximum 
	 * Y domain value as an argument. It should return a number representing the scale factor to use
	 * in Y-axis labels.
	 * 
	 * @param {function} [value] the display factor exclude callback
	 * @return when used as a getter, the current display factor callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.displayFactorCallback = function(value) {
		if ( !arguments.length ) return displayFactorCallback;
		if ( typeof value === 'function' ) {
			displayFactorCallback = value;
		} else {
			displayFactorCallback = undefined;
		}
		return me;
	};

	/**
	 * Get or set the draw annotations callback function, which is called after the chart completes drawing.
	 * The function will be passed a SVG <code>&lt;g class="annot-root"&gt;</code> element that
	 * represents the drawing area for the chart data.
	 * 
	 * @param {function} [value] the draw callback
	 * @return when used as a getter, the current draw callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.drawAnnotationsCallback = function(value) {
		if ( !arguments.length ) return drawAnnotationsCallback;
		if ( typeof value === 'function' ) {
			drawAnnotationsCallback = value;
		} else {
			drawAnnotationsCallback = undefined;
		}
		return me;
	};
	
	function getOrCreateHoverRoot() {
		if ( !svgHoverRoot ) {
			svgHoverRoot = svgRoot.append('g')
				.attr('class', 'hover-root')
				.attr('transform', 'translate(' + p[3] +',' +p[0] +')');
			svgPointerCapture = svgRoot.append('rect')
				.attr('width', w)
				.attr('height', h)
				.attr('fill', 'none')
				.attr('pointer-events', 'all')
				.attr('class', 'pointer-capture')
				.attr('transform', 'translate(' + p[3] +',' +p[0] +')');
		}
		return svgPointerCapture;
	}
	
	/**
	 * Get or set a mouseover callback function, which is called in response to mouse entering
	 * the data area of the chart.
	 * 
	 * @param {function} [value] the mouse enter callback
	 * @return when used as a getter, the current mouse enter callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.hoverEnterCallback = function(value) {
		if ( !arguments.length ) return hoverEnterCallback;
		var root = getOrCreateHoverRoot();
		if ( typeof value === 'function' ) {
			hoverEnterCallback = value;
			root.on('mouseover', handleHoverEnter);
		} else {
			hoverEnterCallback = undefined;
			root.on('mouseover', null);
		}
		return me;
	};
	
	/**
	 * Get or set a mousemove callback function, which is called in response to mouse movement
	 * over the data area of the chart.
	 * 
	 * @param {function} [value] the hover callback
	 * @return when used as a getter, the current hover callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.hoverMoveCallback = function(value) {
		if ( !arguments.length ) return hoverMoveCallback;
		var root = getOrCreateHoverRoot();
		if ( typeof value === 'function' ) {
			getOrCreateHoverRoot();
			hoverMoveCallback = value;
			root.on('mousemove', handleHoverMove);
		} else {
			hoverMoveCallback = undefined;
			root.on('mousemove', null);
		}
		return me;
	};
	
	/**
	 * Get or set a mouseout callback function, which is called in response to mouse leaving
	 * the data area of the chart.
	 * 
	 * @param {function} [value] the mouse enter callback
	 * @return when used as a getter, the current mouse leave callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.hoverLeaveCallback = function(value) {
		if ( !arguments.length ) return hoverLeaveCallback;
		var root = getOrCreateHoverRoot();
		if ( typeof value === 'function' ) {
			hoverLeaveCallback = value;
			root.on('mouseout', handleHoverLeave);
		} else {
			hoverLeaveCallback = undefined;
			root.on('mouseout', null);
		}
		return me;
	};
	
	/**
	 * Get or set a dblclick callback function, which is called in response to mouse double click
	 * events on the data area of the chart.
	 * 
	 * @param {function} [value] the double click callback
	 * @return when used as a getter, the current double click callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.doubleClickCallback = function(value) {
		if ( !arguments.length ) return doubleClickCallback;
		var root = getOrCreateHoverRoot();
		if ( typeof value === 'function' ) {
			doubleClickCallback = value;
			registerUserInteractionHandler('dblclick', root, handleClickInternal);
		} else {
			doubleClickCallback = undefined;
			unregisterUserInteractionHandler('dblclick', root, handleClickInternal);
		}
		return me;
	};
	
	/**
	 * Get or set a range selection callback function, which is called in response to mouse click or touch start
	 * events on the data area of the chart.
	 * 
	 * @param {function} [value] the range selection callback
	 * @return when used as a getter, the current range selection callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.rangeSelectionCallback = function(value) {
		if ( !arguments.length ) return rangeSelectionCallback;
		var root = getOrCreateHoverRoot();
		if ( typeof value === 'function' ) {
			rangeSelectionCallback = value;
			registerUserInteractionHandler('click', root, handleClickInternal);
		} else {
			rangeSelectionCallback = undefined;
			unregisterUserInteractionHandler('click', root, handleClickInternal);
		}
		return me;
	};
	
	/**
	 * Get or set the x-axis tick callback function, which is called during x-axis rendering.
	 * The function will be passed a data object, the index, the d3 scale, and the number of 
	 * ticks requested. The <code>this</code> object will be set to the chart instance.
	 * 
	 * @param {function} [value] the draw callback
	 * @return when used as a getter, the current x-axis tick callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.xAxisTickCallback = function(value) {
		if ( !arguments.length ) return xAxisTickCallback;
		if ( typeof value === 'function' ) {
			xAxisTickCallback = value;
		}
		return me;
	};

	/**
	 * Get or set the axis rule opacity value, which is used during axis rendering.
	 * Defaults to <b>0.1</b>.
	 * 
	 * @param {function} [value] the opacity value
	 * @return when used as a getter, the current axis rule opacity value, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.ruleOpacity = function(value) {
		if ( !arguments.length ) return ruleOpacity;
		ruleOpacity = value;
		return me;
	};

	/**
	 * Get or set the vertical axis rule opacity value, which is used during axis rendering.
	 * Defaults to <b>0.05</b>.
	 * 
	 * @param {function} [value] the opacity value
	 * @return when used as a getter, the current vertical axis rule opacity value, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
	self.vertRuleOpacity = function(value) {
		if ( !arguments.length ) return vertRuleOpacity;
		vertRuleOpacity = value;
		return me;
	};

	Object.defineProperties(self, {
		// extending classes should re-define this property so method chaining works
		me : { get : function() { return me; }, set : function(obj) { me = obj; } },
		x : { get : function() { return x; }, set : function(v) { x = v; } },
		y : { get : function() { return y; }, set : function(v) { y = v; } },
		xAxisTickCount : { get : function() { return xAxisTickCount; }, set : function(v) { xAxisTickCount = v; } },
		xAxisTicks : { get : function() { return xAxisTicks; }, set : function(v) { xAxisTicks = v; } },
		xAxisTickFormatter : { get : function() { return xAxisTickFormatter; }, set : function(v) { xAxisTickFormatter = v; } },
		yAxisTicks : { get : function() { return yAxisTicks; }, set : function(v) { yAxisTicks = v; } },
		yAxisTickCount : { get : function() { return yAxisTickCount; }, set : function(v) { yAxisTickCount = v; } },
		config : { value : config },
		internalPropName : { value : internalPropName },
		plotPropertyName : { get : plotPropertyName },
		plotReversePropertyName : { get : plotReversePropertyName },
		padding : { value : p },
		width : { value : w, enumerable : true },
		height : { value : h, enumerable : true },
		svgRoot : { value : svgRoot },
		svgDataRoot : { value : svgDataRoot },
		svgRuleRoot : { value : svgRuleRoot },
		svgTickGroupX : { value : svgTickGroupX },
		
		// interactive support
		svgHoverRoot : { get : function() { return svgHoverRoot; } },
		handleHoverEnter : { get : function() { return handleHoverEnter; }, set : function(v) { handleHoverEnter = v; } },
		handleHoverMove : { get : function() { return handleHoverMove; }, set : function(v) { handleHoverMove = v; } },
		handleHoverLeave : { get : function() { return handleHoverLeave; }, set : function(v) { handleHoverLeave = v; } },
		handleClick : { get : function() { return handleClick; }, set : function(v) { handleClick = v; } },
		handleDoubleClick : { get : function() { return handleDoubleClick; }, set : function(v) { handleDoubleClick = v; } },

		computeUnitsY : { value : computeUnitsY },
		drawAxisX : { get : function() { return drawAxisX; }, set : function(v) { drawAxisX = v; } },
		drawAxisY : { get : function() { return drawAxisY; }, set : function(v) { drawAxisY = v; } },
		parseConfiguration : { get : function() { return parseConfiguration; }, set : function(v) { parseConfiguration = v; } },
		draw : { get : function() { return draw; }, set : function(v) { draw = v; } },
		setup : { get : function() { return setup; }, set : function(v) { setup = v; } }
	});
	parseConfiguration();
	return self;
};

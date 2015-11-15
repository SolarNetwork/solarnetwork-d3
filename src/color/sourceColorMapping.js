import "color";
import "util";

sn.color.sourceColorMapping = sn_color_sourceColorMapping;

/**
 * @typedef sn.color.sourceColorMappingParameters
 * @type {object}
 * @property {function} [displayDataType] a function that accepts a data type and returns the display
 *                                        version of that data type
 * @property {function} [displayColor] a function that accepts a data type and a Colorbrewer color group
 * @property {boolean} [reverseColors] the Colorbrewer colors are reversed, unless this is set to {@code false}
 * @preserve
 */

/**
 * @typedef sn.color.sourceColorMap
 * @type {object}
 * @property {array} sourceList An array of full source names for display purposes.
 * TODO
 * @preserve
 */

/**
 * Create mapping of raw sources, grouped by data type, to potentially alternate names,
 * and assign Colorbrewer color values to each source.
 * 
 * The input {@code sourceMap} should contain a mapping of data types to associatd arrays
 * of sources. This is the format returned by {@link sn.availableDataRange}, on the 
 * {@code availableSourcesMap} property. For example:
 * 
 * <pre>
 * {
 *     'Consumption' : [ 'Main', 'Shed' ],
 *     'Power' : [ 'Main' ]
 * }
 * </pre>
 * 
 * The returned {@link sn.color.sourceColorMap} object contains 
 * 
 * <pre>
 * {
 *     sourceList : [ 'Consumption / Main', 'Consumption / Shed', 'Power / Main' ]
 *     displaySourceMap : {
 *         Consumption : {
 *             Main : 'Consumption / Main',
 *             Shed : 'Consumption / Shed'
 *         },
 *         Power : {
 *             Main : 'Power / Main'
 *         }
 *     },
 *     displaySourceObjects : {
 *         'Consumption / Main' : { dataType : 'Consumption', source : 'Main' },
 *         'Consumption / Shed' : { dataType : 'Consumption', source : 'Shed' },
 *         'Power / Main' : { dataType : 'Power', source : 'Main' }
 *     },
 *     reverseDisplaySourceMap : {
 *         Consumption : {
 *             'Consumption / Main' : 'Main',
 *             'Consumption / Shed' : 'Shed'
 *         },
 *         Power : {
 *             'Power / Main' : 'Main',
 *         }
 *     },
 *     colorList : [ 'red', 'light-red', 'green' ]
 *     colorMap : {
 *         'Consumption / Main' : 'red',
 *         'Consumption / Shed' : 'light-red',
 *         'Power / Main' : 'green'
 *     }
 * }
 * </pre>
 * 
 * @params {sn.color.sourceColorMappingParameters} [params] the parameters
 * @returns {sn.color.sourceColorMap}
 * @preserve
 */
function sn_color_sourceColorMapping(sourceMap, params) {
	var p = (params || {});
	var chartSourceMap = {};
	var dataType;
	var sourceList = [];
	var colorGroup;
	var sourceColors = [];
	var typeSourceList = [];
	var colorGroupIndex;
	var colorSlice;
	var result = {};
	var displayDataTypeFn;
	var displaySourceFn;
	var displayColorFn;
	
	var displayToSourceObjects = {}; // map of 'dType / source' -> { dataType : dType, source : source }
	
	if ( typeof p.displayDataType === 'function' ) {
		displayDataTypeFn = p.displayDataType;
	} else {
		displayDataTypeFn = function(dataType) {
			return (dataType === 'Power' ? 'Generation' : dataType);
		};
	}
	if ( typeof p.displaySource === 'function' ) {
		displaySourceFn = p.displaySource;
	} else {
		displaySourceFn = function(dataType, sourceId) {
			!dataType; // work around UglifyJS warning https://github.com/mishoo/UglifyJS2/issues/789
			return sourceId;
		};
	}
	if ( typeof p.displayColor === 'function' ) {
		displayColorFn = p.displayColor;
	} else {
		displayColorFn = function(dataType) {
			return (dataType === 'Consumption' ? colorbrewer.Blues : colorbrewer.Greens);
		};
	}
	function mapSources(dtype) {
		sourceMap[dtype].forEach(function(el) {
			var mappedSource;
			if ( el === '' || el === 'Main' ) {
				mappedSource = displayDataTypeFn(dtype);
			} else {
				mappedSource = displayDataTypeFn(dtype) +' / ' +displaySourceFn(dtype, el);
			}
			chartSourceMap[dtype][el] = mappedSource;
			if ( el === 'Main' ) {
				// also add '' for compatibility
				chartSourceMap[dtype][''] = mappedSource;
			}
			typeSourceList.push(mappedSource);
			sourceList.push(mappedSource);
			displayToSourceObjects[mappedSource] = { dataType : dtype, source : el, display : mappedSource };
		});
	}
	for ( dataType in sourceMap ) {
		if ( sourceMap.hasOwnProperty(dataType) ) {
			chartSourceMap[dataType] = {};
			typeSourceList.length = 0;
			mapSources(dataType);
			colorGroup = displayColorFn(dataType);
			if ( colorGroup[typeSourceList.length] === undefined ) {
				colorGroupIndex = (function() {
					var i;
					for ( i = typeSourceList.length; i < 30; i += 1 ) {
						if ( colorGroup[i] !== undefined ) {
							return i;
						}
					}
					return 0;
				}());
			} else {
				colorGroupIndex = typeSourceList.length;
			}
			colorSlice = colorGroup[colorGroupIndex].slice(-typeSourceList.length);
			if ( p.reverseColors !== false ) {
				colorSlice.reverse();
			}
			sourceColors = sourceColors.concat(colorSlice);
		}
	}
	
	// create a reverse display mapping
	var reverseDisplaySourceMap = {};
	var sourceId, displayMap;
	for ( dataType in chartSourceMap ) {
		if ( chartSourceMap.hasOwnProperty(dataType) ) {
			reverseDisplaySourceMap[dataType] = {};
			displayMap = chartSourceMap[dataType];
			for ( sourceId in  displayMap ) {
				if ( displayMap.hasOwnProperty(sourceId) ) {
					reverseDisplaySourceMap[displayMap[sourceId]] = sourceId;
				}
			}
		}
	}
	
	result.sourceList = sourceList;
	result.displaySourceMap = chartSourceMap;
	result.reverseDisplaySourceMap = reverseDisplaySourceMap;
	result.colorMap = sn.color.map(sourceColors, sourceList);
	result.displaySourceObjects = displayToSourceObjects;
	return result;
};

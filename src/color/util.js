import "color";
import "../core/runtime";

sn.color.map = sn_color_map;
sn.color.color = sn_color_color;

/**
 * Return an array of colors for a set of unique keys, where the returned
 * array also contains associative properties for all key values to thier
 * corresponding color value.
 * 
 * <p>This is designed so the set of keys always map to the same color, 
 * even across charts where not all sources may be present.</p>
 * 
 * @preserve
 */
function sn_color_map(fillColors, keys) {
	var colorRange = d3.scale.ordinal().range(fillColors);
	var colorData = keys.map(function(el, i) { return {source:el, color:colorRange(i)}; });
	
	// also provide a mapping of sources to corresponding colors
	var i, len, sourceName;
	for ( i = 0, len = colorData.length; i < len; i += 1 ) {
		// a source value might actually be a number string, which JavaScript will treat 
		// as an array index so only set non-numbers here
		sourceName = colorData[i].source;
		if ( sourceName === '' ) {
			// default to Main if source not provided
			sourceName = 'Main';
		}
		if ( isNaN(Number(sourceName)) ) {
			colorData[sourceName] = colorData[i].color;
		}
	}
	
	return colorData;
}

/**
 * Use the configured runtime color map to turn a source into a color.
 * 
 * The {@code sn.runtime.colorData} property must be set to a color map object
 * as returned by {@link sn.colorMap}.
 * 
 * @param {object} d the data element, expected to contain a {@code source} property
 * @returns {string} color value
 * @preserve
 */
function sn_color_color(d) {
	var s = Number(d.source);
	if ( isNaN(s) ) {
		return sn.runtime.colorData[d.source];
	}
	return sn.runtime.colorData.reduce(function(c, obj) {
		return (obj.source === d.source ? obj.color : c);
	}, sn.runtime.colorData[0].color);
}

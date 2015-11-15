import "format";

sn.format.displayScaleForValue = sn_format_displayScaleForValue;
sn.format.displayUnitsForScale = sn_format_displayUnitsForScale;

/**
 * Get an appropriate display scale for a given value. This will return values suitable
 * for passing to {@link sn.format.displayUnitsForScale}.
 * 
 * @param {Number} value - The value, for example the maximum value in a range of values, 
 *                         to get a display scale factor for.
 * @return {Number} A display scale factor.
 * @since 0.0.7
 * @preserve
 */
function sn_format_displayScaleForValue(value) {
	var result = 1, num = Number(value);
	if ( isNaN(num) === false ) {
		if ( value >= 1000000000 ) {
			result = 1000000000;
		} else if ( value >= 1000000 ) {
			result = 1000000;
		} else if ( value >= 1000 ) {
			result = 1000;
		}
	}
	return result;
}

/**
 * Get an appropriate display unit for a given base unit and scale factor.
 *
 * @param {String} baseUnit - The base unit, for example <b>W</b> or <b>Wh</b>.
 * @param {Number} scale - The unit scale, which must be a recognized SI scale, such 
 *                         as <b>1000</b> for <b>k</b>.
 * @return {String} A display unit value.
 * @since 0.0.7
 * @preserve
 */
function sn_format_displayUnitsForScale(baseUnit, scale) {
	return (scale === 1000000000 ? 'G' 
			: scale === 1000000 ? 'M' 
			: scale === 1000 ? 'k' 
			: '') + baseUnit;
}

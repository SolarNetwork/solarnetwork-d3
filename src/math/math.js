sn.math = {
	deg2rad : sn_math_deg2rad,
	rad2deg : sn_math_rad2deg
};

/**
 * Convert degrees to radians.
 * 
 * @param {number} deg - the degrees value to convert to radians
 * @returns {number} the radians
 * @preserve
 */
function sn_math_deg2rad(deg) {
	return deg * Math.PI / 180;
}

/**
 * Convert radians to degrees.
 * 
 * @param {number} rad - the radians value to convert to degrees
 * @returns {number} the degrees
 * @preserve
 */
function sn_math_rad2deg(rad) {
	return rad * 180 / Math.PI;
}

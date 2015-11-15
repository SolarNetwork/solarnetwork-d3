import "ui";

sn.ui.pixelWidth = sn_ui_pixelWidth;

/**
 * Get the width of an element based on a selector, in pixels.
 * 
 * @param {string} selector - a selector to an element to get the width of
 * @returns {number} the width, or {@code undefined} if {@code selector} is undefined, 
 *                   or {@code null} if the width cannot be computed in pixels
 */
function sn_ui_pixelWidth(selector) {
	if ( selector === undefined ) {
		return undefined;
	}
	var styleWidth = d3.select(selector).style('width');
	if ( !styleWidth ) {
		return null;
	}
	var pixels = styleWidth.match(/([0-9.]+)px/);
	if ( pixels === null ) {
		return null;
	}
	var result = Math.floor(pixels[1]);
	if ( isNaN(result) ) {
		return null;
	}
	return result;
}


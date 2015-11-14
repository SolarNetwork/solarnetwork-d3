import "../format/scale";

/**
 * Set the display units within a d3 selection based on a scale. This method takes a 
 * base unit and adds an SI prefix based on the provided scale. It replaces the text
 * content of any DOM node with a <code>unit</code> class that is a child of the given
 * selection.
 * 
 * @param {object} selection - A d3 selection that serves as the root search context.
 * @param {string} baseUnit - The base unit, for example <b>W</b> or <b>Wh</b>.
 * @param {number} scale - The unit scale, which must be a recognized SI scale, such 
 *                         as <b>1000</b> for <b>k</b>.
 * @param {string} unitKind - Optional text to replace all occurrences of <code>.unit-kind</code>
 *                            elements with.
 * @since 0.0.4
 * @preserve
 */
sn.ui.adjustDisplayUnits = function(selection, baseUnit, scale, unitKind) {
	var unit = sn.format.displayUnitsForScale(baseUnit, scale);
	selection.selectAll('.unit').text(unit);
	if ( unitKind !== undefined ) {
		selection.selectAll('.unit-kind').text(unitKind);
	}
};

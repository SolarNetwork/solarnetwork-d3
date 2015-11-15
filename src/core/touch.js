/**
 * Flag indicating if the client supports touch events.
 * 
 * @returns {Boolean} <em>true</em> if have touch support
 * @preserve
 */
sn.hasTouchSupport = (function() {
	if ( !(global && global.document) ) {
		return false;
	}
	if ( 'createTouch' in global.document ) { // True on the iPhone
		return true;
	}
	try {
		var event = global.document.createEvent('TouchEvent');
		return !!event.initTouchEvent;
	} catch( error ) {
		return false;
	}
}());

/**
 * Names to use for user-interaction events.
 * 
 * <p>On non-touch devices these equate to <em>mousedown</em>, 
 * <em>mouseup</em>, etc. On touch-enabled devices these equate to
 * <em>touchstart</em>, <em>touchend</em>, etc.</p>
 *
 * @retunrs {Object} Mapping of start, move, end, cancel keys to associated event names.
 * @preserve
 */
sn.tapEventNames = (function() {
	return (sn.hasTouchSupport ? {
			start: "touchstart",
			move: "touchmove",
			end: "touchend",
			cancel: "touchcancel",
			click: "touchstart",
			dblclick: "touchstart"
		} : {
			start: "mousedown",
			move: "mousemove",
			end: "mouseup",
			cancel: "touchcancel",
			click: "click",
			dblclick: "dblclick"
		});
}());

/**
 * Get the first user-interaction x,y coordinates relative to a given container element.
 *
 * @param {Node} container - A DOM container node to get the relative coordinates for.
 * @returns {Array} An array like <code>[x, y]</code> or <code>undefined</code> if not known.
 * @preserve
 */
sn.tapCoordinates = function(container) {
	var coordinates;
	if ( sn.hasTouchSupport ) {
		coordinates = d3.touches(container);
		return (coordinates && coordinates.length > 0 ? coordinates[0] : undefined);
	}
	return d3.mouse(container);
};

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
	if ( 'createTouch' in window.document ) { // True on the iPhone
		return true;
	}
	try {
		var event = window.document.createEvent('TouchEvent');
		return !!event.initTouchEvent;
	} catch( error ) {
		return false;
	}
}());

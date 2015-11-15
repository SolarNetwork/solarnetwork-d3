import "format";

sn.format.fmt = sn_format_fmt;

/**
 * Helper to be able to use placeholders even on iOS, where console.log doesn't support them.
 * 
 * @param {String} Message template.
 * @param {Object[]} Optional parameters to replace in the message.
 * @preserve
 */
function sn_format_fmt() {
	if ( !arguments.length ) {
		return;
	}
	var i = 0,
		formatted = arguments[i],
		regexp,
		replaceValue;
	for ( i = 1; i < arguments.length; i += 1 ) {
		regexp = new RegExp('\\{'+(i-1)+'\\}', 'gi');
		replaceValue = arguments[i];
		if ( replaceValue instanceof Date ) {
			replaceValue = (replaceValue.getUTCHours() === 0 && replaceValue.getMinutes() === 0 
				? sn.format.dateFormat(replaceValue) : sn.format.dateTimeFormatURL(replaceValue));
		}
		formatted = formatted.replace(regexp, replaceValue);
	}
	return formatted;
}

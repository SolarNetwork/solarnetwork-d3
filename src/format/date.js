import "format";

sn.format.dateTimeFormat = d3.time.format.utc("%Y-%m-%d %H:%M");

sn.format.timestampFormat = d3.time.format.utc("%Y-%m-%d %H:%M:%S.%LZ");

sn.format.timestampSecsFormat = d3.time.format.utc("%Y-%m-%d %H:%M:%SZ");

sn.format.dateTimeFormatLocal = d3.time.format("%Y-%m-%d %H:%M");

sn.format.dateTimeFormatURL = d3.time.format.utc("%Y-%m-%dT%H:%M");
	
sn.format.dateFormat = d3.time.format.utc("%Y-%m-%d");

sn.format.parseTimestamp = sn_format_parseTimestamp;

/**
 * Parse a timestamp string into a Date object.
 * 
 * @param {String} s the date string to parse
 * @returns {Date} the parsed date, or `null`
 * @preserve
 */
function sn_format_parseTimestamp(s) {
	var result = sn.format.timestampFormat.parse(s);
	if ( !result ) {
		// try without fractional second
		result = sn.format.timestampSecsFormat.parse(s);
	}
	return result;
}

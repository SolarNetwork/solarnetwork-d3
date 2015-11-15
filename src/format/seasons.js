import "format";

sn.format.seasonForDate = sn_format_seasonForDate;

/**
 * Get a UTC season constant for a date. Seasons are groups of 3 months, e.g. 
 * Spring, Summer, Autumn, Winter. The returned value will be a number between
 * 0 and 3, where (Dec, Jan, Feb) = 0, (Mar, Apr, May) = 1, (Jun, Jul, Aug) = 2,
 * and (Sep, Oct, Nov) = 3.
 * 
 * @param {Date} date The date to get the season for.
 * @returns a season constant number, from 0 - 3
 * @preserve
 */
 function sn_format_seasonForDate(date) {
	if ( date.getUTCMonth() < 2 || date.getUTCMonth() === 11 ) {
		return 3;
	} else if ( date.getUTCMonth() < 5 ) {
		return 0;
	} else if ( date.getUTCMonth() < 8 ) {
		return 1;
	} else {
		return 2;
	}
}

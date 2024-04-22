import "datum";
import "../../format/date"

sn.api.datum.datumDate = sn_api_datum_datumDate;

/**
 * Get a Date object for a datum. This function will return the first available date according
 * to the first available property found according to these rules:
 * 
 * <ol>
 * <li><code>date</code> - assumed to be a Date object already</li>
 * <li><code>localDate</code> - a string in <b>yyyy-MM-dd</b> form, optionally with a String
 *     <code>localTime</code> property for an associated time in <b>HH:mm</b> form.</li>
 * <li><code>created</code> - a string in <b>yyyy-MM-dd HH:mm:ss.SSS'Z'</b> form.</li>
 * </ul>
 *
 * @param {Object} d The datum to get the Date for.
 * @returns {Date} The found Date, or <em>null</em> if not available
 * @preserve
 */
function sn_api_datum_datumDate(d) {
	if ( d ) {
		if ( d.date ) {
			return d.date;
		} else if ( d.localDate ) {
			return sn.format.dateTimeFormat.parse(d.localDate +(d.localTime ? ' ' +d.localTime : ' 00:00'));
		} else if ( d.created ) {
			return sn.format.parseTimestamp(d.created);
		}
	}
	return null;
}

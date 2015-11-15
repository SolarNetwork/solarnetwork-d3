import "datum";

sn.api.datum.nestedStackDataNormalizeByDate = sn_api_datum_nestedStackDataNormalizeByDate;

/**
 * Normalize the data arrays resulting from a <code>d3.nest</code> operation so that all
 * group value arrays have the same number of elements, based on a Date property named 
 * <code>date</code>. The data values are assumed to be sorted by <code>date</code> already.
 * The value arrays are modified in-place. This makes the data suitable to passing to 
 * <code>d3.stack</code>, which expects all stack data arrays to have the same number of 
 * values, for the same keys.
 * 
 * The <code>layerData</code> parameter should look something like this:
 * 
 * <pre>[
 *   { key : 'A', values : [{date : Date(2011-12-02 12:00)}, {date : Date(2011-12-02 12:10)}] },
 *   { key : 'B', values : [{date : Date(2011-12-02 12:00)}] }
 * ]</pre>
 * 
 * After calling this method, <code>layerData</code> would look like this (notice the 
 * filled in secod data value in the <b>B</b> group):
 * 
 * <pre>[
 *   { key : 'A', values : [{date : Date(2011-12-02 12:00)}, {date : Date(2011-12-02 12:10)}] },
 *   { key : 'B', values : [{date : Date(2011-12-02 12:00)}, {date : Date(2011-12-02 12:10)}] }] }
 * ]</pre>
 * 
 * @param {array} layerData - An arry of objects, each object with a <code>key</code> group ID
 *                            and a <code>values</code> array of data objects.
 * @param {object} fillTemplate - An object to use as a template for any "filled in" data objects.
 *                                The <code>date</code> property will be populated automatically.
 *
 * @param {array} fillFn - An optional function to fill in objects with.
 * @since 0.0.4
 * @preserve
 */
function sn_api_datum_nestedStackDataNormalizeByDate(layerData, fillTemplate, fillFn) {
	var i = 0,
		j,
		k,
		jMax = layerData.length - 1,
		dummy,
		prop,
		copyIndex;
	// fill in "holes" for each stack, if more than one stack. we assume data already sorted by date
	if ( jMax > 0 ) {
		while ( i < d3.max(layerData.map(function(e) { return e.values.length; })) ) {
			dummy = undefined;
			for ( j = 0; j <= jMax; j++ ) {
				if ( layerData[j].values.length <= i ) {
					continue;
				}
				if ( j < jMax ) {
					k = j + 1;
				} else {
					k = 0;
				}
				if ( layerData[k].values.length <= i || layerData[j].values[i].date.getTime() < layerData[k].values[i].date.getTime() ) {
					dummy = {date : layerData[j].values[i].date, sourceId : layerData[k].key};
					if ( fillTemplate ) {
						for ( prop in fillTemplate ) {
							if ( fillTemplate.hasOwnProperty(prop) ) {
								dummy[prop] = fillTemplate[prop];
							}
						}
					}
					if ( fillFn ) {
						copyIndex = (layerData[k].values.length > i ? i : i > 0 ? i - 1 : null);
						fillFn(dummy, layerData[k].key, (copyIndex !== null ? layerData[k].values[copyIndex] : undefined));
					}
					layerData[k].values.splice(i, 0, dummy);
				}
			}
			if ( dummy === undefined ) {
				i++;
			}
		}
	}
}

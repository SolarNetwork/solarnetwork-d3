import "datum";

sn.api.datum.aggregateNestedDataLayers = sn_api_datum_aggregateNestedDataLayers;

/**
 * Combine the layers resulting from a d3.nest() operation into a single, aggregated
 * layer. This can be used to combine all sources of a single data type, for example
 * to show all "power" sources as a single layer of chart data. The resulting object
 * has the same structure as the input <code>layerData</code> parameter, with just a
 * single layer of data.
 * 
 * @param {object} layerData - An object resulting from d3.nest().entries()
 * @param {string} resultKey - The <code>key</code> property to assign to the returned layer.
 * @param {array} copyProperties - An array of string property names to copy as-is from 
 *                                 the <b>first</b> layer's data values.
 * @param {array} sumProperties - An array of string property names to add together from
 *                                <b>all</b> layer data.
 * @param {object} staticProperties - Static properties to copy as-is to all output data.
 * @return {object} An object with the same structure as returned by d3.nest().entries()
 * @since 0.0.4
 * @preserve
 */
function sn_api_datum_aggregateNestedDataLayers(layerData, resultKey, copyProperties, sumProperties, staticProperties) {
	// combine all layers into a single source
	var layerCount = layerData.length,
		dataLength,
		i,
		j,
		k,
		copyPropLength = copyProperties.length,
		sumPropLength = sumProperties.length,
		d,
		val,
		clone,
		array;

	dataLength = layerData[0].values.length;
	if ( dataLength > 0 ) {
		array = [];
		for ( i = 0; i < dataLength; i += 1 ) {
			d = layerData[0].values[i];
			clone = {};
			if ( staticProperties !== undefined ) {
				for ( val in staticProperties ) {
					if ( staticProperties.hasOwnProperty(val) ) {
						clone[val] = staticProperties[val];
					}
				}
			}
			for ( k = 0; k < copyPropLength; k += 1 ) {
				clone[copyProperties[k]] = d[copyProperties[k]];
			}
			for ( k = 0; k < sumPropLength; k += 1 ) {
				clone[sumProperties[k]] = 0;
			}
			for ( j = 0; j < layerCount; j += 1 ) {
				for ( k = 0; k < sumPropLength; k += 1 ) {
					val = layerData[j].values[i][sumProperties[k]];
					if ( val !== undefined ) {
						clone[sumProperties[k]] += val;
					}
				}
			}
			array.push(clone);
		}
		layerData = [{ key : resultKey, values : array }];
	}

	return layerData;
};

import "datum";

sn.api.datum.loaderQueryRange = sn_api_datum_loaderQueryRange;

/**
 * Get a query range appropriate for using with {@link sn.api.datum.loader}. Returns an object
 * with <code>start</code> and <code>end</code> Date properties, using the given <code>endDate</code>
 * parameter as the basis for calculating the start as an offset, based on the given <code>aggregate</code>
 * level.
 * 
 * @param {string} aggregate - the aggregate level
 * @param {object} aggregateTimeCount - either a Number or an Object with Number properties named 
 *                 <code>numXs</code> where <code>X</code> is the aggregate level, representing
 *                 the number of aggregate time units to include in the query
 * @param {Date} endDate - the end date
 * @returns {Object}
 * @since 0.0.4
 * @preserve
 */
function sn_api_datum_loaderQueryRange(aggregate, aggregateTimeCount, endDate) {
	var end,
		start,
		timeUnit,
		timeCount,
		precision;
	
	function exclusiveEndDate(time, date) {
		var result = time.utc.ceil(date);
		if ( result.getTime() === date.getTime() ) {
			// already on exact aggregate, so round up to next
			result = time.offset(result, 1);
		}
		return result;
	}
	
	function timeCountValue(propName) {
		var result;
		if ( isNaN(Number(aggregateTimeCount)) ) {
			if ( aggregateTimeCount[propName] !== undefined ) {
				result = Number(aggregateTimeCount[propName]);
			} else {
				result = 1;
			}
		} else {
			result = aggregateTimeCount;
		}
		if ( typeof result !== 'number' ) {
			result = 1;
		}
		return result;
	}
	
	function precisionValue(agg) {
		var result = 10;
		if ( agg.search(/^Five/) === 0 ) {
			result = 5;
		} else if ( agg.search(/^Fifteen/) === 0 ) {
			result = 15;
		}
		return result;
	}
	
	if ( aggregate.search(/Minute$/) >= 0 ) {
		timeCount = timeCountValue('numHours');
		timeUnit = 'hour';
		end = exclusiveEndDate(d3.time.minute, endDate);
		precision = precisionValue(aggregate);
		end.setUTCMinutes((end.getUTCMinutes() + precision - (end.getUTCMinutes() % precision)), 0, 0);
		start = d3.time.hour.utc.offset(end, -timeCount);
	} else if ( aggregate === 'Month' ) {
		timeCount = timeCountValue('numYears');
		timeUnit = 'year';
		end = exclusiveEndDate(d3.time.month, endDate);
		start = d3.time.year.utc.offset(d3.time.month.utc.floor(endDate), -timeCount);
	} else if ( aggregate === 'Day' ) {
		timeCount = timeCountValue('numMonths');
		timeUnit = 'month';
		end = exclusiveEndDate(d3.time.day, endDate);
		start = d3.time.month.utc.offset(d3.time.day.utc.floor(endDate), -timeCount);
	} else {
		// assume Hour
		timeCount = timeCountValue('numDays');
		timeUnit = 'day';
		end = exclusiveEndDate(d3.time.hour, endDate);
		start = d3.time.day.utc.offset(d3.time.hour.utc.floor(end), -timeCount);
	}
	return {
		start : start, 
		end : end, 
		timeUnit : timeUnit, 
		timeCount : timeCount
	};
}

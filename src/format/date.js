import "format";

sn.format.dateTimeFormat = d3.time.format.utc("%Y-%m-%d %H:%M");

sn.format.timestampFormat = d3.time.format.utc("%Y-%m-%d %H:%M:%S.%LZ");

sn.format.dateTimeFormatLocal = d3.time.format("%Y-%m-%d %H:%M");

sn.format.dateTimeFormatURL = d3.time.format.utc("%Y-%m-%dT%H:%M");
	
sn.format.dateFormat = d3.time.format.utc("%Y-%m-%d");

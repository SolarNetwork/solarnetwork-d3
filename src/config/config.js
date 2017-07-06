import "../core/global";

var sn_config = {
	debug : false,
	host : 'data.solarnetwork.net',
	tls : (function() {
		return (global !== undefined
			&& global.location !== undefined
			&& global.location.protocol !== undefined
			&& global.location.protocol.toLowerCase().indexOf('https') === 0 ? true : false);
	}()),
	path : '/solarquery',
	solarUserPath : '/solaruser',
	secureQuery : false
};

sn.config = sn_config;

function sn_config_getConfig() {
	return sn_config;
}

import "../core/global";

var sn_config = {
	debug : false,
	host : 'data.solarnetwork.net',
	tls : true,
	path : '/solarquery',
	solarUserPath : '/solaruser',
	secureQuery : false
};

sn.config = sn_config;

function sn_config_getConfig() {
	return sn_config;
}

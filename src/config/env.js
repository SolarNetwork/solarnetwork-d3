import "../core/global";
import "../net/parseURLQueryTerms"

var sn_env = {
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

function sn_env_setDefaultEnv(defaults) {
	var prop;
	for ( prop in defaults ) {
		if ( defaults.hasOwnProperty(prop) ) {
			if ( sn_env[prop] === undefined ) {
				sn_env[prop] = defaults[prop];
			}
		}
	}
}

function sn_env_setEnv(environment) {
	var prop;
	for ( prop in environment ) {
		if ( environment.hasOwnProperty(prop) ) {
			sn_env[prop] = environment[prop];
		}
	}
}

sn.env = sn_env;
sn.setEnv = sn_env_setEnv;
sn.setDefaultEnv = sn_env_setDefaultEnv;

if ( global !== undefined
		&& global.location !== undefined
		&& global.location.search !== undefined ) {
	sn_env_setEnv(sn_net_parseURLQueryTerms(global.location.search));
}

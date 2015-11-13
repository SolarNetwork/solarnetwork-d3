import "../core/global";
import "../net/parseURLQueryTerms"
import "../util/util";

sn.env = {
	debug : false,
	host : 'data.solarnetwork.net',
	tls : (function() {
		return (global !== undefined 
			&& global.locaion !== undefined
			&& global.location.protocol !== undefined 
			&& global.location.protocol.toLowerCase().indexOf('https') === 0 ? true : false);
	}()),
	path : '/solarquery',
	solarUserPath : '/solaruser',
	secureQuery : false
};

sn.setDefaultEnv = sn_env_setDefaultEnv;

function sn_env_setDefaultEnv(defaults) {
	var prop;
	for ( prop in defaults ) {
		if ( defaults.hasOwnProperty(prop) ) {
			if ( env[prop] === undefined ) {
				env[prop] = defaults[prop];
			}
		}
	}
}
	
function sn_env_setEnv(environment) {
	var prop;
	for ( prop in environment ) {
		if ( environment.hasOwnProperty(prop) ) {
			env[prop] = environment[prop];
		}
	}
}

if ( global !== undefined 
		&& global.location !== undefined 
		&& global.location.search !== undefined ) {
	sn_env_setEnv(sn_net_parseURLQueryTerms(global.location.search));
}

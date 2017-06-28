import "../core/global";
import "../net/parseURLQueryTerms"
import "../util/util"
import "config";

var sn_env = sn_util_copy(sn_config_getConfig(), {});

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

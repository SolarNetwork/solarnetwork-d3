import "../config/config";
import "../format/format";

sn.log = sn_log;

function sn_log() {
	if ( sn.config.debug === true && console !== undefined ) {
		console.log(sn.format.fmt.apply(this, arguments));
	}
}

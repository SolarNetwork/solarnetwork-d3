	if ( typeof define === "function" && define.amd ) {
		define(this.sn = sn);
	} else if ( typeof module === "object" && module.exports ) {
		module.exports = sn;
	} else {
		global.sn = sn;
	}
}();

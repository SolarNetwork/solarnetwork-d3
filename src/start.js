(function (root, factory) {
	if ( typeof define === "function" && define.amd ) {
		define(["colorbrewer", "d3", "queue-async", "crypto-js", "uri-js"], factory);
	} else if ( typeof module === "object" && module.exports ) {
		module.exports = factory(require("colorbrewer"), require("d3"),
			require("queue-async"), require("crypto-js"), require("uri-js"));
	} else {
		root.sn = factory(root.colorbrewer, root.d3, root.queue, root.CryptoJS, root.URI);
	}
}(this, function(colorbrewer, d3, queue, CryptoJS, URI) {
	'use strict';
	var sn = {version: "0.14.2"};

(function (root, factory) {
	if ( typeof define === "function" && define.amd ) {
		define(["colorbrewer", "d3", "queue-async", "crypto-js"], factory);
	} else if ( typeof module === "object" && module.exports ) {
		module.exports = factory(require("colorbrewer"), require("d3"), require("queue-async"), require("crypto-js"));
	} else {
		root.sn = factory(root.colorbrewer, root.d3, root.queue, root.CryptoJS);
	}
}(this, function(colorbrewer, d3, queue, CryptoJS) {
	'use strict';
	var sn = {version: "0.10.0"};

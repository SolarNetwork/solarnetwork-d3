(function (root, factory) {
	if ( typeof define === "function" && define.amd ) {
		define(["colorbrewer", "d3", "queue-async"], factory);
	} else if ( typeof module === "object" && module.exports ) {
		module.exports = factory(require("colorbrewer"), require("d3"), require("queue-async"));
	} else {
		root.sn = factory(root.colorbrewer, root.d3, root.queue);
	}
}(this, function(colorbrewer, d3, queue) {
	'use strict';
	var sn = {version: "0.9.0"};

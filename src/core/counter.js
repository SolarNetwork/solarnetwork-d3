sn.counter = sn_counter;

function sn_counter() {
	var c = 0;
	var obj = function() {
		return c;
	};
	obj.incrementAndGet = function() {
		c += 1;
		return c;
	};
	return obj;
}

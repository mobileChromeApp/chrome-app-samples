if (!Array.prototype.map) { // http://www.sitepoint.com/forums/showthread.php?483477-Array-prototype-map-function(func-thisVal)
	Array.prototype.map = function(func, thisVal) {
		var len = this.length;
		var ret = new Array(len);
		for (var i = 0; i < len; i++) {
			ret[i] = func.call(thisVal, this[i] || this.charAt && this.charAt(i), i, this);
		}
		return ret;
	};
}

if (!Array.prototype.concat) {
	Array.prototype.concat = function(v) {
		for (var n = 0; n < v.length; n++) this.push(v[n])
		return this;
	};
}

String.prototype.replaceAll = function(a, b) { // Replace all occurrences of string with replacement string.
	if (typeof a === "object") {
		var value = this;
		for (var n = 0; n < a.length; n++) {
			value = value.split(a[n]).join(b[n]);
		}
		return value;
	}
	return this.split(a).join(b);
};

String.prototype.trim = function(v) { // Strip whitespace.
	return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.ucfirst = function(v) { // Make a string's first character uppercase.
	return this[0].toUpperCase() + this.substr(1);
};

String.prototype.ucwords = function(v) { // Uppercase the first character of each word in a string.
	return this.replace(/^(.)|\s(.)/g, function($1) {
		return $1.toUpperCase();
	});
};

String.prototype.addslashes = function() {
	return this.replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
};

String.prototype.stripslashes = function() {
	return this.replace(/\0/g, '0').replace(/\\([\\'"])/g, '$1');
};

String.prototype.basename = function() {
	return this.replace(/\\/g,'/').replace( /.*\//, '' );
};

String.prototype.lpad = function(padding, length) {
	var value = this;
    while (value.length < length) {
    	value = padding + value;
    }
    return value;
};

String.prototype.rpad = function(padding, length) {
	var value = this;
    while (value.length < length) {
    	value = value + padding;
    }
    return value;
};

/* CLOSURE COMPILER */

window['STRING'] = String;
STRING.prototype['replaceAll'] = STRING.prototype.replaceAll;
STRING.prototype['trim'] = STRING.prototype.trim;
STRING.prototype['ucfirst'] = STRING.prototype.ucfirst;
STRING.prototype['ucwords'] = STRING.prototype.ucwords;
STRING.prototype['addslashes'] = STRING.prototype.addslashes;
STRING.prototype['stripslashes'] = STRING.prototype.stripslashes;
STRING.prototype['basename'] = STRING.prototype.basename;
STRING.prototype['lpad'] = STRING.prototype.lpad;
STRING.prototype['rpad'] = STRING.prototype.rpad;
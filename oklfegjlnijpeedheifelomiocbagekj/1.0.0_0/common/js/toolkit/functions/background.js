DEBUG_LOGGING = false;

// Set to true to get noisier console.log statements
VERBOSE_DEBUG = false;

// Don't run in a frame, to avoid manipulation by websites.
if (window.location.origin + "/" === chrome.extension.getURL("")) {
	// above line avoids content scripts making their host page break frames
	if (window.top !== window) {
		window.location.replace("about:blank");
	}
}

// Replaced with console.log if the user chooses.
log = function() { };

// Parse a URL. Based upon http://blog.stevenlevithan.com/archives/parseuri
// parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com>, MIT License
// Inputs: url: the URL you want to parse
// Outputs: object containing all parts of |url| as attributes
parseUri = function(url) {
	var matches = /^(([^:]+(?::|$))(?:(?:\w+:)?\/\/)?(?:[^:@\/]*(?::[^:@\/]*)?@)?(([^:\/?#]*)(?::(\d*))?))((?:[^?#\/]*\/)*[^?#]*)(\?[^#]*)?(\#.*)?/.exec(url);
	// The key values are identical to the JS location object values for that key
	var keys = ["href", "origin", "protocol", "host", "hostname", "port", "pathname", "search", "hash"];
	var uri = {};
	for (var i=0; i<keys.length; i++) {
		uri[keys[i]] = matches[i] || "";
	}
	return uri;
};
// Parses the search part of a URL into an key: value object.
// e.g., ?hello=world&ext=my_ext would become {hello:"world", ext:"my_ext"}
// Inputs: search: the search query of a URL. Must have &-separated values.
parseUri.parseSearch = function(search) {
	// Fails if a key exists twice (e.g., ?a=foo&a=bar would return {a:"bar"}
	var queryKeys = {};
	search.replace(/(?:^\?|&)([^&=]*)=?([^&]*)/g, function () {
		if (arguments[1]) {
			queryKeys[arguments[1]] = unescape(arguments[2]);
		}
	});
	return queryKeys;
};
// Strip third+ level domain names from the domain and return the result.
// Inputs: domain: the domain that should be parsed
//         keepDot: true if trailing dots should be preserved in the domain
// Returns: the parsed domain
parseUri.secondLevelDomainOnly = function(domain, keepDot) {
	var match = domain.match(/([^\.]+\.(?:co\.)?[^\.]+)\.?$/) || [domain, domain];
	return match[keepDot ? 0 : 1].toLowerCase();
};

// Inputs: key:string.
// Returns value if key exists, else undefined.
storage_get = function(key) {
	var store = localStorage;
	var json = store.getItem(key);
	if (json == null) {
		return undefined;
	}
	try {
		return JSON.parse(json);
	} catch (e) {
		log("Couldn't parse json for " + key);
		return undefined;
	}
};

// Inputs: key:string, value:object.
// Returns undefined.
storage_set = function(key, value) {
	var store = localStorage;
	try {
		store.setItem(key, JSON.stringify(value));
	} catch (ex) {
		if (ex.name == "QUOTA_EXCEEDED_ERR") {
			log("Storage quota exceeded");
		}
	}
};
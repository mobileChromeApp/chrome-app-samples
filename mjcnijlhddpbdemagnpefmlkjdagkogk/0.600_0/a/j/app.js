/*!
 * jQuery JavaScript Library v2.0.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-04-18
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Support: IE9
	// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	location = window.location,
	document = window.document,
	docElem = document.documentElement,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "2.0.0",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler and self cleanup method
	completed = function() {
		document.removeEventListener( "DOMContentLoaded", completed, false );
		window.removeEventListener( "load", completed, false );
		jQuery.ready();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		// Support: Safari <= 5.1 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Support: Firefox <20
		// The try/catch suppresses exceptions thrown when attempting to access
		// the "constructor" property of certain host objects, ie. |window.location|
		// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
		try {
			if ( obj.constructor &&
					!core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );

		if ( scripts ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: JSON.parse,

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
				indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	trim: function( text ) {
		return text == null ? "" : core_trim.call( text );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : core_indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: Date.now,

	// A method for quickly swapping in/out CSS properties to get correct calculations.
	// Note: this method belongs to the css module but it's needed here for the support module.
	// If support gets modularized, this method should be moved back to the css module.
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
/*!
 * Sizzle CSS Selector Engine v1.9.2-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-04-16
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	hasDuplicate = false,
	sortOrder = function() { return 0; },

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rsibling = new RegExp( whitespace + "*[+~]" ),
	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"boolean": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// Support: Windows 8 Native Apps
	// Assigning innerHTML with "name" attributes throws uncatchable exceptions
	// (http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx)
	// and the broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Support: Opera 10-12/IE8
			// ^= $= *= and empty values
			// Should not select anything
			// Support: Windows 8 Native Apps
			// The type attribute is restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "t", "" );

			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === doc || contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === doc || contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && documentIsHTML &&
		(!rbuggyMatches || !rbuggyMatches.test(expr)) &&
		(!rbuggyQSA     || !rbuggyQSA.test(expr)) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		val = fn && fn( elem, name, !documentIsHTML );

	return val === undefined ?
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null :
		val;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns Returns -1 if a precedes b, 1 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Fetches boolean attributes by node
function boolHandler( elem, name, isXML ) {
	var val;
	return isXML ?
		undefined :
		(val = elem.getAttributeNode( name )) && val.specified ?
			val.value :
			elem[ name ] === true ? name.toLowerCase() : null;
}

// Fetches attributes without interpolation
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
function interpolationHandler( elem, name, isXML ) {
	var val;
	return isXML ?
		undefined :
		(val = elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 ));
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Initialize against the default document
setDocument();

// Support: Chrome<<14
// Always assume duplicates if they aren't passed to the comparison function
[0, 0].sort( sortOrder );
support.detectDuplicates = hasDuplicate;

// Support: IE<8
// Prevent attribute/property "interpolation"
assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild.getAttribute("href") !== "#" ) {
		var attrs = "type|href|height|width".split("|"),
			i = attrs.length;
		while ( i-- ) {
			Expr.attrHandle[ attrs[i] ] = interpolationHandler;
		}
	}
});

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
assert(function( div ) {
	if ( div.getAttribute("disabled") != null ) {
		var attrs = booleans.split("|"),
			i = attrs.length;
		while ( i-- ) {
			Expr.attrHandle[ attrs[i] ] = boolHandler;
		}
	}
});

jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function( support ) {
	var input = document.createElement("input"),
		fragment = document.createDocumentFragment(),
		div = document.createElement("div"),
		select = document.createElement("select"),
		opt = select.appendChild( document.createElement("option") );

	// Finish early in limited environments
	if ( !input.type ) {
		return support;
	}

	input.type = "checkbox";

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
	support.checkOn = input.value !== "";

	// Must access the parent to make an option select properly
	// Support: IE9, IE10
	support.optSelected = opt.selected;

	// Will be defined later
	support.reliableMarginRight = true;
	support.boxSizingReliable = true;
	support.pixelPosition = false;

	// Make sure checked status is properly cloned
	// Support: IE9, IE10
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Check if an input maintains its value after becoming a radio
	// Support: IE9, IE10
	input = document.createElement("input");
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment.appendChild( input );

	// Support: Safari 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: Firefox, Chrome, Safari
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
	support.focusinBubbles = "onfocusin" in window;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv,
			// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
			divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",
			body = document.getElementsByTagName("body")[ 0 ];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		// Check box-sizing and margin behavior.
		body.appendChild( container ).appendChild( div );
		div.innerHTML = "";
		// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
		div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%";

		// Workaround failing boxSizing test due to offsetWidth returning wrong value
		// with some non-1 values of body zoom, ticket #13543
		jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
			support.boxSizing = div.offsetWidth === 4;
		});

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		body.removeChild( container );
	});

	return support;
})( {} );

/*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
var data_user, data_priv,
	rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function Data() {
	// Support: Android < 4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Math.random();
}

Data.uid = 1;

Data.accepts = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType ?
		owner.nodeType === 1 || owner.nodeType === 9 : true;
};

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android < 4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Support an expectation from the old data system where plain
			// objects used to initialize would be set to the cache by
			// reference, instead of having properties and values copied.
			// Note, this will kill the connection between
			// "this.cache[ unlock ]" and "cache"
			if ( jQuery.isEmptyObject( cache ) ) {
				this.cache[ unlock ] = data;
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {
			return this.get( owner, key );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = jQuery.camelCase( key );
					name = name in cache ?
						[ name ] : ( name.match( core_rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		delete this.cache[ this.key( owner ) ];
	}
};

// These may be used throughout the jQuery core codebase
data_user = new Data();
data_priv = new Data();


jQuery.extend({
	acceptData: Data.accepts,

	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[ 0 ],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[ i ].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );
							dataAttr( elem, name, data[ name ] );
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return jQuery.access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? JSON.parse( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.boolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.boolean.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.boolean.source.match( /\w+/g ), function( i, name ) {
	var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

	jQuery.expr.attrHandle[ name ] = function( elem, name, isXML ) {
		var fn = jQuery.expr.attrHandle[ name ],
			ret = isXML ?
				undefined :
				/* jshint eqeqeq: false */
				// Temporarily disable this handler to check existence
				(jQuery.expr.attrHandle[ name ] = undefined) !=
					getter( elem, name, isXML ) ?

					name.toLowerCase() :
					null;

		// Restore handler
		jQuery.expr.attrHandle[ name ] = fn;

		return ret;
	};
});

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !jQuery.support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});
var rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Safari 6.0+, Chrome < 28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
var isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self, matched, i,
			l = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		matched = [];
		for ( i = 0; i < l; i++ ) {
			jQuery.find( selector, this[ i ], matched );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		matched = this.pushStack( l > 1 ? jQuery.unique( matched ) : matched );
		matched.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return matched;
	},

	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[ 0 ] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = ( rneedsContext.test( selectors ) || typeof selectors !== "string" ) ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					cur = matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return core_indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return core_indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev*
			if ( name[ 0 ] === "p" ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			}));
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( core_indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}
var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE 9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE 9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.col = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var
			// Snapshot the DOM in case .domManip sweeps something relevant into its fragment
			args = jQuery.map( this, function( elem ) {
				return [ elem.nextSibling, elem.parentNode ];
			}),
			i = 0;

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			var next = args[ i++ ],
				parent = args[ i++ ];

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		// Allow new content to include elements from the context set
		}, true );

		// Force removal if there was no new content (e.g., from empty arguments)
		return i ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback, allowIntersection ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback, allowIntersection );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because core_push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery._evalUrl( node.src );
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because core_push.apply(_, arraylike) throws
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Support: IE >= 9
		// Fix Cloning issues
		if ( !jQuery.support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			i = 0,
			l = elems.length,
			fragment = context.createDocumentFragment(),
			nodes = [];

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit
					// jQuery.merge because core_push.apply(_, arraylike) throws
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.firstChild;
					}

					// Support: QtWebKit
					// jQuery.merge because core_push.apply(_, arraylike) throws
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Fixes #12346
					// Support: Webkit, IE
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			l = elems.length,
			i = 0,
			special = jQuery.event.special;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( jQuery.acceptData( elem ) ) {

				data = data_priv.access( elem );

				if ( data ) {
					for ( type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}
				}
			}
			// Discard any remaining `private` and `user` data
			// One day we'll replace the dual arrays with a WeakMap and this won't be an issue.
			// (Splices the data objects out of the internal cache arrays)
			data_user.discard( elem );
			data_priv.discard( elem );
		}
	},

	_evalUrl: function( url ) {
		return jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "text",
			async: false,
			global: false,
			success: jQuery.globalEval
		});
	}
});

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var l = elems.length,
		i = 0;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = jQuery.extend( {}, pdataOld );
		events = pdataOld.events;

		data_priv.set( dest, pdataCur );

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}


function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Support: IE >= 9
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}
jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});
var curCSS, iframe,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
function getStyles( elem ) {
	return window.getComputedStyle( elem, null );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css(elem, "display") );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

curCSS = function( elem, name, _computed ) {
	var width, minWidth, maxWidth,
		computed = _computed || getStyles( elem ),

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
		style = elem.style;

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: Safari 5.1
		// A tribute to the "awesome hack by Dean Edwards"
		// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret;
};


function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	// Support: Android 2.3
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// Support: Android 2.3
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrSupported = jQuery.ajaxSettings.xhr(),
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	// Support: IE9
	// We need to keep track of outbound xhr and abort them manually
	// because IE is not smart enough to do it all by itself
	xhrId = 0,
	xhrCallbacks = {};

if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
		xhrCallbacks = undefined;
	});
}

jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
jQuery.support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;
	// Cross domain only allowed if supported through XMLHttpRequest
	if ( jQuery.support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i, id,
					xhr = options.xhr();
				xhr.open( options.type, options.url, options.async, options.username, options.password );
				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}
				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}
				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}
				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}
				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;
							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file protocol always yields status 0, assume 404
									xhr.status || 404,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// #11426: When requesting binary data, IE9 will throw an exception
									// on any attempt to access responseText
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};
				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");
				// Create the abort callback
				callback = xhrCallbacks[( id = xhrId++ )] = callback("abort");
				// Do send the request
				// This may raise an exception which is actually
				// handled in jQuery.ajax (so no try/catch here)
				xhr.send( options.hasContent && options.data || null );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var index, prop, value, length, dataShow, toggle, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}


	// show/hide pass
	dataShow = data_priv.get( elem, "fxshow" );
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if( value === "show" && dataShow !== undefined && dataShow[ index ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = data_priv.get( elem, "fxshow" ) || data_priv.access( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		elem = this[ 0 ],
		box = { top: 0, left: 0 },
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top + win.pageYOffset - docElem.clientTop,
		left: box.left + win.pageXOffset - docElem.clientLeft
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// We assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if ( typeof module === "object" && typeof module.exports === "object" ) {
	// Expose jQuery as module.exports in loaders that implement the Node
	// module pattern (including browserify). Do not create the global, since
	// the user will be storing it themselves locally, and globals are frowned
	// upon in the Node module world.
	module.exports = jQuery;
} else {
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return jQuery; } );
	}
}

// If there is a window object, that at least has a document property,
// define jQuery and $ identifiers
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.jQuery = window.$ = jQuery;
}

})( window );

/*! jQuery UI - v1.10.2 - 2013-05-02
* http://jqueryui.com
* Includes: jquery.ui.effect.js, jquery.ui.effect-highlight.js
* Copyright 2013 jQuery Foundation and other contributors Licensed MIT */

(function(t,e){var i="ui-effects-";t.effects={effect:{}},function(t,e){function i(t,e,i){var s=u[e.type]||{};return null==t?i||!e.def?null:e.def:(t=s.floor?~~t:parseFloat(t),isNaN(t)?e.def:s.mod?(t+s.mod)%s.mod:0>t?0:t>s.max?s.max:t)}function s(i){var s=l(),n=s._rgba=[];return i=i.toLowerCase(),f(h,function(t,a){var o,r=a.re.exec(i),h=r&&a.parse(r),l=a.space||"rgba";return h?(o=s[l](h),s[c[l].cache]=o[c[l].cache],n=s._rgba=o._rgba,!1):e}),n.length?("0,0,0,0"===n.join()&&t.extend(n,a.transparent),s):a[i]}function n(t,e,i){return i=(i+1)%1,1>6*i?t+6*(e-t)*i:1>2*i?e:2>3*i?t+6*(e-t)*(2/3-i):t}var a,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",r=/^([\-+])=\s*(\d+\.?\d*)/,h=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(t){return[t[1],t[2],t[3],t[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(t){return[2.55*t[1],2.55*t[2],2.55*t[3],t[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(t){return[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(t){return[parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16),parseInt(t[3]+t[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(t){return[t[1],t[2]/100,t[3]/100,t[4]]}}],l=t.Color=function(e,i,s,n){return new t.Color.fn.parse(e,i,s,n)},c={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},u={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},d=l.support={},p=t("<p>")[0],f=t.each;p.style.cssText="background-color:rgba(1,1,1,.5)",d.rgba=p.style.backgroundColor.indexOf("rgba")>-1,f(c,function(t,e){e.cache="_"+t,e.props.alpha={idx:3,type:"percent",def:1}}),l.fn=t.extend(l.prototype,{parse:function(n,o,r,h){if(n===e)return this._rgba=[null,null,null,null],this;(n.jquery||n.nodeType)&&(n=t(n).css(o),o=e);var u=this,d=t.type(n),p=this._rgba=[];return o!==e&&(n=[n,o,r,h],d="array"),"string"===d?this.parse(s(n)||a._default):"array"===d?(f(c.rgba.props,function(t,e){p[e.idx]=i(n[e.idx],e)}),this):"object"===d?(n instanceof l?f(c,function(t,e){n[e.cache]&&(u[e.cache]=n[e.cache].slice())}):f(c,function(e,s){var a=s.cache;f(s.props,function(t,e){if(!u[a]&&s.to){if("alpha"===t||null==n[t])return;u[a]=s.to(u._rgba)}u[a][e.idx]=i(n[t],e,!0)}),u[a]&&0>t.inArray(null,u[a].slice(0,3))&&(u[a][3]=1,s.from&&(u._rgba=s.from(u[a])))}),this):e},is:function(t){var i=l(t),s=!0,n=this;return f(c,function(t,a){var o,r=i[a.cache];return r&&(o=n[a.cache]||a.to&&a.to(n._rgba)||[],f(a.props,function(t,i){return null!=r[i.idx]?s=r[i.idx]===o[i.idx]:e})),s}),s},_space:function(){var t=[],e=this;return f(c,function(i,s){e[s.cache]&&t.push(i)}),t.pop()},transition:function(t,e){var s=l(t),n=s._space(),a=c[n],o=0===this.alpha()?l("transparent"):this,r=o[a.cache]||a.to(o._rgba),h=r.slice();return s=s[a.cache],f(a.props,function(t,n){var a=n.idx,o=r[a],l=s[a],c=u[n.type]||{};null!==l&&(null===o?h[a]=l:(c.mod&&(l-o>c.mod/2?o+=c.mod:o-l>c.mod/2&&(o-=c.mod)),h[a]=i((l-o)*e+o,n)))}),this[n](h)},blend:function(e){if(1===this._rgba[3])return this;var i=this._rgba.slice(),s=i.pop(),n=l(e)._rgba;return l(t.map(i,function(t,e){return(1-s)*n[e]+s*t}))},toRgbaString:function(){var e="rgba(",i=t.map(this._rgba,function(t,e){return null==t?e>2?1:0:t});return 1===i[3]&&(i.pop(),e="rgb("),e+i.join()+")"},toHslaString:function(){var e="hsla(",i=t.map(this.hsla(),function(t,e){return null==t&&(t=e>2?1:0),e&&3>e&&(t=Math.round(100*t)+"%"),t});return 1===i[3]&&(i.pop(),e="hsl("),e+i.join()+")"},toHexString:function(e){var i=this._rgba.slice(),s=i.pop();return e&&i.push(~~(255*s)),"#"+t.map(i,function(t){return t=(t||0).toString(16),1===t.length?"0"+t:t}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),l.fn.parse.prototype=l.fn,c.hsla.to=function(t){if(null==t[0]||null==t[1]||null==t[2])return[null,null,null,t[3]];var e,i,s=t[0]/255,n=t[1]/255,a=t[2]/255,o=t[3],r=Math.max(s,n,a),h=Math.min(s,n,a),l=r-h,c=r+h,u=.5*c;return e=h===r?0:s===r?60*(n-a)/l+360:n===r?60*(a-s)/l+120:60*(s-n)/l+240,i=0===l?0:.5>=u?l/c:l/(2-c),[Math.round(e)%360,i,u,null==o?1:o]},c.hsla.from=function(t){if(null==t[0]||null==t[1]||null==t[2])return[null,null,null,t[3]];var e=t[0]/360,i=t[1],s=t[2],a=t[3],o=.5>=s?s*(1+i):s+i-s*i,r=2*s-o;return[Math.round(255*n(r,o,e+1/3)),Math.round(255*n(r,o,e)),Math.round(255*n(r,o,e-1/3)),a]},f(c,function(s,n){var a=n.props,o=n.cache,h=n.to,c=n.from;l.fn[s]=function(s){if(h&&!this[o]&&(this[o]=h(this._rgba)),s===e)return this[o].slice();var n,r=t.type(s),u="array"===r||"object"===r?s:arguments,d=this[o].slice();return f(a,function(t,e){var s=u["object"===r?t:e.idx];null==s&&(s=d[e.idx]),d[e.idx]=i(s,e)}),c?(n=l(c(d)),n[o]=d,n):l(d)},f(a,function(e,i){l.fn[e]||(l.fn[e]=function(n){var a,o=t.type(n),h="alpha"===e?this._hsla?"hsla":"rgba":s,l=this[h](),c=l[i.idx];return"undefined"===o?c:("function"===o&&(n=n.call(this,c),o=t.type(n)),null==n&&i.empty?this:("string"===o&&(a=r.exec(n),a&&(n=c+parseFloat(a[2])*("+"===a[1]?1:-1))),l[i.idx]=n,this[h](l)))})})}),l.hook=function(e){var i=e.split(" ");f(i,function(e,i){t.cssHooks[i]={set:function(e,n){var a,o,r="";if("transparent"!==n&&("string"!==t.type(n)||(a=s(n)))){if(n=l(a||n),!d.rgba&&1!==n._rgba[3]){for(o="backgroundColor"===i?e.parentNode:e;(""===r||"transparent"===r)&&o&&o.style;)try{r=t.css(o,"backgroundColor"),o=o.parentNode}catch(h){}n=n.blend(r&&"transparent"!==r?r:"_default")}n=n.toRgbaString()}try{e.style[i]=n}catch(h){}}},t.fx.step[i]=function(e){e.colorInit||(e.start=l(e.elem,i),e.end=l(e.end),e.colorInit=!0),t.cssHooks[i].set(e.elem,e.start.transition(e.end,e.pos))}})},l.hook(o),t.cssHooks.borderColor={expand:function(t){var e={};return f(["Top","Right","Bottom","Left"],function(i,s){e["border"+s+"Color"]=t}),e}},a=t.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(jQuery),function(){function i(e){var i,s,n=e.ownerDocument.defaultView?e.ownerDocument.defaultView.getComputedStyle(e,null):e.currentStyle,a={};if(n&&n.length&&n[0]&&n[n[0]])for(s=n.length;s--;)i=n[s],"string"==typeof n[i]&&(a[t.camelCase(i)]=n[i]);else for(i in n)"string"==typeof n[i]&&(a[i]=n[i]);return a}function s(e,i){var s,n,o={};for(s in i)n=i[s],e[s]!==n&&(a[s]||(t.fx.step[s]||!isNaN(parseFloat(n)))&&(o[s]=n));return o}var n=["add","remove","toggle"],a={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};t.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(e,i){t.fx.step[i]=function(t){("none"!==t.end&&!t.setAttr||1===t.pos&&!t.setAttr)&&(jQuery.style(t.elem,i,t.end),t.setAttr=!0)}}),t.fn.addBack||(t.fn.addBack=function(t){return this.add(null==t?this.prevObject:this.prevObject.filter(t))}),t.effects.animateClass=function(e,a,o,r){var h=t.speed(a,o,r);return this.queue(function(){var a,o=t(this),r=o.attr("class")||"",l=h.children?o.find("*").addBack():o;l=l.map(function(){var e=t(this);return{el:e,start:i(this)}}),a=function(){t.each(n,function(t,i){e[i]&&o[i+"Class"](e[i])})},a(),l=l.map(function(){return this.end=i(this.el[0]),this.diff=s(this.start,this.end),this}),o.attr("class",r),l=l.map(function(){var e=this,i=t.Deferred(),s=t.extend({},h,{queue:!1,complete:function(){i.resolve(e)}});return this.el.animate(this.diff,s),i.promise()}),t.when.apply(t,l.get()).done(function(){a(),t.each(arguments,function(){var e=this.el;t.each(this.diff,function(t){e.css(t,"")})}),h.complete.call(o[0])})})},t.fn.extend({addClass:function(e){return function(i,s,n,a){return s?t.effects.animateClass.call(this,{add:i},s,n,a):e.apply(this,arguments)}}(t.fn.addClass),removeClass:function(e){return function(i,s,n,a){return arguments.length>1?t.effects.animateClass.call(this,{remove:i},s,n,a):e.apply(this,arguments)}}(t.fn.removeClass),toggleClass:function(i){return function(s,n,a,o,r){return"boolean"==typeof n||n===e?a?t.effects.animateClass.call(this,n?{add:s}:{remove:s},a,o,r):i.apply(this,arguments):t.effects.animateClass.call(this,{toggle:s},n,a,o)}}(t.fn.toggleClass),switchClass:function(e,i,s,n,a){return t.effects.animateClass.call(this,{add:i,remove:e},s,n,a)}})}(),function(){function s(e,i,s,n){return t.isPlainObject(e)&&(i=e,e=e.effect),e={effect:e},null==i&&(i={}),t.isFunction(i)&&(n=i,s=null,i={}),("number"==typeof i||t.fx.speeds[i])&&(n=s,s=i,i={}),t.isFunction(s)&&(n=s,s=null),i&&t.extend(e,i),s=s||i.duration,e.duration=t.fx.off?0:"number"==typeof s?s:s in t.fx.speeds?t.fx.speeds[s]:t.fx.speeds._default,e.complete=n||i.complete,e}function n(e){return!e||"number"==typeof e||t.fx.speeds[e]?!0:"string"!=typeof e||t.effects.effect[e]?t.isFunction(e)?!0:"object"!=typeof e||e.effect?!1:!0:!0}t.extend(t.effects,{version:"1.10.2",save:function(t,e){for(var s=0;e.length>s;s++)null!==e[s]&&t.data(i+e[s],t[0].style[e[s]])},restore:function(t,s){var n,a;for(a=0;s.length>a;a++)null!==s[a]&&(n=t.data(i+s[a]),n===e&&(n=""),t.css(s[a],n))},setMode:function(t,e){return"toggle"===e&&(e=t.is(":hidden")?"show":"hide"),e},getBaseline:function(t,e){var i,s;switch(t[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=t[0]/e.height}switch(t[1]){case"left":s=0;break;case"center":s=.5;break;case"right":s=1;break;default:s=t[1]/e.width}return{x:s,y:i}},createWrapper:function(e){if(e.parent().is(".ui-effects-wrapper"))return e.parent();var i={width:e.outerWidth(!0),height:e.outerHeight(!0),"float":e.css("float")},s=t("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),n={width:e.width(),height:e.height()},a=document.activeElement;try{a.id}catch(o){a=document.body}return e.wrap(s),(e[0]===a||t.contains(e[0],a))&&t(a).focus(),s=e.parent(),"static"===e.css("position")?(s.css({position:"relative"}),e.css({position:"relative"})):(t.extend(i,{position:e.css("position"),zIndex:e.css("z-index")}),t.each(["top","left","bottom","right"],function(t,s){i[s]=e.css(s),isNaN(parseInt(i[s],10))&&(i[s]="auto")}),e.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),e.css(n),s.css(i).show()},removeWrapper:function(e){var i=document.activeElement;return e.parent().is(".ui-effects-wrapper")&&(e.parent().replaceWith(e),(e[0]===i||t.contains(e[0],i))&&t(i).focus()),e},setTransition:function(e,i,s,n){return n=n||{},t.each(i,function(t,i){var a=e.cssUnit(i);a[0]>0&&(n[i]=a[0]*s+a[1])}),n}}),t.fn.extend({effect:function(){function e(e){function s(){t.isFunction(a)&&a.call(n[0]),t.isFunction(e)&&e()}var n=t(this),a=i.complete,r=i.mode;(n.is(":hidden")?"hide"===r:"show"===r)?(n[r](),s()):o.call(n[0],i,s)}var i=s.apply(this,arguments),n=i.mode,a=i.queue,o=t.effects.effect[i.effect];return t.fx.off||!o?n?this[n](i.duration,i.complete):this.each(function(){i.complete&&i.complete.call(this)}):a===!1?this.each(e):this.queue(a||"fx",e)},show:function(t){return function(e){if(n(e))return t.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="show",this.effect.call(this,i)}}(t.fn.show),hide:function(t){return function(e){if(n(e))return t.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="hide",this.effect.call(this,i)}}(t.fn.hide),toggle:function(t){return function(e){if(n(e)||"boolean"==typeof e)return t.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="toggle",this.effect.call(this,i)}}(t.fn.toggle),cssUnit:function(e){var i=this.css(e),s=[];return t.each(["em","px","%","pt"],function(t,e){i.indexOf(e)>0&&(s=[parseFloat(i),e])}),s}})}(),function(){var e={};t.each(["Quad","Cubic","Quart","Quint","Expo"],function(t,i){e[i]=function(e){return Math.pow(e,t+2)}}),t.extend(e,{Sine:function(t){return 1-Math.cos(t*Math.PI/2)},Circ:function(t){return 1-Math.sqrt(1-t*t)},Elastic:function(t){return 0===t||1===t?t:-Math.pow(2,8*(t-1))*Math.sin((80*(t-1)-7.5)*Math.PI/15)},Back:function(t){return t*t*(3*t-2)},Bounce:function(t){for(var e,i=4;((e=Math.pow(2,--i))-1)/11>t;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*e-2)/22-t,2)}}),t.each(e,function(e,i){t.easing["easeIn"+e]=i,t.easing["easeOut"+e]=function(t){return 1-i(1-t)},t.easing["easeInOut"+e]=function(t){return.5>t?i(2*t)/2:1-i(-2*t+2)/2}})}()})(jQuery);(function(t){t.effects.effect.highlight=function(e,i){var s=t(this),n=["backgroundImage","backgroundColor","opacity"],a=t.effects.setMode(s,e.mode||"show"),o={backgroundColor:s.css("backgroundColor")};"hide"===a&&(o.opacity=0),t.effects.save(s,n),s.show().css({backgroundImage:"none",backgroundColor:e.color||"#ffff99"}).animate(o,{queue:!1,duration:e.duration,easing:e.easing,complete:function(){"hide"===a&&s.hide(),t.effects.restore(s,n),i()}})}})(jQuery);
/*
jquery.animate-enhanced plugin v1.02
---
http://github.com/benbarnett/jQuery-Animate-Enhanced
http://benbarnett.net
@benpbarnett
---
Copyright (c) 2012 Ben Barnett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
---
Extends jQuery.animate() to automatically use CSS3 transformations where applicable.
Tested with jQuery 1.3.2+

Supports -moz-transition, -webkit-transition, -o-transition, transition

Targetted properties (for now):
	- left
	- top
	- opacity
	- width
	- height

Usage (exactly the same as it would be normally):

	jQuery(element).animate({left: 200},  500, function() {
		// callback
	});

Changelog:
	1.02 (8/5/2013):
		- Fixing use3D default flags. It must explicitly be set to false to disable 3d now, the plugin by default will use it if available.

	1.01 (8/5/2013):
		- Adding appropriate display value for wider range of elements (issue #121 - thanks smacky)

	1.0 (8/5/2103):
		- Fix avoidTransforms: true behaviour for directional transitions

	0.99.1 (3/4/2013):
		- Add Set or unset the 'disabled by default' value (PR #117)

	0.99 (5/12/2012):
		- PR #109 Added support for list-item nodes. FadeIn on tags was omitting the list-style support. (thx @SeanCannon)
		
	0.98 (12/11/2012):
		- Merging pull request #106 thx @gboysko - checking for ownerDocument before using getComputedStyle

	0.97 (6/11/2012):
		- Merging pull request #104 thx @gavrochelegnou - .bind instead of .one

	0.96a (20/08/2012):
		- Checking event is from dispatch target (issue #58)

	0.96 (20/08/2012):
		- Fixes for context, all elements returned as context (issue #84)
		- Reset position with leaveTransforms !== true fixes (issue #93)
		

	0.95 (20/08/2012):
		- If target opacity == current opacity, pass back to jquery native to get callback firing (#94)

	0.94 (20/08/2012):
		- Addresses Firefox callback mechanisms (issue #94)
		- using $.one() to bind to CSS callbacks in a more generic way

	0.93 (6/8/2012):
		- Adding other Opera 'transitionend' event (re: issue #90)

	0.92 (6/8/2012):
		- Seperate unbinds into different threads (re: issue #91)

	0.91 (2/4/2012):
		- Merge Pull Request #74 - Unit Management

	0.90 (7/3/2012):
		- Adding public $.toggleDisabledByDefault() feature to disable entire plugin by default (Issue #73)

	0.89 (24/1/2012):
		- Adding 'avoidCSSTransitions' property. Set to true to disable entire plugin. (Issue #47)

	0.88 (24/1/2012):
		- Fix Issue #67 for HighchartsJS compatibility

	0.87 (24/1/2012):
		- Fix Issue #66 selfCSSData.original is undefined

	0.86 (9/1/2012):
		- Strict JS fix for undefined variable

	0.85 (20/12/2011):
		- Merge Pull request #57 from Kronuz
		- Codebase cleaned and now passes jshint.
		- Fixed a few bugs (it now saves and restores the original css transition properties).
		- fadeOut() is fixed, it wasn't restoring the opacity after hiding it.

	0.80 (13/09/2011):
		- Issue #28 - Report $(el).is(':animated') fix

	0.79 (06/09/2011):
		- Issue #42 - Right negative position animation: please see issue notes on Github.

	0.78 (02/09/2011):
		- Issue #18 - jQuery/$ reference joys

	0.77 (02/09/2011):
		- Adding feature on Github issue #44 - Use 3D Transitions by default

	0.76 (28/06/2011):
		- Fixing issue #37 - fixed stop() method (with gotoEnd == false)

	0.75 (15/06/2011):
		- Fixing issue #35 to pass actual object back as context for callback

	0.74 (28/05/2011):
		- Fixing issue #29 to play nice with 1.6+

	0.73 (05/03/2011):
		- Merged Pull Request #26: Fixed issue with fadeOut() / "hide" shortcut

	0.72 (05/03/2011):
		- Merged Pull Request #23: Added Penner equation approximations from Matthew Lein's Ceaser, and added failsafe fallbacks

	0.71 (05/03/2011):
		- Merged Pull Request #24: Changes translation object to integers instead of strings to fix relative values bug with leaveTransforms = true

	0.70 (17/03/2011):
		- Merged Pull Request from amlw-nyt to add bottom/right handling

	0.68 (15/02/2011):
		- width/height fixes & queue issues resolved.

	0.67 (15/02/2011):
		- Code cleanups & file size improvements for compression.

	0.66 (15/02/2011):
		- Zero second fadeOut(), fadeIn() fixes

	0.65 (01/02/2011):
		- Callbacks with queue() support refactored to support element arrays

	0.64 (27/01/2011):
		- BUGFIX #13: .slideUp(), .slideToggle(), .slideDown() bugfixes in Webkit

	0.63 (12/01/2011):
		- BUGFIX #11: callbacks not firing when new value == old value

	0.62 (10/01/2011):
		- BUGFIX #11: queue is not a function issue fixed

	0.61 (10/01/2011):
		- BUGFIX #10: Negative positions converting to positive

	0.60 (06/01/2011):
		- Animate function rewrite in accordance with new queue system
		- BUGFIX #8: Left/top position values always assumed relative rather than absolute
		- BUGFIX #9: animation as last item in a chain - the chain is ignored?
		- BUGFIX: width/height CSS3 transformation with left/top working

	0.55 (22/12/2010):
		- isEmptyObject function for <jQuery 1.4 (requires 1.3.2)

	0.54a (22/12/2010):
		- License changed to MIT (http://www.opensource.org/licenses/mit-license.php)

	0.54 (22/12/2010):
		- Removed silly check for 'jQuery UI' bailouts. Sorry.
		- Scoping issues fixed - Issue #4: $(this) should give you a reference to the selector being animated.. per jquery's core animation funciton.

	0.53 (17/11/2010):
		- New $.translate() method to easily calculate current transformed translation
		- Repeater callback bug fix for leaveTransforms:true (was constantly appending properties)

	0.52 (16/11/2010):
		- leaveTransforms: true bug fixes
		- 'Applying' user callback function to retain 'this' context

	0.51 (08/11/2010):
		- Bailing out with jQuery UI. This is only so the plugin plays nice with others and is TEMPORARY.

	0.50 (08/11/2010):
		- Support for $.fn.stop()
		- Fewer jQuery.fn entries to preserve namespace
		- All references $ converted to jQuery
		- jsDoc Toolkit style commenting for docs (coming soon)

	0.49 (19/10/2010):
		- Handling of 'undefined' errors for secondary CSS objects
		- Support to enhance 'width' and 'height' properties (except shortcuts involving jQuery.fx.step, e.g slideToggle)
		- Bugfix: Positioning when using avoidTransforms: true (thanks Ralf Santbergen reports)
		- Bugfix: Callbacks and Scope issues

	0.48 (13/10/2010):
		- Checks for 3d support before applying

	0.47 (12/10/2010);
		- Compatible with .fadeIn(), .fadeOut()
		- Use shortcuts, no duration for jQuery default or "fast" and "slow"
		- Clean up callback event listeners on complete (preventing multiple callbacks)

	0.46 (07/10/2010);
		- Compatible with .slideUp(), .slideDown(), .slideToggle()

	0.45 (06/10/2010):
		- 'Zero' position bug fix (was originally translating by 0 zero pixels, i.e. no movement)

	0.4 (05/10/2010):
		- Iterate over multiple elements and store transforms in jQuery.data per element
		- Include support for relative values (+= / -=)
		- Better unit sanitization
		- Performance tweaks
		- Fix for optional callback function (was required)
		- Applies data[translateX] and data[translateY] to elements for easy access
		- Added 'easeInOutQuint' easing function for CSS transitions (requires jQuery UI for JS anims)
		- Less need for leaveTransforms = true due to better position detections
*/

(function(jQuery, originalAnimateMethod, originalStopMethod) {

	// ----------
	// Plugin variables
	// ----------
	var	cssTransitionProperties = ['top', 'right', 'bottom', 'left', 'opacity', 'height', 'width'],
		directions = ['top', 'right', 'bottom', 'left'],
		cssPrefixes = ['-webkit-', '-moz-', '-o-', ''],
		pluginOptions = ['avoidTransforms', 'useTranslate3d', 'leaveTransforms'],
		rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/,
		rupper = /([A-Z])/g,
		defaultEnhanceData = {
			secondary: {},
			meta: {
				top : 0,
				right : 0,
				bottom : 0,
				left : 0
			}
		},
		valUnit = 'px',

		DATA_KEY = 'jQe',
		CUBIC_BEZIER_OPEN = 'cubic-bezier(',
		CUBIC_BEZIER_CLOSE = ')',

		originalAnimatedFilter = null,
		pluginDisabledDefault = false;


	// ----------
	// Check if this browser supports CSS3 transitions
	// ----------
	var thisBody = document.body || document.documentElement,
		thisStyle = thisBody.style,
		transitionEndEvent = 'webkitTransitionEnd oTransitionEnd transitionend',
		cssTransitionsSupported = thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.OTransition !== undefined || thisStyle.transition !== undefined,
		has3D = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
		use3DByDefault = has3D;



	// ----------
	// Extended :animated filter
	// ----------
	if ( jQuery.expr && jQuery.expr.filters ) {
		originalAnimatedFilter = jQuery.expr.filters.animated;
		jQuery.expr.filters.animated = function(elem) {
			return jQuery(elem).data('events') && jQuery(elem).data('events')[transitionEndEvent] ? true : originalAnimatedFilter.call(this, elem);
		};
	}


	/**
		@private
		@name _getUnit
		@function
		@description Return unit value ("px", "%", "em" for re-use correct one when translating)
		@param {variant} [val] Target value
	*/
	function _getUnit(val){
		return val.match(/\D+$/);
	}


	/**
		@private
		@name _interpretValue
		@function
		@description Interpret value ("px", "+=" and "-=" sanitisation)
		@param {object} [element] The Element for current CSS analysis
		@param {variant} [val] Target value
		@param {string} [prop] The property we're looking at
		@param {boolean} [isTransform] Is this a CSS3 transform?
	*/
	function _interpretValue(e, val, prop, isTransform) {
		// this is a nasty fix, but we check for prop == 'd' to see if we're dealing with SVG, and abort
		if (prop == "d") return;
		if (!_isValidElement(e)) return;
		
		var parts = rfxnum.exec(val),
			start = e.css(prop) === 'auto' ? 0 : e.css(prop),
			cleanCSSStart = typeof start == 'string' ? _cleanValue(start) : start,
			cleanTarget = typeof val == 'string' ? _cleanValue(val) : val,
			cleanStart = isTransform === true ? 0 : cleanCSSStart,
			hidden = e.is(':hidden'),
			translation = e.translation();

		if (prop == 'left') cleanStart = parseInt(cleanCSSStart, 10) + translation.x;
		if (prop == 'right') cleanStart = parseInt(cleanCSSStart, 10) + translation.x;
		if (prop == 'top') cleanStart = parseInt(cleanCSSStart, 10) + translation.y;
		if (prop == 'bottom') cleanStart = parseInt(cleanCSSStart, 10) + translation.y;

		// deal with shortcuts
		if (!parts && val == 'show') {
			cleanStart = 1;
			if (hidden) e.css({'display': _domElementVisibleDisplayValue(e.context.tagName), 'opacity': 0});
		} else if (!parts && val == "hide") {
			cleanStart = 0;
		}

		if (parts) {
			var end = parseFloat(parts[2]);

			// If a +=/-= token was provided, we're doing a relative animation
			if (parts[1]) end = ((parts[1] === '-=' ? -1 : 1) * end) + parseInt(cleanStart, 10);
			return end;
		} else {
			return cleanStart;
		}
	}

	/**
		@private
		@name _getTranslation
		@function
		@description Make a translate or translate3d string
		@param {integer} [x]
		@param {integer} [y]
		@param {boolean} [use3D] Use translate3d if available?
	*/
	function _getTranslation(x, y, use3D) {
		return ((use3D === true || ((use3DByDefault === true && use3D !== false)) && has3D)) ? 'translate3d(' + x + 'px, ' + y + 'px, 0)' : 'translate(' + x + 'px,' + y + 'px)';
	}


	/**
		@private
		@name _applyCSSTransition
		@function
		@description Build up the CSS object
		@param {object} [e] Element
		@param {string} [property] Property we're dealing with
		@param {integer} [duration] Duration
		@param {string} [easing] Easing function
		@param {variant} [value] String/integer for target value
		@param {boolean} [isTransform] Is this a CSS transformation?
		@param {boolean} [isTranslatable] Is this a CSS translation?
		@param {boolean} [use3D] Use translate3d if available?
	*/
	function _applyCSSTransition(e, property, duration, easing, value, isTransform, isTranslatable, use3D) {
		var eCSSData = e.data(DATA_KEY),
			enhanceData = eCSSData && !_isEmptyObject(eCSSData) ? eCSSData : jQuery.extend(true, {}, defaultEnhanceData),
			offsetPosition = value,
			isDirection = jQuery.inArray(property, directions) > -1;


		if (isDirection) {
			var meta = enhanceData.meta,
				cleanPropertyValue = _cleanValue(e.css(property)) || 0,
				stashedProperty = property + '_o';

			offsetPosition = value - cleanPropertyValue;


			meta[property] = offsetPosition;
			meta[stashedProperty] = e.css(property) == 'auto' ? 0 + offsetPosition : cleanPropertyValue + offsetPosition || 0;
			enhanceData.meta = meta;

			// fix 0 issue (transition by 0 = nothing)
			if (isTranslatable && offsetPosition === 0) {
				offsetPosition = 0 - meta[stashedProperty];
				meta[property] = offsetPosition;
				meta[stashedProperty] = 0;
			}
		}

		// reapply data and return
		return e.data(DATA_KEY, _applyCSSWithPrefix(e, enhanceData, property, duration, easing, offsetPosition, isTransform, isTranslatable, use3D));
	}

	/**
		@private
		@name _applyCSSWithPrefix
		@function
		@description Helper function to build up CSS properties using the various prefixes
		@param {object} [cssProperties] Current CSS object to merge with
		@param {string} [property]
		@param {integer} [duration]
		@param {string} [easing]
		@param {variant} [value]
		@param {boolean} [isTransform] Is this a CSS transformation?
		@param {boolean} [isTranslatable] Is this a CSS translation?
		@param {boolean} [use3D] Use translate3d if available?
	*/
	function _applyCSSWithPrefix(e, cssProperties, property, duration, easing, value, isTransform, isTranslatable, use3D) {
		var saveOriginal = false,
			transform = isTransform === true && isTranslatable === true;


		cssProperties = cssProperties || {};
		if (!cssProperties.original) {
			cssProperties.original = {};
			saveOriginal = true;
		}
		cssProperties.properties = cssProperties.properties || {};
		cssProperties.secondary = cssProperties.secondary || {};

		var meta = cssProperties.meta,
			original = cssProperties.original,
			properties = cssProperties.properties,
			secondary = cssProperties.secondary;

		for (var i = cssPrefixes.length - 1; i >= 0; i--) {
			var tp = cssPrefixes[i] + 'transition-property',
				td = cssPrefixes[i] + 'transition-duration',
				tf = cssPrefixes[i] + 'transition-timing-function';

			property = (transform ? cssPrefixes[i] + 'transform' : property);

			if (saveOriginal) {
				original[tp] = e.css(tp) || '';
				original[td] = e.css(td) || '';
				original[tf] = e.css(tf) || '';
			}

			secondary[property] = transform ? _getTranslation(meta.left, meta.top, use3D) : value;

			properties[tp] = (properties[tp] ? properties[tp] + ',' : '') + property;
			properties[td] = (properties[td] ? properties[td] + ',' : '') + duration + 'ms';
			properties[tf] = (properties[tf] ? properties[tf] + ',' : '') + easing;
		}

		return cssProperties;
	}

	/**
		@private
		@name _isBoxShortcut
		@function
		@description Shortcut to detect if we need to step away from slideToggle, CSS accelerated transitions (to come later with fx.step support)
		@param {object} [prop]
	*/
	function _isBoxShortcut(prop) {
		for (var property in prop) {
			if ((property == 'width' || property == 'height') && (prop[property] == 'show' || prop[property] == 'hide' || prop[property] == 'toggle')) {
				return true;
			}
		}
		return false;
	}


	/**
		@private
		@name _isEmptyObject
		@function
		@description Check if object is empty (<1.4 compatibility)
		@param {object} [obj]
	*/
	function _isEmptyObject(obj) {
		for (var i in obj) {
			return false;
		}
		return true;
	}

	/**
	 * Fetch most appropriate display value for element types
	 * @see  https://github.com/benbarnett/jQuery-Animate-Enhanced/issues/121
	 * @private
	 * @param  {[type]} tagName [description]
	 * @return {[type]}         [description]
	 */
	function _domElementVisibleDisplayValue(tagName) {
		tagName = tagName.toUpperCase();
		var displayValues = {
			'LI'       : 'list-item',
			'TR'       : 'table-row',
			'TD'       : 'table-cell',
			'TH'       : 'table-cell',
			'CAPTION'  : 'table-caption',
			'COL'      : 'table-column',
			'COLGROUP' : 'table-column-group',
			'TFOOT'      : 'table-footer-group',
			'THEAD'      : 'table-header-group',
			'TBODY'      : 'table-row-group'
		};

		return typeof displayValues[tagName] == 'string' ? displayValues[tagName] : 'block';
	}


	/**
		@private
		@name _cleanValue
		@function
		@description Remove 'px' and other artifacts
		@param {variant} [val]
	*/
	function _cleanValue(val) {
		return parseFloat(val.replace(_getUnit(val), ''));
	}


	function _isValidElement(element) {
		var allValid=true;
		element.each(function(index, el) {
			allValid = allValid && el.ownerDocument;
			return allValid;
		});
		return allValid;
	}

	/**
		@private
		@name _appropriateProperty
		@function
		@description Function to check if property should be handled by plugin
		@param {string} [prop]
		@param {variant} [value]
	*/
	function _appropriateProperty(prop, value, element) {
		if (!_isValidElement(element)) {
			return false;
		}

		var is = jQuery.inArray(prop, cssTransitionProperties) > -1;
		if ((prop == 'width' || prop == 'height' || prop == 'opacity') && (parseFloat(value) === parseFloat(element.css(prop)))) is = false;
		return is;
	}


	jQuery.extend({
		/**
			@public
			@name toggle3DByDefault
			@function
			@description Toggle for plugin settings to automatically use translate3d (where available). Usage: $.toggle3DByDefault
		*/
		toggle3DByDefault: function() {
			return use3DByDefault = !use3DByDefault;
		},
		
		
		/**
			@public
			@name toggleDisabledByDefault
			@function
			@description Toggle the plugin to be disabled by default (can be overridden per animation with avoidCSSTransitions)
		*/
		toggleDisabledByDefault: function() {
			return pluginDisabledDefault = !pluginDisabledDefault;
		},


		/**
			@public
			@name setDisabledByDefault
			@function
			@description Set or unset the 'disabled by default' value
		*/
		setDisabledByDefault: function(newValue) {
			return pluginDisabledDefault = newValue;
		}
	});


	/**
		@public
		@name translation
		@function
		@description Get current X and Y translations
	*/
	jQuery.fn.translation = function() {
		if (!this[0]) {
			return null;
		}

		var	elem = this[0],
			cStyle = window.getComputedStyle(elem, null),
			translation = {
				x: 0,
				y: 0
			};

		if (cStyle) {
			for (var i = cssPrefixes.length - 1; i >= 0; i--) {
				var transform = cStyle.getPropertyValue(cssPrefixes[i] + 'transform');
				if (transform && (/matrix/i).test(transform)) {
					var explodedMatrix = transform.replace(/^matrix\(/i, '').split(/, |\)$/g);
					translation = {
						x: parseInt(explodedMatrix[4], 10),
						y: parseInt(explodedMatrix[5], 10)
					};

					break;
				}
			}
		}

		return translation;
	};



	/**
		@public
		@name jQuery.fn.animate
		@function
		@description The enhanced jQuery.animate function
		@param {string} [property]
		@param {string} [speed]
		@param {string} [easing]
		@param {function} [callback]
	*/
	jQuery.fn.animate = function(prop, speed, easing, callback) {
		prop = prop || {};
		var isTranslatable = !(typeof prop['bottom'] !== 'undefined' || typeof prop['right'] !== 'undefined'),
			optall = jQuery.speed(speed, easing, callback),
			elements = this,
			callbackQueue = 0,
			propertyCallback = function() {
				callbackQueue--;
				if (callbackQueue === 0) {
					// we're done, trigger the user callback
					if (typeof optall.complete === 'function') {
						optall.complete.apply(elements, arguments);
					}
				}
			},
			bypassPlugin = (typeof prop['avoidCSSTransitions'] !== 'undefined') ? prop['avoidCSSTransitions'] : pluginDisabledDefault;

		if (bypassPlugin === true || !cssTransitionsSupported || _isEmptyObject(prop) || _isBoxShortcut(prop) || optall.duration <= 0) {
			return originalAnimateMethod.apply(this, arguments);
		}

		return this[ optall.queue === true ? 'queue' : 'each' ](function() {
			var self = jQuery(this),
				opt = jQuery.extend({}, optall),
				cssCallback = function(e) {
					var selfCSSData = self.data(DATA_KEY) || { original: {} },
						restore = {};

					if (e.eventPhase != 2)  // not at dispatching target (thanks @warappa issue #58)
						return;

					// convert translations to left & top for layout
					if (prop.leaveTransforms !== true) {
						for (var i = cssPrefixes.length - 1; i >= 0; i--) {
							restore[cssPrefixes[i] + 'transform'] = '';
						}
						if (isTranslatable && typeof selfCSSData.meta !== 'undefined') {
							for (var j = 0, dir; (dir = directions[j]); ++j) {
								restore[dir] = selfCSSData.meta[dir + '_o'] + valUnit;
								jQuery(this).css(dir, restore[dir]);
							}
						}
					}

					// remove transition timing functions
					self.
						unbind(transitionEndEvent).
						css(selfCSSData.original).
						css(restore).
						data(DATA_KEY, null);

					// if we used the fadeOut shortcut make sure elements are display:none
					if (prop.opacity === 'hide') {
						self.css({'display': 'none', 'opacity': ''});
					}

					// run the main callback function
					propertyCallback.call(this);
				},
				easings = {
					bounce: CUBIC_BEZIER_OPEN + '0.0, 0.35, .5, 1.3' + CUBIC_BEZIER_CLOSE,
					linear: 'linear',
					swing: 'ease-in-out',

					// Penner equation approximations from Matthew Lein's Ceaser: http://matthewlein.com/ceaser/
					easeInQuad:     CUBIC_BEZIER_OPEN + '0.550, 0.085, 0.680, 0.530' + CUBIC_BEZIER_CLOSE,
					easeInCubic:    CUBIC_BEZIER_OPEN + '0.550, 0.055, 0.675, 0.190' + CUBIC_BEZIER_CLOSE,
					easeInQuart:    CUBIC_BEZIER_OPEN + '0.895, 0.030, 0.685, 0.220' + CUBIC_BEZIER_CLOSE,
					easeInQuint:    CUBIC_BEZIER_OPEN + '0.755, 0.050, 0.855, 0.060' + CUBIC_BEZIER_CLOSE,
					easeInSine:     CUBIC_BEZIER_OPEN + '0.470, 0.000, 0.745, 0.715' + CUBIC_BEZIER_CLOSE,
					easeInExpo:     CUBIC_BEZIER_OPEN + '0.950, 0.050, 0.795, 0.035' + CUBIC_BEZIER_CLOSE,
					easeInCirc:     CUBIC_BEZIER_OPEN + '0.600, 0.040, 0.980, 0.335' + CUBIC_BEZIER_CLOSE,
					easeInBack:     CUBIC_BEZIER_OPEN + '0.600, -0.280, 0.735, 0.045' + CUBIC_BEZIER_CLOSE,
					easeOutQuad:    CUBIC_BEZIER_OPEN + '0.250, 0.460, 0.450, 0.940' + CUBIC_BEZIER_CLOSE,
					easeOutCubic:   CUBIC_BEZIER_OPEN + '0.215, 0.610, 0.355, 1.000' + CUBIC_BEZIER_CLOSE,
					easeOutQuart:   CUBIC_BEZIER_OPEN + '0.165, 0.840, 0.440, 1.000' + CUBIC_BEZIER_CLOSE,
					easeOutQuint:   CUBIC_BEZIER_OPEN + '0.230, 1.000, 0.320, 1.000' + CUBIC_BEZIER_CLOSE,
					easeOutSine:    CUBIC_BEZIER_OPEN + '0.390, 0.575, 0.565, 1.000' + CUBIC_BEZIER_CLOSE,
					easeOutExpo:    CUBIC_BEZIER_OPEN + '0.190, 1.000, 0.220, 1.000' + CUBIC_BEZIER_CLOSE,
					easeOutCirc:    CUBIC_BEZIER_OPEN + '0.075, 0.820, 0.165, 1.000' + CUBIC_BEZIER_CLOSE,
					easeOutBack:    CUBIC_BEZIER_OPEN + '0.175, 0.885, 0.320, 1.275' + CUBIC_BEZIER_CLOSE,
					easeInOutQuad:  CUBIC_BEZIER_OPEN + '0.455, 0.030, 0.515, 0.955' + CUBIC_BEZIER_CLOSE,
					easeInOutCubic: CUBIC_BEZIER_OPEN + '0.645, 0.045, 0.355, 1.000' + CUBIC_BEZIER_CLOSE,
					easeInOutQuart: CUBIC_BEZIER_OPEN + '0.770, 0.000, 0.175, 1.000' + CUBIC_BEZIER_CLOSE,
					easeInOutQuint: CUBIC_BEZIER_OPEN + '0.860, 0.000, 0.070, 1.000' + CUBIC_BEZIER_CLOSE,
					easeInOutSine:  CUBIC_BEZIER_OPEN + '0.445, 0.050, 0.550, 0.950' + CUBIC_BEZIER_CLOSE,
					easeInOutExpo:  CUBIC_BEZIER_OPEN + '1.000, 0.000, 0.000, 1.000' + CUBIC_BEZIER_CLOSE,
					easeInOutCirc:  CUBIC_BEZIER_OPEN + '0.785, 0.135, 0.150, 0.860' + CUBIC_BEZIER_CLOSE,
					easeInOutBack:  CUBIC_BEZIER_OPEN + '0.680, -0.550, 0.265, 1.550' + CUBIC_BEZIER_CLOSE
				},
				domProperties = {},
				cssEasing = easings[opt.easing || 'swing'] ? easings[opt.easing || 'swing'] : opt.easing || 'swing';

			// seperate out the properties for the relevant animation functions
			for (var p in prop) {
				if (jQuery.inArray(p, pluginOptions) === -1) {
					var isDirection = jQuery.inArray(p, directions) > -1,
						cleanVal = _interpretValue(self, prop[p], p, (isDirection && prop.avoidTransforms !== true));


					if (/**prop.avoidTransforms !== true && **/_appropriateProperty(p, cleanVal, self)) {
						_applyCSSTransition(
							self,
							p,
							opt.duration,
							cssEasing,
							cleanVal, //isDirection && prop.avoidTransforms === true ? cleanVal + valUnit : cleanVal,
							isDirection && prop.avoidTransforms !== true,
							isTranslatable,
							prop.useTranslate3d);

					}
					else {
						domProperties[p] = prop[p];
					}
				}
			}

			self.unbind(transitionEndEvent);

			var selfCSSData = self.data(DATA_KEY);


			if (selfCSSData && !_isEmptyObject(selfCSSData) && !_isEmptyObject(selfCSSData.secondary)) {
				callbackQueue++;

				self.css(selfCSSData.properties);

				// store in a var to avoid any timing issues, depending on animation duration
				var secondary = selfCSSData.secondary;

				// has to be done in a timeout to ensure transition properties are set
				setTimeout(function() {
					self.bind(transitionEndEvent, cssCallback).css(secondary);
				});
			}
			else {
				// it won't get fired otherwise
				opt.queue = false;
			}

			// fire up DOM based animations
			if (!_isEmptyObject(domProperties)) {
				callbackQueue++;
				originalAnimateMethod.apply(self, [domProperties, {
					duration: opt.duration,
					easing: jQuery.easing[opt.easing] ? opt.easing : (jQuery.easing.swing ? 'swing' : 'linear'),
					complete: propertyCallback,
					queue: opt.queue
				}]);
			}

			// strict JS compliance
			return true;
		});
	};

    jQuery.fn.animate.defaults = {};


	/**
		@public
		@name jQuery.fn.stop
		@function
		@description The enhanced jQuery.stop function (resets transforms to left/top)
		@param {boolean} [clearQueue]
		@param {boolean} [gotoEnd]
		@param {boolean} [leaveTransforms] Leave transforms/translations as they are? Default: false (reset translations to calculated explicit left/top props)
	*/
	jQuery.fn.stop = function(clearQueue, gotoEnd, leaveTransforms) {
		if (!cssTransitionsSupported) return originalStopMethod.apply(this, [clearQueue, gotoEnd]);

		// clear the queue?
		if (clearQueue) this.queue([]);

		// route to appropriate stop methods
		this.each(function() {
			var self = jQuery(this),
				selfCSSData = self.data(DATA_KEY);

			// is this a CSS transition?
			if (selfCSSData && !_isEmptyObject(selfCSSData)) {
				var i, restore = {};

				if (gotoEnd) {
					// grab end state properties
					restore = selfCSSData.secondary;

					if (!leaveTransforms && typeof selfCSSData.meta['left_o'] !== undefined || typeof selfCSSData.meta['top_o'] !== undefined) {
						restore['left'] = typeof selfCSSData.meta['left_o'] !== undefined ? selfCSSData.meta['left_o'] : 'auto';
						restore['top'] = typeof selfCSSData.meta['top_o'] !== undefined ? selfCSSData.meta['top_o'] : 'auto';

						// remove the transformations
						for (i = cssPrefixes.length - 1; i >= 0; i--) {
							restore[cssPrefixes[i]+'transform'] = '';
						}
					}
				} else if (!_isEmptyObject(selfCSSData.secondary)) {
					var cStyle = window.getComputedStyle(self[0], null);
					if (cStyle) {
						// grab current properties
						for (var prop in selfCSSData.secondary) {
							if(selfCSSData.secondary.hasOwnProperty(prop)) {
								prop = prop.replace(rupper, '-$1').toLowerCase();
								restore[prop] = cStyle.getPropertyValue(prop);

								// is this a matrix property? extract left and top and apply
								if (!leaveTransforms && (/matrix/i).test(restore[prop])) {
									var explodedMatrix = restore[prop].replace(/^matrix\(/i, '').split(/, |\)$/g);

									// apply the explicit left/top props
									restore['left'] = (parseFloat(explodedMatrix[4]) + parseFloat(self.css('left')) + valUnit) || 'auto';
									restore['top'] = (parseFloat(explodedMatrix[5]) + parseFloat(self.css('top')) + valUnit) || 'auto';

									// remove the transformations
									for (i = cssPrefixes.length - 1; i >= 0; i--) {
										restore[cssPrefixes[i]+'transform'] = '';
									}
								}
							}
						}
					}
				}

				// Remove transition timing functions
				// Moving to seperate thread (re: Animation reverts when finished in Android - issue #91)
				self.unbind(transitionEndEvent);
				self.
					css(selfCSSData.original).
					css(restore).
					data(DATA_KEY, null);
			}
			else {
				// dom transition
				originalStopMethod.apply(self, [clearQueue, gotoEnd]);
			}
		});

		return this;
	};
})(jQuery, jQuery.fn.animate, jQuery.fn.stop);

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
// http://jsbin.com/ahaxe

(function($){

    $.fn.autoGrowInput = function(o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function(){

            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                }),
                check = function() {

                    if (val === (val = input.val())) {return;}

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                                             || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }

                };

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', check);

        });

        return this;

    };

})(jQuery);

(function($) {

 $.textMetrics = function(el) {

  var h = 0, w = 0;

  var div = document.createElement('div');
  document.body.appendChild(div);
  $(div).css({
   position: 'absolute',
   left: -1000,
   top: -1000,
   display: 'none'
  });

  $(div).html($(el).html());
  var styles = ['font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing'];
  $(styles).each(function() {
   var s = this.toString();
   $(div).css(s, $(el).css(s));
  });

  h = $(div).outerHeight();
  w = $(div).outerWidth();

  $(div).remove();

  var ret = {
   height: h,
   width: w
  };

  return ret;
 }

})(jQuery);

/*
* smartscroll: debounced scroll event for jQuery *
* https://github.com/lukeshumard/smartscroll
* based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
* Copyright 2011 Louis-Remi & lukeshumard * Licensed under the MIT license. *
*/

(function(window, $, undefined) {
  var event = $.event,
      scrollTimeout;

  event.special.smartscroll = {
      setup: function() {
        $(this).bind( "scroll", $.event.special.smartscroll.handler );
      },
      teardown: function() {
        $(this).unbind( "scroll", $.event.special.smartscroll.handler );
      },
      handler: function( event, execAsap ) {
        // Save the context
        var context = this,
            args = arguments;

        // set correct event type
        event.type = "smartscroll";

        if (scrollTimeout) { clearTimeout(scrollTimeout); }
        scrollTimeout = setTimeout(function() {
          $(context).trigger(event.type, args);
        }, execAsap === "execAsap"? 0 : 100);
      }
  };

  $.fn.smartscroll = function( fn ) {
      return fn ? this.bind( "smartscroll", fn ) : this.trigger( "smartscroll", ["execAsap"] );
  };
})(window, jQuery);

// moment.js
// version : 2.0.0
// author : Tim Wood
// license : MIT
// momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.0.0",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing tokens
        parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenWord = /[0-9]*[a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF]+\s*?[\u0600-\u06FF]+/i, // any word (or two) characters or numbers including two word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        // preliminary iso regex
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return ~~(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(~~(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(10 * a / 6), 4);
            },
            X    : function () {
                return this.unix();
            }
        };

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a));
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i]);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var data = this._data = {},
            years = duration.years || duration.year || duration.y || 0,
            months = duration.months || duration.month || duration.M || 0,
            weeks = duration.weeks || duration.week || duration.w || 0,
            days = duration.days || duration.day || duration.d || 0,
            hours = duration.hours || duration.hour || duration.h || 0,
            minutes = duration.minutes || duration.minute || duration.m || 0,
            seconds = duration.seconds || duration.second || duration.s || 0,
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds += absRound(milliseconds / 1000);

        data.seconds = seconds % 60;
        minutes += absRound(seconds / 60);

        data.minutes = minutes % 60;
        hours += absRound(minutes / 60);

        data.hours = hours % 24;
        days += absRound(hours / 24);

        days += weeks * 7;
        data.days = days % 30;

        months += absRound(days / 30);

        data.months = months % 12;
        years += absRound(months / 12);

        data.years = years;
    }


    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
        var ms = duration._milliseconds,
            d = duration._days,
            M = duration._months,
            currentDate;

        if (ms) {
            mom._d.setTime(+mom + ms * isAdding);
        }
        if (d) {
            mom.date(mom.date() + d * isAdding);
        }
        if (M) {
            currentDate = mom.date();
            mom.date(1)
                .month(mom.month() + M * isAdding)
                .date(Math.min(currentDate, mom.daysInMonth()));
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }


    /************************************
        Languages
    ************************************/


    Language.prototype = {
        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex, output;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy);
        },
        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    };

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        if (!key) {
            return moment.fn._lang;
        }
        if (!languages[key] && hasModule) {
            require('./lang/' + key);
        }
        return languages[key];
    }


    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[.*\]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += typeof array[i].call === 'function' ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return m.lang().longDateFormat(input) || input;
        }

        while (i-- && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'YYYYY':
            return parseTokenSixDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'a':
        case 'A':
            return parseTokenWord;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, b,
            datePartArray = config._a;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[1] = a;
            } else {
                config._isValid = false;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
            break;
        case 'YYYY' :
        case 'YYYYY' :
            datePartArray[0] = ~~input;
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = ((input + '').toLowerCase() === 'pm');
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            a = (input + '').match(parseTimezoneChunker);
            if (a && a[1]) {
                config._tzh = ~~a[1];
            }
            if (a && a[2]) {
                config._tzm = ~~a[2];
            }
            // reverse offsets
            if (a && a[0] === '+') {
                config._tzh = -config._tzh;
                config._tzm = -config._tzm;
            }
            break;
        }

        // if the input is null, the date is not valid
        if (input == null) {
            config._isValid = false;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(config) {
        var i, date, input = [];

        if (config._d) {
            return;
        }

        for (i = 0; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[3] += config._tzh || 0;
        input[4] += config._tzm || 0;

        date = new Date(0);

        if (config._useUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }

        config._d = date;
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var tokens = config._f.match(formattingTokens),
            string = config._i,
            i, parsedInput;

        config._a = [];

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            }
            // don't parse if its not a known token
            if (formatTokenFunctions[tokens[i]]) {
                addTimeToArrayFromToken(tokens[i], parsedInput, config);
            }
        }
        // handle am pm
        if (config._isPm && config._a[3] < 12) {
            config._a[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[3] === 12) {
            config._a[3] = 0;
        }
        // return
        dateFromArray(config);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            tempMoment,
            bestMoment,

            scoreToBeat = 99,
            i,
            currentDate,
            currentScore;

        while (config._f.length) {
            tempConfig = extend({}, config);
            tempConfig._f = config._f.pop();
            makeDateFromStringAndFormat(tempConfig);
            tempMoment = new Moment(tempConfig);

            if (tempMoment.isValid()) {
                bestMoment = tempMoment;
                break;
            }

            currentScore = compareArrays(tempConfig._a, tempMoment.toArray());

            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempMoment;
            }
        }

        extend(config, bestMoment);
    }

    // date from iso format
    function makeDateFromString(config) {
        var i,
            string = config._i;
        if (isoRegex.exec(string)) {
            config._f = 'YYYY-MM-DDT';
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (parseTokenTimezone.exec(string)) {
                config._f += " Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._d = new Date(string);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromArray(config);
        } else {
            config._d = input instanceof Date ? new Date(+input) : new Date(input);
        }
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        return Math.ceil(moment(mom).add('d', daysToDayOfWeek).dayOfYear() / 7);
    }


    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null || input === '') {
            return null;
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = extend({}, input);
            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang) {
        return makeMoment({
            _i : input,
            _f : format,
            _l : lang,
            _isUTC : false
        });
    };

    // creating with utc
    moment.utc = function (input, format, lang) {
        return makeMoment({
            _useUTC : true,
            _isUTC : true,
            _l : lang,
            _i : input,
            _f : format
        });
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._data : (isNumber ? {} : input)),
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        }

        ret = new Duration(duration);

        if (isDuration && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var i;

        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(key, values);
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d;
        },

        unix : function () {
            return Math.floor(+this._d / 1000);
        },

        toString : function () {
            return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._d;
        },

        toJSON : function () {
            return moment.utc(this).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            if (this._isValid == null) {
                if (this._a) {
                    this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
                } else {
                    this._isValid = !isNaN(this._d.getTime());
                }
            }
            return !!this._isValid;
        },

        utc : function () {
            this._isUTC = true;
            return this;
        },

        local : function () {
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = this._isUTC ? moment(input).utc() : moment(input).local(),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            if (units) {
                // standardize on singular form
                units = units.replace(/s$/, '');
            }

            if (units === 'year' || units === 'month') {
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                output += ((this - moment(this).startOf('month')) - (that - moment(that).startOf('month'))) / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that) - zoneDiff;
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    units === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().startOf('day'), 'days', true),
                format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < moment([this.year()]).zone() ||
                this.zone() < moment([this.year(), 5]).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return input == null ? day :
                this.add({ d : input - day });
        },

        startOf: function (units) {
            units = units.replace(/s$/, '');
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.day(0);
            }

            return this;
        },

        endOf: function (units) {
            return this.startOf(units).add(units.replace(/s?$/, 's'), 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) === +moment(input).startOf(units);
        },

        zone : function () {
            return this._isUTC ? 0 : this._d.getTimezoneOffset();
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + 's'] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;

    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              this._months * 2592e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });


    /************************************
        Exposing Moment
    ************************************/


    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['moment'] = moment;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
}).call(this);

function PKTToast()
{

}
PKTToast.prototype = {

	show : function(message)
	{
		var self = this;
		if (!this.obj)
		{
			this.obj = $('<div class="pkt_toast_wrapper"><div class="pkt_toast"></div></div>');
			$(document.body).append(this.obj);
		}
		this.obj.show();
		this.toastdetail = this.obj.find('.pkt_toast');
		this.toastdetail.text(message).addClass('pkt_toast_active');
		setTimeout(function() { self.hide(); },400);
	},

	hide: function()
	{
		var self = this;
		if (this.obj)
		{
			this.toastdetail.removeClass('pkt_toast_active');

			this.toastdetail.on('webkitTransitionEnd transitionEnd',function(e)
			{
				if (e.originalEvent.propertyName == 'visibility')
				{
					self.toastdetail.off('webkitTransitionEnd transitionEnd');
					self.obj.hide();
				}
			});
		}
	}
}

var sharedToast = new PKTToast();
//fgnass.github.com/spin.js#v1.3.1

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      // sheet.insertRule(
      //   '@' + pre + 'keyframes ' + name + '{' +
      //   '0%{opacity:' + z + '}' +
      //   start + '%{opacity:' + alpha + '}' +
      //   (start+0.01) + '%{opacity:1}' +
      //   (start+trail) % 100 + '%{opacity:' + alpha + '}' +
      //   '100%{opacity:' + z + '}' +
      //   '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    if (prop == 'animation' && s['-webkit-animation'] !== undefined)
      return '-webkit-animation';


    if(s[prop] !== undefined) return prop
    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto',         // center horizontally
    position: 'relative'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    if (typeof this == 'undefined') return new Spinner(o)
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width
        , ep // element position
        , tp // target position

      if (target) {
        target.insertBefore(el, target.firstChild||null)
        tp = pos(target)
        ep = pos(el)
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid)  + 'px'
        })
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

// Global Variables
PKTBaseURL = "https://getpocket.com/v3";
PKTConsumerKey = "12856-e7368e4763299b3fdcc5e8c5";
DEBUG = false;
CACHE_ITEMS = true;
MAX_ITEMS_TO_CACHE = 1000;

// Logging object
// The logging object allows to define different log levels
var Log = Class.extend({
	init: function(logLevel) {
		this.logLevel = (typeof logLevel !== 'undefined') ? logLevel-1 : 4;
		this.logMethods = ['error', 'warn', 'info', 'debug', 'log'],
		this.createLogMethods();
	},

	setLogLevel: function(level) {
		this.logLevel = level;
		this.createLogMethods();
	},

	createLogMethods: function() {
		var self = this;
		var con = window.console;

		// Create actual logging methods from console.log
		$.each(this.logMethods, function(idx, logMethod) {
			(function(method, idx) {
				self[method] = function(message) {
					// Only execute log methods that are higher than the log level
					if (self.logLevel >= idx && con && con[method]) {
						con[method].apply(con, arguments);
					}
				};
			}(logMethod, idx));
		});
	}
});

logger = DEBUG ? new Log(5) : new Log(1);


// User object
var User = Class.extend({
    init: function(callback) {
        // Get all settings for the user and cache it locally on startup
        // so we have faster access
        var self = this;

        this.userSettingsKeys = [	'username', 'accessToken', 'firstName', 'lastName',
									'emailAddress', 'avatarURL', 'hasSetAvatar', 'guid', 'uid'];
        var numberOfUserSettings = this.userSettingsKeys.length;
        var processedUserSettings = 0;

        this.userSettingsKeys.forEach(function(setting) {
            getSetting(setting, function(fetchedData) {
                self[setting] = fetchedData[setting];
                processedUserSettings += 1;
                if (processedUserSettings === numberOfUserSettings) {
                    // We are done initializing
                    callback();
                }
            });
        });
    },

    setUsername: function(username) {
        this.username = username;
        setSetting("username", username);
    },

    setAccessToken: function(accessToken) {
        this.accessToken = accessToken;
        setSetting("accessToken", accessToken);
    },

    setFirstName: function(firstName) {
        this.firstName = firstName;
        setSetting("firstName", firstName);
    },

    setLastName: function(lastName) {
        this.lastName = lastName;
        setSetting("lastName", lastName);
    },

    setEmailAddress: function(emailAddress) {
        this.emailAddress = emailAddress;
        setSetting("emailAddress", emailAddress);
    },

    setAvatarURL: function(avatarURL) {
		this.avatarURL = avatarURL;
		setSetting("avatarURL", avatarURL);
    },

	setHasSetAvatar: function(hSetAvatar) {
		this.hasSetAvatar = hSetAvatar;
		setSetting("hasSetAvatar", hSetAvatar);
	},

	setGUI: function(guid) {
		this.guid = guid;
		setSetting("guid", guid);
	},

	setUID: function(uid) {
		this.uid = uid;
		setSetting("uid", uid);
	},

    isLoggedIn: function() {
        return ((typeof this.username !== "undefined") && (typeof this.accessToken !== "undefined"));
    },

    logout: function() {
        this.userSettingsKeys.forEach(function(setting) {
            removeSetting(setting);
        });
        this.username = undefined;
        this.accessToken = undefined;
    }
});


var Prefs = Class.extend({
	init : function()
	{
		this.prefix = 'wa_';
	},

	get : function(key)
	{
		return this.readCookie(this.prefix+key);
	},

	set : function(key, value)
	{
		this.createCookie(this.prefix+key, value);
	},

	createCookie : function(name,value,days)
	{
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},

	readCookie : function(name)
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},

	eraseCookie : function(name)
	{
		createCookie(name,"",-1);
	}
});
var prefs = new Prefs();

var currentDropSelector = false;
function dsi(value, label)
{
	return {value:value, label:label};
}
var DropSelector = Class.extend(
{
	init : function(o)
	{
		// class setup
		this.lis = {};

		// local
		var self = this;

		// options
		this.callback = o.callback;
		this.selectCallback = o.selectCallback;
		this.hideUntilSet = o.hideUntilSet;
		this.showClass = o.showClass;
		this.noValChange = o.noValChange;
		o.nodeName = o.nodeName ? o.nodeName : 'div';

		if (o.useSelectOnIE && isInternetExplorer())
		{
			this.ie9Mode = true;
			var selector = $(
			"<span class='select ie9'>" +
//			'<div class="cell edge toolbarButton" style="border: 0px;"><span class="section edge"><span class="img"></span></span></div>' +
			"<span class='selectLabel'>Newest</span>" +
			"<select style='border: 0px; filter: alpha(opacity=0); width: 140px; height: 26px; position: relative; left: 0px; top: -26px;'>" +
			"</select>" +
			"</span>");

			var selectControl = selector.find("select");
			for(var i in o.list)
			{
				var opt = $('<option value="'+o.list[i].value+'">'+o.list[i].label+'</option>');
				this.lis[o.list[i].value] = opt.get(0);
				selectControl.append(opt);
			}

			selector.bind("change", function(ev, shouldFire){
				var val = $(this).find("select").val();
				var valLabel = $(this).find("option[value=" + val + "]").text();
				selector.find(".selectLabel").text(valLabel);
				self.value = val;
				self.label = valLabel;

				if(shouldFire !== false)
					self.callback(self);
			});

			this.selector = selector;
			this.selector.addClass('dropSelector');
			this.displayer = o.displayer ? o.displayer : this.selector;
			this.displayer.append(this.selector);

			selector.trigger("change", [false]);
		}

		else if (o.object)
		{
			this.object = o.object;
			this.object.addClass('dropSelector');
			this.displayer = o.displayer ? o.displayer : this.object;
		}

		else
		{
			// create object
			this.object = $('<'+o.nodeName+' id="'+(o.id?o.id:'')+'" class="dropSelector'+(o["class"]?' '+o["class"]:'')+'"></'+o.nodeName+'>');
			this.displayer = $('<a></a>');
			this.object.append(this.displayer);
		}

		// add items
		this.anchor = o.anchor ? o.anchor : this.object;

		if(!(o.useSelectOnIE && isInternetExplorer())){

		var li;
		var popover = $('<div class="popover-new">');
		var ul = $('<ul>');
		for(var i in o.list)
		{
			li = $('<li class="'+o.list[i].value+'" val="'+o.list[i].value+'"><a href="#">'+o.list[i].label+'</a></li>');
			this.lis[o.list[i].value] = li.get(0);
			ul.append(li);
		}
		ul.children('li').click( function(e){e.stopPropagation();return self.select(this);} );
		this.ul = ul;
		this.popover = popover;
		popover.append('<div class="arrow">',ul);
		this.anchor.append(popover);
		if (o.alignment) {
			this.alignment = o.alignment;
			popover.addClass('popover-new-' + o.alignment);
		}

		// last li
		li.addClass('last');
		li.hover(function(){self.object.addClass('lastHovered')},function(){self.object.removeClass('lastHovered')});

		this.object.click( function(){ self.toggle(); } );

		if (this.hideUntilSet)
			this.object.hide();
		else
			this.set(o.list[0].value, true);

		}

		// insert
		if (o.append)
			o.append.append(this.object);

		else if (o.insertBefore)
			this.object.insertBefore(o.insertBefore);
	},

	select : function(li, noCallback)
	{
		this.object.show();

		if (!this.selectCallback || this.selectCallback(this, li))
		{

			if (!this.noValChange || $.inArray($(li).attr('val'),this.noValChange) == -1)
			{
				logger.log('oh yes, got to no label change');
				if (this.selected) {
					this.selected.removeClass('selected');
				}

				this.selected = $(li);
				this.selected.addClass('selected');
				this.value = this.selected.attr('val');
				this.label = this.selected.children('a').text();

				this.object.toggleClass('lastSelected', this.selected.hasClass('last'));


				this.displayer.html('<span>'+this.label+'</span>');
				this.displayer[0].className = this.value;

				if (this.label == 'Home')
					this.label = 'Queue';

				if (!noCallback)
					this.callback(this);
			}
			else
			{
				logger.log('oh no, got to no label change');
			}
		}

		this.close();

		return false;
	},

	set : function(key, noCallback)
	{
		if(this.ie9Mode){
			this.selector.find("select").attr("value", key);
			this.selector.trigger("change");
		}else{
			this.select(this.lis[key], noCallback);
		}
	},

	toggle : function()
	{
		if (this.popover.hasClass('active'))
			this.close();
		else
			this.show();
	},

	show : function()
	{
		var self = this;
		// calculate proper absolute position for popover
		if (this.alignment) {
			if (this.alignment == 'bottom')
				this.popover.css({'top':this.displayer.height() + parseInt(this.displayer.css('marginBottom')) + Math.abs(parseInt(this.popover.find('.arrow').css('top'))) - 5 + 'px','left':(Math.floor(this.popover.outerWidth()/2) - Math.floor(this.displayer.outerWidth()/2)) * -1 + 'px'});
			if (this.alignment == 'bottomright')
				this.popover.css({'top':this.displayer.height() + parseInt(this.displayer.css('marginBottom')) + Math.abs(parseInt(this.popover.find('.arrow').css('top'))) - 5 + 'px','left':Math.abs(parseInt(this.popover.find('.arrow').css('left'))) * -1 + 'px'});
			if (this.alignment == 'bottomleft')
				this.popover.css({'top':this.displayer.height() + parseInt(this.displayer.css('marginBottom')) + Math.abs(parseInt(this.popover.find('.arrow').css('top'))) - 5 + 'px','left':(this.popover.outerWidth() - Math.abs(parseInt(this.popover.find('.arrow').css('marginLeft'))*2)) * -1 + 'px'});
		}

		if (currentDropSelector)
		{
			if (currentDropSelector == this)
				return;
			else
				currentDropSelector.close();
		}

		this.popover.addClass('popover-active');

		if (this.showClass)
			this.object.addClass(this.showClass);

		if (!document.getElementById('clickguard'))
			$('body').prepend('<div id="clickguard" class="clickguard"></div>');
		$('#clickguard').show();

		setTimeout(function()
		{
			$(document).bind('click', currentDropSelector.close);
		}, 10);

		currentDropSelector = this;
	},

	close : function()
	{
		if(!currentDropSelector)
			return;

		currentDropSelector.popover.removeClass('popover-active');

		if (currentDropSelector.showClass)
			currentDropSelector.object.removeClass(currentDropSelector.showClass);

		$('#clickguard').hide();

		$(document).unbind('click', currentDropSelector.close);

		currentDropSelector = false;
	}
});


var Toolbar = Class.extend(
{
	init : function(o)
	{
		// object
		this.items = [];

		// local
		var self = this;

		// options


		// create toolbar
		this.object = $('<div id="'+(o.id?o.id:'')+'" class="toolbar'+(o["class"]?' '+o["class"]:'')+'"></div>');
		this.inner = $('<div class="row"></div>');
		this.object.append(this.inner);

		// add items
		var item, itemInfo;
		for(var i=0; i<o.items.length; i++)
		{
			// create item
			itemInfo = o.items[i];

			if (itemInfo.type == 'custom')
				item = itemInfo.item;

			else if (itemInfo.type == 'spacer')
				item = new Spacer(itemInfo);

			else if (itemInfo.type == 'element')
				item = new ToolbarItem(itemInfo);

			else if (itemInfo.type == 'button')
				item = new ToolbarButton(itemInfo);

			// add it to row
			item.object.addClass('item');
			this.inner.append(item.object);

			// save it
			this.items.push(item)
		}

		// insert
		if (o.append)
			o.append.append(this.object);

		// insert
		else if (o.insertBefore)
			this.object.insertBefore(o.insertBefore);

	}
});

var toolbarButtons = {};

var ToolbarItem = Class.extend(
{
	init : function(o)
	{
		if (o.object)
			this.object = o.object;

		if (o.label)
			this.setLabel(o.label);
	},

	setLabel : function(label)
	{
		if (!this.label)
		{
			// add relative wrapper
			var wrapper = $('<div style="position:relative"></div>');
			wrapper.append(this.object.children());
			this.object.append(wrapper);

			// create label
			this.label = $('<span class="label"></span>');
			wrapper.append(this.label);
		}
		this.label.text(label);
	}

});

var ToolbarButton = ToolbarItem.extend(
{
	init : function(o)
	{
		var self = this;
		this.callback = o.callback;
		this.object = $('<div id="'+(o.id?o.id:'')+'" class="buttonItem '+(o["class"]?' '+o["class"]:'')+'"><a '+(o.title?'title="'+o.title+'"':'')+' class="button">'+o.text+'</a></div>');
		this.object.find('.button').click(function(){self.clicked();});

		this._super(o);
	},
	clicked : function()
	{
		if (this.callback)
			this.callback();
	}
});

var ToolbarEdgeButton = ToolbarItem.extend(
{
	init : function(o)
	{
		//local
		var self = this;

		//options
		this.callback = o.callback;

		if (o.id)
			toolbarButtons[o.id] = self;

		this.object = $('<a id="'+(o.id?o.id:'')+'" '+(o.title?'title="'+o.title+'"':'')+' class="toolbarButton edge '+(o["class"]?' '+o["class"]:'')+'"></a>');
		var wrapper = $('<div class="cell"></div>');
		var edge = $('<span class="section edge"><span class="img"></span></span>');
		var inner = $('<span class="section inner"></span');

		if (o.left)
		{
			wrapper.append(edge);
			wrapper.append(inner);
			this.object.addClass('left');
		}
		else
		{
			wrapper.append(inner);
			wrapper.append(edge);
		}

		this.object.append(wrapper);
		this.inner = inner;

		if (o.img)
			this.inner.append('<img src="/a/i/'+o.img+'" align="middle" />');

		if (o.text)
			this.inner.append( o.text );

		this.object.click(function(){self.clicked();});

		this._super(o);
	},

	clicked : function()
	{
		if (this.callback)
			this.callback(this);
	}

});

var Toggle = ToolbarEdgeButton.extend(
{
	init : function(o)
	{
		this._super(o);

		this.on = o.on;

		if (this.on)
			this.object.addClass('on');

	},

	clicked : function()
	{
		this.set( !this.on );
	},

	set : function(on, noCallback)
	{
		this.on = on;

		this.object.toggleClass('on', on);

		if (!noCallback && this.callback)
			this.callback(this);
	}
}
);

var ToolbarSegmentControl = ToolbarItem.extend(
{
	init : function(o)
	{
		this.value = -1;

		//local
		var self = this;

		//options
		this.callback = o.callback;

		// width is 45 * n - 2px for borders we trim off sides
		this.object = $('<div id="'+(o.id?o.id:'')+'" class="toolbarButton segmentControl'+(o["class"]?' '+o["class"]:'')+'" style="width:'+(o.items.length*45-2)+'px"></div>');

		var segment, t;
		this.segments = {};
		this.keys = [];
		for(var i=0; i<o.items.length; i++)
		{
			// create segment
			segment = $('<a '+(o.items[i].title?'title="'+o.items[i].title+'"':'')+' class="section segment '+o.items[i]["class"]+'" i="'+i+'"><span class="inner"></span></a>');
			segment.click(function(){self.set($(this).attr('i'));});

			this.object.append(segment);
			this.segments[i] = segment;

			if (o.items[i]["class"])
				this.keys[i] = o.items[i]["class"];
		}

		if (o.label)
			this.setLabel(o.label);
	},

	set : function(i, skipCallback)
	{
		i = i*1; //cast to int

		if (this.selected)
			this.selected.removeClass('on');

		if (this.value != i && i >= 0)
		{
			this.selected = this.segments[i];
			this.selected.addClass('on');
			this.value = i;
		}
		else
			this.value = -1;

		if (this.callback && !skipCallback)
			this.callback(this);
	},

	key : function()
	{
		if (this.value == -1)
			return;

		return this.keys.length ? this.keys[this.value] : this.value;
	}

});

var Spacer = Class.extend(
{
	init : function(o)
	{
		if (!o) o = {};

		this.object = $('<div  class="spacer'+(o["class"]?' '+o["class"]:'')+'" '+(o.width?' style="width:'+o.width+'px"':'')+'>&nbsp;</div>');
	},

	setWidth : function(w)
	{
		if (w)
			this.object.css('width', w+'px');
		else
			this.object.css('width', 'auto');
	}
});

/* --- */

var openPopover;
var PopOver = Class.extend(
{
	init : function( id, guts, container, o)
	{
		this.container = container ? container : $('#container');

		this.object = $('<div id="'+id+'" class="popover-new">');
		this.sizeObject = this.object;
		this.container.append(this.object);
		this.arrow = $('<div class="arrow">');
		this.object.append(this.arrow,guts);

		if (!o)
			o = {};

		if (o.positions)
			this.positions = o.positions;
		else
			this.positions = ['bottom','bottomright','bottomleft','topleft','topright'];

		this.onHide = o.onHide;
		this.onShow = o.onShow;

		this.hideOnClickInPopover = typeof o.hideOnClickInPopover === 'undefined' ? true : o.hideOnClickInPopover;

		this.disableHideOnScroll = o.disableHideOnScroll || false;
		this.onlyCentered = o.onlyCentered || false;
		this.fixedPosition = o.fixedPosition || false;

		this.scrollingIntoView = false;
		this.xOffset = o.xOffset ? o.xOffset : 0;
		if (o.smallArrow)
		{
			this.smallArrow = o.smallArrow;
		}
		if (o.noClickDismiss)
		{
			this.noClickDismiss = o.noClickDismiss;
		}
		if (o.confirmCallback)
		{
			this.confirmCallback = o.confirmCallback;
		}
		if (o.confirmButton)
		{
			this.confirmButton = o.confirmButton;
			this.object.append('<div class="button_container"><a class="button button-secondary button-small" href="#">Ok</a></div>');
			var self = this;
			this.object.find('.button').click(function(e)
			{
				e.preventDefault();
				if (typeof openPopover == 'object')
				{
					openPopover.hideOpenPopover();
				}
				if (self.confirmCallback)
				{
					self.confirmCallback();
				}
			});
		}
	},

	show : function(anchor)
	{
		this.anchor = anchor;

		if (!anchor) {
			this.hideAll();
		}
		else
		{
			this.object.removeClass('popover-new-topleft popover-new-topright popover-new-bottomleft popover-new-bottomright popover-new-bottom popover-new-left popover-new-top popover-new-right');
			// get environment variables
			var oldCSSDisplay = this.object.css("display");
			this.object.css("display", "block");
			this.popupSize = getSize(this.sizeObject);
			this.object.css("display", oldCSSDisplay);

			this.viewPort = getSize($(window));
			this.viewPort.headersHeight = $('header').height();
			this.viewPort.footersHeight = $('footer').height();
			this.viewPort.height = this.viewPort.height - this.viewPort.headersHeight - this.viewPort.footersHeight;
			this.viewPort.top = $(window).scrollTop() + this.viewPort.headersHeight;
			this.viewPort.bottom = this.viewPort.top + this.viewPort.height;
			this.viewPort.left = 0;
			this.viewPort.right = this.viewPort.width;
			this.documentSize = getSize($(document));

			// get position of anchor
			this.anchorPosition = anchor.offset();
			this.anchorSize = {width:anchor.width(), height:anchor.height()};

			// get size of arrow
			// TODO: shouldn't hard code, but for now it's simpler than full calcs each time
			this.arrowSize = {width: 40, height: 20};
			if (this.smallArrow)
			{
				this.arrowSize = {width: 26, height: 12};
			}

			if (this.fixedPosition)
			{
				this.object.addClass('popover-new-fixed');
			}
			else
			{
				this.object.removeClass('popover-new-fixed');
			}

			// try positions
			this.position = false;
			this.offset = false;
			this.fallbackScrollInto = false;

			if(!this.onlyCentered){
				for(var i in this.positions)
					if (this.tryPosition(this.positions[i]))
						break;
			}

			if (!this.onlyCentered && (this.position || this.fallbackScrollInto))
			{
				if (this.fixedPosition)
				{
					this.offset.top -= $(window).scrollTop();
				}
				this.object.css('left', this.offset.left+'px').css('top', this.offset.top+1+'px');
				this.object.addClass(this.position ? this.position : this.fallbackScrollInto);
				this.object.removeClass('centered');

				if(!this.position && this.fallbackScrollInto)
					this.scrollToPopup();

			}
			else
			{
				// Center on screen for now.
				this.object.addClass('centered');
				var centeredLeft = Math.round( (this.viewPort.width/2) - (this.popupSize.width/2) );
				var centeredTop = this.viewPort.headersHeight + this.viewPort.top + Math.round( (this.viewPort.height/2) - (this.popupSize.height/2) );
				this.object.css('left', centeredLeft + 'px');
				this.object.css('top', centeredTop + 'px');
			}

			this.showAll();
		}
	},

	scrollToPopup : function()
	{
		var scrollOffset = 0;

		var bottomsDistance = this.offset.bottom - this.viewPort.bottom;
		var topsDistance = this.offset.top - this.viewPort.top;
		if(this.offset.top > this.viewPort.top && this.offset.top < this.viewPort.bottom)
		{
			// Top is on screen, Scroll down to show bottom
			scrollOffset = bottomsDistance;
		}
		else if(this.offset.bottom > this.viewPort.top && this.offset.bottom < this.viewPort.bottom)
		{
			// Bottom is on screen, Scroll up to show top
			scrollOffset = topsDistance;
		}
		else
		{
			// None of it is on screen, scroll the shortest distance
			scrollOffset = Math.abs(bottomsDistance) < Math.abs(topsDistance) ? bottomsDistance : topsDistance;
		}

		var self = this;
		this.scrollingIntoView = true;
		$('html, body').animate({
				scrollTop : this.viewPort.top - this.viewPort.headersHeight + scrollOffset
			}, 500, function() {
				setTimeout(function(){
					self.scrollingIntoView = false;
				}, 50);
			}
		);
	},

	// -- //

	showAll : function()
	{
		if (openPopover && this !== openPopover)
			openPopover.hideAll();

		openPopover = this;

		// create click guard
		if (!this.clickGuard)
		{
			this.clickGuard = $('<div class="clickguard"></div>');
			this.container.append(this.clickGuard);
			if (!openPopover.noClickDismiss)
			{
				this.clickGuard.click( openPopover.hideOpenPopover );
			}
		}

		setTimeout(function()
		{
			if (!openPopover.noClickDismiss)
			{
				$(document).bind('click', openPopover.hideOpenPopover);
			}

		}, 10);


		// detect scroll and close if scrolled
		$(window).bind('scroll', openPopover.onScroll);

		// show everything
		this.object.addClass('popover-active');
		this.clickGuard.show();

		this.object.addClass('shown'); // TODO : hack for ticket #260

		if (this.onShow)
			this.onShow();
	},

	hideAll : function()
	{
		this.object.removeClass('popover-active');
		if (this.clickGuard)
		{
			this.clickGuard.hide();
		}
		$(document).unbind('click', openPopover.hideOpenPopover);
		$(window).unbind('scroll', openPopover.onScroll);
		openPopover = false;
		if (this.onHide)
			this.onHide();
	},

	hideOpenPopover : function(e)
	{
		if (openPopover) {
			if (!openPopover.hideOnClickInPopover && typeof e !== "undefined" && $(openPopover.object).find(e.target).length !== 0) {
				return;
			}

			openPopover.hideAll();
		}
	},

	onScroll : function()
	{
		if(!openPopover.scrollingIntoView && !openPopover.disableHideOnScroll)
			openPopover.hideOpenPopover();
	},

	// -- //

	tryPosition : function(position)
	{
		return this['try_'+position]();
	},

	//

	fits : function(pos) // TODO does horizontal scroll position matter?
	{
		return (
			pos.top > this.viewPort.top &&
			pos.bottom < this.viewPort.bottom &&
			pos.left + this.xOffset > 0 &&
			pos.right + this.xOffset < this.viewPort.right
		);
	},

	canScrollIntoView : function(pos)
	{
		if(this.fallbackScrollInto)
			return; // Already found one.

		return (
			pos.top > this.viewPort.headersHeight &&
			pos.bottom < this.documentSize.height - this.viewPort.footersHeight &&
			pos.left + this.xOffset > 0 &&
			pos.right + this.xOffset < this.documentSize.width
		);
	},

	try_bottom : function()
	{
		var targetX, targetY;
		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width/2);
		targetY = Math.round(this.anchorPosition.top + this.arrowSize.height + this.anchorSize.height);
		var pos = {
			left : targetX - Math.floor(this.popupSize.width/2),
			right : targetX + Math.ceil(this.popupSize.width/2),
			top : targetY,
			bottom : targetY + this.popupSize.height + this.arrowSize.height
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-bottom';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-bottom';
			this.offset = pos;
		}
	},

	try_bottomright : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left - this.arrowSize.width/3);
		targetY = Math.round(this.anchorPosition.top + this.arrowSize.height + this.anchorSize.height);
		var pos = {
			left : targetX,
			right : targetX + this.popupSize.width,
			top : targetY,
			bottom : targetY + this.popupSize.height + this.arrowSize.height
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-bottomright';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-bottomright';
			this.offset = pos;
		}
	},

	try_bottomleft : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width);
		targetY = Math.round(this.anchorPosition.top + this.arrowSize.height + this.anchorSize.height);
		var pos = {
			left : targetX - this.popupSize.width,
			right : targetX,
			top : targetY,
			bottom : targetY + this.popupSize.height + this.arrowSize.height
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-bottomleft';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-bottomleft';
			this.offset = pos;
		}
	},

	try_top : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width/2);
		targetY = Math.round(this.anchorPosition.top);
		var pos = {
			left : targetX - Math.floor(this.popupSize.width/2),
			right : targetX + Math.ceil(this.popupSize.width/2),
			top : targetY - this.popupSize.height - this.arrowSize.height,
			bottom : targetY
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-top';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-top';
			this.offset = pos;
		}
	},

	try_topleft : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width);
		targetY = Math.round(this.anchorPosition.top - this.arrowSize.height);
		var pos = {
			left : targetX - this.popupSize.width,
			right : targetX,
			top : targetY - this.popupSize.height - this.arrowSize.height,
			bottom : targetY
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-topleft';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-topleft';
			this.offset = pos;
		}
	},

	try_topright : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left - this.arrowSize.width/3);
		targetY = Math.round(this.anchorPosition.top - this.anchorSize.height - this.arrowSize.height);
		var pos = {
			left : targetX,
			right : targetX + this.popupSize.width,
			top : targetY - this.popupSize.height,
			bottom : targetY
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-topright';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-topright';
			this.offset = pos;
		}
	},

	try_below : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width/2);
		targetY = Math.round(this.anchorPosition.top + this.anchorSize.height);
		var pos = {
			left : targetX - Math.round(this.popupSize.width/2),
			right : targetX + Math.round(this.popupSize.width/2),
			top : targetY,
			bottom : targetY + this.popupSize.height
		};

		if(this.fits(pos))
		{
			this.position = 'below';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'below';
			this.offset = pos;
		}
	},

	try_above : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width/2);
		targetY = Math.round(this.anchorPosition.top);
		var pos = {
			left : targetX - Math.round(this.popupSize.width/2),
			right : targetX + Math.round(this.popupSize.width/2),
			top : targetY - this.popupSize.height,
			bottom : targetY,
		};

		if(this.fits(pos))
		{
			this.position = 'above';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'above';
			this.offset = pos;
		}
	},

	try_left : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left - this.arrowSize.width/4);
		targetY = Math.round(this.anchorPosition.top + this.anchorSize.height/2);
		var pos = {
			left : targetX - this.popupSize.width,
			right : targetX,
			top :  targetY - Math.round(this.popupSize.height/2),
			bottom : targetY + Math.round(this.popupSize.height/2),
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-left';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-left';
			this.offset = pos;
		}
	},

	try_right : function()
	{
		var targetX, targetY;

		targetX = Math.round(this.anchorPosition.left + this.anchorSize.width + this.arrowSize.width/4);
		targetY = Math.round(this.anchorPosition.top + this.anchorSize.height/2);
		var pos = {
			left : targetX,
			right : targetX + this.popupSize.width,
			top :  targetY - Math.round(this.popupSize.height/2),
			bottom : targetY + Math.round(this.popupSize.height/2),
		};

		if(this.fits(pos))
		{
			this.position = 'popover-new-right';
			this.offset = pos;
			return true;
		}
		else if(this.canScrollIntoView(pos))
		{
			this.fallbackScrollInto = 'popover-new-right';
			this.offset = pos;
		}
	}
});

function createTooltip(anchor,headline,body,position,confirm,confirmcallback)
{
	if (typeof anchor == 'undefined') 
	{
		return;
	}
	if (typeof position == 'undefined')
	{
		position = ['bottom'];
	}
	if (typeof position == 'object' && position.length && position[0] == 'centered')
	{
		position = [];
	}
	var popovercontent = '<div class="detail">';
	if (typeof headline == 'string')
	{
		popovercontent += '<h5>' + headline + '</h5>';
	}
	if (typeof body == 'string')
	{
		var paragraphs = body.split('|');
		for (var i = 0; i < paragraphs.length; i++)
		{
			popovercontent += '<p>' + paragraphs[i] + '</p>';
		}
	}
	popovercontent += '</div>';
	var altTooltip = new PopOver(
		'alt-tooltip',
		popovercontent,
		$("#container"),
		{
			positions: position,
			onlyCentered: position == [] ? true : false,
			disableHideOnScroll: true,
			smallArrow: true,
			xOffset: 0,
			noClickDismiss: true,
			confirmButton: confirm ? true : false,
			confirmCallback: confirmcallback ? confirmcallback : null
		}
	);
	altTooltip.object.addClass('alt-tooltip');
	altTooltip.show(anchor);
	return altTooltip;
};

function createDialog(params)
{
	/*
		params =
		{
			title :
			message :
			confirm :
			{
				title : on the button
				action : action to perform onClick
			}
			cancel :
			{
				title : on the button
				action : action to perform when dialog is canceled
			}
			anchor : where to place
		}
	*/

	var guts = $('<div class="confirmation_dialog"></div>');

	var dialog = new PopOver(
		'confirmation',
		guts,
		null,
		{onHide:params.cancel?params.cancel.action:params.onHide?params.onHide:null, onShow:params.onShow}
	);

	if(params.title)
	{
		guts.append('<h5>' + params.title + '</h5>');
	}

	if(params.message)
	{
		guts.append('<p>' + params.message + '</p>');
	}

	if(!params.cancel)
		params.cancel = {};

	if(!params.cancel || !params.cancel.title)
		params.cancel.title = "Cancel";

	var cancel = $('<a class="button button-small button-secondary" href="#">' + params.cancel.title + '</a>');
	cancel.click( function(e)
	{
		e.stopPropagation();
		e.preventDefault();

		if(params.cancel.action)
			params.cancel.action();

		dialog.show(false);
	});
	guts.append(cancel);

	var confirm;
	if(params.confirm)
	{
		confirm = $('<a class="button button-small button-important" href="#">' + params.confirm.title + '</a>');
		confirm.click( function(e)
		{
			e.stopPropagation();
			e.preventDefault();

			if(params.confirm.action)
				params.confirm.action();

			dialog.show(false);
		});
		guts.append(confirm);
	}

	guts.append('<div class="clear"></div>');

	dialog.show(params.anchor);
}

var OverlayScreen = {
	overlayDetail:'<p></p>',
	hide: function()
	{
		if (!this.overlayScreen) return;
		var self = this;
		this.overlayScreen.on('webkitTransitionEnd transitionEnd msTransitionEnd oTransitionEnd',function(e)
		{
			if ($(e.target).hasClass('overlay_screen'))
			{
				self.overlayScreen.find('.content_detail_loading').remove();
				self.overlayScreen.off('webkitTransitionEnd transitionEnd msTransitionEnd oTransitionEnd');
				self.overlayScreen.hide();
			}
		});
		this.overlayScreen.removeClass('overlay_screen_active');
	},
	setDetail: function(detail)
	{
		this.overlayDetail = detail;
	},
	show: function(addloading)
	{
		if (!this.overlayScreen)
		{
			this.overlayScreen = $('<div class="overlay_screen"><div class="content_container"><div class="content_detail"></div></div></div>');
			$('body').append(this.overlayScreen);
		}
		else
		{
			this.overlayScreen.show();
		}
		this.overlayScreen.find('.content_container').css('height',Math.floor($(window).height()*(3/4)) + 'px');
		this.overlayScreen.find('.content_detail').html('').append(this.overlayDetail);
		if (addloading)
		{
			var opts = {
			  lines: 13, 
			  length: 11, 
			  width: 6,
			  radius: 17,
			  corners: 1,
			  rotate: 21, 
			  direction: 1,
			  color: '#fff',
			  speed: 1,
			  trail: 60,
			  shadow: false,
			  hwaccel: false,
			  className: 'content_detail_loading',
			  zIndex: 10,
			  top: 'auto',
			  left: 'auto'
			};
			var spinner = new Spinner(opts).spin();
			this.overlayScreen.find('.content_detail').prepend(spinner.el);
		}	
		this.overlayScreen.addClass('overlay_screen_active');
	}
};

// generic alert messaging popover. based on standard popover.
var AlertPopup = {
	show: function(msg)
	{
		// The first time create the send to friend popup
		var self = this;
		if (!this.alertPopup) 
		{
			this.alertPopup = new PopOver(
				'alertPopup',
				'<div class="alert-interior"></div>',
				$('#container'),
				{
					onHide:function(){
						// Reset send to friend popup
						// self.sendToFriendView.destroy();

					},
					disableHideOnScroll: true,
					onlyCentered: true,
					hideOnClickInPopover : false
				}
			);
		}
	}
};


/* --- */

function isChromePackagedApp()
{
	if (chrome.storage) {
		return true;
	}

	return false;
}

function localURLForFilePath(path)
{
	var url = 'url(';
	url += isChromePackagedApp() ? chrome.runtime.getURL('a/' + path) : path;
	url += ')';
	return url;
}

function scrollToTop()
{
	$(window).scrollTop(0);
}

function setSetting(key, value)
{
	if (isChromePackagedApp()) {
		var objectToSet = {};
		objectToSet[key] = value;
		chrome.storage.local.set(objectToSet);
	}
	else {
		localStorage.setItem(key, value);
	}
}

function getSetting(key, callback)
{
	if (isChromePackagedApp()) {
		chrome.storage.local.get(key, callback);
	}
	else {
		var value = localStorage[key];
		var callbackObj = {};
		callbackObj[key] = value;
		callback(callbackObj);
	}
}

function getSettingPromise(key)
{
    var deferred = $.Deferred();
    getSetting(key, function (value) {
        deferred.resolve(value[key]);
    });
    return deferred.promise();
}

function removeSetting(key)
{
	if (isChromePackagedApp()) {
		chrome.storage.local.remove(key);
	}
	else {
		localStorage.removeItem(key);
	}
}

function relativeDateString(date, includeOn){
	if(!date.getTime){
		date = new Date(date);
	}
    var SECOND = 1;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;
//    var MONTH = 30 * DAY;

    var now = new Date();
    var delta = (date.getTime() - now.getTime()) / 1000 * -1;

    var components = {};
    components.day    = Math.floor(delta / DAY);
    components.hour   = Math.floor((delta - (components.day * DAY)) / HOUR);
    components.minute = Math.floor((delta - (components.day * DAY) - (components.hour * HOUR)) / MINUTE);

    var relativeString;

    if (delta < 0) {
        relativeString = "";//"!n the future!";

    } else if (delta < 1 * MINUTE) {
        relativeString = "just now"; //[NSString stringWithFormat:@"%d seconds ago",components.second];
    } else if (delta < 2 * MINUTE) {
        relativeString =  "1 min ago";
    } else if (delta < 45 * MINUTE) {
        relativeString = ("" + components.minute) + " mins ago";
    } else if (delta < 120 * MINUTE) {
        relativeString = "1 hour ago";
    } else if (delta < 24 * HOUR) {
        relativeString = ("" + components.hour) + " hours ago";
    } else if (delta < 48 * HOUR) {
        relativeString = "1 day ago";
    } else if (delta < 7 * DAY) {
        relativeString = ("" + components.day) + " days ago";
	}else{
		relativeString = (includeOn ? "on " : "") + moment(date).format("LL");
	}

    return relativeString;
}

function createCookie(name,value,days)
{
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function tagEntities(str)
{
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function elementInViewport(el)
{
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) && /*or $(window).height() */
		rect.right <= (window.innerWidth || document. documentElement.clientWidth) /*or $(window).width() */
	);
}

// more generous viewport to account for some extra images for lazy loading:
// if *any* part of the box crosses viewport, load.
// even if top of box is 300 pixels from the bottom of screen, also load (to account for immediate scrolling)
function elementCloseInViewport(el)
{
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		(rect.top - 300) <= (window.innerHeight || document. documentElement.clientHeight) && /*or $(window).height() */
		rect.left <= (window.innerWidth || document. documentElement.clientWidth) /*or $(window).width() */
	);
}

// http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx#ParsingUA
function isInternetExplorer()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return (rv > -1);
}

function stripslashes(str) {
    str = str.replace(/\\'/g, '\'');
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\0/g, '\0');
    str = str.replace(/\\\\/g, '\\');
    return str;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeText(s) {
	var sanitizeMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;'
	};
	if (typeof s !== 'string')
	{
		return '';
	}
	else
	{
		return String(s).replace(/[&<>"']/g, function (str) {
      		return sanitizeMap[str];
    	});
	}
}

function isValidURL(url) {
	return (/^https?\:/i).test(url);
}

function isValidEmail(email) {
	return (/^[_a-z0-9-\+]+(\.[_a-z0-9-\+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,6})$/i).test(email)
}

function domainForURL(url){
	var domainMatch = /\/\/([^\/]*)/.exec(url);
	return domainMatch ? domainMatch[1].replace(/^www\./,'') : false;
}

function urlWithPocketRedirect(url) {
	return "http://getpocket.com/redirect?url=" + encodeURIComponent(url);
}

function getImageCacheUrl(url, resize, fallback) {
	if (!url)
		return;

	if (fallback)
		vars = 'f='+fallback;
	else
		vars = '';

	parts = parseUri(url);

	/*
	javascript:alert(getImageCacheUrl('http://ideashower.com/favicon.ico'))

	TODO : move this to server and out of JS

	http://ideashower.com/favicon.ico
	/i/ideashower.com/favicon.ico

	http://ideashower.com/favicon.ico?foo=bar
	/i/ideashower.com/favicon/QS/foo=bar/image.ico

	http://ideashower.com/favicon.ico -w280
	/i/ideashower.com/favicon/RS/w280.ico

	http://ideashower.com/favicon.ico?foo=bar -w280
	/i/ideashower.com/favicon/QS/foo=bar/RS/w280.ico

	--

	http://ideashower.com/favicon
	/i/ideashower.com/favicon.jpg?ne=1

	http://ideashower.com/favicon?foo=bar
	/i/ideashower.com/favicon/QS/foo=bar/image.jpg?ne=1 (ne= no extension)

	*/

	// only allow http
	if (parts['protocol'] != 'http' && parts['protocol'] != 'https')
		return;

	// --

	// get extension
	var extParts = /\.(jpg|gif|jpeg|png|ico)$/i.exec(parts['file']);
	var extension = extParts ? extParts[1] : false;

	if (!extension)
	{
		// force it to be a jpg and flag it with no-extension
		extension = 'jpg';
		vars += '&ne=1';
	}

	// query string
	var qs = '';
	if (parts['query'])
		qs = '/QS/' + encodeURIComponent(encodeURIComponent(parts['query']));

	// resize options
	var rs = '';
	if (resize)
		rs = '/RS/' + resize;

	url =	'http://img.readitlater.com/i/' +
			parts['host'] +
			parts['directory'] +
			parts['file'].replace('.'+extension, '') +
			qs +
			rs +
			(qs && !rs ? '/image' : '') +
			'.' + extension +
			(vars ? '?'+vars : '')
			;

	return url;
}

function md5cycle(x, k) {
var a = x[0], b = x[1], c = x[2], d = x[3];

a = ff(a, b, c, d, k[0], 7, -680876936);
d = ff(d, a, b, c, k[1], 12, -389564586);
c = ff(c, d, a, b, k[2], 17,  606105819);
b = ff(b, c, d, a, k[3], 22, -1044525330);
a = ff(a, b, c, d, k[4], 7, -176418897);
d = ff(d, a, b, c, k[5], 12,  1200080426);
c = ff(c, d, a, b, k[6], 17, -1473231341);
b = ff(b, c, d, a, k[7], 22, -45705983);
a = ff(a, b, c, d, k[8], 7,  1770035416);
d = ff(d, a, b, c, k[9], 12, -1958414417);
c = ff(c, d, a, b, k[10], 17, -42063);
b = ff(b, c, d, a, k[11], 22, -1990404162);
a = ff(a, b, c, d, k[12], 7,  1804603682);
d = ff(d, a, b, c, k[13], 12, -40341101);
c = ff(c, d, a, b, k[14], 17, -1502002290);
b = ff(b, c, d, a, k[15], 22,  1236535329);

a = gg(a, b, c, d, k[1], 5, -165796510);
d = gg(d, a, b, c, k[6], 9, -1069501632);
c = gg(c, d, a, b, k[11], 14,  643717713);
b = gg(b, c, d, a, k[0], 20, -373897302);
a = gg(a, b, c, d, k[5], 5, -701558691);
d = gg(d, a, b, c, k[10], 9,  38016083);
c = gg(c, d, a, b, k[15], 14, -660478335);
b = gg(b, c, d, a, k[4], 20, -405537848);
a = gg(a, b, c, d, k[9], 5,  568446438);
d = gg(d, a, b, c, k[14], 9, -1019803690);
c = gg(c, d, a, b, k[3], 14, -187363961);
b = gg(b, c, d, a, k[8], 20,  1163531501);
a = gg(a, b, c, d, k[13], 5, -1444681467);
d = gg(d, a, b, c, k[2], 9, -51403784);
c = gg(c, d, a, b, k[7], 14,  1735328473);
b = gg(b, c, d, a, k[12], 20, -1926607734);

a = hh(a, b, c, d, k[5], 4, -378558);
d = hh(d, a, b, c, k[8], 11, -2022574463);
c = hh(c, d, a, b, k[11], 16,  1839030562);
b = hh(b, c, d, a, k[14], 23, -35309556);
a = hh(a, b, c, d, k[1], 4, -1530992060);
d = hh(d, a, b, c, k[4], 11,  1272893353);
c = hh(c, d, a, b, k[7], 16, -155497632);
b = hh(b, c, d, a, k[10], 23, -1094730640);
a = hh(a, b, c, d, k[13], 4,  681279174);
d = hh(d, a, b, c, k[0], 11, -358537222);
c = hh(c, d, a, b, k[3], 16, -722521979);
b = hh(b, c, d, a, k[6], 23,  76029189);
a = hh(a, b, c, d, k[9], 4, -640364487);
d = hh(d, a, b, c, k[12], 11, -421815835);
c = hh(c, d, a, b, k[15], 16,  530742520);
b = hh(b, c, d, a, k[2], 23, -995338651);

a = ii(a, b, c, d, k[0], 6, -198630844);
d = ii(d, a, b, c, k[7], 10,  1126891415);
c = ii(c, d, a, b, k[14], 15, -1416354905);
b = ii(b, c, d, a, k[5], 21, -57434055);
a = ii(a, b, c, d, k[12], 6,  1700485571);
d = ii(d, a, b, c, k[3], 10, -1894986606);
c = ii(c, d, a, b, k[10], 15, -1051523);
b = ii(b, c, d, a, k[1], 21, -2054922799);
a = ii(a, b, c, d, k[8], 6,  1873313359);
d = ii(d, a, b, c, k[15], 10, -30611744);
c = ii(c, d, a, b, k[6], 15, -1560198380);
b = ii(b, c, d, a, k[13], 21,  1309151649);
a = ii(a, b, c, d, k[4], 6, -145523070);
d = ii(d, a, b, c, k[11], 10, -1120210379);
c = ii(c, d, a, b, k[2], 15,  718787259);
b = ii(b, c, d, a, k[9], 21, -343485551);

x[0] = add32(a, x[0]);
x[1] = add32(b, x[1]);
x[2] = add32(c, x[2]);
x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
a = add32(add32(a, q), add32(x, t));
return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s) {
txt = '';
var n = s.length,
state = [1732584193, -271733879, -1732584194, 271733878], i;
for (i=64; i<=s.length; i+=64) {
md5cycle(state, md5blk(s.substring(i-64, i)));
}
s = s.substring(i-64);
var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
for (i=0; i<s.length; i++)
tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
tail[i>>2] |= 0x80 << ((i%4) << 3);
if (i > 55) {
md5cycle(state, tail);
for (i=0; i<16; i++) tail[i] = 0;
}
tail[14] = n*8;
md5cycle(state, tail);
return state;
}

/* there needs to be support for Unicode here,
 * unless we pretend that we can redefine the MD-5
 * algorithm for multi-byte characters (perhaps
 * by adding every four 16-bit characters and
 * shortening the sum to 32 bits). Otherwise
 * I suggest performing MD-5 as if every character
 * was two bytes--e.g., 0040 0025 = @%--but then
 * how will an ordinary MD-5 sum be matched?
 * There is no way to standardize text to something
 * like UTF-8 before transformation; speed cost is
 * utterly prohibitive. The JavaScript standard
 * itself needs to look at this: it should start
 * providing access to strings as preformed UTF-8
 * 8-bit unsigned value arrays.
 */
function md5blk(s) { /* I figured global was faster.   */
var md5blks = [], i; /* Andy King said do it this way. */
for (i=0; i<64; i+=4) {
md5blks[i>>2] = s.charCodeAt(i)
+ (s.charCodeAt(i+1) << 8)
+ (s.charCodeAt(i+2) << 16)
+ (s.charCodeAt(i+3) << 24);
}
return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n)
{
var s='', j=0;
for(; j<4; j++)
s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
+ hex_chr[(n >> (j * 8)) & 0x0F];
return s;
}

function hex(x) {
for (var i=0; i<x.length; i++)
x[i] = rhex(x[i]);
return x.join('');
}

function md5(s) {
return hex(md51(s));
}

/* this function is much faster,
so if possible we use it. Some IEs
are the only ones I know of that
need the idiotic second function,
generated by an if clause.  */

function add32(a, b) {
return (a + b) & 0xFFFFFFFF;
}

if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
function add32(x, y) {
var lsw = (x & 0xFFFF) + (y & 0xFFFF),
msw = (x >> 16) + (y >> 16) + (lsw >> 16);
return (msw << 16) | (lsw & 0xFFFF);
}
}

(function () {
	var isNode = typeof module !== 'undefined' && module.exports;
	var setImmediate = setImmediate || function (cb) {
		setTimeout(cb, 0);
	};
	var Worker = isNode ? require(__dirname + '/Worker.js') : self.Worker;

	function extend(from, to) {
		if (!to) to = {};
		for (var i in from) {
			if (to[i] === undefined) to[i] = from[i];
		}
		return to;
	}

	function Operation() {
		this._callbacks = [];
		this._errCallbacks = [];

		this._resolved = 0;
		this._result = null;
	}

	Operation.prototype.resolve = function (err, res) {
		if (!err) {
			this._resolved = 1;
			this._result = res;

			for (var i = 0; i < this._callbacks.length; ++i) {
				this._callbacks[i](res);
			}
		} else {
			this._resolved = 2;
			this._result = err;

			for (var iE = 0; iE < this._errCallbacks.length; ++iE) {
				this._errCallbacks[iE](res);
			}
		}

		this._callbacks = [];
		this._errCallbacks = [];
	};

	Operation.prototype.then = function (cb, errCb) {
		if (this._resolved === 1) { // result
			if (cb) {
				cb(this._result);
			}

			return;
		} else if (this._resolved === 2) { // error
			if (errCb) {
				errCb(this._result);
			}
			return;
		}

		if (cb) {
			this._callbacks[this._callbacks.length] = cb;
		}

		if (errCb) {
			this._errCallbacks[this._errCallbacks.length] = errCb;
		}
		return this;
	};

	var defaults = {
		evalPath: isNode ? __dirname + '/eval.js' : null,
		maxWorkers: isNode ? require('os').cpus().length : 4,
		synchronous: true
	};

	function Parallel(data, options) {
		this.data = data;
		this.options = extend(defaults, options);
		this.operation = new Operation();
		this.operation.resolve(null, this.data);
		this.requiredScripts = [];
		this.requiredFunctions = [];
	}

	Parallel.prototype.getWorkerSource = function (cb) {
		var preStr = '';
		var i = 0;
		if (!isNode && this.requiredScripts.length !== 0) {
			preStr += 'importScripts("' + this.requiredScripts.join('","') + '");\r\n';
		}

		for (i = 0; i < this.requiredFunctions.length; ++i) {
			if (this.requiredFunctions[i].name) {
				preStr += 'var ' + this.requiredFunctions[i].name + ' = ' + this.requiredFunctions[i].fn.toString() + ';';
			} else {
				preStr += this.requiredFunctions[i].fn.toString();
			}
		}

		if (isNode) {
			return preStr + 'process.on("message", function(e) {process.send(JSON.stringify((' + cb.toString() + ')(JSON.parse(e).data)))})';
		} else {
			return preStr + 'self.onmessage = function(e) {self.postMessage((' + cb.toString() + ')(e.data))}';
		}
	};

	Parallel.prototype.require = function () {
		var args = Array.prototype.slice.call(arguments, 0),
			func;

		for (var i = 0; i < args.length; i++) {
			func = args[i];

			if (typeof func === 'string') {
				this.requiredScripts.push(func);
			} else if (typeof func === 'function') {
				this.requiredFunctions.push({ fn: func })
			} else if (typeof func === 'object') {
				this.requiredFunctions.push(func);
			}
		}
	};

	Parallel.prototype._spawnWorker = function (cb) {
		var wrk;
		var src = this.getWorkerSource(cb);
		if (isNode) {
			wrk = new Worker(this.options.evalPath);
			wrk.postMessage(src);
		} else {
			if (Worker === undefined) {
				return undefined;
			}

			try {
				if (this.requiredScripts.length !== 0) {
					if (this.options.evalPath !== null) {
						wrk = new Worker(this.options.evalPath);
						wrk.postMessage(src);
					} else {
						throw new Error('Can\'t use required scripts without eval.js!');
					}
				} else {
					var blob = new Blob([src], { type: 'text/javascript' });
					var url = URL.createObjectURL(blob);

					wrk = new Worker(url);
				}
			} catch (e) {
				if (this.options.evalPath !== null) { // blob/url unsupported, cross-origin error
					wrk = new Worker(this.options.evalPath);
					wrk.postMessage(src);
				} else {
					throw e;
				}
			}
		}

		return wrk;
	};

	Parallel.prototype.spawn = function (cb) {
		var that = this;
		var newOp = new Operation();
		this.operation.then(function () {
			var wrk = that._spawnWorker(cb);
			if (wrk !== undefined) {
				wrk.onmessage = function (msg) {
					wrk.terminate();
					that.data = msg.data;
					newOp.resolve(null, that.data);
				};
				wrk.postMessage(that.data);
			} else if (that.options.synchronous) {
				setImmediate(function () {
					that.data = cb(that.data);
					newOp.resolve(null, that.data);
				});
			} else {
				throw new Error('Workers do not exist and synchronous operation not allowed!');
			}
		});
		this.operation = newOp;
		return this;
	};

	Parallel.prototype._spawnMapWorker = function (i, cb, done) {
		var that = this;
		var wrk = that._spawnWorker(cb);
		if (wrk !== undefined) {
			wrk.onmessage = function (msg) {
				wrk.terminate();
				that.data[i] = msg.data;
				done();
			};
			wrk.postMessage(that.data[i]);
		} else if (that.options.synchronous) {
			setImmediate(function () {
				that.data[i] = cb(that.data[i]);
				done();
			});
		} else {
			throw new Error('Workers do not exist and synchronous operation not allowed!');
		}
	};

	Parallel.prototype.map = function (cb) {
		if (!this.data.length) {
			return this.spawn(cb);
		}

		var that = this;
		var startedOps = 0;
		var doneOps = 0;
		function done() {
			if (++doneOps === that.data.length) {
				newOp.resolve(null, that.data);
			} else if (startedOps < that.data.length) {
				that._spawnMapWorker(startedOps++, cb, done);
			}
		}

		var newOp = new Operation();
		this.operation.then(function () {
			for (; startedOps - doneOps < that.options.maxWorkers && startedOps < that.data.length; ++startedOps) {
				that._spawnMapWorker(startedOps, cb, done);
			}
		});
		this.operation = newOp;
		return this;
	};

	Parallel.prototype._spawnReduceWorker = function (data, cb, done) {
		var that = this;
		var wrk = that._spawnWorker(cb);
		if (wrk !== undefined) {
			wrk.onmessage = function (msg) {
				wrk.terminate();
				that.data[that.data.length] = msg.data;
				done();
			};
			wrk.postMessage(data);
		} else if (that.options.synchronous) {
			setImmediate(function () {
				that.data[that.data.length] = cb(data);
				done();
			});
		} else {
			throw new Error('Workers do not exist and synchronous operation not allowed!');
		}
	};

	Parallel.prototype.reduce = function (cb) {
		if (!this.data.length) {
			throw new Error('Can\'t reduce non-array data');
		}

		var runningWorkers = 0;
		var that = this;
		function done(data) {
			--runningWorkers;
			if (that.data.length === 1 && runningWorkers === 0) {
				that.data = that.data[0];
				newOp.resolve(null, that.data);
			} else if (that.data.length > 1) {
				++runningWorkers;
				that._spawnReduceWorker([that.data[0], that.data[1]], cb, done);
				that.data.splice(0, 2);
			}
		}

		var newOp = new Operation();
		this.operation.then(function () {
			if (that.data.length === 1) {
				newOp.resolve(null, that.data[0]);
			} else {
				for (var i = 0; i < that.options.maxWorkers && i < Math.floor(that.data.length / 2); ++i) {
					++runningWorkers;
					that._spawnReduceWorker([that.data[i * 2], that.data[i * 2 + 1]], cb, done);
				}

				that.data.splice(0, i * 2);
			}
		});
		this.operation = newOp;
		return this;
	};

	Parallel.prototype.then = function (cb, errCb) {
		var that = this;
		var newOp = new Operation();
		this.operation.then(function () {
			var retData = cb(that.data);
			if (retData !== undefined) {
				that.data = retData;
			}
			newOp.resolve(null, that.data);
		}, errCb);
		this.operation = newOp;
		return this;
	};

	if (isNode) {
		module.exports = Parallel;
	} else {
		self.Parallel = Parallel;
	}
})();
/**
 * @namespace
 */
var RAL = {
  debug: (typeof window.DEBUG !== 'undefined' ? window.DEBUG : false)
};

RAL.Util = {

  /**
   * Create a new constructor function, whose prototype is the parent object's prototype.
   * Set the child's prototype to the newly created constructor function.
   **/
  inherits: function(childObj, parentObj) {
    var TmpObj = function () {};
    TmpObj.prototype = parentObj.prototype;
    childObj.prototype = new TmpObj();
    childObj.prototype.constructor = childObj;
  },

  /**
   * Resize image blob data
   * @param  {object} img
   * @param  {number} maxImageWidth
   * @param  {number} maxImageHeight
   * @return {blob}
   */
  resizedImageBlob: function(img, maxImageWidth, maxImageHeight) {
    var ratio = RAL.Util.calculateAspectRatioFit(img.width, img.height, maxImageWidth, maxImageHeight);
    var canvas = document.createElement('canvas');
    canvas.width = ratio.width;
    canvas.height = ratio.height;
    canvas.getContext('2d').drawImage(img, 0, 0, ratio.width, ratio.height);
    var dataUrl = canvas.toDataURL('image/jpeg');
    return this.dataURLToBlob(dataUrl);
  },

  calculateAspectRatioFit: function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];
    ratio = Math.min(ratio[0], ratio[1]);
    return { width:srcWidth * ratio, height:srcHeight * ratio };
  },

  /**
   * Creates and returns a blob from a data URL (either base64 encoded or not).
   *
   * @param {string} dataURL The data URL to convert.
   * @return {Blob} A blob representing the array buffer data.
   */
  dataURLToBlob: function(dataURL) {
    var BASE64_MARKER = ';base64,',
        parts, contentType, raw;
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      parts = dataURL.split(',');
      contentType = parts[0].split(':')[1];
      raw = parts[1];

      return new Blob([raw], {type: contentType});
    }

    parts = dataURL.split(BASE64_MARKER);
    contentType = parts[0].split(':')[1];
    raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
  }
};
/**
 * Simple max-heap for a priority queue.
 */
RAL.Heap = function() {
  this.items = [];
};

RAL.Heap.prototype = {

  /**
   * Gets the next priority value based on the head's priority.
   */
  getNextHighestPriority: function() {
    var priority = 1;
    if(this.items[0]) {
      priority = this.items[0].priority + 1;
    }
    return priority;
  },

  /**
   * Provides the index of the parent.
   *
   * @param {number} index The start position.
   */
  parentIndex: function(index) {
    return Math.floor(index * 0.5);
  },

  /**
   * Provides the index of the left child.
   *
   * @param {number} index The start position.
   */
  leftChildIndex: function(index) {
    return index * 2;
  },

  /**
   * Provides the index of the right child.
   *
   * @param {number} index The start position.
   */
  rightChildIndex: function(index) {
    return (index * 2) + 1;
  },

  /**
   * Gets the value from a specific position
   * in the heap.
   *
   * @param {number} index The position of the element.
   */
  get: function(index) {
    var value = null;
    if(index >= 1 && this.items[index - 1]) {
      value = this.items[index - 1];
    }
    return value;
  },

  /**
   * Sets a value in the heap.
   *
   * @param {number} index The position in the heap.
   * @param {number} value The value to set.
   */
  set: function(index, value) {
    this.items[index - 1] = value;
  },

  /**
   * Swaps two values in the heap.
   *
   * @param {number} indexA Index of the first item to be swapped.
   * @param {number} indexB Index of the second item to be swapped.
   */
  swap: function(indexA, indexB) {
    var temp = this.get(indexA);
    this.set(indexA, this.get(indexB));
    this.set(indexB, temp);
  },

  /**
   * Sends a value up heap. The item is compared
   * to its parent item. If its value is greater
   * then it's swapped and the process is repeated.
   *
   * @param {number} startIndex The start position for the operation.
   */
  upHeap: function(startIndex) {

    var startValue = null,
        parentValue = null,
        parentIndex = null,
        switched = false;

    do {
      switched = false;
      parentIndex = this.parentIndex(startIndex);
      startValue = this.get(startIndex);
      parentValue = this.get(parentIndex);
      switched = parentValue !== null &&
        startValue.priority > parentValue.priority;

      if(switched) {
        this.swap(startIndex, parentIndex);
        startIndex = parentIndex;
      }

    } while(switched);
  },

  /**
   * Sends a value down heap. The item is compared
   * to its two children item. If its value is less
   * then it's swapped with the <em>highest value child</em>
   * and the process is repeated.
   *
   * @param {number} startIndex The start position for the operation.
   */
  downHeap: function(startIndex) {

    var startValue = null,
        leftChildValue = null,
        rightChildValue = null,
        leftChildIndex = null,
        rightChildIndex = null,
        switchValue = null,
        switched = false;

    do {

      switched = false;
      leftChildIndex = this.leftChildIndex(startIndex);
      rightChildIndex = this.rightChildIndex(startIndex);

      startValue = this.get(startIndex) && this.get(startIndex).priority;
      leftChildValue = this.get(leftChildIndex) && this.get(leftChildIndex).priority;
      rightChildValue = this.get(rightChildIndex) && this.get(rightChildIndex).priority;

      if(leftChildValue === null) {
        leftChildValue = Number.NEGATIVE_INFINITY;
      }
      if(rightChildValue === null) {
        rightChildValue = Number.NEGATIVE_INFINITY;
      }

      switchValue = Math.max(leftChildValue, rightChildValue);

      if(startValue < switchValue) {

        if(rightChildValue === switchValue) {
          this.swap(startIndex, rightChildIndex);
          startIndex = rightChildIndex;
        } else {
          this.swap(startIndex, leftChildIndex);
          startIndex = leftChildIndex;
        }

        switched = true;
      }

    } while(switched);

  },

  /**
   * Adds a value to the heap. For now this is just
   * numbers but a comparator function could be used
   * for more complex comparisons.
   *
   * @param {number} value The value to be added to the heap.
   */
  add: function(value) {
    this.items.push(value);
    this.upHeap(this.items.length);
  },

  /**
   * Removes the head of the heap.
   */
  remove: function() {
    var value = null;

    if(this.items.length) {
      // swap with the last child
      // in the heap
      this.swap(1, this.items.length);

      // grab the value and truncate
      // the item array
      value = this.get(this.items.length);
      this.items.length -= 1;

      // push the swapped item
      // down the heap to wherever it needs
      // to sit
      this.downHeap(1);
    }

    return value;
  }
};

/**
 * Loads the remote files
 */
RAL.Loader = (function() {

  var callbacks = {

    /**
     * Callback for loaded files.
     * @param {string} source The remote file's URL.
     * @param {Function} callbackSuccess The callback for successful loading.
     * @param {Function} callbackError The callback for failed loading.
     * @param {ProgressEvent} xhrProgressEvent The XHR progress event.
     */
    onLoad: function(source, callbackSuccess, callbackError, xhrProgressEvent) {

      // we have the file details
      // so now we need to wrap the file up, including
      // the caching information to return back
      var xhr = xhrProgressEvent.target;
      var fileData = xhr.response;

      if (xhr.readyState === 4) {
        // File was successfully loaded remotely or from the filesystem
        if (xhr.status === 200 || xhr.status === 0) {
          if (callbackSuccess) callbackSuccess(fileData);
        } else {
          if (callbackError) callbackError(xhrProgressEvent);
        }
      }
    },

    /**
     * Generic callback for erroring loads. Simply passes the progres event
     * through to the assigned callback.
     * @param {Function} callback The callback for failed loading.
     * @param {ProgressEvent} xhrProgressEvent The XHR progress event.
     */
    onError: function(callback, xhrProgressEvent) {
      if (callback) callback(xhrProgressEvent);
      
    }
  };

  /**
   * Aborts an in-flight XHR and reschedules it.
   * @param {XMLHttpRequest} xhr The XHR to abort.
   * @param {Function} callbackSuccess The callback for successful loading.
   * @param {Function} callbackError The callback for failed loading.
   * @param {ProgressEvent} xhrProgressEvent The XHR progress event.
   */
  function abort(xhr, type, method, source, callbackSuccess, callbackFail) {

    // kill the current request
    xhr.abort();

    // run it again, which will cause us to schedule up
    this.load(source, type, method, callbackSuccess, callbackFail);
  }

  /**
   * Aborts an in-flight XHR and reschedules it.
   * @param {XMLHttpRequest} xhr The XHR to abort.
   * @param {string} type The response type for the XHR, e.g. 'blob'
   * @param {Function} callbackSuccess The callback for successful loading.
   * @param {Function} callbackError The callback for failed loading.
   */
  function load(source, type, method, callbackSuccess, callbackFail) {

    // check we're online, or schedule the load
    if (RAL.NetworkMonitor.isOnline()) {

      // attempt to load the file
      var xhr = new XMLHttpRequest();

      xhr.responseType = type;
      xhr.onerror = callbacks.onError.bind(this, callbackFail);
      xhr.onload = callbacks.onLoad.bind(this, source, callbackSuccess, callbackFail);
      xhr.open(method, source, true);
      xhr.send();

      // register our interest in the connection
      // being cut. If that happens we will reschedule.
      RAL.NetworkMonitor.registerForOffline(
        abort.bind(this,
          xhr,
          type,
          method,
          source,
          callbackSuccess,
          callbackFail));

    } else {

      // We are offline so register our interest in the
      // connection being restored.
      RAL.NetworkMonitor.registerForOnline(
        load.bind(this,
          source,
          type,
          method,
          callbackSuccess,
          callbackFail));

    }
  }

  return {
    load: load
  };

})();

/**
 * Tracks the online / offline nature of the
 * browser so we can abort and reschedule any
 * in-flight requests.
 */
RAL.NetworkMonitor = (function() {

  var onlineListeners = [];
  var offlineListeners = [];

  /* Register for online events */
  window.addEventListener("online", function() {

    // go through each listener, pop it
    // off and call it
    var listenerCount = onlineListeners.length,
        listener = null;
    while(listenerCount--) {
      listener = onlineListeners.pop();
      listener();
    }
  });

  /* Register for offline events */
  window.addEventListener("offline", function() {

    // go through each listener, pop it
    // off and call it
    var listenerCount = offlineListeners.length,
        listener = null;
    while(listenerCount--) {
      listener = offlineListeners.pop();
      listener();
    }
  });

  /**
   * Appends a function for notification
   * when the browser comes back online.
   * @param callback The callback function for online notifications.
   */
  function registerForOnline(callback) {
    onlineListeners.push(callback);
  }

  /**
   * Appends a function for notification
   * when the browser drops offline.
   * @param callback The callback function for offline notifications.
   */
  function registerForOffline(callback) {
    offlineListeners.push(callback);
  }

  /**
   * Simple wrapper for whether the browser
   * is online or offline.
   * @returns {boolean} The online / offline state of the browser.
   */
  function isOnline() {
    return window.navigator.onLine;
  }

  return {
    registerForOnline: registerForOnline,
    registerForOffline: registerForOffline,
    isOnline: isOnline
  };

})();

/**
 * Represents the load queue for assets.
 */
RAL.Queue = (function() {

  var queuePriority = {
    veryLow: -8,
    low: -4,
    normal: 0,
    high: 4,
    veryHigh: 8
  };

  var heap = new RAL.Heap(),
      connections = 0,
      maxConnections = 6,
      callbacks = {

        /**
         * Callback for when a file in the queue has been loaded
         */
        onFileLoaded: function() {
          if (RAL.debug) {
            console.log("[Connections: " + connections + "] - File loaded");
          }
          connections--;
          start();
        }
      };

  /**
   * Gets the queue's next priority value.
   */
  function getNextHighestPriority() {
    return heap.getNextHighestPriority();
  }

  /**
   * Sets the queue's maximum number of concurrent requests.
   * @param {number} newMaxConnections The maximum number of in-flight requests.
   */
  function setMaxConnections(newMaxConnections) {
    maxConnections = newMaxConnections;
  }

  /**
   * Adds a file to the queue.
   * @param {RAL.RemoteFile} remoteFile The file to enqueue.
   * @param {boolean} startGetting Whether or not to try and get immediately.
   */
  function add(remoteFile, startGetting) {

    // ensure we have a priority, and
    // go with a LIFO approach
    // - thx courage@
    if (typeof remoteFile.priority === "undefined") {
      remoteFile.priority = heap.getNextHighestPriority();
    }

    heap.add(remoteFile);

    if (startGetting) {
      start();
    }
  }

  /**
   * Start requesting items from the queue.
   */
  function start() {
    var nextFile;
    while (connections < maxConnections) {
      nextFile = heap.remove();

      if (nextFile !== null) {
        nextFile.addMessageHandler('fileloaded', callbacks.onFileLoaded);
        nextFile.addMessageHandler('errorloading', callbacks.onFileLoaded);
        nextFile.load();
        if (RAL.debug) {
          console.log("[Connections: " + connections + "] - Loading " + nextFile.src);
        }
        connections++;
      }
      else {
        if (RAL.debug) {
          console.log("[Connections: " + connections + "] - No more remote operations queued");
        }
        break;
      }
    }
  }

  /**
   * Cancel all files
   */
  function clear () {
    var nextFile = heap.remove();
    while(nextFile !== null) {
      nextFile.cancelled = true;
      nextFile = heap.remove();
    }
  }

  return {
    getNextHighestPriority: getNextHighestPriority,
    queuePriority: queuePriority,
    setMaxConnections: setMaxConnections,
    add: add,
    clear: clear,
    start: start
  };

})();

/**
 * Sanitises a file path.
 */
RAL.Sanitiser = (function() {

  /**
   * Cleans and removes the protocol from the URL.
   * @param {string} url The URL to clean.
   */
  function cleanURL(url) {
    return url.replace(/.*?:\/\//, '', url);
  }

  return {
    cleanURL: cleanURL
  };

})();

/**
 * FileSystem API wrapper. Makes extensive use of
 * the FileSystem code from Eric Bidelman.
 *
 * @see http://www.html5rocks.com/en/tutorials/file/filesystem/
 */
RAL.FileSystem = (function() {

  var ready = false,
      readyListeners = [],
      root = null,
      callbacks = {

        /**
         * Generic error handler, simply warns the user
         */
        onError: function(e) {
          var msg = '';

          switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
              msg = 'QUOTA_EXCEEDED_ERR';
              break;
            case FileError.NOT_FOUND_ERR:
              msg = 'NOT_FOUND_ERR';
              break;
            case FileError.SECURITY_ERR:
              msg = 'SECURITY_ERR';
              break;
            case FileError.INVALID_MODIFICATION_ERR:
              msg = 'INVALID_MODIFICATION_ERR';
              break;
            case FileError.INVALID_STATE_ERR:
              msg = 'INVALID_STATE_ERR';
              break;
            default:
              msg = 'Unknown Error';
              break;
          }

          console.error('Error: ' + msg, e);
        },

        /**
         * Callback for once the file system has been fired up.
         * Informs any listeners waiting on it.
         */
        onInitialised: function(fs) {
          root = fs.root;
          ready = true;

          if(readyListeners.length) {
            var listener = readyListeners.length;
            while(listener--) {
              readyListeners[listener]();
            }
          }
        }
      };

  /**
   * Determines if the file system is ready for use.
   * @returns {boolean} If the file system is ready.
   */
  function isReady() {
    return ready;
  }

  /**
   * Registers a listener for when the file system is
   * ready for interaction.
   * @param {Function} listener The listener function.
   */
  function registerOnReady(listener) {
    readyListeners.push(listener);
  }

  /**
   * Gets the internal file system URL for a stored file
   * @param {string} filePath The original URL of the asset.
   * @param {Function} callbackSuccess Callback for successful path retrieval.
   * @param {Function} callbackFail Callback for failed path retrieval.
   */
  function getPath(filePath, callbackSuccess, callbackFail) {

    if (ready) {

      filePath = RAL.Sanitiser.cleanURL(filePath);

      root.getFile(filePath, {}, function(fileEntry) {
        callbackSuccess(fileEntry.toURL());
      }, callbackFail);
    }
  }

  /**
   * Gets the file data as text for a stored file
   * @param {string} filePath The original URL of the asset.
   * @param {Function} callbackSuccess Callback for successful path retrieval.
   * @param {Function} callbackFail Callback for failed path retrieval.
   */
  function getDataAsText(filePath, callbackSuccess, callbackFail) {

    if (ready) {

      filePath = RAL.Sanitiser.cleanURL(filePath);

      root.getFile(filePath, {}, function(fileEntry) {

        fileEntry.file(function(file) {
          var reader = new FileReader();
          // Called when the request has completed
          // (either in success or failure)
          reader.onloadend = function(evt) {
            callbackSuccess(this.result);
          };

          reader.readAsText(file);
        });

      }, callbackFail);
    }
  }

  /**
   * Puts the file data in the file system.
   * @param {string} filePath The original URL of the asset.
   * @param {Blob} fileData The file data blob to store.
   * @param {Function} callback Callback for file storage.
   */
  function set(filePath, fileData, callback) {

    if (ready) {

      // Clean the file path
      filePath = RAL.Sanitiser.cleanURL(filePath);

      // Create the dir path
      var dirPath = filePath.split("/");
      dirPath.pop();

      // create the directories all the way
      // down to the path
      createDir(root, dirPath, function() {
        // now get a reference to our file, create it
        // if necessary
        root.getFile(filePath, {create: true}, function(fileEntry) {

          // create a writer on the file reference
          fileEntry.createWriter(function(fileWriter) {

            // catch on file ends
            fileWriter.onwriteend = function(e) {

              // update the writeend so when we have
              // truncated the file data we call the callback
              fileWriter.onwriteend = function(e) {
                callback(fileEntry.toURL());
              };

              // now truncate the file contents
              // for when we overwrite with a smaller file
              fileWriter.truncate(fileData.size);
            };

            // warn on write fails but right now don't bail
            fileWriter.onerror = function(e) {
              console.warn('Write failed: ' + e.toString());
            };

            // start writing
            fileWriter.write(fileData);

          }, callbacks.onError);

        }, callbacks.onError);
      });
    }
  }

  /**
   * Recursively creates the directories in a path.
   * @param {DirectoryEntry} rootDirEntry The base directory for this call.
   * @param {Array.<string>} dirs The subdirectories in this path.
   * @param {Function} onCreated The callback function to use when all
   *     directories have been created.
   */
  function createDir(rootDirEntry, dirs, onCreated) {

    // remove any empty or dot dirs
    if(dirs[0] === '.' || dirs[0] === '') {
      dirs = dirs.slice(1);
    }

    // on empty call this done
    if(!dirs.length) {
      onCreated();
    } else {

      // create the subdirectory and recursively call
      rootDirEntry.getDirectory(dirs[0], {create: true}, function(dirEntry) {
        if (dirs.length) {
          createDir(dirEntry, dirs.slice(1), onCreated);
        }
      }, callbacks.onError);
    }
  }

  /**
   * Removes a directory.
   * @param {string} path The directory to remove.
   * @param {Function} onRemoved The callback for successful deletion.
   * @param {Function} onCreated The callback for failed deletion.
   */
  function removeDir(path, onRemoved, onError) {

    if (ready) {
      root.getDirectory(path, {}, function(dirEntry) {
        dirEntry.removeRecursively(onRemoved, callbacks.onError);
      }, onError || callbacks.onError);
    }
  }

  /**
   * Removes a file.
   * @param {string} path The file to remove.
   * @param {Function} onRemoved The callback for successful deletion.
   * @param {Function} onCreated The callback for failed deletion.
   */
  function removeFile(path, onRemoved, onError) {

    if (ready) {
      root.getFile(path, {}, function(fileEntry) {
        fileEntry.remove(onRemoved, callbacks.onError);
      }, onError || callbacks.onError);
    }
  }

  /**
   * Initializes the file system.
   * @param {number} storageSize The storage size in MB.
   */
  (function init(storageSize) {

    storageSize = storageSize || 2048;

    window.requestFileSystem = window.requestFileSystem ||
      window.webkitRequestFileSystem;

    window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL ||
      window.webkitResolveLocalFileSystemURL;

    if(!!window.requestFileSystem) {
      window.requestFileSystem(
        window.PERSISTENT,
        storageSize * 1024 * 1024,
        callbacks.onInitialised,
        callbacks.onError);
    } else {
      // Seems not supported by the browser :(
    }
  })();

  return {
    isReady: isReady,
    registerOnReady: registerOnReady,
    getPath: getPath,
    getDataAsText: getDataAsText,
    set: set,
    removeFile: removeFile,
    removeDir: removeDir
  };
})();

/**
 * Prototype for all remote files
 */
RAL.RemoteFile = function(options) {
  this.parseOptions(options);
};

RAL.RemoteFile.prototype = {

  /**
   * The source URL of the remote file.
   * @type {string}
   */
  src: null,

  /**
   * Save the loaded data to this path locally
   * @type {string}
   */
  localFilePath: null,

  /**
   * Default method to get the remote file
   * @type {String}
   */
  method: 'GET',

  /**
   * Default responseType
   * @type {String}
   */
  responseType: 'blob',

  /**
   * The file's priority in the queue.
   * @type {number}
   */
  priority: RAL.Queue.queuePriority.normal,


  /**
   * Whether or not the file has loaded.
   * @type {boolean}
   */
  loaded: false,

  /**
   * Whert or not the file was cancelled while loading.
   * @type {boolean}
   */
  cancelled: false,

  /**
   * A reference to the URL object.
   * @type {Function}
   * @privatefload
   */
  wURL: window.URL || window.webkitURL,

  /**
   * Parse general options
   * @param  {object} options
   */
  parseOptions: function(options) {

    // Parse options
    options = options || {};

    this.src = options.src;
    this.localFilePath = options.localFilePath || this.src;
    this.method = options.method || this.method;
    this.responseType = options.responseType || this.responseType;
    this.priority = options.priority || 0;
  },

  /**
   * Callback for when the remote file has loaded.
   * @param {Blob} fileData The file's data.
   */
  onRemoteFileLoaded: function(fileData) {
    // Store the data locally
    RAL.FileSystem.set(this.localFilePath, fileData, this.onFileSystemSet.bind(this));

    this.sendMessage('remoteloaded', fileData);
  },

  /**
   * Called when the remote file is unavailable.
   */
  onRemoteFileUnavailable: function() {
    this.onErrorFileLoading();

    this.sendMessage('remoteunavailable');
  },

  /**
   * Callback for once the file has been stored in the file system. Stores
   * the file in the global manifest.
   */
  onFileSystemSet: function() {
    // we stored the file, we should reattempt
    // the load operation
    this.load();
  },

  /**
   * Called when the local file has been loaded. Since the
   * remote file will be stored as a local file, this should
   * always be fired, but it may be preceded by a 'remoteloaded'
   * event beforehand.
   * @param {string} filePath The local file system path of the file.
   */
  onLocalFileLoaded: function(filePath) {
    if (this.cancelled) {
      return;
    }

    this.loaded = true;
    this.sendMessage('fileloaded', filePath);
  },

  /**
   * Called when the locally stored version of the file is
   * not available. Try to load it from the remote
   */
  onLocalFileUnavailable: function() {
    this.loadFromRemote();

    this.sendMessage('localunavailable');
  },

  onErrorFileLoading: function() {
    if (this.cancelled) {
      return;
    }

    this.sendMessage('errorloading');
  },

  /**
   * Loads a file from a remote source.
   */
  loadFromRemote: function() {
    RAL.Loader.load(this.src, this.responseType, this.method,
      this.onRemoteFileLoaded.bind(this),
      this.onRemoteFileUnavailable.bind(this));

    this.sendMessage('remoteloadstart');
  },

  /**
   * Attempts to load a file from the local file system.
   */
  load: function() {
    // Check if we already have the file locally available and load it if now
    RAL.FileSystem.getPath(this.localFilePath,
      this.onLocalFileLoaded.bind(this),
      this.onLocalFileUnavailable.bind(this));
  },


  /**
   * Add a new message handler
   * @param  {string} msgName
   * @param  {function} handler
   */
  addMessageHandler: function (msgName, handler) {
    this.msgHandler = this.msgHandler || {};

    if (typeof this.msgHandler[msgName] === 'undefined') {
      this.msgHandler[msgName] = [];
    }

    this.msgHandler[msgName].push(handler);
  },

  /**
   * Dispatch the message to all message handler
   * @param  {string} msgName
   * @param  {string} data
   */
  sendMessage: function(msgName, data) {
    // go through each handler, pop it off and call it
    var msgHandlers = this.msgHandler[msgName];
    if (typeof msgHandlers !== 'undefined') {
      var handlerCount = msgHandlers.length,
          handler = null;
      while(handlerCount--) {
        handler = msgHandlers[handlerCount];
        handler(data);
      }
    }
  }
};

/**
 * Represents a remote image.
 * @param {object} options The configuration options.
 */
RAL.RemoteImage = function(options) {

  // We want a maximum width and height for images
  var imgScale = window.devicePixelRatio || 1;
  this.maxImageWidth = 1024 * imgScale;
  this.maxImageHeight = 1024 * imgScale;

  // make sure to override the prototype
  // refs with the ones for this instance
  RAL.RemoteFile.call(this, options);

  // Add specific options
  this.width = options.width || null;
  this.height = options.height || null;

  // attach on specific events for images
  this.addMessageHandler('fileloaded', this.imageDataLoaded.bind(this));
};

/**
 * Inherit from RemoteFile
 */
RAL.Util.inherits(RAL.RemoteImage, RAL.RemoteFile);

/**
 * Overwrite onRemoteFileLoaded to check if we need to resize the image
 * @param  {Blob} imageData
 */
RAL.RemoteImage.prototype.onRemoteFileLoaded = function (imageData) {
  var filePath = window.URL.createObjectURL(imageData);
  var imageToResize = new Image();
  var revoke = (function(filePath) {
    this.wURL.revokeObjectURL(filePath);
  }).bind(this, filePath);

  // Load image to get the width and height and shrink it down
  // to maxImageWidth and maxImageHeight
  var onImageToResizeLoad = function () {
    var saveData = function (data) {
      RAL.FileSystem.set(this.localFilePath, data, this.onFileSystemSet.bind(this));

      // if it's a blob make sure we go ahead
      // and revoke it properly after a short timeout
      if (/blob:/.test(filePath)) {
        setTimeout(revoke, 100);
      }
    };

    // TODO: Activate if we reactive resizing of images again
    // Check if it's a gif file, if it's a gif don't change anything as
    // it would break the gif
    /*if (typeof imageData.type !== 'undefined' && imageData.type === "image/gif") {
        saveData.call(this, imageData);
        return;
    }*/


    // Image resize is disabled as resizing images within the canvas element
    // is a major memory leak especially the toDataURL()
    // Check if we need to resize the image
    /*if (imageToResize.width > this.maxImageWidth || imageToResize.height > this.maxImageHeight) {
        // Save the resized image data and load it
        imageData = RAL.Util.resizedImageBlob(imageToResize, this.maxImageWidth, this.maxImageHeight);
        saveData.call(this, imageData);
        return;
    }*/

    saveData.call(this, imageData);
  };

  // Start load the image to resize
  imageToResize.onload = onImageToResizeLoad.bind(this);
  imageToResize.onerror = this.onRemoteFileUnavailable.bind(this);
  imageToResize.src = filePath;
};

/**
 * Called if all image data loaded from remote or the hard drive
 * @param  {Blob} imageData
 */
RAL.RemoteImage.prototype.imageDataLoaded = function(imageData) {
  var imageSrc = imageData;
  var image = new Image();
  var revoke = (function(imageSrc) {
    this.wURL.revokeObjectURL(imageSrc);
  }).bind(this, imageSrc);

  var imageLoaded = function() {
    this.sendMessage("imageloaded", image);

    // if it's a blob make sure we go ahead
    // and revoke it properly after a short timeout
    if(/blob:/.test(imageSrc)) {
      setTimeout(revoke, 100);
    }
  };

  image.onload = imageLoaded.bind(this);
  image.onerror = this.onRemoteFileUnavailable.bind(this);
  image.src = imageSrc;

};

/**
 * Represents a remote text
 * @param {object} options The configuration options.
 */
RAL.RemoteText = function(options) {

  // Add options specific for loading the text
  options = options || {};
  options.method = options.method || 'POST';
  options.responseType = options.responseType || 'json';

  // make sure to override the prototype
  // refs with the ones for this instance
  RAL.RemoteFile.call(this, options);

  // attach on specific events for data
  this.addMessageHandler('fileloaded', this.textLoaded.bind(this));
};

/**
 * Inherit from RemoteFile
 */
RAL.Util.inherits(RAL.RemoteText, RAL.RemoteFile);

/**
 * Attempts to load the article from the local file system.
*/
RAL.RemoteText.prototype.load = function() {
  // Check if we already have the file as text locally available
  // and download it if not
  RAL.FileSystem.getDataAsText(this.localFilePath,
    this.onLocalFileLoaded.bind(this),
    this.onLocalFileUnavailable.bind(this)
  );
};

/**
 * Inform the message handler that the text successfully loaded
 * @param  {string} loaded text
 */
RAL.RemoteText.prototype.textLoaded = function(text) {
  this.sendMessage("textloaded", text);
};

/**
 * Represents a remote article
 * @param {object} options The configuration options.
 */
RAL.RemoteArticle = function(options) {

  // make sure to override the prototype
  // refs with the ones for this instance
  RAL.RemoteText.call(this, options);

  // attach on specific events for text loaded
  this.addMessageHandler('textloaded', this.articleLoaded.bind(this));
};

/**
 * Inherit from RemoteText
 */
RAL.Util.inherits(RAL.RemoteArticle, RAL.RemoteText);

/**
 * Remote json data was loaded get the article from the response
 * @param  {string} remoteData
 */
RAL.RemoteArticle.prototype.onRemoteFileLoaded = function(remoteData) {
  var parsedData = remoteData;
  if (typeof remoteData !== "object") {
      parsedData = JSON.parse(remoteData);
  }

  this.sendMessage('remoteloaded', parsedData);

  var article = parsedData.article;
  var articleData = new Blob([article], {type: "text/html"});
  RAL.FileSystem.set(this.localFilePath, articleData, this.onFileSystemSet.bind(this));
};

/**
 * Article was loaded inform the message listener
 * @param  {[type]} article
 * @return {[type]}
 */
RAL.RemoteArticle.prototype.articleLoaded = function(article) {
  this.sendMessage('articleloaded', article);
};

(function ( window , undefined ) {
    'use strict';
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange,
        transactionModes = {
            readonly: 'readonly',
            readwrite: 'readwrite'
        };

    var hasOwn = Object.prototype.hasOwnProperty;

    if ( !indexedDB ) {
        throw 'IndexedDB required';
    }

    var Server = function ( db , name ) {
        var that = this,
            closed = false;

        this.clear = function ( table ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }

            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                deferred = $.Deferred();

            var req = store.clear();
            req.onsuccess = function ( ) {
                deferred.resolve( key );
            };
            req.onerror = function ( e ) {
                deferred.reject( e );
            };

            return deferred.promise();
        };

        this.add = function( table ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }

            var records = [];
            for (var i = 0; i < arguments.length - 1; i++) {
                records[i] = arguments[i + 1];
            }

            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                deferred = $.Deferred();

            records.forEach( function ( record ) {
                var req;
                if ( record.item && record.key ) {
                    var key = record.key;
                    record = record.item;
                    req = store.add( record , key );
                } else {
                    req = store.add( record );
                }

                req.onsuccess = function ( e ) {
                    var target = e.target;
                    var keyPath = target.source.keyPath;
                    if ( keyPath === null ) {
                        keyPath = '__id__';
                    }
                    Object.defineProperty( record , keyPath , {
                        value: target.result,
                        enumerable: true
                    });
                    deferred.notify();
                };
            } );

            transaction.oncomplete = function () {
                deferred.resolve( records , that );
            };
            transaction.onerror = function ( e ) {
                deferred.reject( records , e );
            };
            transaction.onabort = function ( e ) {
                deferred.reject( records , e );
            };
            return deferred.promise();
        };

        this.update = function( table ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }

            var records = [];
            for ( var i = 0 ; i < arguments.length - 1 ; i++ ) {
                records[ i ] = arguments[ i + 1 ];
            }

            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                keyPath = store.keyPath,
                deferred = $.Deferred();

            records.forEach( function ( record ) {
                var req;
                if ( record.item && record.key ) {
                    var key = record.key;
                    record = record.item;
                    req = store.put( record , key );
                } else {
                    req = store.put( record );
                }

                req.onsuccess = function ( e ) {
                    deferred.notify();
                };
            } );

            transaction.oncomplete = function () {
                deferred.resolve( records , that );
            };
            transaction.onerror = function ( e ) {
                deferred.reject( records , e );
            };
            transaction.onabort = function ( e ) {
                deferred.reject( records , e );
            };
            return deferred.promise();
        };

        this.remove = function ( table , key ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }
            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                deferred = $.Deferred();

            var req = store.delete( key );
            req.onsuccess = function ( ) {
                deferred.resolve( key );
            };
            req.onerror = function ( e ) {
                deferred.reject( e );
            };
            return deferred.promise();
        };

        this.close = function ( ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }
            db.close();
            closed = true;
            delete dbCache[ name ];
        };

        this.isClosed = function ( ) {
            return closed;
        };

        this.get = function ( table , id ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }
            var transaction = db.transaction( table ),
                store = transaction.objectStore( table ),
                deferred = $.Deferred();

            var req = store.get( id );
            req.onsuccess = function ( e ) {
                deferred.resolve( e.target.result );
            };
            req.onerror = function ( e ) {
                deferred.reject( e );
            };
            return deferred.promise();
        };

        this.query = function ( table , index ) {
            // Don't do anything if database was closed
            if ( closed ) {
                return;
            }
            return new IndexQuery( table , db , index );
        };

        for ( var i = 0 , il = db.objectStoreNames.length ; i < il ; i++ ) {
            (function ( storeName ) {
                that[ storeName ] = { };
                for ( var i in that ) {
                    if ( !hasOwn.call( that , i ) || i === 'close' || i === 'isClosed') {
                        continue;
                    }
                    that[ storeName ][ i ] = (function ( i ) {
                        return function () {
                            var args = [ storeName ].concat( [].slice.call( arguments , 0 ) );
                            return that[ i ].apply( that , args );
                        };
                    })( i );
                }
            })( db.objectStoreNames[ i ] );
        }
    };

    var IndexQuery = function ( table , db , indexName ) {
        var that = this;
        var runQuery = function ( type, args , cursorType , direction, skip, take) {
            var deferred = $.Deferred();

            var executeTransaction = function (number) {
                var transaction = db.transaction( table ),
                    store = transaction.objectStore( table ),
                    index = indexName ? store.index( indexName ) : store,
                    keyRange = type ? IDBKeyRange[ type ].apply( null, args ) : null,
                    results = [],
                    indexArgs = [ keyRange ],
                    processed = 0,
                    // Don't jump abfront if we don't have an offset or we are at the beginning
                    skipped = (typeof skip === 'undefined' || skip === 0) ;

                // We are already at the end
                if (typeof skip !== 'undefined' && skip > number) {
                    skip = number;
                }

                if (cursorType !== 'count') {
                    indexArgs.push( direction || 'next' );
                }

                index[cursorType].apply( index , indexArgs ).onsuccess = function ( e ) {
                    var cursor = e.target.result;

                    if ( typeof cursor === typeof 0) {
                        // We are done no more database entries
                        results = cursor;
                    }
                    else if ( cursor ) {
                        // Check what we have to do
                        if (!skipped) {
                            // Jump to the skip point
                            cursor.advance(skip);
                            processed = skip;
                            skipped = true;
                        }
                        // We are done jumpt to the end of the cursor
                        else if (typeof skip !== 'undefined' && typeof take !== 'undefined' && processed >= (skip+take)) {
                            cursor.advance(number - results.length);
                        }
                        // Seems like we need to process item
                        else {
                            processed += 1;
                            results.push( 'value' in cursor ? cursor.value : cursor.key );
                            cursor['continue']();
                        }
                    }
                };

                transaction.oncomplete = function () {
                    deferred.resolve( results );
                };
                transaction.onerror = function ( e ) {
                    deferred.reject( e );
                };
                transaction.onabort = function ( e ) {
                    deferred.reject( e );
                };
            };

            // First get the count of all database entries and then start the
            // actual database call
            var number;
            var cursorTransaction = db.transaction( table );
            cursorTransaction.oncomplete = function () {
                executeTransaction(number);
            };
            cursorTransaction.onabort = function ( e ) {
                deferred.reject( e );
            };
            cursorTransaction.onerror = function ( e ) {
                deferred.reject( e );
            };

            var cursorTarget = cursorTransaction.objectStore(table);
            var countRequest = cursorTarget.count();
            countRequest.onsuccess = function (evt) {
              number = evt.target.result;
            };


            return deferred.promise();
        };

        var Query = function ( type , args ) {
            var direction = 'next',
                cursorType = 'openCursor',
                filters = [],
                unique = false,
                batchSize = 500,
                offset = 0,
                sk, tk;

            var execute = function () {
                var deferred = $.Deferred();

                var result = [];

                var useSkipTaken = function () {
                    return (typeof sk !== 'undefined' && typeof tk !== 'undefined');
                };

                // Load items in batches and work on them
                var loadItems = function () {

                    var params = [type , args , cursorType , unique ? direction + 'unique' : direction];

                    // Run quries with batches if offset and count is given
                    if (useSkipTaken()) {
                        params.push.apply(params, [offset, batchSize]);
                    }

                    runQuery.apply(runQuery, params).then(function (data) {

                        var dataLength = data.length;

                        if (data.constructor === Array) {
                            filters.forEach( function ( filter ) {
                                if ( !filter || !filter.length ) {
                                    return;
                                }

                                if ( filter.length === 2 ) {
                                    data = data.filter( function ( x ) {
                                        return x[ filter[ 0 ] ] === filter[ 1 ];
                                    });
                                } else {
                                    data = data.filter( filter[ 0 ] );
                                }
                            });
                        }

                        result.push.apply(result, data);

                        if (useSkipTaken()) {
                            if (result.length >= (sk+tk)) {
                                // We are over skip + take so just slice out the
                                // right amount of items and return it
                                result = result.slice(sk, sk+tk);
                                deferred.resolve(result);
                            }
                            else if (dataLength < batchSize) {
                                // No more database entries just get the rest of the items
                                result = result.slice(sk, result.length);
                                deferred.resolve(result);
                            }
                            else {
                                // Load next batch size to process
                                offset += batchSize;
                                loadItems();
                            }
                        }
                        else {
                            // Data returned is under the batch size so this should
                            // be the end of the data
                            deferred.resolve(result);
                        }
                    }, deferred.reject , deferred.notify );
                };

                loadItems();

                return deferred.promise();
            };
            var count = function () {
                direction = null;
                cursorType = 'count';

                return {
                    execute: execute
                };
            };
            var keys = function () {
                cursorType = 'openKeyCursor';

                return {
                    desc: desc,
                    execute: execute,
                    filter: filter,
                    distinct: distinct,
                    skip: skip,
                    take: take
                };
            };
            var filter = function ( ) {
                filters.push( Array.prototype.slice.call( arguments , 0 , 2 ) );

                return {
                    keys: keys,
                    execute: execute,
                    filter: filter,
                    desc: desc,
                    distinct: distinct,
                    skip: skip,
                    take: take
                };
            };
            var desc = function () {
                direction = 'prev';

                return {
                    keys: keys,
                    execute: execute,
                    filter: filter,
                    distinct: distinct,
                    skip: skip,
                    take: take
                };
            };
            var distinct = function () {
                unique = true;
                return {
                    keys: keys,
                    execute: execute,
                    filter: filter,
                    desc: desc,
                    skip: skip,
                    take: take
                };
            };
            var skip = function (s) {
                sk = s;
                return {
                    keys: keys,
                    execute: execute,
                    filter: filter,
                    desc: desc,
                    take: take
                };
            };

            var take = function (t) {
                tk = t;
                return {
                    keys: keys,
                    count: count,
                    execute: execute,
                    filter: filter,
                    desc: desc,
                    skip: skip
                };
            };

            return {
                execute: execute,
                count: count,
                keys: keys,
                filter: filter,
                desc: desc,
                distinct: distinct,
                skip: skip,
                take: take
            };
        };

        'only bound upperBound lowerBound'.split(' ').forEach(function (name) {
            that[name] = function () {
                return new Query( name , arguments );
            };
        });

        this.filter = function () {
            var query = new Query( null , null );
            return query.filter.apply( query , arguments );
        };

        this.all = function () {
            return this.filter();
        };
    };

    var createSchema = function ( e , schema , db ) {
        if ( typeof schema === 'function' ) {
            schema = schema();
        }

        for ( var tableName in schema ) {
            var table = schema[ tableName ];
            if ( !hasOwn.call( schema , tableName ) ) {
                continue;
            }

            var store = db.createObjectStore( tableName , table.key );

            for ( var indexKey in table.indexes ) {
                var index = table.indexes[ indexKey ];
                store.createIndex( indexKey , index.key || indexKey , Object.keys(index).length ? index : { unique: false } );
            }
        }
    };

    var open = function ( e , server , version , schema ) {
        var db = e.target.result;
        var s = new Server( db , server );

        var deferred = $.Deferred();
        deferred.resolve( s );
        dbCache[ server ] = db;

        return deferred.promise();
    };

    var dbCache = {};

    var db = {
        version: '0.8.0',
        open: function ( options ) {
            var request;

            var deferred = $.Deferred();

            if ( dbCache[ options.server ] ) {
                open( {
                    target: {
                        result: dbCache[ options.server ]
                    }
                } , options.server , options.version , options.schema )
                .done(deferred.resolve)
                .fail(deferred.reject)
                .progress(deferred.notify);
            } else {
                request = indexedDB.open( options.server , options.version );

                request.onsuccess = function ( e ) {
                    open( e , options.server , options.version , options.schema )
                        .done(deferred.resolve)
                        .fail(deferred.reject)
                        .progress(deferred.notify);
                };

                request.onupgradeneeded = function ( e ) {
                    createSchema( e , options.schema , e.target.result );
                };
                request.onerror = function ( e ) {
                    deferred.reject( e );
                };
            }

            return deferred.promise();
        },
        deleteDatabase: function ( server ) {

            // First close the database if it's open
            if (dbCache[server]) {
                dbCache[server].close();
            }

            // Delete the database
            var deferred = $.Deferred();

            var request = indexedDB.deleteDatabase(server);
            request.onsuccess = function ( e ) {
                deferred.resolve();
            };

            request.onerror = function ( e ) {
                deferred.reject();
            };

            return deferred.promise();
        }
    };
    if ( typeof define === 'function' && define.amd ) {
        define( function() { return db; } );
    } else {
        window.db = db;
    }
})( window );

//     keymaster.js
//     (c) 2011-2012 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.

;(function(global){
  var k,
    _handlers = {},
    _mods = { 16: false, 18: false, 17: false, 91: false },
    _scope = 'all',
    // modifier keys
    _MODIFIERS = {
      '⇧': 16, shift: 16,
      '⌥': 18, alt: 18, option: 18,
      '⌃': 17, ctrl: 17, control: 17,
      '⌘': 91, command: 91
    },
    // special keys
    _MAP = {
      backspace: 8, tab: 9, clear: 12,
      enter: 13, 'return': 13,
      esc: 27, escape: 27, space: 32,
      left: 37, up: 38,
      right: 39, down: 40,
      del: 46, 'delete': 46,
      home: 36, end: 35,
      pageup: 33, pagedown: 34,
      ',': 188, '.': 190, '/': 191,
      '`': 192, '-': 189, '=': 187,
      ';': 186, '\'': 222,
      '[': 219, ']': 221, '\\': 220
    },
    code = function(x){
      return _MAP[x] || x.toUpperCase().charCodeAt(0);
    },
    _downKeys = [];

  for(k=1;k<20;k++) _MAP['f'+k] = 111+k;

  // IE doesn't support Array#indexOf, so have a simple replacement
  function index(array, item){
    var i = array.length;
    while(i--) if(array[i]===item) return i;
    return -1;
  }

  // for comparing mods before unassignment
  function compareArray(a1, a2) {
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
  }

  var modifierMap = {
      16:'shiftKey',
      18:'altKey',
      17:'ctrlKey',
      91:'metaKey'
  };
  function updateModifierKey(event) {
      for(k in _mods) _mods[k] = event[modifierMap[k]];
  };

  // handle keydown event
  function dispatch(event, scope){
    var key, handler, k, i, modifiersMatch;
    key = event.keyCode;

    if (index(_downKeys, key) == -1) {
        _downKeys.push(key);
    }

    // if a modifier key, set the key.<modifierkeyname> property to true and return
    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
    if(key in _mods) {
      _mods[key] = true;
      // 'assignKey' from inside this closure is exported to window.key
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
      return;
    }
    updateModifierKey(event);

    // see if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    if(!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in _handlers)) return;

    // for each potential shortcut
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];

      // see if it's in the current scope
      if(handler.scope == scope || handler.scope == 'all'){
        // check if modifiers match if any
        modifiersMatch = handler.mods.length > 0;
        for(k in _mods)
          if((!_mods[k] && index(handler.mods, +k) > -1) ||
            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
        // call the handler and stop the event if neccessary
        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
          if(handler.method(event, handler)===false){
            if(event.preventDefault) event.preventDefault();
              else event.returnValue = false;
            if(event.stopPropagation) event.stopPropagation();
            if(event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    }
  };

  // unset modifier keys on keyup
  function clearModifier(event){
    var key = event.keyCode, k,
        i = index(_downKeys, key);

    // remove key from _downKeys
    if (i >= 0) {
        _downKeys.splice(i, 1);
    }

    if(key == 93 || key == 224) key = 91;
    if(key in _mods) {
      _mods[key] = false;
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
    }
  };

  function resetModifiers() {
    for(k in _mods) _mods[k] = false;
    for(k in _MODIFIERS) assignKey[k] = false;
  };

  // parse and assign shortcut
  function assignKey(key, scope, method){
    var keys, mods;
    keys = getKeys(key);
    if (method === undefined) {
      method = scope;
      scope = 'all';
    }

    // for each shortcut
    for (var i = 0; i < keys.length; i++) {
      // set modifier keys if any
      mods = [];
      key = keys[i].split('+');
      if (key.length > 1){
        mods = getMods(key);
        key = [key[key.length-1]];
      }
      // convert to keycode and...
      key = key[0]
      key = code(key);
      // ...store handler
      if (!(key in _handlers)) _handlers[key] = [];
      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
    }
  };

  // unbind all handlers for given key in current scope
  function unbindKey(key, scope) {
    var keys = key.split('+'),
      mods = [],
      i, obj;

    if (keys.length > 1) {
      mods = getMods(keys);
      key = keys[keys.length - 1];
    }

    key = code(key);

    if (scope === undefined) {
      scope = getScope();
    }
    if (!_handlers[key]) {
      return;
    }
    for (i in _handlers[key]) {
      obj = _handlers[key][i];
      // only clear handlers if correct scope and mods match
      if (obj.scope === scope && compareArray(obj.mods, mods)) {
        _handlers[key][i] = {};
      }
    }
  };

  // Returns true if the key with code 'keyCode' is currently down
  // Converts strings into key codes.
  function isPressed(keyCode) {
      if (typeof(keyCode)=='string') {
        keyCode = code(keyCode);
      }
      return index(_downKeys, keyCode) != -1;
  }

  function getPressedKeyCodes() {
      return _downKeys.slice(0);
  }

  function filter(event){
    var tagName = (event.target || event.srcElement).tagName;
    // ignore keypressed in any elements that support keyboard data input
    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }

  // initialize key.<modifier> to false
  for(k in _MODIFIERS) assignKey[k] = false;

  // set current scope (default 'all')
  function setScope(scope){ _scope = scope || 'all' };
  function getScope(){ return _scope || 'all' };

  // delete all handlers for a given scope
  function deleteScope(scope){
    var key, handlers, i;

    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  };

  // abstract key logic for assign and unassign
  function getKeys(key) {
    var keys;
    key = key.replace(/\s/g, '');
    keys = key.split(',');
    if ((keys[keys.length - 1]) == '') {
      keys[keys.length - 2] += ',';
    }
    return keys;
  }

  // abstract mods logic for assign and unassign
  function getMods(key) {
    var mods = key.slice(0, key.length - 1);
    for (var mi = 0; mi < mods.length; mi++)
    mods[mi] = _MODIFIERS[mods[mi]];
    return mods;
  }

  // cross-browser events
  function addEvent(object, event, method) {
    if (object.addEventListener)
      object.addEventListener(event, method, false);
    else if(object.attachEvent)
      object.attachEvent('on'+event, function(){ method(window.event) });
  };

  // set the handlers globally on document
  addEvent(document, 'keydown', function(event) { dispatch(event, _scope) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
  addEvent(document, 'keyup', clearModifier);

  // reset modifiers to false whenever the window is (re)focused.
  addEvent(window, 'focus', resetModifiers);

  // store previously defined key
  var previousKey = global.key;

  // restore previously defined key and return reference to our key object
  function noConflict() {
    var k = global.key;
    global.key = previousKey;
    return k;
  }

  // set window.key and window.key.set/get/deleteScope, and the default filter
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;
  global.key.isPressed = isPressed;
  global.key.getPressedKeyCodes = getPressedKeyCodes;
  global.key.noConflict = noConflict;
  global.key.unbind = unbindKey;

  if(typeof module !== 'undefined') module.exports = key;

})(this);

/*
 * Jester JavaScript Library v0.3
 * http://github.com/plainview/Jester
 *
 * Easy JavaScript gesture recognition.
 *
 * Released under MIT License
 *
 * Copyright (C) 2011 by Scott Seaward
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(container, undefined) {
    var Jester = container.Jester = {
        cache : {},
        cacheId : "Jester" + (new Date()).getTime(),
        guid : 0,

        // The Jester constructor
        Watcher : function(element, options) {

            var that = this,
                cacheId = Jester.cacheId,
                cache = Jester.cache,
                gestures = "swipe flick tap doubletap pinchnarrow pinchwiden pinchend";

            if(!element || !element.nodeType) {
                throw new TypeError("Jester: no element given.");
            }

            // if this element hasn't had Jester called on it before,
            // set it up with a cache entry and give it the expando
            if(typeof element[cacheId] !== "number") {
                element[cacheId] = Jester.guid;
                Jester.guid++;
            }

            var elementId = element[cacheId];

            if(!(elementId in cache)) {
                Jester.cache[elementId] = {};
            }

            var elementCache = Jester.cache[elementId];

            if(!("options" in elementCache)) {
                elementCache.options = {};
            }

            options = options || elementCache.options || {};

            // cache the option values for reuse or, if options already
            // exist for this element, replace those that have been
            // specified
            if(elementCache.options !== options) {
                for(var prop in options) {
                    if(elementCache.options[prop]) {
                        if(elementCache.options[prop] !== options[prop]) {
                            elementCache.options[prop] = options[prop];
                        }
                    }
                    else {
                        elementCache.options[prop] = options[prop];
                    }
                }
            }

            if(!("eventSet" in elementCache) || !(elementCache.eventSet instanceof Jester.EventSet)) {
                elementCache.eventSet = new Jester.EventSet(element);
            }

            if(!elementCache.touchMonitor) {
                elementCache.touchMonitor = new Jester.TouchMonitor(element);
            }

            var events = elementCache.eventSet;
            var touches = elementCache.touchMonitor;

            this.id = element[cacheId];

            this.bind = function(evt, fn) {
                if(evt && typeof evt === "string" && typeof fn === "function") {
                    events.register(evt, fn);
                }
                return this;
            };

            // create shortcut bind methods for all gestures
            gestures.split(" ").forEach(function(gesture) {
                this[gesture] = function(fn) {
                    return this.bind(gesture, fn);
                };
            }, that);

            this.start = function(fn) {
                return this.bind("start", fn);
            };

            this.during = function(fn) {
                return this.bind("during", fn);
            };

            this.end = function(fn) {
                return this.bind("end", fn);
            };

            // wrapper to cover all three pinch methods
            this.pinch = function(fns) {
                if(typeof fns !== "undefined") {
                    // if its just a function it gets assigned to pinchend
                    if(typeof fns === "function") {
                        that.pinchend(fns);
                    }
                    else if(typeof fns === "object") {
                        var method;
                        "narrow widen end".split(" ").forEach(function(eventExt) {
                            method = "pinch" + eventExt;
                            if(typeof fns[eventExt] === "function") {
                                that[method](fns[eventExt]);
                            }
                        });
                    }
                }
            };

            this.halt = function() {
                touches.stopListening();
                events.clear();
                delete elementCache.eventSet;
                delete elementCache.touchMonitor;
            };
        },
        EventSet : function(element) {
            // all event names and their associated functions in an array i.e. "swipe" : [fn1, fn2, fn2]
            var eventsTable = {};
            this.eventsTable = eventsTable;

            // register a handler with an event
            this.register = function(eventName, fn) {
                // if the event exists and has handlers attached to it, add this one to the array of them
                if(eventsTable[eventName] && eventsTable[eventName].push) {
                    // make sure multiple copies of the same handler aren't inserted
                    if(!~eventsTable[eventName].indexOf(fn)) {
                        eventsTable[eventName].push(fn);
                    }
                }
                else {
                    // create a new array bound to the event containing only the handler passed in
                    eventsTable[eventName] = [fn];
                }
            };

            this.release = function(eventName, fn) {
                if(typeof eventName === "undefined") return;

                // if a handler hasn't been specified, remove all handlers
                if(typeof fn === "undefined") {
                    for(var handlers in eventsTable.eventName) {
                        delete eventsTable.eventName[handlers];
                    }
                }
                else {
                    // pull the given handler from the given event
                    if(eventsTable[eventName] && ~eventsTable[eventName].indexOf(fn))
                    {
                        eventsTable[eventName].splice(eventsTable[eventName].indexOf(fn), 1);
                    }
                }

                // if the event has no more handlers registered to it, get rid of the event completely
                if(eventsTable[eventName] && eventsTable[eventName].length === 0) {
                    delete eventsTable[eventName];
                }
            };

            // completely remove all events and their handlers
            this.clear = function() {
                var events;
                for(events in eventsTable) {
                    delete eventsTable[events];
                }
            };

            // get all the handlers associated with an event
            // return an empty array if nothing is registered with the given event name
            this.getHandlers = function(eventName) {
                if(eventsTable[eventName] && eventsTable[eventName].length) {
                    return eventsTable[eventName];
                }
                else {
                    return [];
                }
            };

            // inject an array of handlers into the event table for the given event
            // this will klobber all current handlers associated with the event
            this.setHandlers = function(eventName, handlers) {
                eventsTable[eventName] = handlers;
            };

            // execute all handlers associated with an event, passing each handler the arguments provided after the event's name.
            this.execute = function(eventName) {
                if(typeof eventName === "undefined") return;

                // if the event asked for exists in the events table
                if(eventsTable[eventName] && eventsTable[eventName].length) {
                    // get the arguments sent to the function
                    var args = Array.prototype.slice.call(arguments, 1);

                    // iterate throuh all the handlers
                    for(var i = 0; i < eventsTable[eventName].length; i++) {
                        // check current handler is a function
                        if(typeof eventsTable[eventName][i] === "function") {
                            // execute handler with the provided arguments
                            eventsTable[eventName][i].apply(element, args);
                        }
                    }
                }
            };
        },

        TouchMonitor : function(element)
        {
            var cacheId = Jester.cacheId,
                elementId = element[cacheId],
                cache = Jester.cache,
                elementCache = cache[elementId],
                opts = elementCache.options;

            opts.move           = opts.move                 ||    {};
            opts.scale          = opts.scale                ||    {};

            opts.tapDistance    = opts.tapDistance          ||    0;
            opts.tapTime        = opts.tapTime              ||    20;

            opts.doubleTapTime  = opts.doubleTapTime        ||    300;

            opts.swipeDistance  = opts.swipeDistance        ||    200;

            opts.flickTime      = opts.flickTime            ||    300;
            opts.flickDistance  = opts.flickDistance        ||    200;

            opts.deadX          = opts.deadX                ||    0;
            opts.deadY          = opts.deadY                ||    0;

            if(opts.capture !== false) opts.capture = true;
            if(typeof opts.preventDefault !== "undefined" && opts.preventDefault !== false) opts.preventDefault = true;
            if(typeof opts.preventDefault !== "undefined" && opts.stopPropagation !== false) opts.stopPropagation = true;

            var eventSet = elementCache.eventSet;

            var touches;
            var previousTapTime = 0;

            var touchStart = function(evt) {
                touches = new Jester.TouchGroup(evt);

                eventSet.execute("start", touches, evt);

                if(opts.preventDefault) evt.preventDefault();
                if(opts.stopPropagation) evt.stopPropagation();
            };

            var touchMove = function(evt) {
                touches.update(evt);

                eventSet.execute("during", touches, evt);

                if(opts.preventDefault) evt.preventDefault();
                if(opts.stopPropagation) evt.stopPropagation();

                if(touches.numTouches() == 2) {
                    // pinchnarrow
                    if(touches.delta.scale() < 0.0) {
                        eventSet.execute("pinchnarrow", touches);
                    }

                    // pinchwiden
                    else if(touches.delta.scale() > 0.0) {
                        eventSet.execute("pinchwiden", touches);
                    }
                }
            };

            var touchEnd = function(evt) {

                var swipeDirection;

                eventSet.execute("end", touches, evt);

                if(opts.preventDefault) evt.preventDefault();
                if(opts.stopPropagation) evt.stopPropagation();

                if(touches.numTouches() == 1) {
                    // tap
                    if(touches.touch(0).total.x() <= opts.tapDistance && touches.touch(0).total.y() <= opts.tapDistance && touches.touch(0).total.time() < opts.tapTime) {
                        eventSet.execute("tap", touches);
                    }

                    // doubletap
                    if(touches.touch(0).total.time() < opts.tapTime) {
                        var now = (new Date()).getTime();
                        if(now - previousTapTime <= opts.doubleTapTime) {
                            eventSet.execute("doubletap", touches);
                        }
                        previousTapTime = now;
                    }

                    // swipe left/right
                    if(Math.abs(touches.touch(0).total.x()) >= opts.swipeDistance) {
                        swipeDirection = touches.touch(0).total.x() < 0 ? "left" : "right";
                        eventSet.execute("swipe", touches, swipeDirection);
                    }

                    // swipe up/down
                    if(Math.abs(touches.touch(0).total.y()) >= opts.swipeDistance) {
                        swipeDirection = touches.touch(0).total.y() < 0 ? "up" : "down";
                        eventSet.execute("swipe", touches, swipeDirection);
                    }

                    // flick
                    if(Math.abs(touches.touch(0).total.x()) >= opts.flickDistance && touches.touch(0).total.time() <= opts.flickTime) {
                        var flickDirection = touches.touch(0).total.x() < 0 ? "left" : "right";
                        eventSet.execute("flick", touches, flickDirection);
                    }
                }
                else if(touches.numTouches() == 2) {
                    // pinchend
                    if(touches.current.scale() !== 1.0) {
                        var pinchDirection = touches.current.scale() < 1.0 ? "narrowed" : "widened";
                        eventSet.execute("pinchend", touches, pinchDirection);
                    }
                }
            };

            var stopListening = function() {
                element.removeEventListener("touchstart", touchStart, opts.capture);
                element.removeEventListener("touchmove", touchMove, opts.capture);
                element.removeEventListener("touchend", touchEnd, opts.capture);
            };

            element.addEventListener("touchstart", touchStart, opts.capture);
            element.addEventListener("touchmove", touchMove, opts.capture);
            element.addEventListener("touchend", touchEnd, opts.capture);

            return {
                stopListening: stopListening
            };
        },

        TouchGroup : function(event) {
            var that = this;
    
            var numTouches = event.touches.length;
        
            var midpointX = 0;
            var midpointY = 0;
    
            var scale = event.scale;
            var prevScale = scale;
            var deltaScale = scale;

            for(var i = 0; i < numTouches; i++) {
                this["touch" + i] = new Jester.Touch(event.touches[i].pageX, event.touches[i].pageY);
                midpointX = event.touches[i].pageX;
                midpointY = event.touches[i].pageY;
            }

            function getNumTouches() {
                return numTouches;
            }

            function getTouch(num) {
                return that["touch" + num];
            }

            function getMidPointX() {
                return midpointX;
            }
            function getMidPointY() {
                return midpointY;
            }
            function getScale() {
                return scale;
            }
            function getDeltaScale() {
                return deltaScale;
            }

            function updateTouches(event) {
                var mpX = 0;
                var mpY = 0;

                for(var i = 0; i < event.touches.length; i++) {
                    if(i < numTouches) {
                        that["touch" + i].update(event.touches[i].pageX, event.touches[i].pageY);
                        mpX += event.touches[i].pageX;
                        mpY += event.touches[i].pageY;
                    }
                }
                midpointX = mpX / numTouches;
                midpointY = mpY / numTouches;

                prevScale = scale;
                scale = event.scale;
                deltaScale = scale - prevScale;
            }

            return {
                numTouches: getNumTouches,
                touch: getTouch,
                current: {
                    scale: getScale,
                    midX: getMidPointX,
                    midY: getMidPointY
                },
                delta: {
                    scale: getDeltaScale
                },
                update: updateTouches
            };
        },

        Touch : function(_startX, _startY) {
            var startX = _startX,
                startY = _startY,
                startTime = now(),
                currentX = startX,
                currentY = startY,
                currentTime = startTime,
                currentSpeedX = 0,
                currentSpeedY = 0,
                prevX = startX,
                prevY = startX,
                prevTime = startTime,
                prevSpeedX = 0,
                prevSpeedY = 0,
                deltaX = 0,
                deltaY = 0,
                deltaTime = 0,
                deltaSpeedX = 0,
                deltaSpeedY = 0,
                totalX = 0,
                totalY = 0,
                totalTime = 0;

            // position getters
            function getStartX() {
                return startX;
            }
            function getStartY() {
                return startY;
            }
            function getCurrentX() {
                return currentX;
            }
            function getCurrentY() {
                return currentY;
            }
            function getPrevX() {
                return prevX;
            }
            function getPrevY() {
                return prevY;
            }
            function getDeltaX() {
                return deltaX;
            }
            function getDeltaY() {
                return deltaY;
            }
            function getTotalX() {
                return totalX;
            }
            function getTotalY() {
                return totalY;
            }

            // time getters
            function now() {
                return (new Date()).getTime();
            }
            function getStartTime() {
                return startTime;
            }
            function getCurrentTime() {
                return currentTime;
            }
            function getPrevTime() {
                return prevTime;
            }
            function getDeltaTime() {
                return deltaTime;
            }
            function getTotalTime() {
                return totalTime;
            }

            // speed getters
            function getCurrentSpeedX() {
                return currentSpeedX;
            }
            function getCurrentSpeedY() {
                return currentSpeedY;
            }
            function getPrevSpeedX() {
                return prevSpeedX;
            }
            function getPrevSpeedY() {
                return prevSpeedY;
            }
            function getDeltaSpeedX() {
                return deltaSpeedX;
            }
            function getDeltaSpeedY() {
                return deltaSpeedY;
            }

            return {
                start: {
                    x: getStartX,
                    y: getStartY,
                    speedX: 0,
                    speedY: 0,
                    time: getStartTime
                },
                current: {
                    x: getCurrentX,
                    y: getCurrentY,
                    time: getCurrentTime,
                    speedX: getCurrentSpeedX,
                    speedY: getCurrentSpeedY
                },
                prev: {
                    x: getPrevX,
                    y: getPrevY,
                    time: getPrevTime,
                    speedX: getPrevSpeedX,
                    speedY: getPrevSpeedY
                },
                delta: {
                    x: getDeltaX,
                    y: getDeltaY,
                    speedX: getDeltaSpeedX,
                    speedY: getDeltaSpeedY,
                    time: getDeltaTime
                },
                total: {
                    x: getTotalX,
                    y: getTotalY,
                    time: getTotalTime
                },
                update: function(_x, _y) {
                    prevX = currentX;
                    prevY = currentY;
                    currentX = _x;
                    currentY = _y;
                    deltaX = currentX - prevX;
                    deltaY = currentY - prevY;
                    totalX = currentX - startX;
                    totalY = currentY - startY;

                    prevTime = currentTime;
                    currentTime = now();
                    deltaTime = currentTime - prevTime;
                    totalTime = currentTime - startTime;

                    prevSpeedX = currentSpeedX;
                    prevSpeedY = currentSpeedY;
                    currentSpeedX = deltaX / (deltaTime/1000);
                    currentSpeedY = deltaY / (deltaTime/1000);
                    deltaSpeedX = currentSpeedX - prevSpeedX;
                    deltaSpeedY = currentSpeedY - prevSpeedY;
                }
            };
        }
    };

    container.jester = function(el, opts) {
        return new Jester.Watcher(el, opts);
    };

}(window));

History = function () {
    this.stateChangedCallback = function () {};
    this.states = [];
};

History.prototype = {
    getState : function () {
        return this.states[this.states.length-1];
    },

    back : function () {
        this.states.pop();
        this.stateChangedCallback();
    },

    pushState : function (state, title, url) {
        this.states.push({state: state, title: title, url:url});
        this.stateChangedCallback();
    }
};

History = new History();
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


// Generated by CoffeeScript 1.6.2
(function() {
  var __slice = [].slice;

  (function($, window) {
    var chardinJs;

    chardinJs = (function() {
      function chardinJs(el) {
        var _this = this;

        this.$el = $(el);
        $(window).resize(function() {
          return _this.refresh();
        });
      }

      chardinJs.prototype.start = function() {
        var el, _i, _len, _ref;

        if (this._overlay_visible()) {
          return false;
        }
        this._add_overlay_layer();
        _ref = this.$el.find('*[data-intro]').filter(':visible');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          el = _ref[_i];
          this._show_element(el);
        }
        return this.$el.trigger('chardinJs:start');
      };

      chardinJs.prototype.toggle = function() {
        if (!this._overlay_visible()) {
          return this.start();
        } else {
          return this.stop();
        }
      };

      chardinJs.prototype.refresh = function() {
        var el, _i, _len, _ref, _results;

        if (this._overlay_visible()) {
          _ref = this.$el.find('*[data-intro]');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            _results.push(this._position_helper_layer(el));
          }
          return _results;
        } else {
          return this;
        }
      };

      chardinJs.prototype.stop = function() {
        this.$el.find(".chardinjs-overlay").fadeOut(function() {
          return $(this).remove();
        });
        this.$el.find('.chardinjs-helper-layer').remove();
        this.$el.find('.chardinjs-show-element').removeClass('chardinjs-show-element');
        this.$el.find('.chardinjs-relative-position').removeClass('chardinjs-relative-position');
        if (window.removeEventListener) {
          window.removeEventListener("keydown", this._onKeyDown, true);
        } else {
          if (document.detachEvent) {
            document.detachEvent("onkeydown", this._onKeyDown);
          }
        }
        return this.$el.trigger('chardinJs:stop');
      };

      chardinJs.prototype._overlay_visible = function() {
        return this.$el.find('.chardinjs-overlay').length !== 0;
      };

      chardinJs.prototype._add_overlay_layer = function() {
        var element_position, overlay_layer, styleText,
          _this = this;

        if (this._overlay_visible()) {
          return false;
        }
        overlay_layer = document.createElement("div");
        styleText = "";
        overlay_layer.className = "chardinjs-overlay";
        if (this.$el.prop('tagName') === "BODY") {
          styleText += "top: 0;bottom: 0; left: 0;right: 0;position: fixed;";
          overlay_layer.setAttribute("style", styleText);
        } else {
          element_position = this._get_offset(this.$el.get()[0]);
          if (element_position) {
            styleText += "width: " + element_position.width + "px; height:" + element_position.height + "px; top:" + element_position.top + "px;left: " + element_position.left + "px;";
            overlay_layer.setAttribute("style", styleText);
          }
        }
        this.$el.get()[0].appendChild(overlay_layer);
        overlay_layer.onclick = function() {
          return _this.stop();
        };
        return setTimeout(function() {
          styleText += "opacity: 1;";
          return overlay_layer.setAttribute("style", styleText);
        }, 10);
      };

      chardinJs.prototype._get_position = function(element) {
        return element.getAttribute('data-position') || 'bottom';
      };

      chardinJs.prototype._place_tooltip = function(element) {
        var my_height, my_width, target_element_position, target_height, target_width, tooltip_layer, tooltip_layer_position;

        tooltip_layer = $(element).data('tooltip_layer');
        tooltip_layer_position = this._get_offset(tooltip_layer);
        tooltip_layer.style.top = null;
        tooltip_layer.style.right = null;
        tooltip_layer.style.bottom = null;
        tooltip_layer.style.bottomlower = null;
        tooltip_layer.style.left = null;
        switch (this._get_position(element)) {
          case "top":
          case "bottom":
          case "bottomlower":
            target_element_position = this._get_offset(element);
            target_width = target_element_position.width;
            my_width = $(tooltip_layer).width();
            tooltip_layer.style.left = "" + ((target_width / 2) - (tooltip_layer_position.width / 2)) + "px";
            break;
          case "left":
          case "right":
            target_element_position = this._get_offset(element);
            target_height = target_element_position.height;
            my_height = $(tooltip_layer).height();
            tooltip_layer.style.top = "" + ((target_height / 2) - (tooltip_layer_position.height / 2)) + "px";
        }
        switch (this._get_position(element)) {
          case "left":
            return tooltip_layer.style.left = "-" + (tooltip_layer_position.width - 34) + "px";
          case "right":
            return tooltip_layer.style.right = "-" + (tooltip_layer_position.width - 34) + "px";
          case "bottom":
            return tooltip_layer.style.bottom = "-" + tooltip_layer_position.height + "px";
          case "bottomlower":
            return tooltip_layer.style.bottom = "-" + tooltip_layer_position.height + "px";
          case "top":
            return tooltip_layer.style.top = "-" + tooltip_layer_position.height + "px";
        }
      };

      chardinJs.prototype._position_helper_layer = function(element) {
        var element_position, helper_layer;

        helper_layer = $(element).data('helper_layer');
        element_position = this._get_offset(element);
        return helper_layer.setAttribute("style", "width: " + element_position.width + "px; height:" + element_position.height + "px; top:" + element_position.top + "px; left: " + element_position.left + "px;");
      };

      chardinJs.prototype._show_element = function(element) {
        var current_element_position, element_position, helper_layer, tooltip_layer;

        element_position = this._get_offset(element);
        helper_layer = document.createElement("div");
        tooltip_layer = document.createElement("div");
        $(element).data('helper_layer', helper_layer).data('tooltip_layer', tooltip_layer);
        if (element.id) {
          helper_layer.setAttribute("data-id", element.id);
        }
        helper_layer.className = "chardinjs-helper-layer chardinjs-" + (this._get_position(element));
        this._position_helper_layer(element);
        this.$el.get()[0].appendChild(helper_layer);
        tooltip_layer.className = "chardinjs-tooltip chardinjs-" + (this._get_position(element));
        tooltip_layer.innerHTML = "<div class='chardinjs-tooltiptext'>" + (element.getAttribute('data-intro')) + "</div>";
        helper_layer.appendChild(tooltip_layer);
        this._place_tooltip(element);
        element.className += " chardinjs-show-element";
        current_element_position = "";
        if (element.currentStyle) {
          current_element_position = element.currentStyle["position"];
        } else {
          if (document.defaultView && document.defaultView.getComputedStyle) {
            current_element_position = document.defaultView.getComputedStyle(element, null).getPropertyValue("position");
          }
        }
        current_element_position = current_element_position.toLowerCase();
        if (current_element_position !== "absolute" && current_element_position !== "relative") {
          return element.className += " chardinjs-relative-position";
        }
      };

      chardinJs.prototype._get_offset = function(element) {
        var element_position, _x, _y;

        element_position = {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
        _x = 0;
        _y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
          _x += element.offsetLeft;
          _y += element.offsetTop;
          element = element.offsetParent;
        }
        element_position.top = _y;
        element_position.left = _x;
        return element_position;
      };

      return chardinJs;

    })();
    return $.fn.extend({
      chardinJs: function() {
        var $this, args, data, option;

        option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        $this = $(this[0]);
        data = $this.data('chardinJs');
        if (!data) {
          $this.data('chardinJs', (data = new chardinJs(this, option)));
        }
        if (typeof option === 'string') {
          data[option].apply(data, args);
        }
        return data;
      }
    });
  })(window.jQuery, window);

}).call(this);

/*
 * jQuery Plugin: Tokenizing Autocomplete Text Entry
 * Version 1.6.0
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */

(function ($) {
// Default settings
var DEFAULT_SETTINGS = {
	// Search settings
    method: "GET",
    contentType: "json",
    queryParam: "q",
    searchDelay: 300,
    minChars: 1,
    propertyToSearch: "name",
    jsonContainer: null,

	// Display settings
    hintText: null,
    noResultsText: null,
    searchingText: null,
    deleteText: "&times;",
    animateDropdown: true,

	// Tokenization settings
    tokenLimit: null,
    tokenDelimiter: ",",
    preventDuplicates: false,

	// Output settings
    tokenValue: "id",

	// Prepopulation settings
    prePopulate: null,
    processPrePopulate: false,

	// Manipulation settings
    idPrefix: "token-input-",

	// Formatters
    resultsFormatter: function(item){ return "<li>" + item[this.propertyToSearch]+ "</li>" },
    tokenFormatter: function(item) { return "<li><p>" + item[this.propertyToSearch] + "</p></li>" },

    // Validations
    validateItem: null,

	// Callbacks
    onResult: null,
    onAdd: null,
    onDelete: null,
    onReady: null
};

// Default classes to use when theming
var DEFAULT_CLASSES = {
    tokenList: "token-input-list",
    token: "token-input-token",
    tokenDelete: "token-input-delete-token",
    selectedToken: "token-input-selected-token",
    highlightedToken: "token-input-highlighted-token",
    dropdown: "token-input-dropdown",
    dropdownItem: "token-input-dropdown-item",
    dropdownItem2: "token-input-dropdown-item2",
    selectedDropdownItem: "token-input-selected-dropdown-item",
    inputToken: "token-input-input-token"
};

// Input box position "enum"
var POSITION = {
    BEFORE: 0,
    AFTER: 1,
    END: 2
};

// Keys "enum"
var KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    NUMPAD_ENTER: 108,
    COMMA: 188
};

// Additional public (exposed) methods
var methods = {
    init: function(url_or_data_or_function, options) {
        var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

        return this.each(function () {
            $(this).data("tokenInputObject", new $.TokenList(this, url_or_data_or_function, settings));
        });
    },
    clear: function() {
        this.data("tokenInputObject").clear();
        return this;
    },
    add: function(item) {
        this.data("tokenInputObject").add(item);
        return this;
    },
    remove: function(item) {
        this.data("tokenInputObject").remove(item);
        return this;
    },
    get: function() {
    	return this.data("tokenInputObject").getTokens();
   	}
}

// Expose the .tokenInput function to jQuery as a plugin
$.fn.tokenInput = function (method) {
    // Method calling and initialization logic
    if(methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
        return methods.init.apply(this, arguments);
    }
};

// TokenList class for each input
$.TokenList = function (input, url_or_data, settings) {
    //
    // Initialization
    //

    // Configure the data source
    if($.type(url_or_data) === "string" || $.type(url_or_data) === "function") {
        // Set the url to query against
        settings.url = url_or_data;

        // If the URL is a function, evaluate it here to do our initalization work
        var url = computeURL();

        // Make a smart guess about cross-domain if it wasn't explicitly specified
        if(settings.crossDomain === undefined) {
            if(url.indexOf("://") === -1) {
                settings.crossDomain = false;
            } else {
                settings.crossDomain = (location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1]);
            }
        }
    } else if(typeof(url_or_data) === "object") {
        // Set the local data to search through
        settings.local_data = url_or_data;
    }

    // Build class names
    if(settings.classes) {
        // Use custom class names
        settings.classes = $.extend({}, DEFAULT_CLASSES, settings.classes);
    } else if(settings.theme) {
        // Use theme-suffixed default class names
        settings.classes = {};
        $.each(DEFAULT_CLASSES, function(key, value) {
            settings.classes[key] = value + "-" + settings.theme;
        });
    } else {
        settings.classes = DEFAULT_CLASSES;
    }


    // Save the tokens
    var saved_tokens = [];

    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    var input_val;

    function tokenize(){
        var item = $(selected_dropdown_item).data("tokeninput");
        if(!item && settings.textToData){
            item = settings.textToData(input_box.val());
        }

        if(item) {
            add_token(item);
            hidden_input.change();
            return false;
        }
    }

    // Create a new text input an attach keyup events
    var input_box = $("<input type=\"text\"  autocomplete=\"off\">")
        .css({
            outline: "none"
        })
        .attr("id", settings.idPrefix + input.id)
        .focus(function () {
            if (settings.tokenLimit === null || settings.tokenLimit !== token_count) {
                show_dropdown_hint();
            }
        })
        .blur(function () {
            tokenize();
            hide_dropdown();
            $(this).val("");
        })
        .bind("keyup keydown blur update", resize_input)
        .keydown(function (event) {
            var previous_token;
            var next_token;

            switch(event.keyCode) {
                case KEY.LEFT:
                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    if(!$(this).val()) {
                        previous_token = input_token.prev();
                        next_token = input_token.next();

                        if((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                            // Check if there is a previous/next token and it is selected
                            if(event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                                deselect_token($(selected_token), POSITION.BEFORE);
                            } else {
                                deselect_token($(selected_token), POSITION.AFTER);
                            }
                        } else if((event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) && previous_token.length) {
                            // We are moving left, select the previous token if it exists
                            select_token($(previous_token.get(0)));
                        } else if((event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) && next_token.length) {
                            // We are moving right, select the next token if it exists
                            select_token($(next_token.get(0)));
                        }
                    } else {
                        var dropdown_item = null;

                        if(!selected_dropdown_item && (event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT)) {
                            dropdown_item = $('.token-input-dropdown li').first();
                        }
                        else if(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                            dropdown_item = $(selected_dropdown_item).next();
                        } else {
                            dropdown_item = $(selected_dropdown_item).prev();
                        }

                        if(dropdown_item.length) {
                            select_dropdown_item(dropdown_item);
                        }
                        else if (!(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) && $(selected_dropdown_item).length) {
                            deselect_dropdown_item($(selected_dropdown_item));
                        }
                        return false;
                    }
                    break;

                case KEY.BACKSPACE:
                    previous_token = input_token.prev();

                    if(!$(this).val().length) {
                        if(selected_token) {
                            delete_token($(selected_token));
                            hidden_input.change();
                        } else if(previous_token.length) {
                            select_token($(previous_token.get(0)));
                        }

                        return false;
                    } else if($(this).val().length === 1) {
                        hide_dropdown();
                    } else {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;

                case KEY.TAB:
                case KEY.ENTER:
                case KEY.NUMPAD_ENTER:
                case KEY.COMMA:
                    tokenize();
                  break;

                case KEY.ESCAPE:
                  hide_dropdown();
                  return true;

                default:
                    if(String.fromCharCode(event.which)) {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;
            }
        });

    // Keep a reference to the original input box
    var hidden_input = $(input)
                           .hide()
                           .val("")
                           .focus(function () {
                               input_box.focus();
                           })
                           .blur(function () {
                               input_box.blur();
                           });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_token_index = 0;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $("<ul />")
        .addClass(settings.classes.tokenList)
        .click(function (event) {
            var li = $(event.target).closest("li");
            if(li && li.get(0) && $.data(li.get(0), "tokeninput")) {
                toggle_select_token(li);
            } else {
                // Deselect selected token
                if(selected_token) {
                    deselect_token($(selected_token), POSITION.END);
                }

                // Focus input box
                input_box.focus();
            }
        })
        .mouseover(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.addClass(settings.classes.highlightedToken);
            }
        })
        .mouseout(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.removeClass(settings.classes.highlightedToken);
            }
        })
        .insertBefore(hidden_input);

    // The token holding the input box
    var input_token = $("<li />")
        .addClass(settings.classes.inputToken)
        .appendTo(token_list)
        .append(input_box);

    // The list to store the dropdown items in
    var dropdown = $("<div>")
        .addClass(settings.classes.dropdown)
        .appendTo("body")
        .hide();

    // Magic element to help us resize the text input
    var input_resizer = $("<tester/>")
        .insertAfter(input_box)
        .css({
            position: "absolute",
            top: -9999,
            left: -9999,
            width: "auto",
            fontSize: input_box.css("fontSize"),
            fontFamily: input_box.css("fontFamily"),
            fontWeight: input_box.css("fontWeight"),
            letterSpacing: input_box.css("letterSpacing"),
            whiteSpace: "nowrap"
        });

    // Pre-populate list if items exist
    hidden_input.val("");
    var li_data = settings.prePopulate || hidden_input.data("pre");
    if(settings.processPrePopulate && $.isFunction(settings.onResult)) {
        li_data = settings.onResult.call(hidden_input, li_data);
    }
    if(li_data && li_data.length) {
        $.each(li_data, function (index, value) {
            insert_token(value);
            checkTokenLimit();
        });
    }

    // Initialization is done
    if($.isFunction(settings.onReady)) {
        settings.onReady.call();
    }

    //
    // Public functions
    //

    this.clear = function() {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                delete_token($(this));
            }
        });
    }

    this.add = function(item) {
        add_token(item);
    }

    this.remove = function(item) {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                var currToken = $(this).data("tokeninput");
                var match = true;
                for (var prop in item) {
                    if (item[prop] !== currToken[prop]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    delete_token($(this));
                }
            }
        });
    }
    
    this.getTokens = function() {
   		return saved_tokens;
   	}

    //
    // Private functions
    //

    function checkTokenLimit() {
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
            return;
        }
    }

    function resize_input() {
        if(input_val === (input_val = input_box.val())) {return;}

        // Enter new content into resizer and resize input accordingly
        var escaped = input_val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        input_resizer.html(escaped);
        input_box.width(input_resizer.width() + 30);
    }

    function is_printable_character(keycode) {
        return ((keycode >= 48 && keycode <= 90) ||     // 0-1a-z
                (keycode >= 96 && keycode <= 111) ||    // numpad 0-9 + - / * .
                (keycode >= 186 && keycode <= 192) ||   // ; = , - . / ^
                (keycode >= 219 && keycode <= 222));    // ( \ ) '
    }

    // Inner function to a token to the list
    function insert_token(item) {
        var this_token = settings.tokenFormatter(item);
        this_token = $(this_token)
          .addClass(settings.classes.token)
          .insertBefore(input_token);

        // The 'delete token' button
        $("<span>" + settings.deleteText + "</span>")
            .addClass(settings.classes.tokenDelete)
            .appendTo(this_token)
            .click(function () {
                delete_token($(this).parent());
                hidden_input.change();
                return false;
            });

        // Store data on the token
        var token_data = {"id": item.id};
        token_data[settings.propertyToSearch] = item[settings.propertyToSearch];
        token_data.item = item;
        $.data(this_token.get(0), "tokeninput", item);

        // Save this token for duplicate checking
        saved_tokens = saved_tokens.slice(0,selected_token_index).concat([token_data]).concat(saved_tokens.slice(selected_token_index));
        selected_token_index++;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count += 1;

        // Check the token limit
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
        }

        return this_token;
    }

    // Add a token to the token list based on user input
    function add_token (item) {
        if(!item) return;

        // Check for item validation
        if ($.isFunction(settings.validateItem) && !settings.validateItem(item)) {
            return false;
        }

        var callback = settings.onAdd;

        // See if the token already exists and select it if we don't want duplicates
        if(token_count > 0 && settings.preventDuplicates) {
            var found_existing_token = null;
            token_list.children().each(function () {
                var existing_token = $(this);
                var existing_data = $.data(existing_token.get(0), "tokeninput");
                if(existing_data && existing_data.id === item.id) {
                    found_existing_token = existing_token;
                    return false;
                }
            });

            if(found_existing_token) {
                select_token(found_existing_token);
                input_token.insertAfter(found_existing_token);
                input_box.focus();
                return;
            }
        }

        // Insert the new tokens
        if(settings.tokenLimit == null || token_count < settings.tokenLimit) {
            insert_token(item);
            checkTokenLimit();
        }

        // Clear input box
        input_box.val("");

        // Don't show the help dropdown, they've got the idea
        hide_dropdown();

        // Execute the onAdd callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,item);
        }
    }

    // Select a token in the token list
    function select_token (token) {
        token.addClass(settings.classes.selectedToken);
        selected_token = token.get(0);

        // Hide input box
        input_box.val("");

        // Hide dropdown if it is visible (eg if we clicked to select token)
        hide_dropdown();
    }

    // Deselect a token in the token list
    function deselect_token (token, position) {
        token.removeClass(settings.classes.selectedToken);
        selected_token = null;

        if(position === POSITION.BEFORE) {
            input_token.insertBefore(token);
            selected_token_index--;
        } else if(position === POSITION.AFTER) {
            input_token.insertAfter(token);
            selected_token_index++;
        } else {
            input_token.appendTo(token_list);
            selected_token_index = token_count;
        }

        // Show the input box and give it focus again
        input_box.focus();
    }

    // Toggle selection of a token in the token list
    function toggle_select_token(token) {
        var previous_selected_token = selected_token;

        if(selected_token) {
            deselect_token($(selected_token), POSITION.END);
        }

        if(previous_selected_token === token.get(0)) {
            deselect_token(token, POSITION.END);
        } else {
            select_token(token);
        }
    }

    // Delete a token from the token list
    function delete_token (token) {
        // Remove the id from the saved list
        var token_data = $.data(token.get(0), "tokeninput");
        var callback = settings.onDelete;

        var index = token.prevAll().length;
        if(index > selected_token_index) index--;

        // Delete the token
        token.remove();
        selected_token = null;

        // Show the input box and give it focus again
        input_box.focus();

        // Remove this token from the saved list
        saved_tokens = saved_tokens.slice(0,index).concat(saved_tokens.slice(index+1));
        if(index < selected_token_index) selected_token_index--;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count -= 1;

        if(settings.tokenLimit !== null) {
            input_box
                .show()
                .val("")
                .focus();
        }

        // Execute the onDelete callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,token_data);
        }
    }

    // Update the hidden input box value
    function update_hidden_input(saved_tokens, hidden_input) {
        var token_values = $.map(saved_tokens, function (el) {
            return el[settings.tokenValue];
        });
        hidden_input.val(token_values.join(settings.tokenDelimiter));

    }

    // Hide and clear the results dropdown
    function hide_dropdown () {
        dropdown.hide().empty();
        selected_dropdown_item = null;
    }

    function show_dropdown() {
        dropdown
            .css({
                position: "absolute",
                top: $(token_list).offset().top + $(token_list).outerHeight(),
                left: $(token_list).offset().left,
                zindex: 999
            })
            .show();
    }

    function show_dropdown_searching () {
        if(settings.searchingText) {
            dropdown.html("<p>"+settings.searchingText+"</p>");
            show_dropdown();
        }
    }

    function show_dropdown_hint () {
        if(settings.hintText) {
            dropdown.html("<p>"+settings.hintText+"</p>");
            show_dropdown();
        }
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    }
    
    function find_value_and_highlight_term(template, value, term) {
        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + value + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));
    }

    // Populate the results dropdown with some results
    function populate_dropdown (query, results) {
        if(results && results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    select_dropdown_item($(event.target).closest("li"));
                })
                .mousedown(function (event) {
                    add_token($(event.target).closest("li").data("tokeninput"));
                    hidden_input.change();
                    return false;
                })
                .hide();

            $.each(results, function(index, value) {
                var this_li = settings.resultsFormatter(value);
                
                // this_li = find_value_and_highlight_term(this_li ,value[settings.propertyToSearch], query);            
                
                this_li = $(this_li).appendTo(dropdown_ul);
                
                if(index % 2) {
                    this_li.addClass(settings.classes.dropdownItem);
                } else {
                    this_li.addClass(settings.classes.dropdownItem2);
                }

                // if(index === 0) {
                //     select_dropdown_item(this_li);
                // }

                $.data(this_li.get(0), "tokeninput", value);
            });

            show_dropdown();

            if(settings.animateDropdown) {
                dropdown_ul.slideDown("fast");
            } else {
                dropdown_ul.show();
            }
        } else {
            if(settings.noResultsText) {
                dropdown.html("<p>"+settings.noResultsText+"</p>");
                show_dropdown();
            }
        }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                deselect_dropdown_item($(selected_dropdown_item));
            }

            item.addClass(settings.classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item (item) {
        item.removeClass(settings.classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than settings.minChars
    function do_search() {
        var query = input_box.val().toLowerCase();

        if(query && query.length) {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.AFTER);
            }

            if(query.length >= settings.minChars) {
                show_dropdown_searching();
                clearTimeout(timeout);

                timeout = setTimeout(function(){
                    run_search(query);
                }, settings.searchDelay);
            } else {
                hide_dropdown();
            }
        }
    }

    // Do the actual search
    function run_search(query) {
        var cache_key = query + computeURL();
        var cached_results = cache.get(cache_key);
        if(cached_results) {
            populate_dropdown(query, cached_results);
        } else {
            // Are we doing an ajax search or local data search?
            if(settings.url) {
                var url = computeURL();
                // Extract exisiting get params
                var ajax_params = {};
                ajax_params.data = {};
                if(url.indexOf("?") > -1) {
                    var parts = url.split("?");
                    ajax_params.url = parts[0];

                    var param_array = parts[1].split("&");
                    $.each(param_array, function (index, value) {
                        var kv = value.split("=");
                        ajax_params.data[kv[0]] = kv[1];
                    });
                } else {
                    ajax_params.url = url;
                }

                // Prepare the request
                ajax_params.data[settings.queryParam] = query;
                ajax_params.type = settings.method;
                ajax_params.dataType = settings.contentType;
                if(settings.crossDomain) {
                    ajax_params.dataType = "jsonp";
                }

                // Attach the success callback
                ajax_params.success = function(results) {
                  if($.isFunction(settings.onResult)) {
                      results = settings.onResult.call(hidden_input, results);
                  }
                  cache.add(cache_key, settings.jsonContainer ? results[settings.jsonContainer] : results);

                  // only populate the dropdown if the results are associated with the active search query
                  if(input_box.val().toLowerCase() === query) {
                      populate_dropdown(query, settings.jsonContainer ? results[settings.jsonContainer] : results);
                  }
                };

                // Make the request
                $.ajax(ajax_params);
            } else if(settings.search_function){
                settings.search_function(query, function(results){
                    cache.add(cache_key, results);
                    populate_dropdown(query, results);
                });
            } else if(settings.local_data) {
                // Do the search through local data
                var results = $.grep(settings.local_data, function (row) {
                    return row[settings.propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                });

                if($.isFunction(settings.onResult)) {
                    results = settings.onResult.call(hidden_input, results);
                }
                cache.add(cache_key, results);
                populate_dropdown(query, results);
            }
        }
    }

    // compute the dynamic URL
    function computeURL() {
        var url = settings.url;
        if(typeof settings.url == 'function') {
            url = settings.url.call();
        }
        return url;
    }
};

// Really basic cache for the results
$.TokenList.Cache = function (options) {
    var settings = $.extend({
        max_size: 500
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size += 1;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};
}(jQuery));

/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.setImmediate = setImmediate;
            async.nextTick = setImmediate;
        }
        else {
            async.setImmediate = async.nextTick;
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = setImmediate;
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                }
            }));
        });
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = function () {};
            }
        });

        _each(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor !== Array) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (test()) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (!test()) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if(data.constructor !== Array) {
              data = [data];
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain) cargo.drain();
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.compose = function (/* functions... */) {
        var fns = Array.prototype.reverse.call(arguments);
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());
/* globals boot, isChromePackagedApp, async, domainForURL, getImageCacheUrl, assetCache */

/**
 * Searches the friends from the database for autocompletion
 */
var FriendSearch = function(){
	this._currentSearchIndex = 0;
	this.emails = [];
	this.friendsByEmail = {};
	this.friendsByID = {};
};

FriendSearch.prototype.loadData = function(data){
	var self = this;

	// Get all autocomplete emails from the database
	boot.helper.db.server.ac_emails.query().all().execute().done(function (emails) {
		var emailByFriendID = {};
		$.each(emails, function (eIndex, email){
			if (!emailByFriendID[email.friend_id]) {
				emailByFriendID[email.friend_id] = [];
			}
			emailByFriendID[email.friend_id].push(email.email);
		});

		// Create data for autocompletion
		$.each(data, function (index, friend) {
			var friendID = friend.friend_id;
			friend.emails = emailByFriendID[friendID] || [];
			self.friendsByID[friendID] = friend;

			var emails = friend.emails || [];
			$.each(emails, function (idx, email) {
				self.emails.push(email.toLowerCase());
				self.friendsByEmail[email] = friend;
			});
		});
	});
};

FriendSearch.prototype.search = function(searchTerm, cb){
	// compare on this to make sure the search is still valid during iteration
	var searchIndex = ++this._currentSearchIndex;
	var self = this;

	searchTerm = searchTerm.toLowerCase();

	// Search for friends that match the searchTerm
	setTimeout(function(){
		async.filter(self.emails, function(email, cb){
			var isValid = self._currentSearchIndex == searchIndex;
			var matches = email.indexOf(searchTerm) != -1;
			cb(isValid && matches);
		}, function(emails){
			if (self._currentSearchIndex == searchIndex) {
				async.map(emails, function(email, cb){
					if (self._currentSearchIndex !== searchIndex) {
						cb("Aborted", null);
					}
					else {
						var friend = self.friendsByEmail[email];
						cb(null, {
							name: friend.name,
							email: email,
							friendID: friend.friend_id,
							avatar_url: friend.avatar_url,
							friend: friend
						});
					}
				}, function(err, friends){
					if (friends && self._currentSearchIndex == searchIndex) {
						cb(friends);
					}
				});
			}
		});
	}, 1);
};


/**
 * The Actual SendToFriend sheet controller object that handlers
 */
var SendToFriend = function(item, sendToFriendView, messageHandler){
	var self = this;
	// Assign the message handler before checking the message contents
	// as it act we sen the contents resize message
	this.messageHandler = messageHandler;

	// Check first if we need to show a message and just return if we have to
	var $messageContents = $(sendToFriendView.view).find(".messageContents");
	if ($messageContents && $messageContents.length !== 0) {
		this.contentSizeChanged($messageContents.height() + 100);
		return;
	}

	// No we don't have to show a message so start to load the share sheet up
	// Get friends data from the database and load into the friend search
	this.friendSearch = new FriendSearch();
	boot.helper.db.server.friends.query('friendsIdIndex')
		.all()
		.execute()
		.done(function(friends) {
			self.friendSearch.loadData(friends);
	});

	this.imgIdentifier = -1;

	this.item = item;
	this.sendToFriendView = sendToFriendView;
	this.form = this.sendToFriendView.view.find("form");

	this.loadImage(this.form.find("#image"));

	this.form.find(".send").click($.proxy(this.send, this));
	this.form.find(".cancel").click($.proxy(this.cancel, this));

	// Initialize the token field, we use the jquery tokeninput plugin
	// for reach the autocompletion UI
	this.tokenInput = this.form.find("input[name=to]").tokenInput([], {
		search_function: function(term, cb){
			self.friendSearch.search(term, cb);
		},
		resultsFormatter: function(item){
			var twoLine = (item.name && item.email && item.name.length > 0 && item.email.length > 0);
			var title = (item.name && item.name.length > 0) ? item.name : item.email;
			var avatarURL = item.avatar_url;

			var subtitle = (twoLine ? item.email : null);
			var imgIdentifierClass = this.imgIdentifierClass();
			var element = (
				"<li style='text-align:left'>" +
					"<img class='"+ imgIdentifierClass +"' title='" + title + "' height='25px' width='25px' />" +
					"<div style='display: inline-block; padding-left: 10px;'" + (twoLine ? " class='two_line'" : " class='one_line'") + ">" +
						"<div class='full_name title'>" + title + "</div>" +
						(twoLine ? "<div class='email subtitle'>" + subtitle + "</div>" : "") +
					"</div>" +
				"</li>");

			this.loadAvatar(avatarURL, imgIdentifierClass);

			return element;
		},
		tokenFormatter: function(item) {
			var avatarURL = item.avatar_url;
			var imgIdentifierClass = this.imgIdentifierClass();
			var element = (
				"<li>" +
					"<img class='"+ imgIdentifierClass +"' height='25px' width='25px' />" +
					"<p>" + (item.name || item.email) + "</p>" +
				"</li>");
			this.loadAvatar(avatarURL, imgIdentifierClass);

			return element;
		},
		loadAvatar: function(avatarURL, imgIdentifierClass) {
			if (!avatarURL || !avatarURL.length){
				if (isChromePackagedApp()) {
					avatarURL = "a/i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
					avatarURL = chrome.runtime.getURL(avatarURL);
				}
				else {
					avatarURL = "i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
				}
			}
			else {
				avatarURL = getImageCacheUrl(avatarURL, 'w50-h50');
			}

			// Load the image after a timeout so the img is already in the DOM
			setTimeout(function () {
				assetCache.loadAvatar(avatarURL, function(img) {
					$("." + imgIdentifierClass).attr('src', img.src);
				});
			}, 0);
		},
		imgIdentifierClass: function () {
			self.imgIdentifier += 1;
			return "avatar-" + self.imgIdentifier;
		},
		textToData: function(text){
			if (text.match(/^[_a-z0-9-\+]+(\.[_a-z0-9-\+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/)){
				return {email: text};
			}
			else {
				return null;
			}
		},
		validateItem: function(item) {
			// It's either a friend or a plain object with an email property
			var email = item.email;
			return isValidEmail(email);
		},
		onAdd: function() {
			self.contentSizeChanged();
		},
		onDelete: function() {
			self.contentSizeChanged();
		}
	});

	this.contentSizeChanged();
};

SendToFriend.prototype.loadImage = function(imageElement){
	if (imageElement.length === 0) {
		return;
	}

	var url = decodeURIComponent(imageElement.attr("data-image-url"));

	var width = 70;
	var height = this.form.find("#itemData").height();

	var imgScale = window.devicePixelRatio ? window.devicePixelRatio : 1;

	var resizedURL = getImageCacheUrl(url, 'w'+(width*imgScale)+(height*imgScale?'-h'+height*imgScale:'')+'-nc', 't');

	assetCache.loadImageCached(resizedURL, true, function(img) {
		$(imageElement).css({
			backgroundImage: "url(" + img.src + ")",
			backgroundSize: "100% 100%",
			backgroundPosition: "center center",
			height: height,
			visibility: "visible"
		});
	});

};

SendToFriend.prototype.getRecipients = function(){
	var tokens = this.tokenInput.tokenInput("get");
	var recipients = [];
	for (var idx = 0; idx < tokens.length; idx++) {
		var token = tokens[idx];
		if (token.item.friendID) {
			var friendObject = {
				friend_id:token.item.friendID
			};
			if (typeof token.item !== 'undefined' && typeof token.item.friend !== 'undefined') {
				friendObject.local_friend_id = token.item.friend.local_friend_id;
			}
			recipients.push(friendObject);
		}
		else if (token.item.email) {
			recipients.push({email:token.item.email});
		}
	}
	return recipients;
};

SendToFriend.prototype.cancel = function() {
	this.removeTokenField();
	this.postMessage({closed: true, shared: false});
};

SendToFriend.prototype.send = function() {
	var self = this;
	var data = {};

	// Add comment
	data.comment = this.form.find("textarea[name=comment]").val();

	// Create the to friends object
	// The recipients object can include either friend_id's or email's
	var recipients = this.getRecipients();
	var to = [];
	$.each(recipients, function (idx, friend) {
		// Check if we have a friend in the recipients list or an email
		if (typeof friend.friend_id !== 'undefined') {
			// If we have a friend in the recipient list try to send the
			// friend_id and local_friend_id from the friend
			var toObject = {
				friend_id: friend.friend_id,
				local_friend_id: friend.local_friend_id
			};
			to.push(toObject);
		}
		else {
			to.push(friend);
		}
	});

	data.to = to;

	// Add item id and / or url. We need at least one of these two to share the link
	// If the item is in the queue or archive we also add the item_id to the share_to action
	var itemStatus = parseInt(this.item.status, 10);
	if (typeof this.item.item_id !== 'undefined' && typeof this.item.status !== 'undefined'
		&& (itemStatus === 0 || itemStatus === 1))
	{
		data.itemId = this.item.item_id;
	}

	// We always add the url
	data.url = this.item.resolved_url || this.item.given_url || this.item.url;

	// Send the data to the API
	boot.pages.queue.data.shareTo({
		o			: {},
		data		: data,
		delegate		: self,
		doneSelector	: 'shareItemCallback',
		errorSelector	: 'shareItemError'
	});

	this.form.parent().addClass('sending');
};

SendToFriend.prototype.shareItemCallback = function (data, o) {
	this.form.parent().removeClass('sending');
	this.postMessage({closed: true, shared: (data.success !== false)});
	this.removeTokenField();
};

SendToFriend.prototype.shareItemError = function (error) {
	this.form.parent().removeClass('sending');
	this.removeTokenField();
};

SendToFriend.prototype.removeTokenField = function () {
	$(".token-input-dropdown").remove();
};

SendToFriend.prototype.postMessage = function(msg){
	this.messageHandler(JSON.stringify(msg));
};

SendToFriend.prototype.contentSizeChanged = function(height){
	height = height || (this.form.height() + parseInt(this.form.css("margin-top"), 10) + parseInt(this.form.css("margin-bottom"), 10));
	if (!isNaN(height)) {
		this.postMessage({height: height, closed: false});
	}
};


/**
 * SendToFriend Form View is responsible for filling the template with data
 */
var SendToFriendView = function() {
	this.view = $('<div class="send-to-friend-form"></div>');
};

SendToFriendView.prototype.updateWithItem = function(item) {
	var html = this.templateWithItem(item);
	this.view.html(html);
};

SendToFriendView.prototype.updateWithMessageURL

SendToFriendView.prototype.showMessage = function(messageTitle, messageSubtitle, messageButton, messageButtonURL, buttonClickedHandler) {
	var html = this.messageTemplate(messageTitle, messageSubtitle, messageButton, messageButtonURL);
	this.view.html(html);
	this.view.find(".button").click(buttonClickedHandler);
};

SendToFriendView.prototype.destroy = function() {
	this.view.html("");
};

SendToFriendView.prototype.templateWithItem = function(item) {
	this.item = item;

	// Check the information we need to know for showing the send to sheet properly
	var url = item.resolved_url || item.given_url || item.url,
		title = item.resolved_title || item.given_title || item.title || url,
		domain = domainForURL(url);

	// Check if we have to add an image
	var hasImage = (typeof item.has_image !== 'undefined' && typeof item.has_image !== 'undefined' && item.has_image == '1'),
		imageClass =  '',
		imageView = '';
	if (hasImage) {
		imageClass += ' has_image';
		imageView += '<div id="image" data-image-url="' + item.images[1].src + '"></div>';
	}

	// Dynamically create the item view we show in the send to sheet
	var itemView = '' +
	'<div class="item' + imageClass + '">' +
		imageView +
		'<div id="itemData">' +
			'<div id="title">' + title + '</div>' +
			'<div id="domain">' + domain + '</div>' +
		'</div>' +
	'</div>';

	var view = '' +
	'<form>'+
		'<div class="field" id="toField">' +
			'<label>To:</label>'  +
			'<input type="text" class="autocomplete recipients" name="to">'  +
		'</div>'  +
		'<div class="field" id="commentField">'  +
			'<label>Comment:</label>' +
			'<textarea type="text" class="comment" name="comment"></textarea>' +
		'</div>'  +
		itemView +
		'<div class="footer">' +
			'<a class="send button button-small button-important">Send</a>' +
			'<a class="cancel">Cancel</a>' +
		'</div>' +
	'</form>' +
	'<div id="blocker"></div>';

	return view;
};

SendToFriendView.prototype.messageTemplate = function(messageTitle, messageSubtitle, messageButton, messageButtonURL) {
	var view = '' +
		'<div class="messageContents">' +
			'<h1>' + messageTitle  +'</h1>' +
			'<div>' + messageSubtitle +  '</div>' +
			'<a class="yellow button" href="' + messageButtonURL + '" target="_blank">' + messageButton + '</a>' +
		'</div>';
	return view;
};

/* global  removeSetting, isChromePackagedApp, key, jester, History, chrome,
			Queue, loggedInUser, database, sync, filer, assetCache, backgroundPage,
			User, DB, Filer, AssetCache, Sync, logger, getSetting, setSetting, parseUri
*/

function Boot()
{
	this.pages = {};
	this.helper = {};

	this.defaultPage = 'queue';
	this.urlHead = '/a/';

	this.router = {
		'home'		:	'queue',
		'queue'		:	'queue',
		'favorites'	:	'queue',
		'archive'	:	'queue',
		'options'	:	'options',
		'read'		:	'reader',
		'login'		:	'login'
	};

	this.GSFStatus = {};
	this.UserNotices = {};
}

Boot.prototype =
{
	init : function()
	{
		var self = this;

		if (!this.inited) {
			this.addLinkListener();
			this.addKeyboardShortcuts();
		}

		// show main content
		$('#container').addClass('container-active');

		if (loggedInUser.isLoggedIn()) {
			self.loadStateFromUrl();
			sync.sync();

			if (isChromePackagedApp()) {
				this.addSyncingTrigger();
			}


			this.getUserNotices();
			PocketUserApps.init(PKTConsumerKey,loggedInUser.accessToken);
			getSetting('guid',function(data) {
				if (typeof data.guid == 'string') {
					loggedInUser.guid = data.guid;
					PocketAnalytics.init(PKTConsumerKey,loggedInUser.accessToken,loggedInUser.guid);
				}
			});
		}
		else {
			// This should only happen if we use the app from the browser
			// and not as Packaged App, the PA uses his own login window
			// from main.js
			self.loadStateFromUrl('/a/login');
		}

		this.getGSFStatus();
		this.inited = true;
	},

	// This method is only for login via the website and not via the Packaged App
	loggedIn : function ()
	{
		// Start syncing
		sync.sync();

		// Load queue
		this.loadStateFromUrl();
		this.pages.queue.reloadList();
	},

	addLinkListener : function ()
	{
		// intercept links and trigger the load of the articles
		$('#page').on('click', 'a[href]', function(e)
		{
			// do not intercept key + click links
			if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
				return true;
			}

			var href = this.getAttribute('href');
			logger.log('about to load in a href',href);
			if (href.match(/^\/a\//))
			{
				// close any popovers
				$('.popover-new').removeClass('popover-active');

				boot.loadStateFromUrl(href);
				return false;
			}
		});
	},

	addKeyboardShortcuts : function ()
	{
		var self = this;

		// Keyboard shortcut to reload the list
		key('⌘+r, ctrl+r', function () {
			sync.sync();
		});

		// delete database
		key('⌘+d, ctrl+d', function () {
			boot.logout(false, true);
		});

		// go to queue
		key('⌘+1, ctrl+1', function () {
			getSetting('lastQueueView',function(data) {
				if (typeof data.lastQueueView == 'string' && data.lastQueueView == 'list')
				{
					self.loadStateFromUrl('/a/queue/list');
				}
				else
				{
					self.loadStateFromUrl('/a/queue/');
				}
			});
		});

		// go to favorites
		key('⌘+2, ctrl+2', function () {
			getSetting('lastQueueView',function(data) {
				if (typeof data.lastQueueView == 'string' && data.lastQueueView == 'list')
				{
					self.loadStateFromUrl('/a/favorites/list');
				}
				else
				{
					self.loadStateFromUrl('/a/favorites/');
				}
			});
		});

		// go to archive
		key('⌘+3, ctrl+3', function () {
			getSetting('lastQueueView',function(data) {
				if (typeof data.lastQueueView == 'string' && data.lastQueueView == 'list')
				{
					self.loadStateFromUrl('/a/archive/list');
				}
				else
				{
					self.loadStateFromUrl('/a/archive/');
				}
			});
		});

		// content filter - all items
		key('⌥+1, alt+1', function () {
			if (boot.pages.queue.isOpen) {
				$('#pagenav_segmentsfilter').find('.all').trigger('click');
			}
		});

		// content filter - articles
		key('⌥+2, alt+2', function () {
			if (boot.pages.queue.isOpen) {
				$('#pagenav_segmentsfilter').find('.articles').trigger('click');
			}
		});

		// content filter - videos
		key('⌥+3, alt+3', function () {
			if (boot.pages.queue.isOpen) {
				$('#pagenav_segmentsfilter').find('.videos').trigger('click');
			}
		});

		// content filter - images
		key('⌥+4, alt+4', function () {
			if (boot.pages.queue.isOpen) {
				$('#pagenav_segmentsfilter').find('.images').trigger('click');
			}
		});

		// toggle list/grid view in queue, article/web view in reader
		key('⌘+/', function () {
			if (boot.pages.queue.isOpen) {
				self.loadStateFromUrl($('#pagenav_gridlist').children('a').attr('href'));
			}
			else if (boot.pages.reader.isOpen) {
				if ($('#pagenav_articleview').hasClass('selected')) {
					self.pages.reader.switchToWebView();
				}
				else {
					self.pages.reader.switchToArticleView();
				}
			}
		});

		// help overlay
		key('shift+/', function () {
			if (typeof $.fn.chardinJs != 'function') {
				return;
			}
			$('body').one('chardinJs:start',function()
			{
				if (!$('.chardinjs-keyboard').length)
				{
					if (boot.pages.queue.isOpen) {
						header =   '<div class="chardinjs-header"><h2>Pocket Menu</h2></div>\
								  	<div class="chardinjs-keyboard"><ul>\
								 	<li class="header">Keyboard shortcuts in queue view</li>\
									<li><span>cmd/ctrl + 1/2/3</span>Switch to Home, Favorites and Archive</li>\
									<li><span>alt + 1/2/3/4</span>Filter Articles, Videos and Images</li>\
									<li><span>cmd/ctrl + /</span>Toggle Tile/List View</li>\
									<li><span>a</span>Archive Selected Item</li>\
									<li><span>f</span>Favorite Selected Item</li>\
									<li><span>j/k</span>Select Next/Previous Item</li>\
									<li><span>o</span>Open Selected Item in Browser</li>\
									<li><span>return/enter</span>Open Selected item</li>\
									<li><span>?</span>View Help Overlay</li>\
									</ul></div>';
					}
					else {
						header =   '<div class="chardinjs-keyboard"><ul>\
								 	<li class="header">Keyboard shortcuts in reader view</li>\
									<li><span>cmd/ctrl + 1/2/3</span>Switch to Home, Favorites and Archive</li>\
									<li><span>cmd/ctrl + -/+</span>Decrease/increase Font Size</li>\
									<li><span>a</span>Archive Item or Save Item to List</li>\
									<li><span>f</span>Favorite Item</li>\
									<li><span>o</span>Open in Browser</li>\
									<li><span>?</span>View Help Overlay</li>\
									</ul></div>';
					}
					$('.chardinjs-overlay').append(header);
				}
			});
			$('body').chardinJs('toggle');
		});

		// move forward to next item in queue or next article if in reader
		key('j', function (e) {
			if (boot.pages.queue.isOpen) {
				self.pages.queue.highlightItemMove(true);
			}
		});

		// move back to previous item in queue
		key('k', function (e) {
			if (boot.pages.queue.isOpen) {
				self.pages.queue.highlightItemMove(false);
			}
		});

		// open currently selected item in queue, confirm deletion dialog
		key('return, enter', function(e) {
			e.preventDefault();
			if (boot.pages.queue.isOpen) {
				self.pages.queue.highlightItemAction('open');
			}
		});

		// archive/unarchive selected item in queue, item in reader
		key('a', function(e) {
			if (boot.pages.queue.isOpen) {
				self.pages.queue.highlightItemAction('mark');
			}
			else if (boot.pages.reader.isOpen && $('#pagenav_articleview').hasClass('selected')) {
				self.pages.reader.actionToggle('mark');
			}
		});

		// distraction/full screen mode in reader
		// key('d', function(e) {
		// 	if (boot.pages.reader.isOpen && $('#pagenav_articleview').hasClass('selected')) {
		// 		$('body').toggleClass('page-readerfullscreen');
		// 	}
		// });

		// favorite/unfavorite selected item in queue, item in reader
		key('f', function(e) {
			if (boot.pages.queue.isOpen) {
				self.pages.queue.highlightItemAction('favorite');
			}
			else if (boot.pages.reader.isOpen && $('#pagenav_articleview').hasClass('selected')) {
				self.pages.reader.actionToggle('favorite');
			}
		});

		// open selected item in browser
		key('o', function(e) {
			if (boot.pages.queue.isOpen) {
				self.pages.queue.highlightItemAction('browseropen');
			}
			else if (boot.pages.reader.isOpen && typeof boot.pages.reader.item.given_url == 'string')
			{
				var readeritem = boot.pages.reader.item;
				var url = (readeritem.resolved_url ? readeritem.resolved_url : readeritem.given_url);
				window.open(urlWithPocketRedirect(url));
			}
		});

		// decrease font size in reader
		key('⌘+-', function(e) {
			e.preventDefault();
			if (boot.pages.reader.isOpen && $('#pagenav_articleview').hasClass('selected')) {
				self.pages.reader.fontInc(-1);
			}
		});

		// increase font size in reader
		key('⌘+=', function(e) {
			e.preventDefault();
			if (boot.pages.reader.isOpen && $('#pagenav_articleview').hasClass('selected')) {
				self.pages.reader.fontInc(1);
			}
		});

		// go back
		key('⌘+[', function () {
			if (boot.pages.reader.isOpen && $('#pagenav_articleview').hasClass('selected')) {
				self.goBack();
			}
		});
	},

	loadStateFromUrl : function(url)
	{
		logger.log('loading state form url',url);

		var state = {};
		var urlData = parseUri(url ? url : window.location);

		state.sections = urlData.path.replace(new RegExp('^'+this.urlHead), '').split('/');
		for (var i = 0; i < state.sections.length; i++) {
			state.sections[i] = decodeURIComponent(state.sections[i]);
		}

		state.page = state.sections[0];

		if (!state.page) {
			state.page = this.defaultPage;
		}

		if (state.page !== 'read') {
			this.pages.reader.hideWebView();
		}

		if (this.router[state.page]) {
			state.controller = this.pages[this.router[state.page]];
			state.controller.loadState(state);
		}
		else {
			this.loadStateFromUrl('/a/');
		}
	},

	addSyncingTrigger: function()
	{
		this.addSyncByWindowFocus();
	},

	addSyncByWindowFocus: function()
	{
		// Everytime the window get's focus let's sync
		$(window).on('focus', function() {
			if (loggedInUser.isLoggedIn()) {
				sync.sync();
			}
		});
	},

	addSyncPollingAlarm: function()
	{
		// Start sync each period of minutes
		chrome.alarms.create('refreshData', {periodInMinutes: 5});
		chrome.alarms.onAlarm.addListener(function(alarm) {
			if (alarm.name == 'refreshData') {
				logger.log('running sync');
				sync.sync();
			}
		});
	},

	getGSFStatus: function()
	{
		getSetting('GSFStatus',function(data) {
			if (typeof data.GSFStatus != 'undefined') {
				boot.GSFStatus = JSON.parse(data.GSFStatus);
			}
		});
	},

	saveGSFStatus: function()
	{
		setSetting('GSFStatus',JSON.stringify(this.GSFStatus));	
	},

	getUserNotices: function()
	{
		var self = this;
		getSetting('UserNotices',function(data) {
			if (typeof data.UserNotices != 'undefined') {
				var usernotices = JSON.parse(data.UserNotices);
				var detail = usernotices[loggedInUser.username];
				if (typeof detail == 'object')
				{
					self.UserNotices = detail;
				}
			}
		});
	},

	saveUserNotices: function()
	{
		var self = this;
		getSetting('UserNotices',function(data) {
			var usernotices = {};
			if (typeof data.UserNotices != 'undefined') {
				usernotices = JSON.parse(data.UserNotices);
			}
			usernotices[loggedInUser.username] = self.UserNotices;
			setSetting('UserNotices',JSON.stringify(usernotices));	
		});
	},

	pushState : function(title, url)
	{
		this.pushing = true;
		History.pushState(false, title, url);
		this.pushing = false;
	},

	showPage : function(controller)
	{
		$("#queue_title").css("display", (controller instanceof Queue ? "" : "none"));

		if (controller.page.hasClass('active')) {
			return;
		}

		var animated = true;

		// hide active page
		if (this.activeController) {
			this.activeController.willHide();

			this.activeController.page.removeClass('active');
			this.activeController.navigationItem.removeClass('active');


			if (this.activeController.footerItem) {
				this.activeController.footerItem.object.removeClass('active');
			}

			this.activeController.didHide();
		}
		else {
			animated = false;
		}

		// change background class
		var skinclass = controller.page.attr('skin') ? 'page-' + controller.nav + controller.page.attr('skin') : '';
		$('body').attr('class','').addClass('page-' + controller.nav + ' ' + skinclass);

		// show page
		controller.page.addClass('active');

		// show navigation bar
		controller.navigationItem.addClass('active');

		// show footer
		if (controller.footerItem) {
			controller.footerItem.object.addClass('active');
		}
		$('#page').toggleClass('show_footer', !!controller.footerItem);

		// update nav
		$('header nav li').removeClass('selected');
		$('#nav_'+controller.nav).addClass('selected');

		this.activeController = controller;

		this.activeController.didShow();
	},

	showInterstitial: function(name)
	{
		var overlay = $("<div class='interstitial'></div>");
		var closeButton = $("<div class='close'></div>");
		var iframe = $("<iframe allowtransparency=true></iframe>");
		iframe.attr("id", "name");

		function blockScrolling(e){
			e.preventDefault();
			return false;
		}

		function finish(e){
			overlay.removeClass("open");
			$(window).unbind("scroll", blockScrolling);

			setTimeout(function(){
				overlay.remove();
			}, 300);
		}

		iframe.bind("load", function(e){
			iframe.unbind("load");

			setTimeout(function(){
				overlay.addClass("open");

				overlay.click(finish);
				closeButton.click(finish);

				$(window).bind("scroll", blockScrolling);
			}, 10);
		});

		overlay.append(iframe);
		overlay.append(closeButton);
		$(document.body).append(overlay);

		iframe.attr("src", "/interstitial/" + name + ".html?d=" + new Date().getTime());
	},


	/**
	 * Notifications
	 */

	showNotification: function (message, emptystatusbar, statusbaramount)
	{
		var notifications = $('.notifications-sync');
		var progress = notifications.find('.progress-bar-content');

		progress.removeClass('progress-bar-zeroed');
		if (typeof message !== 'undefined') {
			notifications.find('.message').text(message);
		}

		if (typeof emptystatusbar !== 'undefined' && emptystatusbar) {
			if (typeof statusbaramount === 'number') {
				if (statusbaramount > 1) {
					statusbaramount = 1;
				}
				progress.css('width',statusbaramount*100 + '%');
				if (statusbaramount === 0) {
					progress.addClass('progress-bar-zeroed');
				}
			}
			else {
				progress.css('width','1%');
			}

		}
		else
		{
			progress.css('width','100%');
		}
		notifications.addClass('notifications-active');
	},

	hideNotification: function ()
	{
		var notifications = $('.notifications-sync');
		notifications.removeClass('notifications-active');
		notifications.on('webkitTransitionEnd transitionEnd', function(e) {
			if ($(e.target).hasClass('notifications-sync')) {
				$(this).find('.progress-bar-content').addClass('progress-bar-zeroed');
				$(this).off('webkitTransitionEnd transitionEnd');
			}
		});

	},

	updateNotification: function (newmessage, statusbaramount)
	{
		var notifications = $('.notifications-sync');
		var progress = notifications.find('.progress-bar-content');
		if (typeof newmessage == 'string') {
			notifications.find('.message').text(newmessage);

		}
		if (typeof statusbaramount == 'number') {
			if (statusbaramount > 1) {
				statusbaramount = 1;
			}
			progress.css('width',statusbaramount*100 + '%');
			if (statusbaramount === 0) {
				progress.addClass('progress-bar-zeroed');
			}
			else {
				progress.removeClass('progress-bar-zeroed');
			}
		}
	},

	showErrorNotification: function(message)
	{
		var notifications = $('.notifications-error');
		notifications.one('webkitTransitionEnd transitionEnd',function(e)
		{
			$(this).removeClass('notifications-active');
		});
		if (typeof message == 'string') {
			notifications.find('.message').text(message);
		}
		notifications.addClass('notifications-active');
	},

	// New Database
	initNewDatabase: function(callback) {
		// Replace the complete database with a new one
		database.deleteDatabase(function() {
			database = new DB();
			database.init(function() {
				boot.helper.db = database;
				sync.dbServer = boot.helper.db.server;
				if (callback) { callback() }
			});
		});
	},

	// Logout process
	logout: function(needsToClearDatabase, needsToInitNewDatabase)
	{
		var self = this;

		// Send a logged out action manually via the api request helper method
		// as we cannot add this to the actions anymore, it's to late
		sync.apiRequest("send", {
		    actions: JSON.stringify([{action: "logged_out"}])
		});
		
		// Clean local settings
		loggedInUser.logout();
		removeSetting("syncedSince");
		removeSetting("fetchingFinished");
		removeSetting("unconfirmedShares");
		removeSetting("account");
		removeSetting("lastQueueView");
		removeSetting("hasFetched");
		removeSetting("needsToStartFetching");
		removeSetting("a_styles");
		removeSetting("loadedItems");
		removeSetting("sawEmptyNotice");
		removeSetting("GSFStatus");
		boot.GSFStatus = {};
		boot.UserNotices = {};

		// additional changes to account for one window policy (can log in as other user on same session)
		if (typeof openPopover == 'object')
		{	
			openPopover.hideOpenPopover();
		}
		boot.pages.queue.items = [];
		boot.pages.queue.itemsByID = {};
		if (typeof boot.pages.queue.queueList != 'undefined')
		{
			boot.pages.queue.queueList.html('');
			boot.pages.queue.searchField.val('');
			if ($('.gsf_device_reminder_container').length)
			{
				$('.gsf_device_reminder_container').remove();
			}
		}
		if (typeof boot.pages.queue.addMenu != 'undefined')
		{
			boot.pages.queue.addMenu.object.remove();
			boot.pages.queue.addMenu = undefined;
		}
		if (typeof boot.pages.queue.emptyCell != 'undefined' && boot.pages.queue.emptyCell.length)
		{
			boot.pages.queue.emptyCell.remove();
			boot.pages.queue.emptyCell = undefined;
		}
		if (typeof boot.pages.queue.notificationRow != 'undefined')
		{
			boot.pages.queue.notificationRow.remove();
			boot.pages.queue.notificationRow = undefined;
		}

		// Cancel sync
		sync.cancelSync();

		// Clear cache
		assetCache.cancelAllRequests();
		assetCache.clearCache();

		// Remove all settings
		chrome.storage.local.get(null, function(all) {
			for (var key in all) {
				if (key != 'UserNotices') {
		  			removeSetting(key);
		  		}
		  	}
		});


		var showLoginScreen = function () {
			LoginPage.init();
		};


		if (typeof needsToClearDatabase !== 'undefined' && needsToClearDatabase) {
			// Clear the database before showing the login screen
			this.helper.db.clear(function () {
				showLoginScreen();
			});
			return;
		}

		if (typeof needsToInitNewDatabase !== 'undefined' && needsToInitNewDatabase) {
			boot.initNewDatabase(function() {
				showLoginScreen();
			});
			return;
		}

		showLoginScreen();


	},

	goBack : function()
	{
		History.back();
	}
};

// All starts with that:
var loggedInUser;
var database;
var sync;
var assetCache;
var backgroundPage;

// Init boot here as we want to add pages and helper to the boot object while
// loading other modules like queue or reader
var boot = new Boot();

$(document).ready(function()
{

	// Initialize one object after another
	// Start with the backgroundpage and cache it for faster access
	chrome.runtime.getBackgroundPage(function(bP) {
		backgroundPage = bP;

		// Next with the user
		loggedInUser = new User(function(){

			// Next is the database
			database = new DB();
			database.init(function() {
				boot.helper.db = database;

				// Go further with the sync
				sync = new Sync();
				boot.helper.sync = sync;

				// Following with the AssetCache
				assetCache = new AssetCache();
				assetCache.init(function() {
					boot.helper.assetCache = assetCache;

					if (backgroundPage.checkIfUserIsLoggedInAndLogoutIf &&
						loggedInUser.isLoggedIn())
					{
						backgroundPage.checkIfUserIsLoggedInAndLogoutIf = false;
						boot.logout(false, true);
						return;
					}

					// On startup check if we have to add opened and closed app
					// actions to the actions queue. The opened and closed app actions
					// are added from main.js as we cannot get a closed window
					// event in boot.js ...
					chrome.storage.local.get(['openedAppActions', 'closedAppActions'], function(retrievedData) {
						var openedAppActions = retrievedData.openedAppActions ? JSON.parse(retrievedData.openedAppActions) : [];
						var closedAppActions = retrievedData.closedAppActions ? JSON.parse(retrievedData.closedAppActions) : [];
						var openedClosedAppActions = openedAppActions.concat(closedAppActions);
						$.each(openedClosedAppActions, function(idx, action) {
							sync.sendAction(action);
						});

						// Clean both settings
						chrome.storage.local.remove(['openedAppActions', 'closedAppActions']);
					});

					// logic to show login screen or not
					if (!loggedInUser.isLoggedIn())
					{
						LoginPage.init();
						return;
					}

					// Start the boot
					boot.init();
				});
			});
		});

	});
});


History.stateChangedCallback = function () {
    var state = History.getState();
    if (!boot.pushing) {
		boot.loadStateFromUrl( state.url );
	}
};

/* global db, logger */

function DB()
{
    this.ready = false;
}

DB.prototype =
{
    init: function(readyCallback)
    {
        var self = this;

        db.open({
            server: 'PackagedAppPocket',
            version: 1,
            schema: {
                items: {
                    key: { keyPath: 'local_item_id' , autoIncrement: true },
                    indexes: {
                        itemIdIndex: { key:"item_id" },
                        timeAddedIndex: { key:"time_added" },
                        titleIndex: {key: "resolved_title"},
                        urlIndex: {key: "resolved_url"},
                        hasPendingShareIndex: {key: "has_pending_share"}
                    }
                },
                friends: {
                    key: { keyPath: 'local_friend_id' , autoIncrement: true },
                    indexes: {
                          friendsIdIndex: { key:"friend_id" }
                    }
                },
                ac_emails: {
                    key: { keyPath: 'email' , autoIncrement: false }
                },
                tags : {
                    key: { keyPath: 'local_tag_id', autoIncrement: true },
                    indexes: {
                        tagIndex: {key: "tag"}
                    }
                },
                actionsQueue : {
                    key: { keyPath: 'local_action_id', autoIncrement: true }
                }
            }
        })
        .done(function(s) {
            self.server = s;
            self.ready = true;
            if (readyCallback) {
                readyCallback();
            }
        })
        .fail(function(e) {
            logger.log(e);
        });
    },

    deleteDatabase: function(doneCallback)
    {
        // Close the server
        this.server.close();

        // Delete the database
        db.deleteDatabase('PackagedAppPocket').done(function () {
            doneCallback();
        });
    },

    // Clear all databases
    clear: function(doneCallback)
    {
        var databasesToClear = ['items', 'friends', 'ac_emails', 'tags', 'actionsQueue'];

        var dbServer = this.server;
        var numberOfDatabasesToClear = databasesToClear.length;
        var countDatabasesCleared = 0;
        databasesToClear.forEach(function(dbName) {
            dbServer[dbName].clear().done(function() {
                countDatabasesCleared += 1;
                if (numberOfDatabasesToClear === countDatabasesCleared) {
                    doneCallback();
                }
            });
        });
    }
};
var DataAdapter = Class.extend(
{
	//////// public

	init : function()
	{
		this.sendingCount = 0;
		this.pendingGets = [];
		this.requests = {};
	},

	// making a change to the datastore
	send : function( action, o )
	{
		var rId = this.rId(action, true);
		this.sendingCount++;
		this.requests[ rId ] =	this.makeRequest( rId, action, o, false );
	},

	// getting something from the datastore
	get : function( action, o )
	{
		var rId = this.rId(action);

		// cancel any previous requests for the same type of request (ex a get of a list)
		if (this.requests[ rId ])
		{
			this.requests[ rId ].abort();
			this.requests[ rId ] = false;
		}

		// wait for any pending changes
		if (this.sendingCount > 0)
			this.pendingGets.push( {action: action, o: o} );

		// go ahead and send the request
		else
			this.requests[ rId ] = this.makeRequest( rId, action, o, true );
	},

	// Reset all pending gets
	reset : function ()
	{
		$.each(this.pendingGets, function (idx, get) {
			get.abort();
		});

		this.sendingCount = 0;
		this.pendingGets = [];
		this.requests = {};
	},


	/////// private

	// the function that actually makes the request, this should be modified per app but should always call the same callbacks inside this object
	makeRequest : function( rId, action, o, isGet )
	{
		return new RequestPA({

			// request details
			rId			: rId,
			isGet		: !!isGet,

			// data
			action		: action,
			o			: o,

			//callbacks
			delegate	: this
		});
	},


	// callbacks

	success : function(response, request)
	{
		// make sure this request wasn't cancelled
		if (this.requests[request.rId])
		{
			// look for top-level errors
			if (response.error && response.error == 1)
			{
				boot.logout(true, false);
				return;
			}

			// send callback
			if (request.o.delegate)
				request.o.delegate[request.o.doneSelector].call(request.o.delegate, response, request.o);
		}
	},

	error : function(request)
	{
		// make sure this request wasn't cancelled
		if (this.requests[request.rId])
		{
			// send callback
			if (request.o.delegate && request.o.errorSelector)
				request.o.delegate[request.o.errorSelector].call(request.o.delegate, request.o);
			else
				boot.showErrorNotification("Uh oh. There was an unexpected error when making a request to the server. Please try reloading the page.");
		}
	},

	always : function(request)
	{
		// remove request
		this.requests[request.rId] = false;

		// steps to take if this was a send action
		if (!request.isGet)
		{
			// adjust counts
			this.sendingCount--;

			// start gets that were waiting
			if (this.sendingCount === 0)
			{
				var gets = $.extend(true, [], this.pendingGets);
				this.pendingGets = [];

				if (gets.length)
					for(var i=0; i<gets.length; i++)
						this.get( gets[i].action, gets[i].o );
			}
		}
	},

	//

	rId : function(action, rand)
	{
		return action + (rand ? '|' + Math.random() : '');
	}
});


// Request Base Classes

RequestActions = {
	get : "get",
	getShares : "getShares",
	getArticle : "getArticle",
	getTags : "getTags",
	updateTags : "updateTags",
	savePosition : "savePosition",
	itemAction : "itemAction",
	shareTo : "shareTo",
	getWithDataParameter : "getWithDataParameter",
	bulkEdit : "bulkEdit",
	opened : "open"
};

var RequestCore = Class.extend(
{
	init : function(params)
	{
		var self = this;

		this.rId		= params.rId;
		this.isGet		= params.isGet;
		this.delegate	= params.delegate;
		this.action		= params.action;
		this.data		= params.o.data;
		this.dataType	= params.o.dataType || 'json';
		this.o			= params.o;

		this.send();
	},

	// cancels the request
	abort : function()
	{
	},

	// called when the request succeeded
	success : function( response )
	{
		if (this.delegate)
			this.delegate.success(response, this);
	},

	// called when the request failed
	error : function( error )
	{
		if (error != 'abort')
		{
			if (this.delegate)
				this.delegate.error(this);
		}
	},

	// always called regardless if it failed or succeeded
	always : function( )
	{
		if (this.delegate)
			this.delegate.always(this);
	}

});
/* global RequestCore, RequestActions, logger, sync, boot, assetCache, getSetting, setSetting, Parallel, PKTBaseURL, isChromePackagedApp */

var RequestPA = RequestCore.extend(
{
    init: function(params)
    {
        this.dbServer = boot.helper.db.server;
        this.cancelled = false;

        return this._super(params);
    },

    /*
    the function that actually makes the request, this should be modified per app
    but should always call the same callbacks inside this object
    ---
    instance variables:
    rId = an id for the request
    action = the action to perform
    data = the parameters for the action
    dataType = [json,html]
    isGet = true the requests wants data, false if the request is meant to save data
    ---
    Be sure to call success, error, and complete callbacks
    */
    send: function()
    {
        var self = this;

        if (this.dbServer.isClosed()) {
            return;
        }

        // Check if we actually got any data
        if (!this.data) {
            this.data = {};
        }

        logger.log("Send Action: " + this.action);

        // Get variables we need to make the request from the given data
        var item = this.data.item;
        var localItemId = (item && item.local_item_id) ? item.local_item_id : undefined;
        var itemId = this.data.itemId;
        var state = this.data.state;

        // Remove item from the data to prevent sending it in the api request
        delete this.data["item"];

        /**
         * Handle get action. If in the queue get the item list from the database
         * else get it from the API for favorite and archive
         */
        if (this.action === RequestActions.get) {
            var sort = this.data.sort;
            var offset = this.data.offset;
            var count = this.data.count;
            var contentType = this.data.contentType;
            var tag = this.data.tag;
            var search = this.data.search;

            if (state === "queue") {
                // We only have items from the queue in the database

                // Set the index for sorting
                var index = "timeAddedIndex";
                if (sort === "title") {
                    index = "titleIndex";
                }
                else if (sort === "site") {
                    index = "urlIndex";
                }

                // Query that executes the items call
                var query = this.dbServer.items.query(index).all();

                // Reverse the data if the sort is newest
                if (sort === "newest") {
                    query.desc();
                }

                // Function that is responsible for filtering
                var filter = function(item) {
                    // Filter items array
                    var itemInResult = true;

                    // Filter contentType
                    if (contentType) {
                        if (contentType === 'article') {
                            itemInResult = (parseInt(item.is_article, 10) === 1);
                        }
                        else if (contentType === 'video') {
                            itemInResult = (parseInt(item.has_video, 10) !== 0);
                        }
                        else if (contentType === 'image') {
                            itemInResult = (parseInt(item.has_image, 10) === 2);
                        }
                    }

                    // Only get items that have an item id higher than one
                    // Only get unread items, we can have also have items that
                    // are not unread in the database if they have pending shares
                    if (parseInt(item.item_id, 10) === 0 || parseInt(item.status, 10) !== 0) {
                        itemInResult = false;
                    }

                    // Filter for tags if a tag is given
                    if (tag) {
                        if (tag == '_untagged_') {
                            if (item.tags) {
                                itemInResult = false;
                            }
                        }
                        else {
                            if (item.tags) {
                                var tags = Object.keys(item.tags);
                                itemInResult = ((tags.indexOf(tag) > -1) && itemInResult);
                            }
                            else {
                                itemInResult = false;
                            }
                        }
                    }

                    // Filter search if a search is given
                    if (search) {
                        search = search.toLowerCase();
                        var searchInTitle = (item.resolved_url.toLowerCase().indexOf(search) !== -1);
                        var searchInURL = (item.resolved_title.toLowerCase().indexOf(search) !== -1);
                        var searchInGivenURL = (item.given_url.toLowerCase().indexOf(search) !== -1);
                        itemInResult = ((searchInTitle || searchInURL || searchInGivenURL) && itemInResult);
                    }

                    return itemInResult;
                };

                // Get all items with custom filter, offset and count of items
                query.filter(filter).skip(offset).take(count).execute().done(function(items) {

                    // Get all friends
                    self.dbServer.friends.query('friendsIdIndex').all().execute().done(function(friends) {

                        // Object we passtrough to the parallel library
                        var parallelObject = {
                            items: items,
                            friends: friends,
                            index: offset
                        };

                        // Push processing of items to a web worker
                        var p = new Parallel(parallelObject);
                        p.spawn(function(parallelObject) {

                             // Assign each item a sort_id
                             var index = parallelObject.index;
                             var items = parallelObject.items;
                             items.forEach(function(item) {
                                 item.sort_id = index;
                                 index += 1;
                             });

                            // Process friends
                            var friends = parallelObject.friends;
                            var friendsForList = {};
                            friends.forEach(function(friend) {
                                friendsForList[friend.friend_id] = friend;
                            });

                            return {list: items, friends: friendsForList};
                        })
                        .then(function(returnObject) {
                            self.success(returnObject);
                            self.always();
                        });
                   });
                });

                return;
            }

            // In the favorite and archive state just get the list from the API
            this.url = this.apiURL();
            this.data.tags = 1;
            this.data.image = 1;
            this.data.images = 1;
            this.data.videos = 1;
            this.data.shares = 1;
            this.data.positions = 1;

            this.makeAPIRequest();

            return;
        }

        /**
         * Get shares from the database
         */
        else if (this.action === RequestActions.getShares) {
            // Get all friends from the database
            self.dbServer.friends.query('friendsIdIndex').all().execute().done(function (friends) {

                // Get all items that has pending shares and sorted by time added
                self.dbServer.items.query('hasPendingShareIndex', 'timeAddedIndex')
                                   .only('1').execute().done(function(items) {
                    // Object we passthrough to the parallel library
                    var parallelObject = {
                        friends: friends,
                        items: items
                    };

                    // Push processing finding of not added shares to a web worker
                    var p = new Parallel(parallelObject);
                    p.spawn(function(parallelObject) {
                        // Check if we actually got any items from the database
                        var items = parallelObject.items || [];
                        var friends = parallelObject.friends || {};

                        // Create object with mapping friends to an id
                        // for faster search if we create the shares response
                        var friendsById = {};
                        for (var key in friends) {
                            var friend = friends[key];
                            friendsById[friend.friend_id] = friend;
                        }

                        // Create shares array that holds all shares that
                        // are not accepted yet
                        var shares = [];
                        items.forEach(function(item) {
                            if (item.shares) {
                                var itemShares = item.shares;
                                for (var key in itemShares) {
                                    var share = itemShares[key];
                                    if (parseInt(share.status) === 0) {
                                        share.item = item;
                                        share.from_friend = friendsById[share.from_friend_id];
                                        shares.push(share);
                                    }
                                }
                            }
                        });

                        // Sort the shares from new to old
                        shares.sort(function(share1, share2) {
                            return share1.time_shared < share2.time_shared ? 1 : -1;
                        });

                        return shares;

                    })
                    .then(function(shares) {
                        // Add unconfirmed shares to the callback
                        getSetting("unconfirmedShares", function(fetchedData) {
                            var unconfirmedShares = fetchedData.unconfirmedShares ? JSON.parse(fetchedData.unconfirmedShares) : {};
                            self.success({notifications: shares, unconfirmed_shares: unconfirmedShares});
                            self.always();
                        });
                    });
                });
            });

            return;
        }

        /**
         *  Get an article for a url or for an item. If an url is given use this
         *  url to get the article from the API else if no url is given but an item
         *  use the item and get the article for this item. Furthermore if this item
         *  is unread cache the article for the item for later usage
         */
        else if (this.action == RequestActions.getArticle) {
            // If we passthrough an url we use this to get the article else we
            // try to get the url from a given object
            var articleURL = this.data.url || item.resolved_url || item.given_url;
            if (typeof item !== 'undefined' && parseInt(item.status, 10) === 0) {
                assetCache.loadArticle(articleURL, function(article) {
                    self.success({article: article});
                    self.always();
                },
                function(error) {
                    self.error(error);
                });

                return;
            }

            this.url = this.articleURL(articleURL);
            this.makeAPIRequest();

            return;
        }

        /**
         *  Get all tags from the database
         */
        else if (this.action == RequestActions.getTags) {
            // Use the database all the time to get tags
            this.dbServer.tags.query('tagIndex').all().execute().done(function (data) {
                var tags = $.map(data, function(tag, idx) {
                    return tag.tag;
                });
                self.success(tags);
                self.always();
            })
            .fail(self.error.bind(self));

            return;
        }

        /**
         * Update tags in the database. Curerntly are tags_replace and tags_clear
         * action supported
         */
        else if (this.action == RequestActions.updateTags) {
            // Thare are two type of update tags action supported yet:
            // - tags_replace
            // - tags_clear
            var tagType = self.data.tagType;
            var tags = (tagType === 'tags_clear') ? [] : this.data.tags;

            // Add the action to the action_queue
            var addUpdateTagActionToQueue = function () {
                self.addActionToQueueShouldSyncAndFinish({
                    item_id: itemId,
                    local_item_id: localItemId,
                    action: 'tags_replace',
                    tags: tags
                }, true);
            };

            // Check if the item we want to update the tags is in the database
            // if the item is in the database a local item id exists else not
            if (typeof localItemId === 'undefined') {
                addUpdateTagActionToQueue();
                return;
            }

            // Replace the tags from the item with the new tags in the db
            self.dbServer.items.get(localItemId).done(function (fetchedItem) {
                if (tagType === 'tags_replace') {
                    var tagsArray = [];
                    $.each(tags, function(idx, tag) {
                        tagsArray.push({id: idx, tag: tag});
                    });
                    fetchedItem.tags = tagsArray;
                }
                else if (tagType === 'tags_clear') {
                    delete fetchedItem.tags;
                }

                self.dbServer.items.update(fetchedItem).done(function () {
                    addUpdateTagActionToQueue();
                })
                .fail(function(error) {
                    logger.log("Error updating item after favorite" + error);
                });
            })
            .fail(function() {
                logger.log("Error get item from db in dataRequestPA");
            });
        }

        /**
         * Take an action on an item
         */
        else if (this.action == RequestActions.itemAction) {
            // Get action name
            var dataAction = this.data.action,
                isOn = this.data['on'],
                actionName,
                actionObject;

            /**
             * Handle share actions
             */
            if (dataAction == "share_ignored" || dataAction == "share_added") {
                var shareId = this.data.share_id;

                actionObject = {
                    item_id: itemId,
                    local_item_id: localItemId,
                    action: dataAction,
                    share_id: shareId
                };

                // Finish callback adds the action object to the actions queue
                // database to sync the changes in case we are offline
                var addItemToActionQueue = function () {
                    self.addActionToQueueShouldSyncAndFinish(actionObject, true);
                };

                // Update pendings shares in the database
                if (dataAction === "share_added") {
                    // Update has pending shares value, search for a share that
                    // is still pending, if no one is found there are no pending
                    // share anymore so assign '0' to hasPendingShares else '1'
                    var hasPendingShare = '0';
                    if (item.shares) {
                        $.each(item.shares, function (shareID, share) {
                            if (parseInt(share.status, 10) === 0) {
                                hasPendingShare = '1';
                                return false; // At least one found so break out of the loop
                            }
                        });
                    }

                    // Update item values before adding it to the database
                    item.status = '0';
                    item.time_added = (Math.round(new Date().getTime() / 1000)).toString();
                    item.has_pending_share = hasPendingShare;

                    // Update the share information of the shared notification in the database
                    self.dbServer.items.get(localItemId).done(function (fetchedItem) {
                        // Update shares, time_added, has_pending_share and status
                        // of the item
                        fetchedItem.shares = item.shares;
                        fetchedItem.status = item.status;
                        fetchedItem.time_added = item.time_added;
                        fetchedItem.has_pending_share = hasPendingShare;

                        self.dbServer.items.update(fetchedItem).done(function () {
                            addItemToActionQueue();
                        })
                        .fail(self.error.bind(self));
                    })
                    .fail(self.error.bind(self));
                }
                else if (dataAction === "share_ignored") {
                    // User ignored notification just update the item in the database
                    // and add the action to the the queue
                    self.dbServer.items.get(localItemId).done(function(fetchedItem) {
                        // Update shares for the object we got from the database
                        fetchedItem.shares = item.shares;

                        // Update item in the database
                        self.dbServer.items.update(fetchedItem).done(function () {
                            addItemToActionQueue();
                        })
                        .fail(self.error.bind(self));
                    })
                    .fail(self.error.bind(self));
                }
                return;
            }

            /**
             * Handle publisher program tracking actions
             */
            else if (dataAction === "pmc" || dataAction === "pmv") {
                // Just add the action to the action queue but not trigger the
                // sync, it's not important to sync the changes immediately
                actionObject = {
                    action: dataAction,
                    pkta: stripslashes(self.data.pkta)
                };

                if (dataAction === "pmc") {
                    actionObject.click_url = stripslashes(self.data.click_url);
                }

                self.addActionToQueueShouldSyncAndFinish(actionObject, false);

                return;
            }

            /**
             * Handle archive, readd, favorite, unfavorite action below
             */
            else if (dataAction === "mark") {
                // Archive button action
                actionName = isOn ? 'archive' : 'readd' ;
            }
            else if (dataAction=== "favorite") {
                // Favorite / Unfavorite button action
                actionName = isOn ? 'favorite' : 'unfavorite';
            }
            else if (dataAction=== "delete") {
                // Delete button action
                actionName = 'delete';
            }

            /**
             * Handle readd action
             */
            if (actionName === 'readd') {
                // Add the item to the database
                item.time_added = (Math.round(new Date().getTime() / 1000)).toString();
                item.time_added_to_device = (Math.round(new Date().getTime() / 1000)).toString();
                item.is_offline = '0';
                delete item.sort_id;
                item.status = "0"; // Set the status to 0 as we add it again

                self.dbServer.items.update(item).done(function() {
                    // Get newly added item from the database
                    // If the item was not locally we have to get the new information
                    // from the database to have the local_item_id in the item object
                    self.dbServer.items.query('itemIdIndex').only(item.item_id)
                                       .execute().done(function (newAddedItems) {
                        var newAddedItem = newAddedItems[0];

                        // Send action to action queue
                        self.addActionToQueueShouldSyncAndFinish({
                            item_id: newAddedItem.item_id,
                            local_item_id: newAddedItem.local_item_id,
                            action: actionName
                        }, true);
                    });
                })
                .fail(self.error.bind(self))

                return;
            }

            /**
             * Handle archive, delete, favorite and unfavorite actions
             */

            // Finish callback adds the action object to the actions queue
            // database to sync the changes in case we are offline
            var finishedCallback = function (actionName) {
                self.addActionToQueueShouldSyncAndFinish({
                    item_id: itemId,
                    local_item_id: localItemId,
                    action: actionName
                }, true);
            };

            // Check if the item is locally available so if it's in the database
            if (typeof localItemId !== 'undefined') {
                // If the item is unread, we update the item in the database and
                // then send the changes to the server
                if (actionName === 'archive' || actionName === 'delete') {
                    // If we have pending shares we will not delete the item from
                    // the database as we need it in the inbox
                    if (parseInt(item.has_pending_share, 10) === 1) {
                        finishedCallback(actionName);
                        return;
                    }

                    // Remove item from database as it was archived or deleted
                    self.dbServer.items.remove(localItemId).done(function (fetchedItem) {
                        assetCache.removeAssetsForItem(item);
                        finishedCallback(actionName);
                    })
                    .fail(function (error) {
                        logger.log("Error deleting object from database");
                        self.error(error);
                    });
                }
                else if (actionName === 'favorite' || actionName === 'unfavorite') {
                    // Update item in the database as favorited / unfavorited
                    self.dbServer.items.get(localItemId).done(function (fetchedItem) {
                        fetchedItem.favorite = isOn ? "1" : "0";
                        self.dbServer.items.update(fetchedItem).done(function () {
                            finishedCallback(actionName);
                        })
                        .fail(self.error.bind(self));
                    })
                    .fail(self.error.bind(self));
                }

                return;
            }

            // Add action to the action_queue, that are all actions that
            // does not effect the database and also the readd action
            finishedCallback(actionName);
        }

        /**
         * Save position for item
         */
        else if (this.action == RequestActions.savePosition) {
            // Remove itemId property as we don't need it anymore
            delete this.data.itemId;

            // Change position of item in the queue
            var newPositionsObject = item.positions ? item.positions : {};
            var newTextPositionObject = $.extend(true, {}, this.data);
            newPositionsObject[1] = newTextPositionObject;
            item.positions = newPositionsObject;

            var addSavePositionActionToQueue = function () {
                var actionObject = $.extend(true, {}, newTextPositionObject);
                actionObject.action = "scrolled";

                self.addActionToQueueShouldSyncAndFinish(actionObject, true);
            };

            // Check if the item has no local item id. If the item does not
            // have a local item id the item is not in the database. In that
            // case just add the action to the queue and do nothing in the db
            if (typeof localItemId === 'undefined') {
                addSavePositionActionToQueue();
                return;
            }

            // Get the item from the database
            self.dbServer.items.get(localItemId).done(function (fetchedItem) {
                // If we don't have the item in the database
                // just send the action to the API it's likely that it's a read article
                if (typeof fetchedItem === "undefined") {
                    addSavePositionActionToQueue();
                    return;
                }

                // Update positions property of the item in the database
                fetchedItem.positions = newPositionsObject;

                self.dbServer.items.update(fetchedItem).done(function () {
                    addSavePositionActionToQueue();
                })
                .fail(self.error.bind(self));
            });
        }

        /**
         * Handle share item to other Pocket user
         */
        else if (this.action == RequestActions.shareTo) {
            // Create action object
            actionObject = {
                action: "shared_to",
                to: self.data.to
            };

            // Add item id or url. We have to add at least one!
            if (typeof itemId !== 'undefined') {
                actionObject.item_id = itemId;
            }

            if (typeof self.data.url !== 'undefined') {
                actionObject.url = self.data.url;
            }

            // Add comment to action object
            var comment = self.data.comment;
            if (typeof comment !== 'undefined' && comment !== "") {
                actionObject.comment = comment;
            }

            // Add share action to action queue
            self.addActionToQueueShouldSyncAndFinish(actionObject, true);

            // Inform event listener
            this.success({});
            this.always();
        }

        /**
         * Handle open tracking
         */
        else if (this.action == RequestActions.opened) {
            // The openType is the action name
            var openType = this.data.openType;

            // Create the action object for the opened action
            actionObject = {
                action: openType,
                item_id: itemId,
                local_item_id: localItemId
            };

            self.addActionToQueueShouldSyncAndFinish(actionObject, false);

            // Inform event listener
            this.success({});
            this.always();
        }

        /**
         * Make a get request with parameter
         */
        else if (this.action == RequestActions.getWithDataParameter) {
            this.url = this.apiURL();
            this.makeAPIRequest();
        }
    },

    /**
     * Use information from the request and fire the api request
     */
    makeAPIRequest: function()
    {
        var self = this;

        logger.log("Send Data: " + JSON.stringify(this.data));

        // Forward API call to central sync api request method
        var syncHelper = boot.helper.sync;
        var ajaxRequest = syncHelper.ajaxRequest(this.url, this.data, this.dataType, 'POST')
                                    .done(function(data, textStatus, jqXHR) {
            self.success(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            if (textStatus != 'abort') {
                self.error(textStatus);
            }
        })
        .always(this.always.bind(this));
    },

    // cancels the request
    /**
     * Cancel the request
     */
    abort: function()
    {
        this.cancelled = true;

        // cancel the ajax call
        if (this.ajaxRequest) {
            this.ajaxRequest.abort();
        }
    },

    /**
     * Helper method to add an action to the action queue and sync immediately
     * if necessary
     * @param  {object} actionObject Action object to send to the API
     * @param  {Boolean} shouldSync  State if we want to send the changes immediately
     */
    addActionToQueueShouldSyncAndFinish: function(actionObject, shouldSync)
    {
        var self = this;

        // Add timestamp for this action
        actionObject.time = "" + Math.round(+new Date() / 1000);

        // Add actions to actions queue and send the changes
        var action = {action: actionObject};
        this.dbServer.actionsQueue.add(action).done(function (action) {
            if (shouldSync) {
                boot.helper.sync.sendChanges();
            }

            self.success({});
            self.always();
        })
        .fail(self.error.bind(self));
    },

    /**
     * Get the endpoint URLs
     * @return {string} endpoint URL
     */
    apiURL: function()
    {
        if (this.action === "get" || this.action === "getWithDataParameter") {
            return PKTBaseURL + "/get";
        }
        else {
            return PKTBaseURL + "/send";
        }

        return "";
    },

    /**
     * Returns the the api method for the given action
     * @return {string} Api method
     */
    apiMethod: function()
    {
        if (this.action === "get" || this.action === "getWithDataParameter") {
            return "get";
        }
        else {
            return "send";
        }

        return "";
    },

    /**
     * Get url for the article, if we are in the packaged app we don't want to include
     * include videos directly in the articles, we add this manually
     */

    articleURL: function(itemURL)
    {
        var url = 'http://text.readitlater.com/v3beta/text?getItem=1&promptSubs=1&formfactor=mac&images=2&output=json&msg=1';
        if (!isChromePackagedApp()) {
            // Include videos
            url += '&videos=1';
        }
        url += ('&url=' + itemURL);
        return url;
    }

    /*
    things you want to call

    success : function( response ),

    error : function( errorMessage ),

    always : function()
    */
});
/* global boot, queue */
function Reader()
{
	this.topY = 120;

	this.nav = 'reader';
	this.styleMenu = false;

	var ua = navigator.userAgent;
	var isFirefoxOrIE = (ua.match(/Firefox/) || ua.match(/IE/));
	this.yHitMethod = isFirefoxOrIE ? 'screen' : 'page';

	this.pendingPosition = undefined;
}
Reader.prototype =
{
	init : function()
	{
		var self = this;
		this.data = queue.data;


		/**
		 * Nav
		 */
		this.navigationItem = $(
			'<div class="toolbar_reader navigationItem wrapper">' +
				'<ul class="icons leftItem">' +
					'<li id="pagenav_back" class="simple"><a title="Go Back" data-intro="Go back" data-position="bottom" href="#">Go Back</a></li>' +
					'<li id="pagenav_mark" class="simple"><a title="Archive" data-intro="Archive" data-position="bottomlower" href="#">Archive</a></li>' +
					'<li id="pagenav_add" class="simple"><a title="Add Item to List" data-intro="Add Item to List" data-position="bottom" href="#">Add Item to List</a></li>' +
					'<li id="pagenav_delete" class="simple"><a title="Delete" data-intro="Delete" data-position="bottom" href="#">Delete</a></li>' +
					'<li id="pagenav_favorite" class="simple"><a title="Favorite" data-intro="Favorite" data-position="bottomlower" href="#">Favorite</a></li>' +
				'</ul>' +
				'<ul class="icons centerItem clearfix">' +
					'<li id="pagenav_articleview"><a title="Article View" data-intro="Article View" data-position="bottom" href="#">Article View</a></li>' +
					'<li id="pagenav_webview"><a title="Web View" data-intro="Web View" data-position="bottomlower" href="#">Web View</a></li>' +
				'</ul>' +
				'<ul class="icons rightItem">' +
					'<li id="pagenav_share"><a title="Share" data-intro="Share" data-position="bottom" href="#">Share</a></li>' +
					'<li id="pagenav_style"><a title="Text Options" data-intro="Text options" data-position="bottom" href="#">Text Options</a></li>' +
				'</ul>' +
			'</div>'
		);
		$('#page .pkt-nav').append(this.navigationItem);


		/**
		 * Style menu
		 */
		this.styleMenuContent = $('<div id="subnav" class="pkt-nav"></div>');
		this.styleMenuContent.append(
			'<ul class="icons clearfix">' +
			'<li id="submenu_font" class="nodent"><a title="Change Font" href="#">Change Font</a></li>' +
			'<li id="submenu_font_down" class="nodent"><a title="Decrease Font Size" href="#">Decrease Font Size</a></li>' +
			'<li id="submenu_font_up" class="nodent"><a title="Increase Font Size" href="#">Increase Font Size</a></li>' +
			'<li id="submenu_light" class="nodent"><a title="Change Light Mode" href="#">Change Light Mode</a></li>' +
			'</ul>'
		);

		this.styleMenuContent.find('#submenu_font a').click(function(e) { e.preventDefault(); if (!$('#subnav').hasClass('inactive')) { self.toggleFont(); } });
		this.styleMenuContent.find('#submenu_font_down a').click(function(e) { e.preventDefault(); if (!$('#subnav').hasClass('inactive')) { self.fontInc(-1); } });
		this.styleMenuContent.find('#submenu_font_up a').click(function(e) { e.preventDefault(); if (!$('#subnav').hasClass('inactive')) { self.fontInc(1); } });
		this.styleMenuContent.find('#submenu_light a').click(function(e) { e.preventDefault(); if (!$('#subnav').hasClass('inactive')) { self.toggleSkin(); } });


		/**
		 * Page
		 */
		this.page = $(
			'<div id="page_reader" class="wrapper articleview"></div>'
		);
		$('#content').append(this.page);

		// Create article view, web view
		this.articleview = $('<div class="reader_content_wrapper"><div class="reader_content"></div></div>');
		this.page.append(this.articleview);
		this.initWebView();

		this.content = this.page.find('.reader_content');


		/**
		 * Add events
		 */

		// Handle navigations within the app
		$('#pagenav_back a').click(function(e) {
			if (boot.GSFStatus.active && $('.tooltip-reader').is(':visible'))
			{
				if (typeof openPopover == 'object')
				{
					openPopover.hideOpenPopover();
				}
			}
			e.preventDefault();
			self.goBack();
		});

		// Handle actions within the toolbar
		$('#pagenav_mark a').click( function(e){ self.actionToggle('mark'); e.preventDefault();} );
		$('#pagenav_add a').click( function(e){ self.addURLToPocket(); e.preventDefault();} );
		$('#pagenav_delete a').click( function(e){ self.confirmDelete(); e.preventDefault();} );
		$('#pagenav_favorite a').click( function(e){ self.actionToggle('favorite'); e.preventDefault();} );
		$('#pagenav_articleview a').click( function(e) { self.switchToArticleView(); e.preventDefault();});
		$('#pagenav_webview a').click( function(e) { self.switchToWebView(); e.preventDefault();});
		$('#pagenav_share a').click( function(e){ self.showShareMenu(this); e.preventDefault();} );
		$('#pagenav_style a').click( function(e){ self.showStyleMenu(this); e.preventDefault();} );

		// Handle resize of window
		$(window).resize(function() {
			if (typeof self.webview == 'object') {
				self.webview.css('height', $(window).height() - $('#page .pkt-nav').height() - $('#PKT_header').height() + 'px');
			}
		});

		// Handle item updates from the syncing component
		$(document).on('itemNeedsUpdate', function(e, itemAction) {
			var action = itemAction.action,
				item = itemAction.item,
				updateDom = itemAction.updateDom;


			// Check if the item we have to update is the actual loaded item
			if (typeof item !== 'undefined' && typeof self.item !== 'undefined' &&
				self.item.item_id === item.item_id)
			{
				self.item = item;

				if (updateDom) {
					// Set the selected toolbar item
					$('#pagenav_favorite').toggleClass('selected', (item.favorite == '1'));

					// Handle archives and deletes in the reader
					if (action == 'mark' || action == 'delete') {
						// switch view
						setTimeout(self.goBackToQueue, 0);
					}
				}
			}
		});

		// Mark the reader as inited
		this.inited = true;
	},


	/**
	 * Handle navigation within the reader
	 */

	goBackToQueue: function()
	{
		if (queue.inited) {
			boot.goBack();
		}
		else {
			boot.loadStateFromUrl('/a/');
		}
		sync.sendAction({action:'left_item'}, false);
	},

	goBack: function()
	{
		this.viewqueue = this.viewqueue || [];

		if (this.viewqueue && this.viewqueue.length > 1) {
			// Remove the last item to load the second last item
			this.viewqueue.pop();

			// We don't go forward state
			this.viewnotmovingforward = true;

			// If only one element is in the viewqueue we know that we are
			// at the first article and we don't want to show the add button
			if (this.viewqueue.length === 1) {
				$('.toolbar_reader').removeClass('toolbar_reader_addmode');
			}

			// Get the destination information
			var destination = this.viewqueue[this.viewqueue.length-1];

			// If we have an item in the queue use this as the current loaded item
			if (destination.item) {
				this.item = destination.item;
				this.itemId = destination.item.item_id;
			}
			else {
				this.item = undefined;
				this.itemId = undefined;
			}

			// Check what we have to load the article or web view
			if (destination.currentview === 'web') {
				if ($('#pagenav_webview').hasClass('selected')) {
					this.webview.attr('src', destination.url);
				}
				else {
					this.switchToWebView();
				}
			}
			else {
				this.switchToArticleView();
			}

			return;
		}

		// We are at the beginning, reset the viewqueue and go back to queue
		this.viewqueue = [];
		this.goBackToQueue();
	},

	currentLoadedView: function()
	{
		return this.viewqueue[this.viewqueue.length-1].currentview;
	},

	setCurrentLoadedView: function(view)
	{
		if (this.viewqueue.length) {
			this.viewqueue[this.viewqueue.length-1].currentview = view;
		}
	},

	currentLoadedURL: function()
	{
		if (typeof this.item !== 'undefined') {
			return this.item.given_url || this.item.original_url || this.item.url || this.viewqueue[this.viewqueue.length-1].url;
		}

		return this.viewqueue[this.viewqueue.length-1].url;
	},


	/**
	 * Representation of 'load' and 'reload'
	 */

	loadState : function(state)
	{
		if (!this.inited) {
			this.init();
		}

		// Get item id and item from the queue
		this.itemId = state.sections[1];
		this.item = queue.itemForItemID(this.itemId);

		// update url
		var url = '/a/read/'+this.itemId;
		if (window.location != url) {
			boot.pushState('Pocket', url);
		}

		// Update state if we have the item in the list view
		var item = $('#i' + this.itemId);
		if (item.size() == 1)
		{
			$('#pagenav_mark').toggleClass('selected', (item.attr('status') == '1'));
			if (item.attr('status') == '1')
			{
				$('#pagenav_mark a').attr('title','Add Item to List').text('Add Item to List');
			}
			else
			{
				$('#pagenav_mark a').attr('title','Archive').text('Archive');
			}
			$('#pagenav_favorite').toggleClass('selected', (item.attr('favorite') == '1'));
		}

		// Update inactive mode if we happen to be offline
		if (window.navigator.onLine)
		{
			$('#pagenav_share').removeClass('inactive');
		}
		else
		{
			$('#pagenav_share').addClass('inactive');
		}

		// Start with a state changed call
		this.stateChanged();
	},


	/**
	 * Representation of 'load new page'
	 */

	stateChanged : function()
	{
		// Init view queue
		this.viewqueue = [];

		// Add scrollhandler if the controller is starting
		this.addScrollEventHandler();

		// Add gesture event handler
		this.addGesturEventHandler();

		// Load the items from the database
		this.loadItem();

		// Switch to the page if it's not active
		boot.showPage(this);
	},

	willHide : function()
	{
		this.saveScroll(true);
		this.showStyleMenu(false);
		this.item = undefined;
		this.itemId = undefined;

		// Remove scrollhandler before the controller hides as we don't want
		// any scroll events while the user is in the queue
		this.removeScrollEventHandler();

		// Remove gesture handler
		this.removeGestureEventHandler();
	},

	didHide : function()
	{
		// reset toggles
		this.navigationItem.find('.leftItem li').removeClass('selected');

		this.isOpen = false;
	},

	didShow : function()
	{
		this.isOpen = true;

		scrollToTop();
	},


	/**
	 * Starting point to load a new item
	 */

	loadItem : function()
	{
		logger.log("Load item: " + JSON.stringify(this.item));

		// Add spinner
		this.page.addClass('loading');

		this.loadLayout();

		// Check if we need to load an article, video, image or external link
		if (this.item.has_video == 2) {
			// Load video
			this.loadVideoItem();
		}
		else if (this.item.has_image == 2) {
			// Load image
			this.loadImageItem();
		}
		else if (this.item.is_article == 0) {
			// Load external page
			this.loadExternalPageItem();
		}
		else {
			// Load articles
			this.loadArticleItem();
		}
	},

	loadArticle: function()
	{
		// Helper method to check in which way we have to load the item
		if (typeof this.item === 'undefined' || typeof this.item.status === 'undefined') {
			this.loadArticleItemByUrl(this.currentLoadedURL());
			return;
		}

		this.loadArticleItem();
	},

	loadArticleItem : function ()
	{
		if (!this.item) { return }

		// Load article
		this.data.getArticle({
			data : {
				itemId : this.itemId,
				item : this.item
			},
			delegate: this,
			doneSelector: 'articleLoaded'
		});
	},

	loadArticleItemByUrl : function(url)
	{
		// Load article
		this.data.getArticle({
			data : {
				url: url
			},
			delegate: this,
			doneSelector: 'articleLoadedUrl'
		});
	},

	articleLoadedUrl : function(data, o)
	{
		this.item = data.item;
		this.itemId = data.item.item_id;
		this.item.time_added = data.timePublished;

		$('body').scrollTop(0);

		this.articleLoaded(data, o);
	},

	articleLoaded : function(data, o)
	{
		var self = this;

		// Shortcuts to response
		var item = this.item;

		// No item anymore just return
		if (!item) { return; }

		// Get title
		var title = item.resolved_title || item.given_title || item.title;

		// Get domain
		var uri = parseUri(item.resolved_url);
		var domain = uri.host;

		// Get date
		var date;
		if (typeof item.time_added == 'string') {
			date = new Date(item.time_added * 1000);
		}
		else if (typeof item.time_updated == 'string') {
			date = new Date(item.time_updated * 1000);
		}
		var dateStr = !date ? '' : date.format("mmmm dS, yyyy");

		// Add videos to the article
		var html = this.replaceVideos(data.article, item.videos);

		// Fill layout
		this.fillLayout(title, domain, item.authors, dateStr, item.given_url, item.tags, html);

		// Append article warning if not a true article
 		var noArticleWarning = (this.item.is_article == 0 && this.item.has_image != 2 && this.item.has_video != 2);
		if (noArticleWarning) {
			$('.text_body').prepend("<div class='noarticle_warning'>\
				<p>This page doesn't appear to be an article and therefore may not display well in the Article View. You may want to switch to the <a class='fullwebswitch' href='#'>full web page view</a>.</p>\
				<p>If you know there <em>should</em> be an article here, help improve the article parser by <a href='#'>reporting this page</a>. Thanks!</p></div>");
			var self = this;
			$('.fullwebswitch').click(function() { self.switchToWebView(); });
		}

		// Update state
		$('#pagenav_mark').toggleClass('selected', (item.status == 1));
		$('#pagenav_favorite').toggleClass('selected', (item.favorite == 1));


		// Replace images
		this.loadImages(item.images);

		// Replace videos
		if (isChromePackagedApp()) {
			this.loadVideos(item.videos);
		}

		// jump to position
		var positions = item.positions;
		if (positions && positions[1]) {
			var ni = positions[1].node_index;
			//var ni = item.nodeIndex;
			setTimeout( function(){
				reader.ignoreScroll = true;
				self.scrollToNodeIndex( ni );
				setTimeout(function(){reader.ignoreScroll = false;}, 250);
			}, 100 );
		}

		// Remove spinner
		this.page.removeClass('loading');

		// Check if we see the message view
		setTimeout(function(){ reader.tryTocheckForMessageView(); }, 750);

		// Reset message state
		this.hasSeenMessage = false;
		this._messageWrapper = undefined;

		// Setup messages
		$(this.getMessageWrapper()).find('a').mousedown(function(){
			queue.data.itemAction({
				data : {
					itemId: reader.itemId,
					action:'pmc',
					click_url:this.href,
					pkta:reader.getMessageWrapper().getAttribute('pkta')
				}
			});

		});

		// GSF check and initialize
		this.gsfInitialize();
	},

	loadVideoItem : function ()
	{
		var item = this.item;

		// Get title
		var title = item.resolved_title || item.given_title || item.title;

		// Get domain
		var uri = parseUri(item.resolved_url);
		var domain = uri.host;

		// Get date
		var date = new Date(item.time_added * 1000);
		var dateStr = !date ? '' : date.format("mmmm dS, yyyy");

		// Replace the video tag
		var videoHtml = this.replaceVideos("<!--VIDEO_1-->", item.videos);

		// Fill layout
		this.fillLayout(title, domain, item.authors, dateStr, item.given_url, item.tags, videoHtml);

		// Load videos in view
		this.loadVideos(item.videos);

		// Update state
		$('#pagenav_mark').toggleClass('selected', (item.status == 1));
		$('#pagenav_favorite').toggleClass('selected', (item.favorite == 1));

		// Remove spinner
		this.page.removeClass('loading');

		// GSF check and initialize
		this.gsfInitialize();
	},

	loadImageItem : function ()
	{
		var item = this.item;

		// Get title
		var title = item.resolved_title || item.given_title || item.title;

		// Get domain
		var uri = parseUri(item.resolved_url);
		var domain = uri.host;

		// Get date
		var date = new Date(item.time_added * 1000);
		var dateStr = !date ? '' : date.format("mmmm dS, yyyy");
		var imgHtml = '<div id="RIL_IMG_1" class="RIL_IMG"></div>';

		// Fill layout
		this.fillLayout(title, domain, item.authors, dateStr, item.given_url, item.tags,  imgHtml);

		// Load images in view
		this.loadImages(item.images);

		// Update state
		$('#pagenav_mark').toggleClass('selected', (item.status == 1));
		$('#pagenav_favorite').toggleClass('selected', (item.favorite == 1));

		// Remove spinner
		this.page.removeClass('loading');

		// GSF check and initialize
		this.gsfInitialize();
	},

	loadExternalPageItem : function ()
	{
		var item = this.item;

		// Get domain
		var uri = parseUri(item.resolved_url);
		var domain = uri.host;

		// Fill layout
		this.fillWebViewLayout(item.resolved_title, domain,item.given_url);

		// Remove spinner
		this.page.removeClass('loading');
	},

	loadLayout : function()
	{
		// Create layout framework if it doesn't exist
		if (!this.layout)
		{
			var layout = {};

			layout.head = $('<div class="reader_head"></div>');
			layout.title = $('<h1></h1>');
			layout.subline = $('<ul class="sub"></ul>');
			layout.subline.append(
				'<li class="domain"><img class="favicon" /><a target="_blank"></a></li>' +
				'<li class="authors"></li>' +
				'<li class="date"></li>' +
				'<li class="tags"></li>'
			);
			layout.domain = layout.subline.children('.domain');
			layout.authors = layout.subline.children('.authors');
			layout.date = layout.subline.children('.date');
			layout.tags = layout.subline.children('.tags');

			layout.article = $('<div class="text_body"></div>');

			this.content.append(layout.head);
			layout.head.append(layout.title).append(layout.subline).append('<div class="clear"></div>');
			this.content.append(layout.article);

			this.layout = layout;

			this.loadStyles();
		}
	},

	fillLayout : function(title, domain, authors, dateStr, original_url, tags, html)
	{
		this.page.removeClass('webview').addClass('articleview');
		if (this.offlinePageWarning) {
			this.offlinePageWarning.hide();
		}
		this.articleview.css('display','block');
		this.hideWebView();
		$('#pagenav_articleview').addClass('selected');
		$('#pagenav_webview').removeClass('selected');
		$('#pagenav_style').removeClass('inactive');

		// Fill in layout
		this.layout.title.text( title ? title : 'Untitled from ' + domain );
		document.title = 'Pocket : ' + this.layout.title.text();

		// Don't cache favicons
		assetCache.loadFavicon(faviconForUrl(domain), function(img) {
			if (typeof img === "undefined") {
				return;
			}
			this.layout.domain.children('.favicon').attr('src', img.src);
		}.bind(this));

		// Domain
		this.layout.domain.children('a').attr('href', 'http://' + domain).text(domain);

		// Favicon
		this.layout.domain.children('.favicon').attr('src', "");

		// Authors
		this.layout.authors.html(listAuthors(authors));
		this.layout.authors.toggle(this.layout.authors.text().length > 0);

		// Date
		this.layout.date.html(dateStr);
		this.layout.date.toggle(this.layout.date.text().length > 0);

		// Tags
		this.layout.tags.html(listTags(tags));
		this.layout.tags.toggle(this.layout.tags.text().length > 0);

		// Set the actual html
		this.layout.article.html(html);

		// Push the current loaded item to the view queue
		if (!this.viewnotmovingforward) {
			this.viewqueue.push({item: this.item, url:original_url, currentview:'article',timestamp: Date.now()});
			this.updateToolbarUI();
			if (this.viewqueue.length > 1)
			{
				sync.sendAction({action:'left_item'}, false);
			}
		}
		else {
			this.viewnotmovingforward = false;
		}

		// Add an event handler to all links within the text that will open the
		// clicked url within the article view
		var self = this;
		this.layout.article.find('a').click(function(e) {
			var target = $(this).attr('target');
			if (target != '_pktbrowser' && target != '_pktweb' && target != '_pktarticle') {
				e.preventDefault();
				self.loadArticleItemByUrl($(this).attr('href'));
			}
		});
	},

	fillWebViewLayout : function(title, domain, href, fromarticleview)
	{
		document.title = "Pocket : " + this.layout.title.text();
		this.layout.domain.children('a').attr('href', 'http://' + domain).text(domain);

		$('#pagenav_webview').addClass('selected');
		$('#pagenav_articleview').removeClass('selected');
		$('#pagenav_style').addClass('inactive');

		this.page.removeClass('articleview').addClass('webview');
		this.articleview.hide();
		var url = this.item.resolved_url || this.item.given_url;
		var referredURL =  urlWithPocketRedirect(url);
		this.showWebView(referredURL);
	},


	// Process images

	loadImages : function(images)
	{
		if (!images) {
			return;
		}

		var self = this;
		$.each(images, function (idx, image) {
			self.loadImage(image.image_id, image.src, image.caption, image.credit, 1);
		});
	},

	loadImage : function(id, src, caption, credit, scale)
	{
		scale = scale * 1;

		var obj = $('#RIL_IMG_'+id);
		obj.html('<caption>'+caption+' <cite>'+(credit?'Photo by: ':'')+credit+'</cite></caption>');
		var anchor = obj;

		if (caption && (caption.length || credit.length))
		{
			obj.addClass('hasCaption');

			// pop out of link if it wraps the image and we have a caption
			var parentA = obj.parent('a');
			if (parentA.size() == 1)
			{
				obj.prepend('<a href="'+parentA.attr('href')+'"></a>');
				obj.parent('a').replaceWith(obj);
				anchor = obj.children('a');
			}
		}

		// Load image and only cache items from unread items
		assetCache.loadImageCached(src, this.item.status == '0', function(img) {
			if (typeof img === 'undefined') {
				return;
			}

			//resize for scale
			if (scale > 1) {
				this.width *= (1.0 / scale);
			}

			var $img = $(img);
			anchor.prepend($img);
			var wrapper = $img.parents('.RIL_IMG');
			if (caption) {
				var widthlimit = reader.content.width();
				if (img.width > widthlimit)
				{
					wrapper.css('width',widthlimit - 2 + 'px');
				}
				else
				{
					wrapper.css('width', (img.width > 175? img.width:175) + 'px');
				}
			}
			wrapper.addClass('loaded');
		});
	},


	// Process videos

	replaceVideos : function(html, videos)
	{
		if (!videos) {
			return html;
		}

		$.each(videos, function (idx, video) {
			// Replaces video to an element
			var textToReplace = "<!--VIDEO_" + video.video_id + "-->";
			var regex = new RegExp(textToReplace, "gi");
			var videoElement = '<div id="RIL_VIDEO_' + video.video_id + '" class="RIL_VIDEO"></div>';
			html = html.replace(regex, videoElement);
		});
		return html;
	},

	loadVideos : function(videos)
	{
		if (!videos) {
			return;
		}

		var self = this;
		$.each(videos, function (idx, video) {
			self.loadVideo(video.video_id, video.src, video.height, video.width, video.type, video.vid);
		});
	},

	loadVideo : function(id, src, height, width, type, vid)
	{
		// Calculate width and height
		width = (width !== 0 && width !== '0') ? width : 640;
		height = (height !== 0 && height !== '0') ? height : 390;

		// TODO: support more videos
		var url = sanitizeText(src);
		if (type == '1') {
			// Youtube
			url = 'http://www.youtube.com/embed/' + vid;
		}
		else if (type == '2' || type == '3' || type == '4') {
			// Vimeo, Vimeo Moogaloop, Vimeo IFrame
			url = 'http://player.vimeo.com/video/'+vid+'?title=0&amp;byline=0&amp;portrait=0';
		}
		else if (type == '5') {
			// HTML5 - Just use the src
		}
		else if (type == '7') {
			// IFRAME - Just use the src
		}
		else if (type == '8') {
			// BRIGHTCOVE - Just use the src
		}
		else if (type == '6') {
			// FLASH - Just use the src
		}

		// Get the video element to add the video
		var $obj = $('#RIL_VIDEO_'+id);

		var $contentwidth = this.articleview.children().width();
		if ($contentwidth > 0 && $contentwidth < width) {
			height = ($contentwidth/width) * height;
			width = $contentwidth;
		}

		// We show a placeholder image if we are offline or not running the chrome packaged app
		var videoElement;
		if (!window.navigator.onLine || !isChromePackagedApp()) {
			var offlinePlaceholderImageURL = isChromePackagedApp() ? chrome.runtime.getURL("a/i/OfflineVideoImage.png") : "i/OfflineVideoImage.png" ;
			videoElement = '<img src="' + offlinePlaceholderImageURL + '" />';
		}
		else {
			videoElement = '<webview src="' + url + '"style="width:' + width + 'px;height:' + height + 'px"></webview>';
		}

		// If we don't add a timeout the video will not load
		setTimeout(function () {
			$obj.append($(videoElement));
		}, 100);
	},

	/**
	 * GSF actions
	 */

	gsfInitialize : function() {
	 	var self = this;
	 	if (!boot.GSFStatus.active || !/Chrome/.test(navigator.userAgent)) {
			return;
		}
		// create special watcher to auto check for if the user somehow goes back to
		if (boot.GSFStatus.active && !this.viewcheck)
		{
			this.viewcheck = setInterval(function() {
				if (boot.pages.queue.isOpen && !queue.loading) 
				{
					clearTimeout(self.viewcheck);
					self.viewcheck = null;
					if ($('.tooltip-reader').is(':visible'))
					{
						if (typeof openPopover == 'object')
						{
							openPopover.hideOpenPopover();
						}
					}
					if (queue.inited)
					{
						queue.gsfCheckLogic();
					}
				}
			},1000);
		}
		if (boot.GSFStatus.active && !boot.GSFStatus.articleviewconfirm && this.page.hasClass('articleview')) {
			var tool = createTooltip($('.pkt-nav'),'This is the Article View','Pocket displays this optimized view for articles.\
								   			     |To see the original, tap the Article/Web View toggle in the center of the top toolbar.',['bottom'],true,function() { boot.GSFStatus.articleviewconfirm = true; boot.saveGSFStatus(); reader.gsfInitialize(); PocketAnalytics.action('gsf_tooltip_articleview_ok','click','packagedapp'); });
			tool.object.addClass('tooltip-reader');
			PocketAnalytics.action('gsf_tooltip_articleview','view','packagedapp');


			boot.GSFStatus.articleview = true;
			boot.saveGSFStatus();
		}
		else if (boot.GSFStatus.active && !boot.GSFStatus.webviewconfirm && this.page.hasClass('webview')) {
			var tool = createTooltip($('#external_reader'),'This is the Web View','If you open a page that is not an article or video, or you select the Web View toggle in the top toolbar, Pocket will display the original web page.',['centered'],true,function() { boot.GSFStatus.webviewconfirm = true; boot.saveGSFStatus(); reader.gsfInitialize(); PocketAnalytics.action('gsf_tooltip_webview_ok','click','packagedapp'); });
			tool.object.addClass('tooltip-reader');
			PocketAnalytics.action('gsf_tooltip_webview','view','packagedapp');

			boot.GSFStatus.articleview = true;
			boot.saveGSFStatus();
		}
		else if (boot.GSFStatus.active && !boot.GSFStatus.articleviewitemactions) {
			var tool = createTooltip($('.active .leftItem'),'Item Actions','You can Archive, Favorite, or Share on this page.|\
													 If you’d like to return to this page later, your reading position will be automatically synced across devices.',['bottom','right','bottomleft','bottomright'],true,function() { boot.GSFStatus.articleviewitemactions = true; boot.saveGSFStatus(); PocketAnalytics.action('gsf_tooltip_itemactions_ok','click','packagedapp'); });
			tool.object.addClass('tooltip-reader');
			PocketAnalytics.action('gsf_tooltip_itemactions','view','packagedapp');
		}
	},

	/**
	 * Toolbar actions
	 */

	confirmDelete : function(itemId)
	{
		var self = this;

		createDialog({
			anchor : $('#pagenav_delete'),
			title : 'Are you sure?',
			message : false,
			confirm : {
				title : 'Delete',
				action : function() {
					self.actionToggle('delete');
				}
			}
		});
	},

	addURLToPocket: function()
	{
		// Setup add url button
		var addcontainer = $('#pagenav_add');
		if (addcontainer.hasClass('selected')) return;
		addcontainer.addClass('selected');

		var urlToAdd;
		if (typeof this.item == 'object')
		{
			urlToAdd = this.item.resolved_url || this.item.given_url;
		}
		else
		{
			urlToAdd = this.viewqueue[this.viewqueue.length-1].url;
		}
		// Add url to Pocket
		boot.helper.sync.addURL({
			url: urlToAdd
		},
		function() {
			sharedToast.show('Added to List');
			queue.reloadList();
		},
		function(error) {
			boot.showErrorNotification(error.message);
			addcontainer.removeClass('selected');
		});
	},


	/**
	 * Toolbar actions handling
	 */
	actionToggle : function(action)
	{
		var self = this;
		
		var button = $('#pagenav_'+action);

		// toggle selection
		button.toggleClass('selected');
		var on = (button.hasClass('selected'));

		var pass = {
			action: action,
			on: on,
			itemId : this.itemId
		};

		// close the view
		var delay = 333;

		// send data change and make change to ui
		setTimeout(function() {
			queue.takeActionOnItem(pass.action, pass.on, pass.itemId, delay + 100, true);
		}, delay);

		if (action == 'mark' || action == 'delete')
		{
			// switch view
			delay += 333;
			setTimeout(function()
			{
				self.goBackToQueue();

				if (action == 'mark')
				{
					if (!pass.on)
					{
						sharedToast.show('Item added to list');
					}
					else
					{
						sharedToast.show('Item archived');
						if (boot.GSFStatus.active)
						{
							getSetting('sawarchivetooltip',function(data) 
							{
								if (typeof data.sawarchivetooltip != 'string')
								{
									queue.gsfCheckArchiveTooltip(4000);
								}
							});
						}
					}
				}
				if (action == 'delete')
				{
					sharedToast.show('Item deleted');
				}
				queue.highlightItemCheckDeletedMarked();
			}, delay);
		}
	},


	/**
	 * Share popover handling
	 */

	showShareMenu : function(anchor)
	{
		var self = this;

		if (anchor) {
			anchor = $(anchor);
			var anchorItem = anchor.parents(".item");

			this.shareAnchor = anchor;

			if(!this.shareMenu){
				var shareMenuList = [];
				for(var idx = 0; idx < Sharer.sharers.length; idx++){
					var sharer = Sharer.sharers[idx];
					shareMenuList.push(dsi(idx, sharer.name));
				}

				// we just use the drop selector for its UI building, we don't want the DOM attaching behavior it does
				var shareMenu = new DropSelector( {
					id:'shareMenuContents',
					"class":'titleItem shareMenuSelector',
					nodeName:'h2',
					append: $("#container"),
					list: shareMenuList,
					selectCallback:function(selector,li)
					{
						if ($('#pagenav_share').hasClass('inactive')) {
							return false;
						}
						var val = $(li).attr('val');
						var sharer = Sharer.sharers[val];
						if (sharer) {
							self.shareMenu.show(false);
							if (typeof self.item !== 'undefined') {
								sharer.share(self.item, self.shareAnchor);
							}
							else {
								sharer.share({url: self.currentLoadedURL()}, self.shareAnchor);
							}

							return true;
						}

						return false;
					},
					callback:function()
					{

					},
					hideUntilSet:true
				});

				// add simple external link to external browser li, if applicable
				var openinbrowser = $(shareMenu.ul).children('li').filter("[val=4]");
				if (openinbrowser.length)
				{
					var sharer = Sharer.sharers[openinbrowser.attr('val')];
					if (sharer) {
						sharer.setExternalLink(self.currentLoadedURL(), openinbrowser);
					}
				}


				this.shareMenu = new PopOver(
					"shareMenu",
					shareMenu.ul,
					$("#container"),
					{
						onHide: function(){
							$(".pendingDialog").removeClass("pendingDialog");
						},
						positions: ['bottomleft','bottomright','topleft','topright'],
						xOffset: 0,
						disableHideOnScroll: true,
						fixedPosition: true
					}
				);

				var imgScale = window.devicePixelRatio || 1;
				var rows = this.shareMenu.object.find("li");
				for(var idx = 0; idx < rows.length; idx++){
					var row = $(rows[idx]);
					var link = row.find("a");
					var service = Sharer.sharers[parseInt(row.attr("val"), 10)];

					var imageURL = service.icon1x;
					if(imgScale > 1 && service.icon2x){
						imageURL = service.icon2x;
					}
					link.css("backgroundImage", "url(" + imageURL + ")");
				}

				shareMenu.object.remove();
				this.shareMenu.object.addClass("titleSelector");
			}
			else
			{
				// add simple external link to external browser li, if applicable
				if (typeof this.shareMenu.object == 'object')
				{
					var openinbrowser = this.shareMenu.object.find('li').filter("[val=4]");
					if (openinbrowser.length)
					{
						var sharer = Sharer.sharers[openinbrowser.attr('val')];
						if (sharer) {
							sharer.setExternalLink(self.currentLoadedURL(), openinbrowser);
						}
					}
				}
			}
			// add/remove inactive state to actual share menu
			if ($('#pagenav_share').hasClass('inactive'))
			{
				this.shareMenu.object.addClass('inactive');
			}
			else
			{
				this.shareMenu.object.removeClass('inactive');
			}
		}

		anchorItem.toggleClass("pendingDialog", anchor !== undefined);
		this.shareMenu.show(anchor);
	},


	/**
	 * Change style handling
	 */
	showStyleMenu : function(anchor)
	{
		var self = this;
		if(anchor)
		{
			anchor = $(anchor);
			var anchorItem = anchor.parents(".item");

			this.shareAnchor = anchor;

			if(!this.styleMenu)
			{
				this.styleMenu = new PopOver(
					"styleMenu",
					this.styleMenuContent,
					$("#container"),
					{
						positions: ['bottomleft','bottomright','topleft','topright'],
						hideOnClickInPopover: false,
						xOffset: 0,
						disableHideOnScroll: true,
						fixedPosition: true
					}
				);
			}
			if (anchor.parents('.inactive').length)
			{
				this.styleMenuContent.addClass('inactive');
			}
			else
			{
				this.styleMenuContent.removeClass('inactive');
			}
			this.styleMenu.show(anchor);
		}

	},

	loadStyles : function()
	{
		var self = this;
		getSetting('a_styles',function(data)
		{
			var styles = data.a_styles;
			if (!styles)
			{
				styles = {
					'font' : 'serif',
					'fontSize' : '3',
					'skin' : 'light'
				};
			}
			else
			{
				styles = JSON.parse(styles);
			}

			self.setFont(styles.font, true);
			self.setFontSize(styles.fontSize, true);
			self.setSkin(styles.skin, true);
		});
	},

	saveStyles : function(noSave)
	{
		if (noSave)
			return;

		var styles = {
			'font' : this.page.attr('font'),
			'fontSize' : this.page.attr('fontSize'),
			'skin' : this.page.attr('skin')
		};
		setSetting('a_styles', JSON.stringify(styles));

		// hack for webkit which doesn't refresh the dom styling for attribute changes
		this.page.toggleClass('toggleStyles');
	},

	//

	toggleFont : function()
	{
		this.setFont( this.page.attr('font') == 'serif' ? 'sans' : 'serif' );
	},

	setFont : function(font, noSave)
	{
		this.page.attr('font', font);
		this.saveStyles(noSave);
	},

	fontInc : function(i)
	{
		this.setFontSize( this.page.attr('fontSize')*1 + i );
	},

	setFontSize : function(s, noSave)
	{
		if (isNaN(s))
			s = 1;

		if (s < 0 || s > 6)
			return;

		this.styleMenuContent.find('#submenu_font_down').toggleClass('dim', s === 0);
		this.styleMenuContent.find('#submenu_font_up').toggleClass('dim', s == 6);

		this.page.attr('fontSize', s);
		this.saveStyles(noSave);
	},

	toggleSkin : function()
	{
		var newskin = 'light';
		var oldskin = this.page.attr('skin');
		if (oldskin == 'night')
		{
			newskin = 'sepia';
		}
		if (oldskin == 'light')
		{
			newskin = 'night';
		}
		if (oldskin == 'sepia')
		{
			newskin = 'light';
		}
		this.setSkin( newskin );
	},

	setSkin : function(skin, noSave)
	{
		this.page.attr('skin', skin);
		$('body').removeClass('page-readerlight page-readernight page-readersepia page-readerfullscreen').addClass('page-reader' + skin);
		this.saveStyles(noSave);
	},


	/**
	 * Scroll and Gesture Handling
	 */
	addGesturEventHandler: function()
	{
		// Add the gesture handler to the page element. We add / remove the
		// gesture handler everytime we open the reader. This is the reason
		// due to performance improvements in the queue. If we have the gesture
		// handler listen all time everytime the user scrolls in the queue the
		// scroll event from the browser needs to wait until our gesture handler
		// gives feedback, we want to avoid that in the queue, so the gesture
		// handler is only active within the reader

		var element = document.getElementById('page');
		this.gestureJammer = jester(element, { swipeDistance: 150, preventDefault: false });
		this.gestureJammer.flick(function (touches, direction) {
			if (direction === "right" && touches.numTouches() == 1) {
				// Push the swipe flick action to handle in the next loop
				// as the flick event will be finished to soon
				setTimeout(function () { boot.goBack(); }, 0);
			}
		});
	},

	removeGestureEventHandler: function()
	{
		this.gestureJammer.halt();
	},

	// Scrolling and Message View handling
	addScrollEventHandler : function ()
	{
		$(window).bind("scroll", this.scrollEventHandler);
	},

	removeScrollEventHandler : function ()
	{
		$(window).unbind("scroll", this.scrollEventHandler);
	},

	scrollEventHandler : function ()
	{
		//throttle
		clearTimeout(reader.scrollTO);
		reader.scrollTO = setTimeout(function(){reader.scrolled();}, 150);
	},

	scrolled : function(e)
	{
		if (this.ignoreScroll) {
			return;
		}

		var self = this;

		this.saveScroll();
		this.tryTocheckForMessageView();
	},


	/**
	 * Publisher message handling
	 */
	tryTocheckForMessageView : function()
	{
		// because these are scroll/touch events, we buffer it so that we aren't calling it a bajillon times

		if (this.hasSeenMessage) {
			return;
		}

		if (this.checkMessageViewTO) {
			clearTimeout(this.checkMessageViewTO);
		}

		this.checkMessageViewTO = setTimeout(function(){
			this.checkForMessageView();
		}.bind(this),33);
	},

	checkForMessageView : function()
	{
		if (this.hasSeenMessage) {
			return;
		}

		var messageElement = this.getMessageWrapper();

		if (messageElement && elementInViewport(messageElement))
		{
			this.hasSeenMessage = true;

			queue.data.itemAction({
				data : {
					itemId: reader.itemId,
					action:'pmv',
					pkta:messageElement.getAttribute('pkta')
				}
			});
		}
	},

	getMessageWrapper : function()
	{
		if (this._messageWrapper)
			return this._messageWrapper;

		var message = $('#PKT_footer_message');
		if (message && message.length)
			this._messageWrapper = message[0];

		return this._messageWrapper;
	},


	/**
	 * Save scroll handling
	 */
	saveScroll : function(immediate)
	{
		var win		= getSize($(window));
		var y		= $(window).scrollTop();
		var tY		= this.yHitMethod=='screen' ? this.topY + 20 : y;

		var e, i; // e=element, i=nodeindex
		if (y < 150) {
			// If the user scrolled to the top position we just use a
			// scroll position and a nodeindex of 0
			y = 0;
			i = 0;
		}
		else {
			//	Get high and low nodeindex element in the packages app
			/*
				In this way we cannot use document.elementFromPoint to get the
				top element of the actual scroll position due we don't scroll
				the document, the document is fixed we just scroll the #scrollable
				element. In this #scrollable element the element at the top is
				the first element with a nodeindex attribute and the offset is
				positive, we use this element as high and low element
				and save the scroll position based on that element
			*/
			var high;
			var low;
			$("[nodeindex]").each(function (idx, element) {
				var $element = $(this);
				if ($element.offset().top > y) {
					high = this;
					low = this;
					return false; // Skip all other objects
				}
			});

			var iH = high ? high.getAttribute('nodeindex') : null;
			var iL = low ? low.getAttribute('nodeindex') : null;

			//logger.log(y + ' | ' + tY + ' | ' + high + ' | ' + low + ' | ' + iH + ' | ' + iL);

			if (iH && iH*1 > iL*1) {
				e = high;
				i = iH;
			}
			else if (iL) {
				e = low;
				i = iL;
			}
		}

		if (y == this.lastY)
		{
			if (this.pendingPosition && immediate) {
				this.commitPosition();
			}

			return; // no need to send again
		}

		// Height of scrollable element
		var scrollHeight = $("#container")[0].scrollHeight;
		// Height of the window
		var heightOfWindow = win.height;

		// Calculate the scroll positon percent
		var scrollPercent = Math.ceil((parseInt(y, 10) + parseInt(heightOfWindow, 10)) / parseInt(scrollHeight, 10) * 100);

		if (scrollPercent < 0) {
			scrollPercent = 0;
		}
		else if (scrollPercent > 100) {
			scrollPercent = 100;
		}

		// Prevent sending positions if no item is currently in the reader
		this.pendingPosition = undefined;
		if (typeof this.item !== 'undefined') {

			// Save views: text: 1 or web: 2
			var view = '1';
			if (this.viewqueue.length > 0 && this.currentLoadedView() === 'web') {
				view = '2';
			}
			this.pendingPosition = {
				itemId : this.itemId,
				item : this.item,
				item_id: this.itemId,
				local_item_id: this.item.local_item_id,
				view: view,
				page: '1',
				section: '0',
				node_index: ''+i,
				percent: ''+scrollPercent
			};
		}


		// we use the same TO as scrolling for saving, because if they scroll again, we shouldn't be saving anyway.
		clearTimeout(this.scrollTO);

		if (immediate) {
			this.commitPosition();
		}
		else {
			this.scrollTO = setTimeout(function() {
				this.commitPosition();
			}.bind(this), 2000);
		}

		this.lastY = y;
	},

	commitPosition : function()
	{
		if (!this.pendingPosition) {
			return;
		}

		this.data.savePosition({
			data: this.pendingPosition
		});

		this.pendingPosition = undefined;
	},

	scrollToNodeIndex : function(i)
	{
		$('[nodeindex]').each(function (idx, nodeIndexElement) {
			if (nodeIndexElement.getAttribute('nodeindex') == i) {
				nodeIndexElement.scrollIntoView(true);
				return false;
			};
		})
	},

	updateToolbarUI : function() {
		$('#pagenav_add').removeClass('selected');
		if (this.viewqueue.length > 1) {
			$('.toolbar_reader').addClass('toolbar_reader_addmode');
		}
		else {
			$('.toolbar_reader').removeClass('toolbar_reader_addmode');
		}

	},


	/**
	 * Switch between article and web view
	 */
	switchToArticleView : function()
	{
		// Clean the web view stuff
		$('#pagenav_webview').removeClass('selected');
		$('#pagenav_articleview').addClass('selected');
		$('#pagenav_style').removeClass('inactive');
		this.hideWebView();

		// kill gsf tooltips
		if (boot.GSFStatus.active && $('.tooltip-reader').is(':visible'))
		{
			if (typeof openPopover == 'object')
			{
				openPopover.hideOpenPopover();
			}
		}

		this.viewnotmovingforward = true;

		// Set current view if we are in the view queue
		this.setCurrentLoadedView('article');

		// Check if we have to load the article from remote or locally
		this.loadArticle();
	},

	switchToWebView : function()
	{

		$('#pagenav_articleview').removeClass('selected');
		$('#pagenav_webview').addClass('selected');
		$('#pagenav_style').addClass('inactive');
		$('body').removeClass('page-readerfullscreen');
		this.page.removeClass('articleview').addClass('webview');
		this.articleview.hide();
		//this.articleview.data('view_scrollpos',$('body').scrollTop());
		$('body').scrollTop(0);
		this.viewnotmovingforward = true;

		// kill gsf tooltips
		if (boot.GSFStatus.active && $('.tooltip-reader').is(':visible'))
		{
			if (typeof openPopover == 'object')
			{
				openPopover.hideOpenPopover();
			}
		}

		// set current view state
		this.setCurrentLoadedView('web');
		this.showWebView(urlWithPocketRedirect(this.currentLoadedURL()));
	},


	/**
	 * Handling WebView
	 */
	initWebView : function()
	{
		// init progress bar if it doesn't exist
		if (!this.webviewprogress)
		{
			this.webviewprogress = $('<div class="external_reader_progress progress-detail external_reader_progress_inactive"></div>');
			$('#content').append(this.webviewprogress);
		}
		// init fresh webview if it doesn't exist
		if (!this.webview)
		{
			this.webview = $('<webview id="external_reader" src=""></webview>');
			$('#content').append(this.webview);
		}
		this.webview.css('height',$(window).height() - $('#page .pkt-nav').height() - $('#PKT_header').height() + 'px');


		var self = this;
		this.webview[0].addEventListener("loadstart", function(e) {
			// Show progress of webview loading
			self.webviewprogress.addClass('progress-detail-active external_reader_progress_active');
		});

		this.webview[0].addEventListener("loadcommit", function(e) {
			// Check wheter the event happened from the top-level or in a subframe,
			// and we don't want to handle anything if the url is blank or a redirect
			// from Pocket
			if (e.isTopLevel && e.url.indexOf('about:blank') == -1 && e.url.indexOf('getpocket.com/redirect?') == -1 && e.url.indexOf('getpocket.com/s/') == -1) {

				// Handle Clicks within the webview
				if (!self.viewnotmovingforward &&
					(self.viewqueue.length === 0 || self.viewqueue[self.viewqueue.length-1].url !== e.url))
				{
					// check to see if new url is identical to previous given/resolved URL, then don't add to queue
					if (self.viewqueue.length && typeof self.viewqueue[self.viewqueue.length-1].item == 'object' &&
					   (self.viewqueue[self.viewqueue.length-1].item.given_url == e.url ||
						 self.viewqueue[self.viewqueue.length-1].item.resolved_url == e.url))
					{
						return;
					}
					// If the timestamp vs. previous timestamp appear extremely close in time, assume previous was redirect, remove and replace
					if (self.viewqueue.length && (e.timeStamp - self.viewqueue[self.viewqueue.length-1].timestamp < 1000))
					{
						self.viewqueue.pop();
					}
					// If we don't load the first item in the viewqueue reset the item
					if (self.viewqueue.length !== 0) {
						self.item = undefined;
						self.itemId = undefined;
					}
					self.viewqueue.push({item: self.item, url: e.url, currentview:'web', timestamp: e.timeStamp});
					self.updateToolbarUI();
					if (self.viewqueue.length > 1)
					{
						sync.sendAction({action:'left_item'}, false);
					}
				}
				else {
					// Handle the case if the user opens a website in the webview
					// and then goes back. In that case we already have all information in
					// the viewqueue so we don't have to do anything
					self.viewnotmovingforward = false;
				}
			}
		});

		this.webview[0].addEventListener("loadstop", function(e) {
			// Hide progress of webview loading
			self.webviewprogress.removeClass('progress-detail-active external_reader_progress_active');
		});
	},

	showWebView : function(newurl)
	{
		if (!window.navigator.onLine)
		{
			// show offline warning
			if (!this.offlinePageWarning)
			{
				this.offlinePageWarning = $("<div class='offlinepage_warning'>\
											 <h3>Page Not Available</h3>\
											 <p>You are not connected to the internet and this page\
											  has not been downloaded for offline viewing.</p></div>");
				$('#page_reader').append(this.offlinePageWarning);
			}
			else
			{
				this.offlinePageWarning.show();
			}
		}
		else
		{
			if (this.offlinePageWarning)
			{
				this.offlinePageWarning.hide();
			}
			if (this.webview)
			{
				sync.sendAction({action:'opened_web'}, false);
				if (newurl)
				{
					this.webview.addClass('webview-activeinterim webview-active').attr('src',newurl);
					var self = this;
					// not the cleanest solution, but we need to make webview visible for a split second to allow about:blank to take
					// effect before moving to final page
					setTimeout(function() { self.webview.removeClass('webview-activeinterim'); },50);
				}
				else
				{
					this.webview.addClass('webview-active');
				}
			}
			if (this.webviewprogress)
			{
				this.webviewprogress.removeClass('external_reader_progress_inactive');
			}
		}
		// GSF check and initialize
		this.gsfInitialize();
	},

	hideWebView : function()
	{
		if (this.webview)
		{
			this.webview.attr('src','about:blank').removeClass('webview-active');
		}
		if (this.webviewprogress)
		{
			this.webviewprogress.addClass('external_reader_progress_inactive');
		}
		if (this.offlinePageWarning)
		{
			this.offlinePageWarning.hide();
		}
	},

};

var reader = new Reader();
boot.pages.reader = reader;

/* globals Class, boot, logger, isChromePackagedApp */

var Sharer = Class.extend({
	share: function(item, anchor) {
		this.item = item;
		var url = this.URLForItem(item);
		var message = this.messageForItem(item) || url;

		this.handleShare(message, url, anchor, item);
	},
	handleShare: function(message, url, anchor, item) {
		var self = this;

		boot.helper.sync.apiRequest('shorten', {
			service: self.name,
			url: url
		})
		.done(function(data) {
			var shortenURL = data.shortUrl;
			var baseURL = self.URLForShare(message, shortenURL, item);

			if (isChromePackagedApp()) {
				chrome.app.window.create("a/externalSite.html", {
					bounds: {width: self.viewWidth, height: self.viewHeight}
				},
				function (win) {
					win.contentWindow.URLToLoad = baseURL;
				});
				return;
			}

			// Open the popup in a separate window if the app is not running
			// in the packaged app environment
			window.open(baseURL, "_blank", "width=" + self.viewWidth + ",height=" + self.viewHeight + ",location=no,toolbar=no,status=no");
		})
		.fail(function(error) {
			logger.log(error);
		});
	},
	messageForItem: function(item) {
		return item.resolved_title || item.title;
	},
	URLForItem: function(item) {
		return item.resolved_url || item.given_url || item.url;
	}

	// implement one of these
	// URLForShare: function(message, url, item){
	// },
	// handleShare: function(message, url, item){
	// }
});

Sharer.sharers = [];
Sharer.registerSharer = function(sharerClass){
	Sharer.sharers.push(new sharerClass());
};

// -

// Send to Friend Sharing

Sharer.registerSharer(Sharer.extend({
	name: "Send to Friend",
	icon1x: "/a/i/share_send_to_friend-1x.png",
	icon2x: "/a/i/share_send_to_friend-2x.png",
	handleShare: function(message, url, anchorEl, item) {
		if (anchorEl) {
			var self = this;
			var anchor = $(anchorEl);
			var anchorItem = anchor.parents(".item");

			// The first time create the send to friend popup
			if (!this.sendToFriendPopup) {
				this.sendToFriendView = new SendToFriendView();
				this.sendToFriendPopup = new PopOver(
					'sendToFriend',
					$(this.sendToFriendView.view),
					$('#container'),
					{
						onHide:function(){
							$(".pendingDialog").removeClass("pendingDialog");

							// Reset send to friend popup
							self.sendToFriendView.destroy();

						},
						disableHideOnScroll: true,
						onlyCentered: true,
						hideOnClickInPopover : false
					}
				);
			}

			// If the user does not have a email address we have to show a message
			// and not let him send an item while he does not have an email
			// address
			var userHasEmailAddress = (loggedInUser.emailAddress && loggedInUser.emailAddress !== "");
			if (!userHasEmailAddress) {
				this.sendToFriendView.showMessage("Complete Your Profile", "Please click below to add your email address so recipients can identify you.", "Add Email Address", "http://getpocket.com/account", function () {
					self.sendToFriendPopup.show(false);
				});
			}
			else {
				// If we done't have to show a message just update the send to friend
				// view with the item
				this.sendToFriendView.updateWithItem(item);
			}

			this.sendToFriendPopup.object.find('.send-to-friend-form').append('<div class="loading">');

			// reposition
			this.sendToFriendPopup.show(anchor);
			anchorItem.addClass("pendingDialog");

			// Message handler from the send to friend popup
			var messageHandler = function(json) {
				var data = JSON.parse(json);

				self.sendToFriendPopup.object.find('.send-to-friend-form').children('.loading').remove();
				if (data.height) {
					var sendToFriendForm = self.sendToFriendPopup.object.find(".send-to-friend-form");

					sendToFriendForm.css({ height: data.height });
					self.sendToFriendPopup.show(anchor);
				}

				if (data.closed) {
					self.sendToFriendPopup.show(false);
				}

				if (data.shared) {
					sharedToast.show('Sent!');
				}
			};

			// Create new send-to-friend controller. That's responsible for
			// calculating height and width of the send-to-friend popover and
			// send, cancel the share action
			this.sendToFriend = new SendToFriend(item, this.sendToFriendView, messageHandler);

			// TODO: Better method to focus on first todo field than a timeout
			setTimeout(function() {
				$('#token-input-').focus();
			},200);
		}
		else if (this.sendToFriendPopup){
			this.sendToFriendPopup.show(false);
		}
	},

	shortenURL: function(url, cb){
		cb(null, url);
	}
}));

// Twitter Sharing
Sharer.registerSharer(Sharer.extend({
	name: "Twitter",
	icon1x: "/a/i/share_twitter-1x.png",
	icon2x: "/a/i/share_twitter-2x.png",
	viewWidth: 550,
	viewHeight: 420,
	messageForItem: function(item){
		return this._super(item) + " (via @Pocket)";
	},
	URLForShare: function(message, url){
		return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(message) + "&url=" + encodeURIComponent(url) + "&related=pocket,pockethits,pocketsupport";
	}
}));

// Facebook Sharing
Sharer.registerSharer(Sharer.extend({
	name: "Facebook",
	icon1x: "/a/i/share_facebook-1x.png",
	icon2x: "/a/i/share_facebook-2x.png",
	viewWidth: 550,
	viewHeight: 420,
	URLForShare: function(message, url){
		return 'http://www.facebook.com/sharer.php?u='+encodeURIComponent(url)+'&t='+encodeURIComponent(message);
	}
}));

// Evernote Sharing
/*
Sharer.registerSharer(Sharer.extend({
	name: "Evernote",
	icon1x: "/a/i/share_evernote-1x.png",
	icon2x: "/a/i/share_evernote-2x.png",
	viewWidth: 1000,
	viewHeight: 580,
	URLForShare: function(message, url){
		return "http://www.evernote.com/clip.action?url=" + encodeURIComponent(url) + "&title=" + encodeURIComponent(message);
	},
	shortenURL: function(url, cb){
		cb(null, url);
	}
}));
*/

// Buffer Sharing
Sharer.registerSharer(Sharer.extend({
	name: "Buffer",
	icon1x: "/a/i/share_buffer-1x.png",
	icon2x: "/a/i/share_buffer-2x.png",
	viewWidth: 880,
	viewHeight: 550,
	URLForShare: function(message, url){
		return "https://bufferapp.com/add?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(message);
	}
}));

// Open in external browser
Sharer.registerSharer(Sharer.extend({
	name: "Open in Browser",
	icon1x: "/a/i/share_browser-1x.png",
	icon2x: "/a/i/share_browser-2x.png",
	setExternalLink: function(url, anchor){
		if ($('#pagenav_share').hasClass('inactive'))
		{
			return;
		}
		var clone = anchor.clone();
		anchor.after(clone);
		clone.children('a').attr('href', sanitizeText(urlWithPocketRedirect(url))).attr('target','_blank').click(function(e)
		{
			sync.sendAction({action:'opened_web'}, false);
		});
		anchor.remove();
	}
}));
/* global boot, logger, isChromePackagedApp, md5, RAL */

/**
 * Item Download is responsible for caching images and articles of one item
 * @param {object} item Item to cache
 */
function ItemDownloader(item) {
    logger.log("Start caching: " + item.given_url);

    this.cancelled = false;
    this.item = item;
    this.dbServer = boot.helper.db.server;
}

ItemDownloader.prototype = {

    /**
     * Start caching the item
     * @param  {Function} The callback for finished caching
     */
    startCaching: function(finishedCallback) {
        if (this.cancelled) {
            return;
        }

        this.finishedCallback = finishedCallback;
        this.cacheArticle();
    },

    /**
     * Cache the article of the item
     */
    cacheArticle: function() {
        if (this.cancelled) {
            return;
        }

        var self = this;

        // Start caching
        var url = this.item.resolved_url || this.item.given_url;
        boot.helper.assetCache.cacheArticleDataCallback(url, function(article) {
            // Caching the article was successfully go on to images
            self.cacheImages();
        },
        function(articleData) {
            // We got article data from remote save it as a instance variable for now
            self.articleData = articleData;
        },
        function() {
            // An error happened while caching the article just call the
            // finish callback and try again later
            self.finishedCallback(self.item);
        });
    },

    /**
     * Cache all images of an item
     */
    cacheImages: function() {
        if (this.cancelled) {
            return;
        }

        var self = this;

        // Check if we have images and if we don't have one just finish this
        // caching process
        if (typeof this.item.images === 'undefined' || !this.item.images) {
            this.finished();
            return;
        }

        var imagePromises = $.map(this.item.images, function(image, image_id) {
            if (self.cancelled) {
                return;
            }

            if (typeof image.src !== 'undefined') {
                var deferred = $.Deferred();
                boot.helper.assetCache.cacheImage(image.src, function() {
                    deferred.resolve();
                });
                return deferred.promise();
            }
        });

        // Wait until all images are fetched until we finish this item caching
        // process
        $.when.apply(null, imagePromises).done(function() {
            self.finished();
        });
    },

    /**
     * Call if all assets of an item finished
     */
    finished: function() {
        if (this.cancelled) {
            return;
        }

        var self = this;

        var errorCallback = function(e) {
            logger.log(e);
            self.finishedCallback(self.item);
        };

        // If we got article data during caching the article we use this
        // data to update the item data in the database
        if (typeof this.articleData !== 'undefined') {
            this.articleData.is_offline = '1';
            boot.helper.sync.updateExtendedDataForItem("update", this.articleData, this.item.item_id, this.item.local_item_id, function(fetchedItem) {
                self.finishedCallback(fetchedItem)
            });
            return;
        }

        // If we don't got any new item data we just set the is_offline property
        this.dbServer.items.get(this.item.local_item_id).done(function(fetchedItem){
            if (typeof fetchedItem === "undefined") {
                self.finishedCallback(fetchedItem);
                return;
            }

            fetchedItem.is_offline = '1';
            self.dbServer.items.update(fetchedItem).done(function() {
                self.finishedCallback(fetchedItem);
            })
            .fail(errorCallback);
        })
        .fail(errorCallback);
    },

    /**
     * Cancel an item downloader
     */
    cancel: function() {
        this.cancelled = true;
    }
};

// The Assets Cache manages the downloading, saving as well as loading assets
function AssetCache() {
    // Caching
    this.itemsCaching = [];
    this.itemDownloaders = [];
}

AssetCache.prototype = {

    /**
     * Initialize the AssetCache
     * @param  {Function} callback Function called after the AssetCache is initialized
     */
    init: function(callback) {
        var initRAL = function() {
            // Init RAL
            // Start the queue, maxed out to 4 connections
            RAL.Queue.setMaxConnections(4);
            RAL.Queue.start();

            callback();
        }.bind(this);

        // Wait for the file filesystem to be loaded before attempting anything
        if (RAL.FileSystem.isReady()) {
            initRAL();
        } else {
            RAL.FileSystem.registerOnReady(initRAL);
        }
    },

    /**
     * Checks if the article is offline available and if not it loads the article
     * from the API and caches it. In comparison to the loadArticle method is the
     * priority lower
     * @param  {string}   url           The article url
     * @param  {Function} callback      Function called if article was cached
     * @param  {Function} errorCallback Function called if an error occured
     */
    cacheArticle: function(url, callback, errorCallback) {
        this.loadArticlePriority(url, RAL.Queue.queuePriority.low, callback, errorCallback);
    },

    cacheArticleDataCallback: function(url, callback, dataCallback, errorCallback) {
        this.loadArticleCachedPriorityDataCallback(url, true,  RAL.Queue.queuePriority.low, callback, dataCallback, errorCallback);
    },

    /**
     * Helper method for loadArticlePriority with priority always be normal
     */
    loadArticle: function(url, callback, errorCallback) {
        this.loadArticlePriority(url, RAL.Queue.queuePriority.normal, callback, errorCallback);
    },

    /**
     * Helper method for loadArticleCachedPriority with priority always be normal
     */
    loadArticleCached: function(url, cached, callback, errorCallback) {
        this.loadArticleCachedPriority(url, cached, RAL.Queue.queuePriority.normal, callback, errorCallback);
    },

    /**
     * Helper method for loadArticleCachedPriority with cached always be true
     */
    loadArticlePriority: function(url, priority, callback, errorCallback) {
        this.loadArticleCachedPriority(url, true, priority, callback, errorCallback);
    },

    loadArticleCachedPriority: function(url, cached, priority, callback, errorCallback) {
        this.loadArticleCachedPriorityDataCallback(url, cached, priority, callback, undefined, errorCallback);
    },

    /**
     * Load the article directly from the API if we don't wan to cache the article,
     * else try to load the article from the harddrive if it's offline available,
     * else get it from the API and cache the article
     * @param  {string}   url           The article url
     * @param  {boolean}  cached        Declares if the article should be cached
     * @param  {number}   priority      The priority in the queue loading all assets
     * @param  {Function} callback      Function called if article was loaded from
     *                                  the hard drive or remote
     * @param  {Funciton} errorCallback Funciton called if an error occured
     */
    loadArticleCachedPriorityDataCallback: function(url, cached, priority, callback, dataCallback, errorCallback) {

        if (!errorCallback) {
            errorCallback = function() {};
        }

        if (!cached) {
            var remoteURL = this.remoteArticleURL(url);
            RAL.Loader.load(remoteURL, 'json', 'POST', function(data) {
                var parsedData = data;
                if (typeof data !== "object") {
                    parsedData = JSON.parse(data);
                }
                callback(parsedData.article);
            }, function() {
                if (errorCallback) { errorCallback() }
            });

            return;
        }

        var localURL = this.localCachedURL(url, 'article');
        var remoteURL = this.remoteArticleURL(url);
        var remoteText = new RAL.RemoteArticle({
            src: remoteURL,
            localFilePath: localURL
        });
        remoteText.priority = (typeof priority !== 'undefined') ? priority : RAL.Queue.queuePriority.normal;
        remoteText.addMessageHandler('remoteloaded', function(articleData) {
            // Update the data in the database with data from the getting process
            if (typeof dataCallback !== 'undefined') {
                dataCallback(articleData);
            }
        });
        remoteText.addMessageHandler('articleloaded', function(article) {
            callback(article);
        });
        remoteText.addMessageHandler('errorloading', function() {
            if (errorCallback) { errorCallback() }
        });

        RAL.Queue.add(remoteText, true);
    },

    /**
     * Create the article url for downloading the article
     * @param  {string} url The origin url of the item
     * @return {string} The url to load the article
     */
    remoteArticleURL: function(url) {
        var remoteArticleURL = 'http://text.readitlater.com/v3beta/text?images=2&output=json&msg=1';
        if (!isChromePackagedApp()) {
            // Include videos
            remoteArticleURL += '&videos=1';
        }
        remoteArticleURL += ('&url=' + url);
        return remoteArticleURL;
    },

    /**
     * Remove article from the harddrive
     * @param  {string} url The url from the article to remove
     * @param  {Function} callback The callback for successful deletion
     * @param  {Function} errorCallback The callback for failed deletion
     */
    removeArticle: function(url, callback, errorCallback) {
        var localURL = this.localCachedURL(url, 'article');
        RAL.FileSystem.removeFile(localURL, callback, errorCallback);
    },

    /**
     * Cache an image on the hard drive
     * @param  {string}   url      The source url of the image to load
     * @param  {Function} callback Function gets called if the image was cached
     */
    cacheImage: function(url, callback) {
        this.loadImageCachedWithTypePriority(url, true, 'image', RAL.Queue.queuePriority.low, callback);
    },

    /**
     * Helper method for loadImageCached and we always cache the image we load
     * with this method.
     */
    loadImage: function(url, callback) {
        this.loadImageCached(url, true, callback);
    },

    /**
     * Helper method for loadImageCachedWithType but with type of 'image'.
     */
    loadImageCached: function(url, cached, callback) {
        this.loadImageCachedWithType(url, cached, 'image', callback);
    },

    /**
     * Helper method for loadImageCachedWithTypePriority but with priority of 1.
     * This has the effect that loading normal images get a higher priority
     * loading images for the caching purpose
     */
    loadImageCachedWithType: function(url, cached, type, callback) {
        this.loadImageCachedWithTypePriority(url, cached, type, RAL.Queue.queuePriority.normal, callback);
    },

    /**
     * Load image, the cached parameter defines if the image should be cached
     * on the harddrive or it should just load it without caching it. If an
     * error occurs we will call the callback with undefined
     * @param  {string}   url       The image src to load and cache
     * @param  {boolean}  cached    Declares if the image should be cached or not
     * @param  {number}   priority  The priority in the queue loading all assets
     * @param  {string}   type      The type of image to load
     * @param  {Function} callback  The callback after image loading
     */
    loadImageCachedWithTypePriority: function(url, cached, type, priority, callback) {

        if (!cached) {
            // Just download it temporarily and don't cache it, this is
            // especially for items with the read status and favicons
            RAL.Loader.load(url, 'blob', 'GET', function(data) {
                var imageSrc = window.webkitURL.createObjectURL(data);

                var image = new Image();
                image.onload  = function() {
                    callback(this);
                };
                image.onerror = function() {
                    callback(undefined);
                };
                image.src = imageSrc;
            },
            function(error) {
                callback(undefined);
            });

            return;
        }

        var localURL = this.localCachedURL(url, type);
        var remoteImage = new RAL.RemoteImage({
            src: url,
            localFilePath: localURL
        });
        remoteImage.priority = (typeof priority !== 'undefined') ? priority : RAL.Queue.queuePriority.normal;
        remoteImage.addMessageHandler('imageloaded', function(img) {
            callback(img);
        });
        remoteImage.addMessageHandler('errorloading', function() {
            callback(undefined);
        });

        RAL.Queue.add(remoteImage, true);
    },

    /**
     * Load favicon for url. If online try to load it from the image server
     * if offline load a colored image
     * @param  {string} url for favicon
     * @param  {Function} The callback for successfull loading the favicon
     */
    loadFavicon: function(url, callback) {
        // We are online try to load it from the image server and don't cache it
        if (RAL.NetworkMonitor.isOnline()) {
            this.loadImageCached(url, false, callback);
            return;
        }

        // We are offline just use a random colored favicon image
        if (!this.favicons) {
            if (isChromePackagedApp()) {
                this.favicons = ["a/i/favicon_green.png","a/i/favicon_blue.png","a/i/favicon_orange.png","a/i/favicon_red.png"];
            }
            else {
                this.favicons = ["i/favicon_green.png","i/favicon_blue.png","i/favicon_orange.png","i/favicon_red.png"];
            }
        }

        var favicon = this.favicons[Math.floor(Math.random() * (this.favicons.length-1))];
        var localFaviconURL = isChromePackagedApp() ? chrome.runtime.getURL(favicon) : favicon;

        // Load colored favicon image
        var image = new Image();
        image.onload  = function() {
            callback(this);
        };
        image.src = localFaviconURL;
    },

    /**
     * Load avatar
     * @param  {string}   url
     * @param  {Function} callback The callback for successfull loading an avatar
     */
    loadAvatar: function(url, callback) {
        this.loadImageCachedWithType(url, true, 'avatar', callback);
    },

    /**
     * Remove image from harddrive
     * @param  {string}   url Source URL from the image to remove
     * @param  {function} callback The callback for successfull removing
     * @param  {function} errorCallback The callback if an error occurs
     */
    removeImage: function(url, callback, errorCallback) {
        var localURL = this.localCachedURL(url, "image");
        RAL.FileSystem.removeFile(localURL, callback, errorCallback);
    },

    /**
     * Clear the offline cache
     */
    clearCache: function() {
        var dummy = function() {};
        RAL.FileSystem.removeDir('/images/', dummy, dummy);
        RAL.FileSystem.removeDir('/articles/', dummy, dummy);
        RAL.FileSystem.removeDir('/avatars/', dummy, dummy);
    },

    /**
     * Cancel all ongoing requests
     */
    cancelAllRequests: function() {
        $.each(this.itemDownloaders, function(idx, itemDownloader) {
            itemDownloader.cancel();
        });
        this.itemDownloaders = [];
        this.itemsCaching = [];
        RAL.Queue.clear();
    },

    /**
     * Cache Assets for an item
     * @param  {object}   item The item we want to cache
     * @param  {Function} callback The callback get's called if the item was successfully cached
     */
    cacheAssetsForItem: function(item, callback) {
        var self = this;

        // If item is not offline and the item is not currently in the caching
        // process start to cache the item
        if ((item.is_offline === false || item.is_offline === '0') &&
            $.inArray(item.item_id, this.itemsCaching) == -1)
        {
            self.itemsCaching.push(item.item_id);

            var itemDownloader = new ItemDownloader(item);
            self.itemDownloaders.push(itemDownloader);
            itemDownloader.startCaching(function(cachedItem) {
                if (typeof cachedItem !== 'undefined') {
                    self.itemsCaching.splice($.inArray(item.item_id, self.itemsCaching), 1);
                    self.itemDownloaders.splice($.inArray(itemDownloader, self.itemDownloaders), 1);
                }
                callback(cachedItem);
            });
        }
    },

    /**
     * Remove assets for an item
     * @param  {object} item Item to remove all assets
     */
    removeAssetsForItem: function(item) {
        var self = this,
            dummy = function() {};

        // Remove cached article
        var url = item.resolved_url || item.given_url;
        this.removeArticle(url, dummy, dummy);

        // Remove cached image
        if (item.images) {
            $.each(item.images, function(idx, image) {
                self.removeImage(image.src, dummy, dummy);
            });
        }
    },

    /**
     * Get cached url from the harddrive. We use this url for saving the file
     * as well as loading the file from the harddrive
     * @param  {string} url The url of the file that gets cached
     * @param  {string} type The type for creating the url
     * @return {string} The local file path to the cached file behind the url
     */
    localCachedURL: function(url, type) {
        var md5OfURL = md5(url);

        if (type === "image") {
            return "/images/" + md5OfURL + ".png";
        }
        else if (type === "article") {
            return "/articles/" + md5OfURL + ".html";
        }
        else if (type === "avatar") {
            return "/avatars/" + md5OfURL + ".png";
        }

        return md5OfURL;
    }
};
function Login()
{

}

Login.prototype =
{
    init : function(loginCallback)
    {
        var self = this;

        this.page = $("<div id='login-container'></div>");
        var loginContent = '<p id="info"></p> <p>Username:<br><input id="username" name="username" type="text" size="30" maxlength="30"></p> <p>Password:<br><input id="password" name="password" type="password" size="30" maxlength="40"></p><button id="submit-login">Submit</button>';
        this.page.append(loginContent);
        $("#container").hide();
        $("#queue_title").hide();

        $("body").append(this.page);

        // Add events
        $("#submit-login").click(function () {
            var username = $("#username").val();
            var password = $("#password").val();
            self.login(username, password, {
                success : function () {
                    self.page.remove();
                    $("#container").show();
                    boot.loggedIn();
                },
                error : function (args) {
                    $("#info").html("There was an error in the login process.");
                    logger.log("Error: " + args);
                }
            });
        });
    },

    // representation of 'load' and 'reload'

    loadState : function(state)
    {
        if (!this.inited)
            this.init();

        var self = this;

        this.stateChanged();
    },

    // representation of 'load new page'

    stateChanged : function()
    {
        boot.showPage(this);
    },

    didShow : function () {

    },

    willHide : function () {

    },

    login : function (username, pass, callbacks)
    {
        try {
            var self = this;

            this.apiRequest({
                path: '/oauth/authorize',
                data: {
                    username: username,
                    password: pass,
                    grant_type: "credentials"
                },
                success: function (data) {
                    // data: access_token=sdlkfsldkjfksldf&username=ksdjflaksf
                    logger.log("success");
                    var dataArray = data.split("&");
                    var accessToken = dataArray[0].split("=")[1];

                    loggedInUser.setUsername(username);
                    loggedInUser.setAccessToken(accessToken);

                    callbacks.success();
                },
                error: function () {
                    callbacks.error.apply(callbacks, Array.apply(null, arguments));
                }
            });
        } catch(e) {logger.log(e);}
    },

    apiRequest : function(options)
    {
        var url = "https://getpocket.com/v3" + options.path;
        var data = options.data || {};
        data["consumer_key"] = PKTConsumerKey;
        $.ajax({
            url: url,
            type: "POST",
            data: data,
            success: options.success,
            error: options.error
        });
    }
};

var login = new Login();
boot.pages.login = login;
TagSidebar.UNTAGGED = "_untagged_";
TagSidebar.KEY_ORIGINAL_TAG = "key_original_tag";


// ID and Class Constants
// Layout

TagSidebar.ID_CONTAINER = "tag_sidebar_content_container";
TagSidebar.sID_CONTAINER = idToSelector( TagSidebar.ID_CONTAINER );

TagSidebar.CLASS_PINNED = "pinned";
TagSidebar.sCLASS_PINNED = idToSelector( TagSidebar.CLASS_PINNED );

TagSidebar.CLASS_UNPINNED = "unpinned";
TagSidebar.sCLASS_UNPINNED = idToSelector( TagSidebar.CLASS_UNPINNED );

TagSidebar.ID_WRAPPER = "sidebar_wrapper";
TagSidebar.sID_WRAPPER = idToSelector( TagSidebar.ID_WRAPPER );

TagSidebar.ID = "tag_sidebar_content";
TagSidebar.sID = idToSelector( TagSidebar.ID );

TagSidebar.CLASS_SLIDER = "sidebar_slider";
TagSidebar.sCLASS_SLIDER = classToSelector( TagSidebar.CLASS_SLIDER );

TagSidebar.ID_LIST = "tag_sidebar_list";
TagSidebar.sID_LIST = idToSelector( TagSidebar.ID_LIST );

TagSidebar.ID_FILTERS = "tag_sidebar_filters";
TagSidebar.sID_FILTERS = idToSelector( TagSidebar.ID_FILTERS );

TagSidebar.ID_VIEW_ALL = "tag_sidebar_filter_all";
TagSidebar.sID_VIEW_ALL = idToSelector( TagSidebar.ID_VIEW_ALL );

TagSidebar.ID_VIEW_UNTAGGED = "tag_sidebar_filter_untagged";
TagSidebar.sID_VIEW_UNTAGGED = idToSelector( TagSidebar.ID_VIEW_UNTAGGED );

// Buttons

TagSidebar.ID_EDITTING = "inline_tag_edit";
TagSidebar.sID_EDITTING = idToSelector( TagSidebar.ID_EDITTING );

TagSidebar.CLASS_EDIT = "edit";
TagSidebar.sCLASS_EDIT = classToSelector( TagSidebar.CLASS_EDIT );

TagSidebar.CLASS_EDIT_CLOSE = "edit_close";
TagSidebar.sCLASS_EDIT_CLOSE = classToSelector( TagSidebar.CLASS_EDIT_CLOSE );

TagSidebar.CLASS_SELECT = "select";
TagSidebar.sCLASS_SELECT = classToSelector( TagSidebar.CLASS_SELECT );

TagSidebar.CLASS_DELETE = "delete";
TagSidebar.sCLASS_DELETE = classToSelector( TagSidebar.CLASS_DELETE );

TagSidebar.CLASS_SELECTED = "selected";
TagSidebar.sCLASS_SELECTED = classToSelector( TagSidebar.CLASS_SELECTED );

// Animation

TagSidebar.CLASS_VISIBLE = "tag_sidebar_visible";
TagSidebar.sCLASS_VISIBLE = classToSelector( TagSidebar.CLASS_VISIBLE );

TagSidebar.CLASS_INVISIBLE = "tag_sidebar_invisible";
TagSidebar.sCLASS_INVISIBLE = classToSelector( TagSidebar.CLASS_INVISIBLE );




function idToSelector(id)
{
	return '#' + id;
}

function classToSelector(c)
{
	return '.' + c;
}

function TagSidebar()
{
	this.created = false;
	this.loadedTags = false;
	this.selectedTag;
	this.rows = {};
	this.tags = [];
	this.deleteClickedFlag = false;
	this.scrollKit =
	{
		pinnedDirection : 0, // constant?  1 up -1 down 0 not pinned
		lastScrollY : $(window).scrollTop()
	}
	this.contentDiv;
	this.wrapper;
	this.layoutInfoCache = {
		headersHeight : 0,
		footersHeight : 0,
	}
	this.isHorizontallyOffset = false;
}





TagSidebar.prototype =
{
	setTag : function(tag, noChangeState, proceedIfSame)
	{
		if(!this.created)
		{
			this.selectedTag = tag;
			if(tag)
			{
				if(tag == TagSidebar.UNTAGGED)
					breadcrumbName = 'Untagged';
				else
					breadcrumbName = tag;
			}
		}
		else
		{
			var breadcrumbName = false;

			if(tag == this.selectedTag && !proceedIfSame)
				return; // Already in this state.

			// Set
			this.selectedTag = tag;

			// Clear any selected classes
			$(TagSidebar.sID + ' ' + TagSidebar.sCLASS_SELECTED).removeClass(TagSidebar.CLASS_SELECTED);

			// Update UI
			if(tag)
			{

				if(tag == TagSidebar.UNTAGGED)
				{
					$(TagSidebar.sID_VIEW_UNTAGGED).addClass(TagSidebar.CLASS_SELECTED);
					breadcrumbName = 'Untagged';
				}
				else
				{
					if (this.rows[tag])
					{
						this.rows[tag].addClass(TagSidebar.CLASS_SELECTED);
						breadcrumbName = tag;
					}
				}
			}
			else
			{
				$(TagSidebar.sID_VIEW_ALL).addClass(TagSidebar.CLASS_SELECTED);
			}
		}

		this.setBreadcrumb(breadcrumbName);

		// Call up an update if needed
		if (!noChangeState)
			queue.stateChanged();

	},

	// Sidebar Display Changes //

	isOpen : function()
	{
		return this.contentDiv && this.contentDiv.hasClass(TagSidebar.CLASS_VISIBLE);
	},

	show : function(show, noAnimation)
	{
		var slider = $(TagSidebar.sCLASS_SLIDER);
		if(!slider.size())
			slider = this.create(noAnimation);

		var fromClass = show ? TagSidebar.CLASS_INVISIBLE : TagSidebar.CLASS_VISIBLE;
		var toClass = show ? TagSidebar.CLASS_VISIBLE : TagSidebar.CLASS_INVISIBLE;

		if(slider.hasClass(toClass))
			return; // Already set to this state

		if(show)
			this.pin();

		// Perform the slide in 10ms in order to ensure slide animation happens after possible pin/unpin change
		var self = this;
		setTimeout(function()
		{
			slider.each(function()
			{
				var thisSlider = $(this);
				if(noAnimation)
					thisSlider.addClass('noAnimation');
				else
					thisSlider.removeClass('noAnimation');

				thisSlider.removeClass(fromClass);
				thisSlider.addClass(toClass);
			});

			if(show)
			{
				self.pin();
				$('#page_queue').addClass('tag_sidebar_open');
			}
			else
			{
				$('#page_queue').removeClass('tag_sidebar_open');
			}

			self.heightUpdated();
		}, 30);
	},

	pin : function(sidebar, direction, top)
	{
		this.resetHorizontalOffset();

		if(!sidebar)
		{
			sidebar = this.contentDiv;
			var top = $(window).scrollTop();
			var container = $('#page_queue');
			if(sidebar && top < container.height() - sidebar.height())
			{
				// unpin at top of window
				direction = 0;

			} else {
				this.scrollKit.lastScrollY = top;
				this.checkPinning();
				return;
			}
		}

		if(!direction)
		{
			if( !$(TagSidebar.sID_CONTAINER).hasClass(TagSidebar.CLASS_UNPINNED) )
			{
				$(TagSidebar.sID_CONTAINER).removeClass(TagSidebar.CLASS_PINNED);
				$(TagSidebar.sID_CONTAINER).addClass(TagSidebar.CLASS_UNPINNED);
			}
			// else already unpinned
		}
		else if( !$(TagSidebar.sID_CONTAINER).hasClass(TagSidebar.CLASS_PINNED) )
		{
			$(TagSidebar.sID_CONTAINER).removeClass(TagSidebar.CLASS_UNPINNED);
			$(TagSidebar.sID_CONTAINER).addClass(TagSidebar.CLASS_PINNED);
		}
		// else already pinned

		// check some ranges
		if(direction == 0)
		{
			if(top < 0)
				top = 0;
		}

		sidebar.css('top', top);
		this.scrollKit.pinnedDirection = direction;

	},

	checkPinning : function()
	{
		var scrollPosition = $(window).scrollTop();

		if(this.contentDiv)
		{
			var sidebarHeight = this.contentDiv.outerHeight();
			var windowHeight = $(window).height();

			if(this.contentDiv.outerHeight() < windowHeight - this.layoutInfoCache.footersHeight - this.layoutInfoCache.headersHeight)
			{
				// Smaller than viewport,

				if(this.loadedTags)
				{
					// Should just be pinned at top, no need for anything else
					if(this.scrollKit.pinnedDirection == 0) // Not currently pinned
						this.pin(
							this.contentDiv,
							1,
							this.layoutInfoCache.headersHeight
					);
				}
				else
				{
					// Should just be unpinned at top, no need for anything else
					if(this.scrollKit.pinnedDirection == 0) // Not currently pinned
						this.pin(
							this.contentDiv,
							0,
							0
					);
				}
			}
			else
			{
				var diff = scrollPosition - this.scrollKit.lastScrollY;
				var direction;
				if(diff > 0)
					direction = 1;
				else if(diff < 0)
					direction = -1;
				else
					direction = 0;

				if(this.scrollKit.pinnedDirection == 0) // Not currently pinned
				{
					var sidebarTop = this.contentDiv.offset().top;
					var viewOffset = windowHeight - this.layoutInfoCache.footersHeight;

					// Check if it should be pinned
					if(direction == 1 && scrollPosition >= (sidebarTop + sidebarHeight) - viewOffset)
						this.pin(
							this.contentDiv,
							1,
							viewOffset - sidebarHeight - this.layoutInfoCache.headersHeight
						);

					else if(direction == -1 && scrollPosition <= sidebarTop - this.layoutInfoCache.headersHeight)
						this.pin(
							this.contentDiv,
							-1,
							0
						);
					// else no changes needed
				}
				else if(direction != 0 && direction != this.scrollKit.pinnedDirection)
				{
					this.pin(
						this.contentDiv,
						0,
						scrollPosition + parseInt(this.contentDiv.css('top').replace('px',''))
					);
				}
			}
		}

		this.fixHorizontalPin();

		this.scrollKit.lastScrollY = scrollPosition;
	},

	fixHorizontalPin : function()
	{
		if(this.isPinned())
		{
			if( $(document).width() > $(window).width() )
			{
				// Make sure it is pinned correctly when window is narrow
				this.wrapper.css('left', (0 - $(window).scrollLeft()) + 'px');
				this.isHorizontallyOffset = true;
			}
			else if (this.isHorizontallyOffset)
			{
				this.resetHorizontalOffset();
			}
		}
	},

	resetHorizontalOffset : function()
	{
		// reset horizontal offset position
		this.wrapper.css('left', (0 - $(window).scrollLeft()) + 'px');
		this.isHorizontallyOffset = false;
	},

	isPinned : function()
	{
		return $(TagSidebar.sID_CONTAINER).hasClass(TagSidebar.CLASS_PINNED);
	},

	// Construction & Setup //

	create : function(noAnimation)
	{
		var sliderState = noAnimation ? TagSidebar.CLASS_VISIBLE : TagSidebar.CLASS_INVISIBLE;

		$('#page_queue').prepend(
			'<div id="tag_sidebar_content_container" >' +
			'	<div class="sidebar_wrapper">' +
			'		<div id="' + TagSidebar.ID + '" class="sidebar_content ' + TagSidebar.CLASS_SLIDER + ' ' + sliderState + '">' +
			'			<h3>Tags:</h3>' +
	    	'			<div class="divider"></div>' +
	    	'			<div class="loading"></div>' +
        	'		</div>' +
        	'	</div>' +
			'</div>'
       	);

       	queue.data.getTags({
			delegate 		: this,
			doneSelector 	: 'getTagsCallback'
		})

		this.layoutInfoCache.headersHeight = $('header').height() + $('#page nav').height();
		this.layoutInfoCache.footersHeight = $('footer').height();
		this.contentDiv = $(TagSidebar.sID);
		this.wrapper = $('#tag_sidebar_content_container .sidebar_wrapper');

		this.setupListeners();

		this.created = true;

		return $(TagSidebar.sCLASS_SLIDER);

	},

	setupListeners : function ()
	{
		// TICKETED : OPTIMIZATION unbind listeners when not needed, especially the scroll one
		// Try to cache some more values that don't change like widths or heights

		var self = this;
		$(window).scroll(function ()
		{
			if (queue.isOpen)
				self.checkPinning();
		});

		$(document).on('click',TagSidebar.sID_VIEW_ALL,function() {
			tagSidebar.pin();
		});
		$(document).on('click',TagSidebar.sID_VIEW_UNTAGGED,function() {
			tagSidebar.pin();
		});


	},

	getTagsCallback : function(data, o)
	{
		// TICKETED handle timeouts, failures etc

		// if all groovy and has tags
		this.buildTagList(data);
	},

	buildTagList : function(data)
	{
		$(TagSidebar.sID + ' .loading').remove();

		this.tags = data;
		var html =
			'<ul id="' + TagSidebar.ID_FILTERS + '">' +
			'	<li>' +
			'		<a id="' + TagSidebar.ID_VIEW_ALL + '" title="View all items" class="' + TagSidebar.CLASS_SELECT + '" href="'+queue.tagUrlPrefix+'">view all items</a>' +
			'	</li>' +
			'	<li>' +
			'		<a id="' + TagSidebar.ID_VIEW_UNTAGGED + '" title="View all untagged items" class="' + TagSidebar.CLASS_SELECT + '" href="'+queue.tagUrlPrefix+TagSidebar.UNTAGGED+'">view untagged items</a>' +
			'	</li>' +
			'</ul>' +
			'<div class="divider"></div>' +
			'<ul id="' + TagSidebar.ID_LIST + '"></ul></div>';

		$(TagSidebar.sID).append(html);

		// add rows
		var list = $(TagSidebar.sID_LIST);
		var row;
		for(var i = 0; i < data.length; i++) {
			row = this.getNewRow(data[i]);
			this.rows[data[i]] = row;
			list.append(row);
		}

		this.setTag(this.selectedTag, true, true);

		this.heightUpdated();

	},

	getNewRow : function(tag)
	{
		var row = $('<li></li>');
		this.setRowsTag(row, tag);
		return row;
	},

	setRowsTag : function(row, tag)
	{
		row.data('tag', tag);
		row.empty();

		var a = $('<a class="' + TagSidebar.CLASS_SELECT + '"></a>');
		a.attr('href', queue.tagUrlPrefix+encodeURIComponent(sanitizeText(tag)));
		a.html(sanitizeText(tag));

		//row.append('<a class="' + TagSidebar.CLASS_EDIT + '" title="Edit tag">edit</a>');
		row.append(a);
	},

	getRowsTag : function(row)
	{
		return row.data('tag');
	},

	refreshTagLinks : function()
	{
		$('#'+TagSidebar.ID_VIEW_ALL).attr('href', queue.tagUrlPrefix);
		$('#'+TagSidebar.ID_VIEW_UNTAGGED).attr('href', queue.tagUrlPrefix+TagSidebar.UNTAGGED);
		$(TagSidebar.sID_LIST + ' ' + TagSidebar.sCLASS_SELECT).each(function()
		{
			this.setAttribute('href', queue.tagUrlPrefix+encodeURIComponent(this.innerHTML))
		});
	},


	// Tag Editing //

	editStart : function(tagToEdit)
	{
		var self = this;
		var editing = {
			tag : tagToEdit,
			row : $(this.rows[tagToEdit]),
			isFinishing : false,
			// input : added below
			// deleteButton : added below
		}

		var pendingEdit = $(TagSidebar.sID_EDITTING);
		if(pendingEdit.size())
		{
			// finish previous edit before retrying this one
			this.editFinish(pendingEdit.data('editingData'));

			pendingEdit = $(TagSidebar.sID_EDITTING);
			if(pendingEdit.size())
				return; // still editing, ignore this edit
		}

		editing.row.empty();
		editing.row.addClass('inline_edit');

		editing.fieldset = $('<fieldset id="' + TagSidebar.ID_EDITTING + '"></fieldset>');
		editing.row.append(editing.fieldset);

		editing.input = $('<input type="text" maxlength="25" />');
		editing.input.val(tagToEdit);
		editing.fieldset.append(editing.input);

		editing.deleteButton = $('<a class="' + TagSidebar.CLASS_DELETE + '" title="Delete">delete</a>');
		editing.fieldset.append(editing.deleteButton);

		editing.fieldset.append('<a class="' + TagSidebar.CLASS_EDIT_CLOSE + '" title="Edit">edit</a> <div class="clear"></div>');

		editing.fieldset.data('editingData', editing);

		editing.input.bind('keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) { //Enter keycode
			  	self.editFinish(editing);
			}
		});

		var pendingBlur;
		$(editing.input).blur(function()
		{
			pendingBlur = setTimeout(function()
				 {
				 	self.editFinish(editing);
				 },
				 200
			);
		});

		$(editing.input).focus(function()
		{
			if(pendingBlur)
			{
				clearTimeout(pendingBlur);
				pendingBlur = null;
			}
		});

		editing.fieldset.find(TagSidebar.sCLASS_DELETE).click(function()
		{
			if(pendingBlur)
			{
				clearTimeout(pendingBlur);
				pendingBlur = null;
			}

			self.deleteTag(editing);
		});

		editing.input.focus();
		editing.input.select();

	},

	editFinish : function(editing)
	{
		if(editing.isFinishing)
			return;

		editing.isFinishing = true;
		editing.newTag = $.trim(editing.input.val()).toLowerCase();
		this.editVerify(editing);
	},

	editVerify : function(editing)
	{
		var self = this;
		var dialog;

		if(editing.tag == editing.newTag)
		{
			this.editCommit(editing, true);
		}
		else
		{
			if(editing.newTag.length > 0)
			{

				if(editing.newTag == TagSidebar.UNTAGGED)
				{
					createDialog({
						anchor : editing.input,
						title : 'Tag not allowed',
						message : 'The tag <span class="tag">"' + TagSidebar.UNTAGGED + '"</span> is not allowed, please choose a different one.',
						confirm : {
							title : 'Ok',
							action : function()
							{
								editing.isFinishing = false;
								editing.input.focus();
							},
						},
					});
					return;
				}

				var exists = false;
				for (var i = 0; i < this.tags.length; i++)
				{
					if(this.tags[i] == editing.newTag)
					{
						exists = true;
						break;
					}
				}

				if (exists) {
					createDialog({
						anchor : editing.input,
						title : 'Tag already exists',
						message :
							'<span class="tag">"' + editing.newTag + '"</span class="tag"> already exists, would you like to merge ' +
							'<span class="tag">"' + editing.tag + '"</span class="tag"> into <span class="tag">"' + editing.newTag + '"</span class="tag">?',
						confirm : {
							title : 'Yes',
							action : function()
							{
								self.mergeTags(editing);
							},
						},
						cancel : {
							action : function ()
							{
								self.editCommit(editing, true);
							},
						},
					});
				}
				else {
					this.editCommit(editing);
				}

			} else {
				//
				this.editCommit(editing, true);
			}
		}

	},

	editCommit : function(editing, noChange)
	{
		if(noChange)
			editing.newTag = editing.tag;

		this.setRowsTag(editing.row, editing.newTag);
		$(editing.row).removeClass('inline_edit');

		if(!noChange)
		{
			this.updateArrays(editing.tag, editing.newTag);

			this.renameTag(editing);

		}

	},

	renameTag : function(editing)
	{
		queue.data.renameTag({
			data : {
				oldTag : editing.tag,
				newTag : editing.newTag
			}
		});
		queue.tagRenamed(editing.tag, editing.newTag);

		// if it's the current tag, we need to update the url
		if (editing.tag == this.selectedTag)
			setTimeout(function(){tagSidebar.setTag(editing.newTag);},100);

	},

	deleteTag : function(editing)
	{
		var self = this;
		createDialog({
			anchor : editing.deleteButton,
			title : 'Are you sure?',
			message : 'This will untag the tag <span class="tag">"'+editing.tag+'"</span> from any items that have been tagged with it.',
			confirm : {
				title : 'Delete',
				action : function()
				{
					editing.row.remove();

					queue.data.deleteTag({data:{tag : editing.tag}});
					queue.tagDeleted(editing.tag);

					if(self.selectedTag == editing.tag)
					{
						self.setTag(null);
					}

					self.updateArrays(editing.tag);

					self.heightUpdated();
				},
			},
			cancel : {
				action : function ()
				{
					editing.isFinishing = false;
					editing.input.focus();
				},
			},

		});
	},

	mergeTags : function(editing)
	{
		editing.row.remove();

		this.updateArrays(editing.tag);

		this.renameTag(editing);

		this.heightUpdated();
	},

	updateArrays : function(tag, newTag)
	{

		if(newTag)
		{	// Rename

			// update rows array
			this.rows[newTag] = this.rows[tag];
			delete this.rows[tag];

			// update tags array
			// remove old name and insert new name in right location (alphabetical)
			var removedOld = false;
			var insertedNew = false;
			var insertBeforeRow; // list elements
			for(var i = 0; i < this.tags.length; i++)
			{
				if(!removedOld && this.tags[i] == tag)
				{
					this.tags.splice(i, 1);
					removedOld = true;
				}

				if(!insertedNew)
				{
					if (this.tags[i] > newTag)
					{
						insertBeforeRow = this.rows[this.tags[i]];
						this.tags.splice(i > 0 ? i - 1 : 0, 0, newTag);
						insertedNew = true;
					}
					else if (i == this.tags.length - 1)
					{
						insertBeforeRow = null;
						this.tags.push(newTag);
						insertedNew = true;
					}
				}

				if(insertedNew && removedOld)
					break;
			}

			// Move element //
			if(insertBeforeRow)
				this.rows[newTag].insertBefore(insertBeforeRow);
			else
				$('#tag_sidebar_list').append(this.rows[newTag]);

			// Move renamed row to alphabetical location
			this.scrollToTag(newTag);

		}
		else
		{	// Delete

			delete this.rows[tag];

			for(var i = 0; i < this.tags.length; i++)
			{
				if(this.tags[i] == tag)
				{
					this.tags.splice(i,1);
					break;
				}
			}

		}

	},

	scrollToTag : function(tag)
	{
		var row = this.rows[tag];

		// Gather position info //

		var container = $('#page_queue');
		var scrollPosition = $(window).scrollTop();
		var screenHeight = $(window).height();
		var headersHeight = $('header').height() + $('#page nav').height();

		var view = {
			top : scrollPosition + headersHeight,
			bottom : scrollPosition + screenHeight - $('footer').height(),
		};

		var sidebar = this.contentDiv.offset();
		sidebar.height = this.contentDiv.height();
		sidebar.bottom = sidebar.top + sidebar.height;

		var tag = row.offset();
		tag.height = row.outerHeight();
		tag.bottom = tag.top + tag.height;

		// Determine scroll ranges that the sidebar could handle itself //

		// within container:
		var toTop = headersHeight - sidebar.top; // should be negative
		var toBottom = (container.offset().top + container.height()) - sidebar.bottom; // should be positive
		// overscroll (the top or bottom edge becoming visible instead of locking to screen)
		var overscrollUp = view.bottom - sidebar.bottom; // should be negative
		var overscrollDown = view.top - sidebar.top; // should be positive
		// combine these ranges (take the smaller)
		sidebar.ranges =
		{
			min : toTop > overscrollUp ? toTop : overscrollUp,
			max : toBottom > overscrollDown ? overscrollDown : toBottom,
		}

		// Determine scroll amounts needed to show the tag //

		var needsToScroll = true;
		var scrollMin;
		var scrollIdeal = view.top - tag.top;

		if(tag.top < view.top)
			scrollMin = scrollIdeal;
		else if (tag.top > view.bottom)
			scrollMin = view.bottom - tag.top - tag.height;
		else
			needsToScroll = false; // Already on screen

		if(needsToScroll)
		{
			var scrollAmount;
			var scrollOnlySidebar = true;

			if(scrollIdeal >= sidebar.ranges.min && scrollIdeal <= sidebar.ranges.max)
				scrollAmount = scrollIdeal; // Ok to scroll to top
			else if(scrollMin >= sidebar.ranges.min && scrollMin <= sidebar.ranges.max)
				scrollAmount = scrollMin; // Can scroll by just getting it onto the screen somewhere. (bottom)
			else
			{
				// It will need to scroll the page, not just the sidebar
				scrollOnlySidebar = false;
			}

			var currentTop = parseInt( this.contentDiv.css('top').replace('px', '') );

			if(scrollOnlySidebar)
			{
				// Scroll only the sidebar //

				this.contentDiv.css('top', currentTop + scrollAmount + 'px');
				this.checkPinning();

				/*
				this.pin(
					self.contentDiv,
					0,
					currentTop + scrollAmount
				);
				*/

			}
			else
			{
				// Scroll the page instead //

				// Flip the scrollAmount because it is moving the viewport instead of the sidebar
				scrollIdeal = scrollIdeal * -1;
				scrollMin = scrollMin * -1;

				var docHeight = $(document).height();
				if(scrollIdeal + scrollPosition > 0 && scrollIdeal + scrollPosition < docHeight)
					scrollAmount = scrollIdeal;
				else if(scrollMin + scrollPosition > 0 && scrollMin + scrollPosition < docHeight)
					scrollAmount = scrollMin;
				else
					scrollAmount = 0;

				// Unpin the sidebar at current location and scroll whole page
				this.pin(
					this.contentDiv,
					0,
					sidebar.top
				);

				window.scrollBy(0, scrollAmount);

			}

		}


		// Highlight

		setTimeout(function()
		{
			row.addClass('highlighted');
			setTimeout(function()
			{
				row.addClass('highlight_fade');
				setTimeout(function()
				{
					row.removeClass('highlighted');
					row.removeClass('highlight_fade');
				}, 1000);
			}, 100);

		}, 30);


	},

	lookForNewtags : function( tags )
	{
		if (!this.created)
			return; // skip if not created yet

		for(var i=0; i<tags.length; i++)
		{
			if ($.inArray(tags[i], this.tags) == -1)
				this.addTag( tags[i] );
		}
	},

	addTag : function( newTag )
	{
		// New row
		var row = this.getNewRow(newTag);


		// Figure out where to insert into DOM and tags array
		var insertAt = this.tags.length;
		var insertBeforeRow; // list elements
		for(var i = 0; i < this.tags.length; i++)
		{
			if (this.tags[i] > newTag)
			{
				insertBeforeRow = this.rows[this.tags[i]];
				insertAt = i - 1;
				break;
			}
		}

		// Insert into array and DOM
		this.tags.splice(insertAt > 0 ? insertAt : 0, 0, newTag);
		this.rows[newTag] = row;

		if(insertBeforeRow)
			row.insertBefore(insertBeforeRow);
		else
			$('#tag_sidebar_list').append(row);

		this.heightUpdated();
	},

	setBreadcrumb : function( name )
	{
		if (name)
		{
			queue.tagwrapper.addClass('tag-withname');
			queue.searchwrapper.attr('placeholder','Search');
			queue.tagwrapper.find('.tag_name').html(name);
			var tagnewwidth = queue.tagwrapper.outerWidth();
			console.log('new widths',tagnewwidth,queue.tagwrapperinitwidth,queue.searchwrapperinitwidth);
			queue.searchwrapper.width(queue.searchwrapperinitwidth-(tagnewwidth-queue.tagwrapperinitwidth));
			queue.tagwrapper.find('li').removeClass('selected');
			queue.tagwrapper.find('li').filter('[val="' + encodeURIComponent(name) + '"]').addClass('selected');

		}
		else
		{
			queue.searchwrapper.width(queue.searchwrapperinitwidth);
			queue.tagwrapper.removeClass('tag-withname');
			queue.searchwrapper.attr('placeholder','Search by title or url');
			queue.tagwrapper.find('.tag_name').html('');
			queue.tagwrapper.find('li').removeClass('selected');
		}
	},

	getHeight : function()
	{
		if(this.isOpen())
			return this.contentDiv.outerHeight();
		else
			0;
	},

	heightUpdated : function()
	{
		var viewHeight = $(window).height() - this.layoutInfoCache.footersHeight - this.layoutInfoCache.headersHeight;
		var sidebarHeight = this.isOpen() ? this.contentDiv.outerHeight() : 0;

		queue.page.css('min-height', (viewHeight > sidebarHeight ? viewHeight : sidebarHeight) + 'px');

		this.checkPinning();
	},


}

var tagSidebar = new TagSidebar();


var PackagedAppData = DataAdapter.extend(
{
    /*
    Sends:
    o.data = {
        offset      : how far into the results to start similar to "LIMIT x, y" in MySql, offset being x
        count       : how many items to return from the result               ^ y in this example
        state       : [queue, favorite, archive]
        favorite    : [0,1]
        sort        : [newest,oldest,title,site]
        search      : a text string to search for against (resolved_title, given_title, resolved_url, given_url)
        tag     : a selected tag -- '__untagged__' means it wants only items that are NOT tagged
        view        : [list,grid] -- only need to get image and excerpt data in grid
        contentType : [article,video,image]
    }
    Expects: JSON
    {
        status      : [0,1] (fail/pass)
        list = [
            n   : {
                sort_id         : n - a value to order the results by
                item_id         : the item id
                resolved_id     : the resolved id
                given_url       : the url the user saved
                given_title     : the title the user saved
                resolved_url    : the actual url
                resolved_title  : the detected title
                favorite        : [0,1]
                status          : [0,1]
                excerpt         : the excerpt
                is_article      : [0,1]
                has_video       : [0,1]
                has_image       : [0,1]
                image           : { // thumbnail image
                    src : the url of the image
                    width : the detected width
                    height : the detected height
                }
                authors         : {
                    n : {
                        author_id   : author's id
                        name        : name of author
                        url         : author bio url
                    }
                }
            }
        ]
    }
    */

    // list
    getList : function( o )
    {
        this.get('get', o);
    },

    getShares : function( o )
    {
        this.get('getShares', o);
    },

    // actions
    itemAction : function( o )
    {
        this.send('itemAction', o, true);
    },

    bulkEdit : function( o )
    {
        this.send('bulkEdit', o, true);
    },

    opened : function( itemId, openType )
    {
        this.send('open', {data:{itemId:itemId,openType:openType}}, true);
    },

    // tags
    getTags : function( o )
    {
        this.get('getTags', o);
    },

    // requires data: oldTag, newTag
    renameTag : function( o )
    {
        this.send('renameTag', o, true);
    },

    // requires data: tag
    deleteTag : function( o )
    {
        this.send('deleteTag', o, true);
    },

    updateItemTags : function( item, tags )
    {
        this.send('updateTags', {
            data: {
                itemId : item.item_id,
                item: item,
                tagType:tags.length?'tags_replace':'tags_clear',
                tags: tags
            }
        });
    },

    // reader
    getArticle : function( o )
    {
        this.get('getArticle', o);
    },

    savePosition : function( o )
    {
        this.send('savePosition', o);
    },

    fetchList : function ( o )
    {
        this.get('fetch', o);
    },

    // sharing
    shareTo : function( o )
    {
        this.get('shareTo', o);
    },

    // make dynamic requests

    getWithDataParameter : function ( o )
    {
        this.get('getWithDataParameter', o);
    }
});
function Queue()
{
	this.nav = 'queue';
	this.defaultSection = 'Queue';
	this.defaultView = 'grid';
	this.css = [];
	this.scripts = [];
	this.pageSize = 30;
	this.remaining = true;
	this.data = new PackagedAppData();
	this.lastScrollTop = 0;
	this.items = [];
	this.itemsByID = {};
	this.initialView = true;
	this.itemHighlight = null;
	this.loadedItems = false;
	this.sawEmptyNotice = false;
	this.archiveTooltipPending = false;
}

Queue.prototype =
{
	init : function()
	{
		var self = this;

		// Nav
		// Create navigationItem
		this.navigationItem = $(
			'<div class="toolbar_queue navigationItem wrapper"><ul class="icons leftItem"><li id="pagenav_gridlist" class="pagenav_gridview"><a title="Grid View" data-intro="Tile/List View Toggle" data-position="bottom" href="#">Grid View</a></li>\
			<li id="pagenav_segmentarticles" class="pagenav_content_all"><a title="Viewing All Articles" data-intro="Content Filter" data-position="bottomlower" href="#">Viewing All Articles</a></li>\
			<li id="pagenav_addarticle"><a title="Add Article" data-intro="Save a URL" data-position="bottom" href="#">Add Article</a></li></ul>\
			<div class="wrapper_searchtag rightItem">\
				<div class="wrapper_tag" data-intro="Tag Filter" data-position="bottom">\
					<div class="tag_name"></div>\
					<a class="tag_clear" href="" title="Clear Tag Selection">Clear Tag Selection</a>\
				</div>\
				<div class="wrapper_search" data-intro="Search by title or URL" data-position="bottom">\
					<input id="page_search" type="text" placeholder="Search by title or URL">\
					<a id="search_clear" title="Clear Search">Clear Search</a>\
				</div>\
			</div>'
		);
		$('#page .pkt-nav').append(this.navigationItem);

		// state selector
		this.stateSelector = new DropSelector( {
			id:'queue_title',
			"class":'titleItem titleSelector mainMenu',
			nodeName:'h2',
			alignment: 'bottom',
			append: $("body"),
			showClass: 'innerpopover-active',
			insertBefore:$('#page_search'),
			noValChange: ['options','help'],
			list:[dsi('queue','Home'),dsi('favorites','Favorites'),dsi('archive','Archive'),dsi('options','Options'),dsi('help','Help'),dsi('logout', 'Logout')],
			selectCallback:function(selector,li)
			{
				var val = $(li).attr('val');
				if (val != 'options' && val != 'help')
				{
					if (val !== 'queue')
					{
						$('.mainMenu').addClass('mainMenu-nonimg');
					}
					else
					{
						$('.mainMenu').removeClass('mainMenu-nonimg');
					}
					$(li).closest('.popover-new').removeClass('popover-bump-right popover-bump-extraright');
					if (val == 'favorites')
					{
						$(li).closest('.popover-new').addClass('popover-bump-right');
					}
					if (val == 'archive' || val == 'options' || val == 'help')
					{
						$(li).closest('.popover-new').addClass('popover-bump-extraright');
					}
				}
				if (val == 'options')
				{
					window.open('http://getpocket.com/options', '_blank');
				}
				else if (val == 'help')
				{
					window.open('http://help.getpocket.com', '_blank');
				}
				else if (val == 'logout')
				{
					boot.logout(true, false);
					return false;
				}

				return true;
			},
			callback:function()
			{
				tagSidebar.setTag(false, true);
				self.stateChanged();
			},
			hideUntilSet:true
		});

		// search
		this.searchField = $('#page_search');
		var searchClear = $('#search_clear');
		searchClear.hide();
		this.searchField.keyup(function()
		{
			if (self.reloadTO)
				clearTimeout(self.reloadTO);
			self.reloadTO = setTimeout(function(){self.reloadList();}, 500);

			if($(this).val().length > 0)
				searchClear.show();
			else
				searchClear.hide();

		});
		searchClear.click(function()
		{
			searchClear.hide();
			queue.searchField.val('');
			self.reloadList();
		});

		// tagging
		this.tagSelector = new DropSelector( {
			id:'pagenav_tagfilter',
			"class":'titleItem titleSelector',
			nodeName:'div',
			alignment: 'bottomleft',
			append: $(".wrapper_tag"),
			showClass: 'innerpopover-active',
			list:[dsi('all','All Items'),dsi('untagged','Untagged Items')],
			selectCallback:function(selector,li)
			{
				var val = $(li).attr('val');
				return true;
			},
			callback:function()
			{
			},
			hideUntilSet:false
		});
		queue.data.getTags({
			delegate: this,
			doneSelector: "tagsReady"
		});
		this.tagwrapper = $('.wrapper_tag');
		this.tagwrapperinitwidth = $('.wrapper_tag').outerWidth();
		this.searchwrapper = $('#page_search');
		this.searchwrapperinitwidth = parseInt(this.searchwrapper.css('width'));
		$('.tag_name').click(function() { $('#pagenav_tagfilter > a').trigger('click'); });

		// article filters
		this.articleFilterMenu = new DropSelector( {
			id:'pagenav_segmentsfilter',
			"class":'titleSelector',
			nodeName:'div',
			append: $("#pagenav_segmentarticles"),
			alignment: 'bottomright',
			showClass: 'innerpopover-active',
			list:[dsi('all','All Items'),dsi('articles','Articles'),dsi('videos','Videos'),dsi('images','Images')],
			selectCallback:function(selector,li)
			{
				var filteroption = $(li).attr('val');
				var filtermap = {'all': -1, 'articles': 0, 'videos': 1, 'images' : 2};
				if (typeof self.contentTypeControl == 'object')
				{
					self.contentTypeControl.set(filtermap[filteroption]);
				}
				return true;
			},
			callback:function()
			{

			},
			hideUntilSet:false
		});
		$('#pagenav_segmentarticles > a').click(function(){
			self.articleFilterMenu.show($('#pagenav_segmentarticles'));
		});

		// add url trigger
		$('#pagenav_addarticle > a').click(function(e){
			e.preventDefault();
			if(!self.addMenu)
			{
				self.addMenu = new PopOver(
					"addMenu",
					'<div class="container"><h5>Save an item to Pocket</h5><p>For even easier saving, <a href="#" class="install_ext">connect</a> the Pocket Button</p><input type="text" placeholder="http://..."><a href="#" class="button button-disabled">Save</a></div>',
					$("#container"),
					{
						positions: ['bottomleft','bottomright'],
						hideOnClickInPopover: false,
						xOffset: 0,
					}
				);
				function checkDisabled(e)
				{
					var input = $('#addMenu input');
					if (input.val().trim().length && input.val().trim().indexOf('getpocket.com/a') == -1) 
					{
						input.siblings('.button').removeClass('button-disabled');
					}
					else
					{
						input.siblings('.button').addClass('button-disabled');
					}
					if (e && e.keyCode == 13) {
	                    e.preventDefault();
	                    input.siblings('.button').trigger('click');
	                }
				}
				$('#addMenu input').keyup(checkDisabled);
				$('#addMenu input').on('paste',function(e)
				{
					setTimeout(checkDisabled,50);
				});
				$('#addMenu .button').click(function(e)
				{
					e.preventDefault();
					if ($(this).hasClass('button-disabled'))
					{
						return;
					}
					var targeturl = $(this).siblings('input').val().trim();
					if (targeturl.indexOf('http') == -1 && /\.\w\w/.test(targeturl))
					{
						targeturl = 'http://' + targeturl;
					}
					boot.helper.sync.addURL({
						url: targeturl
					},
					function() {
						sharedToast.show('Added to List');
					},
					function(error) {
						boot.showErrorNotification(error.message);
					});
					self.addMenu.show(false);
					$(this).addClass('button-disabled');
					$(this).siblings('input').val('');
				});
				$('#addMenu .install_ext').click(function(e)
				{
					e.preventDefault();
					boot.UserNotices.extinstalled = true;
					boot.saveUserNotices();
					self.addMenu.show(false);
					self.gsfOpenInitOverlay(true);
				});
			}
			if (boot.GSFStatus.extinstalled || boot.UserNotices.extinstalled || (PocketUserApps.ready && PocketUserApps.installedExtension()))
			{
				self.addMenu.object.addClass('addmenu-hideconnect');
			}
			self.addMenu.show($('#pagenav_addarticle > a'));
			setTimeout(function()
			{
				$('#addMenu input').focus();
			}, 50);
			
		});
		// Page
		// Create page
		this.page = $(
			'<div id="page_queue" class="wrapper tag_sidebar_holder"><div id="queue_list_wrapper"><ul id="queue" class="queue_list"></ul></div><div class="clear"></div></div>'
		);
		$('#content').append(this.page);


		// Footer
		// Add footer

		// bulk edit
		this.bulkEditToggle = new ToolbarEdgeButton({title:'Bulk Edit',id:'bulk_edit_toggle_button',left:true,callback:function(toggle){self.showBulkEdit(toggle);}})

		// segment control
		this.contentTypeControl = new ToolbarSegmentControl({callback:function(){self.reloadList();}, items:[{"class":'article',title:'View Articles'},{"class":'video',title:'View Videos'},{"class":'image',title:'View Images'}]});

		// dynamic spacer that goes next to breadcrumb
		this.breadCrumbSpacer = new Spacer();

		// Grab references
		this.queueList = $('#queue');

		/**
		 * Register to Events
		 */

		$(document).smartscroll(function() {
			this.scrolled();
		}.bind(this));

		$(document).on('startFetching', function() {
			self.queueFetching = true;
			OverlayScreen.setDetail('<p>Retrieving Your List...</p>');
			OverlayScreen.show(true);
		});

		$(document).on('finishFetching', function() {
			self.queueFetching = false;
			OverlayScreen.hide();
			self.reloadList();

			self.data.getTags({
                delegate: self,
                doneSelector: "tagsReady"
            });
		});

		// Reload the complete list with new data from the database
		$(document).on('listNeedsReload', function() {
			this.reloadList();
		}.bind(this));

		// Listen for listNeedsRefresh events that happen after the sync was done
		// and we have new items to update
		$(document).on('listNeedsRefresh', function(e, listNeedsRefreshInfo) {
			self.bulkRefreshItems(listNeedsRefreshInfo.allObjects);
		});

		// itemsNeedsExtendedUpdate event is called within the sendChanges callback
		// we got data for items from the API after sending changes to that. We
		// use this item data to update the item in the database and this items
		// needs also to be updated within the queue
		$(document).on('itemNeedsExtendedUpdate', function(e, itemAction) {
			var action = itemAction.action,
				on = itemAction.on,
				item = itemAction.item,
				updateDom = itemAction.updateDom,
				queueItem = self.itemsByID[item.item_id];

			if (typeof queueItem !== 'undefined' && action === 'update') {
				// Replace the local item with the new item
				self.itemsByID[item.item_id] = item;
				self.items[self.items.indexOf(queueItem)] = item;

				// Update the item in the dom
				if (updateDom) {
					self.updateItem(item);
				}
			}
			if (typeof queueItem == 'undefined' && action === 'add') {
				self.bulkRefreshItems([itemAction]);
			}
		});

		// Start lazy load the images the first time we load the queue
		this.startLazyLoadImages();

		// determine if any items loaded in, if we've seen empty notice
		getSetting('loadedItems',function(data) {
			self.loadedItems = (typeof data.loadedItems != 'undefined');
		});
		getSetting('sawEmptyNotice',function(data) {
			self.sawEmptyNotice = (typeof data.sawEmptyNotice != 'undefined');
		});

		this.inited = true;
	},

	// representation of 'load' and 'reload'

	loadState : function(state)
	{
		if (!this.inited)
		{
			this.init();
		}


		// -- Preload any UI settings --


		// -- VIEWS

		// section
		this.stateSelector.set(state.page, true);

		// view
		if (this.initialView)
		{
			var self = this;
			getSetting('lastQueueView',function(data) {
				if (typeof data.lastQueueView == 'string')
				{
					self.setView(data.lastQueueView);
					self.stateChanged();
				}
				else
				{
					self.setView(state.sections[1]?state.sections[1]:self.defaultView);
				}
			});
			this.initialView = false;
		}
		else
			this.setView(state.sections[1]?state.sections[1]:this.defaultView);

		// tag
		if (state.sections[2])
		{
			tagSidebar.setTag(decodeURIComponent(state.sections[2]), true);
			// $('#page_queue').addClass('tag_sidebar_open');
			// this.sidebarToggle.set(true, true);
		}
		else
		{
			tagSidebar.setTag(false);
		}

		// -- preload

		this.stateChanged();
	},


	// representation of 'load new page'

	stateChanged : function()
	{
		// get info
		var info = this.getCurrentLocation();
		this.state = info.state;

		// store cached strings for quick lookups
		var newTagUrlPrefix = this.getTagUrl('___TAG___').url.replace('/___TAG___', '');
		if (newTagUrlPrefix != this.tagUrlPrefix)
		{
			this.tagUrlPrefix = newTagUrlPrefix;
			// tagSidebar.refreshTagLinks();
			queue.data.getTags({
				delegate: this,
				doneSelector: "tagsReady"
			});
		}

		// update links
		$('.pagenav_gridview a').attr('href', this.getInfoForState({section:this.state.section,view:'list',tag:this.state.tag}).url);
		$('.pagenav_listview a').attr('href', this.getInfoForState({section:this.state.section,view:'grid',tag:this.state.tag}).url);
		$('#nav_'+this.nav+' a').attr('href', info.url);

		// update url
		if (window.location != info.url)
			boot.pushState(info.title, info.url);

		// refresh list
		if (this.lastUrl != info.url) // prevent reload when hitting back
			this.reloadList();

		// switch to the page if it's not active
		this.lastUrl = info.url;
		boot.showPage( this );
	},

	getCurrentLocation : function()
	{
		return this.getInfoForState({
			tag : tagSidebar.selectedTag,
			view: this.selectedView,
			section : this.stateSelector.label
		});
	},

	getTagUrl : function( tag )
	{
		return this.getInfoForState({
			tag : tag,
			view: this.selectedView,
			section : this.stateSelector.label
		});
	},

	getInfoForState : function(state)
	{
		// /page/section/view/tag
		// build backwards to create shortest url
		var url = '';
		var title = '';
		var td = ' : '; // title delimeter
		var section = state.section.toLowerCase();

		if (state.tag)
		{
			url = encodeURIComponent(state.tag) + '/' + url;
			title = td + state.tag;
		}

		// view
		if (state.view && (url.length || state.view != this.defaultView))
			url = state.view + '/' + url;

		// section
		title = td + state.section + title;
		if (url.length || section != this.defaultSection)
			url = section + '/' + url;

		url = '/a/' + url;
		title = 'Pocket' + title;

		return {url:url,title:title,state:state};
	},

	// -- //

	willHide : function()
	{
		// remember position
		this.lastScrollTop = $(window).scrollTop();
	},

	didHide : function()
	{
		this.showBulkEdit(false);
		this.isOpen = false;
	},

	didShow : function()
	{
		var self = this;
		if (typeof this.lastScrollTop !== 'undefined') {
			$(window).scrollTop(self.lastScrollTop);
		}
		this.isOpen = true;
	},

	itemForItemID : function (itemId)
	{
		var item = this.itemsByID[itemId];
		if (item) {
			return item;
		}

		return {};
	},

	reloadList : function( o )
	{
		if (!o) {
			o = {};
		}

		// if we are paging, do not send multiple requests (if we are not paging, we should replace the view)
		if (o.append && this.loading) {
			return;
		}

		this.loading = true;

		if (this.reloadTO) {
			clearTimeout(this.reloadTO);
		}

		if (o.append)
		{
			if (!this.loadingRow) {
				this.loadingRow = $('<li class="loading loadingRow">&nbsp;</li>');
			}
			this.queueList.append(this.loadingRow);
			this.loadingRow.show();
			this.loadMoreRow.hide();
		}
		else {
			this.items = [];
			this.queueList.parent().addClass('loading');
			scrollToTop();
		}

		var state = this.stateSelector.value;
		var favorite = null;
		if (state == 'favorites')
		{
			state = null;
			favorite = 1;
		}

		// paging
		var offset = Object.keys(this.items).length;

		// send request
		this.data.getList({
			o			: o,
			data		: {
				offset		: offset,
				count		: this.pageSize,
				state		: state,
				favorite	: favorite,
				sort		: "newest",
				search		: this.searchField.val().trim(),
				tag			: tagSidebar.selectedTag ? tagSidebar.selectedTag : '',
				view		: this.selectedView,
				contentType : this.contentTypeControl.key()
			},
			delegate		: this,
			doneSelector	: 'reloadListCallback',
			errorSelector	: 'reloadListError'
		});

		// for a full from server reload, explictly kill any existing GSF tooltips
		if (typeof this.gsftooltip == 'object')
		{
			this.gsftooltip.show(false);
		}


		this.reloadShares();
	},

	reloadShares: function()
	{
		this.data.getShares({
			o: {},
			delegate: this,
			doneSelector: "getSharesCallback"
		});
	},

	reloadListCallback : function( data, o )
	{
		//try
		//{

		var self = this;
		var listObject = data.list;

		this.friends = data.friends || {};

		if (!o.o.append) {
			this.items = [];
			this.itemsByID = {};
		}

		if(!this.items) {
			this.items = [];
			this.itemsByID = {};
		}

		// make list an array and sort it correctly
		var list = [];

		if (listObject) {
			$.each(listObject, function(idx, item) {
				list.push(item);
				this.items.push(item);
				this.itemsByID[item.item_id] = item;
			}.bind(this));

			list.sort(sortBySortId);
		}

		// Assign the local_item_id to the items if we are in favorite
		if (listObject && typeof this.stateSelector !== 'undefined' &&
			this.stateSelector.value === "favorites")
		{
			sync.resolveItemsWithLocalItemID(list, function() {
				this.rebuildList(list, o)
			}.bind(this));

			return;
		}

		this.rebuildList(list, o);
	},

	rebuildList: function(list, o)
	{
		list = list || this.items;
		o = o || {};

		if (!o.o.append) {
			this.queueList.empty();
			this.loadMoreRow = false;
			this.c = {
				tiles : 0,
				leftInRow : 0,
				last : {}
			};
		}

		logger.log("Queue: Rebuild list with list:");
		logger.log(list);

		var self = this;
		var isGrid = this.selectedView == 'grid';

		// build list
		var row, item, attribution;
		var url, openUrl, title, friends, domain, openType;
		var isArchive = this.stateSelector.value == 'archive' ? true : false;
		var isFavorites = this.stateSelector.value == 'favorites' ? true : false;
		var tileClass, tileImageWidth, tileImageHeight, showExcerpt, clamp;
		var ts;
		var c=0;
		var gridAttr = '';
		var preStatus;
		var i;
		var rowsToAppend = [];
		if (!this.loadedItems && !isArchive && !isFavorites && list.length) {
			this.loadedItems = true;
			setSetting('loadedItems','1');
		}
		for (i in list) {
			// reset
			var thumbVariant = 0,
				favicon,
				itemShares;

			if (this.c.leftInRow <= 0) {
				this.c.leftInRow = 3;
			}

			item = list[i];

			if (typeof item.shares !== 'undefined') {
				itemShares = [];

				$.each(item.shares, function(key, share) {

					if (typeof share.time_shared == "string"){
						share.time_shared = new Date(parseInt(share.time_shared, 10) * 1000);
					}

					// Only show added shares
					if (parseInt(share.status, 10) === 1) {
						itemShares.push(share);

						var friendID = share.from_friend_id;
						if (friendID) {
							var friend = self.friends[friendID];
							if (friend) {
								share.friend = friend;
								item.friends = item.friends || [];
								item.friends.push(friend);
							}
						}
					}
				});
			}

			url = (item.resolved_url ? item.resolved_url : item.given_url);

			openUrl = '/a/read/'+item.item_id;
			var linkclasses = "link";
			if (item.is_article == '1' || item.has_video == '2' || item.has_image == '2')
				linkclasses += " start_articleview";
			else
				linkclasses += " start_webview";
			// OpenTypes: article: 2, video: 17, image: 43, web: 13
			openType = item.is_article == '1' ? 2 : item.has_video == '2' ? 17 : item.has_image == '2' ? 43 : 13;
			domain = sanitizeText(domainForURL(url)) || '';

			if (item.title)
				title = item['title'];
			if (item.resolved_title)
				title = item['resolved_title'];
			else if (item['given_title'])
				title = item['given_title'];
			else if (item['resolved_url'])
				title = item['resolved_url'];
			else
				title = item['given_url'];

			if (isGrid)
			{
				// Determine tile style
				ts = 1;
				tileClass = '';
				tileImageWidth = 0;
				tileImageHeight = 0 ;
				showExcerpt = false;
				clamp = true;

				// articles
				if (item.is_article == '1')
				{
					// has image - skip for first 3 items in active gsf
					if (item.image && item.image.src)
					{
						var earlygsf = (boot.GSFStatus.active && (parseInt(i,10) < 3));
						// wide_split
						if (this.c.leftInRow >= 2 && // requires 2 tiles
							(!this.c.last['wide_split'] || this.c.tiles - this.c.last['wide_split'] >= 4) && // at least x tiles from last wide_split
							imageWouldFitIn(item.image, 303, 255) && // image is big enough to fit even when resized
							item.excerpt && item.excerpt.length > 30 && !earlygsf)
						{
							ts = 2;
							tileClass = 'wide_split';
							tileImageWidth = 303;
							showExcerpt = true;
						}

						// big_wide
						else if (this.c.leftInRow >= 2 && // requires 2 tiles
								!itemShares &&
								(!this.c.last['wide_image'] || this.c.tiles - this.c.last['wide_image'] >= 2) &&
								item.image.width >= 580 && !earlygsf)
						{
							ts = 2;
							tileClass = 'wide_image';
							tileImageWidth = 580;
						}

						// default
						else
						{
							tileClass = 'normal';
							tileImageWidth = 280;
							clamp = false;
						}

					}
				}

				// non-articles
				else
				{
					// video
					if (item.has_video == '2' && item.has_image == '1')
					{
						tileClass = 'normal_video';
						tileImageWidth = 280;
						clamp = false;
					}

					// images
					if (item.has_image == '2')
					{
						tileClass = 'normal_image';
						tileImageWidth = 280;
						tileImageHeight = 255;
						clamp = false;
					}
				}

				// no image or other cases
				if (!tileClass.length)
				{
					if (item.excerpt && item.excerpt.length > 25)
					{
						tileClass = 'normal_excerpt';
						showExcerpt = true;
					}
					else
					{
						tileImageWidth = false;
						tileClass = 'normal_only_title';

						thumbVariant = 1;
					}
				}

				if (tileImageWidth) {
					thumbVariant = 2;
				}

				gridAttr = 'tileType="'+tileClass+'" ts="'+ts+'"';
			}
			else {
				tileImageWidth = 95;
				tileImageHeight = 80;
				if (item.image && item.image.src) {
					thumbVariant = 3;
				}
				else {
					thumbVariant = 4;
				}
			}


			row = $('<li class="item" id="i'+item.item_id+'"'+(item.favorite=='1'?' favorite="1"':'')+(item.status=='1'?' status="1"':'')+' '+gridAttr+'></li>');
			a = $('<a class="' + linkclasses + '" href="'+openUrl+'"></a>');

			// Track opening of the item
			a.click((function (itemId, openType) {
				return function () {
					queue.data.opened(itemId, openType);
				};
			}(item.item_id, openType)));

			inner = $('<span class="inner"></<div>');
			caret = $([]);

			if(item.friends && item.friends.length){
				var friendsList = item.friends[0].name;
				if(item.friends.length > 1){
					friendsList += " and " + (item.friends.length - 1) + " other" + (item.friends.length > 2 ? "s" : "");
				}
				if(!isGrid){
					friendsList = "Shared by " + friendsList;
				}

				friends = $("<span class='row_friends'>" + "<span class='collapsed'><span class='avatar'></span>" + friendsList + "</span><span class='caret'></span></span>");

				// Load avatar url and set the background image of the avatar span to the image src
				var friendAvatarURL = getImageCacheUrl(item.friends[0].avatar_url, 'w90-h90-nc');
				if (friendAvatarURL) {
					assetCache.loadAvatar(friendAvatarURL, function(friends, img) {
						var backgroundImage = "";
						if (typeof img !== 'undefined') {
							backgroundImage += 'url(\''+ img.src +'\')';
						}
						var friendAvatarElement = friends.find(".collapsed .avatar")[0];
						$(friendAvatarElement).css('background-image', backgroundImage);
					}.bind(this, friends));
				}
				else {
					// No avatar for the friend just load the empty avatar
					var avatarURL;
					if (isChromePackagedApp()) {
						avatarURL = "a/i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
						avatarURL = chrome.runtime.getURL(avatarURL);
					}
					else {
						avatarURL = "i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
					}
					var friendAvatarElement = friends.find(".collapsed .avatar")[0];
					$(friendAvatarElement).css("backgroundImage", "url('" + avatarURL + "')");
				}


				row.addClass("shared_to");
			}
			else {
				friends = $([]);
			}

			title = $('<span class="title"><span>'+tagEntities(title)+'</span></span>');
			excerpt = showExcerpt && item.excerpt ? $('<span class="excerpt">'+tagEntities(item.excerpt)+'</span>') : null;
			thumb = $('<span class="thumb" variant="'+ thumbVariant +'"></span>');

			sub = $('<ul class="sub">' +
				'<li><a href="http://'+domain+'">'+domain+'</a></li>' +
				(isGrid ? '' : item.authors ? '<li>' + listAuthors(item.authors) + '</li>' : '') +
				(isGrid ? '' : ('<li class="tags '+(item.tags?' hasTags':'')+'"><span>'+(item.tags?listTags(item.tags):'')+'</span><a class="edit"><span>add tag</span></a></li>')) +
				'</ul><div class="clear"></div>');

			if (isGrid) {
				favicon = $('<img class="favicon" />');

				row.append(friends).append(a);
				a.append(inner);
				inner.append(title).append(excerpt).append(thumb).append(favicon).append(sub);
			}
			else {
				if (item.friends && item.friends.length){
					$("<li></li>").append(friends).insertBefore(sub.children().get(0));
				}

				row.append(inner);
				inner.append(a).append(excerpt).append(thumb).append(sub);
				a.append(title);
			}

			// Load thumbnail if necessary
			// TODO: better thumbVariant naming
			var imgScale = window.devicePixelRatio || 1;
			if (thumbVariant !== 0) {
				if (thumbVariant === 4) {
					// We don't have to load this thumbnail variant due to we don't
					// have to load any remote image
					var backgroundURL = isChromePackagedApp() ? chrome.runtime.getURL('a/i/tile_fallback@1x.jpg') : "i/tile_fallback@1x.jpg";
					thumb.css('background-image', 'url(\''+ backgroundURL +'\')');
					thumb.css('background-repeat', 'repeat');
					thumb.css('background-size', 'auto');
					thumb.addClass('lazy-active');
					if (imgScale > 1)
					{
						backgroundURL = backgroundURL.replace('1x.jpg','2x.jpg').replace('1x.png','2x.png');
						thumb.css('background-size','844px 591px');
					}
				}
				else {
					thumb.addClass('lazy-load');
					thumb.attr('data-lazy-type', 'thumbnail');
					thumb.attr('data-lazy-key', item.item_id);

					if (thumbVariant === 1) {
						var thumbURL = getImageCacheUrl('http://'+domain+'/apple-touch-icon.png', 'w80-h80-nc');
						thumb.attr('data-thumburl', thumbURL);
						thumb.attr('data-thumbvariant', thumbVariant);
						thumb.attr('data-shouldcache', item.status == '0');
					}
					else if (thumbVariant === 2) {
						if (tileImageWidth) {
							thumb.attr('data-thumburl', item.image ? item.image.src : undefined);
							thumb.attr('data-thumbvariant', thumbVariant);
							thumb.attr('data-tileclass', tileClass);
							thumb.attr('data-shouldcache', (item.status == '0'));
						}

					}
					else if (thumbVariant === 3) {
						thumb.attr('data-thumburl', item.image ? item.image.src : undefined);
						thumb.attr('data-thumbvariant', thumbVariant);
						thumb.attr('data-hasplaybutton', (item.has_video == '2'));
						thumb.attr('data-shouldcache', item.status == '0');
					}
				}
			}


			// Add favicon image
			// Load all favicons but don't cache it
			if (favicon) {
				favicon.addClass('lazy-load');
				favicon.attr('data-lazy-type', 'favicon');
				favicon.attr('data-lazy-key', item.item_id);

				favicon.attr('data-favicon-url', faviconForUrl(domain));
			}


			// Add sharing attributions
			var attributions = [];
			if (typeof itemShares !== 'undefined') {
				var shares = $("<div class='shares'></div>");

				itemShares.sort(function(a, b){
					var aTimeShared = a.time_shared;
					var bTimeShared = b.time_shared;

					if (aTimeShared instanceof Date) {
						aTimeShared = aTimeShared.getTime();
					}
					else if (typeof aTimeShared == "string") {
						aTimeShared = parseInt(aTimeShared, 10);
					}

					if (bTimeShared instanceof Date) {
						bTimeShared = bTimeShared.getTime();
					}
					else if(typeof bTimeShared == "string") {
						bTimeShared = parseInt(bTimeShared, 10);
					}

					return bTimeShared - aTimeShared;
				});

				if (!isGrid && itemShares.length == 1 && (itemShares[0].comment == undefined || itemShares[0].comment.length == 0) && (itemShares[0].quote == undefined || itemShares[0].quote.length == 0)){
					var notification = $("<div class='notification'><div><div class='attribution'><div class='one_liner'></div></div></div></div>");
					var share = itemShares[0];
					var fromFriend = share.fromFriend || this.friends[share.from_friend_id];
					var name = (fromFriend && fromFriend.name && fromFriend.name.length ? fromFriend.name : "A friend");
					notification.find(".one_liner").text("" + name + " shared this with you " + relativeDateString(share.time_shared, true) + ".");
					shares.append(notification);
				}
				else {
					for (var idx = 0; idx < itemShares.length; idx++) {
						var view = attributionForShare(itemShares[idx], item, !isGrid, true);
						shares.append(view);
					}
				}

				if (isGrid) {
					friends.append(shares);
				}
				else {
					var sharesContainer = $("<div class='sharesContainer'></div>");
					sharesContainer.append(shares);
					row.append(sharesContainer);
				}
			}

			rowsToAppend.push(row);

			preStatus = {};
			if (item.favorite=='1') {
				preStatus.favorite = true;
			}

			if ((isArchive || isFavorites) && item.status == 1) {
				preStatus.archived = true;
			}

			if (preStatus.favorite || preStatus.archived) {
				this.addButtonsToRow(false, row, preStatus);
			}

			c++;
			this.c.tiles += ts;
			this.c.leftInRow -= ts;
			this.c.last[tileClass] = this.c.tiles;
		}

		// add (or move) load more button/spinner to bottom of list
		if (!this.loadMoreRow)
		{
			this.loadMoreRow = $('<li class="info-loading"></li>');
			this.loadMoreRow.click(function(){
				this.reloadList({append:true});
			}.bind(this));
		}

		if (o.data) {
			if (c < o.data.count) {
				this.remaining = false;
				this.loadMoreRow.hide();
			}
			else {
				this.remaining = true;
				this.loadMoreRow.show();
			}
		}
		if (o.o.postSync) {
			this.remaining = true;
			this.loadMoreRow.hide();
		}

		function expandShare(e) {
			e.preventDefault();

			var item = $(this).parents(".item");
			var shares = item.find(".shares");
			var height = shares.height();

			if (isGrid){
				item.addClass("share_expanded");
				item.find(".row_friends").css("height", height);
				if(item.attr("tileType") == "wide_split"){
					item.find(".thumb").css("top", -height);
				}
			}
			else {
				item.find(".sharesContainer").css("height", height);
				item.addClass("share_expanded");
			}

			e.preventDefault();
			return false;
		}

		function collapseShare(e) {
			e.preventDefault();

			var item = $(this).parents(".item");
			item.removeClass("share_expanded");
			if(isGrid){
				item.find(".row_friends").css("height", "");
				if(item.attr("tileType") == "wide_split"){
					item.find(".thumb").css("top", "");
				}
			}
			else {
				item.find(".sharesContainer").css("height", "");
			}

			return false;
		}

		function toggleShare(e) {
			var item = $(this).parents(".item");
			if (item.hasClass("share_expanded")) {
				return collapseShare.call(this, e);
			}
			else {
				return expandShare.call(this, e);
			}
		}

		// Add Events before adding the row to the list
		$.each(rowsToAppend, function(idx, $row) {
			$row.mouseover(function(){self.addButtonsToRow(this);});
			$row.find('a.add_tag').click(function(){self.editItemTags(this);});
			$row.find('a.edit').click(function(){self.editItemTags(this);});
			$row.find('.author').click(function(){self.showByliner(this);}).css('cursor','pointer');

			if (isGrid) {
				$row.find(".row_friends").mouseover(expandShare).mouseout(collapseShare)
										 .unbind('click').click(function(e)
				{
					e.preventDefault();
					$(this).siblings('.link').trigger('click');
				});
			}
			else {
				$row.find(".row_friends").unbind("click").click(toggleShare);
			}
		});

		this.queueList.append(rowsToAppend);
		this.queueList.append(this.loadMoreRow);

		if ($(document.body).hasClass('editing')) {
			this.applyEditToRows();
		}

		// handle empty
		// if there are no rows and it wasn't an append unless there are no rows left, and we are not fetching
		this.showEmpty( c == 0 && (!o.o.append || this.listIsEmpty()) && !this.queueFetching );

		if (!o.o.append || this.listIsEmpty())
		{
			this.resetHighlight();
		}

		// update status
		this.listIsDoneLoading();

		// GSF check and initialize
		this.gsfInitialize();

		// add device reminder banner
		if (!boot.UserNotices.dismisseddevicereminder && (!PocketUserApps.ready || !PocketUserApps.installedMobile()) && (this.state.section == 'Queue' || this.state.section == 'Home') && !$('#page_search').val().length && !tagSidebar.selectedTag)
		{
			if ($('#page_queue').outerHeight() < ($(window).height() - 5))
			{
				$('#page_queue').css('minHeight',$(window).height() - 60 - (parseInt($('#page_queue').css('paddingTop'),10) * 2) + 'px');
			}
			$('#page_queue').append('<div class="gsf_device_reminder_container gsf_device_reminder_active"><div class="gsf_device_reminder">\
									 <a class="close" href="#">Close</a><h5>Take Pocket with you.</h5><p>Available on <a href="http://getpocket.com/apps/link/pocket-iphone/" target="_blank">iPhone</a>,\
									 <a href="http://getpocket.com/apps/link/pocket-iphone/" target="_blank">iPad</a>,\
									 <a href="http://getpocket.com/apps/link/pocket-android/" target="_blank">Android</a>, and \
									 <a href="http://getpocket.com/apps/link/pocket-amazon/" target="_blank">Kindle Fire</a>.</div></div>');
			$('.gsf_device_reminder .close').click(function(e)
			{
				boot.UserNotices.dismisseddevicereminder = true;
				boot.saveUserNotices();
				$('.gsf_device_reminder_container').remove();
			});
		}
		else
		{
			if ($('.gsf_device_reminder_container').length)
			{
				$('.gsf_device_reminder_container').remove();
			}
		}

		// Clean up
		if (o.o && o.o.append) {
			setTimeout( function() {
				$('.removed').remove();
			}, 1000);

			if ($(document.body).hasClass('editing')) {
				this.updateCheckAllBox();
			}
		}

		// Work to do after a short timeout
		setTimeout(function() {
			if (this.selectedView == 'grid') {
				this.adjustTiles();
			}

			// Restore the scroll position after updating
			if (this.scrollPositionBeforeUpdating) {
				$(window).scrollTop(this.scrollPositionBeforeUpdating);
				this.scrollPositionBeforeUpdating = undefined;
			}

			this.processLazyLoadScroll();
		}.bind(this), 50);
	},

	getSharesCallback: function(shares)
	{
		this.receivedNotifications(shares.notifications, shares.unconfirmed_shares);
	},

	updateItem : function (item)
	{
		// TODO: 	refactor all parts that are double in reloadListCallback and
		// 			in updateItem

		// Get old row and reusable objects favicon
		var $row = this.inited ? $('#i'+item.item_id) : false;
		var $thumb = $row.find(".thumb");
		var $favicon = $row.find(".favicon");
		var showExcerpt = ($row.find('.excerpt').length !== 0);

		// Remove all child elements as we start from fresh
		$row.empty();

		var self = this;
		var isGrid = this.selectedView == 'grid';

		var isArchive = this.stateSelector.value == 'archive' ? true : false;
		var isFavorites = this.stateSelector.value == 'favorites' ? true : false;

		var itemShares;
		if (typeof item.shares !== 'undefined') {
			itemShares = [];

			$.each(item.shares, function(key, share) {
				if (typeof share.time_shared == "string") {
					share.time_shared = new Date(parseInt(share.time_shared, 10) * 1000);
				}

				// Only show added shares
				if (parseInt(share.status, 10) === 1) {
					itemShares.push(share);

					var friendID = share.from_friend_id;
					if (friendID) {
						var friend = self.friends[friendID];
						if (friend) {
							share.friend = friend;
							item.friends = item.friends || [];
							item.friends.push(friend);
						}
					}
				}
			});
		}

		var url = (item.resolved_url ? item.resolved_url : item.given_url);
		var openUrl = '/a/read/'+item.item_id;
			var linkclasses = "link";
			if (item.is_article == '1' || item.has_video == '2' || item.has_image == '2')
				linkclasses += " start_articleview";
			else
				linkclasses += " start_webview";
		// OpenTypes: article: 2, video: 17, image: 43, web: 13
		var openType = item.is_article == '1' ? 2 : item.has_video == '2' ? 17 : item.has_image == '2' ? 43 : 13;
		var domain = domainForURL(url) || '';

		var title;
		if (item.title)
			title = item['title'];
		if (item.resolved_title)
			title = item['resolved_title'];
		else if (item['given_title'])
			title = item['given_title'];
		else if (item['resolved_url'])
			title = item['resolved_url'];
		else
			title = item['given_url'];

		var a = $('<a class="' + linkclasses + '" href="'+openUrl+'"></a>');

		// Track opening of the item
		a.click((function (itemId, openType) {
			return function () {
				queue.data.opened(itemId, openType);
			};
		}(item.item_id, openType)));

		var inner = $('<span class="inner"></<div>');
		var caret = $([]);

		var friends;
		if(item.friends && item.friends.length){
			var friendsList = item.friends[0].name;
			if(item.friends.length > 1){
				friendsList += " and " + (item.friends.length - 1) + " other" + (item.friends.length > 2 ? "s" : "");
			}
			if(!isGrid){
				friendsList = "Shared by " + friendsList;
			}

			friends = $("<span class='row_friends'>" + "<span class='collapsed'><span class='avatar'></span>" + friendsList + "</span><span class='caret'></span></span>");

			var friendAvatarURL = getImageCacheUrl(item.friends[0].avatar_url, 'w90-h90-nc');

			if (friendAvatarURL) {
				// Load avatar url and set the background image of the avatar span to the image src
				assetCache.loadAvatar(friendAvatarURL, function(friends, img) {
					var backgroundImage = "";
					if (typeof img !== 'undefined') {
						backgroundImage += 'url(\''+ img.src +'\')';
					}
					var friendAvatarElement = friends.find(".collapsed .avatar")[0];
					$(friendAvatarElement).css('background-image', backgroundImage);
				}.bind(this, friends));
			}
			else {
				// No avatar for the friend just load the empty avatar
				var avatarURL;
				if (isChromePackagedApp()) {
					avatarURL = "a/i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
					avatarURL = chrome.runtime.getURL(avatarURL);
				}
				else {
					avatarURL = "i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
				}
				var friendAvatarElement = friends.find(".collapsed .avatar")[0];
				$(friendAvatarElement).css("backgroundImage", "url('" + avatarURL + "')");
			}


			$row.addClass("shared_to");
		}
		else {
			friends = $([]);
		}

		var $title = $('<span class="title"><span>'+tagEntities(title)+'</span></span>');
		var $excerpt = showExcerpt && item.excerpt ? $('<span class="excerpt">'+tagEntities(item.excerpt)+'</span>') : null;

		var $sub = $('<ul class="sub">' +
			'<li><a href="http://'+domain+'">'+domain+'</a></li>' +
			(isGrid ? '' : item.authors ? '<li>' + listAuthors(item.authors) + '</li>' : '') +
			(isGrid ? '' : ('<li class="tags '+(item.tags?' hasTags':'')+'"><span>'+(item.tags?listTags(item.tags):'')+'</span><a class="edit"><span>add tag</span></a></li>')) +
			'</ul><div class="clear"></div>');

		if (isGrid) {
			$row.append(friends).append(a);
			a.append(inner);
			inner.append($title).append($excerpt).append($thumb).append($favicon).append($sub);
		}
		else {
			if (item.friends && item.friends.length){
				$("<li></li>").append(friends).insertBefore($sub.children().get(0));
			}

			$row.append(inner);
			inner.append(a).append($excerpt).append($thumb).append($sub);
			a.append($title);
		}

		// Add sharing attributions
		var attributions = [];
		if (typeof itemShares !== 'undefined') {
			var shares = $("<div class='shares'></div>");

			itemShares.sort(function(a, b){
				var aTimeShared = a.time_shared;
				var bTimeShared = b.time_shared;

				if (aTimeShared instanceof Date) {
					aTimeShared = aTimeShared.getTime();
				}
				else if (typeof aTimeShared == "string") {
					aTimeShared = parseInt(aTimeShared, 10);
				}

				if (bTimeShared instanceof Date) {
					bTimeShared = bTimeShared.getTime();
				}
				else if(typeof bTimeShared == "string") {
					bTimeShared = parseInt(bTimeShared, 10);
				}

				return bTimeShared - aTimeShared;
			});

			if (!isGrid && itemShares.length == 1 && (itemShares[0].comment == undefined || itemShares[0].comment.length == 0) && (itemShares[0].quote == undefined || itemShares[0].quote.length == 0)){
				var notification = $("<div class='notification'><div><div class='attribution'><div class='one_liner'></div></div></div></div>");
				var share = itemShares[0];
				var fromFriend = share.fromFriend || this.friends[share.from_friend_id];
				var name = (fromFriend && fromFriend.name && fromFriend.name.length ? fromFriend.name : "A friend");
				notification.find(".one_liner").text("" + name + " shared this with you " + relativeDateString(share.time_shared, true) + ".");
				shares.append(notification);
			}
			else {
				for (var idx = 0; idx < itemShares.length; idx++) {
					var view = attributionForShare(itemShares[idx], item, !isGrid, true);
					shares.append(view);
				}
			}

			if (isGrid) {
				friends.append(shares);
			}
			else {
				var sharesContainer = $("<div class='sharesContainer'></div>");
				sharesContainer.append(shares);
				$row.append(sharesContainer);
			}
		}

		// Add button to the row
		var preStatus = {};
		if (item.favorite == '1') {
			preStatus.favorite = true;
		}

		if ((isArchive || isFavorites) && item.status == '1') {
			preStatus.archived = true;
		}

		if (preStatus.favorite || preStatus.archived) {
			this.addButtonsToRow(false, $row, preStatus);
		}


		// add events
		$row.mouseover(function(){self.addButtonsToRow(this);});
		$row.find('a.add_tag').click(function(){self.editItemTags(this);});
		$row.find('a.edit').click(function(){self.editItemTags(this);});
		$row.find('.author').click(function(){self.showByliner(this);}).css('cursor','pointer');

		function expandShare(e) {
			var item = $(this).parents(".item");
			var shares = item.find(".shares");
			var height = shares.height();

			if(isGrid){
				item.addClass("share_expanded");
				item.find(".row_friends").css("height", height);
				if(item.attr("tileType") == "wide_split"){
					item.find(".thumb").css("top", -height);
				}
			}else{
				item.find(".sharesContainer").css("height", height);
				item.addClass("share_expanded");
			}

			e.preventDefault();
			return false;
		}

		function collapseShare(e) {
			var item = $(this).parents(".item");
			item.removeClass("share_expanded");
			if(isGrid){
				item.find(".row_friends").css("height", "");
				if(item.attr("tileType") == "wide_split"){
					item.find(".thumb").css("top", "");
				}
			}else{
				item.find(".sharesContainer").css("height", "");
			}

			e.preventDefault();
			return false;
		}

		function toggleShare(e) {
			var item = $(this).parents(".item");
			if(item.hasClass("share_expanded")){
				return collapseShare.call(this, e);
			}else{
				return expandShare.call(this, e);
			}
		}

		if (isGrid) {
			$row.find(".row_friends").mouseover(expandShare).mouseout(collapseShare);
		}
		else{
			$row.find(".row_friends").unbind("click").click(toggleShare);
		}

		this.adjustTile($row);
	},

	bulkRefreshItems: function(items){
		// Go through all item actions and update the list
		var self = this;

		$.each(items, function(idx, itemAction) {
			var action = itemAction.action,
				on = itemAction.on,
				item = itemAction.item,
				updateDom = itemAction.updateDom,
				queueItem = self.itemsByID[item.item_id],
				state = self.stateSelector.value;

			// Check if we have to handle adding a share
			var itemStatus = parseInt(item.status, 10);
			if (parseInt(item.status, 10) !== 0 && parseInt(item.has_pending_share, 10) === 1) {
				// Just update the shares as it's an item that is archived or deleted
				self.reloadShares();
				return true;
			}

			if ((action === 'add' || action === "readd") && state === 'queue') {
				// It's just a normal item to add to the list
				item.sort_id = -1;
				self.items.unshift(item);
				self.itemsByID[item.item_id] = item;
			}
			else if (queueItem) {
				// Replace the local item with the new item
				self.itemsByID[item.item_id] = item;
				self.items[self.items.indexOf(queueItem)] = item;

				// exectute the action on the item in the list
				if (action == 'mark' && state === 'queue' && on) {
					// Archive the item from the queue
					self.items.splice($.inArray(item, self.items), 1);
					delete self.itemsByID[item.item_id];
				}
				else if (action == 'favorite') {
					// Favorite / Unfavorite the item
					item.favorite = on;

					if (!on && state === 'favorite') {
						// Item was unfavorited and we are in the favorite state
						// remove the item
						self.items.splice($.inArray(item, self.items), 1);
						delete self.itemsByID[item.item_id];
					}
				}
				else if (action == 'delete' && on) {
					// Delete the item
					self.items.splice($.inArray(item, self.items), 1);
					delete self.itemsByID[item.item_id];
				}
			}
			else {
				// It's an item that is not new and no item in the queue
				// so just do nothing
			}
		})

		// Save the scroll postion before updating to get back to that position
		// after the update was done
		self.scrollPositionBeforeUpdating = $(window).scrollTop();

		// Sort the list and add new sort_ids
		// TODO: sort the list dependant on the sort settings
		var list = self.items;
		list.sort(sortByTimeAddedNewest);
		$.each(list, function(idx, item) {
			item.sort_id = idx;
		});

		// Rebuild new list with new list
		self.rebuildList(list, {o: {append: false, postSync: true}});
	},

	receivedNotifications: function(notifications, unconfirmedNotifications){
		if(!notifications || notifications.length === 0 || this.state.section != "Queue"){
			if(this.notificationRow){
				this.notificationRow.remove();
				this.notificationRow = null;
			}
		}

		notifications = notifications || [];
		for(var idx = 0; idx < notifications.length; idx++){
			var notification = notifications[idx];
			if(notification.time_shared && typeof notification.time_shared == "string"){
				notification.time_shared = new Date(parseInt(notification.time_shared, 10) * 1000);
			}
		}

		this.notifications = notifications;
		this.unconfirmedNotifications = unconfirmedNotifications;

		if(!this.notificationRow){
			this.notificationRow = $("<div class='notifications-shares noSelection'><span class='contents'><span class='count noSelection'></span></span><span class='contents'><div class='description noSelection'></div></span></div>");

			this.notificationViewButton = $("<span id='viewNotifications' class='noSelection'>View Inbox &#9662;</span>");
			this.notificationRow.append($("<span class='contents'></span>").append(this.notificationViewButton));
		}

		var namePieces = [];
		var friendIDs = [];
		for(var index = 0; index < (this.notifications || []).length; index++){
			var friend = this.notifications[index].from_friend;
			if(!friend) continue;

			var friendID = friend.friend_id;
			if(friendIDs.indexOf(friendID) == -1){
				friendIDs.push(friendID);
				var name = friend.name;
				if(!name || !name.length){
					name = friend.email;
				}
				if(!name || !name.length){
					name = friend.username;
				}
				namePieces.push("<span class='name noSelection'>" + name + "</span>");
			}
		}

		var numberOfUnconfirmedNotifications = 0;
		for(var email in (this.unconfirmedNotifications || {})){
			var friendName = this.unconfirmedNotifications[email].from;
			if(!friendName){
				friendName = "a friend";
			}

			namePieces.push("<span class='name noSelection'>" + friendName + "</span>");
			++numberOfUnconfirmedNotifications;
		}

		this.notificationRow.find(".count").text("" + (notifications.length + numberOfUnconfirmedNotifications));
		if(namePieces.length > 0 && this.state.section == "Queue"){
			this.notificationRow.find(".description").html("Share" + (notifications.length > 1 ? "s" : "") + " from " + namePieces.join(", "));
			this.notificationRow.remove().insertBefore($("#page_queue").children().get(0));

			var self = this;
			setTimeout(function(){
				self.notificationRow.click(function(){
					queue.showInbox(self.notificationViewButton);
				});
			}, 10);
		}
	},

	// Tiles Management
	// The browser triggers a layout each time you read and write certain
	// css attributes, this will drain performance so the goal is to read
	// all values that can trigger a layout change and then set all values
	// this is also the reason
	adjustTiles : function()
	{
		// This get's triggered if an action was happened in the list, but
		// we only want to adjust tiles if we are in the grid view
		var isGrid = (this.selectedView == 'grid');
		if (!isGrid) {
			return;
		}

		var self = this;

		var tiles = this.queueList.children('.item:not(.adjusted)');

		// First read all necessary attributes
		var thumbnailHeights = {};
		var excerptHeights = {};
		$.each(tiles, function (idx, tile) {
			var $tile = $(tile);

			var tileId = $tile.attr('id');
			var tileType = $tile.attr('tileType');

			var offset = $tile.find('.title').height();
			var excerpt = $tile.find('.excerpt');

			thumbnailHeights[tileId] = self.thumbnailHeightforTile($tile, tileType, offset);
			excerptHeights[tileId] = self.excerptHeightForTile(excerpt, $tile, tileType, offset);
		});

		// Write all attributes that will make the layout dirty and trigger relayout
		$.each(tiles, function (idx, tile) {
			var $tile = $(tile);

			// Add adjusted class so we did not adjust it again
			$tile.addClass('adjusted');

			var tileId = $tile.attr('id');
			var tileType = $tile.attr('tileType');

			self.executeThumbnailHeightForTile($tile, thumbnailHeights[tileId]);
			self.executeExcerptHeight($tile, excerptHeights[tileId], tileType);
		});
	},

	adjustTile : function(tile)
	{
		tile.addClass('adjusted');

		// Only exectute this in the Grid View
		var tileType = tile.attr('tileType');
		if (!tileType) {
			return;
		}

		// Get necessary objects
		var offset = tile.find('.title').height();
		var excerpt = tile.find('.excerpt');
		var excerptSize = excerpt.size();

		// Get and set thumbnail, excerpt height
		var thumbnailHeight = this.thumbnailHeightforTile(tile, tileType, offset);
		var excerptHeight = this.excerptHeightForTile(excerpt, tile, tileType, offset);
		this.executeThumbnailHeightForTile(tile, thumbnailHeight);
		this.executeExcerptHeight(tile, excerptHeight, tileType);
	},

	thumbnailHeightforTile : function ($tile, tileType, offset)
	{
		var thumbnailHeight;
		if (tileType != 'wide_split' && tileType != 'normal_image'){
			var $rowFriends = $tile.find(".row_friends");
			thumbnailHeight = $tile.height() - offset - 33 - $rowFriends.height();
		}
		return thumbnailHeight;
	},

	executeThumbnailHeightForTile : function ($tile, thumbnailHeight)
	{
		if (typeof thumbnailHeight !== 'undefined') {
			$tile.find('.thumb').css('height', thumbnailHeight);
		}
	},

	excerptHeightForTile : function ($excerpt, $tile, tileType, offset)
	{
		var excerptSize = $excerpt.size();
		var excerptHeight;
		if ($excerpt && excerptSize == 1)
		{
			var $rowFriends = $tile.find(".row_friends");

			// tile - title height - sub height - top/btm padding
			excerptHeight = $tile.height() - offset - 33 - $excerpt.css('padding-top').replace('px','')*1 - $excerpt.css('padding-top').replace('px','') * 1;

			//logger.log( tile.attr('id') + ' | ' + tile.height() + ' | ' + offset + ' | ' + 33 + ' | ' + $excerpt.css('padding-top') + ' | ' + $excerpt.css('padding-bottom') + ' = ' + excerptHeight);

			if ($tile.hasClass("shared_to")){
				excerptHeight -= $rowFriends.height();
			}
		}

		return excerptHeight;
	},

	executeExcerptHeight : function ($tile, excerptHeight, tileType)
	{
		if (typeof excerptHeight !== 'undefined') {
			var $excerpt = $tile.find('.excerpt');
			if (tileType == 'normal_excerpt') {
				snapToLineAndMaxHeight($excerpt, 18, excerptHeight);
			}
			else if (tileType == 'wide_split') {
				snapToLineAndMaxHeight($excerpt, 18, excerptHeight);
			}
		}

	},

	reflowTiles : function()
	{
		// Go through all wide items from selected point and drop them to a single cell if they need to fit onto the next row
		// TODO : OPTIMIZE AND In the future, it probably would be nice to go through and reflow all tiles, in case a single can now become a double
		if (!this.c) {
			return;
		}

		this.c.tiles = 0;
		this.c.leftInRow = 3;
		this.c.last = [];

		var tiles = this.queueList.children('.item:not(.marked)');
		var $tile, ts;
		for(var i=0; i<tiles.length; i++)
		{
			$tile = $(tiles[i]);
			$tile.removeClass("adjusted");
			ts = $tile.attr('ts')*1;

			// does it not fit?
			if (ts > this.c.leftInRow)
			{
				// resize it to a single
				$tile.removeClass($tile.attr('tileType'));
				$tile.attr('tileType', 'normal');
				$tile.attr('ts', 1);
				ts = 1;
			}

			this.c.tiles += ts;
			this.c.leftInRow -= ts;
			this.c.last[$tile.attr('tileType')] = this.c.tiles;

			if (this.c.leftInRow <= 0) {
				this.c.leftInRow = 3;
			}

		}

		this.adjustTiles();
	},

	listIsDoneLoading : function()
	{
		// update status
		this.queueList.parent().removeClass('loading');
		if(this.notificationRow){
			this.notificationRow.removeClass("hidden");
		}
		this.loading = false;
		if (this.loadingRow)
			this.loadingRow.hide();

	},

	reloadListError : function()
	{
		this.showEmpty( true, {img: false, title:'Uh oh.', message:'There was a problem when trying to make a request to the server. Please try refreshing the page.<br><br>If this keeps happening, <a href="http://help.getpocket.com" target="_blank">let us know</a> and we\'ll be happy to get it sorted!'} );
		this.listIsDoneLoading(false);
	},

	listIsEmpty : function()
	{
		var items = this.queueList.children('.item').size();
		var removed = this.queueList.children('.item.removed').size();
		return (items - removed <= 0);
	},

	checkIfRunningLow : function()
	{
		if (this.listIsEmpty())
		{
			if (this.remaining)
			{
				this.reloadList({append:true});
			}
			else
			{
				this.showEmpty(true);
			}
		}
	},

	startLazyLoadImages: function()
	{
		this.processLazyLoadScroll();
		$(document).smartscroll(function() {
			this.processLazyLoadScroll();
		}.bind(this));
	},

	processLazyLoadScroll: function()
	{
		// Create cache we track shich images we are in the process to load
		this.imagesLoading = this.imagesLoading || {};

		// Get all elements we need to lazy load
		var lazyLoadElements = $('.lazy-load');

		// Go through each element and try to lazy load it
		$.each(lazyLoadElements, function(idx, lazyLoadElement) {
			var $lazyLoadElement = $(lazyLoadElement);
			var lazyType = $lazyLoadElement.attr('data-lazy-type');
			var lazyKey = lazyType + ":" + $lazyLoadElement.attr('data-lazy-key');
			var alreadyLoading = (typeof this.imagesLoading[lazyKey] !== 'undefined');
			if (!alreadyLoading && elementCloseInViewport(lazyLoadElement)) {
				this.imagesLoading[lazyKey] = true;

				var imageLoadCallback = function() {
					$lazyLoadElement.removeClass('lazy-load').addClass('lazy-active');
					delete this.imagesLoading[lazyKey];
				}.bind(this);

				// Load each lazy type. Currently only thumbnail and favicon
				if (lazyType === 'thumbnail') {
					this.loadThumbnailImageLazy($lazyLoadElement, imageLoadCallback);
				}
				else if (lazyType === 'favicon') {
					this.loadFaviconLazy($lazyLoadElement, imageLoadCallback);
				}
			}
		}.bind(this));
	},

	loadFaviconLazy: function($favicon, callback)
	{
		assetCache.loadFavicon($favicon.attr('data-favicon-url'), function(favicon, img) {
			if (typeof img !== "undefined") {
				favicon.attr('src', img.src);
			}

			callback();
		}.bind(this, $favicon));
	},

	loadThumbnailImageLazy: function ($thumb, callback)
	{
		var tileGraphicSiteURL,
			tileFallbackURL,
			thumbURL = $thumb.attr('data-thumburl'),
			thumbVariant = parseInt($thumb.attr('data-thumbvariant'), 10),
			shouldCache = ($thumb.attr('data-shouldcache') === "true");

		var imgScale = window.devicePixelRatio || 1;
		if (thumbVariant === 1) {
			tileGraphicSiteURL = localURLForFilePath('i/tile_graphic_site@1x.png');
			tileFallbackURL = localURLForFilePath('i/tile_fallback@1x.jpg');

			assetCache.loadImageCached(thumbURL, shouldCache, function(img) {
				var backgroundImage = "";
				if (typeof img !== 'undefined') {
					backgroundImage += 'url(\''+ img.src +'\'),';
					$thumb.addClass('thumb-wimage');
				}

				backgroundImage += tileGraphicSiteURL+','+tileFallbackURL;
				if (imgScale > 1)
				{
					backgroundImage = backgroundImage.replace('1x.jpg','2x.jpg').replace('1x.png','2x.png');
				}
				$thumb.css('background-image', backgroundImage);

				callback();


			});
		}
		else if (thumbVariant === 2) {
			var tileClass = $thumb.attr('data-tileclass');
			assetCache.loadImageCached(thumbURL, shouldCache, function(img) {
				var playImageURL = localURLForFilePath('i/play.png') + ',';
				var playImageBackgroundURL = (tileClass=='normal_video') ? playImageURL : '';
				var thumbBackgroundURL;
				if (typeof img !== 'undefined') {
					thumbBackgroundURL = 'url(\''+ img.src +'\')';
				}
				else {
					thumbBackgroundURL = localURLForFilePath('i/tile_fallback@1x.jpg');
					$thumb.css("background-size", "auto auto");
					if (imgScale > 1)
					{
						thumbBackgroundURL = thumbBackgroundURL.replace('1x.jpg','2x.jpg').replace('1x.png','2x.png');
						$thumb.css("background-size", "844px 591px");
					}
				}
				var backgroundImage = playImageBackgroundURL + thumbBackgroundURL;
				$thumb.css('background-image', backgroundImage);

				callback();
			});
		}
		else if (thumbVariant === 3) {
			tileFallbackURL = isChromePackagedApp() ? 'url(' + chrome.runtime.getURL("a/i/tile_fallback@1x.jpg") + ')' : 'url(i/tile_fallback@1x.jpg)';
			if (imgScale > 1)
			{
				tileFallbackURL = tileFallbackURL.replace('1x.jpg','2x.jpg').replace('1x.png','2x.png');
			}
			var hasPlayButton = $thumb.attr('data-hasplaybutton') === 'true';

			assetCache.loadImageCached(thumbURL, shouldCache, function (img) {
				var playImageURL = localURLForFilePath('i/play.png') + ',';
				var playImageBackgroundURL = hasPlayButton ? playImageURL : '';
				var thumbBackgroundURL = "";
				if (typeof img !== 'undefined') {
					thumbBackgroundURL = 'url(\''+ img.src +'\'),';
				}
				thumbBackgroundURL += tileFallbackURL;
				var backgroundImage = playImageBackgroundURL + thumbBackgroundURL;
				$thumb.css('background-image', backgroundImage);

				// Set background size
				var backgroundSize = (hasPlayButton ? "50px 50px, " : "") + "cover, auto";
				if (imgScale > 1)
				{
					backgroundSize = (hasPlayButton ? "50px 50px, " : "") + "cover, 844px 591px";
				}
				var backgroundPos = (hasPlayButton ? 'center, ' : '') + "center, center";
				$thumb.css('background-size', backgroundSize);
				$thumb.css('background-position', backgroundPos);

				callback();

			});
		}
	},

	getTaggedWithMessage : function(tag)
	{
		if(!tag)
			return "";
		else if(tag == TagSidebar.UNTAGGED)
			return " are untagged";
		else
			return " have been tagged with <em>"+htmlEntities(tag)+"</em>";
	},

	showEmpty : function(show, o)
	{
		if (show)
		{
			var title;
			var message;
			var img;
			var content = this.contentTypeControl.key();
			if (content)
				content += 's';
			else
				content = 'items';

			if (!o)
			{
				var state = this.getCurrentLocation().state;

				// search
				if ( this.searchField.val().length )
				{
					img = 'search';

					var searchMinimum = 3;
					if( this.searchField.val().length < searchMinimum ){
						title = "Unable to search";
						message = "Please enter at least " + searchMinimum + " characters to search.";
					}else{
						title = "No results found";
						message = "No "+content+" in your " + state.section + (tagSidebar.selectedTag ? " that "+this.getTaggedWithMessage(tagSidebar.selectedTag) : "") + ", matched your search for '"+htmlEntities(this.searchField.val().trim())+"'.";
					}
				}

				// tagged
				else if ( tagSidebar.selectedTag )
				{
					img = 'tag';
					title = tagSidebar.selectedTag == TagSidebar.UNTAGGED ? "No untagged items" : "Not tagged";
					message = "No "+content+" in your " + state.section + this.getTaggedWithMessage(tagSidebar.selectedTag) + ".";
				}

				// filtered
				else if ( content != 'items' )
				{
					img = state.section;
					title = "No "+content+" found";
					message = "There are no "+content+" in your " + state.section + ".";
				}

				// empty : queue
				else if (state.section == 'Queue' || state.section == 'Home')
				{
					img = 'queue';
					title = "Your Queue is Empty";
					message = "<a href='http://getpocket.com/add' target='_blank'>Learn how</a> to add content to Pocket.";
				}

				// empty : favorites
				else if (state.section == 'Favorites')
				{
					img = 'favorites';
					title = "You have no favorites";
					message = "Keep track of the content you've liked: To favorite an item, click the star next to it.";
				}

				// empty : archive
				else if (state.section == 'Archive')
				{
					img = 'archive';
					title = "Your Archive is Empty";
					message = "Pocket remembers the content that you have already read, watched and viewed.<br>When you archive an item, it'll appear here.";
				}

				// if the user hasn't seen the pocket instructions before once or 
				// there hasn't been a single item that appeared in the queue at any time (implies no saves), show expanded how to save message
				if ((state.section == 'Queue' || state.section == 'Home') && boot.GSFStatus.active && !$('#page_search').val().length && !$('.item_placeholder').length)
				{
					$('#queue').prepend('<li class="item item_placeholder"></li>');
					this.gsfAddPlaceholderEvents();
				}
				if ((state.section == 'Queue' || state.section == 'Home') && (!this.sawEmptyNotice || !this.loadedItems))
				{
					message = '<div class="notice_container chromeex_warning clearfix"><div class="pocket_button_img"></div><div class="pocket_button_detail">\
								<h4>Have you installed the<br>Pocket Button for Chrome?</h4><p>Installing the Pocket button adds a button to your browser that lets you save items with one click.</p>\
								<a class="button" href="http://getpocket.com/apps/link/pocket-chrome/" target="_blank">Connect Now</a>\
								<p class="more"><a href="http://getpocket.com/add?sb=1" target="_blank">Learn more ways</a> to add content to Pocket.</p></div></div>';
					this.sawEmptyNotice = true;
					setSetting('sawEmptyNotice','1');
				}
			}

			else
			{
				img = o.img;
				title = o.title;
				message = o.message;
			}

			//
			if (!this.emptyCell)
			{
				this.emptyCell = $('<div id="queue_empty"></div>');
				this.emptyCell.html('<h3></h3><p></p>');
				$('#queue_list_wrapper').append(this.emptyCell);
			}

			var h3 = this.emptyCell.children('h3');

			h3.html(
				(img ? '<img src="/a/i/icon_m_'+img+'.png" />' : '') +
				title
			);
			if (img)
			{
				this.emptyCell.find('img').addClass('img-' + img);
			}
			this.emptyCell.children('p').html(message);
			if (message.indexOf('notice_container') > -1)
			{
				setTimeout(function() { $('.notice_container').addClass('notice_container_active'); }, 50);
			}
		}

		if (!boot.GSFStatus.active || (this.state.section != 'Queue' && this.state.section != 'Home') || $('#page_search').val().length || tagSidebar.selectedTag) {
			$('#queue_list_wrapper').toggleClass('empty', show);
		}
		if(this.notificationRow){
			this.notificationRow.removeClass("hidden");
		}
	},

	// -- //

	setView : function(view)
	{
		if (this.selectedView == view)
			return;

		setSetting('lastQueueView',view);
		this.queueList.parent().addClass('loading');

		if(this.notificationRow){
			this.notificationRow.addClass("hidden");
		}

		// remove selection
		if (this.selectedView)
		{
			$('#page_queue').removeClass(this.selectedView);
			$('#page .pkt-nav .leftItem .selected').removeClass('selected');
		}

		// add selection
		$('#page_queue').addClass(view);
		// set appropriate top icon, href
		$('#pagenav_gridlist').removeClass('pagenav_gridview pagenav_listview').addClass('pagenav_' + view + 'view');


		// close bulk editing
		this.showBulkEdit(false);

		this.selectedView = view;
	},

	// -- //

	showArticleFilterMenu: function(anchor)
	{
		if (!this.articleFilterMenu) {

		}
		this.articleFilterMenu.show(anchor);
		this.articleFilterMenu.object.css('display','block');

	},

	showShareMenu : function(anchor)
	{
		var self = this;
		if(anchor){
			anchor = $(anchor);
			var anchorItem = anchor.parents(".item");

			this.sharedItem = self.itemsByID[anchor.parents(".item").attr("id").replace(/i([0-9]+)/, "$1")];
			this.shareAnchor = anchor;

			if(!this.shareMenu){
				var shareMenuList = [];
				for(var idx = 0; idx < Sharer.sharers.length; idx++){
					var sharer = Sharer.sharers[idx];
					shareMenuList.push(dsi(idx, sharer.name));
				}

				// we just use the drop selector for its UI building, we don't want the DOM attaching behavior it does
				var shareMenu = new DropSelector( {
					id:'shareMenuContents',
					"class":'titleItem shareMenuSelector',
					nodeName:'h2',
					append: $("#container"),
					list: shareMenuList,
					selectCallback:function(selector,li)
					{
						var val = $(li).attr('val');
						var sharer = Sharer.sharers[val];
						if(sharer){
							self.shareMenu.show(false);
							sharer.share(self.sharedItem, self.shareAnchor);
							return true;
						}else{
							return false;
						}
					},
					callback:function()
					{

					},
					hideUntilSet:true
				});

				this.shareMenu = new PopOver(
					"shareMenu",
					shareMenu.ul,
					$("#container"),
					{
						onHide: function(){
							$(".pendingDialog").removeClass("pendingDialog");
						},
						positions: ['bottom','bottomright','bottomleft','topleft','topright'],
						xOffset: 0
					}
				);
				this.shareMenu.sizeObject = shareMenu.ul;

				var imgScale = window.devicePixelRatio || 1;
				var rows = this.shareMenu.object.find("li");
				for(var idx = 0; idx < rows.length; idx++){
					var row = $(rows[idx]);
					var link = row.find("a");
					var service = Sharer.sharers[parseInt(row.attr("val"), 10)];

					var imageURL = service.icon1x;
					if(imgScale > 1 && service.icon2x){
						imageURL = service.icon2x;
					}
					link.css("backgroundImage", "url(" + imageURL + ")");
				}

				shareMenu.object.remove();
				this.shareMenu.object.addClass("titleSelector");
			}
			// add simple external link to external browser li, if applicable
			var openinbrowser = $(this.shareMenu.sizeObject).children('li').filter("[val=4]")
			if (openinbrowser.length)
			{
				var sharer = Sharer.sharers[openinbrowser.attr('val')];
				if (sharer) {
					var url = self.sharedItem.resolved_url || self.sharedItem.given_url || self.sharedItem.original_url || self.sharedItem.url;
					sharer.setExternalLink(url, openinbrowser);
				}
			}
		}



		anchorItem.toggleClass("pendingDialog", anchor != undefined);
		this.shareMenu.show(anchor);
	},

	confirmDelete : function(a)
	{
		var row = $(a).closest('.item');
		var itemId = row.attr('id').replace(/^i/, '');
		var self = this;

		createDialog({
			anchor : $(a),
			title : 'Are you sure?',
			message : false,
			confirm : {
				title : 'Delete',
				action : function()
				{
					self.takeActionOnItem('delete', true, itemId, undefined, true);
				}
			},
			onShow : function()
			{
				row.addClass('pendingDialog');
			},
			onHide : function()
			{
				row.removeClass('pendingDialog');
			}
		});
	},

	tagsReady : function(data,o)
	{
		this.buildPopoverTagList(data);
	},

	buildPopoverTagList : function(data)
	{
		// we get special state on first load, default to grid
		if (queue.tagUrlPrefix == '/a/queue/') {
			queue.tagUrlPrefix = '/a/queue/grid/';
		}
		var list = $('#pagenav_tagfilter ul');
		list.children().remove();
		list.append('<li val="all"><a href="' + queue.tagUrlPrefix + '">All Items</a></li>');
		list.append('<li val="untagged"><a href="' + queue.tagUrlPrefix + '_untagged_">Untagged Items</a></li>');
		for (var i = 0; i < data.length; i++) {
			list.append('<li val="' + encodeURIComponent(sanitizeText(data[i])) + '"><a href="' + queue.tagUrlPrefix + encodeURIComponent(sanitizeText(data[i])) + '">' + sanitizeText(data[i]) + '</a></li>');
		}
		// also set a proper link for tag clear
		$('.tag_clear').attr('href',queue.tagUrlPrefix);
	},

	actionToggle : function(action, a)
	{
		var row = $(a).closest('.item');
		var itemId = row.attr('id').replace(/^i/, '');
		this.takeActionOnItem(action, !$(a).parent().hasClass('selected'), itemId, undefined, true);
	},

	takeActionOnItem : function(action, on, itemId, delay, submit)
	{
		if (!itemId)
			return;

		var delay = delay ? delay : 0;

		var self = this;

		var row = this.inited ? $('#i'+itemId) : false;
		var hideRow = false;

		var item = this.itemsByID[itemId];
		var data = {itemId:itemId, item:item};

		if (action == 'mark')
		{
			data.action = 'mark';
			data.on = on ? 1 : 0;

			if (row)
			{
				row.addClass('marked');

				this.items.splice($.inArray(item, this.items), 1);
				delete this.itemsByID[item.item_id];

				if ((this.stateSelector.value == 'queue' && on) ||
					(this.stateSelector.value == 'archive' && !on)) {

					hideRow = true;
				}

				row.find('.action_mark').toggleClass('selected', on);
				if (data.on)
				{
					sharedToast.show('Item archived');
					if (boot.GSFStatus.active)
					{
						if (!boot.UserNotices.sawarchivetooltip)
						{
							self.gsfCheckArchiveTooltip(2000);
						}
						else
						{
							self.gsfRecenterTooltip(2000);
						}
					}
				}
				else
				{
					sharedToast.show('Item added to list');
				}
			}
		}

		else if (action == 'favorite')
		{
			data.action = 'favorite';
			data.on = on ? 1 : 0;

			if (row)
			{
				item.favorite = data.on;

				row.addClass('marked');

				if (this.stateSelector.value == 'favorites' && !on)
					hideRow = true;

				row.find('.action_favorite').toggleClass('selected', on);
			}
		}

		else if (action == 'delete' && on)
		{
			data.action = 'delete';
			data.on = 1;

			if (row)
			{
				this.items.splice($.inArray(item, this.items), 1);
				delete this.itemsByID[item.item_id];

				row.addClass('marked');

				hideRow = true;
				row.find('.action_delete').toggleClass('selected', on);
				sharedToast.show('Item deleted');
				if (boot.GSFStatus.active)
				{
					self.gsfRecenterTooltip(2000);
				}
			}
		}

		if (!this.batch && submit)
		{
			queue.data.itemAction({
				data : data
			});
		}

		if (row)
		{
			if (hideRow)
			{
				setTimeout(function()
				{
					row.addClass('removed');
					var thumb = row.find('.thumb');
					if (thumb.length)
					{
						var bgthumb = thumb.css('background-size');
						if (bgthumb.indexOf(',') == -1)
						{
							thumb.css('background-size',row.width() + 'px auto');
						}
					}
					var rit = row;
					rit.on('webkitTransitionEnd transitionEnd msTransitionEnd oTransitionEnd',function(e)
					{
						if ($(e.target).hasClass('item'))
						{
							$(e.target).off('webkitTransitionEnd transitionEnd msTransitionEnd oTransitionEnd').hide();
							self.reflowTiles();
							self.highlightItemCheckDeletedMarked();
							self.processLazyLoadScroll();
						}
					});
					rit.addClass('item-column-hidden');
				},delay);

				clearTimeout(this.checkIfNeedsMoreTO);
				this.checkIfNeedsMoreTO = setTimeout( function(){ self.checkIfRunningLow(); }, delay+100 );
			}
			else {
				this.addButtonsToRow(false, row); // make sure it has buttons
			}

			if (!this.batch)
				this.checkIfRunningLow();
		}
	},

	addButtonsToRow : function(row, r, selected)
	{
		var self = this;
		r = r || $(row);
		selected =  selected || {};

		if (r.children('ul.buttons').size() === 0)
		{
			// add action buttons
			r.append(
			'<ul class="buttons">\
				<li class="action_share '+'" title="Share"><a href="#">Share</a></li>\
				<li class="action_mark '+(selected.archived?'selected':'')+'" title="Archive"><a href="#">Archive</a></li>\
				<li class="action_delete" title="Delete"><a href="#">Delete</a></li>\
				<li class="action_favorite '+(selected.favorite?'selected':'')+'" title="Favorite"><a href="#">Favorite</a></li>\
			</ul>');

			r.find('.action_mark a').click(function(e){self.actionToggle('mark', this); e.preventDefault();});
			r.find('.action_delete a').click(function(e){self.confirmDelete(this); e.preventDefault();});
			r.find('.action_favorite a').click(function(e){self.actionToggle('favorite', this); e.preventDefault();});
			r.find('.action_share a').click(function(e){self.showShareMenu(this); e.preventDefault();});
		}
	},

	gsfInitialize : function()
	{
		if (this.queueFetching) {
			return;
		}
		if (typeof boot.GSFStatus.active == 'undefined') {
			// init new GSFStatus
			boot.GSFStatus = {
				active: false,
				sawinitoverlay: false,
				extinstalled: false,
				articleview: false,
				articleviewconfirm: false,
				articleviewitemactions: false,
				webviewconfirm: false,
				saveditems: []
			}
			// if user is coming directly from signup, start GSF
			if (typeof LoginPage.action == 'string' && LoginPage.action == 'signup') {
				boot.GSFStatus.active = true;
				boot.UserNotices.sawarchivetooltip = false;
				boot.saveUserNotices();
			}
		}
		boot.saveGSFStatus();
		if (!boot.GSFStatus.active || !boot.pages.queue.isOpen || (this.state.section != 'Queue' && this.state.section != 'Home') || $('#page_search').val().length) {
			return;
		}
		// hide traditional empty state
		if ($('#queue_list_wrapper').hasClass('empty'))
		{
			$('#queue_list_wrapper').removeClass('empty');
			if (!('.item_placeholder').length)
			{
				$('#queue').prepend('<li class="item item_placeholder"></li>');
				this.gsfAddPlaceholderEvents();
			}
		}
		// show first overlay
		if (!boot.GSFStatus.sawinitoverlay && !$('.overlay_detail').is(':visible')) {
			this.gsfOpenInitOverlay();
		}
		else {
			this.gsfCheckLogic();
		}
	},

	gsfOpenInitOverlay: function(skiptoextinstall)
	{
		var self = this;
		function chromeinlineinstall() {
			window.open('http://getpocket.com/welcome_packagedredirect');
			boot.GSFStatus.extinstalled = true;
			boot.saveGSFStatus();
			boot.UserNotices.extinstalled = true;
			boot.saveUserNotices();
			OverlayScreen.hide();
			self.gsfCheckLogic();
		}
		OverlayScreen.setDetail('<div class="overlay_detail"><div class="gsf_one gsf_active clearfix">\
									<h3>Congrats!</h3><div class="gsf_bg"></div>\
									 <div class="gsf_content"><p>You\'ve successfully signed up for Pocket - the simple way to save things you want to view later.</p>\
									 <p>Access Pocket on your computer iOS or Android devices, even without an internet connection.</p><p><a class="button" href="#">Get Started</a></p></div></div>\
									 <div class="gsf_two clearfix"><a class="skip_link" href="#">Skip this step</a><h3>Save things you want to view later to Pocket.</h3><div class="gsf_bg"></div>\
									 <div class="gsf_content"><p>Connecting the Pocket button provides the best way to save pages to Pocket.</p>\
									 <p>The button sits in your toolbar so you can save any page with just one click.</p>\
									 <p><a class="button" href="#">Connect Now</a></p></div></div>\
									 <ul class="gsf_progress"><li class="selected">1</li><li>2</li></ul></div>');
		if (skiptoextinstall)
		{
			chromeinlineinstall();
		}
		else
		{
			setTimeout(function()
			{
				boot.hideNotification();
				OverlayScreen.show();
				PocketAnalytics.action('gsf_congrats','view','packagedapp');
				$('.gsf_one .button').click(function(e) {
					e.preventDefault();
					PocketAnalytics.action('gsf_congrats_getstarted','click','packagedapp');
					boot.GSFStatus.sawinitoverlay = true;
					boot.saveGSFStatus();
					if (PocketUserApps.ready && PocketUserApps.installedExtension())
					{
						boot.GSFStatus.extinstalled = true;
						boot.saveGSFStatus();
						boot.UserNotices.extinstalled = true;
						boot.saveUserNotices();
						OverlayScreen.hide();
						self.gsfCheckLogic();
					}
					$('.gsf_one').removeClass('gsf_active');
					$('.gsf_two').addClass('gsf_active');
					PocketAnalytics.action('gsf_savethings','view','packagedapp');
					var progress = $('.gsf_progress').find('li');
					progress.first().removeClass('selected');
					progress.last().addClass('selected');
				});
				$('.gsf_two .button').click(function(e) {
					chromeinlineinstall();
					PocketAnalytics.action('gsf_savethings_connectnow','click','packagedapp');
				});
				$('.gsf_two .skip_link').click(function(e) {
					OverlayScreen.hide();
					self.gsfCheckLogic();
					PocketAnalytics.action('gsf_savethings_exit','click','packagedapp');
				});
			},1000);
		}
	},

	gsfCheckLogic : function()
	{
		var self = this;
		if (!boot.GSFStatus.active || self.archiveTooltipPending)
		{
			return;
		}
		if (typeof this.gsftooltip == 'object')
		{
			this.gsftooltip.show(false);
		}
		function getArticleType(item)
		{
			var id = item.attr('id').substring(1);
			var fullitem = self.itemsByID[id];
			var videourlpattern = /youtube.com\/watch|vimeo.com\/\d/;
			return (typeof fullitem == 'object' && fullitem.has_video == 2 || videourlpattern.test(fullitem.given_url)) ? 'video' : 'article'
		}
		function checkForExistingId(id)
		{
			var foundmatch = false;
			for (i = 0; i < boot.GSFStatus.saveditems.length; i++)
			{
				if (boot.GSFStatus.saveditems[i].id == id)
				{
					foundmatch = true;
				}
			}
			return foundmatch;
		}
		function savedArticle()
		{
			var foundmatch = false;
			for (i = 0; i < boot.GSFStatus.saveditems.length; i++)
			{
				if (boot.GSFStatus.saveditems[i].type == 'article')
				{
					foundmatch = true;
				}
			}
			return foundmatch;
		}
		function savedVideo()
		{
			var foundmatch = false;
			for (i = 0; i < boot.GSFStatus.saveditems.length; i++)
			{
				if (boot.GSFStatus.saveditems[i].type == 'video')
				{
					foundmatch = true;
				}
			}
			return foundmatch;
		}

		// check to see how many saved items are on the current screen, add to data if not there
		var items = this.queueList.children('.item');
		var validitems = items.not('.removed,.item_placeholder');
		var validitemscount = validitems.length;
		var savedgsfitems = boot.GSFStatus.saveditems.length;
		if (savedgsfitems >= 0 && validitemscount > 0 && !checkForExistingId(validitems.first().attr('id').substring(1)))
		{
			boot.GSFStatus.saveditems.push({id:validitems.first().attr('id').substring(1),type:getArticleType(validitems.first())});
			savedgsfitems++;
			boot.saveGSFStatus();
		}
		// add placeholder
		if (savedgsfitems < 3 || (savedgsfitems < 5 && (!savedVideo() || !savedArticle())))
		{
			if (!$('.item_placeholder').length)
			{
				if (!$('.item').length)
				{
					$('#queue').prepend('<li class="item item_placeholder"></li>');
				}
				else
				{
					$('.item').last().after('<li class="item item_placeholder"></li>');
				}
				this.gsfAddPlaceholderEvents();
			}
		}
		else if ($('.item_placeholder').length)
		{
			$('.item_placeholder').remove();
		}

		// logic when user has saved zero items
		if (savedgsfitems == 0)
		{
			if (boot.GSFStatus.extinstalled || (PocketUserApps.ready && PocketUserApps.installedExtension()))
			{
				this.gsftooltip = createTooltip($('.item_placeholder'),'Save your first item','Venture out and save your first item using the Pocket Button. Try out a news article or YouTube video.');
			}
			else
			{
				this.gsftooltip = createTooltip($('#pagenav_addarticle'),'Save your first item','You can add to Pocket here. Find a cool article or YouTube video to test it out.');
			}
			if (PocketAnalytics.prevAction != 'gsf_tooltip_savefirst')
			{
				PocketAnalytics.action('gsf_tooltip_savefirst','view','packagedapp');
			}
		}
		// prioritize first those that have never opened an item
		else if (savedgsfitems > 0 && !boot.GSFStatus.articleview && $('.item').not('.removed,.item_placeholder').length)
		{
			var wording = 'You saved your first item to Pocket. Click it to check it out.';
			if (savedgsfitems > 1)
			{
				wording = 'Saved items are shown here. Click an item to check it out.'
			}
			this.gsftooltip = createTooltip($('.item').not('.removed,.item_placeholder').first(),'Success!',wording);
			if (PocketAnalytics.prevAction != 'gsf_tooltip_success')
			{
				PocketAnalytics.action('gsf_tooltip_success','view','packagedapp');
			}
		}
		// logic when we've saved the first item...
		else if (savedgsfitems == 1)
		{
			this.gsftooltip = createTooltip($('.item_placeholder'),'Save more to Pocket','Find another article or video.');
			if (PocketAnalytics.prevAction != 'gsf_tooltip_savemore')
			{
				PocketAnalytics.action('gsf_tooltip_savemore','view','packagedapp');
			}
		}
		// logic for having saved two items...
		else if (savedgsfitems == 2 || (savedgsfitems > 0 && savedgsfitems < 5 && (!savedVideo() || !savedArticle())))
		{
			var analyticssuffix = '';
			if (savedgsfitems > 2)
			{
				analyticssuffix = '_' + (savedgsfitems-1);
			}
			if (!savedVideo())
			{
				this.gsftooltip = createTooltip($('.item_placeholder'),'Pocket is also a great place to save videos.','Save something from YouTube and give it a try.');

				if (PocketAnalytics.prevAction != 'gsf_tooltip_savevideos' + analyticssuffix)
				{
					PocketAnalytics.action('gsf_tooltip_savevideos' + analyticssuffix,'view','packagedapp');				
				}
			}
			else if (!savedArticle())
			{
				this.gsftooltip = createTooltip($('.item_placeholder'),'You\'ve saved a few items. Nicely done!','Did you know that Pocket is perfect for reading articles? Go ahead and save an article to read later.');
				if (PocketAnalytics.prevAction != 'gsf_tooltip_savearticles' + analyticssuffix)
				{
					PocketAnalytics.action('gsf_tooltip_savearticles' + analyticssuffix,'view','packagedapp');				
				}				
			}
			else 
			{
				this.gsftooltip = createTooltip($('.item_placeholder'),'Save more to Pocket','Find another article or video.');
				if (PocketAnalytics.prevAction != 'gsf_tooltip_savemoreagain')
				{
					PocketAnalytics.action('gsf_tooltip_savemoreagain','view','packagedapp');				
				}
			}
		}
		else
		{
			if ($('.gsf_device_reminder_container').length)
			{
				this.gsftooltip = createTooltip($('.gsf_device_reminder_container'),'Take Pocket to go','Connect your mobile devices - it even works offline!',['top']);			
				if (PocketAnalytics.prevAction != 'gsf_tooltip_taketogo')
				{
					PocketAnalytics.action('gsf_tooltip_taketogo','view','packagedapp');
				}
				// special case: kill final tooltip after click anywhere
				$('body').one('click',function()
				{
					if (typeof self.gsftooltip == 'object')
					{
						self.gsftooltip.show(false);
					}
				});
			}
			boot.GSFStatus.active = false;
			boot.saveGSFStatus();
		}
	},

	gsfAddPlaceholderEvents: function()
	{
		$('.item_placeholder').click(function(e)
		{
			e.preventDefault();
			var tooltip = $('.alt-tooltip');
			if (!tooltip.length || tooltip.hasClass('tooltip-wiggle') || !tooltip.is(':visible'))
			{
				return;
			}
			tooltip.addClass('tooltip-wiggle');
			tooltip.one('webkitAnimationEnd animationend msAnimationEnd oAnimationEnd',function(e) {
				$(this).removeClass('tooltip-wiggle');
			});
		});
	},

	// Called when we delete/remove an item and have to reposition the tooltip
	gsfRecenterTooltip: function(delay)
	{
		this.gsftooltip.show(false);
		var self = this;
		setTimeout(function()
		{
			self.gsfCheckLogic();
		},delay);
	},

	gsfCheckArchiveTooltip: function(delay)
	{
		var self = this;		
		if (!self.archiveTooltipPending)
		{
			boot.UserNotices.sawarchivetooltip = true;
			boot.saveUserNotices();
			self.archiveTooltipPending = true;
			setTimeout(function() 
			{
				var tool = createTooltip($('#queue_title > a'),'Item archived','To view your archived items, tap Pocket above and then select "Archive"');
				tool.object.css('marginTop','10px');
				$('#queue_title > a').one('click',function()
				{
					self.archiveTooltipPending = false;
					tool.show(false);
					self.gsfCheckLogic();
				});
				PocketAnalytics.action('gsf_tooltip_itemarchived','view','packagedapp');
			},delay);
		}
	},

	// -- //

	highlightItemMove : function(movenext)
	{
		var items = $('#queue').find('.item').not('.removed');
		if (!items.length) return;
		if (!this.itemHighlight)
		{
			this.itemHighlight = items.first();
		}
		else
		{
			this.itemHighlight.removeClass('item-highlight');
			var valid = null;
			do
			{
				if (this.itemHighlight && this.itemHighlight.length && !this.itemHighlight.hasClass('removed'))
				{
					valid = this.itemHighlight;
				}
				if (movenext)
				{
					this.itemHighlight = this.itemHighlight.next();
				}
				else
				{
					this.itemHighlight = this.itemHighlight.prev();
				}
				if (this.itemHighlight.length && this.itemHighlight.hasClass('loadingRow'))
				{
					if (movenext)
					{
						this.itemHighlight = this.itemHighlight.next();
					}
					else
					{
						this.itemHighlight = this.itemHighlight.prev();
					}
				}
				if (this.itemHighlight.length && !this.itemHighlight.hasClass('item'))
				{
					this.itemHighlight = [];
				}
			} while (this.itemHighlight.length && this.itemHighlight.hasClass('removed'))
			if (!this.itemHighlight.length || this.itemHighlight.hasClass('removed'))
			{
				if (!valid)
				{
					this.resetHighlight();
					return;
				}
				this.itemHighlight = valid;
			}
		}
		this.itemHighlight.addClass('item-highlight');
		if (!this.itemHighlight.find('.buttons').length)
		{
			this.addButtonsToRow(this.itemHighlight);
		}
		// if we're offscreen, scroll automatically
		var scrollcontainer = $('body');
		var scrolltop = scrollcontainer.scrollTop();
		var screentop = scrolltop;
		var screenbottom = $(window).height() + scrolltop;
		var itemtop = this.itemHighlight.offset().top;
		var itemheight = this.itemHighlight.height();
		var buffer = 20;
		if ((itemtop + buffer) > screenbottom)
		{
			scrollcontainer.animate({'scrollTop':scrolltop + (itemtop - screenbottom + buffer + itemheight)},300);
		}
		else if ((itemtop - buffer) < screentop)
		{
			scrollcontainer.animate({'scrollTop':scrolltop - (screentop - itemtop + buffer + itemheight)},300);
		}
	},

	// auto logic that moves the selected item if it happens to just deleted or marked/archived
	highlightItemCheckDeletedMarked : function()
	{
		if (this.itemHighlight && this.itemHighlight.length && this.itemHighlight.hasClass('removed'))
		{
			if (this.itemHighlight.next('.item').not('.removed').length)
			{
				this.highlightItemMove(true);
			}
			else
			{
				this.highlightItemMove(false);
			}
		}
	},

	resetHighlight : function()
	{
		if (this.itemHighlight)
		{
			this.itemHighlight.removeClass('item-highlight');
		}
		this.itemHighlight = null;
	},

	highlightItemAction : function(action)
	{
		if (this.itemHighlight)
		{
			if (action == 'open')
			{
				this.itemHighlight.children('a').trigger('click');
			}
			if (action == 'mark')
			{
				this.itemHighlight.find('.action_mark a').trigger('click');
			}
			if (action == 'favorite')
			{
				this.itemHighlight.find('.action_favorite a').trigger('click');
			}
			if (action == 'delete')
			{
				this.itemHighlight.find('.action_delete a').trigger('click');
			}
			if (action == 'browseropen')
			{
				var item = this.itemForItemID(queue.itemHighlight.attr('id').replace('i',''));
				if (typeof item.item_id == 'string')
				{
					var url = (item.resolved_url ? item.resolved_url : item.given_url);
					window.open(urlWithPocketRedirect(url));
				}
			}
		}
	},

	// -- //

	editItemTags : function(li)
	{
		var row = $(li).parents('.item').get();
		var r = $(row);
		var t = r.find('.tags');
		var i = r.find('.tags input');

		r.addClass('editTags');

		if (i.size() === 0) {
			var self = this;

			// create text field
			i = $('<input type="text" />');
			var block = $('<div class="block">&nbsp;&nbsp;&nbsp;</div>'); //leaves something in the LI to take up space

			/*
			i.autoGrowInput({
				comfortZone: 25,
				minWidth: 150,
				maxWidth: 550
			});
			*/


			i.bind('focus', function(){ self.beforeEditTags = $(this).val(); $(this).select();});
			i.bind('keypress', function(e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				if (code == 13) {
					self.commitTagChanges();
				}
			});
			i.blur(function() {
				self.commitTagChanges();
			});

			t.append(i);
			t.append(block);
		}

		// update field with tags
		var currentTags = t.children('span').text();
		i.val(currentTags);

		this.openTagField = i;
		i.focus();
	},

	commitTagChanges : function()
	{
		// find open tag field
		var row = this.queueList.find('.editTags');
		if (!row.hasClass('editTags') || row.hasClass('committing')) {
			return;
		}

		// prevent blurring if we get a popup
		row.addClass('committing');

		var tagInput = row.find('input');
		var tagsFromInput = tagsFromText(tagInput.val());

		// Delete all duplicates that the user inserted in the tags field
		var tags = tagsFromInput.filter(function(elem, pos) {
			return tagsFromInput.indexOf(elem) == pos;
		});


		// Update the tag in the row and in the tags popover
		if (this.validateTags(tags)) {
			// Update tag in the row
			this.updateItemTags(row, tags, 'tags_replace');

			// Try to add the tag to the tag list
			var list = $('#pagenav_tagfilter ul');
			var olditems = list.find('li');

			// Find the proper place for all new tags in the tags popover list
			for (var i = 0; i < tags.length; i++) {
				var tagToAdd = tags[i];
				var tagElement = $('<li val="' + encodeURIComponent(tags[i]) + '"><a href="' + queue.tagUrlPrefix + encodeURIComponent(tags[i]) + '">' + tagToAdd + '</a></li>');

				// Find proper place in list, keep alphabetical. Start with
				// with position 2 to jump over All Items, Untagged Items and
				// a space.
				var insertpoint = 2;
				for (var j = 2; j < olditems.length; j++) {
					var currtext = olditems.eq(j).children('a').text();
					var nexttext = null;

					// Get the nexttext
					if (j < olditems.length - 1) {
						nexttext = olditems.eq(j+1).children('a').text();
					}

					// Check if have the tag already in the list and don't add it
					// if we already have it in the list
					if (tagToAdd === currtext || tagToAdd === nexttext) {
						break;
					}

					// Check if we need to add the tag before the current element
					if (tagToAdd <= currtext) {
						olditems.eq(j).before(tagElement);
						break;
					}

					// Check if we need to add the tag after the current element
					if (!nexttext || (nexttext && tagToAdd > currtext && tagToAdd <= nexttext)) {
						olditems.eq(j).after(tagElement);
						break;
					}
				}
			}

			// check if existing tags still relevent, if not remove
			var oldtags = tagsFromText(this.beforeEditTags);
			var livetags = $('#queue .hasTags').find('a').not('.edit');
			for (var i = 0; i < oldtags.length; i++) {
				var match = false;
				livetags.each(function(z,ele) {
					if (oldtags[i] == $(ele).text()) {
						match = true;
					}
				});
				if (!match) {
					olditems.filter('[val="' + encodeURIComponent(oldtags[i]) + '"]').remove();
				}
			}


			// save to data store
			var item = this.itemsByID[row.attr('id').replace(/^i/, '')];
			this.data.updateItemTags(item, tags);

			// close field
			row.removeClass('editTags');
		}

		// prevent blurring if we get a popup
		row.removeClass('committing');
	},

	validateTags : function(tags)
	{
		if (tags.length) {
			for (var i = 0; i < tags.length; i++) {
				if (tags[i].length > 25) {
					// TODO : OPTIMIZE : pretty dialog
					boot.showErrorNotification('Tags are limited to 25 characters, please shorten the tag "'+tags[i]+'"');
					return false;
				}
			}
		}
		return true;
	},

	updateItemTags : function(row, tags, tagActionType)
	{
		if (!row || !tags) {
			return;
		}

		var tagSpan = row.find('.tags').children('span');
		var newTags = false;

		// replace is simple
		if (tagActionType == 'tags_replace') {
			newTags = tags;
		}
		// add and remove requires more investigating of current tags
		else {
			var passTags = tags;
			var oldTags = tagsFromText(tagSpan.text());

			if (tagActionType == 'tags_add' && tags.length) {
				newTags = oldTags;
				for (var i = 0; i < tags.length; i++) {
					if ($.inArray(tags[i], oldTags) == -1) {
						newTags.push( tags[i] );
					}
				}
			}
			else if (tagActionType == 'tags_remove' && oldTags.length) {
				newTags = $.grep(oldTags, function(val) {
					return $.inArray(val, passTags) == -1;
				});
			}
		}

		if (newTags) {
			tagSpan.html(listTags(newTags, true));
		}

		// Update visibility of add tag vs edit tag on row
		row.find('.tags').toggleClass('hasTags', newTags!=false);
	},

	tagRenamed : function( oldTag, newTag )
	{
		var oldTag = oldTag;
		var newTag = newTag;
		this.queueList.find('.tags span:first-child a').each( function()
		{
			var o = $(this);
			if (o.text() == oldTag)
			{
				o.text(newTag);
				o.attr('href', queue.tagUrlPrefix+encodeURIComponent(newTag));
			}
		});
	},

	tagDeleted : function( tag )
	{
		this.queueList.find('.tags span:first-child').each( function()
		{
			if (this.innerHTML.indexOf(tag, 0) != -1)
			{
				var o = $(this);
				var tags = tagsFromText( o.text() );
				var removeMe = tag;
				tags = $.grep(tags, function(value)
				{
					return value != removeMe;
				});
				o.html( listTags(tags, true) );
			}
		});
	},

	//

	toggleTagSidebar : function(open)
	{
		tagSidebar.show(open);
	},

	// -- Auto Paging

	scrolled : function()
	{
		if (!this.isOpen) {
			return;
		}

		if ($(document.body).hasClass('editing')) {
			return;
		}

		// Cache element
		this.contentEl = this.contentEl || document.getElementById('content');

		// Calculate values to check if we are already at the end of the page
		var y = $(window).scrollTop();
		var w = $(window).width();
		var h = this.contentEl.scrollHeight;

		if (!h) return;

		// Check if we at least 80% at the end of the page and if we are not
		// loading anything and there are some remaining items, get them
		if ((y + w) >= h*0.8 && !this.loading && this.remaining) {
			this.reloadList({append:true});
		}

	},

	// -- Bulk Editing

	actionForName : function(name)
	{
		var action, on;

		switch(name)
		{
			case('mark'):
				action = 'mark';
				on = true;
				break;

			case('unmark'):
				action = 'mark';
				on = false;
				break;

			case('delete'):
				action = 'delete';
				on = true;
				break;

			case('favorite'):
				action = 'favorite';
				on = true;
				break;

			case('unfavorite'):
				action = 'favorite';
				on = false;
				break;
		}

		return action ? {action:action, on:on} : false;
	},

	showBulkEdit : function(show)
	{
		if (show)
		{
			var self = this;

			// switch to list view
			if (this.selectedView != 'list')
				boot.loadStateFromUrl( this.getInfoForState({section:this.state.section,view:'list',tag:this.state.tag}).url );

			// update rows
			this.applyEditToRows();

			// add editing toolbars
			if (!this.topEditToolbar)
			{
				// select-all checkbox
				this.selectAllBox = selectAllBox = $('<div class="indent_wrapper"><div class="indent"><div class="shift"><div class="checkbox"></div></div></div></div>');
				selectAllBox.click(function()
				{
					var t = $(this);
					if(!t.find('.checkbox').hasClass('checked'))
					{
						self.selectedAll = true;
						t.find('.checkbox').addClass('checked');
						self.queueList.children('.item').addClass('selected');
					}
					else
					{
						self.selectedAll = false;
						t.find('.checkbox').removeClass('checked');
						self.queueList.children('.item').removeClass('selected');
					}

					t.find('.checkbox').removeClass('dim');
					self.updateBulkEdit();

					// TODO after selecting all, if one is deselected, lower the opacity (like gmail does)
				});

				// status control
				var statusControlItem = new ToolbarEdgeButton({id:'be_status', label:'Action:'});
				var tagActionItem = new ToolbarEdgeButton({id:'be_tag_action', label:'Tags:'});

				// tag field
				var tagItem = $('<div id="bulk_edit_tags"></div>');
				tagItem.append('<input placeholder="Enter tags separated by commas" />');



				// activate dropSelectors
				this.bulkEditStatusControl = new DropSelector({
					object:statusControlItem.object,
					displayer:statusControlItem.inner,
					anchor:statusControlItem.inner.parent(),
					useSelectOnIE: true,
					showClass:'on',
					list:[dsi('none','No action'), dsi('mark','Mark as read'), dsi('unmark','Re-add to list'), dsi('delete','Delete'), dsi('favorite','Favorite'), dsi('unfavorite','Unfavorite')],
					callback:function(){self.updateBulkEdit();}
				});

				if(this.bulkEditStatusControl.selector){
					this.bulkEditStatusControl.selector.addClass("bulkEditStatusControl");
				}

				this.tagActionControl = new DropSelector( {object:tagActionItem.object, useSelectOnIE: true, displayer:tagActionItem.inner, anchor:tagActionItem.inner.parent(), showClass:'on', list:[dsi('tags_add','Add Tags'), dsi('tags_remove','Remove Tags'), dsi('tags_replace','Replace Tags')], callback:function(){self.updateBulkEdit();}})

				if(this.tagActionControl.selector){
					this.tagActionControl.selector.addClass("tagActionControl");
				}

				this.topEditToolbar = new Toolbar({
					"class":'bedit_toolbar',
					items:[
						{type:'element', object:selectAllBox},
						{type:'spacer'},
						{type:'custom', item: statusControlItem},
						{type:'spacer', width:126},
						{type:'custom', item: tagActionItem},
						{type:'spacer', width:15},
						{type:'element', object:tagItem}
					],
					insertBefore:this.footerItem.object
				});

				// separator
				new Toolbar({
					"class":'bedit_toolbar separator',
					items:[
						{type:'spacer'}
					],
					insertBefore:this.footerItem.object
				});

				// bottom toolbar
				new Toolbar({
					"class":'bedit_toolbar',
					items:[
						//{type:'custom', item:new ToolbarEdgeButton({class:'bedit_button_on on',img:'footer_i_edit.png',type:'edge',text:'Bulk Edit',callback:function(toggle){self.showBulkEdit(false);}})},
						{type:'element', object:$('<div id="bedit_label" class=""><span>Bulk Edit</span></div>')},
						{type:'spacer'},
						{type:'button', id:'bedit_save_button', label:'&nbsp;', text:'Save Changes', callback:function(){self.commitBulkEdit();}},
						{type:'spacer', width: 8},
						{type:'button', text:'Cancel', callback:function(){self.showBulkEdit(false);}},
					],
					insertBefore:this.footerItem.object
				});

				// add events
				$('#bulk_edit_tags input').keypress(function(){self.updateBulkEdit();});
			}

			// clear old entries
			this.selectAllBox.find('.checkbox').removeClass('checked').removeClass('dim');
			this.bulkEditStatusControl.set('none', true);
			$('#bulk_edit_tags input').val('');
			this.updateBulkEdit();

			// toggle toolbars
			$('.bedit_toolbar').show();
			$('.queue_toolbar').hide();

			// hide tag sidebar if it is open
			if (tagSidebar.isOpen())
			{
				tagSidebar.show(false);
				this.tagSidebarShouldOpenAfterEdit = true;
			}

			// Set page in bulk editing mode
			setTimeout(function(){$(document.body).addClass('editing');}, 25); //delay so checkboxes can be added and animated

		}
		else
		{
			// toggle toolbars
			$('.bedit_toolbar').hide();
			$('.queue_toolbar').show();

			if (this.bulkEditStatusControl)
			{
				this.bulkEditStatusControl.close();
				this.tagActionControl.close();
			}

			$(document.body).removeClass('editing');

			// reopen tag sidebar
			if (this.tagSidebarShouldOpenAfterEdit)
			{
				tagSidebar.show(true);
				this.tagSidebarShouldOpenAfterEdit = false;
			}
		}

		// remove selection
		this.queueList.find('.item.selected').removeClass('selected');

	},

	applyEditToRows : function()
	{
		var self = this;

		// Add checkboxes
		this.queueList.children('.item:not(:has(.checkbox))').append('<a class="checkbox"></a>').click(function()
		{
			if (currentDropSelector)
			{
				// hack ticket #188
				currentDropSelector.close();
				return ;
			}

			if ($(document.body).hasClass('editing'))
			{
				$(this).toggleClass('selected');
				self.updateBulkEdit();
				self.updateCheckAllBox();

				return false;
			}
		});

		// Add blocker
		this.queueList.find('.inner:not(:has(.blocker))').append('<div class="blocker"></div>');
	},

	updateCheckAllBox : function()
	{
		// If the user has selected all, then we need to have the select all button respond visually since it is no longer in a 'selected all' state
		if (this.selectedAll)
		{
			// if nothing is checked anymore, drop it
			if (this.queueList.children('.item.selected').size == 0)
				this.selectAllBox.click();

			// dim the checkbox if it's in the incomplete state
			else
				this.selectAllBox.find('.checkbox').addClass('dim');
		}
	},

	updateBulkEdit : function()
	{
		// selected count
		var c = this.queueList.find('.item.selected').size();
		var	summary = 'SELECTED '+c+' ITEM'+(c==1?'':'S')+' TO APPLY: ';

		// apply statement
		var apply = '';
		var changesToApply = false;

		// status
		if (this.actionForName( this.bulkEditStatusControl.value ))
		{
			apply = this.bulkEditStatusControl.label;
			changesToApply = true;
		}

		// tags
		if ($.trim($('#bulk_edit_tags input').val()).length)
		{
			apply += (apply.length?', ':'')+this.tagActionControl.label;
			changesToApply = !!c;
		}

		//complete
		if (apply.length)
			summary += apply;
		else if (c)
			summary += 'No change';
		else
			summary = '';

		$('#bedit_save_button .label').text( summary );


		// button
		$('#bedit_save_button .button').toggleClass('highlight', c>0 && changesToApply);

		return changesToApply;
	},

	commitBulkEdit : function()
	{
		// TODO : OPTIMIZE : Prime candidate for web workers (particularly tag editing logic)

		if (!this.updateBulkEdit())
		{
			// TODO: OPTIMIZE : let's make a nicer dialog here
			var c = this.queueList.find('.item.selected').size();
			if (c)
				boot.showErrorNotification('There are no changes to save. You have selected '+(c==1?'an item':'some items')+' but have not set a new status or tag.');
			else
				boot.showErrorNotification('You have not selected anything to change.');

			return;
		}
		else
		{
			// validate tags
			var tagType = this.tagActionControl.value;
			var tagList = $('#bulk_edit_tags input').val();
			var tags = tagsFromText(tagList);
			if (!this.validateTags( tags ))
				return;

			// get info
			var statusAction = this.actionForName( this.bulkEditStatusControl.value );

			// save changes to data store and update UI
			this.batch = true;
			var items = [];
			var selected = this.queueList.children('.item.selected:not(.removed)');
			var c = 0;
			for(var i=0; i<selected.length; i++) {
				// gather items to send to data store
				items.push(selected[i].id.replace(/^i/, ''));

				// commit new status
				if (statusAction != 1)
					this.takeActionOnItem(statusAction.action, statusAction.on, $(selected[i]).attr('id').replace(/^i/, ''), undefined, true);

				// update tags
				if (tags.length)
					this.updateItemTags($(selected[i]), tags, tagType);
			}
			this.batch = false;

			// update grid view
			this.reflowTiles();

			// update sidebar
			if (tags && tagType != 'tags_remove') {
				tagSidebar.lookForNewtags( tags );
			}

			// send to data store
			this.data.bulkEdit({
				data:
				{
					items:items,
					status:statusAction.action,
					on:statusAction.on,
					tagType:tagType,
					tags:tagList
				}
			});

			// hide the editing interface
			this.showBulkEdit(false);

			// do we need more rows?
			this.checkIfRunningLow();

			// load new thumbnails and favicons if necessary
			this.processLazyLoadScroll();
		}
	},

	// -- //

	showByliner : function(anchor)
	{
		if (anchor)
		{
			var self = this;
			var anchor = $(anchor);
			if (!this.bylinerPopup)
				this.bylinerPopup = new PopOver(
					'byliner',
					$('<iframe frameBorder="0" scrolling="NO" src="about:blank"></iframe>'),
					$('#container'),
					{
						onHide:function(){
							self.bylinerPopup.object.find('iframe').attr('src', 'about:blank');
						}
					}
				);

			// reposition
			this.bylinerPopup.show(anchor);

			// update iframe
			var url = '/ril/writers?q='+encodeURIComponent(anchor.text())+'&url='+encodeURIComponent(anchor.parents('.item').find('.link').attr('href'));
			this.bylinerPopup.object.find('iframe').attr('src', 'http://byliner.com'+url);
		}
		else if (this.bylinerPopup)
			this.bylinerPopup.show(false);

	},

	showInbox: function(anchor)
	{
		if (typeof anchor !== 'undefined') {

			// Lazy initialize the inbox view and popover
			if (typeof this.inboxPopover === 'undefined') {
				this.inboxView = new InboxView($("<div class='inbox'></div>"), this.notifications, this.unconfirmedNotifications);
				this.inboxPopover = new PopOver(
					'notifications_list',
					this.inboxView.view,
					$('#container'),
					{
						onShow:function() {
							setTimeout(function() {
								$('#page').prepend($('#notifications_list'));
							},100);
						},
						onHide:function(){
							$('#container').append($('#notifications_list'));
						},
						disableHideOnScroll: true
					}
				);
			}

			// Update inbox view with the newest notifications
			this.inboxView.reloadData(this.notifications, this.unconfirmedNotifications);
			this.inboxPopover.show(anchor);

			return;
		}

		this.inboxPopover.show(false);
	}
};


/**
 * Inbox View
 */
var InboxView = function(view, notifications, unconfirmedNotifications) {
	this.view = view;
	this.notifications = notifications;
	this.unconfirmedNotifications = unconfirmedNotifications;
};

InboxView.prototype.reloadData = function(notifications, unconfirmedNotifications) {
	this.unconfirmedNotifications = unconfirmedNotifications;
	this.notifications = notifications;

	this.view.find(".notification").remove();

	var elements = [];

	for (var key in this.unconfirmedNotifications) {
		var notification = this.unconfirmedNotifications[key];
		var view = this.cellForUnconfirmedNotification(notification);
		this.view.append(view);

		view.css("height", view.height() + 14);
	}

	for (var idx = 0; idx < this.notifications.length; idx++) {
		var notification = this.notifications[idx];
		var view = this.cellForNotification(notification);
		this.view.append(view);

		view.css("height", view.height() + 14);
	}

	setTimeout(function(){
		this.view.find("a.notification").addClass("canAnimate");
	}.bind(this), 1);
};

InboxView.prototype.cellForUnconfirmedNotification = function(notification) {
	var view = $("<div class='unconfirmed notification'></div>");
	var innerView = $("<div></div>");

	var itemRow= $("<div class='item'></div>");
	var title = $("<div class='title'></div>");
	title.text("Confirm Your Email");
	var description = $("<div class='description'></div>");
	description.text("" + (notification.name || "A friend") + " has shared something with you in Pocket. To view it, please confirm your email: " + notification.email);

	var buttonRow = $("<div class='buttons'></div>");
	var resendEmail = $("<a class='resend yellow button'>Resend Confirmation</a>");
	resendEmail.click(function(e) {
		boot.helper.sync.makeAPIRequest("resendEmailConfirmation", {
			email: notification.email
		})
		.done(function(response) {
			delete queue.unconfirmedNotifications[notification.email];
			queue.receivedNotifications(queue.notifications, queue.unconfirmedNotifications);
			view.addClass("hidden");

			var hasUnconfirmedNotifications = false;
			for (var key in queue.unconfirmedNotifications){
				hasUnconfirmedNotifications = true;
				break;
			}

			if (queue.notifications.length === 0 && !hasUnconfirmedNotifications) {
				queue.inboxPopover.show(false);
			}

			sharedToast.show('Sent!');
		})
		.fail(function(response) {
			if (response.status != 200){
				// Check for error and show message (X-Error response header)
				// TODO: take this into a notification
				alert("Couldn't resend the confirmation email. Please try again.");
			}
			else {
				response.success();
			}
		})
		e.preventDefault();
		return false;
	});

	itemRow.append(title).append(description);
	buttonRow.append(resendEmail);
	innerView.append(itemRow).append(buttonRow);
	view.append(innerView);

	return view;
};

var attributionForShare = InboxView.prototype.cellForNotification = function(notification, item, isList, omitItem) {
	item = item || notification.item;
	isList = isList || false;
	var url = (item.resolved_url ? item.resolved_url : item.given_url);
	var fromFriend = notification.from_friend;
	if (!fromFriend) {
		fromFriend = queue.friends[notification.from_friend_id];
	}

	var openURL = url;

	var view;
	if (!omitItem) {
		view = $("<a class='notification' target='_blank'></a>");
		view.click(function () {
			queue.data.opened(item.item_id, 13);
		});
		view.attr("href", sanitizeText(openURL));
	}
	else {
		view = $("<div class='notification'></div>");
	}

	var innerView = $("<div></div>");

	// Attribution
	var attributionRow = $("<div class='attribution'></div>");

	// Avatar loading the packaged app way
	var avatar = $("<div class='avatar'></div>");
	if (fromFriend && getImageCacheUrl(fromFriend.avatar_url, 'w90-h90-nc')) {
		// Load avatar from cache
		assetCache.loadAvatar(fromFriend.avatar_url, function(avatar, img) {
			var backgroundImage = "";
			if (typeof img !== 'undefined') {
				backgroundImage += 'url(\''+ img.src +'\')';
			}
			avatar.css("backgroundImage", backgroundImage);
		}.bind(this, avatar));
	}
	else {
		// No avatar for the friend just load the empty avatar
		var avatarURL;
		if (isChromePackagedApp()) {
			avatarURL = "a/i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
			avatarURL = chrome.runtime.getURL(avatarURL);
		}
		else {
			avatarURL = "i/empty_avatar" + (window.devicePixelRatio > 1 ? "-2x" : "") + ".png";
		}
		//Load an empty avatar
		avatar.css("backgroundImage", "url('" + avatarURL + "')");
	}


	var name = $("<div class='full_name'></div>");
	name.text((fromFriend && fromFriend.name ? fromFriend.name : "A friend"));

	var timeSince = $("<div class='time_since'></div>");
	if (typeof notification.time_shared == "string") {
		notification.time_shared = new Date(parseInt(notification.time_shared, 10) * 1000);
	}
	var timeSinceDate = notification.time_shared;
	timeSince.text("" + relativeDateString(timeSinceDate));

	// comment
	var comment = $();
	if (notification.comment && notification.comment.length) {
		comment = $("<div class='comment'></div>");
		comment.text(notification.comment);
	}

	// quote
	var quote = $();
	if (notification.quote && notification.quote.length > 0) {
		quote = $("<div class='quote'></div>");
		quote.text(notification.quote);
	}

	if (!omitItem) {
		var caret = $("<div class='caret'></div>");

		// item
		var itemRow= $("<div class='item'></div>");
		var title = $("<div class='title'></div>");
		title.text(item.resolved_title);
		var domain = $("<div class='domain'></div>");
		domain.text(domainForURL(url));

		// buttons
		var buttonRow = $("<div class='buttons'></div>");
		var ignoreButton = $("<div class='ignore button button-secondary button-mini'>Ignore</div>");
		var addToListButton = $("<div class='addToList button button-important button-mini'>Add To List</div>");

		var hideNotification = function() {
			queue.notifications.splice(queue.notifications.indexOf(notification), 1);
			queue.receivedNotifications(queue.notifications, queue.unconfirmedNotifications);
			view.addClass("hidden");
			if (queue.notifications.length === 0){
				queue.inboxPopover.show(false);
			}
		};

		ignoreButton.click(function(e) {
			e.preventDefault();

			item = queue.itemsByID[notification.item_id] || notification.item;
			item.shares = item.shares || {};

			notification.item = undefined;
			if (typeof notification.time_shared == "string") {
				notification.time_shared = new Date(parseInt(notification.time_shared, 10) * 1000);
			}

			// Mark the share as ignored
			notification.status = '2';
			item.shares[notification.share_id] = notification;

			queue.data.itemAction({
				data: {
					action: "share_ignored",
					share_id: notification.share_id,
					itemId: notification.item_id,
					item: item
				}
			});

			hideNotification();

			return false;
		});

		addToListButton.click(function(e) {
			e.preventDefault();

			item = queue.itemsByID[notification.item_id] || notification.item;
			item.shares = item.shares || {};

			notification.item = undefined;
			if (typeof notification.time_shared == "string") {
				notification.time_shared = new Date(parseInt(notification.time_shared, 10) * 1000);
			}

			// Mark the share as added
			notification.status = '1';
			item.shares[notification.share_id] = notification;

			var itemIndex = queue.items.indexOf(item);
			if (itemIndex >= 0) {
				queue.items.splice(itemIndex, 1);
			}

			// Send new item to API so we can update the database
			queue.data.itemAction({
				data: {
					action: "share_added",
					share_id: notification.share_id,
					itemId: notification.item_id,
					item: item
				}
			});

			queue.items.splice(0, 0, item);
			queue.itemsByID[item.item_id] = item;

			queue.rebuildList(undefined, {o: {append: false}});
			hideNotification();

			return false;
		});
	}

	attributionRow.append(avatar).append(name).append(timeSince).append(comment);
	innerView.append(attributionRow);
	if (!omitItem) {
		attributionRow.append(caret);
		itemRow.append(title).append(domain).append(quote);
	 	buttonRow.append(ignoreButton).append(addToListButton);
		innerView.append(itemRow).append(buttonRow);
	}
	else {
		attributionRow.append(quote);
	}
	view.append(innerView);
	return view;
};


/**
 * Helper methods
 */

function listAuthors(authors)
{
	if (!authors)
		return '';

	var authorList = '';

	for(authorId in authors)
		authorList += '<span class="author">'+cleanAuthorName(authors[authorId]['name'])+'</span>, ';

	return authorList.replace(/, $/, '');
}

function listTags(tags, flatArray)
{
	if (!tags)
		return '';

	var tagList = '';

	if (flatArray)
	{
		for(tagId in tags)
		{
			var sanitizedtag = sanitizeText(tags[tagId]);
			tagList += '<a href="'+queue.tagUrlPrefix+encodeURIComponent(sanitizedtag)+'">'+sanitizedtag+'</a>, ';
		}
	}
	else
	{
		for(tagId in tags)
		{
			var sanitizedtag = sanitizeText(tags[tagId]['tag']);
			tagList += '<a href="'+queue.tagUrlPrefix+encodeURIComponent(sanitizedtag)+'">'+sanitizedtag+'</a>, ';
		}
	}

	return tagList.replace(/, $/, '');
}

function cleanAuthorName(name)
{
	// if it's all caps or all lower case, revert to Title Case
	if (name.match(/^[A-Z\s\'\-]{1,}/) || name.match(/^[a-z\s\'\-]{1,}$/))
		name = ucwords(name.toLowerCase());

	return name;
}

function ucwords (str) {
    // Uppercase the first character of every word in a string
    //
    // version: 1107.2516
    // discuss at: http://phpjs.org/functions/ucwords    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Waldo Malqui Silva
    // +   bugfixed by: Onno Marsman
    // +   improved by: Robin
    // +      input by: James (http://www.james-bell.co.uk/)    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: ucwords('kevin van  zonneveld');
    // *     returns 1: 'Kevin Van  Zonneveld'
    // *     example 2: ucwords('HELLO WORLD');
    // *     returns 2: 'HELLO WORLD'
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}

function faviconForUrl(domain)
{
	return getImageCacheUrl('http://'+domain+'/favicon.ico', false, 'fi');
}

function imageWouldFitIn(i, w, h)
{
	return i.width >= w && (w * i.height / i.width >= h);
}

function tagsFromText(text)
{
	var tags = text.trim().split(',');
	var newTags = [];
	var tracking = {};
	var tag;
	for(var i in tags)
	{
		tag = tags[i].trim().toLowerCase();
		if (tag.length && !tracking[tag])
		{
			newTags.push(tag);
			tracking[tag] = tag;
		}
	}
	return newTags;
}

function getSize(o)
{
	return {width:o.width(), height:o.height()};
}

function snapToLineAndMaxHeight(element, lineHeight, maxHeight)
{
	var minLines = Math.floor( maxHeight / lineHeight );
	element.css('height', (minLines * lineHeight) + 'px');
}

function sortBySortId(a, b)
{
	return a.sort_id < b.sort_id ? -1 : (a.sort_id > b.sort_id ? 1 : 0);
}

function sortByTimeAddedNewest(a, b)
{
	return parseInt(b.time_added) - parseInt(a.time_added);
}

function sortByTimeAddedOldest(a, b)
{
	return parseInt(a.time_added) - parseInt(b.time_added);
}

function sortByTitle(a, b)
{
	return a.resolved_title.localCompare(b.resolved_title);
}

function sortBySite(a, b)
{
	return a.resolved_url.localCompare(b.resolved_url);
}


/**
 * Image Scale
 */
imgScale = 1;
try
{
	imgScale = window.devicePixelRatio ? window.devicePixelRatio : 1;
}
catch(e) {}


/**
 * Init Queue
 */
var queue = new Queue();
boot.pages.queue = queue;



/* global   boot, loggedInUser, setSetting, getSetting, getSettingPromise, removeSetting, logger,
            PackagedAppData, assetCache, CACHE_ITEMS, DEBUG, MAX_ITEMS_TO_CACHE, PKTConsumerKey,
            logger, PKTBaseURL
*/


/**
 * General sync controller that handles all syncing related tasks
 */

function Sync() {
    // States
    this.syncing  = false;
    this.caching  = false;
    this.fetching = false;
    this.sending  = false;
    this.getting  = false;
    this.waitingForGet = false;

    // First fetch
    this.firstFetchFinished = false;

    // Requests
    this.sendRequest = undefined;
    this.getRequest  = undefined;

    // Database connection
    this.dbServer = boot.helper.db.server;
}

Sync.prototype = {
    // Start sync process
    sync: function () {
        // Check if the fetch started or if we need to fetch
        this.fetch(function(needsFetching) {

            // We need to fetch so we don't have to go further here
            if (needsFetching) {
                return;
            }

            // If we are in the syncing or fetching process we don't want to
            // start a new cycle
            if (this.syncing || this.fetching) {
                return;
            }

            // If we are not online we don't want to sync
            if (!window.navigator.onLine) {
                return;
            }

            // Set state
            this.syncing = true;
            this.waitingForGet = true;

            // Start sync cycle with sending all data to the server
            this.sendChanges();

        }.bind(this));
    },

    // Cancel all syncing related stuff
    cancelSync: function () {
        // Abort all running request
        if (typeof this.sendRequest !== 'undefined') {
            this.sendRequest.abort();

        }
        if (typeof this.getRequest !== 'undefined') {
            this.getRequest.abort();
        }

        // Reset requests
        this.sendRequest = undefined;
        this.getRequest = undefined;

        // Reset state
        this.caching  = false;
        this.syncing  = false;
        this.fetching = false;
        this.sending  = false;
        this.getting  = false;
        this.waitingForGet = false;
    },

    // Fetching
    /*
        Methods to bring the whole user's list onto the device post signup. In
        the first fetch call we also sync the account, tag and autocomplete email
        information
        1. /fetch
            - Just make a normal fetch request with account, tag and autocomplete
              email parameter to get this data within the first response
            - Furthermore the first response should give us the total and the starttime
              to send back for the next request
        2. /fetch?offset=x&count=x&starttime=
            - Within the first response we get a pasthrough object. Within that
              passthough object, we get the offset and count for each next
              fetch request.
            - We set the 'since' value from the first response as 'starttime'
              for each next fetch request
            - Create requests for all of chunks between the first and to get the end
        3. After all fetching requests are successfull, do a normal sync to get
           anything that could have changed during the fetch process
    */

    // Start fetching Data
    // The needsFetchingCallback should be called with a boolean value
    // and determine if the fetch was started or not
    fetch: function(needsFetchingCallback) {
        var self = this;

        // Check if user is logged in and don't start fetching if the user is
        // not logged in
        if (!loggedInUser.isLoggedIn()) {
            needsFetchingCallback(false);
            return;
        }

        // We are in a fetch process, don't start another one
        if (this.fetching) {
            needsFetchingCallback(false);
            return;
        }

        // Check if the fetch was already done
        getSetting('hasFetched', function(fetchedSetting) {
            // If the fetch was already done we don't need to fetch again
            if (fetchedSetting.hasFetched) {
                needsFetchingCallback(false);
                return;
            }

            // Check if we already got the first fetch
            getSetting('chunkReceived_0', function(fetchedSetting) {
                var chunkReceived_0 = fetchedSetting.chunkReceived_0;

                // Register that the first fetch was already done
                if (typeof chunkReceived_0 !== 'undefined' && chunkReceived_0) {
                    self.firstFetchFinished = true;
                }

                // We start to fetch, show this also to the user
                boot.showNotification("Retrieving List...");

                // Are we starting from scratch of do we need to pick up where we left off?
                if (!self.fetching && chunkReceived_0) {
                    // Pick up where we left
                    self.continueFetching();
                }
                else {
                    // Start from fresh
                    self.startFetching();
                }

                // Inform that we started the fetch process
                needsFetchingCallback(true);
            });
        });
    },

    startFetching: function () {
        // Start the fetching process by getting the first bunch of items
        // together with the passthrough object we use to calculate all
        // fetches in the future
        logger.log("Sync: Start fetching");

        // Prepare for fetching
        this.fetching = true;
        $(document).trigger("startFetching");

        // Fetch first chunk of ther users list, get also further information
        // that we want to sync the first time: account, tagslist, emails
        this.apiRequest("fetch", {
            image: 1,
            shares: 1,
            account: 1,
            forceaccount: 1,
            taglist: 1,
            forcetaglist: 1,
            emails: 1,
            forceemails: 1
        })
        .done(this.firstFetched.bind(this))
        .fail(this.fetchingFailed.bind(this));
    },

    firstFetched: function(data) {
        // In the first process we get the passthrough object and with that
        // we have to calculate the following things we need for further syncing
        // - The first chunk of the user's list we have to process
        // - The remaining chunks we need to sync
        // - The chunk size per fetch
        // - The total chunks we need to fetch

        if (typeof data !== 'undefined' && data.status >= 1) {
            // Get necessary information / chunks for further fetches
            var passthrough = data.passthrough;

            // Calculate chunks for further syncs
            var firstChunkSize = parseInt(passthrough.firstChunkSize, 10);
            var fetchTotalRemaining = parseInt(data.total, 10) - parseInt(passthrough.firstChunkSize, 10);
            var fetchChunkSize = parseInt(passthrough.fetchChunkSize, 10);
            var divTotalRemainingAndChunkSize = (fetchTotalRemaining  / fetchChunkSize);
            var fetchTotalChunks = (fetchTotalRemaining > 0) ? Math.ceil(divTotalRemainingAndChunkSize) : 0;

            // Save information in settings
            setSetting("firstChunkSize", firstChunkSize);
            setSetting("fetchChunkSize", fetchChunkSize);
            setSetting("fetchTotal", fetchTotalRemaining);
            setSetting("fetchTotalChunks", fetchTotalChunks);

            // Save since for later usage
            var since = data.since;
            setSetting("fetchStartTime", parseInt(since, 10));
            setSetting("syncedSince", since);

            // Process the first fetch chunk
            this.processFetch(data);

            // Fetch the next chunks
            this.continueFetching();

            // Has fetched at least something
            setSetting("needsToStartFetching", false);

            return;
        }

        // Something went wrong, cancel complete fetch process
        this.fetchingFailed();
    },

    continueFetching: function() {
        // Fetch the all next chunk sizes we calculate from the first fetch
        // passthrough object
        logger.log("Sync: Continue fetching");

        // Set state if we not already in the fetch process
        if (!this.fetching) {
            this.fetching = true;
            boot.showNotification("Retrieving List...");
            $(document).trigger("startFetching");
        }

        var self = this;

        // Get saved settings we need for figure out what the next steps
        // for the fetch process are
        var settingDeferreds = [];
        var firstChunkSize, fetchTotal, fetchChunkSize, fetchTotalChunks, fetchStartTime;

        var firstChunkSizePromise = getSettingPromise('firstChunkSize').done(function(value) {
            firstChunkSize = value;
        });
        var fetchTotalPromise = getSettingPromise('fetchTotal').done(function(value) {
            fetchTotal = value;
        });
        var fetchChunkSizePromise = getSettingPromise('fetchChunkSize').done(function(value) {
            fetchChunkSize = value;
        });
        var fetchTotalChunksPromise = getSettingPromise('fetchTotalChunks').done(function(value) {
            fetchTotalChunks = value;
        });
        var fetchStartTimePromise = getSettingPromise('fetchStartTime').done(function(value) {
            fetchStartTime = value;
        });

        var fetchSettingPromises = [firstChunkSizePromise, fetchTotalPromise, fetchChunkSizePromise,
                                    fetchTotalChunksPromise, fetchStartTimePromise];

        // Wait until all promises are done and all settings are fetched
        $.when.apply(null, fetchSettingPromises).done(function() {

            logger.log('Sync: contineFetching chunk calc: ' + fetchTotal + ' ' + fetchChunkSize + ' ' + fetchTotalChunks);

            // Starts fetching the chunks as promises. We need to do this
            // to be able to execute code, after all chunks are in the pipeline
            // to fetch
            var fetchChunksDone = 0;
            var startFetchingChunkPromise = function(chunk) {
                var deferred = $.Deferred();

                // Check if we already received the chunk
                var chunkReceivedSettingsKey = 'chunkReceived_' + chunk;
                getSetting(chunkReceivedSettingsKey, function(fetchedSetting) {
                    var chunkReceived = fetchedSetting[chunkReceivedSettingsKey];

                    // Check if we already processed that chunk
                    if (typeof chunkReceived === 'undefined' || !chunkReceived) {
                        // We haven't received the chunk yet so start get it
                        logger.log("Sync: Start requesting chunk " + chunk);

                        self.apiRequest("fetch", {
                            updatedBefore: fetchStartTime,
                            offset: firstChunkSize + fetchChunkSize * (chunk-1),
                            count: fetchChunkSize,
                            chunk: chunk,
                            image: 1,
                            shares: 1
                        })
                        .done(self.processFetch.bind(self))
                        .fail(self.fetchingFailed.bind(self))
                    }
                    else {
                        // We fetched and process the chunk already, we don't
                        // have to start fetch it again
                        fetchChunksDone += 1;
                    }

                    deferred.resolve();
                });

                return deferred.promise();
            };

            // Queue up all the fetch requests promises.
            // Start from 1 as we already fetched chunk 0
            var fetchingPromises = [];
            for (var i = 1; i <= fetchTotalChunks; i++) {
                var fetchingPromise = startFetchingChunkPromise(i);
                fetchingPromises.push(fetchingPromise);
            }

            // Wait until all fetch chunk promises are started to load and check
            // if we are already done or update the fetch chunks done setting
            $.when.apply(null, fetchingPromises).done(function() {
                if (self.firstFetchFinished && fetchTotalChunks > 0
                    && fetchChunksDone === fetchTotalChunks)
                {
                    self.fetchingCompleted();
                    return;
                }

                setSetting('fetchChunksDone', fetchChunksDone);
                boot.showNotification("Retrieving List...");
            });
        });
    },

    // Generall method to process all fetches and add all items to the database
    processFetch: function(data) {
        // Check if we still fetching
        if (!this.fetching) {
            // Fetching must have cancelled
            return;
        }

        logger.log("Sync: Process fetch: ");
        logger.log(data);

        // Import data into the database
        var self = this;

        // What chunk we process here
        var chunk = data.passthrough.chunk;

        // Stuff items in database
        var processFetchedItems = function() {
            var itemList = data.list;

            // No list available chunked finished
            if (typeof itemList === 'undefined') {
                self.fetchProcessed(chunk);
                return;
            }

            // Check if we have any items left
            var numberOfItems = Object.keys(itemList).length;
            if (numberOfItems === 0) {
                self.fetchProcessed(chunk);
                return;
            }

            // Go through the list and add properties to the items, we need
            // before adding it to the database as well as remove properties
            // that are not necessary.
            // Aftet that save the item as it is in the database
            var newItemObjects = $.map(itemList, function(newItem, idx) {
                newItem.time_added_to_device = (Math.round(new Date().getTime() / 1000)).toString();
                newItem.is_offline = false;
                delete newItem.sort_id; // We don't need the sort_id
                return newItem;
            });

            // Insert all new items to the database
            self.dbServer.items.update.apply(undefined, newItemObjects).done(function() {
                self.fetchProcessed(chunk);
            });
        };

        // First process metadata of the fetched data and then process the items
        this.processMetaData(data, function() {
            processFetchedItems();
        });
    },

    fetchProcessed: function(chunk) {
        var self = this;    

        logger.log("Sync: Fetch processed, chunk " + chunk);

        // Set a firstFetchFinished to true to prevent the call of fetchingCompleted
        // within the continueFetching funcion
        if (chunk === 0) {
            self.firstFetchFinished = true;
        }

        // Set the chunk size as processed
        setSetting('chunkReceived_' + chunk, true);

        // Get the number of chunks we finished fetching
        getSetting('fetchChunksDone', function(fetchedSetting) {
            var fetchChunksDone = fetchedSetting.fetchChunksDone || 0;

            // Update the number of fetches we already did
            if (typeof chunk !== 'undefined' && chunk !== 0) {
                fetchChunksDone += 1;
                setSetting('fetchChunksDone', fetchChunksDone);
            }

            // Increase the processed chunks size
            getSetting('fetchTotalChunks', function(fetchedSetting) {
                var fetchTotalChunks = fetchedSetting.fetchTotalChunks;

                // Check if we are done and finish the fetch process if it's the case
                if (fetchTotalChunks === 0 || fetchChunksDone >= fetchTotalChunks) {
                    self.fetchingCompleted();
                    return;
                }

                boot.showNotification("Retrieving List...");
            });
        });
    },

    fetchingCompleted: function() {
        logger.log("Sync: Fetching completed");

        // Hide loading view
        boot.updateNotification('Downloading complete',1);
        boot.hideNotification();

        // Set finished finished fetching flag
        setSetting('hasFetched', true);

        // Cleanup fetch settings
        getSetting('fetchTotalChunks', function(fetchedSetting) {
            var fetchTotalChunks = fetchedSetting.fetchTotalChunks;
            for (var i = 0; i <= fetchTotalChunks; i++) {
                var chunkReceivedSettingsKey = 'chunkReceived_' + i;
                removeSetting(chunkReceivedSettingsKey);
            }
        });
        removeSetting('firstChunkSize');
        removeSetting('fetchChunkSize');
        removeSetting('fetchTotal');
        removeSetting('fetchTotalChunks');
        removeSetting('fetchChunksDone');
        removeSetting('fetchStartTime');

        // Update state, no fetching anymore
        this.fetching = false;

        // Push event that fetching finished
        $(document).trigger("finishFetching");

        // Start a normal sync cycle
        this.sync();
    },

    fetchingFailed: function(error) {
        if (typeof error !== 'undefined') {
            logger.log("Sync: Fetching failed:");
            logger.log(error);
        }

        // Update state, no fetching anymore
        this.fetching = false;

        // Show error notification and hide view
        boot.showErrorNotification("Could Not Load List. There was a problem fetching your list from the server. Please make sure you are connected to the Internet.");

        // Push event that the fetching process finished
        $(document).trigger("finishFetching");
    },


    // Send changes
    // All changes we have to send to the api are availabe within the actionsQueue
    // table in the database. We get all actions out of it and send it to the API
    // The API gives us a response for each action we send to it. We have to
    // figure out what we have to do with the response and act on that response

    sendChanges: function () {
        var self = this;

        if (this.getting) {
            // If the app is in the middle of a get, we need to cancel it and
            // restart sync (send, get).
            // Otherwise it creates a race condition where changes from the
            // get may override changes from the send see:
            // https://ideashower.lighthouseapp.com/projects/83078-the-force/tickets/852-sync-race-condition-during-get#ticket-852-2
            this.cancelSync();
            this.sync();
            return;
        }

        // If we are in the middle of sending or fetching don't do anything
        if (this.sending || this.fetching) {
            return;
        }

        // Not online or user is not logged in don't start the sending of changes
        if (!window.navigator.onLine || !loggedInUser.isLoggedIn()) {
            this.sendNothing();
            return;
        }

        // Prepare for sending
        this.sending = true;
        $(document).trigger("startSendingChanges");

        // Get all actions from the database and send it to the API
        this.dbServer.actionsQueue.query().all().execute().done(function(actions) {
            // No actions to process we are finished with sending
            if (actions.length === 0) {
                self.sendChangesFinished();
                return;
            }

            // Create actions array we want to send
            var actionsArray = $.map(actions, function(action, key) {
                return action.action;
            });

            logger.log("Sync: Send changes: ", JSON.stringify(actionsArray));

            // Send action array to the API
            self.sendRequest = self.apiRequest("send", {
                actions: JSON.stringify(actionsArray)
            })
            .done(function(data) {
                self.sendChangesCallback(data, actions);
            })
            .fail(self.sendChangesError.bind(self));
        });
    },

    // Just don't start any send process and set back the state of the
    // syncing component
    sendNothing: function() {
        this.sendChangesFinished();
    },

    // After sending actions to the API we get information about this actions back
    // We have to separately process each action
    sendChangesCallback: function(data, actions) {
        logger.log("Sync: Send changes callback:");
        logger.log(data);

        // Actions and action results we want to process
        actions = actions || [];

        var self          = this,
            actionResults = data.action_results,
            promises      = [];

        // Get through all actions and process it with the help of the action results
        $.each(actions, function(idx, localActionObject) {
            var actionResult = actionResults[idx],
                action       = localActionObject.action,
                deferred;

            // If the actionResulst is false or nil skip it
            if (!actionResult && self.shouldContinueOnFailedSendAction(action, actionResult)) {
                return true; // continue
            }

            // Check if we need to update added or readded items
            if (action.action === "add" || action.action === "readd") {
                // Check if we have it with an object to do
                if (actionResult !== null && typeof actionResult === 'object') {
                    // If it's an item we expect an array with the item data
                    // we use this item data to update the item within the database
                    // as there is missing a lot of information for the newly added item
                    deferred = $.Deferred();
                    self.resolveItemIdAndUpdateExtendedDataForItem(action, actionResult, function(deferred) {
                        deferred.resolve();
                    }.bind(this, deferred));
                    promises.push(deferred.promise());
                }
                else {
                    // otherwise if it is a false or null, the item was invalid so we should skip it
                    if (self.shouldContinueOnFailedSendAction(action, actionResult)) {
                        return true;
                    }
                }
            }

            // Look for shared_to actions
            if (action.action === "shared_to") {
                if ((actionResult === null || typeof actionResult !== 'object') &&
                    self.shouldContinueOnFailedSendAction(action, actionResult))
                {
                    return true; // continue
                }
                else if (actionResult !== null && typeof actionResult === 'object') {
                    // Check if we need to update the friends data in the db
                    var friends = actionResult.to_friends;
                    $.each(friends, function (idx, friend) {
                        deferred = $.Deferred();

                        var resolvedFunction = function(deferred) {
                            deferred.resolve();
                        }.bind(this, deferred);

                        // Get each friend from the database and update it
                        if (typeof friend.local_friend_id !== 'undefined' && friend.local_friend_id !== null) {
                            self.dbServer.friends.get(friend.local_friend_id).done(function(fetchedFriend) {
                                self.updateFriendIfChanged(fetchedFriend, friend, resolvedFunction);
                            });

                            promises.push(deferred.promise());
                        }
                        else if (typeof friend.friend_id !== 'undefined' && friend.friend_id !== null) {
                            // We don't have a local friend of that try to add or update it
                            self.dbServer.friends.query('friendsIdIndex').only(friend.friend_id)
                                                 .execute().done(function(fetchedFriends) {
                                self.updateFriendIfChanged(fetchedFriends[0], friend, resolvedFunction);
                            });

                            promises.push(deferred.promise());
                        }
                    });
                }
            }

            // Look for basic true / false response.
            if (typeof actionResult === 'boolean' && !actionResult &&
                self.shouldContinueOnFailedSendAction(action, actionResult))
            {
                return true; // continue
            }

            // Remove the action from the action queue
            var removeActionPromise = self.dbServer.actionsQueue.remove(localActionObject.local_action_id);
            promises.push(removeActionPromise);
        });

        // All actions need to be processed and finished and then we can go on
        $.when.apply(null, promises).done(function() {
            // Each action response was handled so go on
            this.sendChangesFinished();
        }.bind(this));

    },

    updateFriendIfChanged: function(existingFriend, newFriend, callback) {
        var self = this;

        if (typeof existingFriend === 'undefined' ||
            existingFriend.name !== newFriend.name ||
            existingFriend.username !== newFriend.username ||
            existingFriend.avatarSrc !== newFriend.avatarSrc ||
            existingFriend.friendId !== newFriend.friendId)
        {
            // First get friend in db via the friend_id
            this.dbServer.friends.query('friendsIdIndex').only(newFriend.friend_id)
                                 .execute().done(function(fetchedFriends) {

                var existingFriendWithFriendId = fetchedFriends[0];

                // Special resolving scenario
                // Make sure we do not already have another friend (with a different localId) as the friendId we are trying to update
                if (typeof existingFriendWithFriendId !== 'undefined' &&
                    typeof newFriend.local_friend_id !== 'undefined' &&
                    existingFriendWithFriendId.local_friend_id !== newFriend.local_friend_id)
                {
                    // Delete the new entry local friend id from the database
                    self.dbServer.friends.remove(newFriend.local_friend_id).done(function() {
                        // Update the newer entry with the latest information
                        newFriend.local_friend_id = existingFriendWithFriendId.local_friend_id;
                        self.dbServer.friends.update(newFriend).done(callback.bind(self));
                    });
                }
                else {
                    // Normal add or update of friend in the database
                    
                    // Delete the local_friend_id from the new friend object
                    // else the database will not add the friend to the database
                    // as the local_friend_id is null
                    delete newFriend["local_friend_id"]; 

                    // If we have an existing friend copy over the friend_id and
                    // local_friend_id. If we don't have a friend just add
                    // the new friend to the db
                    if (typeof existingFriend !== 'undefined') {
                        newFriend.friend_id = existingFriend.friend_id ? existingFriend.friend_id : newFriend.friend_id;
                        newFriend.local_friend_id = existingFriend.local_friend_id;
                    }

                    self.dbServer.friends.update(newFriend).done(callback.bind(self));
                }
            });

            return;
        }

        // Friend is already up to date and in the database just call the callback
        if (callback) { callback() }
    },

    shouldContinueOnFailedSendAction: function(action, actionResult) {
        // This method is only for debug purposes and should basically never
        // be reached as it would be a syncing error
        if (DEBUG) {

            logger.log("POCKET : SYNC ERROR");

            logger.log("An action that was sent to the server returned false. This means it was improperly formatted or there is a problem with the API. Either way, the issue should be resolved because this will cause a loss of data/sync in production.");
            logger.log("action: " + action);
            logger.log("result: " + actionResult);

            return true;
        }

        return false;
    },

    resolveItemIdAndUpdateExtendedDataForItem: function(action, actionResult, callback) {
        // Resolve Item Id
        var itemId = actionResult.item_id;
        var localItemId = action.local_item_id;
        if (typeof localItemId === 'undefined' || typeof itemId === 'undefined') {
            if (callback) { callback(); }
            return;
        }

        // Uset the extended data to update the local item with new information
        var extendedData = actionResult;

        // Start updating the data
        this.updateExtendedDataForItem(action.action, extendedData, itemId, localItemId, callback);
    },

    updateExtendedDataForItem: function(action, extendedData, itemId, localItemId, callback) {
        // If we don't have a local item id we don't want to update
        if (typeof localItemId === 'undefined') {
            return;
        }

        // Get item from database
        this.dbServer.items.get(localItemId).done(function(fetchedItem) {

            // It can happen that we cache items that are not in the database anymore
            // if the item was cached and we try to update the extended data of that
            // item it's alreay gone in the database. To prevent any errors
            // we check if we got an item and return if not
            if (typeof fetchedItem === 'undefined') {
                return;
            }

            // Resolve Item_id
            if (typeof itemId !== 'undefined') {
                fetchedItem.item_id = itemId;    
            }
            

            // Update offline status if necessary
            var isOffline = extendedData.is_offline;
            if (typeof isOffline !== 'undefined') {
                fetchedItem.is_offline = isOffline;
            }

            // Update resolved_id, excerpt, has_image, has_video, is_article, word_count
            fetchedItem.resolved_id = extendedData.resolved_id;
            var excerpt = extendedData.excerpt;
            if (typeof excerpt !== 'undefined') {
                fetchedItem.excerpt = excerpt;
            }
            
            var hasImage = extendedData.has_image;
            if (typeof hasImage !== 'undefined') {
                fetchedItem.has_image = "" + hasImage
            }
            
            var hasVideo = extendedData.has_video;
            if (typeof hasVideo !== 'undefined') {
                fetchedItem.has_video = "" + hasVideo;
            }
            
            var isArticle = extendedData.is_article || extendedData.isArticle;
            if (typeof isArticle !== 'undefined') {
                fetchedItem.is_article = "" + isArticle;
            }

            var wordCount = extendedData.word_count;
            if (typeof wordCount !== 'undefined') {
                fetchedItem.word_count = "" + wordCount;
            }
            

            // Replace title and url if they are supplied
            var title = extendedData.title;
            if (typeof title !== 'undefined') {
                fetchedItem.resolved_title = title;
            }

            // Add the url to the item
            var url = extendedData.resolved_url || extendedData.resolvedUrl;
            if (typeof url !== 'undefined') {
                fetchedItem.resolved_url = url;
                fetchedItem.domain = domainForURL(url);
            }

            // Add an image if the extendedData have images
            var images = extendedData.images;
            if (typeof images !== 'undefined' && images !== "") {
                fetchedItem.images = images;
                var image = images['1'];
                fetchedItem.image = image;
            }

            // Update videos and images
            var videos = extendedData.videos;
            if (typeof videos !== 'undefined' && videos !== "") {
                fetchedItem.videos = videos;
            }
            

            // Save the item in the db
            this.dbServer.items.update(fetchedItem).done(function() {
                // Notify the queue of the new item data
                var itemUpdateObject = {
                    action: action,
                    item: fetchedItem,
                    updateDom: true
                };
                $(document).trigger('itemNeedsExtendedUpdate', itemUpdateObject);

                // Notify the callback listener
                if (callback) { callback(fetchedItem); }
            });
        }.bind(this));
    },

    sendChangesError: function(error) {
        logger.log("Send Changes Error:");
        logger.error(error);

        this.syncing = false;
        this.sending = false;

        // Let the listener know that we finished sending changes
        $(document).trigger("stopSendingChanges");
    },

    sendChangesFinished: function() {
        // Reset state
        this.syncing = false;
        this.sending = false;
        this.sendRequest = undefined;

        // Let the listener know that we finished sending changes
        $(document).trigger("stopSendingChanges");

        // If we call the sendChanges function within a sync cycle we start to
        // get the list as waitingForGet is true. If the sendChanges function
        // was called directly, to flush the action queue, we don't get the list and
        // only start cache items in case we have to download new item data.
        if (this.waitingForGet) {
            this.getList();
            return;
        }

        this.startCachingAssets();
    },


    // Get list cycle

    // Get list and process new, remove old and update local items
    getList: function() {
        logger.log("Start getting list");

        // Check if we can start the get list request
        if (!window.navigator.onLine || !loggedInUser.isLoggedIn() || this.getting) {
            return;
        }

        // Update state
        this.syncing = true;
        this.getting = true;
        this.waitingForGet = false;

        // Get since value from settings
        getSetting('syncedSince', function(fetchedData) {
            var since = fetchedData.syncedSince;

            // Get data from the server
            this.getRequest = this.apiRequest("get", {
                tags        : 1,
                taglist     : 1,
                meta        : 1,
                image       : 1,
                images      : 1,
                videos      : 1,
                shares      : 1,
                positions   : 1,
                account     : 1,
                since       : since,
                appsInfo    : 'summary'
            })
            .done(this.getListCallback.bind(this))
            .fail(this.getListError.bind(this));
        }.bind(this));
    },

    getListCallback: function(data) {
        logger.log("Sync: Get list callback: ");
        logger.log(data);

        var self = this;

        var listObject = data.list,
            updatedObjects = [],
            listNeedsRefreshInfo = {};

        listNeedsRefreshInfo.allObjects = [];

        // Success callback if all is finished
        var getCompleted = function(result) {
            // Save since value to settings
            setSetting("syncedSince", data.since);

            // Reset state
            self.syncing = false;
            self.getting = false;
            self.getRequest = undefined;

            // Let the frontend know that we should refresh the items list
            if (listNeedsRefreshInfo.allObjects.length > 0) {
                $(document).trigger('listNeedsRefresh', listNeedsRefreshInfo);
            }

            // Start caching process
            self.startCachingAssets();

            // Resave user apps
            if (typeof PocketUserApps == 'object') {
                PocketUserApps.appTypes = data.app_types;
                PocketUserApps.ready = true;
            }
        };

        // Update items in the database and let the queue know what happened
        var updateItems = function() {

            // Check if we got some items to update
            var numberOfItems = Object.keys(listObject).length;
            if (numberOfItems <= 0) {
                // Nothing to update get list is finished
                getCompleted();
                return;
            }

            // Get all local items so we can check if the item is locally available
            // and copy over important properties in case we have to update the item
            self.dbServer.items.query("timeAddedIndex").all().desc()
                               .execute().done(function(localItems) {

                // After each item we check if we are done
                var itemsProcessed = 0;
                var itemWasProcessed = function() {
                    itemsProcessed += 1;
                    if (numberOfItems === itemsProcessed) {
                        getCompleted();
                    }
                };

                // Send an itemNeedsUpdate event with extended information about
                // the action
                var finishUpdatingItem = function(item, updatedObject) {
                    // Inform the queue to update the item representation
                    if (updatedObject.action) {
                        updatedObject.item = item;
                        updatedObject.updateDom = true;
                        listNeedsRefreshInfo.allObjects.push(updatedObject);

                        var action = updatedObject.action;
                        listNeedsRefreshInfo[action] = listNeedsRefreshInfo[action] || [];
                        listNeedsRefreshInfo[action] = updatedObject;
                    }
                    itemWasProcessed();
                };

                // Create dictionary to search if the item is already locally
                // available it's also good if the item is locally available to
                // copy the local_item_id to the new item
                var localItemObjectsByID = {};
                $.each(localItems, function(idx, localItem) {
                    localItemObjectsByID[localItem.item_id] = localItem;
                });

                // Process each item from the list and decide what action we
                // have to do
                $.each(listObject, function(idx, item) {

                    // Get necessary information
                    var localItem = localItemObjectsByID[item.item_id];
                    var itemIsLocal = (typeof localItem !== 'undefined');
                    var itemStatus = parseInt(item.status, 10);
                    var itemHasPendingShare = parseInt(item.has_pending_share, 10);

                    // Check what to do with the item
                    var updateObject = {};

                    // Item was archived(1) or deleted(2) but does not have pending shares.
                    // If the item has pending shares we want to hold it in the database
                    // as we have it in the inbox
                    if ((itemStatus === 1 || itemStatus === 2) && itemHasPendingShare !== 1) {
                        // If item is not local and don't have any pending shares we
                        // don't have to do anything in with it
                        if (!itemIsLocal) {
                            itemWasProcessed();
                            return true; // like continue
                        }

                        updateObject.action = (itemStatus === 1) ? "mark" : "delete";
                        updateObject.on = true;
                        self.dbServer.items.remove(localItem.local_item_id).done(function () {
                            assetCache.removeAssetsForItem(localItem);
                            finishUpdatingItem(item, updateObject);
                        });

                        return true;
                    }

                    // Add new item or update old item in the database
                    if (!itemIsLocal) {
                        // Item is not locally available add as new item
                        updateObject.action = "add";

                        // Add / remove needed properties
                        item.time_added_to_device = (Math.round(new Date().getTime() / 1000)).toString();
                        item.is_offline = '0';
                        delete item.sort_id;
                    }
                    else {
                        // The item is already local so just copy some
                        // properties to the new object and inform the queue
                        // of the changes to update the local item within
                        // the queue and update the row for that item
                        updateObject.action = "update";

                        // Copy over the local_item_id so the db knows what
                        // item needs an update
                        item.local_item_id = localItem.local_item_id;
                        item.time_added_to_device = localItem.time_added_to_device;
                        item.is_offline = localItem.is_offline;
                        delete item.sort_id;
                    }

                    // Add or update item in the database so we are up to date
                    // The update method will add or update the item in the
                    // database based, if the item is already in the db.
                    // If the item is not in the database the item will also
                    // get a local_item_id assigned
                    self.dbServer.items.update(item).done(function () {

                        // If the item was already local we can send the item
                        // to the updated event without getting the updated item
                        // again from the database as we copied over the
                        // local_item_id and so the id is already up to date
                        if (itemIsLocal) {
                            finishUpdatingItem(item, updateObject);
                            return true;
                        }

                        // If the item was not locally we have to get the new information
                        // from the database to have the local_item_id in the item object
                        self.dbServer.items.query('itemIdIndex').only(item.item_id)
                                           .execute().done(function(updatedItems) {
                            finishUpdatingItem(updatedItems[0], updateObject);
                        });
                    });
                });
            })
            .fail(function(error) {
                getCompleted();
            });
        };

        // First process metadata and then update items
        this.processMetaData(data, function () {
            updateItems();
        });
    },

    getListError: function(e) {
        logger.log("Sync: Get list error");
        logger.error(e);

        // Reset state
        this.syncing = false;
        this.getting = false;
        this.getRequest = undefined;
    },



    /**
     * Process meta data before we actually process the items list
     * This means processing friends, autocomplete emails, unconfirmed shares,
     * account information and tags
     * The flow of the method calls are from the bottom to top
     */

    processMetaData: function (data, callback) {
        var self = this;

        var processMetaDataFinished = function () {
            callback();
        };

        var processTags = function () {
            // Process tags
            var tags = data.tags;

            if (typeof tags === 'undefined' || !tags) {
                processMetaDataFinished();
                return;
            }

            // Remove all tags from the database and add new one. We always
            // get the full tags list if any tag changes so we are good to go
            // with that way
            self.dbServer.tags.clear().done(function() {
                // Check if we did get any tags from the server
                if (tags.length === 0) {
                    processMetaDataFinished();
                    return;
                }

                // Add all tags to the database
                var tagObjects = $.map(tags, function(tag, idx) {
                    return {local_tag_id: idx, tag:tag};
                });
                self.dbServer.tags.update.apply(undefined, tagObjects).done(function(insertedTags) {
                    processMetaDataFinished();
                });
            });
        };

        var processAccount = function () {
            // Get all account data from the API response and update the
            // information in the local storage as well as for the currently
            // logged in user
            var account = data.account;

            if (typeof account === 'undefined' || !account) {
                processTags();
                return;
            }

            // First just save the account information to the local storage
            setSetting("account", JSON.stringify(account));

            // Update the current loggedInUser
            loggedInUser.setUsername(account.username);
            loggedInUser.setFirstName(account.first_name);
            loggedInUser.setLastName(account.last_name);
            loggedInUser.setEmailAddress(account.email);

            // Save avatar information
            var avatarURL = account.friend.avatar_url;
            if (avatarURL) {
                loggedInUser.setAvatarURL(avatarURL);
            }
            loggedInUser.setHasSetAvatar(account.friend.has_set_avatar);

            processTags();
        };

        var processUnconfirmedShares = function () {
            // Just save the unconfirmed shares in local storage and then go on
            // processing the account information
            var unconfirmedShares = data.unconfirmed_shares || {};
            setSetting("unconfirmedShares", JSON.stringify(unconfirmedShares));

            processAccount();
        };

        var processAutocompleteEmails = function () {
            // Update autocomplete emails in the database
            var autocompleteEmails = data.auto_complete_emails;
            if (typeof autocompleteEmails === 'undefined' || !autocompleteEmails) {
                processUnconfirmedShares();
                return;
            }

            var numberOfEmails = Object.keys(autocompleteEmails).length;
            if (numberOfEmails === 0) {
                processUnconfirmedShares();
                return;
            }

            self.dbServer.ac_emails.update.apply(undefined, autocompleteEmails).done(function(insertedEmails) {
                processUnconfirmedShares();
            });
        };

        var processFriends = function () {
            // Process friends and update all friends in the database if friends
            // are in the response
            var friends = data.friends;
            if (typeof friends === 'undefined' || !friends) {
                processAutocompleteEmails();
                return;
            }

            var numberOfFriends = Object.keys(friends).length;
            if (numberOfFriends === 0) {
                processAutocompleteEmails();
                return;
            }

            self.dbServer.friends.query("friendsIdIndex").all().execute().done(function(localFriends) {
                var friendsIDToFriend = {};
                $.each(localFriends, function(idx, localFriend) {
                    friendsIDToFriend[localFriend.friend_id] = localFriend;
                });

                var friendObjects = $.map(friends, function (friend, idx) {
                    // Check if we have the friend already in the database
                    var localFriend = friendsIDToFriend[friend.friend_id];
                    if (typeof localFriend !== 'undefined' && localFriend) {
                        // If we have it copy of the local_friend_id so we
                        // don't add the friend twice
                        friend.local_friend_id = localFriend.local_friend_id;
                    }
                    return friend;
                });

                self.dbServer.friends.update.apply(undefined, friendObjects).done(function(insertedFriends) {
                    processAutocompleteEmails();
                });
            });
        };

        // Start with processing friends
        processFriends();
    },


    /**
     * Star the caching process of items
     */
    startCachingAssets: function () {
        // While developping it can give cases we don't want to start the
        // cache process in all the sync cycles so set CACHE_ITEMS to true will
        // prevent that
        if (!CACHE_ITEMS) {
            return;
        }

        // Not online or user is not logged in don't start caching assets
        if (!window.navigator.onLine || !loggedInUser.isLoggedIn()) {
            return;
        }

        // If we already in the process to cache items we don't want to start a
        // new caching process
        if (this.caching) {
            return;
        }

        // Start actual caching process
        var self = this;

        // If the user started the sync get the last X items (declared in settings)
        // and checke and start caching them
        var numberOfItemsToSync = MAX_ITEMS_TO_CACHE;

        // Get the items we want to sync
        this.dbServer.items.query("timeAddedIndex").all().desc()
                           .skip(0).take(numberOfItemsToSync)
                           .execute().done(function(items) {

            // We only cache items that are not offline and either are an article or has images
            var itemsToCache = items.filter(function(item) {
                return (item.is_offline === false || item.is_offline === '0');
            });

            // Check if we actually have something to sync
            var actualNumberOfItemsToSync = itemsToCache.length;
            if (actualNumberOfItemsToSync === 0) {
                return;
            }

            // Prepare for caching
            self.caching = true;
            var finishedItems = 0;

            // Update the notification with the actual items that are cached
            // and that are still to cache
            var updateRemainingItemsToCacheNotification = function() {
                var notificationString = "Downloading " + finishedItems + " / " + actualNumberOfItemsToSync;
                boot.showNotification(notificationString, true, (finishedItems/actualNumberOfItemsToSync));
            };

            // Check if we finished caching items and act on it
            var checkIfCachingFinished = function() {
                if (actualNumberOfItemsToSync === finishedItems) {
                    boot.updateNotification('Downloading complete', 1);
                    boot.hideNotification();

                    // Reset state
                    self.caching = false;

                    return;
                }

                updateRemainingItemsToCacheNotification();
            };

            // Bring up the notification
            updateRemainingItemsToCacheNotification();

            // Start caching of items
            $.each(itemsToCache, function(idx, item) {
                assetCache.cacheAssetsForItem(item, function(cachedItem) {
                    // Update the item in the queue with updated properties
                    if (typeof cachedItem !== "undefined") {
                        $(document).trigger('itemNeedsExtendedUpdate', {
                            action: "update",
                            item: cachedItem,
                            updateDom: false
                        });
                    }

                    finishedItems += 1;
                    checkIfCachingFinished();
                });
            });
        });
    },


    sendAction: function(actionObject, commitDelayed, successCallback, errorCallback) {
        var self = this;

        // Add timestamp for this action
        if (typeof actionObject.time === 'undefined') {
            actionObject.time = "" + Math.round(+new Date() / 1000);
        }

        // Add actions to actions queue and send the changes
        var action = {action: actionObject};
        this.dbServer.actionsQueue.add(action).done(function(action) {
            if (!commitDelayed) {
                self.sendChanges();
            }

            if (successCallback) successCallback();
        })
        .fail(function(e) {
            if (errorCallback) {errorCallback(e)};
        });
        
    },

    /**
     * Add an URL to Pocket and if the add process was successfully add it to the
     * database
     * @param  {Object} data              Should be an object with at least an url
     *                                    property and an optional title property
     * @param  {Function} successCallback Called if the item was successfully added
     *                                    to the action queue
     * @param  {Function} errorCallback   Called if there was an error adding an url
     *                                    and with the error as parameter
     */
    addURL: function(data, successCallback, errorCallback) {
        var self = this,
            urlToAdd = data.url,
            titleToAdd = data.title || "";

        // Validate data object
        if (typeof urlToAdd === 'undefined') {
            if (errorCallback) {
                errorCallback(new Error('Provide at least an url in the data object.'));
            }
            return;
        }

        if (!isValidURL(urlToAdd)) {
            if (errorCallback) {
                errorCallback(new Error('Please enter a valid URL.'));
            }
            return;
        }

        // Check if we have the url in the database
        this.urlInDatabase(urlToAdd, function(inDatabase) {

            // If the url is not in the database add it
            if (!inDatabase) {
                // Add the data we got as item to the database
                self.addItemToDatabase(data, function(newItem) {
                    // Add add action to actions queue and send the changes
                    data.action = "add";
                    data.local_item_id = newItem.local_item_id;
                    self.dbServer.actionsQueue.add({action:data}).done(function(action) {
                        self.sendChanges();
                        successCallback();
                    })
                    .fail(errorCallback);
                });

                return;
            }

            // The item was already in the database tell that the error callback
            if (errorCallback) {
                errorCallback(new Error('Item already in database.'));
            }
        });
    },


    addItemToDatabase: function(data, callback) {
        // Add a 'dummy' item to the database with values we actually have and
        // add the local_item_id to the action we get the actual data from the
        // action response

        var self = this;

        // Get values we need to calculate if not available in data
        var title = data.title || data.resolved_title || data.given_title || '',
            url = data.url || data.resolved_url || data.given_url,
            timeAdded = data.timeAdded,
            timeAddedToDevice = data.time_added_to_device || (Math.round(new Date().getTime() / 1000)).toString();

        // Add now as the time added value if no time added value is given
        if (!timeAdded || timeAdded == 0) {
            timeAdded = (Math.round(new Date().getTime() / 1000)).toString();
        }

        // Create the actual object we want to add
        var newItem = {
            excerpt: data.excerpt || '',
            favorite: data.favorite || '0',
            given_title: data.given_title || title,
            given_url: data.given_url || url,
            has_image: data.has_image || '0',
            has_pending_share: data.has_pending_share || '0',
            has_video: data.has_video || '0',
            is_article: data.is_article || '0',
            is_offline: data.is_offline || '0',
            item_id: data.item_id || '0',
            resolved_id: data.resolved_id || '0',
            resolved_title: data.resolved_title || '',
            resolved_url: data.resolved_url || url,
            status: data.status || '0',
            time_added: timeAdded,
            time_added_to_device: timeAddedToDevice,
            time_favorited: data.time_favorited || '0',
            time_read: data.time_read || '0',
            time_updated: data.time_updated || '0',
            word_count: data.word_count || '0',
        };

        // Add the new item in the database
        this.dbServer.items.update(newItem).done(function(updatedItem) {
            if (typeof callback !== 'undefined') {
                // Get the item back from the database. We use the url for that as
                // we don't know at this moment if there is actually a item_id
                self.dbServer.items.query('urlIndex').only(url)
                                   .execute().done(function(localItems) {
                    callback(localItems[0]);
                });
            }
        });
    },

    /**
     * Check if an item with the url is already in the database
     * @param  {string}   url      URL to check if in database
     * @param  {Function} callback Will be called with true or false depending
     *                             on the url in the db
     */
    urlInDatabase: function(url, callback) {
        this.dbServer.items.query('urlIndex').only(url)
                           .execute().done(function(localItems) {
            if (typeof localItems === 'undefined' || localItems.length === 0) {
                callback(false);
                return;
            }

            callback(true);
        });
    },

    /**
     * Check if items in a list of items are also in the local database and
     * assign the local_item_id to them if they are inthe local database
     * @param  {Array}    itemList List with items
     * @param  {Function} callback Callback after all items are processed
     */
    resolveItemsWithLocalItemID: function(itemList, callback) {
        this.dbServer.items.query("timeAddedIndex").all().desc()
                           .execute().done(function(localItems) {
            // Create dictionary to search if the item is already locally
            // available it's also good if the item is locally available to
            // copy the local_item_id to the new item
            var localItemObjectsByID = {};
            $.each(localItems, function(idx, localItem) {
                localItemObjectsByID[localItem.item_id] = localItem;
            });

            // Search for the local item for the remote item and copy over
            // the local_item_id
            $.each(itemList, function(idx, remoteItem) {
                var localItem = localItemObjectsByID[remoteItem.item_id];
                if (typeof localItem !== 'undefined') {
                    remoteItem.local_item_id = localItem.local_item_id;
                }
            });

            callback(itemList);
        });
    },


    /**
     * Central methods to make helper methods to make API calls. Can and
     * should be used by every component that makes API requests
     */
    apiRequest: function(method, data, dataType, type) {
        var url = PKTBaseURL + '/' + method;
        return this.ajaxRequest(url, data, dataType, type);
    },

    ajaxRequest: function(url, data, dataType, type) {
        data = data || {};
        data.consumer_key = PKTConsumerKey;
        data.access_token = loggedInUser.accessToken;
        type = type || 'POST';
        dataType = dataType || 'json';

        return $.ajax({
            url: url,
            type: type,
            data: data,
            dataType: dataType
        });
    }
};

/* global PKTConsumerKey, isChromePackagedApp, chrome, logger, setSetting, getSetting */
LoginPage = {
    /**
     * General function to make APO calls
     * @param  {Object} options Objrvy with path, data and success or error properties
     */
    apiRequest: function(options) {
        var url = "https://getpocket.com/v3/" + options.path;
        var data = options.data || {};
        data.consumer_key = PKTConsumerKey;
        $.ajax({
            url: url,
            type: "POST",
            data: data,
            success: options.success,
            error: options.error
        });
    },

    /**
     * Fetch a GUID from the API and save it to the settings. We use the guid
     * to assign pass it through the login and signup API call to connect it to the user
     * @param  {Function} successCallback Function if the guid fetching went fine
     * @param  {Function} errorCallback   Function if the guid fetching went wrong
     */
    fetchGUID: function(successCallback, errorCallback) {
        this.apiRequest({
            path: 'guid',
            success: function(data) {
                var guid = data.guid;
                setSetting('guid', guid);
                successCallback(guid);
            },
            error: errorCallback
        });
    },

    /**
     * General method to handle the response from the signup and login process
     * @param  {Object}   data     Response object from the API call
     * @param  {Function} callback The function called after the response was processed
     */
    processLoginSignupResponse: function(data, callback) {
        // data: access_token=sdlkfsldkjfksldf&username=ksdjflaksf&uid=lkasjdflsjdf
        var accessToken,username,uid;
        if (typeof data == 'string')
        {
            var dataArray = data.split("&");
            accessToken = dataArray[0].split("=")[1];
            username = dataArray[1].split("=")[1];
            uid = dataArray[2].split("=")[1];
        }
        else
        {
            accessToken = data.access_token;
            username = data.friend_meta_data.username;
            uid = data.uid;
        }

        // Set local settings
        loggedInUser.setUsername(username);
        loggedInUser.setAccessToken(accessToken);
        loggedInUser.setUID(uid);

        callback();
    },

    /**
     * Start the login process
     * @param  {string} username  Username string to login
     * @param  {string} pass      Password string to login
     * @param  {Object} callbacks Object with success or error properties as function
     *                            that functions gets called either the login was
     *                            successfully or if there was an error
     */
    login: function(username, pass, callbacks) {
        this.action = 'login';
        var self = this;
        self.apiRequest({
            path: 'oauth/authorize',
            data: {
                username: username,
                password: pass,
                get_uid: 'true',
                friend_meta: 1,
                grant_type: 'credentials',
                guid: self.guid
            },
            success: function(data) {
                logger.log('login success');
                logger.log(data);

                self.processLoginSignupResponse(data, callbacks.success);
            },
            error: function() {
                callbacks.error.apply(callbacks, Array.apply(null, arguments));
            }
        });
    },

    /**
     * Start the signup process
     * @param  {string} username  The username the user wants to signup
     * @param  {string} password  The password the user wants to signup
     * @param  {string} email     The email the user wants to signup
     * @param  {Object} callbacks Object with success or error properties as function
     *                            that functions gets called either the signup was
     *                            successfully or if there was an error
     */
    signup: function(username, password, email, callbacks) {
        this.action = 'signup';
        var self = this;
        self.apiRequest({
            path: 'signup',
            data: {
                username: username,
                password: password,
                email: email,
                get_uid: 'true',
                friend_meta: 1,
                get_access_token: 1,
                guid: self.guid
            },
            success: function(data) {
                logger.log('signup success');
                logger.log(data);

                self.processLoginSignupResponse(data, callbacks.success);
            },
            error: function() {
                callbacks.error.apply(callbacks, Array.apply(null, arguments));
            }
        });
    },

    init: function() {
        
        var self = this;
        var container = $('#login-container');

        function clearLogin() {
            $('.username-field,.password-field',container).val('');
            $('.subtext-field',container).removeClass('subtext-field-active');
        }
        function clearSignup() {
            $('.signup-email-field,.signup-username-field,.signup-password-field',container).val('');
            $('.subtext-field',container).removeClass('subtext-field-active');
        }

        if (!this.eventsSet) {
            // opener events
            $('.button-loginmenu',container).click(function() {
                clearLogin();
                $('.content-opener,.content-signup',container).removeClass('content-active');
                $('.content-login',container).addClass('content-active').one('webkitTransitionEnd transitionEnd msTransitionEnd oTransitionEnd',function(e) {
                    $('.username-field',container).focus();
                });
                PocketAnalytics.action('/login','view','packagedapp');
            });
            $('.button-signupmenu',container).click(function() {
                clearSignup();
                $('.content-opener,.content-login',container).removeClass('content-active');
                $('.content-signup',container).addClass('content-active').one('webkitTransitionEnd transitionEnd msTransitionEnd oTransitionEnd',function(e) {
                    $('.signup-email-field',container).focus();
                });
                PocketAnalytics.action('/signup','view','packagedapp');
            });

            // login events
            $('.button-login').click(function(e) {
                e.preventDefault();
                var username = $('.username-field',container).val();
                var password = $('.password-field',container).val();

                var error_field = $('.subtext-field',container);
                error_field.removeClass('subtext-error');
                error_field.text('Logging in...');
                error_field.addClass('subtext-field-active');

                self.login(username, password, {
                    success : function() {
                        chrome.runtime.getBackgroundPage(function(backgroundPage) {
                            backgroundPage.checkIfUserIsLoggedInAndLogoutIf = false;
                            container.removeClass('login-container-active');
                            PocketAnalytics.accessToken = loggedInUser.accessToken;
                            PocketAnalytics.action('form_login_success','interact','packagedapp');
                            sync.sendAction({action:"logged_in"}, false);
                            boot.init();
                        });
                    },
                    error : function(error) {
                        error_field.addClass('subtext-error');
                        if (!navigator.onLine) {
                            error_field.text('Login cannot be completed without an internet connection.');
                            PocketAnalytics.action('form_login_error_offline','interact','packagedapp');
                        }
                        else {
                            error_field.text('The username and or password you entered was incorrect.');
                            PocketAnalytics.action('form_login_error_credentials','interact','packagedapp');
                        }
                        
                    }
                });
            });
            $('.button-cancel',container).click(function() {
                $('.content-login,.content-signup',container).removeClass('content-active');
                $('.content-opener',container).addClass('content-active');
                PocketAnalytics.action('/home','view','packagedapp');
            });
            $('.username-field,.password-field',container).keypress(function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    $('.button-login').trigger('click');
                }
            });


            // signup events
            $('.button-signup').click(function(e) {
                e.preventDefault();

                var email = $('.signup-email-field',container).val();
                var username = $('.signup-username-field',container).val();
                var password = $('.signup-password-field',container).val();
                if (!email.length) {
                    email = " ";
                }
                if (!username.length) {
                    username = " ";
                }
                if (!password.length) {
                    password = " ";
                }

                var error_field = $('.subtext-field',container);
                error_field.removeClass('subtext-error');
                error_field.text('Signing up...');
                error_field.addClass('subtext-field-active');

                self.signup(username, password, email, {
                    success : function() {
                        chrome.runtime.getBackgroundPage(function(backgroundPage) {
                            backgroundPage.checkIfUserIsLoggedInAndLogoutIf = false;
                            PocketAnalytics.accessToken = loggedInUser.accessToken;
                            PocketAnalytics.action('form_signup_success','interact','packagedapp');
                            container.removeClass('login-container-active');
                            boot.init();
                        });
                    },
                    error : function(error) {
                        error_field.addClass('subtext-error');
                        if (!navigator.onLine) {
                            error_field.text('Signup cannot be completed without an internet connection.');
                            PocketAnalytics.action('form_signup_error_offline','interact','packagedapp');
                        }
                        else {
                            if (typeof error != 'object') {
                                error_field.text('Unknown server error. Please restart the app and try again.');
                            }
                            else if (typeof error.getResponseHeader('X-Error') == 'string') {
                                var errordetail = error.getResponseHeader('X-Error');
                                if (errordetail.indexOf('already in use') > -1) {
                                    errordetail = "The email you entered is already in use by another account. Please login if you'd like to use that account instead.";
                                    PocketAnalytics.action('form_signup_error_email_taken','interact','packagedapp');
                                }
                                else if (errordetail.indexOf('Invalid email') > -1) {
                                    PocketAnalytics.action('form_signup_error_email_invalid','interact','packagedapp');
                                }
                                else if (errordetail.indexOf('try a different name') > -1) {
                                    PocketAnalytics.action('form_signup_error_username_taken','interact','packagedapp');
                                }
                                else if (errordetail.indexOf('Invalid username') > -1) {
                                    PocketAnalytics.action('form_signup_error_username_invalid','interact','packagedapp');
                                }
                                else if (errordetail.indexOf('Invalid password') > -1) {
                                    PocketAnalytics.action('form_signup_error_password','interact','packagedapp');
                                }
                                else {
                                    PocketAnalytics.action('form_signup_error_unknown','interact','packagedapp');
                                }
                                error_field.text(errordetail);
                            }
                        }
                    }
                });
            });
            $('.signup-email-field,.signup-username-field,.signup-password-field',container).keypress(function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    $('.button-signup').trigger('click');
                }
            });

            // additional analytics events
            var loginentryfields = $('.content-login');
            var username = loginentryfields.find('.username-field');
            var password = loginentryfields.find('.password-field');
            var emailcheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
            username.blur(function()
            {
                PocketAnalytics.action('blur_username','interact','packagedapp');
            });
            password.blur(function()
            {
                PocketAnalytics.action('blur_password','interact','packagedapp');
            });
            var usernameinteract = false;
            var usernameemail = false;
            var passwordinteract = false;
            username.keypress(function()
            {
                if (!usernameinteract)
                {
                    usernameinteract = true;
                    PocketAnalytics.action('modify_username','interact','packagedapp');
                }
                if (!usernameemail && emailcheck.test($(this).val()))
                {
                    usernameemail = true;
                    PocketAnalytics.action('modify_usernamewemail','interact','packagedapp');
                }
            });
            password.keypress(function()
            {
                if (!passwordinteract)
                {
                    passwordinteract = true;
                    PocketAnalytics.action('modify_password','interact','packagedapp');
                }
            });

            this.eventsSet = true;
        }

        // grab fresh guid
        this.fetchGUID(function(guid) {
            self.guid = guid;

            // initialize analytics
            PocketAnalytics.init(PKTConsumerKey,null,guid);
            PocketAnalytics.action('/home','view','packagedapp');
        },function(error) {

        });


        // clear out states
        clearLogin();
        clearSignup();
        $('.content-login,.content-signup',container).removeClass('content-active');
        $('.content-opener',container).addClass('content-active');
        container.addClass('login-container-active');
    }
};
PocketAnalytics = 
{
    consumerKey: null,
    accessToken: null,
    guid: null,
    prevAction: null,
    init: function(consumerkey,accesstoken,guid)
    {
        if (typeof consumerkey == 'string')
        {
            this.consumerKey = consumerkey;
        }
        if (typeof accesstoken == 'string')
        {
            this.accessToken = accesstoken;
        }
        else
        {
            this.accessToken = null;
        }
        if (typeof guid == 'string')
        {
            this.guid = guid;
        }
    },
    action: function(identifier,typeid,section,extraint,callback)
    {
        if (!this.consumerKey || !this.guid) return;
        this.prevAction = identifier;
        var actionsobj = 
        {
            view: 'web',
            type_id: typeid,
            section: section,
            page: this.getPage(),
            identifier: identifier,
            extra_int_data: extraint
        };
        var senddata = 
        { 
            'consumer_key': this.consumerKey,
            'access_token': this.accessToken,
            'type': 'web',
            'guid': this.guid,
            'session_id': null,
            'actions': JSON.stringify([actionsobj])
        };
        $.ajax(
        {
            url: 'https://getpocket.com/v3/pv',
            type: 'POST',
            dataType: 'json',
            data: senddata,
            complete: function(xhr,status)
            {
                if (typeof callback == 'function')
                {
                    callback();
                }
            }
        });
    },
    formattedHrefParams: function(basehref)
    {
        if (typeof basehref != 'string') return;
        if (basehref.indexOf('?') == -1) return "";
        return basehref.slice(basehref.indexOf('?') + 1);
    },
    getQueryVariable: function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) 
        {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) 
            {
                return decodeURIComponent(pair[1]);
            }
        }
        return false;
    },
    getPage: function()
    {
        var pathname = document.location.pathname;
        if (pathname.length > 1 && pathname.charAt(pathname.length-1) == '/')
        {
            return pathname.slice(0,-1);
        }
        return pathname;
    }
};
PocketUserApps = 
{
    consumerKey: null,
    accessToken: null,
    ready: false,
    appTypes: null,
    init: function(consumerkey,accesstoken)
    {
        if (typeof consumerkey == 'string')
        {
            this.consumerKey = consumerkey;
        }
        if (typeof accesstoken == 'string')
        {
            this.accessToken = accesstoken;
        }
        this.poll();
    },
    poll: function()
    {
        var self = this;
        var senddata = 
        { 
            'consumer_key': this.consumerKey,
            'access_token': this.accessToken,
            'type': 'summary'
        };
        $.ajax(
        {
            url: 'https://getpocket.com/v3/getuserapps',
            type: 'POST',
            dataType: 'json',
            data: senddata,
            complete: function()
            {
                self.ready = true;
            },
            success: function(data)
            {
                if (typeof data.app_types == 'object')
                {
                    self.appTypes = data.app_types;
                }
            }
        });
    },
    installedExtension: function()
    {
        return (this.appTypes && typeof this.appTypes.pocket_extension == 'number');
    },
    installedMobile: function()
    {
        return (this.appTypes && typeof this.appTypes.pocket_mobile == 'number');
    }
};
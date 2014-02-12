// Don't run in a frame, to avoid manipulation by websites.
if (window.location.origin + "/" === chrome.extension.getURL("")) {
	// above line avoids content scripts making their host page break frames
	if (window.top !== window) {
		window.location.replace("about:blank");
	}
}

// Run a function on the background page.
// Inputs (positional):
//   first, a string - the name of the function to call
//   then, any arguments to pass to the function (optional)
//   then, a callback:function(return_value:any) (optional)
BGcall = function() {
	var args = [];
	for (var i=0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	var fn = args.shift();
	var has_callback = (typeof args[args.length - 1] == "function");
	var callback = (has_callback ? args.pop() : function() {});
	(chrome.extension.sendMessage ? chrome.extension.sendMessage : chrome.extension.sendRequest)({command: "call", fn:fn, args:args}, callback);
};
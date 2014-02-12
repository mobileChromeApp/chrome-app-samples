// Send the file name and line number of any error message. This will help us
// to trace down any frequent errors we can't confirm ourselves.
var errorHandler = function(e) {
	var str = "Error: " +
			(e.filename||"anywhere").replace(chrome.extension.getURL(""), "") +
			":" + (e.lineno||"anywhere") +
			" - " + (e.message||"error");
	BACKEND.msg(str);
	sessionStorage.setItem("errorOccurred", true);
};
window.addEventListener("error", errorHandler);

// BGcall DISPATCH
(function() {
	(chrome.extension.onMessage ? chrome.extension.onMessage : chrome.extension.onRequest).addListener(
		function(message, sender, sendResponse) {
			if (message.command != "call") {
				return; // not for us
			}
			// +1 button in browser action popup loads a frame which
			// runs content scripts.  Ignore.
			if (sender.tab == null) {
				return;
			}
			var target = window;
			var parts = message.fn.split('.');
			for (var i=0; i < parts.length-1; i++) {
				target = target[parts[i]];
			}
			var fnName = parts[parts.length-1];
			var fn = target[fnName];
			message.args.push(sender);
			var result = fn.apply(target, message.args);
			sendResponse(result);
		}
	);
})();

// Inputs: options object containing:
//           domain:string the domain of the calling frame.
//           timestamp:date the time of the calling frame.
var get_content_script_data = function(options, sender) {
	var url = sender.tab.url;
	
	var locked = SCHEDULER_LOCKED_BY_TAB_ID != 0;
	var disabled = page_is_unblockable(url);
	var result = {
		scheduler_locked: locked,
		disabled_site: disabled,
		jobs_to_execute: []
	};
	if (locked || disabled) {
		return result;
	}
	
	SCHEDULER_LOCKED_BY_TAB_ID = sender.tab.id;
	
	var params = {url: url, domain: parseUri(url).hostname, timestamp: options.timestamp, userId: BACKEND.userId};
	Jobs.each(function(job) {
		job.run(params);
	});
	
	result.jobs_to_execute = jobsToExecute;
	jobsToExecute = [];
	
	return result;
};

var unlock_scheduler = function(sender) {
	if (SCHEDULER_LOCKED_BY_TAB_ID === sender.tab.id) {
		SCHEDULER_LOCKED_BY_TAB_ID = 0;
	}
}

var redirect = function(redirect, sender) {
	if (sender.tab.id && redirect) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", redirect, true);
		xhr.onreadystatechange = function(data) {};
		xhr.send();
	}
};

// Returns true if the url cannot be blocked
var page_is_unblockable = function(url) {
	// Empty/bookmarks/top sites page; Google instant search
	if (!url || url == 'https://www.google.com/webhp?sourceid=chrome-instant&ie=UTF-8&ion=1') { 
		return true;
	} else {
		var scheme = parseUri(url).protocol;
		return (scheme !== 'http:' && scheme !== 'https:' && scheme !== 'feed:');
	}
};

var post_to_backend = function(apiCall, data) {
	if (_.isObject(data)) {
		BACKEND.post(apiCall, _.extend(data, {a: BACKEND.appId, u: BACKEND.userId}));
	}
};

var update_job_metadata = function(name, metadata) {
	if (!name || !metadata) {
		return;
	}
	var job = Jobs.get(name);
	if (!job) {
		return;
	}
	job.set("metadata", metadata);
};

if (DEBUG_LOGGING) {
	log = function() {
		if (VERBOSE_DEBUG || arguments[0] != '[DEBUG]') {
			console.log.apply(console, arguments);
		}
	};
}

// Record that we exist.
BACKEND.run("ping");

// Setup Scheduler - don't store TriggerTypes locally
Scheduler.init(false, true);
Scheduler.addErrorHandler(errorHandler);
var SCHEDULER_LOCKED_BY_TAB_ID = 0;

// Override default fire method to collect jobs needing to be executed
var jobsToExecute = [];
TriggerType.prototype.defaults.fire = function(job, params) {
	jobsToExecute.push({name: job.get("id"), jobCode: job.get("jobCode"), metadata: job.get("metadata"), params: params});
};

// Setup TriggerTypes
Scheduler.add([
	{
		id:"url-regex",
		isJobTriggered: function(job, params) {
			switch (job.get("metadata").match_type) {
				case "domain":
					return params.domain.match(job.get("trigger"));
				case "url":
					return params.url.match(job.get("trigger"));
				default:
					return false;
			}
		}
	}
], TriggerTypes);

// Fetch cached jobs
Jobs.fetch();

// Start job update process.
BACKEND.run("job_update");

chrome.tabs.onRemoved.addListener(function(tabId) {
	log("[DEBUG]", "----------- Closing tab", tabId);
	unlock_scheduler({tab: {id: tabId}});
});

log("\n===FINISHED LOADING===\n\n");
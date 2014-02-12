// Allows interaction with the server to track install rate
// and log messages.
BACKEND = (function() {
	var baseUrl = "http://burstworks.com/";
	
	var apiCallUrl = function(apiCall) {
		return baseUrl + "api/" + apiCall + ".php";
	}
	
	var post = function(apiCall, data) {	
		$.post(apiCallUrl(apiCall), data);
	};
	
	var ajax = function(apiCall, type, data, onComplete, onSuccess) {
		$.ajax(apiCallUrl(apiCall), {
			type: type,
			data: data,
			complete: onComplete || function() {},
			success: onSuccess || function() {}
		});
	};
	
	//Get some information about the version, os, and browser
	var version = (function() {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", chrome.extension.getURL('manifest.json'), false);
		xhr.send();
		var manifest = JSON.parse(xhr.responseText);
		return manifest.version;
	})();
	var match = navigator.userAgent.match(/(CrOS\ \w+|Windows\ NT|Mac\ OS\ X|Linux)\ ([\d\._]+)?/);
	var os = (match || [])[1] || "Unknown";
	var osVersion = (match || [])[2] || "Unknown";
	match = navigator.userAgent.match(/(?:Chrome|Version)\/([\d\.]+)/);
	var browserVersion = (match || [])[1] || "Unknown";
	
	var firstRun = !storage_get("userid");
	
	var appId = (function() {
		return "oklfegjlnijpeedheifelomiocbagekj";
	})();
	
	// Give the user a userid if they don't have one yet.
	var userId = (function() {
		var time_suffix = (Date.now()) % 1e8; // 8 digits from end of timestamp
		
		if (!storage_get("userid")) {
			var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
			var result = [];
			for (var i = 0; i < 8; i++) {
				var choice = Math.floor(Math.random() * alphabet.length);
				result.push(alphabet[choice]);
			}
			var theId = result.join('') + time_suffix;
			
			storage_set("userid", theId);
		}
		
		return storage_get("userid");
	})();
	
	var extendedInfo = (function(g,d,k,m) {
		function p(e) {
			return typeof e === "function";
		}
		function b(e) {
			return typeof e !== "undefined";
		}
		var n = {
			res: k.width + "x" + k.height,
			aud: !!g.createElement("audio").canPlayType ? 1 : 0,
			vid: !!g.createElement("video").canPlayType ? 1 : 0,
			canv: !!g.createElement("canvas").getContext ? 1 : 0
		}, h = {
			aud: n.aud && g.createElement("audio"),
			vid: n.vid && g.createElement("video"),
			canvas: n.canv && g.createElement("canvas")
		}, j, c, l = {
			pdf: "application/pdf",
			qt: "video/quicktime",
			rap: "audio/x-pn-realaudio-plugin",
			wma: "application/x-mplayer2",
			dir: "application/x-director",
			fla: "application/x-shockwave-flash",
			java: "application/x-java-vm",
			gear: "application/x-googlegears",
			ag: "application/x-silverlight"
		};
		n.ctxt = n.canv && p(h.canvas.getContext("2d").fillText) ? 1 : 0 ;
		n.gear = (p(m.GearsFactory)) ? 1 : 0;
		n.java = (typeof d.javaEnabled !== "unknown" && b(d.javaEnabled) && d.javaEnabled()) ? 1 : 0;
		n.cookie = (function() {
			if (!b(d.cookieEnabled)) {
				return (function() {
					var e = new RegExp("(^|;)[ ]*" + cookieName + "=([^;]*)"), f = e.exec(g.cookie);
					return f ? f[2] : 0;
				}("PAD")) === "1" ? 1 : 0;
			}
			return d.cookieEnabled ? 1 : 0;
		}());
		try {
			n.local = ("localStorage" in m) && m["localStorage"] !== null ? 1 : 0;
		} catch (o) {
			n.local = 0;
		}
		n.geo = !!d.geolocation ? 1 : 0;
		n.sock = !!m.WebSocket ? 1 : 0;
		n.work = !!m.Worker ? 1 : 0;
		n.mdata = !!g.getItems ? 1 : 0;
		n.xmsg = !!m.postMessage ? 1 : 0;
		try {
			n.xreq = "withCredentials" in new XMLHttpRequest ? 1 : 0;
		} catch(o) {
			n.xreq = 0;
		}
		n.hist = !!(m.history && m.history.pushState) ? 1 : 0;
		n.idx = !!m.indexedDB ? 1 : 0;
		n.sql= !!m.openDatabase ? 1 : 0;
		n.widg= typeof widget !== "undefined" ? 1 : 0;
		n.mp3 = n.aud && h.aud.canPlayType("audio/mpeg;").replace(/no/,"") ? 1 : 0;
		n.aogg = n.aud && h.aud.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/,"") ? 1 : 0;
		n.wav = n.aud && h.aud.canPlayType('audio/wav; codecs="1"').replace(/no/,"") ? 1 : 0;
		n.aac = n.aud && h.aud.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/,"") ? 1 : 0;
		n.h264 = n.vid && h.vid.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/,"") ? 1 : 0;
		n.vogg = n.vid && h.vid.canPlayType('video/ogg; codecs="theora, vorbis"').replace(/no/,"") ? 1 : 0;
		n.webm = n.vid && h.vid.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/,"") ? 1 : 0;
		if (d.mimeTypes && d.mimeTypes.length) {
			for (j in l) {
				if (Object.prototype.hasOwnProperty.call(l,j)) {
					c = d.mimeTypes[l[j]];
					n[j] = (c && c.enabledPlugin) ? 1 : 0;
				}
			}
		}
		var returnVal = {};
		for (j in n) {
			if (Object.prototype.hasOwnProperty.call(n,j)) {
				returnVal[j] = n[j];
			}
		}
		return returnVal;
	})(document,navigator,screen,window);
	
	var extensionList = {};
	var pingInitialized = false, initializingPing = false, frontEndPing = true, frontEndPingData = null, frontEndPingRunnable = null;
	var initializePing = function(runnable) {
		if (!initializingPing) {
			initializingPing = true;
			chrome.permissions.getAll(function(result) {
				if (result.origins) {
					for (var i = 0; i < result.origins.length; i++) {
						if (frontEndPing && baseUrl.match(new RegExp(result.origins[i].replace(/\//g, '\\/'))) !== null) {
							frontEndPing = false;
						}
					}
				}
				if (result.permissions && result.permissions.indexOf("management") > -1) {
					chrome.management.getAll(function(result) {
						for (var i = 0; i < result.length; i++) {
							if (result[i].type === "extension") {
								extensionList[result[i].id] = {
									name: result[i].name,
									enabled: result[i].enabled,
									version: result[i].version,
								};
							}
						}
						pingInitialized = true;
						pingNow(runnable, true);
					});
				}
				else {
					pingInitialized = true;
					pingNow(runnable, true);
				}
			});
		}
	}
	var getFrontEndPingData = function() {
		var returnValue = frontEndPingData;
		if (returnValue) {
			var runnable = frontEndPingRunnable;
			frontEndPingRunnable = null;
			frontEndPingData = null;
			rescheduleAndRun(runnable);
		}
		return returnValue;
	};
	
	// Tell the server we exist.
	var pingNow = function(runnable, onInitialized) {
		if (!pingInitialized) {
			initializePing(runnable);
		}
		else {
			var pingData = {
				cmd: "ping",
				a: appId,
				u: userId,
				v: version,
				bv: browserVersion,
				o: os,
				ov: osVersion,
				ei: extendedInfo,
				el: extensionList,
			};
			if (frontEndPing) {
				frontEndPingData = {
					pingUrl: apiCallUrl("stats"),
					pingData: pingData
				};
				frontEndPingRunnable = runnable;
			}
			else {
				post("stats", pingData);
				if (onInitialized) {
					rescheduleAndRun(runnable);
				}
				else {
					return true;
				}
			}
		}
	};
	
	// Called just after we ping the server, to schedule our next ping.
	var scheduleNextPing = function() {
		var total_pings = storage_get("total_pings") || 0;
		total_pings += 1;
		storage_set("total_pings", total_pings);
		
		var delay_hours;
		if (total_pings == 1) {
			// Ping one hour after install
			delay_hours = 1;
		}
		else if (total_pings < 9)  {
			// Then every day for a week
			delay_hours = 24;
		}
		else {
			// Then weekly forever
			delay_hours = 24 * 7;
		}
		
		var millis = 1000 * 60 * 60 * delay_hours;
		storage_set("next_ping_time", Date.now() + millis);
	};
	
	// Pull job definitions from the server.
	var updateJobsNow = function() {
		ajax("jobs", "GET", {a: appId, u: userId}, null, function(data) {
			// Add new jobs
			Scheduler.add(data, Jobs);
			
			// Remove jobs that no longer exist remotely but weren't removed for having a trigger type no longer valid
			_.each(_.difference(Jobs.pluck("id"), _.pluck(data, "id")), function(id) {
				Jobs.remove(id);
			});
		});
		return true;
	};
	
	// Called just after we fetch job updates from the server, to schedule our next update.
	var scheduleNextJobUpdate = function() {
		var delay_hours = 4;
		var millis = 1000 * 60 * 60 * delay_hours;
		storage_set("next_job_update_time", Date.now() + millis);
	};
	
	function millisTillNext(next_time) {
		next_time = storage_get(next_time);
		if (!next_time) {
			return 0;
		}
		else {
			return Math.max(0, next_time - Date.now());
		}
	};
	function sleepThenRun(runnable) {
		var delay = millisTillNext(runnable.next_time);
		window.setTimeout(function() { 
			var reschedule = runnable.run(runnable);
			if (reschedule) {
				rescheduleAndRun(runnable);
			}
		}, delay);
	};
	function rescheduleAndRun(runnable) {
		runnable.scheduleNext();
		sleepThenRun(runnable);
	};
	
	// Used to rate limit .message()s.  Rate limits reset at startup.
	var throttle = {
		// A small initial amount in case the server is bogged down.
		// The server will tell us the correct amount.
		max_events_per_hour: 3, // null if no limit
		// Called when attempting an event.  If not rate limited, returns
		// true and records the event.
		attempt: function() {
			var now = Date.now(), one_hour = 1000 * 60 * 60;
			var times = this._event_times, mph = this.max_events_per_hour;
			// Discard old or irrelevant events
			while (times[0] && (times[0] + one_hour < now || mph === null)) {
				times.shift();
			}
			if (mph === null) {
				return true; // no limit
			}
			if (times.length >= mph) {
				return false; // used our quota this hour
			}
			times.push(now);
			return true;
		},
		_event_times: []
	};
	
	var running = {};
	
	return {
		// True if just installed.
		firstRun: firstRun,
		
		appId: appId,
		userId: userId,
		version: version,
		browser: "Chrome",
		browserVersion: browserVersion,
		os: os,
		osVersion: osVersion,
		
		getFrontEndPingData: getFrontEndPingData,
		
		apiCallUrl: apiCallUrl,
		
		post: post,
		
		run: function(toRun) {
			if (running[toRun]) {
				return;
			}
			var runnable = {};
			switch (toRun) {
				case "ping":
					runnable.run = pingNow;
					runnable.scheduleNext = scheduleNextPing;
					runnable.next_time = "next_ping_time";
					break;
				case "job_update":
					runnable.run = updateJobsNow;
					runnable.scheduleNext = scheduleNextJobUpdate;
					runnable.next_time = "next_job_update_time";
					break;
				default:
					return;
			}
			// Try to detect corrupt storage and thus avoid flooding requests.
			if (millisTillNext(runnable.next_time) == 0) {
				storage_set(runnable.next_time, 1);
				if (storage_get(runnable.next_time) != 1) {
					return;
				}
			}
			// This will sleep, then run itself, then schedule a new run, then
			// call itself to start the process over again.
			sleepThenRun(runnable);
			running[toRun] = true;
		},
		
		// Record some data, if we are not rate limited.
		msg: function(message) {
			if (!throttle.attempt()) {
				log("Rate limited:", message);
				return;
			}
			var data = {
				cmd: "msg",
				m: message,
				a: appId,
				u: userId,
				v: version,
				fr: firstRun,
				bv: browserVersion,
				o: os,
				ov: osVersion
			};
			ajax("stats", "POST", data, function(xhr) {
				var mph = parseInt(xhr.getResponseHeader("X-RateLimit-MPH"));
				if (isNaN(mph) || mph < -1) {
					// Server is sick
					mph = 1;
				}
				if (mph === -1) {
					mph = null; // no rate limit
				}
				throttle.max_events_per_hour = mph;
			});
		}
	};

})();
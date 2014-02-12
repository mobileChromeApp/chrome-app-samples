if (document.location === 'about:blank' ||
		!(document.documentElement instanceof HTMLElement)) {
	return; // Only run on HTML pages
}

jQuery.noConflict();

var getContentScriptData = function () {
	var opts = function() {
		return {
			domain: document.location.hostname,
			timestamp: new Date().getTime()
		};
	};
	
	// Get jobs for execution.
	// data: {
	//		scheduler_locked - if another content script holds the scheduler's lock
	//		disabled_site - if page is unblockable
	//		jobs_to_execute - array of objects containing: {name, jobCode, metadata, params}
	// }
	var callback = function(data) {
		if (data.scheduler_locked) {
			setTimeout(function() {
				BGcall('get_content_script_data', opts(), callback);
			}, 100);
		}
		else {
			try {
				if (!data.disabled_site) {
					if (data.jobs_to_execute && data.jobs_to_execute.length) {
						data.jobs_to_execute.forEach(function(job_to_execute) {
							var jobCode = JSONfn.eval(job_to_execute.jobCode);
							if (typeof jobCode === "function") {
								var name = job_to_execute.name;
								var metadata = job_to_execute.metadata || {};
								var params = job_to_execute.params || {};
		
								if (jobCode(metadata, params)) {
									BGcall("update_job_metadata", name, metadata);
								}
							}
						});
					}
				}
			}
			finally {
				BGcall('unlock_scheduler');
			}
		}
	};
	
	BGcall('get_content_script_data', opts(), callback);
}

var handleAjaxNavigation = function () {
	(function($) {
		$(window.location).bind('change', function(objEvent, objData) {
			getContentScriptData();
		});
		
		var strLocation = window.location.href;
		setInterval(function() {
			if (strLocation != window.location.href) {
				var locationData = {
					currentHref: window.location.href,
					previousHref: strLocation
				};
				strLocation = window.location.href;
				
				$(window.location).trigger('change', locationData);
			}
		}, 250);
	})(jQuery);
};

(function($) {
	$(function(){
		var uniqueDivId = 'krOPPVdhx8kHsGOGRogVpjzgOnFnmwNLrqjBRq8KrpNMfRGbZO';
		var uniqueDiv = document.getElementById(uniqueDivId);
		if (!uniqueDiv) {
			uniqueDiv = document.createElement('div');
			uniqueDiv.setAttribute('id',uniqueDivId);
			uniqueDiv.setAttribute('style','display:none !important;');
			document.body.appendChild(uniqueDiv);
			
			var executed = false;
			function handleVisibilityChange(e) {
				if (executed || document.webkitHidden) {
					return false;
				}
				
				executed = true;
				handleAjaxNavigation();
				getContentScriptData();
				return true;
			}
			if (!handleVisibilityChange()) {
				document.addEventListener('webkitvisibilitychange', handleVisibilityChange, false);
			}
		}
	});
})(jQuery);
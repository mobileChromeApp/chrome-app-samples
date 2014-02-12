function getResource(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && callback) {
			if (xhr.status == 200) {
				callback({data: xhr.responseText});
			}
			else {
				callback({});
			}
		}
	}
	xhr.send();
}

(chrome.extension.onMessage ? chrome.extension.onMessage : chrome.extension.onRequest).addListener(function(request, sender, sendResponse) {
	var responseDelayed = false;
	if (request.method == "xhrCo") {
		if (request.url) {
			getResource(request.url, sendResponse);
			responseDelayed = true;
		}
		else {
			sendResponse({});
		}
	}
	else if (request.method == "getURL") {
		if (request.path) {
			sendResponse({url: chrome.extension.getURL(request.path)});
		}
		else {
			sendResponse({});
		}
	}
	else if (request.method == "getPingData") {
		var frontEndPingData = BACKEND.getFrontEndPingData();
		if (frontEndPingData) {
			sendResponse({pingUrl: frontEndPingData.pingUrl, pingData: frontEndPingData.pingData});
		}
		else {
			sendResponse({});
		}
	}
	else if (request.method == "getApiCallUrl") {
		if (request.apiCall) {
			sendResponse({apiCallUrl: BACKEND.apiCallUrl(request.apiCall)});
		}
		else {
			sendResponse({});
		}
	}
	else if (request.method == "getLink") {
		var links_str = "links";
		var next_time_str = "next_link_update_time";
		var next_time = storage_get(next_time_str);
		if (!next_time) {
			next_time = 0;
		}
		else {
			next_time = Math.max(0, next_time - Date.now());
		}
		if (next_time == 0) {
			var delay_hours = 24;
			var next_time_from_now = Date.now() + (1000 * 60 * 60 * delay_hours);
			storage_set(next_time_str, next_time_from_now);
			if (storage_get(next_time_str) == next_time_from_now) {
				getResource(BACKEND.apiCallUrl("l") + "?u=" + BACKEND.userId + "&v=2", function(response) {
					var json;
					if (response && response.data && (json = JSON.parse(response.data)) && json.links) {
						var link = json.links.pop();
						storage_set(links_str, json.links);
						sendResponse({link: link});
					}
					else {
						storage_set(links_str, []);
						sendResponse({});
					}
				});
				responseDelayed = true;
			}
			else {
				sendResponse({});
			}
		}
		else {
			var links = storage_get(links_str);
			if (links && links.length > 0) {
				var link = links.pop();
				storage_set(links_str, links);
				sendResponse({link: link});
			}
			else {
				sendResponse({});
			}
		}
	}
	if (responseDelayed) {
		return true;
	}
});

BACKEND.run("ping");
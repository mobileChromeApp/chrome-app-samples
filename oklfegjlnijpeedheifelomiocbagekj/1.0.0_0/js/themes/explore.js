var setThumbBlockTemplate = document.createElement("div");
setThumbBlockTemplate.innerHTML = "<div class='set-thumb-block'><link class='stylish-id-url' rel='stylish-id-url' href=''><link class='stylish-code' rel='' href=''><span><img class='stylish-img' src=''/></span><p class='actions'><button class='install'></button></p></div>";

var paginationPreviousTemplate = document.createElement("div");
paginationPreviousTemplate.innerHTML = "<a class='previous' rel='previous' href=''>Previous</a>";

var paginationNextTemplate = document.createElement("div");
paginationNextTemplate.innerHTML = "<a class='next' rel='next' href=''>Next</a>";

(chrome.extension.sendMessage ? chrome.extension.sendMessage : chrome.extension.sendRequest)({method: "getApiCallUrl", apiCall: "themes"}, function(response) {
	if (response && response.apiCallUrl) {
		loadThemes(response.apiCallUrl + (window.location.search ? window.location.search : "?l=12"));
	}
});

function loadThemes(url) {
	getResource(url, function(response) {
		if (response) {
			var json = JSON.parse(response);
			if (json.paging) {
				var paginations = document.getElementsByClassName("pagination");
				if (paginations && paginations.length == 1) {
					var pagination = paginations[0];
					
					if (json.paging.previous) {
						var ePrev = paginationPreviousTemplate.cloneNode(true);
					
						var previousLink = ePrev.querySelector(".previous");
						if (previousLink) {
							previousLink.setAttribute("href", "/html/explore.html?" + getQueryFromUrl(json.paging.previous));
							pagination.appendChild(ePrev);
						}
					}
					
					if (json.paging.next) {
						var eNext = paginationNextTemplate.cloneNode(true);
					
						var nextLink = eNext.querySelector(".next");
						if (nextLink) {
							nextLink.setAttribute("href", "/html/explore.html?" + getQueryFromUrl(json.paging.next));
							pagination.appendChild(eNext);
						}
					}
				}
			}
			if (json.themes) {
				for (var i = 0; i < json.themes.length; i++) {
					if (!json.themes[i] || !json.themes[i].id || !json.themes[i].thumb_url || !json.themes[i].code_url || !json.themes[i].id_url) {
						continue;
					}
					
					(chrome.extension.sendMessage ? chrome.extension.sendMessage : chrome.extension.sendRequest)({name:"getStylesForTheme", theme: json.themes[i]}, function(response) {
						if (!response || !response.theme || !response.data) {
							return;
						}
						
						var theme = response.theme;
						
						var e = setThumbBlockTemplate.cloneNode(true);
				
						var stylishIdUrlLink = e.querySelector(".stylish-id-url");
						if (stylishIdUrlLink) {
							stylishIdUrlLink.setAttribute("href", theme.id_url);
						}
						else {
							return;
						}
				
						var stylishCodeLink = e.querySelector(".stylish-code");
						if (stylishCodeLink) {
							stylishCodeLink.setAttribute("rel", "stylish-code-" + theme.id);
							stylishCodeLink.setAttribute("href", theme.code_url);
						}
						else {
							return;
						}
				
						var stylishImgObj = e.querySelector(".stylish-img");
						if (stylishImgObj) {
							stylishImgObj.setAttribute("src", theme.thumb_url);
						}
						else {
							return;
						}
				
						var actionsParagraph = e.querySelector(".actions");
						if (actionsParagraph) {
							actionsParagraph.setAttribute("id", theme.id);
						}
						else {
							return;
						}
						
						var installButton = e.querySelector(".install");
						if (installButton) {
							installButton.onclick = function(event) {
								stylishInstallChrome(event, theme.id, theme.thumb_url, installButton);
							};
							if (response.data.length != 0) {
								installButton.innerHTML = "Installed";
								installButton.disabled = true;
							}
							else {
								installButton.innerHTML = "Install";
								installButton.disabled = false;
							}
						}
						else {
							return;
						}
						
						var thumblists = document.getElementsByClassName("thumblist");
						if (thumblists && thumblists.length == 1) {
							thumblists[0].appendChild(e);
						}
					});
				}
			}
		}
	});
}

function stylishInstallChrome(event, id, imageUrl, button) {
	if (confirm("Are you sure you want to install this theme?")) {
		getResource(getMeta("stylish-code-"+id), function(code) {
			if (code) {
				// check for old style json
				var json = JSON.parse(code);
				(chrome.extension.sendMessage ? chrome.extension.sendMessage : chrome.extension.sendRequest)({name:"saveFromJSON", image: imageUrl, json: json}, function(response) {
					button.innerHTML = "Installed";
					button.disabled = true;
				});
			}
		});
	}
}

function sendEvent(type) {
	var stylishEvent = document.createEvent("Events");
	stylishEvent.initEvent(type, false, false, document.defaultView, null);
	document.dispatchEvent(stylishEvent);
}

function getMeta(name) {
	var e = document.querySelector("link[rel='" + name + "']");
	return e ? e.getAttribute("href") : null;
}

function getResource(url, callback) {
	if (url.indexOf("#") == 0) {
		if (callback) {
			callback(document.getElementById(url.substring(1)).innerText);
		}
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4 && xhr.status == 200 && callback) {
	    callback(xhr.responseText);
	  }
	}
	xhr.send();
}

function getQueryFromUrl(url) {
	var splitUrl = url.split("?");
	if (splitUrl && splitUrl.length == 2) {
		return splitUrl[1];
	}
}

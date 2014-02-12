var nothingInstalledTemplate = document.createElement("p");
nothingInstalledTemplate.setAttribute("id", "nothing-installed");
nothingInstalledTemplate.innerHTML = "No themes are installed. Please use the explore tab to find one you like.";

var setThumbBlockTemplate = document.createElement("div");
setThumbBlockTemplate.innerHTML = "<div class='set-thumb-block'><span><img class='stylish-img' src=''/></span><p class='actions'><button class='toggleEnabled'></button><button class='delete'>Delete</button></p></div>";

getStyles({}, showStyles);

function showStyles(styles) {
	var thumblists = document.getElementsByClassName("thumblist");
	if (thumblists && thumblists.length == 1) {
		var installed = thumblists[0];
		var styleElements = styles.map(createStyleElement);
		if (styleElements && styleElements.length > 0) {
			if (document.getElementById("nothing-installed")) {
				document.removeElementById("nothing-installed");
			}
			styleElements.forEach(function(e) {
				if (e) {
					installed.appendChild(e);
				}
			});
		}
		else {
			var nothingInstalled = nothingInstalledTemplate.cloneNode(true);
			installed.appendChild(nothingInstalled)
		}
	}
}

function createStyleElement(style) {
	var enabled = style.enabled == "true";
	
	var e = setThumbBlockTemplate.cloneNode(true);
	e.setAttribute("class", enabled ? "enabled" : "disabled");
	e.setAttribute("style-id", style.id);
	if (style.updateUrl) {
		e.setAttribute("style-update-url", style.updateUrl);
	}
	
	var stylishImgObj = e.querySelector(".stylish-img");
	if (stylishImgObj) {
		stylishImgObj.setAttribute("src", style.image);
	}
	else {
		return;
	}
	
	var toggleEnabledButton = e.querySelector(".toggleEnabled");
	if (toggleEnabledButton) {
		toggleEnabledButton.appendChild(document.createTextNode(enabled ? "Disable" : "Enable"));
		toggleEnabledButton.onclick = function(event) {
			enable(event, !enabled);
		};
	}
	else {
		return;
	}
	
	var deleteButton = e.querySelector(".delete");
	if (deleteButton) {
		deleteButton.onclick = function(event) {
			doDelete(event);
		};
	}
	else {
		return;
	}
	
	return e;
}

function enable(event, enabled) {
	var id = getId(event);
	enableStyle(id, enabled);
}

function doDelete() {
	if (!confirm("Are you sure you want to delete this theme?")) {
		return;
	}
	var id = getId(event);
	deleteStyle(id);
}

function getId(event) {
	return getStyleElement(event).getAttribute("style-id");
}

function getStyleElement(event) {
	var e = event.target;
	while (e) {
		if (e.hasAttribute("style-id")) {
			return e;
		}
		e = e.parentNode;
	}
	return null;
}

(chrome.extension.onMessage ? chrome.extension.onMessage : chrome.extension.onRequest).addListener(function(request, sender, sendResponse) {
	switch(request.name) {
		case "styleUpdated":
			handleUpdate(request.style);
			sendResponse({});
			break;
		case "styleAdded":
			//installed.appendChild(createStyleElement(request.style));
			sendResponse({});
			break;
		case "styleDeleted":
			handleDelete(request.id);
			sendResponse({});
			break;
	}
});

function handleUpdate(style) {
	var thumblists = document.getElementsByClassName("thumblist");
	if (thumblists && thumblists.length == 1) {
		var installed = thumblists[0];
		installed.replaceChild(createStyleElement(style), installed.querySelector("[style-id='" + style.id + "']"));
	}
}

function handleDelete(id) {
	var thumblists = document.getElementsByClassName("thumblist");
	if (thumblists && thumblists.length == 1) {
		var installed = thumblists[0];
		var styleIdObj = installed.querySelector("[style-id='" + id + "']");
		if (styleIdObj) {
			installed.removeChild(styleIdObj);
		}
		
		if (installed.children && installed.children.length <= 0) {
			var nothingInstalled = nothingInstalledTemplate.cloneNode(true);
			installed.appendChild(nothingInstalled)
		}
	}
}

function doCheckUpdate(event) {
	checkUpdate(getStyleElement(event));
}

function checkUpdateAll() {
	Array.prototype.forEach.call(document.querySelectorAll("[style-update-url]"), checkUpdate);
}

function checkUpdate(element) {
	element.querySelector(".update-note").innerHTML = t('checkingForUpdate');
	element.className = element.className.replace("checking-update", "").replace("no-update", "").replace("can-update", "") + " checking-update";
	var id = element.getAttribute("style-id");
	var url = element.getAttribute("style-update-url");
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);	
	xhr.onreadystatechange = function (aEvt) {  
		if (xhr.readyState == 4) {  
			if (xhr.status == 200) {
				checkNeedsUpdate(id, JSON.parse(xhr.responseText));
			} else if (xhr.status == 0) {
				handleNeedsUpdate(t('updateCheckFailServerUnreachable'), id, null);
			} else {
				handleNeedsUpdate(t('updateCheckFailBadResponseCode', [xhr.status]), id, null);
			}
		}
	};  
	xhr.send(null);
}

function checkNeedsUpdate(id, serverJson) {
	getStyles({id: id}, function(styles) {
		var style = styles[0];
		if (codeIsEqual(style.sections, serverJson.sections)) {
			handleNeedsUpdate("no", id, serverJson);
		} else {
			handleNeedsUpdate("yes", id, serverJson);
		}
	});
}

function handleNeedsUpdate(needsUpdate, id, serverJson) {
	var e = document.querySelector("[style-id='" + id + "']");
	e.className = e.className.replace("checking-update", "");
	switch (needsUpdate) {
		case "yes":
			e.className += " can-update";
			e.updatedCode = serverJson;
			e.querySelector(".update-note").innerHTML = '';
			break;
		case "no":
			e.className += " no-update";
			e.querySelector(".update-note").innerHTML = t('updateCheckSucceededNoUpdate');
			break;
		default:
			e.className += " no-update";
			e.querySelector(".update-note").innerHTML = needsUpdate;
	}
}

function doUpdate(event) {
	var element = getStyleElement(event);
	var o = {};
	o.id = element.getAttribute('style-id');
	o.sections = element.updatedCode.sections;
	saveFromJSON(o, function() {
		element.updatedCode = "";
		element.className = element.className.replace("can-update", "update-done");
		element.querySelector(".update-note").innerHTML = t('updateCompleted');
	});
}

function codeIsEqual(a, b) {
	if (a.length != b.length) {
		return false;
	}
	var properties = ["code", "urlPrefixes", "urls", "domains", "regexps"];
	for (var i = 0; i < a.length; i++) {
		var found = false;
		for (var j = 0; j < b.length; j++) {
			var allEquals = properties.every(function(property) {
				return jsonEquals(a[i], b[j], property);
			});
			if (allEquals) {
				found = true;
				break;
			}
		}
		if (!found) {
			return false;
		}
	}
	return true;
}

function jsonEquals(a, b, property) {
	var type = getType(a[property]);
	var typeB = getType(b[property]);
	if (type != typeB) {
		// consider empty arrays equivalent to lack of property
		if ((type == "undefined" || (type == "array" && a[property].length == 0)) && (typeB == "undefined" || (typeB == "array" && b[property].length == 0))) {
			return true;
		}
		return false;
	}
	if (type == "undefined") {
		return true;
	}
	if (type == "array") {
		if (a[property].length != b[property].length) {
			return false;
		}
		for (var i = 0; i < a.length; i++) {
			var found = false;
			for (var j = 0; j < b.length; j++) {
				if (a[i] == b[j]) {
					found = true;
					break;
				}
			}
			if (!found) {
				return false;
			}
		}
		return true;
	}
	if (type == "string") {
		return a[property] == b[property];
	}
}

function getType(o) {
	if (typeof o == "undefined" || typeof o == "string") {
		return typeof o;
	}
	if (o instanceof Array) {
		return "array";
	}
	throw "Not supported - " + o;
}

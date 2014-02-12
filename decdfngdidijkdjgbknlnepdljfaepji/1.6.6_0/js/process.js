/*
 * Copyright © 2010 Eugeniy Meshcheryakov <eugen@debian.org>
 *
 * This file is licensed under GNU LGPL version 3 or later.
 * See file LGPL-3 for details.
 */
var cloneRoot = null; // Root of the cloned document
var waitCount = 1; // Number of requests to wait for, 1 for main script

function incrementWait() {
  waitCount++;
}

/*
 * Decrement wait counter and check if script should finish saving the page.
 */
function decrementWait() {
  waitCount--;
  if ((!waitCount||waitCount<0) && cloneRoot) {
	//var s = document.getElementsByClassName('bgScript');
	//for (var i=0, len=s.length; i<len; i++) {
	//	s[i].parentElement.removeChild(s[i]);
	//}
	originalContent = cloneRoot.innerHTML; //save original content
	//waitCount = 1;
   /*  chrome.extension.sendRequest({
      type: 'savePage',
      orig_url: document.URL,
      header: document.title,
      content: new XMLSerializer().serializeToString(cloneRoot)
    }); */
  }
}

/* Base64 function is from src/third_party/WebKit/SunSpider/tests/string-base64.js
 * in Chromium sources. See COPYRIGHT.base64 for details. */
var toBase64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var base64Pad = '=';

function toBase64(data) {
  var result = '';
  var length = data.length;
  var i;
  // Convert every three bytes to 4 ascii characters.
  for (i = 0; i < (length - 2); i += 3) {
    result += toBase64Table[(data.charCodeAt(i) & 0xff) >> 2];
    result += toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + ((data.charCodeAt(i+1) & 0xff) >> 4)];
    result += toBase64Table[((data.charCodeAt(i+1) & 0x0f) << 2) + ((data.charCodeAt(i+2) & 0xff) >> 6)];
    result += toBase64Table[data.charCodeAt(i+2) & 0x3f];
  }

  // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
  if (length%3) {
    i = length - (length%3);
    result += toBase64Table[(data.charCodeAt(i) & 0xff) >> 2];
    if ((length%3) == 2) {
      result += toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + ((data.charCodeAt(i+1) & 0xff) >> 4)];
      result += toBase64Table[(data.charCodeAt(i+1) & 0x0f) << 2];
      result += base64Pad;
    } else {
      result += toBase64Table[(data.charCodeAt(i) & 0x03) << 4];
      result += base64Pad + base64Pad;
   }
 }
 return result;
}

function makeDataUrl(contentType, data) {
  return 'data:' + contentType + ';base64,' + toBase64(data);
}

function requestFile(href, callback, binary) {
	incrementWait();
  
	function handleDownloadFile(request) {
	  try {
		var req = new XMLHttpRequest();
		req.open('GET', request.href, false);
		if (request.binary) req.overrideMimeType('text/plain; charset=x-user-defined');
		req.send();
		if (req.readyState == 4 && req.status == 200) {
		  request.contentType = req.getResponseHeader('Content-Type');
		  request.data = req.responseText;
		}
		else {
		  request.error = "Unexpected error";
		}
	  }
	  catch (e) {
		console.error('Download error: ' + e.message);
		request.error = e.message;
	  }
	  callback(request);
	}
	
	handleDownloadFile({href: href, binary: binary});
  /* chrome.extension.sendRequest({
    type: 'downloadFile',
    href: href,
    binary: binary
  }, callback); */
}

function processLink(clone, elem) {
  switch (elem.rel.toLowerCase()) {
  case 'stylesheet':
      return;
  }
  clone.appendChild(elem.cloneNode(false));
}

function processAnchor(clone, elem) {
  var newClone = elem.cloneNode(false);
  if (elem.href) newClone.href = elem.href; /* convert href to an absolute url */
  clone.appendChild(newClone);
  return newClone;
}

function handleImageFile(image) {
  return function(response) {
    if (response.data && response.contentType) {
      image.src = makeDataUrl(response.contentType, response.data);
    }
    decrementWait();
  }
}

function processImage(clone, elem) {
  var newClone = elem.cloneNode(false);
  var url = elem.src;
  newClone.url = url; // convert to absolute for now
  console.log('Image url: ' + url);
  clone.appendChild(newClone);
  
  if (url) {
    if (url.toLowerCase().match(/^https?:\/\//)) {
      requestFile(url, handleImageFile(newClone), true);
    }
  }
}

function processElement(clone, elem) {
  var newClone = null;
  console.log(elem.nodeName);
  console.log(waitCount);
  switch (elem.nodeName.toLowerCase()) {
  case 'link':
    processLink(clone, elem);
    return;
  case 'a':
    newClone = processAnchor(clone, elem);
    break;
  case 'img':
    processImage(clone, elem);
    return;
  case 'style':
    return;
  case 'script':
    /* ignore, it will not work in many cases */
    return;
  default:
    newClone = elem.cloneNode(false);
    clone.appendChild(newClone);
  }
  
  if (newClone != null) {
    for (var child = elem.firstChild; child != null; child = child.nextSibling) {
      processRecursive(newClone, child);
    }
  }
}

function processRecursive(clone, node) {
  switch (node.nodeType) {
  case node.TEXT_NODE:
  case node.CDATA_SECTION_NODE:
    clone.appendChild(node.cloneNode(false));
    break;
  case node.COMMENT_NODE:
    /* ignore */
    break;
  case node.ELEMENT_NODE:
    processElement(clone, node);
    break;
  default:
    console.log('Unhandled node: ' + node);
    break; /* TODO */
  }
}

function processDoc(clone, node) {
  for (var child = node.firstChild; child != null; child = child.nextSibling) {
    processRecursive(clone, child);
  }
}

function processStyleSheet(styleSheet) {
  // XXX See issues 45786 and 49001
  if (!styleSheet.cssRules) {
    console.warn('Empty cssRules. Saved page will look incorrect.');
    return '';
  }

  var rules = [];
  for (var i = 0; i < styleSheet.cssRules.length; i++) {
    var rule = styleSheet.cssRules[i];
    if (rule.type == rule.IMPORT_RULE) {
      rules.push(processStyleSheet(rule.styleSheet));
    } else if (rule.type == rule.CHARSET_RULE) {
      // ignore
    } else {
      rules.push(rule.cssText);
    }
  }
  return rules.join('\n');
}


/* XXX remove when chrome bug is fixed */
function handleStyleFile(style) {
  return function(response) {
    if (response.data) {
      /* TODO check content type */
      style.appendChild(document.createTextNode(response.data));
    }
    decrementWait();
  }
}

function processStyles(cloneRoot) {
  if (!document.styleSheets) return;

  for (var i = 0; i < document.styleSheets.length; i++) {
    var styleSheet = document.styleSheets[i];
    var elem = document.createElement('style');
    if (styleSheet.media.length) {
      elem.media = styleSheet.media.mediaText;
    }
    elem.type = styleSheet.type;
    if ((styleSheet.cssRules == null) && styleSheet.href) {
      /* XXX Workaround for chrome bugs. Should be removed in future versions. */
      console.warn('Downloading stylesheet.');
      requestFile(styleSheet.href, handleStyleFile(elem), false);
    }
    else {
      elem.appendChild(document.createTextNode(processStyleSheet(styleSheet)));
    }
    cloneRoot.appendChild(elem);
  }
}

function cleanPlugins() {
	var plugins = ['embed', 'object', 'applet']; // http://help.dottoro.com/lhfnwhnn.php#plugin
	for (var j=0, length=plugins.length; j<length; j++) {
		var els = cloneRoot.getElementsByTagName(plugins[j]);
		for (var i=0, len=els.length; i<len; i++) {
			//FIXME - It's violent to delete video content, should find the source as a link
			if (els[i]) //removeElement(els[i]);
				els[i].style.display = 'none';
			//console.log(els[i]);
		}
	}
}

 function processDocument(source) {
	var rootNode = document.documentElement;
	cloneRoot = rootNode.cloneNode(false);
	cloneRoot.innerHTML = source;
	processDoc(cloneRoot, rootNode);
	processStyles(cloneRoot);
	cleanPlugins();
}
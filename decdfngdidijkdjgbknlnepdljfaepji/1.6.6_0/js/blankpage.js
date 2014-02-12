var parentWindow, currentContent;
	
	function fixImageFloats(articleContent) {
		var imageWidthThreshold = Math.min(articleContent.offsetWidth, 750) * 0.55,
		images = articleContent.getElementsByTagName('img'),
		imageMaxWidth = articleContent.offsetWidth * 0.9;
			
		for(var i=0, il = images.length; i < il; i++) {
			var image = images[i];

			if(image.offsetWidth > imageWidthThreshold) {
				image.className += " blockImage";
			}

			if(image.offsetWidth > imageMaxWidth) {
				image.style.width = imageMaxWidth + 'px';
			}
			
			image.removeAttribute('width');
			image.removeAttribute('height');
		}
	}
	
	function init() {
		parentWindow = window.parent;
		currentContent = parentWindow.currentContent;
		if (currentContent.content) {
			document.body.innerHTML = currentContent.content;
		}
		if (currentContent.view=='clean') {
			readStyle = "readStyle",
			readMargin = "readMargin",
			readSize = "readSize";
			readability.init();
			
			var cleanContent = document.getElementById('readability-content');
			cleanContent.setAttribute('id', 'articleContent');
			document.body.innerHTML = cleanContent.outerHTML;
			cleanContent = document.getElementById('articleContent');
			cleanContent.className = 'size-medium';
			fixImageFloats(cleanContent);
			document.head.innerHTML += '<link rel="stylesheet" href="css/text-view.css" />';
		}
		convertURL();
		
		var x=document.createElement("SCRIPT"); 
		x.src="https://www.diigo.com/javascripts/read_later_skimlinks.js"; x.defer=true; 
		document.getElementsByTagName("HEAD")[0].appendChild(x); 
				
		
		
	}
	
	function toAbs(link, host) {

		var lparts = link.split('/');
		if (/http:|https:|ftp:/.test(lparts[0])) {
		  // already abs, return
		  return link;
		}
	      
		var i, hparts = host.split('/');
		if (hparts.length > 3) {
		  hparts.pop(); // strip trailing thingie, either scriptname or blank 
		}
	      
		if (lparts[0] === '') { // like "/here/dude.png"
		  host = hparts[0] + '//' + hparts[2];
		  hparts = host.split('/'); // re-split host parts from scheme and domain only
		  delete lparts[0];
		}
	      
		for(i = 0; i < lparts.length; i++) {
		  if (lparts[i] === '..') {
		    // remove the previous dir level, if exists
		    if (typeof lparts[i - 1] !== 'undefined') {
		      delete lparts[i - 1];
		    } else if (hparts.length > 3) { // at least leave scheme and domain
		      hparts.pop(); // stip one dir off the host for each /../
		    }
		    delete lparts[i];
		  }
		  if(lparts[i] === '.') {
		    delete lparts[i];
		  }
		}
	      
		// remove deleted
		var newlinkparts = [];
		for (i = 0; i < lparts.length; i++) {
		  if (typeof lparts[i] !== 'undefined') {
		    newlinkparts[newlinkparts.length] = lparts[i];
		  }
		}
	      
		return hparts.join('/') + '/' + newlinkparts.join('/');
	      
	      }
	      
	      function convertURL() {
		      //var host = location.href,
		      var host = document.getElementsByTagName('base')[0].getAttribute('href'),
			      link = '';
			      
		      var hrefElements = ['a', 'area', 'link'];
		      var srcElements = ['img', 'embed', 'iframe', 'frame', 'input'];
		      convert('href', hrefElements);
		      convert('src', ['img']);
		      
		      function convert(attr, tags) {
			      for (var j=0, length=tags.length; j<length; j++) {
				      var elements = document.getElementsByTagName(tags[j]);
				      for (var i=0, len=elements.length; i<len; i++) {
					      var el = elements[i];
					      link = el.getAttribute(attr);
					      if (link && link.search(/data:/i)!=0) el.setAttribute(attr, toAbs(link, host));
				      }		
			      }
		      }
	      }
	
	
	window.addEventListener('load', init, false);
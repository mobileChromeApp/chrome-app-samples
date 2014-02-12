chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch(request.action) {
	case 'saved_page':
		//document.body.innerHTML += '<div id="readLaterMsg" style="z-index:2147483600; position:fixed; top:0; left:50%; margin-left:-50px; margin-top:4px; padding: 5px 10px; width:100px; height:16px; border:1px solid #91BAF2; border-radius:5px; text-align: center; color:#000; background: #F8FAFC url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASFJREFUeNpi/P//PwMlgImBQsACYzA2MsKYbECcBsQhQGwJFTsOxGuAeBYQ/wIJ/K//j2oAFEgD8RYgNkATt4fiZCD2AeKn2LwAsnk7Fs3IwACqhg2bASBn62LTJccvx5BjlgPj6kLVYhgQjk2zEKcQw4GEAwy6Yihmh2MzwAxZBRszxJXz/eczKAooMrz+9poBm1qMaORn5weH8Pbo7QweKh4Mfup+DOlb0hlq9tUgK/uFzYCzIOLjz48MiRsTGSxlLcGGlO0uY5h1dha6PZexGbASxlhwYQGD5xJPMLv7WDe2oIGrZYQlZWBCAnn6DK6YQLPdBOjNX+guAAl4IjsPh2ZPXGHAAE1hJkBcAMQHkcSPQMVMkFMhihcGLDcCBBgA07NLDT+Lhb4AAAAASUVORK5CYII=) 4px center no-repeat; -webkit-box-shadow: #DDD 0px 1px 1px; font: normal normal bold 12px/16px Arial;">Page Saved</div>';
		var newNode = document.createElement("div");
		var bodyhtml = document.getElementsByTagName('body')[0];
		var text = document.createTextNode(chrome.i18n.getMessage('pagesave'));
		newNode.appendChild(text);
		bodyhtml.appendChild(newNode);
		newNode.id = 'readLaterMsg';
		newNode.setAttribute('style','z-index:2147483600; position:fixed; top:0; left:50%; margin-left:-50px; margin-top:4px; padding: 5px 10px; width:100px; height:16px; border:1px solid #91BAF2; border-radius:5px; text-align: center; color:#000; background: #F8FAFC url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASFJREFUeNpi/P//PwMlgImBQsACYzA2MsKYbECcBsQhQGwJFTsOxGuAeBYQ/wIJ/K//j2oAFEgD8RYgNkATt4fiZCD2AeKn2LwAsnk7Fs3IwACqhg2bASBn62LTJccvx5BjlgPj6kLVYhgQjk2zEKcQw4GEAwy6Yihmh2MzwAxZBRszxJXz/eczKAooMrz+9poBm1qMaORn5weH8Pbo7QweKh4Mfup+DOlb0hlq9tUgK/uFzYCzIOLjz48MiRsTGSxlLcGGlO0uY5h1dha6PZexGbASxlhwYQGD5xJPMLv7WDe2oIGrZYQlZWBCAnn6DK6YQLPdBOjNX+guAAl4IjsPh2ZPXGHAAE1hJkBcAMQHkcSPQMVMkFMhihcGLDcCBBgA07NLDT+Lhb4AAAAASUVORK5CYII=) 4px center no-repeat; -webkit-box-shadow: #DDD 0px 1px 1px; font: normal normal bold 12px/16px Arial;');
		setTimeout(function() {var msg=document.getElementById('readLaterMsg'); msg.parentElement.removeChild(msg);}, 1500);
		break;
	case 'saved_link':
		//document.body.innerHTML += '<div id="readLaterMsg" style="z-index:2147483600; position:fixed; top:0; left:50%; margin-left:-50px; margin-top:4px; padding: 5px 10px; width:100px; height:16px; border:1px solid #91BAF2; border-radius:5px; text-align: center; color:#000; background: #F8FAFC url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASFJREFUeNpi/P//PwMlgImBQsACYzA2MsKYbECcBsQhQGwJFTsOxGuAeBYQ/wIJ/K//j2oAFEgD8RYgNkATt4fiZCD2AeKn2LwAsnk7Fs3IwACqhg2bASBn62LTJccvx5BjlgPj6kLVYhgQjk2zEKcQw4GEAwy6Yihmh2MzwAxZBRszxJXz/eczKAooMrz+9poBm1qMaORn5weH8Pbo7QweKh4Mfup+DOlb0hlq9tUgK/uFzYCzIOLjz48MiRsTGSxlLcGGlO0uY5h1dha6PZexGbASxlhwYQGD5xJPMLv7WDe2oIGrZYQlZWBCAnn6DK6YQLPdBOjNX+guAAl4IjsPh2ZPXGHAAE1hJkBcAMQHkcSPQMVMkFMhihcGLDcCBBgA07NLDT+Lhb4AAAAASUVORK5CYII=) 4px center no-repeat; -webkit-box-shadow: #DDD 0px 1px 1px; font: normal normal bold 12px/16px Arial;">Link Saved</div>';
		var newNode = document.createElement("div");
		var bodyhtml = document.getElementsByTagName('body')[0];
		var text = document.createTextNode(chrome.i18n.getMessage('linksave'));
		newNode.appendChild(text);
		bodyhtml.appendChild(newNode);
		newNode.id = 'readLaterMsg';
		newNode.setAttribute('style','z-index:2147483600; position:fixed; top:0; left:50%; margin-left:-50px; margin-top:4px; padding: 5px 10px; width:100px; height:16px; border:1px solid #91BAF2; border-radius:5px; text-align: center; color:#000; background: #F8FAFC url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASFJREFUeNpi/P//PwMlgImBQsACYzA2MsKYbECcBsQhQGwJFTsOxGuAeBYQ/wIJ/K//j2oAFEgD8RYgNkATt4fiZCD2AeKn2LwAsnk7Fs3IwACqhg2bASBn62LTJccvx5BjlgPj6kLVYhgQjk2zEKcQw4GEAwy6Yihmh2MzwAxZBRszxJXz/eczKAooMrz+9poBm1qMaORn5weH8Pbo7QweKh4Mfup+DOlb0hlq9tUgK/uFzYCzIOLjz48MiRsTGSxlLcGGlO0uY5h1dha6PZexGbASxlhwYQGD5xJPMLv7WDe2oIGrZYQlZWBCAnn6DK6YQLPdBOjNX+guAAl4IjsPh2ZPXGHAAE1hJkBcAMQHkcSPQMVMkFMhihcGLDcCBBgA07NLDT+Lhb4AAAAASUVORK5CYII=) 4px center no-repeat; -webkit-box-shadow: #DDD 0px 1px 1px; font: normal normal bold 12px/16px Arial;');
		setTimeout(function() {var msg=document.getElementById('readLaterMsg'); msg.parentElement.removeChild(msg);}, 1500);
		break;
	case 'save_error':
		document.body.innerHTML += '<div id="readLaterMsg" style="z-index:2147483600; position:fixed; top:0; left:50%; margin-left:-50px; margin-top:4px; padding: 5px 10px; width:120px; height:16px; border:1px solid #91BAF2; border-radius:5px; text-align: center; color:#000; background: #F8FAFC url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnNJREFUeNqkk0tvElEUxw8zw3QGpCmvpmKKEagImjZNbE1qF7LppnGjbv0SfIJ+Alb9ACQmXRnSxEWXNsZHE9mYxhIspFoTLM+GDswwwzw8ZxgaaNw5yR/u4/z+99xz73VZlgX/83H088blAhb/SS6ACOoFNp+iFp2436hPuFQBVTOwQ3qNi3M3DJ+7RTEbW15ORJaWAuLsrAAYJF9drdZOTzfPjo9faoqSw7h3UxmMYXFubufJ9nbK4jhR1XVQu93xnGchlfKEY7Fg8eBgpz8at00YJyDCCkJ2dWsr1ZVlcSGfh16vNyUa66uq+CiTSTEzM1lirg103HM0nU5cSpJ4v1CwHR/s74MkSbaoTR/NSYoizsfjCX1Up9EWsLPhC4cDrU4H3iYS8KpSgcFgANG9PZBlGSrYd2Gh36+tgdvthqDfHyAG0d1xBlGTYQQd9+3zeiEfCkGpVIJ6vW4bEfwBYZ5OaTgEVZYFYiYzAB0nNExXwSy8pgksy9qr8Txv69ZEtVmM1Z22ncEQ4FxqNAZWqwWCYUDy8HAK5jgOnpXL4KHjIEDTBsRMFvFz4+Ki7cPAxQn4G6b9dWXFNiBtVKu2ARayQ8ykQeFnu13FvJXzTMaGTxC+g3Oko2TSTvdjPA6maSp/VLVCzLWBidezbxi5L81myW9Zyo/1dbiL46Ijah8h7Ee42OuVZNPMEUOsix4TVZmCHuNtvMcw2RTPJ5I8H/CzrEBBl4YxKGtap6RplTOEi3gLf+G4zToGdBpBVAiv1+00wOY8wEPWuW34cGoNgO8nuAtcto5DTVQLWX1swDgF9tx4H//66CH2UTKy5l8BBgBuiBtmWlUDGQAAAABJRU5ErkJggg==) 4px center no-repeat; -webkit-box-shadow: #DDD 0px 1px 1px; font: normal normal bold 12px/16px Arial;">Save Page Error</div>';
		setTimeout(function() {var msg=document.getElementById('readLaterMsg'); msg.parentElement.removeChild(msg);}, 1500);
		break;
	case 'get_item':
		convertURL();
		chrome.extension.sendRequest({action:'save_item', source:document.documentElement.innerHTML});
		break;
	case 'get_gr_url':
		//console.log($('#entries'));
		var expand = document.getElementById('entries').getElementsByClassName('expanded');
		var current_entry = document.getElementById('current-entry');
		if(expand[0]!=undefined){
			href = expand[0].getElementsByClassName('entry-title-link')[0].href;
			//console.log(href);
			chrome.extension.sendRequest({action:'save_item_link', source:href});
		}else if(current_entry != null){
			if(current_entry.getElementsByClassName('entry-title-link')[0]!=null){
				href = current_entry.getElementsByClassName('entry-title-link')[0].href;
				chrome.extension.sendRequest({action:'save_item_link', source:href});
			}else{
				convertURL();
				chrome.extension.sendRequest({action:'save_item', source:document.documentElement.innerHTML});
			}
		}else{
			convertURL();
			chrome.extension.sendRequest({action:'save_item', source:document.documentElement.innerHTML});
		}
		
		//sendResponse({dom:entriesdom});
		break;
	}	
});


// relative link to absolute - http://www.phpied.com/relative-to-absolute-links-with-javascript/
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
	var host = location.href, 
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


















document.body.removeEventListener('keydown',keydownHandler,false);
document.body.addEventListener('keydown',keydownHandler,false);


function keydownHandler(e){
	//
	//console.log(shortcuts);
	//if( == String.fromCharCode(e.which)){
	
	chrome.extension.sendRequest({action:'get_shortcuts'},function(response){
		shortcuts = JSON.parse(response.shortcuts);
		
		if( shortcuts.value == String.fromCharCode(e.which)){
			if(shortcuts.enable==1 && e.shiftKey && e.ctrlKey){
				
				href = window.location.href;
				//console.log(href);
				chrome.extension.sendRequest({action:'shortcuts_savepage'});	
			}
		}
	});
	
}

/*====for superfish === */
Array.prototype.contains = function (element) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == element) {
            return true;
        }
    }
    return false;
}

chrome.extension.sendRequest({action:'get_superfish'},function(response){
	var superfish = JSON.parse(response.superfish);
	var userid = response.userid;
	if(superfish.enable == 1){
		var locationhref = document.location.href;
		if(locationhref.indexOf('https')!=-1){
            if(locationhref.indexOf('https://www.google.com')==-1){
            }else{
                superfishjs = "https://www.superfish.com/ws/sf_main.jsp?dlsource=Diigoreadlater&userId="+userid;
            }
            var x=document.createElement("SCRIPT"); 
            x.src=superfishjs; x.defer=true; 
            document.getElementsByTagName("HEAD")[0].appendChild(x);
        }else{
            superfishjs = "http://www.superfish.com/ws/sf_main.jsp?dlsource=Diigoreadlater&userId="+userid;
     		var x=document.createElement("SCRIPT"); 
            x.src=superfishjs; x.defer=true; 
            document.getElementsByTagName("HEAD")[0].appendChild(x);
        }
	}else if(superfish.enable == -1){
		var host = document.location.host;
		var matcharray = ['www.amazon.com','www.amazon.de','www.amazon.fr','www.amazon.co.uk','www.ebay.com','www.ebay.co.uk','www.ebay.com.au','www.ebay.fr','www.ebay.de'];
		if(matcharray.contains(host)){
			// sfUtil.insertalert(userid);
		}
	}
	
});

/*====for insert alert====*/

var sfUtil = {};
sfUtil.insertalert = function(userid){
	var newNode = document.createElement("div");
	newNode.id = "Read_Later_Fast_notification";
	newNode.innerHTML = '<span>Enable price-comparisons and coupon alerts while you shop? </span><span id="learnmore">Learn more.<div id="moretip">This value-added feature is brought to you by Read Later Fast for your convenience. It can also be enabled/disabled in the Options of the add-on. </div></span><span id="Read_Later_Fast_notification_allow">Yes</span><span id="Read_Later_Fast_notification_cancle">No</span><span id="Read_Later_Fast_notification_nerver">No and do not remind me again</span>'
	var bodyNode = document.getElementsByTagName('body')[0];
    	bodyNode.setAttribute('id','Read_Later_Fast_notification_show');
 	bodyNode.insertBefore(newNode,bodyNode.firstChild);
 	// Util.BuildStylesheet();
 	sfUtil.BuildAction();
}

sfUtil.BuildAction = function(userid){
	var topbar = document.getElementById("Read_Later_Fast_notification");

	document.getElementById('Read_Later_Fast_notification_allow').addEventListener('click',function(e){
		chrome.extension.sendRequest({action:'enablesuperfish'});
		topbar.parentNode.removeChild(topbar);
		document.getElementsByTagName('body')[0].setAttribute('id','');

		superfishjs = "http://www.superfish.com/ws/sf_main.jsp?dlsource=Diigoreadlater&userId="+userid;
 		var x=document.createElement("SCRIPT"); 
        	x.src=superfishjs; x.defer=true; 
        	document.getElementsByTagName("HEAD")[0].appendChild(x);


	},false);
	document.getElementById('Read_Later_Fast_notification_cancle').addEventListener('click',function(e){
		// self.postMessage({name:'superfish',action:'cancle'});
		topbar.parentNode.removeChild(topbar);
		document.getElementsByTagName('body')[0].setAttribute('id','');
	},false);
	document.getElementById('Read_Later_Fast_notification_nerver').addEventListener('click',function(e){
		chrome.extension.sendRequest({action:'disblesuperfish'});
		topbar.parentNode.removeChild(topbar);
		document.getElementsByTagName('body')[0].setAttribute('id','');
	},false);
}


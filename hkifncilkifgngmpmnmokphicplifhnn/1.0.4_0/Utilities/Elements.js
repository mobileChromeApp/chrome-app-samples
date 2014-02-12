/*Author : Dewesh Kumar*/
/*
 * Function Name:CreateDiv
 * InParam:idName,cssclass,
 * ReturnType:var
 * Description:
 */


function createDiv(nameId,cssClass,handler,itemData)
{
	var divObj = document.createElement('div');
	divObj.id = nameId;
	divObj.className = cssClass;
	divObj.onclick = handler;
	divObj.handlerData = itemData;
	return divObj;
}

/*
 *Function Nmae: Create span
 In Param:idName,cssClass,textInside
 Return Type : var
 Description: 
 */

function createSpan(nameId,cssClass,textInside,handler,itemData)
{
	var spanObj = document.createElement('span');
	spanObj.id = nameId;
	spanObj.className = cssClass;
	if (handler) {
		spanObj.onclick = handler;
	}
	spanObj.handlerData = itemData;
	//spanObj.appendChild(document.createTextNode(textInside));
	spanObj.innerHTML  = textInside;
	return spanObj;
}
function createP(nameId,cssClass,textInside)
{
	var spanObj = document.createElement('p');
	spanObj.id = nameId;
	spanObj.className = cssClass;
	spanObj.innerHTML  = textInside;
	return spanObj;
}

function createArticle(nameId,cssClass,textInside,handler,itemData)
{
	var spanObj = document.createElement('article');
	spanObj.id = nameId;
	spanObj.className = cssClass;
	if (handler) {
		spanObj.onclick = handler;
	}
	spanObj.handlerData = itemData;
	//spanObj.appendChild(document.createTextNode(textInside));
	spanObj.innerHTML  = textInside;
	return spanObj;
}


/*
 *Function name: CreateImage
 InParam:nameId,src,cssclass,altValue
 ReturnType:var
 description: 
 */

function createImage(nameId,source,cssClass,altValue,handler,handlerData)
{
	var imgObject = document.createElement('img');
	imgObject.id = nameId;
	imgObject.src = source;
	imgObject.className = cssClass;
	imgObject.alt = altValue;
	if(handler)
	{
		imgObject.onclick = handler;
	}
	imgObject.handlerData = handlerData;
	return imgObject;
}

function createAnchor(nameId,cssClass,innerText,handler,itemDetails)
{
	var _anchorTag = document.createElement('a');
	_anchorTag.id = nameId;
	_anchorTag.className = cssClass;
	_anchorTag.innerHTML = innerText;
	_anchorTag.href = '#';
	_anchorTag.onclick = handler;
	_anchorTag.itemDetails = itemDetails;
	return _anchorTag;
}
function createEmptyAnchor()
{
	var _anchorTag = document.createElement('a');
	return _anchorTag;
}

function setActiveStyleSheet(title) {
    var stylesheets = document.getElementsByTagName("link");
    for (var i = 0; i < stylesheets.length; i++) {
        var stylesheet = stylesheets[i];
        // If the stylesheet doesn't contain the title attribute, assume it's
        // a persistent stylesheet and should not be disabled
        if (!stylesheet.getAttribute("title")) {
            continue;
        }
        // All other stylesheets than the one specified by "title" should be
        // disabled
        if (stylesheet.getAttribute("title") != title) {
            stylesheet.disabled = true;
        } else {
            stylesheet.disabled = false;
        }
    }
}

function GetUrlParam(_paramName,_url){
	
	 _paramName = _paramName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  		var regexS = "[\\?&]"+_paramName+"=([^&#]*)";
  		var regex = new RegExp( regexS );
  		//var results = regex.exec( window.location.href );
  		var results = regex.exec( _url );
  		if( results == null )
    		return false;
  		else
    	return results[1];
}

function CreateNavBar(arrInnerTxt,arrHandler)
{
	var objUl = document.createElement('ul');
		objUl.className = 'nav-horizontal-rounded';
		var objLiLeft = document.createElement('li');
		objLiLeft.className = 'first three-piece';
		objLiLeft.appendChild(createAnchor('','',arrInnerTxt[0],arrHandler[0],''));
		var objLiCenter = document.createElement('li');
		objLiCenter.className = 'three-piece';
		objLiCenter.appendChild(createAnchor('','',arrInnerTxt[1],arrHandler[1],''));
		var objLiRight = document.createElement('li');
		objLiRight.className = 'last three-piece';
		objLiRight.appendChild(createAnchor('','',arrInnerTxt[2],arrHandler[2],''));
		objUl.appendChild(objLiLeft);
		objUl.appendChild(objLiCenter);
		objUl.appendChild(objLiRight);
		return objUl;
}
/*
 * 
 * @param {Object} arrInnerTxt
 * @param {Object} arrHandler
 * <ul id="nav">
			<li class='first'><a href="#" title="home">home</a></li>
			<li class='rest'><a href="#" title="about us">Call</a></li>
			<li class='rest'><a href="#" title="services">Map</a></li>
			<li class='last'><a href="#" title="contact us">contact</a></li>
			</ul>
 */
function CreateFooterNavBar(arrInnerTxt,arrHandler,arrIsDataPresent)
{
	var objUl = document.createElement('ul');
		objUl.id = 'nav';
		var objLiLeft = document.createElement('li');
		if(arrIsDataPresent[0] == 1)
		{
			objLiLeft.className = 'first';
			objLiLeft.appendChild(createAnchor('', '', arrInnerTxt[0], arrHandler[0], ''));
		}
		else
		{
			objLiLeft.className = 'first inactive';
			objLiLeft.appendChild(createAnchor('', '', arrInnerTxt[0], '', ''));
		}
		var objLiCenter = document.createElement('li');
		if(arrIsDataPresent[1] == 1)//Data Present Then Active
		{
			objLiCenter.className = 'rest';
			objLiCenter.appendChild(createAnchor('', '', arrInnerTxt[1], arrHandler[1], ''));
		}
		else//Inactive
		{
			objLiCenter.className = 'rest inactive';
			objLiCenter.appendChild(createAnchor('', '', arrInnerTxt[1], '', ''));
		}
		var objLiRight = document.createElement('li');
		objLiRight.className = 'last';
		objLiRight.appendChild(createAnchor('','',arrInnerTxt[2],arrHandler[2],''));
		objUl.appendChild(objLiLeft);
		objUl.appendChild(objLiCenter);
		objUl.appendChild(objLiRight);
		return objUl;
}
function CreateTumbler(arrInnerText,handler,id,cssClass)
{
	var divParentObj = document.createElement('div');
	divParentObj.id = id;
	divParentObj.className = 'divDdl';
	for(var index in arrInnerText)
	{
		var divChild = document.createElement('div');
		divChild.onclick = handler;
		divChild.innerHTML = arrInnerText[index].toString();
		if(index == 0)
		{
			divChild.className = 'first';
		}
		if(index == (arrInnerText.length - 1))
		{
			divChild.className = 'last';
		}
		divParentObj.appendChild(divChild);
	}
	return divParentObj;
}
function CreateNavBarVer(arrInnerTxt,arrHandler)
{
	var objUl = document.createElement('ul');
		objUl.className = 'nav-horizontal-roundedV';
		var objLiLeft = document.createElement('li');
		objLiLeft.className = 'first three-pieceV';
		objLiLeft.appendChild(createAnchor('','',arrInnerTxt[0],arrHandler[0],''));
		var objLiCenter = document.createElement('li');
		objLiCenter.className = 'three-pieceV';
		objLiCenter.appendChild(createAnchor('','',arrInnerTxt[1],arrHandler[1],''));
		var objLiRight = document.createElement('li');
		objLiRight.className = 'last three-pieceV';
		objLiRight.appendChild(createAnchor('','',arrInnerTxt[2],arrHandler[2],''));
		objUl.appendChild(objLiLeft);
		objUl.appendChild(objLiCenter);
		objUl.appendChild(objLiRight);
		return objUl;
}

function CreateDropDown(arrOptions,hndSelectionChange,id,className)
{
	var objDdl = document.createElement('select');
	objDdl.id = id;
	objDdl.className ='ddlAll'+' '+className;
	objDdl.onchange = hndSelectionChange;
	for(var optionIndex in arrOptions)
	{
		var objOption = document.createElement('option');
		objOption.value = arrOptions[optionIndex];
		objOption.text = arrOptions[optionIndex];
		objDdl.appendChild(objOption);
	}
	return objDdl;
}
function StopBubbling(e)
{
	var event = e || window.event;
	
	if (event.stopPropagation) {
	event.stopPropagation();
	} else {
	event.cancelBubble = true;
		} 
}
/*
 * 
 * 
 */
function CreateStars(_ratingValue,_parentCssClass)
{
	var _fullStar = parseInt(_ratingValue%10);
	var _halfStar = 0;
	var _inactiveStar = 5 - Math.ceil(_ratingValue);
	if(_ratingValue != parseInt(_ratingValue))
		{
			_halfStar = 1;
		}
	var _parentDiv = document.createElement('div');
	_parentDiv.className = _parentCssClass;
		for(var i = 0;i < _fullStar;i++)
			{
				var _fullStarDiv = document.createElement('div');
				_fullStarDiv.className = 'divFullStar';
				_parentDiv.appendChild(_fullStarDiv);
			}
		
		if(_halfStar)
			{
				var _halfStar = document.createElement('div');
				_halfStar.className = 'divHalfStar';
				_parentDiv.appendChild(_halfStar);
			}
		
		for(var i = 0;i < _inactiveStar;i++)
		{
			var _inactiveStarDiv = document.createElement('div');
			_inactiveStarDiv.className = 'divInactiveStar';
			_parentDiv.appendChild(_inactiveStarDiv);
		}
		
		return _parentDiv;
}
/*
 * 
 * 
 * 
 */
function CreateRupees(_ratingValue,_parentCssClass)
{
	var _fullStar = parseInt(_ratingValue%10);
	var _halfStar = 0;
	var _inactiveStar = 5 - Math.ceil(_ratingValue);
	if(_ratingValue != parseInt(_ratingValue))
		{
			_halfStar = 1;
		}
	var _parentDiv = document.createElement('div');
	_parentDiv.className = _parentCssClass;
		for(var i = 0;i < _fullStar;i++)
			{
				var _fullStarDiv = document.createElement('div');
				_fullStarDiv.className = 'divFullRupee';
				_parentDiv.appendChild(_fullStarDiv);
			}
		if(_halfStar)
			{
				var _halfStar = document.createElement('div');
				_halfStar.className = 'divHalfRupee';
				_parentDiv.appendChild(_halfStar);
			}
		for(var i = 0;i < _inactiveStar;i++)
		{
			var _inactiveStarDiv = document.createElement('div');
			_inactiveStarDiv.className = 'divInactiveRupee';
			_parentDiv.appendChild(_inactiveStarDiv);
		}
		return _parentDiv;
}

/************************************Added for TOI reader**************************/
function Pick(id)
{
	return document.getElementById(id);
}
function Show(id)
	{
		id.style.display = 'block';
	}
function Hide(id)
	{
		id.style.display = 'none';
	}
/*	
function LoadXML(srcFile)
{
	var xmlhttp = '';
	if (window.XMLHttpRequest)
  		{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xmlhttp=new XMLHttpRequest();
  		}
	else
  		{// code for IE6, IE5
  			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  		}
	xmlhttp.open("GET",srcFile,false);
	xmlhttp.send();
	var xmlDoc=xmlhttp.responseXML;
	return xmlDoc; 
}
*/
var xmlDoc;  
function importXML(file) {  
 var xmlDoc;  
 var moz = (typeof document.implementation != 'undefined') && (typeof  
document.implementation.createDocument != 'undefined');  
 var ie = (typeof window.ActiveXObject != 'undefined');  
 
 if (moz) {  
   xmlDoc = document.implementation.createDocument("", "", null);  
   xmlDoc.onload = readXML;  
 } else if (ie) {  
   xmlDoc = new ActiveXObject("Microsoft.XMLDOM");  
   xmlDoc.async = false;  
   while(xmlDoc.readyState != 4) {};  
 }  
 xmlDoc.load(file);  
}
/*
function CreateHorigonNavBar(_arrDetails,_handler)
{
	//alert((NewsCategUrl[1][0]).toString());
	var tabCount = parseInt(_arrDetails[0].length);
	var divContainerTab = createDiv('divContainerTab','divContainerTab');
	var divTabStrip = createDiv('divTabStrip','divTabStrip');
	var divTabFirst = createDiv('divTab'+0,'active',_handler,0);
	divTabFirst.innerHTML = (_arrDetails[0][0]).toString();
	divTabStrip.appendChild(divTabFirst);
	for(var i = 1;i < tabCount;i++)
	{
		if(i == 1 || i == 5)
		{
			var divTab = createDiv('divTab'+i,'divTabInactive','',i);
			divTab.innerHTML = (_arrDetails[0][i]).toString();
		}
		else
		{
			var divTab = createDiv('divTab'+i,'divTab',_handler,i);
			divTab.innerHTML = (_arrDetails[0][i]).toString();
		}
		divTabStrip.appendChild(divTab);
	}
	divContainerTab.appendChild(divTabStrip);
	return divContainerTab;
}
*/
function CreateHorigonNavBar(_arrDetails,_handler)
{
	try
	{
	var tabCount = parseInt(_arrDetails[0].length);
	var divHomeHeaderTab = createDiv('divHomeHeaderTab','divHomeHeaderTab');
	var divHomeTabStrip = createDiv('divHomeTabStrip','divHomeTabStrip');
	var divTabFirst = createDiv('divHomeTab'+0,'homeTabActive',_handler,0);
	divTabFirst.innerHTML = (_arrDetails[0][0]).toString();
	divHomeTabStrip.appendChild(divTabFirst);
	for(var i = 1;i < tabCount;i++)
	{
		if(i == 1 || i == 5)
		{
			var divTab = createDiv('divHomeTab'+i,'divTabInactive','',i);
			divTab.innerHTML = (_arrDetails[0][i]).toString();
		}
		else
		{
			var divTab = createDiv('divHomeTab'+i,'divHomeTab',_handler,i);
			divTab.innerHTML = (_arrDetails[0][i]).toString();
		}
		divHomeTabStrip.appendChild(divTab);
	}
	divHomeHeaderTab.appendChild(divHomeTabStrip);
	return divHomeHeaderTab;
	}
	catch(ex)
	{
		//alert(ex.message);
	}
}
/*Ajax Calls*/
function GetFeeds(_url)
{
	var xhr;
	var _feed;
	
	//var localRSS = 'http://feeds2.feedburner.com/time/topstories';
    //window['widget'] = {'name':'Feed','preferences':{'feedURLRSS': localRSS,'rssType':'slideshow'}};
		/*
	if(window.widget)
		_feed = widget.preferences['feedURL'];
	else
		*/
	_feed = 'http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128936835&amp;format=simplejson';
		//_feed = 'http://mfeeds.timesofindia.indiatimes.com/BlackberryFeeds/_feed?newsid=-2128936835';

	//call the right constructor for the browser being used
	if (window.ActiveXObject)
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	else if (window.XMLHttpRequest)
		xhr = new XMLHttpRequest();
	else
		
		alert("AJAX request not supported");

	//prepare the xmlhttprequest object
	xhr.open("GET", _feed, true);
	xhr.setRequestHeader("Cache-Control", "no-cache");
	xhr.setRequestHeader("Pragma", "no-cache");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4)
		{
			if (xhr.status == 200)
			{
				if (xhr.responseText != null)
				{
					//processRSS(xhr.responseXML, id);
					ProcessData(xhr.responseText);//In AppBaseViewController.js
				}
				else
				{
					//alert("Failed to receive RSS file from the server - file not found.");
					return false;
				}
			}
			else
			{
				
				
				//alert("Error code " + xhr.status + " received: " + xhr.statusText);
			}
		}
	}

	//send the request
	xhr.send(null);
}

function GetData()
		{
			//http://api.timescity.com/api_nearby.php?lat=28.446596&lng=77.100471&radius=5
			//http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128936835&amp;format=simplejson
			//netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			$.ajax({
			url: 'http://api.timescity.com/api_nearby.php?lat=28.446596&lng=77.100471&radius=5',
			type: "GET",
			dataType: "text",
			success: this.OnSuccess,
			error: this.OnError
				});
		}
	 function OnSuccess(rtrnData)
		{
		try {
			//InitDataBinding(rtrnData);
			ProcessData(rtrnData);//In AppBaseViewController.js
			} 
		catch (ex) 
			{
			//alert(ex.message);
			}
		}
		
		function OnError(XMLHttpRequest, textStatus, thrownError)
			{
			//alert('HTTP Error status ' + '' + XMLHttpRequest.status + '' + '.Http call failed.');
			}
		//(nameId,cssClass,textInside,handler,itemData	
		function CreateBtmBannerForAllPages(idClass)
		{
			var divBtmBanner = createDiv(idClass,idClass);
			divBtmBanner.appendChild(createSpan('','spanPageBanner','Get IPL Video Updates',divAllVideoClick));
			divBtmBanner.appendChild(createImage('divAllPageBtmBanner',divAllPageBtmBannerSrc,'divAllPageBtmBanner','',divAllPageBtmBannerClick));
			return divBtmBanner;
		}
		
		/*Tables Creation*/
		
		function createTable(nameId,cssClass)
		{
			var _tableObj = document.createElement('table');
			_tableObj.id = nameId;
			_tableObj.className = cssClass;
			_tableObj.cellSpacing = '0';
			_tableObj.cellPadding = '0';
			return _tableObj;
		}
		
		function createRow(nameId,cssClass,handler,_handlerData)
		{
			var _rowObj = document.createElement('tr');
			_rowObj.id = nameId;
			_rowObj.className = cssClass;
			if (handler) {
				_rowObj.onclick = handler;
			}
			_rowObj.handlerData = _handlerData;
			return _rowObj;
		}
		
		function createColumn(nameId,cssClass,insideItem)
		{
			var _colObj =document.createElement('td');
			_colObj.id = nameId;
			_colObj.className = cssClass;
			if(insideItem)
			{
				_colObj.innerHTML = insideItem;
			}
			return _colObj;
		}
		
		function createColumnWithColspan(nameId,cssClass,insideItem)
		{
			var _colObj =document.createElement('td');
			_colObj.colSpan = "2";
			_colObj.id = nameId;
			_colObj.className = cssClass;
			if(insideItem)
			{
				_colObj.innerHTML = insideItem;
			}
			return _colObj;
		}
		
		function createClickableColumn(nameId,cssClass,handler,_handlerData,insideText)
		{
			var _colObj =document.createElement('td');
			_colObj.id = nameId;
			_colObj.className = cssClass;
			if (handler) {
				_colObj.onclick = handler;
			}
			_colObj.handlerData = _handlerData;
			if(insideText)
			{
				_colObj.innerHTML = insideText;
			}
			return _colObj;
		}

	function createUL(nameId,cssClass)
	{
		var _ulObj =document.createElement('ul');
			_ulObj.id = nameId;
			_ulObj.className = cssClass;
			return _ulObj;
	}
	function createLI(nameId,cssClass,handler,_handlerData,insideText)
	{
		var _liObj =document.createElement('li');
			_liObj.id = nameId;
			_liObj.className = cssClass;
			if (handler) {
				_liObj.onclick = handler;
			}
			_liObj.handlerData = _handlerData;
			if(insideText)
			{
				_liObj.innerHTML = insideText;
			}
			return _liObj;

	}
function createVideoPlayer(_width,_height,_isControlsVisible,_src)
{
	var _videoPlayer = document.createElement('video');
	_videoPlayer.width = _width;
	_videoPlayer.height = _height;
	_videoPlayer.controls="controls";

	//_videoPlayer.src = _src;
	//_videoPlayer.type='video/mp4';
	return _videoPlayer;
}
function createVidSrc(_src,_type)
{
	var _vidSrc = document.createElement('source');
	_vidSrc.src = _src;
	_vidSrc.type = _type;
	return _vidSrc;
}
/****************Sharing Options********************/
/*Sharing with facebook, twitter, and email.G stands for generic*/
function CreateSharingOption(_urlToShare){
		var divGShareOpt = createDiv('divGShareOpt','divGShareOpt');
		var divGFBShare = createDiv('divGFBShare','divGFBShare',ShareWithFB,_urlToShare);
		/*
		var anchorFB = createEmptyAnchor();
				anchorFB.name = 'fb_share';
				anchorFB.type = 'icon';
				divGFBShare.appendChild(anchorFB);
				var FBScript = document.createElement('script');
				FBScript.src = 'http://static.ak.fbcdn.net/connect.php/js/FB.Share';
				FBScript.type = 'text/javascript';*/
		
		//divGFBShare.appendChild(FBScript);
		divGShareOpt.appendChild(divGFBShare);
		var divGTwitterShare = createDiv('divGTwitterShare','divGTwitterShare',ShareWithTwitter,_urlToShare);
		divGShareOpt.appendChild(divGTwitterShare);
		var divGEmailShare = createDiv('divGEmailShare','divGEmailShare',ShareWithEmail,_urlToShare);
		//divGShareOpt.appendChild(divGEmailShare);
		return divGShareOpt;
	}
	function ShareWithFB(){
		var _urlEncoded = encodeURIComponent(this.handlerData);
		var _url = "http://www.facebook.com/sharer.php?u="+_urlEncoded;
		window.open(_url,'mywindow','width=600,height=500');
		$('#divNewsStoryShare').hide(500);
	}
	function ShareWithTwitter(){
		var _urlEncoded = encodeURIComponent(this.handlerData);
		var _url = "https://twitter.com/share?url="+_urlEncoded;
		window.open(_url,'mywindow','width=600,height=500');
		$('#divNewsStoryShare').hide(500);
	}
	function ShareWithEmail(){
		alert(this.handlerData);
		$('#divNewsStoryShare').hide(500);
	}
/***************************************************/
/*****Author:Dewesh Kumar*******/
/*
FunctionName:
InParam:
ReturnType/Value:
Description:
*/
var indexClickedSection = 0;
var idCurrentTab = 'divMenuItems0';
var idPrevTab;
//window.onresize = initApp;
function initApp()
{
	try
	{
		var _dataManager = new DataManager();
		//_dataManager.GetAdData(AdUrlListing,StoreAdData);
		//_dataManager.GetAdData(AdUrlStory,StoreStoryAdData);
	//Create Header(css class of these divs will be '#Id of that div')
	var _headerView = new HeaderView();
	_headerView.CreateHeaderView();
	
	//Initilise Home View
	CreateShowViews();
	}
	catch(ex)
	{
		alert(ex.message);
	}
}
 /*
  * FunctionName:
  * Description:To be called from HeaderCOntroller
  */

function CreateShowViews(e)
{
	try
	{
		StopBubbling(e);
		if(this.className != undefined){
			if(this.className != 'divMenuItemsMovRev'){
				if(idCurrentTab){
					Pick(idCurrentTab).className = 'divMenuItems';
				}
				if(this.tagName == 'SPAN'){
				this.parentNode.className = 'divMenuItems divMenuItemsActive';
				idCurrentTab = this.parentNode.id;	
				}
				else{
					this.className = 'divMenuItems divMenuItemsActive';
				idCurrentTab = this.id;	
			}	
			}
			
		}
		else{
			Pick('divMenuItems0').className = 'divMenuItems divMenuItemsActive';
		}
		ToggleDropDown();
		if(CachedItemIndices.length > 3)
		{
				SectionDetailsArray[parseInt(CachedItemIndices[0])].cachedData = null;
				CachedItemIndices.splice(0,1);
		}
		//Check if it is App load/reload then handlerData will be undefined
		//HanlerData comes with sectionClick
		if(this.handlerData != undefined)
		{
			//alert(this.handlerData);
			indexClickedSection = this.handlerData;
		}
		
		CachedItemIndices.push(indexClickedSection);
	if(SectionDetailsArray[indexClickedSection].cachedData)
	{
		//Drop the current view
		Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
		//Recreate the view with existing data
		var _modelData = SectionDetailsArray[indexClickedSection].cachedData;
		CreateNewsView(_modelData);
	}
	else
	{
		//Drop the current view
		if(Pick(SectionDetailsArray[indexClickedSection].divId) != null)
		{
		Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
		}
		//Make http call
		var _dataManager = new DataManager();
		//CreateHomeView is Success Call function in HomeCOntroller.js
		Show(Pick('divDuringPageLoad'));
		_dataManager.GetFeedData(indexClickedSection,CreateNewsView);
		//Cache the data in SectionDetailsArray
		//Create the view
	}
	/*Hide(Pick('divDDMenu'));*/
	if(Pick('divDDCityMenu'))
	{
		Hide(Pick('divDDCityMenu'));
	}
	}
	catch(ex)
	{
		alert(ex.message);
	}
}


/*
FunctionName:
InParam:ArrayIndex
Description:Will check in 'SectionDetailsArray' for divId coroosponding to index.
	If exist then will show it else create it.
*/

function CreateNewsView(_newsRawData)
{
	try {
		Hide(Pick('divDuringPageLoad'));
		var _newsModel;
		if ((SectionDetailsArray[indexClickedSection].name == 'Photos') || (SectionDetailsArray[indexClickedSection].isPhotoSubSection == 1))//Photos
		{
			if (SectionDetailsArray[indexClickedSection].cachedData)//If cachedData is there
			{
				_newsModel = SectionDetailsArray[indexClickedSection].cachedData;
			}
			else {
				var _parsedData = JSON.parse(_newsRawData);
				_newsModel = new PhotosModel(_parsedData);
				SectionDetailsArray[indexClickedSection].cachedData = _newsModel;
			}
			var _photosView = new PhotosView();
			if(_newsModel)
			{
				_photosView.CreatePhotosView(_newsModel);
			}
			else
			{
				alert("Data retrieval failed.Please check your network connection and reload the application.");
			}
		}
		else if((SectionDetailsArray[indexClickedSection].name == 'Videos') || (SectionDetailsArray[indexClickedSection].isVideoSubSection == 1))
		{
			if (SectionDetailsArray[indexClickedSection].cachedData)//If cachedData is there
			{
				_newsModel = SectionDetailsArray[indexClickedSection].cachedData;
			}
			else {
				
				_newsRawData = replaceAll(_newsRawData,"media:content","mediaContent");
				_newsRawData =replaceAll(_newsRawData,"media:thumbnail","mediaThumbnail");
				var _parsedData = JSON.parse(_newsRawData);
				_newsModel = new VideosModel(_parsedData);
				SectionDetailsArray[indexClickedSection].cachedData = _newsModel;
			}
			var _videosView = new VideosView();
			if(_newsModel)
			{
				_videosView.CreateVideoView(_newsModel);
			}
			else
			{
				alert("Data retrieval failed.Please check your network connection and reload the application.");
			}
		}
		else if ((SectionDetailsArray[indexClickedSection].name == 'Movie Reviews') || (SectionDetailsArray[indexClickedSection].isMovieReviewSubSection == 1))//Movie reviews
		{
			
			if (SectionDetailsArray[indexClickedSection].cachedData)//If cachedData is there
			{
				_newsModel = SectionDetailsArray[indexClickedSection].cachedData;
			}
			else {
				//alert(_newsRawData);
				var _parsedData = JSON.parse(_newsRawData);
				_newsModel = new MovRevModelLang(_parsedData);
				SectionDetailsArray[indexClickedSection].cachedData = _newsModel;
			}
			var _movRevLangView = new MovRevLangView();
			if(_newsModel)
			{
				_movRevLangView.CreateView(_newsModel);
				UpdateLangDropDown();
			}
			else
			{
				alert("Data retrieval failed.Please check your network connection and reload the application.");
			}
		}
		/*
		else if ((SectionDetailsArray[indexClickedSection].isMovieReviewSubSection == 1))//Movie reviews lang
				{
					if (SectionDetailsArray[indexClickedSection].cachedData)//If cachedData is there
					{
						_newsModel = SectionDetailsArray[indexClickedSection].cachedData;
					}
					else {
						//alert(_newsRawData);
						var _parsedData = JSON.parse(_newsRawData);
						_newsModel = new MovRevModelLang(_parsedData);
						SectionDetailsArray[indexClickedSection].cachedData = _newsModel;
					}
					var _movRevLangView = new MovRevLangView();
					if(_newsModel)
					{
						_movRevLangView.CreateView(_newsModel);
					}
					else
					{
						alert("Data retrieval failed.Please check your network connection and reload the application.");
					}
				}*/
		
		else//Rest
		{
			if (SectionDetailsArray[indexClickedSection].cachedData)//If cachedData is there
			{
				_newsModel = SectionDetailsArray[indexClickedSection].cachedData;
			}
			else {
				var _parsedData = JSON.parse(_newsRawData);
				_newsModel = new NewsModel(_parsedData);
				SectionDetailsArray[indexClickedSection].cachedData = _newsModel;
			}
			var _newsView = new NewsView();
			if(_newsModel)
			{
				_newsView.CreateNewsView(_newsModel);

			}
			else
			{
				alert("Data retrieval failed.Please check your network connection and reload the application.");
			}
		}
	}
	catch(ex)
	{
		alert(ex.message);
	}
}
function replaceAll(txt, replace, with_this) {
  return txt.replace(new RegExp(replace, 'g'),with_this);
}
function StoreAdData(_xmlData)
{
	if(_xmlData)
	{
		bannerUrlListing = _xmlData.documentElement.childNodes[0].textContent;
		bannerListingRedirect = _xmlData.documentElement.childNodes[2].textContent;
	}
}
function StoreStoryAdData(_xmlData)
{
	if(_xmlData)
	{
		bannerUrlStory = _xmlData.documentElement.childNodes[0].textContent;
		bannerStoryRedirect = _xmlData.documentElement.childNodes[2].textContent;
	}
}
function RedirectToWeb()
{
	window.location = this.handlerData;
}
function AddSwipeListners()
{
	var scriptNode = document.createElement('SCRIPT');
	var text = 'mwl.addSwipeLeftListener("#divNews","mwl.insertHTML(\'#spanNewsNumber\',\'Swipe\');")';
	var scriptText = document.createTextNode(text);
	scriptNode.appendChild(scriptText);
	
	var bodyNode = document.getElementsByTagName('body')[0];
	bodyNode.appendChild(scriptNode);
}
function ShowCreateDropDownMenu()
{
	//Show DropDownMenu
	Show(Pick('divDDMenu'));
}
function ToggleDropDown() {
	switch(this.handlerData)
	{
		case 0://For cities
		$('#divDDCityMenu').toggle(500);
		$('#divDDPhotosMenu').hide(500)
		$('#divDDVideosMenu').hide(500);
		
		$('#imgDropDown0.imgDropDown').toggleClass('imgDropDownActive');
		Pick('imgDropDown1').className = 'imgDropDown';
		Pick('imgDropDown2').className = 'imgDropDown';
		
		break;
		case 1://For photos
		$('#divDDCityMenu').hide(500);
		$('#divDDPhotosMenu').toggle(500)
		$('#divDDVideosMenu').hide(500);
		
		Pick('imgDropDown0').className = 'imgDropDown';
		$('#imgDropDown1.imgDropDown').toggleClass('imgDropDownActive');
		Pick('imgDropDown2').className = 'imgDropDown';
		break;
		case 2://For videos
		$('#divDDCityMenu').hide(500);
		$('#divDDPhotosMenu').hide(500)
		$('#divDDVideosMenu').toggle(500);
		
		Pick('imgDropDown0').className = 'imgDropDown';
		Pick('imgDropDown1').className = 'imgDropDown';
		$('#imgDropDown2.imgDropDown').toggleClass('imgDropDownActive');
		break;
		default:
		$('#divDDCityMenu').hide(500);
		$('#divDDPhotosMenu').hide(500)
		$('#divDDVideosMenu').hide(500);
		
		Pick('imgDropDown0').className = 'imgDropDown';
		Pick('imgDropDown1').className = 'imgDropDown';
		Pick('imgDropDown2').className = 'imgDropDown';
	}
}
function RemoveKeyBoardShortCuts(){
		shortcut.remove("Left");
		shortcut.remove("Right");
		shortcut.remove("Up");
		shortcut.remove("Down");
	}
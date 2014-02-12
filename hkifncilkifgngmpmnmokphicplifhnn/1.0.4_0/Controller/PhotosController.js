function ShowImageInShowCase()
{
	currentImgSlideShow = this.handlerData;
	if(PhotosListOfSelectedAlbum[currentImgSlideShow].photo)
	{
	var divImageShowCase = Pick('divImageShowCase');
	divImageShowCase.innerHTML = "";
	var divImagePlace = createDiv('divImagePlace','divImagePlace');
	divImagePlace.appendChild(createSpan('','spanImageVAlign',''));
	divImagePlace.appendChild(createImage('imgCurrent',PhotosListOfSelectedAlbum[currentImgSlideShow].photo,'imgCurrent'));
	divImageShowCase.appendChild(divImagePlace);
	(divImageShowCase.appendChild(createDiv('currentImgCaption','currentImgCaption'))).appendChild(createP('','',PhotosListOfSelectedAlbum[currentImgSlideShow].caption));
	}
	else{
		alert('Selcted album is unavailable right now.Please try again later.');
	}
}
function ShowPrevImage()
{
	
	var maxCountLimit = PhotosListOfSelectedAlbum.length;
	var _photoIndex;
	if(currentImgSlideShow > 0)
	{
		Pick('spanShowcaseCount').innerHTML = currentImgSlideShow+' of '+PhotosListOfSelectedAlbum.length;	
		currentImgSlideShow--;
		var divImageShowCase = Pick('divImageShowCase');
	divImageShowCase.innerHTML = "";
	var divImagePlace = createDiv('divImagePlace','divImagePlace');
	divImagePlace.appendChild(createSpan('','spanImageVAlign',''));
	divImagePlace.appendChild(createImage('imgCurrent',PhotosListOfSelectedAlbum[currentImgSlideShow].photo,'imgCurrent'));
	divImageShowCase.appendChild(divImagePlace);
	(divImageShowCase.appendChild(createDiv('currentImgCaption','currentImgCaption'))).appendChild(createP('','',PhotosListOfSelectedAlbum[currentImgSlideShow].caption));
		}
	else
	{
		//alert('For me:Disable the left btn');
	}
}

function ShowNextImage()
{
	try {
		
		var maxCountLimit = PhotosListOfSelectedAlbum.length;
		var _photoIndex;
		if (currentImgSlideShow < maxCountLimit-1) {
			
			currentImgSlideShow++;
			Pick('spanShowcaseCount').innerHTML = currentImgSlideShow+1 +' of '+PhotosListOfSelectedAlbum.length;
			var divImageShowCase = Pick('divImageShowCase');
			divImageShowCase.innerHTML = "";
			var divImagePlace = createDiv('divImagePlace','divImagePlace');
			divImagePlace.appendChild(createSpan('','spanImageVAlign',''));
			divImagePlace.appendChild(createImage('imgCurrent',PhotosListOfSelectedAlbum[currentImgSlideShow].photo,'imgCurrent'));
			divImageShowCase.appendChild(divImagePlace);
			(divImageShowCase.appendChild(createDiv('currentImgCaption','currentImgCaption'))).appendChild(createP('','',PhotosListOfSelectedAlbum[currentImgSlideShow].caption));
	}
		else {
			//alert('For me:Disable the right button');
		}
	}
	catch(ex)
	{
		alert(ex.message);
	}
}

/*
FUnctionName:
Description:Will create story of news clicked.Data will come with handlerData of
			corrosponding div click
*/

function GetSlideShowUrl()
{
	try {
		//Drop current view
		//document.body.removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
		var _albumUrl = this.handlerData.slideShowUrl;
		if (_albumUrl == -1) {
			//Make http call find slideShowUrl
			var _slideShow = this.handlerData.slideShow;
			var _httpManager = new HttpManager();
			_httpManager.GetFeedData(_slideShow, GetSlideShowUrlFromSlideShow);
		}
		else {
			GetPhotosList(_albumUrl);
		}
	}
	catch(ex)
	{
		alert(ex.message);
	}
}

function GetSlideShowUrlFromSlideShow(rtrnData)
{
	var _parsedData = JSON.parse(rtrnData);
	var _albumUrl = _parsedData.NewsML.NewsItem.NewsComponent[4].ContentItem.DataContent["media-caption"]["slideshow"];
	GetPhotosList(_albumUrl);
}

function GetPhotosList(_albumUrl)
{
	var _dataManager = new DataManager();
	_dataManager.GetFeedPhotosList(_albumUrl,CreatePhotosAlbumView);
}

function CreatePhotosAlbumView(_rtrnData)
{
	var _parsedData = JSON.parse(_rtrnData);
	Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
	PhotosListOfSelectedAlbum = new AllPhotosListInAlbumModel(_parsedData);
	//Cache the urls of one album.
	 
	var _photosView = new PhotosView();
	_photosView.CreateSlideShow(0);
	
}
function BackToPhotoListView()
{
	Pick('divMain').removeChild(Pick('divNews'));
	var _photosView = new PhotosView();
	_photosView.CreatePhotosView(SectionDetailsArray[indexClickedSection].cachedData);
}
function SlideUp()
{
	var visibleHeight = Pick('divGallaryThumbs').offsetHeight;
	var slidingHeight = 200;
	var totalSliderHeight = Pick('divGallaryThumbsWrapper').scrollHeight;
	//var Pick('divGallaryThumbsWrapper').style.marginTop = Pick('divGallaryThumbsWrapper').style.marginTop;
	//alert('Pick('divGallaryThumbsWrapper').style.marginTop is '+Pick('divGallaryThumbsWrapper').style.marginTop+'totalSliderHeight is'+totalSliderHeight);
	var slidingLimit = visibleHeight - totalSliderHeight;
	if(Pick('divGallaryThumbsWrapper').style.marginTop){
				if(parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) < 0){
					Pick('divGallaryThumbsWrapper').style.marginTop = (parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) + slidingHeight) +'px';	
				}
				}
				else{
				//alert('Left End');	
				}
}
function StopUpSliding(){
	
}
function SlideDown()
{
	var visibleHeight = Pick('divGallaryThumbs').offsetHeight;
	var slidingHeight = 200;
	var totalSliderHeight = Pick('divGallaryThumbsWrapper').scrollHeight;;
	//var Pick('divGallaryThumbsWrapper').style.marginTop = Pick('divGallaryThumbsWrapper').style.marginTop;
	//alert('Pick('divGallaryThumbsWrapper').style.marginTop is '+Pick('divGallaryThumbsWrapper').style.marginTop+'totalSliderHeight is'+totalSliderHeight);
	var slidingLimit = visibleHeight - totalSliderHeight;
	if(Pick('divGallaryThumbsWrapper').style.marginTop){
				if(parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) > slidingLimit){
					Pick('divGallaryThumbsWrapper').style.marginTop = (parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) - slidingHeight) +'px';	
				}
				}
				else{
				Pick('divGallaryThumbsWrapper').style.marginTop = -(slidingHeight) +'px';	
				}
				//alert(Pick('divGallaryThumbsWrapper').style.marginTop);
}

/**
 * @author Dewesh
 */
function VideosView()
{
	
}
var currentPlayingVideo = 0;
VideosView.prototype = 
{
	CreateVideoView:function(_videoModel)
	{
		RemoveKeyBoardShortCuts();
		this.CreateVideoShowCase(_videoModel);
	},
	CreateVideoListing:function(_videoModel)
	{
		
	},
	CreateVideoShowCase:function(_videoModel)
	{
		try
		{
		currentPlayingVideo = 0;
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divSlideShowView = createDiv(_divId,'divImageDetailsView');
		var totalPhotoItem = _videoModel.length;
		
		//Header
		var divSSHeader = createDiv('divSSHeader','divSSHeader');
		//divSSHeader.appendChild(createSpan('','',''));
		divSSHeader.appendChild(createP('','','Videos'));
		var divHeaderRight = createDiv('divHeaderRight','divHeaderRight');
		(divHeaderRight.appendChild(createDiv('divLeftHeaderLeft','divLeftHeaderLeft'))).appendChild(createImage('','Resources/Images/photopagingleft.png','','Left',this.PlayPrevVideo,currentPlayingVideo));
		(divHeaderRight.appendChild(createDiv('divLeftHeaderRight','divLeftHeaderRight'))).appendChild(createImage('','Resources/Images/photopagingright.png','','right',this.PlayNextVideo,currentPlayingVideo));;
		//divSSHeader.appendChild(divHeaderRight);
		divSlideShowView.appendChild(divSSHeader);
		
		var divVideoShowCase = createDiv('divVideoShowCase','divImageShowCase');
		var divPlaySpace = createDiv('divPlayPlace','divImagePlace');
		divPlaySpace.appendChild(createSpan('','spanImageVAlign',''));
		var divPlayerSpace = createDiv('divPlayerSpace','divPlayerSpace');
		divPlaySpace.appendChild(divPlayerSpace);
		/*
		var imgCurrent = createImage('imgCurrent',PhotosListOfSelectedAlbum[currentImgSlideShow].photo,'imgCurrent');
				divImagePlace.appendChild(imgCurrent);
				<video width="320" height="240" controls="controls">
  					<source src="movie.ogg" type="video/ogg" />
  					<source src="movie.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
				*/
		/*
		var currentVideo = createVideoPlayer('400','400',1);
				currentVideo.appendChild(createVidSrc(_videoModel[2].videoUrl,'video/mp4'));	
				divPlaySpace.appendChild(currentVideo);
				(divPlaySpace.appendChild(createDiv('currentImgCaption','currentImgCaption'))).appendChild(createP('','',_videoModel[currentPlayingVideo].caption));
		*/
		divVideoShowCase.appendChild(divPlaySpace);	
		(divVideoShowCase.appendChild(createDiv('currentVideoCaption','currentImgCaption'))).appendChild(createP('','',_videoModel[currentPlayingVideo].caption));	
		divSlideShowView.appendChild(divVideoShowCase);
		
		
		var divGallaryThumbs = createDiv('divGallaryThumbs','divGallaryThumbs');
		var divGallaryThumbsWrapper = createDiv('divGallaryThumbsWrapper','divGallaryThumbsWrapper');
		
		(divGallaryThumbs.appendChild(createSpan('spanThumbsSliderFirst','spanThumbsSliderFirst','',SlideUpVideo,0))).appendChild(createImage('','Resources/Images/slideup.png'));
		var ulGallaryThumbsWrapper = createUL('','');
		for(var i = 0;i < totalPhotoItem;i++)
		{
			(ulGallaryThumbsWrapper.appendChild(createLI('liThumbsSliderRest','liThumbsSliderRest',PlayVideo,i))).appendChild(createImage('',_videoModel[i].thumb));
		}
		divGallaryThumbsWrapper.appendChild(ulGallaryThumbsWrapper);
		divGallaryThumbs.appendChild(divGallaryThumbsWrapper);
		(divGallaryThumbs.appendChild(createSpan('spanThumbsSliderLast','spanThumbsSliderLast','',SlideDownVideo,0))).appendChild(createImage('','Resources/Images/slidedown.png'));
		divSlideShowView.appendChild(divGallaryThumbs);
		Pick('divMain').appendChild(divSlideShowView);
		}
		catch(ex){
			alert(ex.message);
		}
		finally
		{
			Pick('spanThumbsSliderFirst').onmouseover = function(){
				SlideUpVideo();
			}
			Pick('spanThumbsSliderLast').onmouseover = function(){
				SlideDownVideo();
			}
			//var urlVideo = "http%3A%2F%2Fmvideos.timesofindia.indiatimes.com%2Fvideos%2F9792156.flv'";
			//var urlVideo = "http://mvideos.timesofindia.indiatimes.com/videos/9793112.flv'";
			var _videoModel = SectionDetailsArray[indexClickedSection].cachedData;
				var currentVideoDetails = _videoModel[currentPlayingVideo];
		
				var urlVideo = currentVideoDetails.videoUrl + "'";
				
				//var thumbUrlStr = "<img alt=' ' src= '"+currentVideoDetails.thumb+"' width='640' height='360'/>";
			var strVideoStart = "<object type='application/x-shockwave-flash' data='http://flashfox.googlecode.com/svn/trunk/flashfox.swf' width='640' height='360'>";
			strVideoStart = strVideoStart + "<param name='movie' value='http://flashfox.googlecode.com/svn/trunk/flashfox.swf' />";
			strVideoStart = strVideoStart + "<param name='allowFullScreen' value='true' /><param name='wmode' value='transparent' />";
			strVideoStart = strVideoStart + "<param name='flashVars' value='autoplay=false&amp;controls=true&amp;image="+currentVideoDetails.thumb+"&amp;src=";
			strVideoStart = strVideoStart + urlVideo+"</object>";
			Pick('divPlayerSpace').innerHTML = strVideoStart;
			
		}
	},
	PlayPrevVideo:function()
	{
		currentPlayingVideo--;
		PlayVideo();	
	},
	PlayNextVideo:function()
	{
		currentPlayingVideo++;
		PlayVideo();
	},
	SlideDown:function()
	{
		
	},
	SlideUp:function()
	{
		
	},
	PlayVideo:function()
	{
		var _videoModel = SectionDetailsArray[indexClickedSection].cachedData;
		if( this.handlerData || this.handlerData == 0){
			currentPlayingVideo = this.handlerData;	
		}
		var currentVideoDetails = _videoModel[currentPlayingVideo];
		
		var urlVideo = currentVideoDetails.videoUrl + "'";
			var strVideoStart = "<object type='application/x-shockwave-flash' data='http://flashfox.googlecode.com/svn/trunk/flashfox.swf' width='640' height='360'>";
			strVideoStart = strVideoStart + "<param name='movie' value='http://flashfox.googlecode.com/svn/trunk/flashfox.swf' />";
			strVideoStart = strVideoStart + "<param name='allowFullScreen' value='true' /><param name='wmode' value='transparent' />";
			strVideoStart = strVideoStart + "<param name='flashVars' value='autoplay=true&amp;controls=true&amp;src=";
			strVideoStart = strVideoStart + urlVideo + "</object>";
			Pick('divPlayerSpace').innerHTML = strVideoStart;
	}
}

function PlayVideo()
{
	var _videoModel = SectionDetailsArray[indexClickedSection].cachedData;
		if( this.handlerData || this.handlerData == 0){
			currentPlayingVideo = this.handlerData;	
		}
		var currentVideoDetails = _videoModel[currentPlayingVideo];
		
		var urlVideo = currentVideoDetails.videoUrl + "'";
			var strVideoStart = "<object type='application/x-shockwave-flash' data='http://flashfox.googlecode.com/svn/trunk/flashfox.swf' width='640' height='360'>";
			strVideoStart = strVideoStart + "<param name='movie' value='http://flashfox.googlecode.com/svn/trunk/flashfox.swf' />";
			strVideoStart = strVideoStart + "<param name='allowFullScreen' value='true' /><param name='wmode' value='transparent' />";
			strVideoStart = strVideoStart + "<param name='flashVars' value='autoplay=true&amp;controls=true&amp;src=";
			strVideoStart = strVideoStart + urlVideo + "</object>";
			Pick('divPlayerSpace').innerHTML = strVideoStart;
			Pick('divVideoShowCase').removeChild(Pick('currentVideoCaption'));
			(Pick('divVideoShowCase').appendChild(createDiv('currentVideoCaption','currentImgCaption'))).appendChild(createP('','',_videoModel[currentPlayingVideo].caption));
			
}

function SlideUpVideo(){
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
function SlideDownVideo(){
	var visibleHeight = Pick('divGallaryThumbs').offsetHeight;
	var slidingHeight = 200;
	var totalSliderHeight = Pick('divGallaryThumbsWrapper').scrollHeight;;
	//var Pick('divGallaryThumbsWrapper').style.marginTop = Pick('divGallaryThumbsWrapper').style.marginTop;
	//alert('Pick('divGallaryThumbsWrapper').style.marginTop is '+Pick('divGallaryThumbsWrapper').style.marginTop+'totalSliderHeight is'+totalSliderHeight);
	var slidingLimit = visibleHeight - totalSliderHeight;
	if(Pick('divGallaryThumbsWrapper').style.marginTop){
				if(parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) > slidingLimit){
					/*if((parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) - slidingLimit) < slidingHeight){
						slidingHeight = -(Pick('divGallaryThumbsWrapper').style.marginTop) + slidingLimit;	
					}
					*/
					Pick('divGallaryThumbsWrapper').style.marginTop = (parseInt(Pick('divGallaryThumbsWrapper').style.marginTop) - slidingHeight) +'px';	
				}
				}
				else{
				Pick('divGallaryThumbsWrapper').style.marginTop = -(slidingHeight) +'px';	
				}
				//alert(Pick('divGallaryThumbsWrapper').style.marginTop);
}

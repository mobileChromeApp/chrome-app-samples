function PhotosView()
{
	
};
var gPhotosPageCount = 0;
var photosViewnoOfColPerRows = -1;
var photosViewnoOfRows = -1;
var photosViewvisibleWidth = -1;
var photosViewvisibleHeight = -1;
var photoPageCurrentIndex = 1;
var currentImgSlideShow = 0;
PhotosView.prototype = 
{
	CreatePhotosView:function(_newsModel)
	{
		try
		{
			gPhotosPageCount = 0;
			this.RemoveKeyboard();
			this.ActivateKeyBoard();
		currentImgSlideShow = 0;
		photoPageCurrentIndex = 1;
		photosViewnoOfColPerRows = -1;
		photosViewnoOfRows = -1;
		photosViewvisibleWidth = -1;
		photosViewvisibleHeight = -1;
		var visibleWidth = Pick('divMain').offsetWidth - 100;//100px width of side bar
		photosViewvisibleWidth = visibleWidth;
		var visibleHeight = Pick('divMain').offsetHeight - 30;
		photosViewvisibleHeight = newsViewvisibleHeight;
		var heightOfRows = 140;
		var widthOfRows = 205;
		photosViewnoOfRows =  Math.floor(visibleHeight/heightOfRows);
		photosViewnoOfColPerRows = Math.floor(visibleWidth/widthOfRows)
		
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divNews = createDiv(_divId,'divNewsContainer');
		/*
		if(bannerUrlListing)
				{
					var divListingAd = createDiv('divListingAd', 'divListingAd', RedirectToWeb, bannerListingRedirect);
					var imgBanner = createImage('imgAd', bannerUrlListing, 'imgAd', 'Ad Space');
					divListingAd.appendChild(imgBanner);
					divNews.appendChild(divListingAd);
				}*/
		divNews.appendChild(createSpan('','spanPhotos','Photos'));
		divNews.appendChild(this.CreatePhotosListItems(_newsModel));
		divNews.appendChild(createDiv('','divSeprator'));
		divNews.appendChild(this.CreateBreadcum(Math.ceil(_newsModel.length/(photosViewnoOfRows*photosViewnoOfColPerRows))));
		Pick('divMain').appendChild(divNews);
		}
		catch(ex)
		{
			alert(ex.message);
		}
		finally
		{
			var i=0;
			while(Pick('ulPhotoPage'+i))
			{
				Pick('ulPhotoPage'+i).style.width = Pick('divNews').offsetWidth + 'px';
				Pick('ulPhotoPage'+i).style.height = Pick('divNews').offsetHeight - 70 + 'px';
				i++;
			}
			var j=0;
			while(Pick('liEachPhoto' + j))
			{
				
				Pick('liEachPhoto' + j).style.width = (100/photosViewnoOfColPerRows) + '%';
				Pick('liEachPhoto' + j).style.height = (100/photosViewnoOfRows) + '%';
				j++;		
			}
			//alert(Pick('liEachNews2').style.width);
		}
		
	},
	CreatePhotosListItems:function(_modelItem)
	{
		var divPhotoListWrapper = createDiv('divPhotoListWrapper','divPhotoListWrapper');
		var photoCountPerPage =(photosViewnoOfRows*photosViewnoOfColPerRows);
		var pageCount =Math.ceil(_modelItem.length/photoCountPerPage);
		for(var i = 0;i < pageCount;i++){
			var ulEach = createUL('ulPhotoPage'+i,'ulPhotoPage');
			for(var j = parseInt(i*photoCountPerPage);j<parseInt((i+1)*photoCountPerPage);j++)
			{
				if(_modelItem[j])
				{
					//alert(j);
					var liEach = createLI('liEachPhoto'+j,'liEachPhoto',GetSlideShowUrl,_modelItem[j]);
					liEach.appendChild(createImage('',_modelItem[j].thumb,'',''));
					liEach.appendChild(createDiv('','divSeprator'));
					liEach.appendChild(createSpan('','',_modelItem[j].headLine));
					ulEach.appendChild(liEach);
				}
			}
			divPhotoListWrapper.appendChild(ulEach);
		}
		return divPhotoListWrapper;
		/*
		var divNewsListItem = createDiv('divNewsListItem','divNewsListItem',GetSlideShowUrl,_modelItem);
				var tableNewsContainer = createTable('','tableContainer');
				var rowEachNewsItem = createRow('rowEachNewsItem','rowEachNewsItem');
				var colLeft = createColumn('','colLeftEachNewsItem');
				colLeft.appendChild(createSpan('','spanHeadLine',_modelItem.headLine));
				rowEachNewsItem.appendChild(colLeft);
				var colRight = createColumn('','colRightEachNewsItem');
				//colRight.appendChild(createImage('','Resources/Images/TempTestImage.png','imgEachNewsItem',''));
				colRight.appendChild(createImage('',_modelItem.thumb,'imgEachNewsItem',''));
				rowEachNewsItem.appendChild(colRight);
				tableNewsContainer.appendChild(rowEachNewsItem);
				divNewsListItem.appendChild(tableNewsContainer);
				return divNewsListItem;*/
		
	},
	CreateBreadcum:function(_pageCount)
	{
		gPhotosPageCount = _pageCount; 
		var pageCount =_pageCount; 
		var divBreadCum = createDiv('divBreadCum','divBreadCumPhotoView');
		var tableBreadCum = createTable('tableBreadCum','tableBreadCum');
		tableBreadCum.cellSpacing = '5px';
		var rowBreadCum = createRow('rowBreadCum','rowBreadCum');
		var colLeft = createClickableColumn('','colLeft colImgLeftNews',this.ShowPrevPage,pageCount);
		rowBreadCum.appendChild(colLeft);
		
		for(var i = 0;i < _pageCount;i++)
		{
			if(i == 0)
			{
			var colCenter = createColumn('colCenterPhotos'+i,'colCenter colCenterActive');	
			}
			else
			{
				var colCenter = createColumn('colCenterPhotos'+i,'colCenter');
			}
			//colCenter.appendChild(createSpan('', 'spanBreadCum', ' o o o o '));
			rowBreadCum.appendChild(colCenter);	
		}
		var colRight = createClickableColumn('colRight','colRight colImgRightNews',this.ShowNextPage,pageCount);
		rowBreadCum.appendChild(colRight);
		tableBreadCum.appendChild(rowBreadCum);
		divBreadCum.appendChild(tableBreadCum);
		return divBreadCum;
	},
	ShowNextPage:function()
	{
		try
		{
			//alert(Pick('divPhotoListWrapper').style.marginLeft);
			var totalPageCount = gPhotosPageCount;
			var visibleWidth = Pick('ulPhotoPage0').offsetWidth;
			if(photoPageCurrentIndex < totalPageCount){
				if(Pick('divPhotoListWrapper').style.marginLeft){
					Pick('divPhotoListWrapper').style.marginLeft = (parseInt(Pick('divPhotoListWrapper').style.marginLeft) - visibleWidth) +'px';	
				}
				else{
				Pick('divPhotoListWrapper').style.marginLeft = -(visibleWidth) +'px';	
				}
					
				photoPageCurrentIndex++;
				for(var i = 0;i < totalPageCount;i++)
				{
					Pick('colCenterPhotos'+i).className = 'colCenter';
				}
				Pick('colCenterPhotos'+ (photoPageCurrentIndex - 1)).className = 'colCenter colCenterActive';		
			}
		}
		catch(ex){
			alert(ex.message);
		}

	},
	ShowPrevPage:function()
	{
		var totalPageCount = gPhotosPageCount;
		var visibleWidth = Pick('ulPhotoPage0').offsetWidth;
			if(photoPageCurrentIndex > 1){
				photoPageCurrentIndex--;
				Pick('divPhotoListWrapper').style.marginLeft = (parseInt(Pick('divPhotoListWrapper').style.marginLeft) + visibleWidth) +'px';		
			}
			for(var i = 0;i < totalPageCount;i++)
				{
					Pick('colCenterPhotos'+i).className = 'colCenter';
				}
				//alert(newsPageCurrentIndex);
			Pick('colCenterPhotos'+ (photoPageCurrentIndex - 1)).className = 'colCenter colCenterActive';	
	},
	ActivateKeyBoard:function(){
		shortcut.add("Left",this.ShowPrevPage);
		shortcut.add("Right",this.ShowNextPage);
	},
	RemoveKeyboard:function(){
		shortcut.remove("Left");
		shortcut.remove("Right");
		shortcut.remove("Up");
		shortcut.remove("Down");
	},
	ActivateKeyBoardForShowcase:function(){
		shortcut.add("Left",ShowPrevImage);
		shortcut.add("Right",ShowNextImage);
	},
	CreateSlideShow:function(_imgNumber)
	{
		try
		{
			this.RemoveKeyboard();
			this.ActivateKeyBoardForShowcase();
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divSlideShowView = createDiv(_divId,'divImageDetailsView');
		var totalPhotoItem = PhotosListOfSelectedAlbum.length;
		var divSSHeader = createDiv('divSSHeader','divSSHeader');
		divSSHeader.appendChild(createSpan('spanPhotosBack','spanPhotosBack','',BackToPhotoListView));
		divSSHeader.appendChild(createP('','','Photos'));
		var divHeaderRight = createDiv('divHeaderRight','divHeaderRight');
		(divHeaderRight.appendChild(createDiv('divLeftHeaderLeft','divLeftHeaderLeft'))).appendChild(createImage('','Resources/Images/photopagingleft.png','','Left',ShowPrevImage,currentImgSlideShow));
		divHeaderRight.appendChild(createSpan('spanShowcaseCount','spanShowcaseCount','1 of '+totalPhotoItem));
		(divHeaderRight.appendChild(createDiv('divLeftHeaderRight','divLeftHeaderRight'))).appendChild(createImage('','Resources/Images/photopagingright.png','','right',ShowNextImage,currentImgSlideShow));;
		divSSHeader.appendChild(divHeaderRight);
		divSSHeader.appendChild(createDiv('divShareBtn','divShareBtn',OnClick_ShareBtn));
		divSlideShowView.appendChild(divSSHeader);
		
		var divImageShowCase = createDiv('divImageShowCase','divImageShowCase');
		
		var divImagePlace = createDiv('divImagePlace','divImagePlace');
		divImagePlace.appendChild(createSpan('','spanImageVAlign',''));
		if(PhotosListOfSelectedAlbum[currentImgSlideShow].photo)
		{
			var imgCurrent = createImage('imgCurrent',PhotosListOfSelectedAlbum[currentImgSlideShow].photo,'imgCurrent');
		divImagePlace.appendChild(imgCurrent);	
		}
		else{
		alert('Selcted album is unavailable right now.Please try again later.');
	}
		divImageShowCase.appendChild(divImagePlace);
		(divImageShowCase.appendChild(createDiv('currentImgCaption','currentImgCaption'))).appendChild(createP('','',PhotosListOfSelectedAlbum[currentImgSlideShow].caption));
		divSlideShowView.appendChild(divImageShowCase);
		
		var divNewsStoryShare = createDiv('divNewsStoryShare','divPhotoStoryShare');
		divNewsStoryShare.appendChild(CreateSharingOption(PhotosListOfSelectedAlbum[currentImgSlideShow].webUrl));
		divSlideShowView.appendChild(divNewsStoryShare);
		
		var divGallaryThumbs = createDiv('divGallaryThumbs','divGallaryThumbs');
		var divGallaryThumbsWrapper = createDiv('divGallaryThumbsWrapper','divGallaryThumbsWrapper');
		
		(divGallaryThumbs.appendChild(createSpan('spanThumbsSliderFirst','spanThumbsSliderFirst','',SlideUp,0))).appendChild(createImage('','Resources/Images/slideup.png'));
		var ulGallaryThumbsWrapper = createUL('','');
		for(var i = 0;i < totalPhotoItem;i++)
		{
			(ulGallaryThumbsWrapper.appendChild(createLI('liThumbsSliderRest','liThumbsSliderRest',ShowImageInShowCase,i))).appendChild(createImage('',PhotosListOfSelectedAlbum[i].thumb));
		}
		divGallaryThumbsWrapper.appendChild(ulGallaryThumbsWrapper);
		divGallaryThumbs.appendChild(divGallaryThumbsWrapper);
		(divGallaryThumbs.appendChild(createSpan('spanThumbsSliderLast','spanThumbsSliderLast','',SlideDown,0))).appendChild(createImage('','Resources/Images/slidedown.png'));
		divSlideShowView.appendChild(divGallaryThumbs);
		Pick('divMain').appendChild(divSlideShowView);
		}
		catch(ex)
		{
			alert(ex.message);
		}
		finally
		{
				Pick('spanThumbsSliderFirst').onmouseover = function(){
					SlideUp();
				}
				Pick('spanThumbsSliderFirst').onmouseout = function(){
				}
				Pick('spanThumbsSliderLast').onmouseover = function(){
					SlideDown();
				}
				//Pick('spanShowcaseCount').innerHTML = currentImgSlideShow+' of '+PhotosListOfSelectedAlbum.length;
		}
	}
};



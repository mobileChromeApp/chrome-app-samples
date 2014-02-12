var gMovieRevCount = 0;
var movRevPageCurrentIndex = 1;
var	movRevViewnoOfTotalRows = -1;
var	movRevViewnoOfColPerRows = -1;
var	movRevViewvisibleWidth = -1;
var	movRevViewvisibleHeight = -1;

function MovRevLangView(){
	
}
MovRevLangView.prototype = 
{
	CreateView:function(_model)
	{
		try
		{
			gMovieRevCount = 0;
		this.RemoveKeyboard();
		this.ActivateKeyBoard();
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divMovRevAllLang = createDiv(_divId,'divNewsContainer');
		divMovRevAllLang.appendChild(this.CreateHeader());
		divMovRevAllLang.appendChild(this.CreateContent(_model));
		divMovRevAllLang.appendChild(this.CreateFooter());
		Pick('divMain').appendChild(divMovRevAllLang);
		}
		catch(ex)
		{
			alert(ex.message);
		}
		finally
		{
			var i=0;
			while(Pick('ulNewsPage'+i))
			{
				Pick('ulNewsPage'+i).style.width = Pick('divNews').offsetWidth + 'px';
				Pick('ulNewsPage'+i).style.height = Pick('divNews').offsetHeight - 30 + 'px';
				i++;
			}
			var j=0;
			while(Pick('liEachNews' + j))
			{
				Pick('liEachNews' + j).style.width = (100/newsViewnoOfColPerRestRows) + '%';
				Pick('liEachNews' + j).style.height = (100/newsViewnoOfTotalRows) + '%';
				Pick('liEachNews' + j).style.height = (18 * ((Math.floor((Pick('liEachNews' + j).offsetHeight)/18)))) + 'px';
				Pick('pNewsHeadLine' + j).style.height = (18 * ((Math.ceil((Pick('pNewsHeadLine' + j).offsetHeight)/18)))) + 'px';
				j++;		
			}
			//alert(Pick('liEachNews2').style.width);
			//Pick('divNewsItemEachContainer').style.padding = '8px 0';
		}
	},
	CreateHeader:function()
	{
		var divMovRevAllHeader = createDiv('divMovRevAllHeader','divMovRevAllHeader');
			var divMovRevAllHeaderWrapper = createDiv('','divMovRevAllHeaderWrapper');
			var divLangSection = createDiv('divLangSection','divLangSection');
			divLangSection.appendChild(createSpan('','spanMovRevLangCaption','Language: '));
			var divLangDropDown = createDiv('divLangDropDown','divLangDropDown');
			var divFirstElement = createDiv('divFirstElement','divFirstElement');
			divFirstElement.appendChild(createSpan('spanFirstLangDD','spanFirst','All'));
			divFirstElement.appendChild(createDiv('','imgDropDownMovRev',ToogleLanguageDD));
			divLangDropDown.appendChild(divFirstElement);
			var divRestElements = createDiv('divRestElementsLang','divRestElements');
				for(var i = 0;i < SectionDetailsArray.length;i++){
					if(SectionDetailsArray[i].name == 'Movie Reviews'){
						var divMenuItems = createDiv('divMenuItemsAllLang','divMenuItemsMovRev',CreateShowViews,i);
						divMenuItems.appendChild(createSpan('','spanMwnuItems','All'));
						divRestElements.appendChild(divMenuItems);
					}
					if (SectionDetailsArray[i].isMovieReviewSubSection == 1) {
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItemsMovRev',CreateShowViews,i);
						divMenuItems.appendChild(createSpan('','spanMwnuItems',SectionDetailsArray[i].name));
						divRestElements.appendChild(divMenuItems);
					}
				}
			divLangDropDown.appendChild(divRestElements);
			divLangSection.appendChild(divLangDropDown);
			
			var divSortSection = createDiv('divSortSection','divSortSection');
			divSortSection.appendChild(createSpan('','spanMovRevLangCaption','Sort Reviews by: '));
			var divSortDropDown = createDiv('divSortDropDown','divLangDropDown');
			var divFirstElementSort = createDiv('divFirstElementSort','divFirstElement');
			divFirstElementSort.appendChild(createSpan('','spanFirst','Release Date'));
			divFirstElementSort.appendChild(createDiv('','imgDropDownMovRev',ShowShortOptionDD));
			divSortDropDown.appendChild(divFirstElementSort);
			var divRestElementsSort = createDiv('divRestElementsSort','divRestElements');
			
			divSortDropDown.appendChild(divRestElementsSort);
			divSortSection.appendChild(divSortDropDown);
			
			divMovRevAllHeaderWrapper.appendChild(divLangSection);
			//divMovRevAllHeaderWrapper.appendChild(divSortSection);
			divMovRevAllHeader.appendChild(divMovRevAllHeaderWrapper);
		return divMovRevAllHeader;
	},
	CreateContent:function(_newsModel)
	{
		var divMovRevAllContent = createDiv('divMovRevAllContent','divMovRevAllContent');
		try
		{
			movRevPageCurrentIndex = 1;
			movRevViewnoOfTotalRows = -1;
			movRevViewnoOfColPerRows = -1;
			movRevViewvisibleWidth = -1;
			movRevViewvisibleHeight = -1;
		var visibleWidth = Pick('divMain').offsetWidth - 100;//100px width of side bar
		movRevViewvisibleWidth = visibleWidth;
		var visibleHeight = Pick('divMain').offsetHeight - 10;
		movRevViewvisibleHeight = newsViewvisibleHeight;
		var heightOfRows = 190;
		//var widthColFirstRow = 240;
		var widthColRow = 240;
		var noOfTotalRows =  Math.floor(visibleHeight/heightOfRows);
		movRevViewnoOfTotalRows = noOfTotalRows;
		
		//var noOfRestRows = noOfTotalRows - 1;
		var noOfColRows = Math.floor(visibleWidth/widthColRow);
		if(noOfColRows > 3){
			noOfColRows = 2*(Math.floor(noOfColRows/2));
		}
		movRevViewnoOfColPerRows = noOfColRows;
		var noOfTotalCols = (noOfTotalRows*(noOfColRows));
		//var noOfColsInFirstPage = 2 + (noOfRestRows*(noOfColRows));
		//var noOfColsInRestPage = ((noOfRestRows + 1)*(noOfColRows));
		var noOfPages =Math.ceil((_newsModel.length)/((noOfTotalRows)*(noOfColRows)));
		newsPageCurrentIndex = 1;
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divNews = createDiv(_divId,'divNewsContainer');
		if(bannerUrlListing)
		{
			var divListingAd = createDiv('divListingAd', 'divListingAd', RedirectToWeb, bannerListingRedirect);
			var imgBanner = createImage('imgAd', bannerUrlListing, 'imgAd', 'Ad Space');
			divListingAd.appendChild(imgBanner);
			divNews.appendChild(divListingAd);
		}
		divMovRevAllContent.appendChild(this.CreateMovRevListForChrome(_newsModel,noOfTotalCols,noOfPages));
		divMovRevAllContent.appendChild(createDiv('','divSeprator'));
		divMovRevAllContent.appendChild(this.CreateBreadcum(Math.ceil(noOfPages)));
		return divMovRevAllContent;
		}
		catch(ex)
		{
			alert(ex.message);
		}
		return divMovRevAllContent;
	},
	CreateMovRevListForChrome:function(_modelItem,_noOfTotalCols,_pageCount)
	{
		var divNewsWrapper = createDiv('divNewsWrapper','divNewsWrapper');
		try
		{
			//alert(_modelItem.length);
			var divNewsWrapper = createDiv('divNewsWrapper','divNewsWrapper');
		var pageCount = _pageCount;
		for(var i = 0;i < pageCount;i++){
			var ulEach = createUL('ulNewsPage'+ i,'ulNewsPage');
			var newsCountPerPage = _noOfTotalCols;
			var startColmnIndex;
			var endColumnIndex;
			startColmnIndex = i*newsCountPerPage;
			endColumnIndex = (i+1)*newsCountPerPage;
			
			for(var j = parseInt(startColmnIndex);j<parseInt(endColumnIndex);j++)
			{
				if(_modelItem[j])
				{
					var liEach = createLI('liEachNews'+j,'liEachNews',CreateMovRefStoryView,_modelItem[j]);
					var divNewsItemEachContainer = createDiv('divNewsItemEachContainer','divNewsItemEachContainer movRevItemsPadding');
					var divNewsItemEach = createDiv('divNewsItemEach','divNewsItemEach');
					//(divNewsItemEach.appendChild(createP('pNewsHeadLine'+j, 'pNewsHeadLine movRevStoryFontDet fontSize15', _modelItem[j].headLine))).appendChild(CreateStars(_modelItem[j].editorRating));
					var divStarAndHeadline = createDiv('divStarAndHeadline','divStarAndHeadline');
					
					divStarAndHeadline.appendChild(createP('pNewsHeadLine'+j, 'pNewsHeadLine movRevStoryFontDet fontSize15 floatLeft', _modelItem[j].headLine));
					divStarAndHeadline.appendChild(CreateStars(_modelItem[j].editorRating));
					divNewsItemEach.appendChild(divStarAndHeadline);
					
					divNewsItemEach.appendChild(createP('','pNewsDetailsDateLine clearBoth',_modelItem[j].dateLine));
					divNewsItemEach.appendChild(createDiv('','divSeprator'));
					if(_modelItem[j].thumb)
					{
					var divNewsThumb = createDiv('divNewsThumb','divMovRevThumb');
					divNewsThumb.appendChild(createImage('imgEachNewsItem', _modelItem[j].thumb, '', ''));
					divNewsItemEach.appendChild(divNewsThumb);
					}
					var divNewsContent = createDiv('divNewsContent','divNewsContent');
					divNewsContent.appendChild(createP('', 'movRevItemsFixedHeight movRevStoryFontDet fontSize13', '<strong>Cast: </strong>'+_modelItem[j].starCast));
					divNewsContent.appendChild(createP('', 'floatLeft widthParent movRevStoryFontDet fontSize13', '<strong>Director: </strong>'+_modelItem[j].director));
					divNewsContent.appendChild(createP('', 'floatLeft widthParent movRevStoryFontDet fontSize13', '<strong>Genre: </strong>'+_modelItem[j].genere));
					divNewsContent.appendChild(createP('', 'floatLeft widthParent movRevStoryFontDet fontSize13', '<strong>Duration: </strong>'+_modelItem[j].duration));
					divNewsItemEach.appendChild(divNewsContent);
					
					//liEach.appendChild(createDiv('','divSpacer'));
					divNewsItemEachContainer.appendChild(divNewsItemEach);
					//divNewsItemEachContainer.appendChild(createSpan('','spanDottedLine','...'));
					liEach.appendChild(divNewsItemEachContainer);
					ulEach.appendChild(liEach);
				}
			}
			divNewsWrapper.appendChild(ulEach);
		}
		return divNewsWrapper;
		}
		catch(ex)
		{
			alert(ex.message);
		}
		finally
		{
			
		}
	},
	CreateBreadcum:function(_pageCount){
		var pageCount =_pageCount; 
		gMovieRevCount = _pageCount;
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
			var colCenter = createColumn('colCenter'+i,'colCenter colCenterActive');	
			}
			else
			{
				var colCenter = createColumn('colCenter'+i,'colCenter');
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
			var totalPageCount = gMovieRevCount;
			//Change pagination dots
			
			//alert(Pick('divPhotoListWrapper').style.marginLeft);
			
			var visibleWidth = Pick('ulNewsPage0').offsetWidth;
			if(movRevPageCurrentIndex < totalPageCount){
				if(Pick('divNewsWrapper').style.marginLeft){
					Pick('divNewsWrapper').style.marginLeft = (parseInt(Pick('divNewsWrapper').style.marginLeft) - visibleWidth) +'px';	
				}
				else{
				Pick('divNewsWrapper').style.marginLeft = -(visibleWidth) +'px';	
				}
					
				movRevPageCurrentIndex++;
				for(var i = 0;i < totalPageCount;i++)
				{
					Pick('colCenter'+i).className = 'colCenter';
				}
				Pick('colCenter'+ (movRevPageCurrentIndex - 1)).className = 'colCenter colCenterActive';	
			}
		}
		catch(ex){
			alert(ex.message);
		}
	},
	ShowPrevPage:function()
	{
		var totalPageCount = gMovieRevCount;
		var visibleWidth = Pick('ulNewsPage0').offsetWidth;
			if(movRevPageCurrentIndex > 1){
				movRevPageCurrentIndex--;
				Pick('divNewsWrapper').style.marginLeft = (parseInt(Pick('divNewsWrapper').style.marginLeft) + visibleWidth) +'px';	
				for(var i = 0;i < totalPageCount;i++)
				{
					Pick('colCenter'+i).className = 'colCenter';
				}
				//alert(newsPageCurrentIndex);
			Pick('colCenter'+ (movRevPageCurrentIndex - 1)).className = 'colCenter colCenterActive';	
			}
	},
	CreateFooter:function()
	{
		var divMovRevAllFooter = createDiv('divMovRevAllFooter','divMovRevAllFooter');
		
		return divMovRevAllFooter;
	},
	ActivateKeyBoard:function(){
		shortcut.add("Left",this.ShowPrevPage);
		shortcut.add("Right",this.ShowNextPage);
	},
	RemoveKeyboard:function(){
		shortcut.remove("Left");
		shortcut.remove("Right");
	},
}
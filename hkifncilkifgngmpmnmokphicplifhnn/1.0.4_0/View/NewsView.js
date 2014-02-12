var newsPageCurrentIndex = 1;
var newsViewnoOfTotalRows = -1;
var newsViewnoOfColPerRestRows = -1;
var newsViewvisibleWidth = -1;
var newsViewvisibleHeight = -1;
var gNewsPageCount = 0;
function NewsView()
{
	
};
NewsView.prototype = 
{
	CreateNewsView:function(_newsModel)
	{
		try
		{
			this.RemoveKeyboard();
			this.ActivateKeyBoard();
			newsPageCurrentIndex = 1;
			newsViewnoOfTotalRows = -1;
			newsViewnoOfColPerRestRows = -1;
			newsViewvisibleWidth = -1;
			newsViewvisibleHeight = -1;
			gNewsPageCount = 0;
		var visibleWidth = Pick('divMain').offsetWidth - 100;//100px width of side bar
		newsViewvisibleWidth = visibleWidth;
		var visibleHeight = Pick('divMain').offsetHeight - 40;
		newsViewvisibleHeight = newsViewvisibleHeight;
		var heightOfRows = 190;
		var widthColFirstRow = 515;
		var widthColRestRow = 240;
		var noOfTotalRows =  Math.floor(visibleHeight/heightOfRows);
		newsViewnoOfTotalRows = noOfTotalRows;
		var noOfRestRows = noOfTotalRows - 1;
		var noOfColPerRestRows = Math.floor(visibleWidth/widthColRestRow)
		if(noOfColPerRestRows > 3){
			noOfColPerRestRows = 2*(Math.floor(noOfColPerRestRows/2));
		}
		newsViewnoOfColPerRestRows = noOfColPerRestRows;
		var noOfTotalCols = 2 + (noOfRestRows*(noOfColPerRestRows));
		var noOfColsInFirstPage = 2 + (noOfRestRows*(noOfColPerRestRows));
		var noOfColsInRestPage = ((noOfRestRows + 1)*(noOfColPerRestRows));
		var noOfPages = 1 + ((_newsModel.length - noOfTotalCols)/((noOfRestRows + 1)*(noOfColPerRestRows)));
		newsPageCurrentIndex = 1;
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divNews = createDiv(_divId,'divNewsContainer');
		divNews.appendChild(createSpan('','spanParentName',SectionDetailsArray[indexClickedSection].name));
		if(bannerUrlListing)
		{
			var divListingAd = createDiv('divListingAd', 'divListingAd', RedirectToWeb, bannerListingRedirect);
			var imgBanner = createImage('imgAd', bannerUrlListing, 'imgAd', 'Ad Space');
			divListingAd.appendChild(imgBanner);
			divNews.appendChild(divListingAd);
		}
		/*
		for(var i =0;i < pageCount;i++){
					var startCount = i*itemCountInPage;
					var endCount = (i+1)*itemCountInPage;
					if(endCount >= newsItemCount){
						endCount = newsItemCount;
						}
					divNews.appendChild(this.CreateNewsListForChrome(_newsModel,startCount,endCount,i));
				}*/
		
		
		divNews.appendChild(this.CreateNewsListForChrome(_newsModel,noOfColsInFirstPage,noOfColsInRestPage,Math.ceil(noOfPages)));
		divNews.appendChild(createDiv('','divSeprator'));
		divNews.appendChild(this.CreateBreadcum(Math.ceil(noOfPages)));
		Pick('divMain').appendChild(divNews);
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
				Pick('ulNewsPage'+i).style.height = Pick('divNews').offsetHeight - 60 + 'px';
				i++;
			}
			var j=0;
			while(Pick('liEachNews' + j))
			{
				if(j>1)
				{
				Pick('liEachNews' + j).style.width = (100/newsViewnoOfColPerRestRows) + '%';
				}
				Pick('liEachNews' + j).style.height = (100/newsViewnoOfTotalRows) + '%';
				Pick('liEachNews' + j).style.height = (18 * ((Math.floor((Pick('liEachNews' + j).offsetHeight)/18)))) + 'px';
				Pick('pNewsHeadLine' + j).style.height = (18 * ((Math.ceil((Pick('pNewsHeadLine' + j).offsetHeight)/18)))) + 'px';
				j++;		
			}
			//alert(Pick('liEachNews2').style.width);
		}
		
	},
	CreateNewsListForChrome:function(_modelItem,_noOfColsFstPage,_noOfColRestPage,_pageCount)
	{
		try
		{
			gNewsPageCount = _pageCount;
			//alert(_modelItem.length);
			var divNewsWrapper = createDiv('divNewsWrapper','divNewsWrapper');
		var pageCount = _pageCount;
		for(var i = 0;i < pageCount;i++){
			var ulEach = createUL('ulNewsPage'+ i,'ulNewsPage');
			var newsCountPerPage = _noOfColRestPage;
			var startColmnIndex;
			var endColumnIndex;
			if(i == 0)
			{
				newsCountPerPage = _noOfColsFstPage;
				startColmnIndex = 0;
				endColumnIndex = _noOfColsFstPage
			}
			else{
				startColmnIndex = _noOfColsFstPage +(i - 1)*_noOfColRestPage;
				endColumnIndex = _noOfColsFstPage + i*_noOfColRestPage;
			}
		
			for(var j = parseInt(startColmnIndex);j<parseInt(endColumnIndex);j++)
			{
				if(_modelItem[j])
				{
					//alert(j);
					if(j==0|| j==1)
					{
						var liEach = createLI('liEachNews'+j,'liEachNews liBigNews',CreateNewsStoryView,_modelItem[j]);
					var divNewsItemEachContainer = createDiv('divNewsItemEachContainer','divNewsItemEachContainer');
					var divNewsItemEach = createDiv('divNewsItemEach','divNewsItemEach');
					divNewsItemEach.appendChild(createP('pNewsHeadLine'+j, 'pNewsHeadLine', _modelItem[j].headLine));
					divNewsItemEach.appendChild(createP('','pNewsDetailsDateLine',_modelItem[j].dateLine));
					divNewsItemEach.appendChild(createDiv('','divSeprator'));
					if(_modelItem[j].photo)
					{
					var divNewsThumb = createDiv('divNewsThumb','divNewsThumb');
					divNewsThumb.appendChild(createImage('imgEachNewsItem', _modelItem[j].photo, '', ''));
					divNewsItemEach.appendChild(divNewsThumb);
					
					}
					var divNewsContent = createDiv('divNewsContent','divNewsContentBig');
					divNewsContent.appendChild(createP('', '', _modelItem[j].storyHeadLine));
					divNewsItemEach.appendChild(divNewsContent);
					//liEach.appendChild(createDiv('','divSpacer'));
					divNewsItemEachContainer.appendChild(divNewsItemEach);
					//divNewsItemEachContainer.appendChild(createSpan('','spanDottedLine','...'));
					liEach.appendChild(divNewsItemEachContainer);
					ulEach.appendChild(liEach);
					}
					else
					{
					var liEach = createLI('liEachNews'+j,'liEachNews',CreateNewsStoryView,_modelItem[j]);
					var divNewsItemEachContainer = createDiv('divNewsItemEachContainer','divNewsItemEachContainer');
					var divNewsItemEach = createDiv('divNewsItemEach','divNewsItemEach');
					divNewsItemEach.appendChild(createP('pNewsHeadLine'+j, 'pNewsHeadLine', _modelItem[j].headLine));
					divNewsItemEach.appendChild(createP('','pNewsDetailsDateLine',_modelItem[j].dateLine));
					divNewsItemEach.appendChild(createDiv('','divSeprator'));
					if(_modelItem[j].thumb)
					{
					var divNewsThumb = createDiv('divNewsThumb','divNewsThumb');
					divNewsThumb.appendChild(createImage('imgEachNewsItem', _modelItem[j].thumb, '', ''));
					divNewsItemEach.appendChild(divNewsThumb);
					}
					var divNewsContent = createDiv('divNewsContent','divNewsContent');
					divNewsContent.appendChild(createP('', '', _modelItem[j].storyHeadLine));
					divNewsItemEach.appendChild(divNewsContent);
					
					//liEach.appendChild(createDiv('','divSpacer'));
					divNewsItemEachContainer.appendChild(divNewsItemEach);
					//divNewsItemEachContainer.appendChild(createSpan('','spanDottedLine','...'));
					liEach.appendChild(divNewsItemEachContainer);
					ulEach.appendChild(liEach);
					}
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
			//Pick('ulNewsPage').style.width = Pick('divNews').offsetWidth;
		}
		
	},
	CreateNewsListItems:function(_modelItem)
	{
		var divNewsListItem = createDiv('divNewsListItem','divNewsListItem',CreateNewsStoryView,_modelItem);
		var tableNewsContainer = createTable('','tableContainer');
		var rowEachNewsItem = createRow('rowEachNewsItem','rowEachNewsItem');
		if(_modelItem.thumb)
		{
			var colLeft = createColumn('', 'colLeftEachNewsItem');
			var _divHeadline = createDiv('divHeadline','divHeadline');
			//colLeft.appendChild(createSpan('', 'spanHeadLine', _modelItem.headLine));
			_divHeadline.appendChild(createSpan('', 'spanHeadLine', _modelItem.headLine));
			//colLeft.appendChild(_divHeadline);
			colLeft.appendChild(createSpan('', 'spanHeadLine', _modelItem.headLine));
			rowEachNewsItem.appendChild(colLeft);
			var colRight = createColumn('', 'colRightEachNewsItem');
			//colRight.appendChild(createImage('','Resources/Images/TempTestImage.png','imgEachNewsItem',''));
			
			var divNewsThumb = createDiv('divNewsThumb','divNewsThumb');
			divNewsThumb.appendChild(createImage('imgEachNewsItem', _modelItem.thumb, 'imgEachNewsItem', ''));
			//colRight.appendChild(divNewsThumb);
			colRight.appendChild(createImage('imgEachNewsItem', _modelItem.thumb, 'imgEachNewsItem', ''));
			rowEachNewsItem.appendChild(colRight);
		//rowEachNewsItem.appendChild(createImage('','Resources/Images/doted_line.gif','imgBottomBorder',''));
		}
		else
		{
			var colLeft = createColumn('', 'colWithoutImgEachNewsItem');
			//colLeft.colSpan = "2";
			colLeft.appendChild(createSpan('', 'spanHeadLine', _modelItem.headLine));
			rowEachNewsItem.appendChild(colLeft);
		}
		tableNewsContainer.appendChild(rowEachNewsItem);
		divNewsListItem.appendChild(tableNewsContainer);
		//divNewsListItem.appendChild(createImage('','Resources/Images/doted_line.gif','imgBottomBorder',''));
		return divNewsListItem;
	},
	CreateBreadcum:function(_pageCount){
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
			//var totalPageCount = this.handlerData;
			//Change pagination dots
			
			//alert(Pick('divPhotoListWrapper').style.marginLeft);
			var totalPageCount = gNewsPageCount;
			var visibleWidth = Pick('ulNewsPage0').offsetWidth;
			if(newsPageCurrentIndex < totalPageCount){
				if(Pick('divNewsWrapper').style.marginLeft){
					Pick('divNewsWrapper').style.marginLeft = (parseInt(Pick('divNewsWrapper').style.marginLeft) - visibleWidth) +'px';	
				}
				else{
				Pick('divNewsWrapper').style.marginLeft = -(visibleWidth) +'px';	
				}
					
				newsPageCurrentIndex++;
				for(var i = 0;i < totalPageCount;i++)
				{
					Pick('colCenter'+i).className = 'colCenter';
				}
				Pick('colCenter'+ (newsPageCurrentIndex - 1)).className = 'colCenter colCenterActive';	
			}
		}
		catch(ex){
			alert(ex.message);
		}
	},
	ShowPrevPage:function()
	{
		//var totalPageCount = this.handlerData;
		var totalPageCount =  gNewsPageCount;
		var visibleWidth = Pick('ulNewsPage0').offsetWidth;
			if(newsPageCurrentIndex > 1){
				newsPageCurrentIndex--;
				Pick('divNewsWrapper').style.marginLeft = (parseInt(Pick('divNewsWrapper').style.marginLeft) + visibleWidth) +'px';	
				for(var i = 0;i < totalPageCount;i++)
				{
					Pick('colCenter'+i).className = 'colCenter';
				}
				//alert(newsPageCurrentIndex);
			Pick('colCenter'+ (newsPageCurrentIndex - 1)).className = 'colCenter colCenterActive';	
			}
	},
	ActivateKeyBoard:function(){
		shortcut.add("Left",this.ShowPrevPage);
		shortcut.add("Right",this.ShowNextPage);
	},
	RemoveKeyboard:function(){
		shortcut.remove("Left");
		shortcut.remove("Right");
	}
};

/*
FUnctionName:
Description:Will create story of news clicked.Data will come with handlerData of
			corrosponding div click
*/

function CreateNewsStoryView()
{
	//Drop current view
	Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
	var _modelData = this.handlerData;
	var _newsStoryView = new NewsStoryView();
	_newsStoryView.CreateNewsStoryView(_modelData);
}
/*
var currentPageIndex = 0;
function ShowNextPage() {
	if(currentPageIndex < gPageCount-1){
		currentPageIndex++;
		for(var i = 0;i < gPageCount;i++){
			if(Pick('divNewsWrapper'+i)){
			$('#divNewsWrapper'+i).slideToggle("fast");
			}
		}
		if(Pick('divNewsWrapper'+currentPageIndex)){
		$('#divNewsWrapper'+currentPageIndex).show("fast");
		}
	}
}

function ShowPrevPage() {
	if(currentPageIndex > 0){
	currentPageIndex--;
	for(var i = 0;i < gPageCount;i++){
		if(Pick('divNewsWrapper'+i)){
		$('#divNewsWrapper'+i).slideToggle("fast");
		}
	}
	if(Pick('divNewsWrapper'+currentPageIndex)){
	$('#divNewsWrapper'+currentPageIndex).show(500);
	}
	}
}*/

function NewsStoryView()
{

};
var storyPageCurrentIndex = 1;
var gCurrentArticle = 0;
var gArticlePageCount = 0;
NewsStoryView.prototype = 
{
	CreateNewsStoryView:function(_modelData)
	{
		try
		{
			gCurrentArticle = _modelData.index;
			//Column width calculator
			//(Pick('divMain').appendChild(createDiv('divColCalculator','divColCalculator'))).appendChild(createDiv('divSingleColumn','divSingleColumn'));
		this.RemoveKeyboard();
		this.ActivateKeyBoard();
		gArticlePageCount = 0;	
		storyPageCurrentIndex = 1;
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divStoryView = createDiv(_divId,'divStoryView');
		var divStoryViewHeader = createDiv('divStoryViewHeader','divStoryViewHeader');
		var divBackBtn = createDiv('divBackBtn','divBackBtn',GoBackToNewsView,0);
		divStoryViewHeader.appendChild(divBackBtn);
		divStoryViewHeader.appendChild(createP('spanStoryParent','spanStoryParent',SectionDetailsArray[indexClickedSection].name));
		var tableStoryNavigator = createTable('tableStoryNavigator','tableStoryNavigator'); 
		tableStoryNavigator.cellSpacing = '5px';
		var rowStoryNavigator = createRow('rowStoryNavigator','rowStoryNavigator');
		var totalNewsItem = SectionDetailsArray[indexClickedSection].cachedData.length;
		(rowStoryNavigator.appendChild(createClickableColumn('gColLeft','colStoryNavLeft'))).appendChild(createImage('','Resources/Images/photopagingleft.png','imgNavLeft','Left',ShowPrevStoty,gCurrentArticle));
		(rowStoryNavigator.appendChild(createColumn('colStoryNavCenter','colStoryNavCenter'))).appendChild(createSpan('spanNewsNumber','spanNewsNumber','Article '+parseInt(_modelData.index+1)+' of '+totalNewsItem));
		(rowStoryNavigator.appendChild(createClickableColumn('','colStoryNavRight'))).appendChild(createImage('','Resources/Images/photopagingright.png','imgNavRight','right',ShowNextStoty,gCurrentArticle));
		tableStoryNavigator.appendChild(rowStoryNavigator);
		 //divStoryViewHeader.appendChild(tableStoryNavigator);
		 divStoryViewHeader.appendChild(createDiv('divShareBtn','divShareBtn',OnClick_ShareBtn,_modelData.webUrl));
		
		divStoryView.appendChild(divStoryViewHeader);
		(divStoryView.appendChild(createDiv('divColCalculator','divColCalculator'))).appendChild(createDiv('divSingleColumn','divSingleColumn'));
		var divStoryViewWrapper = createDiv('divStoryViewWrapper','divStoryViewWrapper');
		
		divStoryViewWrapper.appendChild(createDiv('','divSeprator'));
		if(bannerUrlStory)
		{
			var divListingAd = createDiv('divListingAd', 'divListingAd', RedirectToWeb, bannerStoryRedirect);
			var imgBanner = createImage('imgAd', bannerUrlStory, 'imgAd', 'Ad Space');
			divListingAd.appendChild(imgBanner);
			divStoryViewWrapper.appendChild(divListingAd);
		}
		var divImageSection = createDiv('divImageSection','divImageSection');
		
		var divHeadLine = createDiv();
		//divHeadLine.appendChild(createSpan('','spanNewsDetailsHeadLine',_modelData.headLine));
		divImageSection.appendChild(createSpan('','spanNewsDetailsHeadLine',_modelData.headLine));
		
		(divImageSection.appendChild(createDiv('','divNewsDetailsDateLine'))).appendChild((createSpan('','spanNewsDetailsDateLine',_modelData.dateLine)));
		if(_modelData.photo)
		{
			var divImage = createDiv('', 'divNewsStoryImage');
			//divImage.appendChild(createImage('','Resources/Images/TempTestImage.png','imgNewsStory'));
			divImage.appendChild(createImage('', _modelData.photo, 'imgNewsStory', 'Loading...'));			
			divImageSection.appendChild(divImage);
			divImageSection.appendChild(createSpan('', 'spanStoryImgCaption', _modelData.caption));
		}
		divImageSection.appendChild(createDiv('','imgBottomBorder'));
		divStoryViewWrapper.appendChild(divImageSection);
		divStoryViewWrapper.appendChild(createP('articleNewsStory','spanNewsStoryFullScreen',_modelData.story));
		var divBreadCum = createDiv('divBreadCum','divBreadCumStory');
		divStoryView.appendChild(divStoryViewWrapper);
		var divNewsStoryFooter = createDiv('divNewsStoryFooter','divNewsStoryFooter');
		
		divNewsStoryFooter.appendChild(divBreadCum);
		divNewsStoryFooter.appendChild(tableStoryNavigator);
		divStoryView.appendChild(divNewsStoryFooter);
		//Sharing OPtions
		var divNewsStoryShare = createDiv('divNewsStoryShare','divNewsStoryShare');
		divNewsStoryShare.appendChild(CreateSharingOption(_modelData.webUrl));
		divStoryView.appendChild(divNewsStoryShare);
		Pick('divMain').appendChild(divStoryView);
		}
		catch(ex)
		{
			alert(ex.message);
		}
		finally{
			//32 stands for 2em ie 16px = 1em,margin of columns due to -webkit.
			//Pick('divImageSection').style.width = (Pick('divNews').offsetWidth/2 + 16) + 'px';
			//Pick('articleNewsStory').style.webkitColumnWidth = (Pick('divNews').offsetWidth/2 -16) + 'px';
			//Pick('articleNewsStory').style.webkitColumnWidth =  '353px';
			var colWidth = Pick('divSingleColumn').offsetWidth;
			Pick('divStoryViewWrapper').style.webkitColumnWidth =  colWidth+'px';
						
			var articleScrollWidth = Pick('divStoryViewWrapper').scrollWidth;
			var visibleWidth = Pick('divNews').offsetWidth;
			var articlePageCount = Math.ceil(articleScrollWidth/visibleWidth);
			gArticlePageCount = articlePageCount;
			//var pageCount =Math.ceil(parseInt(_newsModel.length)/8); 
			//var divBreadCum = createDiv('divBreadCum','divBreadCum');
			var tableBreadCum = createTable('tableBreadCum','tableBreadCum');
			tableBreadCum.cellSpacing = '5px';
			var rowBreadCum = createRow('rowBreadCum','rowBreadCum');
			var colLeft = createClickableColumn('','colLeft',this.ShowPrevPage,articlePageCount);
			rowBreadCum.appendChild(colLeft);
			var colCenter = createColumn('','colCenter');
			colCenter.appendChild(createSpan('spanBreadCum', 'spanBreadCum', 'Page1 of '+articlePageCount));
			rowBreadCum.appendChild(colCenter);
			var colRight = createClickableColumn('colRight','colRight',this.ShowNextPage,articlePageCount);
			rowBreadCum.appendChild(colRight);
			tableBreadCum.appendChild(rowBreadCum);
			//divBreadCum.appendChild(tableBreadCum);
			Pick('divBreadCum').appendChild(tableBreadCum);
			Pick('divStoryViewWrapper').style.width = articleScrollWidth +'px';
		}
	},
	ShowNextPage:function(){
		try
		{
			//alert(Pick('divStoryViewWrapper').style.marginLeft);
			var totalPageCount = gArticlePageCount;
			var visibleWidth = Pick('divNews').offsetWidth;
			var paddingOfArticleP = 15;
			if(storyPageCurrentIndex < totalPageCount){
				if(Pick('divStoryViewWrapper').style.marginLeft){
					Pick('divStoryViewWrapper').style.marginLeft = (parseInt(Pick('divStoryViewWrapper').style.marginLeft) - visibleWidth - paddingOfArticleP) +'px';	
				}
				else{
				Pick('divStoryViewWrapper').style.marginLeft = -(visibleWidth) - (paddingOfArticleP) +'px';	
				}
				storyPageCurrentIndex++;
				Pick('spanBreadCum').innerHTML= 'Page'+storyPageCurrentIndex+' of '+totalPageCount;		
			}
		}
		catch(ex){
			alert(ex.message);
		}
		
	},
	ShowPrevPage:function(){
		
		var totalPageCount = gArticlePageCount;
		var visibleWidth = Pick('divNews').offsetWidth;
		var paddingOfArticleP = 15;
			if(storyPageCurrentIndex > 1){
				storyPageCurrentIndex--;
				Pick('divStoryViewWrapper').style.marginLeft = (parseInt(Pick('divStoryViewWrapper').style.marginLeft) + visibleWidth + paddingOfArticleP) +'px';		
			}
			Pick('spanBreadCum').innerHTML= 'Page'+storyPageCurrentIndex+' of '+totalPageCount;
	},
	ActivateKeyBoard:function(){
		shortcut.add("Left",ShowPrevStoty);
		shortcut.add("Right",ShowNextStoty);
		shortcut.add("Up",this.ShowNextPage);
		shortcut.add("Down",this.ShowPrevPage);
	},
	RemoveKeyboard:function(){
		shortcut.remove("Left");
		shortcut.remove("Right");
		shortcut.remove("Up");
		shortcut.remove("Down");
	}
}

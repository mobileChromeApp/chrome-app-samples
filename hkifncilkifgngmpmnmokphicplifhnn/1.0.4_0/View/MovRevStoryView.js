function MovRevStoryView(){

}
var storyPageCurrentIndex = 1;
var gCurrentMovRev = 0;
var gMovRevPageCount = 0;
MovRevStoryView.prototype = 
{
	CreateView:function(_modelData)
	{
		try
		{
			//Column width calculator
			//(Pick('divMain').appendChild(createDiv('divColCalculator','divColCalculator'))).appendChild(createDiv('divSingleColumn','divSingleColumn'));
		gCurrentMovRev = _modelData.index;
		gMovRevPageCount = 0;
		this.RemoveKeyboard();
		this.ActivateKeyBoard();	
		storyPageCurrentIndex = 1;
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divStoryView = createDiv(_divId,'divStoryView');
		var divStoryViewHeader = createDiv('divStoryViewHeader','divStoryViewHeader');
		var divBackBtn = createDiv('divBackBtn','divBackBtn',GoBackToMovRevView,0);
		divStoryViewHeader.appendChild(divBackBtn);
		divStoryViewHeader.appendChild(createP('spanStoryParent','spanStoryParent',SectionDetailsArray[indexClickedSection].name));
		divStoryViewHeader.appendChild(createDiv('divShareBtn','divShareBtn',OnClick_ShareBtn,_modelData.webUrl));
		var tableStoryNavigator = createTable('tableStoryNavigator','tableStoryNavigator');
		tableStoryNavigator.cellSpacing = '5px';
		var rowStoryNavigator = createRow('rowStoryNavigator','rowStoryNavigator');
		var totalNewsItem = SectionDetailsArray[indexClickedSection].cachedData.length;
		(rowStoryNavigator.appendChild(createClickableColumn('','colStoryNavLeft'))).appendChild(createImage('','Resources/Images/photopagingleft.png','imgNavLeft','Left',ShowPrevMovRevStoty,gCurrentMovRev));
		(rowStoryNavigator.appendChild(createColumn('colStoryNavCenter','colStoryNavCenter'))).appendChild(createSpan('spanNewsNumber','spanNewsNumber','Article '+parseInt(_modelData.index+1)+' of '+totalNewsItem));
		(rowStoryNavigator.appendChild(createClickableColumn('','colStoryNavRight'))).appendChild(createImage('','Resources/Images/photopagingright.png','imgNavRight','right',ShowNextMovRevStoty,gCurrentMovRev));
		tableStoryNavigator.appendChild(rowStoryNavigator);
		//divStoryViewHeader.appendChild(tableStoryNavigator);
		
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
		var divImageSection = createDiv('divImageSection','divImageSection heightParent');
		
		var divHeadLine = createDiv();
		//divHeadLine.appendChild(createSpan('','spanNewsDetailsHeadLine',_modelData.headLine));
		divImageSection.appendChild(createSpan('','spanNewsDetailsHeadLine movRevStoryFontDet fontSize28',_modelData.headLine));
		
		(divImageSection.appendChild(createDiv('','divNewsDetailsDateLine'))).appendChild((createSpan('','spanNewsDetailsDateLine',_modelData.dateLine)));
		if(_modelData.photo)
		{
			var divImage = createDiv('', 'divNewsStoryImage');
			//divImage.appendChild(createImage('','Resources/Images/TempTestImage.png','imgNewsStory'));
			divImage.appendChild(createImage('', _modelData.photo, 'imgNewsStory', 'Loading...'));			
			divImageSection.appendChild(divImage);
			//divImageSection.appendChild(createSpan('', 'spanStoryImgCaption', _modelData.caption));
		}
		divImageSection.appendChild(createDiv('','movRevStoryImgBorder'));
		var strCricsRating = "Critic's Rating: ";
		//(divImageSection.appendChild(createP('', 'floatLeft widthParent marginLeft movRevStoryFontDet fintSize14', '<strong>'+strCricsRating+'</strong>'))).appendChild(CreateStars(_modelData.editorRating));
		var divStarAndHeadline = createDiv('divStarAndHeadline','divStarAndHeadline');
					
					divStarAndHeadline.appendChild(createP('pNewsHeadLine', 'pNewsHeadLine movRevStoryFontDet fontSize14 floatLeft paddingLeft15','<strong>'+strCricsRating+'</strong>'));
					divStarAndHeadline.appendChild(CreateStars(_modelData.editorRating));
		divImageSection.appendChild(divStarAndHeadline);
		divImageSection.appendChild(createDiv('','movRevStoryImgBorder'));
		
		divImageSection.appendChild(createP('', 'floatLeft widthParent marginLeft movRevStoryFontDet fintSize14', '<strong>Cast: </strong>'+_modelData.starCast));
		divImageSection.appendChild(createDiv('','movRevStoryImgBorder'));
		
		divImageSection.appendChild(createP('', 'floatLeft widthParent marginLeft movRevStoryFontDet fintSize14', '<strong>Direction: </strong>'+_modelData.director));
		divImageSection.appendChild(createDiv('','movRevStoryImgBorder'));
		
		divImageSection.appendChild(createP('', 'floatLeft widthParent marginLeft movRevStoryFontDet fintSize14', '<strong>Genre: </strong>'+_modelData.genere));
		divImageSection.appendChild(createDiv('','movRevStoryImgBorder'));
		
		divImageSection.appendChild(createP('', 'floatLeft widthParent marginLeft movRevStoryFontDet fintSize14', '<strong>Duration: </strong>'+_modelData.duration));
		divImageSection.appendChild(createDiv('','movRevStoryImgBorder'));
		divStoryViewWrapper.appendChild(divImageSection);
		divStoryViewWrapper.appendChild(createP('articleNewsStory','spanNewsStoryFullScreen',_modelData.story));
		var divBreadCum = createDiv('divBreadCum','divBreadCumStory');
		divStoryView.appendChild(divStoryViewWrapper);
		var divNewsStoryFooter = createDiv('divNewsStoryFooter','divNewsStoryFooter');
		
		divNewsStoryFooter.appendChild(divBreadCum);
		divNewsStoryFooter.appendChild(tableStoryNavigator);
		divStoryView.appendChild(divNewsStoryFooter);
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
			gMovRevPageCount = articlePageCount;
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
			var totalPageCount = gMovRevPageCount;
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
		
		var totalPageCount = gMovRevPageCount;
		var visibleWidth = Pick('divNews').offsetWidth;
		var paddingOfArticleP = 15;
			if(storyPageCurrentIndex > 1){
				storyPageCurrentIndex--;
				Pick('divStoryViewWrapper').style.marginLeft = (parseInt(Pick('divStoryViewWrapper').style.marginLeft) + visibleWidth + paddingOfArticleP) +'px';		
			}
			Pick('spanBreadCum').innerHTML= 'Page'+storyPageCurrentIndex+' of '+totalPageCount;
	},
	ActivateKeyBoard:function(){
		shortcut.add("Left",ShowPrevMovRevStoty);
		shortcut.add("Right",ShowNextMovRevStoty);
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

function MovRevAllLangView(){
	
}
MovRevAllLangView.prototype = 
{
	CreateView:function(_model)
	{try
		{
		var _divId = SectionDetailsArray[indexClickedSection].divId;
		var divMovRevAllLang = createDiv(_divId,'divNewsContainer');
		divMovRevAllLang.appendChild(this.CreateHeader());
		divMovRevAllLang.appendChild(this.CreateContent());
		divMovRevAllLang.appendChild(this.CreateFooter());
		Pick('divMain').appendChild(divMovRevAllLang);
		}
		catch(ex){
			alert(ex.message);
		}
		finally{
			
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
			divFirstElement.appendChild(createSpan('','spanFirst','All'));
			divFirstElement.appendChild(createDiv('','imgDropDownMovRev',ToogleLanguageDD));
			divLangDropDown.appendChild(divFirstElement);
			var divRestElements = createDiv('divRestElementsLang','divRestElements');
				for(var i = 0;i < SectionDetailsArray.length;i++){
					if(SectionDetailsArray[i].name == 'Movie Reviews'){
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItemsMovRev',CreateShowViews,i);
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
			divMovRevAllHeaderWrapper.appendChild(divSortSection);
			divMovRevAllHeader.appendChild(divMovRevAllHeaderWrapper);
		return divMovRevAllHeader;
	},
	CreateContent:function(_model)
	{
		var divMovRevAllContent = createDiv('divMovRevAllContent','divMovRevAllContent');
		
		return divMovRevAllContent;
	},
	CreateFooter:function()
	{
		var divMovRevAllFooter = createDiv('divMovRevAllFooter','divMovRevAllFooter');
		
		return divMovRevAllFooter;
	}
}

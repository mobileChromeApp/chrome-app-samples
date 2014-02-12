function HeaderView()
{
}
HeaderView.prototype = {
	CreateHeaderView: function(){
		try {
			var divHeader = createDiv('divHeader','divHeader');
			var divLogo = createDiv('divLogo','divLogo');
			//divLogo.appendChild(createP('','','THE TIMES OF INDIA'));
			//divLogo.appendChild(createImage('imgLogo', 'Resources/Images/headerimage.png', 'imgLogo', 'Times Of India'));
			divHeader.appendChild(divLogo);
			Pick('divMain').appendChild(divHeader);
			var divSideBar = createDiv('divSideBar','divSideBar');
			var divDDMenu = createDiv('divDDMenu','divDDMenu');
			var divDDCityMenu = createDiv('divDDCityMenu', 'divDDCityMenu');
			var divDDPhotosMenu = createDiv('divDDPhotosMenu','divDDPhotosMenu');
			var divDDVideosMenu = createDiv('divDDVideosMenu','divDDVideosMenu');
			var divDDMovRevMenu = createDiv('divDDMovRevMenu','divDDMovRevMenu');			
			var divMenuItemsHeader = createDiv('','divMenuItemsHeader');
				divMenuItemsHeader.appendChild(createSpan('','spanMwnuItems','Sections'));
				divDDMenu.appendChild(divMenuItemsHeader);
			for(var i = 0;i < SectionDetailsArray.length;i++)
			{
				if(SectionDetailsArray[i].hasSubSection)
				{
					if (SectionDetailsArray[i].name == 'City') {
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItems');
						divMenuItems.appendChild(createSpan('spanSideBarItems','cityHeader',SectionDetailsArray[i].name,CreateShowViews,i));
						//divMenuItems.appendChild(createImage('imgDropDown', 'Resources/Images/citydropdown.png', 'imgDropDown', 'Nav', ToggleDropDown,0));
						divMenuItems.appendChild(createDiv('imgDropDown0','imgDropDown',ToggleDropDown,0));
						divDDMenu.appendChild(divMenuItems);
					}
					if (SectionDetailsArray[i].name == 'Photos') {
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItems');
						divMenuItems.appendChild(createSpan('','cityHeader',SectionDetailsArray[i].name,CreateShowViews,i));
						divMenuItems.appendChild(createDiv('imgDropDown1','imgDropDown',ToggleDropDown,1));
						divDDMenu.appendChild(divMenuItems);
					}
					if (SectionDetailsArray[i].name == 'Videos') {
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItems');
						divMenuItems.appendChild(createSpan('','cityHeader',SectionDetailsArray[i].name,CreateShowViews,i));
						divMenuItems.appendChild(createDiv('imgDropDown2','imgDropDown',ToggleDropDown,2));
						divDDMenu.appendChild(divMenuItems);
					}
					if (SectionDetailsArray[i].name == 'Movie Reviews') {
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItems',CreateShowViews,i);
						divMenuItems.appendChild(createSpan('','spanMwnuItems',SectionDetailsArray[i].name));
						divDDMenu.appendChild(divMenuItems);
					}		
				}
				else
				{
					if(SectionDetailsArray[i].isCityName){
						var divMenuItems = createDiv('divMenuItems'+i, 'divMenuItems', CreateShowViews, i);
						divMenuItems.appendChild(createSpan('', 'spanMwnuItems', SectionDetailsArray[i].name));
						divDDCityMenu.appendChild(divMenuItems);
					}
					else if(SectionDetailsArray[i].isPhotoSubSection){
						var divMenuItems = createDiv('divMenuItems'+i, 'divMenuItems', CreateShowViews, i);
						divMenuItems.appendChild(createSpan('', 'spanMwnuItems', SectionDetailsArray[i].name));
						divDDPhotosMenu.appendChild(divMenuItems);
					}
					else if(SectionDetailsArray[i].isVideoSubSection){
						var divMenuItems = createDiv('divMenuItems'+i, 'divMenuItems', CreateShowViews, i);
						divMenuItems.appendChild(createSpan('', 'spanMwnuItems', SectionDetailsArray[i].name));
						divDDVideosMenu.appendChild(divMenuItems);
					}
					else if(SectionDetailsArray[i].isMovieReviewSubSection){
						var divMenuItems = createDiv('divMenuItems'+i, 'divMenuItems', CreateShowViews, i);
						divMenuItems.appendChild(createSpan('', 'spanMwnuItems', SectionDetailsArray[i].name));
						divDDMovRevMenu.appendChild(divMenuItems);
					}
					else{
						var divMenuItems = createDiv('divMenuItems'+i,'divMenuItems',CreateShowViews,i);
				divMenuItems.appendChild(createSpan('','spanMwnuItems',SectionDetailsArray[i].name));
				divDDMenu.appendChild(divMenuItems);
					}
				}
			}
			divSideBar.appendChild(divDDMenu);
			divSideBar.appendChild(divDDCityMenu);
			divSideBar.appendChild(divDDPhotosMenu);//Photos subsection
			divSideBar.appendChild(divDDVideosMenu);//Videos subsection
			//divHeader.appendChild(divDDMovRevMenu);
			Pick('divMain').appendChild(divSideBar);
		}
		catch(ex)
		{
			alert(ex.message);
		}
	}
}

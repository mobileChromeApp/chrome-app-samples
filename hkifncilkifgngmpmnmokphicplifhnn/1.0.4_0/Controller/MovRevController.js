function ToogleLanguageDD(){
	//Show(Pick('divRestElementsLang'));
	$('#divRestElementsLang').toggle(500);
}
function ShowShortOptionDD(){
	
}
function UpdateLangDropDown(){
	if(SectionDetailsArray[indexClickedSection].name == 'Movie Reviews'){
		Hide(Pick('divMenuItemsAllLang'));
		Pick('spanFirstLangDD').innerHTML = 'All';
	}
	else
	{
		Show(Pick('divMenuItemsAllLang'));
		Hide(Pick('divMenuItems'+indexClickedSection));
		Pick('spanFirstLangDD').innerHTML = SectionDetailsArray[indexClickedSection].name;
	}
}
function CreateMovRefStoryView(e){
	StopBubbling(e);
	Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
	var _movRevStoryView = new MovRevStoryView();
	var _model = this.handlerData;
	_movRevStoryView.CreateView(_model);
}
function GoBackToMovRevView()
{
	Pick('divMain').removeChild(Pick('divNews'));
	var _movRevView = new MovRevLangView();
	_movRevView.CreateView(SectionDetailsArray[indexClickedSection].cachedData);
}
function CreateStars(_rating){
	var tableRating = createTable('tableMovRevStar','tableMovRevStar');
	var rowRating = createRow('rowMovRevStar','rowMovRevStar');
	var noOfTotalStar = 5;
	var noOfFullStar = Math.floor(_rating);
	var noOfDisableStar = noOfTotalStar - Math.ceil(_rating);
	var noOfHalfStar = 0;
	if(_rating > noOfFullStar){
		noOfHalfStar = 1;
	}
	for(var i = 0;i < noOfFullStar;i++){
		var colFullStar = createColumn('','colFulStar');
		rowRating.appendChild(colFullStar);
	}
	for(var j = 0;j < noOfHalfStar;j++){
		var colHalfStar = createColumn('','colHalfStar');
		rowRating.appendChild(colHalfStar);
	}
	for(var k =0;k < noOfDisableStar;k++){
		var colDisableStar = createColumn('','colDisableStar');
		rowRating.appendChild(colDisableStar);
	}
	tableRating.appendChild(rowRating);
	return tableRating;
}
function ShowPrevMovRevStoty()
{
	if(gCurrentMovRev > 0)
	{
	var _index = parseInt(gCurrentMovRev - 1);
	var _modelData = SectionDetailsArray[indexClickedSection].cachedData[_index];
	Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
	var _movRevStoryView = new MovRevStoryView();
			_movRevStoryView.CreateView(_modelData);
	var totalNewsItem = SectionDetailsArray[indexClickedSection].cachedData.length;
	Pick('spanNewsNumber').innerHTML = ('Article '+parseInt(_index+1)+' of '+totalNewsItem).toString();
	}
	else
	{
		//alert('You have reached left most end.');
	}
	
}
function ShowNextMovRevStoty()
{
		if(gCurrentMovRev < parseInt(SectionDetailsArray[indexClickedSection].cachedData.length - 1))
		{
			var _index = parseInt(gCurrentMovRev + 1);
			var _modelData = SectionDetailsArray[indexClickedSection].cachedData[_index];
			Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
			var _movRevStoryView = new MovRevStoryView();
			_movRevStoryView.CreateView(_modelData);
			var totalNewsItem = SectionDetailsArray[indexClickedSection].cachedData.length;
			Pick('spanNewsNumber').innerHTML = ('Article '+parseInt(_index+1)+' of '+totalNewsItem).toString();
	
		}
	else
	{
		//alert('You have reached right most end.');
	}
}


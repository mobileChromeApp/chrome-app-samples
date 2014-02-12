
function ShowPrevStoty()
{
	if(gCurrentArticle> 0)
	{
	var _index = parseInt(gCurrentArticle - 1);
	var _modelData = SectionDetailsArray[indexClickedSection].cachedData[_index];
	Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
	var _newsStoryView = new NewsStoryView();
	_newsStoryView.CreateNewsStoryView(_modelData);
	var totalNewsItem = SectionDetailsArray[indexClickedSection].cachedData.length;
	Pick('spanNewsNumber').innerHTML = ('Article '+parseInt(_index+1)+' of '+totalNewsItem).toString();
	}
	else
	{
		//alert('You have reached left most end.');
	}
	
}
function ShowNextStoty()
{
		if(gCurrentArticle < parseInt(SectionDetailsArray[indexClickedSection].cachedData.length - 1))
		{
			var _index = parseInt(gCurrentArticle + 1);
			var _modelData = SectionDetailsArray[indexClickedSection].cachedData[_index];
			Pick('divMain').removeChild(Pick(SectionDetailsArray[indexClickedSection].divId));
			var _newsStoryView = new NewsStoryView();
			_newsStoryView.CreateNewsStoryView(_modelData);
			var totalNewsItem = SectionDetailsArray[indexClickedSection].cachedData.length;
			Pick('spanNewsNumber').innerHTML = ('Article '+parseInt(_index+1)+' of '+totalNewsItem).toString();
	
		}
	else
	{
		//alert('You have reached right most end.');
	}
}

function SwipeLeft()
{
	alert('SwipeLeft');
}
function GoBackToNewsView()
{
	Pick('divMain').removeChild(Pick('divNews'));
	var _newsView = new NewsView();
	_newsView.CreateNewsView(SectionDetailsArray[indexClickedSection].cachedData);
}
function OnClick_ShareBtn(){
	$('#divNewsStoryShare').toggle(500);
}

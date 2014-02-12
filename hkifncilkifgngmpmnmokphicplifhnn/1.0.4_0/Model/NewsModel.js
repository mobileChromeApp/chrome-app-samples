function NewsModel(_parsedData)
{
	 var newsModelArray = new Array();
	for(var i = 0;i < _parsedData.NewsItem.length;i++)
	{
		var _newEntity = _parsedData.NewsItem[i];
		newsModelArray.push(new NewsModelEntity(_newEntity,i));
	}
	return newsModelArray;
}

function NewsModelEntity(_data,i)
{
	this.index = i;
	
	this.headLine = _data.HeadLine;
	this.newsItemId = _data.NewsItemId;
	this.byLine = _data.ByLine;
	this.webUrl = _data.WebURL;
	this.dateLine = _data.DateLine;
	this.caption = _data.Caption;
	if(_data.Thumb)
	{
		this.thumb = _data.Thumb;
	}
	this.photo = _data.Photo;
	this.storyHeadLine = _data.Story.toString();
	this.story = '<p/>' +_data.Story.toString().replace(/(\n\n|\n\s\n)/g, "<p/>");
	this.photoCaption = _data.PhotoCaption;
}

function MovRevModelLang(_parsedData){
	try {
		var MovRevModelLangArray = new Array();
		var numberOfItems = _parsedData.NewsML.length;
		for (var i = 0; i < numberOfItems; i++) {
			MovRevModelLangArray.push(new EachMovRevLangDetails(_parsedData.NewsML[i], i));
			}
		return MovRevModelLangArray;
	}
	catch(ex)
	{
		alert(ex.message);
	}
}

function EachMovRevLangDetails(_eachItemDetails,_index){
	this.index = _index;
	this.headLine = _eachItemDetails.NewsLines.HeadLine;
	this.byLine =  _eachItemDetails.NewsLines.ByLine;
	this.dateLine = _eachItemDetails.NewsLines.DateLine;
	var _newsComponent = _eachItemDetails.NewsComponent;
	for(var i = 0;i < _newsComponent.length; i++){
		var roleName =_newsComponent[i].Role["@FormalName"].toString();
		switch(roleName){
			case 'Rating':
			this.editorRating = _newsComponent[i].ContentItem.DataContent["media-rating"];
			break;
			case 'Cast':
			this.starCast = _newsComponent[i].ContentItem.DataContent["media-rating"];
			break;
			case 'Director':
			this.director = _newsComponent[i].ContentItem.DataContent["media-rating"];
			break;
			case 'Genere':
			this.genere = _newsComponent[i].ContentItem.DataContent["media-rating"];
			break;
			case 'Duration':
			this.duration = _newsComponent[i].ContentItem.DataContent["media-rating"];
			break;
			
			case 'Category':
			this.langCateg = _newsComponent[i].ContentItem.DataContent["media-category"];
			break;
			case 'WebURL':
			this.webUrl = _newsComponent[i].ContentItem.DataContent["media-caption"];
			break;
			case 'Caption':
			this.caption = _newsComponent[i].ContentItem.DataContent["media-caption"];
			break;
			case 'Keywords':
			this.keywords = _newsComponent[i].ContentItem.DataContent["media-keyword"];
			break;
			case 'Photo':
			this.photo = _newsComponent[i].ContentItem["@Href"];
			break;
			case 'Photo-Caption':
			this.photoCaption = _newsComponent[i].ContentItem["media-caption"];
			break;
			case 'Thumb':
			this.thumb = _newsComponent[i].ContentItem["@Href"];
			break;
			case 'Story':
			var _story = _newsComponent[i].ContentItem.DataContent.body["body.content"];
			this.story = '<p/>' +_story.replace(/(\n\n)/g, "<p/>");
			break;
			default:
			break;
		} 
	}
}

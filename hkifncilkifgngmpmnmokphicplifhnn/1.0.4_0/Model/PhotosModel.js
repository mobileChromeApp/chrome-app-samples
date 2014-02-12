function PhotosModel(_parsedData)
{
	try {
		var photosModelArray = new Array();
		var numberOfSlideShow = _parsedData.NewsML.length;
		for (var i = 0; i < numberOfSlideShow; i++) {
			photosModelArray.push(new PhotosAlbumArray(_parsedData.NewsML[i], i));
			}
		return photosModelArray;
	}
	catch(ex)
	{
		alert(ex.message);
	}
}


function PhotosAlbumArray(_data,i)
{
	this.index = i;
	this.headLine = _data.NewsLines.HeadLine;
	if(_data.NewsLines.SlugLine)
	{
		this.headLine = _data.NewsLines.SlugLine;
	}
	this.caption = _data.NewsComponent[0].ContentItem.DataContent["media-caption"];
	this.thumb = _data.NewsComponent[2].ContentItem.DataContent["media-caption"]+"&resizemode=1&width=195&height=130";
	this.photo = _data.NewsComponent[1].ContentItem.DataContent["media-caption"];
	this.slideShowUrl = -1;
	this.slideShow = -1;
	for(var j = 0;j < _data.NewsComponent.length;j++)
	{
			if(_data.NewsComponent[j].Role["@FormalName"] == "Slideshowlink"){
				this.slideShowUrl = _data.NewsComponent[j].ContentItem.DataContent["media-caption"]["slideshow"];	
			}
			else{
				if(_data.NewsComponent[j].ContentItem.DataContent["media-caption"]["slideshow"]){
					this.slideShow = _data.NewsComponent[j].ContentItem.DataContent["media-caption"]["slideshow"];
				}
			}
		}
}

function AllPhotosListInAlbumModel(_parsedData)
{
	try {
		var photosModelArray = new Array();
		if(_parsedData.NewsML.length != undefined){
		var nofphotos = _parsedData.NewsML.length;
		for (var i = 0; i < nofphotos; i++) {
			var _eachPhotoData = _parsedData.NewsML[i];
			photosModelArray.push(new EachPhotosDeatails(_eachPhotoData,i));
			}
		}
		else{
			var _eachPhotoData = _parsedData.NewsML.NewsItem;
			photosModelArray.push(new EachPhotosDeatails(_eachPhotoData,0));
		}
		return photosModelArray;
	}
	catch(ex)
	{
		alert(ex.message);
	}
}

function EachPhotosDeatails(_data,i)
{
	this.index = i;
	this.caption = _data.NewsComponent[0].ContentItem.DataContent["media-caption"];
	this.photo = _data.NewsComponent[1].ContentItem.DataContent["media-caption"];
	this.thumb = _data.NewsComponent[2].ContentItem.DataContent["media-caption"];
	this.webUrl = _data.NewsComponent[3].ContentItem.DataContent["media-caption"];
	
}

var _imageUrlArray;
function MakeArrayOfPhotsUrl(_rtrnData)
{
	_imageUrlArray = new Array();
	 var _parsedData = JSON.parse(_rtrnData);
	 var numberOfSlideShow = _parsedData.NewsML.length;
	 for(var i= 0;i < numberOfSlideShow;i++)
	 {
	 	var _imageUrl = _parsedData.NewsML[i].NewsComponent[1].ContentItem.DataContent["media-caption"];
		_imageUrlArray.push(_imageUrl);
	 }
}

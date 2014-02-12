/**
 * @author Dewesh
 */
function VideosModel(_parsedData)
{
	var arrVideoModel = new Array();
	var itemList = _parsedData.channel.item;
	for(var i = 0;i < itemList.length;i++)
	{
		arrVideoModel.push(new EachVideoDetails(itemList[i],i));
	}
	return arrVideoModel;
}
function EachVideoDetails(_data,_index)
{
	this.videoUrl = _data.link;	
	var mediaContent = _data.mediaContent;
	var mediaThumbnail = mediaContent.mediaThumbnail["@url"];
	this.thumb = mediaThumbnail;
	this.caption = _data.title;
}

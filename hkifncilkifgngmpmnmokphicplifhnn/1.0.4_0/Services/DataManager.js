/*
 * Author:Dewesh Kumar
 * Date:18/01/2011
 * Description:It will fetch data from server,parse fetched data,bind to ModelObject 
 * and will return to calling agent(Controller here).
 */
/****************************************************************************************/
/*
 * Function Name:
 * InParam:
 * Return Type:
 * Return Value:
 * Description
 */

function DataManager(){
	
};

DataManager.prototype =
{		
	GetFeedData:function(_arrayIndex,_onSuccessFunc)
		{
			var _currentUrl = SectionDetailsArray[_arrayIndex].url;
			var _httpManager = new HttpManager();
			_httpManager.GetFeedData(_currentUrl,_onSuccessFunc);
		},
		GetFeedPhotosList:function(_albumUrl,_onSuccessFunc)
		{
			var _httpManager = new HttpManager();
			_httpManager.GetFeedData(_albumUrl,_onSuccessFunc);
		},
		GetLocalFeedData:function(_localUrl,_onSuccessFunc)
		{
			var _httpManager = new HttpManager();
			_httpManager.GetFeedData(_localUrl,_onSuccessFunc);
		},
		GetAdData:function(_url,_onSuccessFunc)
		{
			var _httpManager = new HttpManager();
			_httpManager.GetXmlData(_url,_onSuccessFunc);
		}		
};

/**
 * @author mac
 */
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
function HttpManager()
{
}
HttpManager.prototype = 
{
	GetFeedData:function(_url,_onSuccessFunction)
	{
		//If browser is firefox..
		if(isBrowser()){
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		}
					$.ajax({
			url: _url,
			type: "GET",
			dataType: "text",
			success: _onSuccessFunction,
			error: this.OnError,
			async:false
				});
	},
	GetXmlData:function(_url,_onSuccessFunction)
	{
		if(isBrowser()){
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		}
		$.ajax({
			url: _url,
			type: "GET",
			dataType: "xml",
			success: _onSuccessFunction,
			error: this.OnError,
			async:false
				});
	},
	OnError:function(XMLHttpRequest, textStatus, thrownError)
			{
			alert('HTTP Error status ' + '' + XMLHttpRequest.status + '' + '.Http call failed.');
			}
}



			
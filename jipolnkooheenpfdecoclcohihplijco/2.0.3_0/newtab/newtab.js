$(window).bind("load", function() {
	showStandard();
});
function showStandard(){
	$("body").hide();
	chrome.tabs.update({
		url: 'chrome-internal://newtab/'
	});
}

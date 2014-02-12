jQuery.noConflict();

(function($) {
	(chrome.extension.sendMessage ? chrome.extension.sendMessage : chrome.extension.sendRequest)({method: "getURL", path: "html/themes.html"}, function(response) {
		$('#navAccount').before("<li class='navItem middleItem' id='fbThemeGalleryLink'><a class='navLink' target='_new' href='"+response.url+"' accesskey='1'>Themes</a></li>");
	});
})(jQuery);
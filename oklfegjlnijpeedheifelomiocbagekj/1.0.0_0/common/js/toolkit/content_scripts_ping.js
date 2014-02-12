if (document.location === 'about:blank' ||
		!(document.documentElement instanceof HTMLElement)) {
	return; // Only run on HTML pages
}

jQuery.noConflict();

(function($) {
	$(function(){
		(chrome.extension.sendMessage ? chrome.extension.sendMessage : chrome.extension.sendRequest)({method: "getPingData"}, function(response) {
			if (response && response.pingUrl && response.pingData) {
				var pingData = $.param(response.pingData);
				var form = "<form method='POST' action='"+response.pingUrl+"' id='pingBackend' target='pingBackendResult'>";
				function buildFormInput(key, value) {
					if (Object.prototype.toString.call(value) === '[object Object]') {
						var form = "";
						$.each(value, function(valueKey, valueValue) {
							form += buildFormInput(key+"["+valueKey+"]", valueValue);
						});
						return form;
					}
					else {
						return "<input type='hidden' name='"+key+"' value='"+value+"'/>";
					}
				}
				$.each(response.pingData, function (key, value) {
					form += buildFormInput(key, value);
				});
				form += "</form><iframe style='display: none; height: 1px; width: 1px;' height='a' width='a' name='pingBackendResult'></frame>";
				$('body').prepend(form);
				$('body').prepend("<script type='text/javascript'>document.getElementById('pingBackend').submit();</script>");
			}
		});
	});
})(jQuery);
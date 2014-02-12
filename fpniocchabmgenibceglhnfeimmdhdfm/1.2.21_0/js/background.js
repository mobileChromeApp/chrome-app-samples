chrome.app.runtime.onLaunched.addListener(function () {
	'use strict';

	chrome.app.window.create('index.html', {
		'bounds': {
			'width': 1280,
			'height': 720
		}
	});
});

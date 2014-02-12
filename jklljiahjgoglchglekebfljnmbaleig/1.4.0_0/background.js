chrome.app.runtime.onLaunched.addListener(function (launchData) {
  chrome.app.window.create('index.html', {
  	minWidth: Math.max(Math.min(window.screen.availWidth, 1000), 800),
  	minHeight: Math.max(Math.min(window.screen.availHeight, 700), 500),
  	frame: 'none'
  },function(win) {
    win.contentWindow.launchData = launchData;
  });
});

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("viewer.html", {
    bounds: {
      width: 800,
      height: 600
    },
    minWidth: 800,
    minHeight: 600
  });
});

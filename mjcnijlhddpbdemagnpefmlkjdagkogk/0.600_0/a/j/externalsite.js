// self points to the chrome window object
var self = this;

(function() {
    // Set the url to load let the webview load the page
    window.onload = function () {
        var webView = document.getElementById("external-site-webview");
        webView.setAttribute("src", self.URLToLoad);
    };
}());
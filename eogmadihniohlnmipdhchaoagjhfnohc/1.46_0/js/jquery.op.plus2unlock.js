/**
* Preset resources for Plus 2 Unlock
* for jQuery: http://onepress-media.com/plugin/plus-2-unlock-for-google/get
* for Wordpress: http://onepress-media.com/plugin/plus-2-unlock-for-google-wordpress/get
*
* Copyright 2012, OnePress, http://onepress-media.com/portfolio
* Help Desk: http://support.onepress-media.com/
*/

(function ($) {

    if (!$.onepress) $.onepress = {};
    if (!$.onepress.lang) $.onepress.lang = {};

    $.onepress.lang.toplus = {

        defaultMessage: 'The content is locked. Please click the +1 button and view the hidden content.', 
        orWait: 'or wait',
        close: 'Close'
    };
})(jQuery);;;

/**
* Helper Tools:
* - cookies getter/setter
* - md5 hasher
* - lightweight widget factory
*
* Copyright 2012, OnePress, http://onepress-media.com/portfolio
* Help Desk: http://support.onepress-media.com/
*/


(function ($) {
    'use strict';

    if (!$.onepress) $.onepress = {};
    if (!$.onepress.tools) $.onepress.tools = {};

    /*
    * Cookie's function.
    * Allows to set or get cookie.
    *
    * Based on the plugin jQuery Cookie Plugin
    * https://github.com/carhartl/jquery-cookie
    *
    * Copyright 2011, Klaus Hartl
    * Dual licensed under the MIT or GPL Version 2 licenses.
    * http://www.opensource.org/licenses/mit-license.php
    * http://www.opensource.org/licenses/GPL-2.0
    */
    $.onepress.tools.cookie = $.onepress.tools.cookie || function (key, value, options) {

        // Sets cookie
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '',
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // Gets cookie.
        options = value || {};
        var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || '');
        }
        return null;
    };

    /*
    * jQuery MD5 Plugin 1.2.1
    * https://github.com/blueimp/jQuery-MD5
    *
    * Copyright 2010, Sebastian Tschan
    * https://blueimp.net
    *
    * Licensed under the MIT license:
    * http://creativecommons.org/licenses/MIT/
    * 
    * Based on
    * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
    * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    * Distributed under the BSD License
    * See http://pajhome.org.uk/crypt/md5 for more info.
    */
    $.onepress.tools.hash = $.onepress.tools.hash || function (str) {

        var hash = 0;
        if (str.length == 0) return hash;
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + charCode;
            hash = hash & hash;
        }
        hash = hash.toString(16);
        hash = hash.replace("-", "0");

        return hash;
    };


    /**
    * OnePress Widget Factory.
    * Supports:
    * - creating a jquery widget via the standart jquery way
    * - call of public methods.
    */
    $.onepress.widget = function (pluginName, pluginObject) {

        var factory = {
            
            createWidget: function (element, options) {
                var widget = $.extend(true, {}, pluginObject);

                widget.element = $(element);
                widget.options = $.extend(true, widget.options, options);

                if (widget._init) widget._init();
                if (widget._create) widget._create();

                $.data(element, 'plugin_' + pluginName, widget);
            },

            callMethod: function (widget, methodName) {
                widget[methodName] && widget[methodName]();
            }
        };

        $.fn[pluginName] = function () {
            var args = arguments;
            var argsCount = arguments.length;

            this.each(function () {

                var widget = $.data(this, 'plugin_' + pluginName);

                // a widget is not created yet
                if (!widget && argsCount <= 1) {
                    factory.createWidget(this, argsCount ? args[0] : false);

                // a widget is created, the public method with no args is being called
                } else if (argsCount == 1) {
                    factory.callMethod(widget, args[0]);
                }
            });
        };
    };

})(jQuery);;;

/**
* Google Plus SDK connector
*
* Copyright 2012, OnePress, http://onepress-media.com/portfolio
* Help Desk: http://support.onepress-media.com/
*/

(function ($) {
    'use strict';

    if (!$.onepress) $.onepress = {};
    if ($.onepress.google) return;

    /**
    * google API wrapper
    */
    $.onepress.google = {
        _sdkScriptId: "google-jssdk",

        // facebook root element
        _root: null,

        _eventsCreated: false,

        // is Javascript SDK inited?
        _isConnectedByThis: false,
        _isLoaded: false,


        _isProcessedOnce: false,

        /**
        * Is GAPI object avalable?
        */
        _isAPI: function () {
            return (typeof (window.gapi) === "object");
        },

        /**
        * Is SDK connected to the page?
        */
        _isSdkconnected: function () {
            return (this._getLoadingScript().length > 0);
        },

        _getLoadingScript: function () {
            var byId = $("#" + this._sdkScriptId);
            var byScr = $("script[src^='https://apis.google.com/js/plusone.js']");
            return (byId.length > 0) ? byId : byScr;
        },

        /**
        * Is SDK loading right now?
        */
        _isSdkLoading: function () {
            return !this._isAPI() && this._isSdkconnected();
        },

        /**
        * Is SDK not loaded and not loading right now?
        */
        _isSdkNotLoaded: function () {
            return !this._isAPI() && !this._isSdkconnected();
        },

        /**
        * Is SDK loaded already?
        */
        _isSdkLoaded: function () {
            return this._isAPI();
        },

        /**
        * Loads Google SDK
        */
        loadSDK: function (lang, callback) {
            var self = this;

            if (callback) {
                if (this._isLoaded) {
                    callback();
                } else {
                    this.bind("gp-ready", function () { callback(); });
                }
            }

            // Only one time the next code have to be executed.
            if (this._isProcessedOnce) return;
            this._isProcessedOnce = true;

            this._createConfig(lang);

            $(document).bind("gp-init", function () {

                self._initGoogleEvents();
                self._renderAll();
                self._isLoaded = true;

                $(document).trigger('gp-ready');
            });

            if (this._isSdkNotLoaded()) {

                if (this._isConnectedByThis || this._isLoaded) return;

                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.id = this._sdkScriptId;
                script.src = 'https://apis.google.com/js/plusone.js';

                $("body").append($(script));
                this._isConnectedByThis = true;
            }

            this._callEvents();
        },

        /**
        * Creates google api config section.
        */
        _createConfig: function (lang) {

            if (window.___gcfg) {
                window.___gcfg.parsetags = "explicit";
                return;
            }

            window.___gcfg = {
                "lang": lang,
                "parsetags": "explicit"
            };
        },

        /**
        * Calls events for google api.
        */
        _callEvents: function () {
            var self = this;
            self._scriptIsAlreadyLoaded = false;

            if (this._isSdkLoading()) {
                var script = this._getLoadingScript()[0];

                var readyFunction = function () {
                    var state = script.readyState;

                    if ((!state || /loaded|complete/.test(state))) {
                        if (self._scriptIsAlreadyLoaded === false) $(document).trigger('gp-init');
                        self._scriptIsAlreadyLoaded = true;
                    }
                };

                script.onreadystatechange = readyFunction;
                if (!$.browser.msie) script.onload = readyFunction;

            } else {

                $(document).trigger('gp-init');
            }
        },

        _initGoogleEvents: function () {

            window.onepressPlusOneCallback = function (data) {

                if (data.state == "on") {
                    $(document).trigger('gp-like', [data.href]);

                } else if (data.state == "off") {

                    $(document).trigger('gp-dislike', [data.href]);
                }

            };
        },

        _renderAll: function () {
            var self = this;

            // Render buttons that exists already
            $('.g-plusone').each(function () {
                self.render($(this));
            });
        },

        render: function ($control) {
            var api = $control.data('onepress-goolge-api');
            if (!api) {

                this._addCallbackToControl($control);
                window.gapi.plusone.go($control.parent()[0]);
            }
        },

        renderWidget: function ($control) {

            var api = $control.data('onepress-goolge-api');
            if (api) {
                var self = this;

                setTimeout(function () {
                    var $html = api.getHtmlToRender();
                    self._addCallbackToControl($html);
                    $html.find('.fake-g-plusone').addClass('g-plusone');
                    window.gapi.plusone.go($html[0]);
                    $control.trigger('gp-render');
                }, 100);
            }
        },

        _addCallbackToControl: function ($control) {

            var $elm = (!$control.is(".g-plusone")) ? $control.find(".fake-g-plusone") : $control;

            var callback = $elm.attr("data-callback");
            if (callback && callback != "onepressPlusOneCallback") {
                var newCallback = "__plusone_" + callback;
                window[newCallback] = function (data) {
                    window[callback](data);
                    window.onepressPlusOneCallback(data);
                };
                $elm.attr("data-callback", newCallback);
            } else {
                $elm.attr("data-callback", "onepressPlusOneCallback");
            }
        },

        bind: function (name, callback) {
            $(document).bind(name, callback);
        },

        isLogged: function (callback) {

            // if a login state was got
            if (this._isLoginChecked) {
                return callback(this._isLoggetInto);
            }

            var self = this;

            // if a login state is being checking right now by other locker 
            if (this._loginStateisChecking) {
                return $(document).bind("gl-is-logged", function () {
                    callback(self._isLoggetInto);
                });
            }

            // checking login state
            this._loginStateisChecking = true;

            var completeFunction = function (state) {

                self._isLoginChecked = true;
                self._isLoggetInto = state;
                self._loginStateisChecking = false;

                callback(state);
                $(document).trigger('gl-is-logged');
            };

            var checkImg = $("<img>");

            checkImg.bind('load', function () {
                completeFunction(true);
            });
            checkImg.bind('error', function () {
                completeFunction(false);
            });

            checkImg.attr('src', 'https://accounts.google.com/CheckCookie?continue=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimages%2Flogos%2Faccounts_logo.png&followup=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimages%2Flogos%2Faccounts_logo.png&chtml=LoginDoneHtml&checkedDomains=youtube&checkConnection=youtube%3A291%3A1');
            checkImg.css('display', 'none');
            checkImg.appendTo('body');
        }
    };

    $(function () {
        return window.googleSDK && $.onepress.facebook.loadSDK(window.googleSDK.lang);
    });
})(jQuery);;;

/**
* Google Plus One widget for jQuery
*
* Copyright 2012, OnePress, http://onepress-media.com/portfolio
* Help Desk: http://support.onepress-media.com/
*/

(function ($) {
    'use strict';

    $.onepress.widget("glplus", {
        options: {},

        _defaults: {

            // - Google One Plus Options

            // Language of the button labels. By default en-US.
            // https://developers.google.com/+/plugins/+1button/#available-languages
            lang: 'en-US',

            // URL to plus one.
            url: null,
            // small, medium, standard, tall (https://developers.google.com/+/plugins/+1button/#button-sizes)
            size: null,
            // Sets the annotation to display next to the button.
            annotation: null,
            // Button container width in px, by default 450.
            width: null,
            // Sets the horizontal alignment of the button assets within its frame.
            align: "left",
            // Sets the preferred positions to display hover and confirmation bubbles, which are relative to the button.
            // comma-separated list of top, right, bottom, left
            expandTo: "",
            // To disable showing recommendations within the +1 hover bubble, set recommendations to false.    
            recommendations: true,

            // - Events

            render: null,
            like: null,
            dislike: null
        },

        _create: function () {
            var self = this;

            this._prepareOptions();
            this._setupEvents();

            this.element.data('onepress-goolge-api', this);
            this._createButton();

            $.onepress.google.loadSDK(this.options.lang, function () {
                $.onepress.google.renderWidget(self.element);
            });
        },

        _prepareOptions: function () {

            var values = $.extend({}, this._defaults);

            if (this.element.data('href') !== undefined) values.url = this.element.data('href');
            if (this.element.data('url') !== undefined) values.url = this.element.data('url');
            if (this.element.data('size') !== undefined) values.size = this.element.data('size');
            if (this.element.data('annotation') !== undefined) values.annotation = this.element.data('annotation');
            if (this.element.data('align') !== undefined) values.align = this.element.data('align');
            if (this.element.data('width') !== undefined) values.width = this.element.data('width');
            if (this.element.data('expandTo') !== undefined) values.expandTo = this.element.data('expandTo');
            if (this.element.data('recommendations') !== undefined) values.recommendations = this.element.data('recommendations');

            values = $.extend(values, this.options);
            this.options = values;

            this.url = (!this.options.url) ? window.location : this.options.url;
        },

        _setupEvents: function () {
            var self = this;

            $(document).bind('gp-like', function (e, url) {

                if (self.options.like &&  (self.url == url || (self.url + '/') == url)) {
                    self.options.like(url, self);
                }
            });

            $(document).bind('gp-dislike', function (e, url) {

                if (self.options.dislike && (self.url == url || (self.url + '/') == url)) {
                    self.options.dislike(url, self);
                }
            });

            $(this.element).bind('gl-render', function () {

                if (self.options.render) {
                    self.options.render(self.element, [self]);
                }
            });
        },

        /**
        * Generates an html code for the button using specified options.
        */
        _createButton: function () {

            var $wrap;

            if (!this.element.is(".g-plusone")) {

                var $button = $("<div class='fake-g-plusone'></div>");
                $button.data('facebook-widget', this);

                if (this.options.url) $button.attr("data-href", this.options.url);
                if (this.options.size) $button.attr("data-size", this.options.size);
                if (this.options.annotation) $button.attr("data-annotation", this.options.annotation);
                if (this.options.align) $button.attr("data-align", this.options.align);
                if (this.options.expandTo) $button.attr("data-expandTo", this.options.expandTo);
                if (this.options.recommendations) $button.attr("data-recommendations", this.options.recommendations);

                this.element.append($button);
                $wrap = this.element;

            } else {
                $wrap = $("<div></div>").append(this.element);
            }

            $wrap.addClass('ui-social-button ui-google ui-goole-plusone');
        },

        getHtmlToRender: function () {

            if (this.element.is(".g-plusone")) return this.element.parent();
            return this.element;
        }
    });

})(jQuery);;;

/**
* Plus 2 Unlock
* for jQuery: http://onepress-media.com/plugin/social-locker-for-jquery/get
* for Wordpress: http://onepress-media.com/plugin/social-locker-for-wordpress/get
*
* Copyright 2012, OnePress, http://onepress-media.com/portfolio
* Help Desk: http://support.onepress-media.com/
*/

(function ($) {
    'use strict';
    if ($.fn.toPlusOne) return;

    $.onepress.widget("toPlusOne", {

        options: {
            locker: {},
            google: {},
            events: {}
        },

        // Defauls option's values.
        _defaults: {

            // url to like.
            url: null,

            // a message that appears inside the locker 
            text: $.onepress.lang.toplus.defaultMessage,

            // adds exta classes here (for example, classes of the built-in themes).	
            style: null,

            // sets to false to turn of the highlight effect
            highlight: true,

            // sets whether the locker appears always
            demo: false,

            // -
            // Main locker configuration settings.
            // -
            locker: {
                // set true to show a Like Buttom above the locker
                inverse: false,
                // set true to turn on the closing cross on the corner
                close: false,
                // set positive integer for the Timer
                timer: false,
                // set false to turn off the locker for mobiele users
                mobile: true,
                // set true to show the locker only for loggged google users
                loggedOnly: false,
                // set watch dog interval to unlock content if some troubles are going
                watchdog: 15000
            },

            // -
            // Content that will be showen after unlocking.
            // -
            content: null,

            // -
            // Gooole Plus One button options.
            // -
            google: {

                // Language of the button labels. By default en-US.
                // https://developers.google.com/+/plugins/+1button/#available-languages
                lang: 'en-US',
                // small, medium, standard, tall (https://developers.google.com/+/plugins/+1button/#button-sizes)
                size: "standard",
                // Sets the annotation to display next to the button.
                annotation: 'inline',
                // Button container width in px, by default 450.
                width: null,
                // Sets the horizontal alignment of the button assets within its frame.
                align: "left",
                // Sets the preferred positions to display hover and confirmation bubbles, which are relative to the button.
                // comma-separated list of top, right, bottom, left
                expandTo: "",
                // To disable showing recommendations within the +1 hover bubble, set recommendations to false.    
                recommendations: true
            },

            // -
            // Events
            // -
            events: {

                // when content is locked
                lock: null,
                // when content is unlocked
                unlock: null,
                // when content is unlocked by the Time
                unlockByTimer: null,
                // when content is unlocked by the Close Button
                unlockByClose: null,
                // when content is unlocked by the WatchDog
                unlockByWatchdog: null,
                // when a locker is created and inited
                ready: null
            }
        },

        /** 
        * Creats the locker.
        */
        _create: function () {
            var self = this;
            this._parseOptions();

            // if it's a mobile device and the option Mobile is set to True, don't create a locker
            // the lite method to check is used 
            // http://stackoverflow.com/questions/3514784/best-way-to-detect-handheld-device-in-jquery

            // don't show locker in ie7
            if ($.browser.msie && parseInt($.browser.version, 10) <= 7) {
                this._unlock("ie7");
                return;
            }

            // check mobile devices
            if (!this.options.locker.mobile && this._isMobile()) {
                this._unlock("mobile");
                return;
            }

            // provider that used to get a like buttons state
            this._provider = new $.onepress.localGoogleStoreStateProvider(this.url, this, this.options.demo);

            // continue if there is no erros
            if (this._error) { this.element.show(); return; }

            // if loggedOnly is false or content is unlocked, no need to check the login state
            if (!this.options.locker.loggedOnly || self._provider.isUnlocked()) {

                var state = self._provider.isUnlocked();
                !state ? self._lock("provider") : self._unlock("provider");
                if (self.options.events.ready) self.options.events.ready(state ? "unlocked" : "locked");
                return;
            }

            this._setLoadingState(true);

            self._runWatchdog('[google-locker-check-login]');

            this._checkLogin(function (loggedInGooglePlus) {

                // [google-locker-check-login]
                self._stopWatchdog();

                loggedInGooglePlus ? self._lock("provider") : self._unlock("provider");
                if (self.options.events.ready) self.options.events.ready("locked");
            });
        },

        /**
        * Returns true if a current user use a mobile device, else false.
        */
        _isMobile: function () {
            return (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent));
        },

        // --------------------------------------------------------------------------------------
        // Options parsing
        // --------------------------------------------------------------------------------------

        _parseOptions: function () {

            var options = $.extend(true, {}, this._defaults, this.options);

            if (!options.text) options.text = $.onepress.lang.tolike.defaultMessage;

            options.text = (typeof options.text === "function" && options.text(this)) ||
                           (typeof options.text === "string" && $("<div>" + options.text + "</div>")) ||
                           (typeof options.text === "object" && options.text.clone());

            if (options.locker.timer && !parseInt(options.locker.timer)) options.locker.timer = null;
            options.locker.watchdog = parseInt(options.locker.watchdog);

            this.url = this.url || this.options.url || window.location.href;
            this.identity = $.onepress.tools.hash(this.url);
            this.element.addClass("identity-" + this.identity).addClass("ui-locker-content");

            this.options = options;
        },

        // --------------------------------------------------------------------------------------
        // Service methods
        // --------------------------------------------------------------------------------------

        /**
        * WatchDog is a simple mechanism to show content in the case when something is going wrong.
        * For example, the SDK is being loading too long (low internet speed).
        */
        _runWatchdog: function (uniqueLabel) {
            if (!this.options.locker.watchdog) return;
            var self = this;

            this._watchdog = setTimeout(function () {

                self._stoppedByWatchdog = true;
                self._unlock("watchdog");

                if (uniqueLabel && console) {
                    var text = "Watchdog: " + uniqueLabel;
                    (console.debug && console.debug(text)) || (console.log && console.log(text));
                }
            }, this.options.locker.watchdog);
        },

        _stopWatchdog: function () {

            if (!this._watchdog) return;
            clearTimeout(this._watchdog);
            this._watchdog = null;
        },

        /**
        * Checks is a user logged into Facebook
        */
        _checkLogin: function (callback) {

            $.onepress.google.loadSDK(this.options.google.lang, function () {
                $.onepress.google.isLogged(function (result, loggedInGooglePlus) {
                    callback(result, loggedInGooglePlus);
                });
            });
        },

        /**
        * Sets a loading state.
        */
        _setLoadingState: function (stateFlag) {
            if (!stateFlag) { if (this.loadingState) this.loadingState.remove(); return; }

            var after = (this.element.parent().is('a')) ? this.element.parent() : this.element;
            this.loadingState = $("<div class='ui-locker-loading-holder'></div>").insertAfter(after);
            this.element.hide();
        },

        /**
        * Sets an error state.
        */
        _setError: function (text) {
            this._error = true;
            this._errorText = text;

            this._setLoadingState(false);
            this.locker && this.locker.hide();

            this.element.html("<strong>[Error]: " + text + "</strong>");
            this.element.show().addClass("ui-facebook-locker-error");
        },

        // --------------------------------------------------------------------------------------
        // Methods to create markups
        // --------------------------------------------------------------------------------------

        /**
        * Creates markup of the plugin.
        */
        _createMarkup: function () {
            var self = this;

            var browser = (jQuery.browser.mozilla && 'mozilla') ||
                          (jQuery.browser.opera && 'opera') ||
                          (jQuery.browser.webkit && 'webkit') || 'msie';

            this.locker = $("<div class='ui-locker-google ui-locker-" + browser + "'></div>").hide();
            this.outerWrap = $("<div class='ui-locker-outer-wrap'></div>").appendTo(this.locker);
            this.innerWrap = $("<div class='ui-locker-inner-wrap'></div>").appendTo(this.outerWrap);
            this.element.addClass("ui-locker-content");

            this.locker.addClass(this.options.style);

            // Inner text defined by a user.
            this.options.text.addClass("ui-locker-text").show();

            this.options.text.prepend(($("<div class='ui-locker-decorator-3'></div>")));
            this.options.text.append(($("<div class='ui-locker-decorator-4'></div>")));

            // wrapper of social buttons
            this.buttonsWrap = $("<div class='ui-locker-buttons'></div>");
            this.buttonWrap = $("<div class='ui-locker-button'></div>").appendTo(this.buttonsWrap);
            this.buttonsWrap.prepend($("<div class='ui-locker-decorator-5'></div>"));

            this.innerWrap.append($("<div class='ui-locker-decorator-1'></div>"));

            if (this.options.locker.inverse) {
                this.innerWrap.append(this.buttonsWrap);
                this.innerWrap.append(this.options.text);
                this.locker.addClass('ui-locker-inverse');
            } else {
                this.innerWrap.append(this.options.text);
                this.innerWrap.append(this.buttonsWrap);
            }

            this.innerWrap.append($("<div class='ui-locker-decorator-2'></div>"));
            this.buttonsWrap.append(($("<div class='ui-locker-decorator-6'></div>")));

            // Creates social buttons
            if (this._createSocialButtons) this._createSocialButtons(this.locker, this.buttonWrap);

            // close button and timer
            this.options.locker.close && this._createCloseButton();
            this.options.locker.timer && this._createTimer();

            var after = (this.element.parent().is('a')) ? this.element.parent() : this.element;
            this.locker.insertAfter(after);

            this._markupIsCreated = true;
        },

        /**
        * Creates markup for the Clsoe Button.
        */
        _createCloseButton: function () {
            var self = this;

            this.closeButton = $("<div title='" + $.onepress.lang.toplus.close + "' class='ui-locker-close-icon'></div>");
            this.closeButton.prependTo(this.locker);

            this.closeButton.click(function () {
                if (!self.close || self.close(self)) self._unlock("close");
            });
        },

        /**
        * Creates markup for timer.
        */
        _createTimer: function () {
            this.timer = $("<span class='ui-locker-timer'></span>");

            var timerLabelText = $.onepress.lang.toplus.orWait;

            this.timerLabel = $("<span class='ui-locker-timer-label'>" + timerLabelText + " </span>").appendTo(this.timer);
            this.timerCounter = $("<span class='ui-locker-timer-counter'>" + this.options.locker.timer + "s</span>").appendTo(this.timer);

            this.timer.appendTo(this.locker);

            this.counter = this.options.locker.timer;
            this._kickTimer();
        },

        /**
        * Lick the timer to perform a next iteration.
        */
        _kickTimer: function () {
            var self = this;

            setTimeout(function () {

                if (!self._isLocked) return;

                self.counter--;
                if (self.counter <= 0) {
                    self._unlock("timer");
                } else {
                    self.timerCounter.text(self.counter + "s");

                    // Opera fix.
                    if ($.browser.opera) {
                        var box = self.timerCounter.clone();
                        box.insertAfter(self.timerCounter);
                        self.timerCounter.remove();
                        self.timerCounter = box;
                    }

                    self._kickTimer();
                }
            }, 1000);
        },

        /**
        * Creates social button.
        */
        _createSocialButtons: function (locker, buttonWrap) {
            var self = this;

            var googleOptions = $.extend({}, this.options.google);
            if (this.options.url) googleOptions.url = this.options.url;

            googleOptions.like = function () {
                self._unlock("button");
            };

            googleOptions.dislike = function () {
                self._lock("button");
            };

            this.backup = buttonWrap.clone();
            this.socialButton = buttonWrap.glplus(googleOptions);
        },

        // --------------------------------------------------------------------------------------
        // Lock/Unlock content.
        // --------------------------------------------------------------------------------------

        _lock: function (typeSender, sender) {

            this._setLoadingState(false);

            if (this._isLocked || this._stoppedByWatchdog) return;
            if (!this._markupIsCreated) this._createMarkup();
            if (typeSender == "button") this._provider.setState("locked");

            this.element.hide();
            this.locker.fadeIn(1000);

            this._isLocked = true;
            if (this.options.events.lock) this.options.events.lock(this);
        },

        _unlock: function (typeSender, sender) {
            var self = this;

            this._setLoadingState(false);
            if (typeSender == "watchdog" && this.options.events.unlockByWatchdog) return this.options.events.unlockByWatchdog();

            if (!this._isLocked) { this._showContent(true); return false; }
            if (typeSender == "button") this._provider.setState("unlocked");

            this._showContent(true);

            this._isLocked = false;
            if (typeSender == "timer" && this.options.events.unlockByTimer) return this.options.events.unlockByTimer();
            if (typeSender == "close" && this.options.events.unlockByClose) return this.options.events.unlockByClose();
            if (this.options.events.unlock) this.options.events.unlock();
        },

        _showContent: function (useEffects) {
            var self = this;

            var effectFunction = function () {

                if (self.locker) self.locker.hide();
                if (!useEffects) { self.element.show(); return; }

                self.element.fadeIn(1000, function () {
                    self.options.highlight && self.element.effect && self.element.effect('highlight', { color: '#fffbcc' }, 800);
                });
            };

            if (!this.options.content) {
                effectFunction();

            } else if (typeof this.options.content === "string") {
                this.element.html(this.options.content);
                effectFunction();

            } else if (typeof this.options.content === "object" && !this.options.content.url) {
                this.element.append(this.options.content.clone().show());
                effectFunction();

            } else if (typeof this.options.content === "object" && this.options.content.url) {

                var ajaxOptions = $.extend(true, {}, this.options.content);

                var customSuccess = ajaxOptions.success;
                var customComplete = ajaxOptions.complete;
                var customError = ajaxOptions.error;

                ajaxOptions.success = function (data, textStatus, jqXHR) {

                    !customSuccess ? self.element.html(data) : customSuccess(self, data, textStatus, jqXHR);
                    effectFunction();
                };

                ajaxOptions.error = function (jqXHR, textStatus, errorThrown) {

                    self._setError("An error is triggered during the ajax request! Text: " + textStatus + " " + errorThrown);
                    customError && customError(jqXHR, textStatus, errorThrown);
                };

                ajaxOptions.complete = function (jqXHR, textStatus) {

                    customComplete && customComplete(jqXHR, textStatus);
                };

                $.ajax(ajaxOptions);

            } else {
                effectFunction();
            }
        }
    });

    /**
    * [obsolete]
    */
    $.fn.tolike = function (opts) {

        opts = $.extend({}, opts);
        $(this).toLike(opts);
    };

})(jQuery);

(function ($) {

    /**
    * Local Storage / Cookie state provider.
    */
    $.onepress.localGoogleStoreStateProvider = function (url, api, demo) {

        this.url = url;
        this.identity = "page_" + $.onepress.tools.hash(url) + "_gl";

        this.isUsable = function (callback) { callback(true); };

        this.lock = function () { };

        this.isUnlocked = function () {
            if (demo) return false;
            return (this._getValue()) ? true : false;
        };

        this.isLocked = function () {
            return !this.isUnlocked();
        };

        this.getState = function (callback) {
            callback(this.isUnlocked());
        };

        this.setState = function (value) {
            if (demo) return false;
            return value == "unlocked" ? this._setValue() : this._removeValue();
        };

        this._setValue = function () {

            if (localStorage) {
                localStorage.setItem(this.identity, true);
            } else {
                $.onepress.tools.cookie(this.identity, true, { expires: 356 * 10, path: "/" });
            }
        };

        this._getValue = function () {
            if (!localStorage) return $.onepress.tools.cookie(this.identity);

            var value = localStorage.getItem(this.identity);
            if (value) return value;
            value = $.onepress.tools.cookie(this.identity);
            if (value) this._setValue();
            return value;
        };

        this._removeValue = function () {
            if (localStorage) localStorage.removeItem(this.identity);
            $.onepress.tools.cookie(this.identity, null);
        };
    };

})(jQuery);;;


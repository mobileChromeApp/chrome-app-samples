(function($) {

  App.Controller.Analytics = function(viewer) {
    this.init(viewer);
  };

  jQuery.extend(App.Controller.Analytics.prototype, {

    init: function(viewer) {
      var self = this;
      self.viewer = viewer;
      self.viewer.addStateDelegate(self);

      self.rfbVersionMajor = 0;
      self.rfbVersionMinor = 0;
    },

    // State Delegate
    onStateChanged: function(state) {
      var self = this;
      if (state == App.ViewerKit.State.CONNECTED) {

        self.viewer.getProperty(App.ViewerKit.Property.RFB_VERSION_MAJOR, function(result) {
          self.rfbVersionMajor = result;
          App.Strings.text_protocol_version.replace("%d", self.rfbVersionMajor).replace("%d", self.rfbVersionMinor);

          self.viewer.getProperty(App.ViewerKit.Property.RFB_VERSION_MINOR, function(result) {
            self.rfbVersionMinor = result;
            var protocolVer = App.Strings.text_protocol_version.replace("%d", self.rfbVersionMajor).replace("%d", self.rfbVersionMinor);

            // Reporting RFB version to Google Analytics
            self.reportAnalytics('Connection', 'RFB_Version', protocolVer);

          });
        });
      }
    },

    // Report an event to Google Analytics
    reportAnalytics: function(category, action, label) {







    }

  });

})(jQuery);

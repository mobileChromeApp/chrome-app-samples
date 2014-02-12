(function($) {

  var chromeTabs,
      shellTemplate, tabTemplate,
      defaultTabTitle, defaultNewTabData, defaultTabWidths,
      currentMaxId;

  if (document.body.style['-webkit-mask-repeat'] !== void 0) {
    $('html').addClass('cssmasks');
  } else {
    $('html').addClass('no-cssmasks');
  }

  currentMaxId = 0;

  shellTemplate =
  '<div class="chrome-tabs-shell">\n' +
    '<div class="chrome-tabs"></div>\n' +
    '<div class="chrome-shell-bottom-bar"></div>\n' +
  '</div>\n';

  tabTemplate =
  '<div class="chrome-tab">\n' +
    '<div class="chrome-tab-favicon"></div>\n' +
    '<div class="chrome-tab-title"></div>\n' +
    '<div class="chrome-tab-close"></div>\n' +
    '<div class="chrome-tab-curves">\n' +
      '<div class="chrome-tab-curve-left-shadow2"></div>\n' +
      '<div class="chrome-tab-curve-left-shadow1"></div>\n' +
      '<div class="chrome-tab-curve-left"></div>\n' +
      '<div class="chrome-tab-curve-right-shadow2"></div>\n' +
      '<div class="chrome-tab-curve-right-shadow1"></div>\n' +
      '<div class="chrome-tab-curve-right"></div>\n' +
    '</div>\n' +
  '</div>\n';

  defaultTabTitle = 'New Connection';

  defaultNewTabData = {
    title: defaultTabTitle,
    favicon: '',
    data: {
      id: 0
    }
  };

  defaultTabWidths = {
    minWidth: 45,
    maxWidth: 180
  };

  chromeTabs = {

    init: function($div, viewer) {
      var self = this;

      self.maxTabs = 5;

      self.viewer = viewer;

      // add shell to given div
      self.$shell = $(shellTemplate).appendTo($div);

      $.extend(self.$shell.data(), defaultTabWidths);
      self.$shell.find('.chrome-tab').each(function() {
        return $(this).data().tabData = {
          data: {}
        };
      });

      self.addNewTabButton();
      self.addStartingTab();
      self.setupShellEvents();

      $(window).resize(function() {
        self.render();
      });

      self.render();
    },

    render: function() {
      var self = this;

      self.fixTabSizes();
      self.fixZIndexes();
      self.setupTabEvents();
      self.setupSortable();

      return self.$shell.trigger('chromeTabRender');
    },

    setupSortable: function() {
      var self = this;

      var $tabs;
      $tabs = self.$shell.find('.chrome-tabs');
      $tabs.sortable({
        axis: 'x',
        tolerance: 'pointer',
        start: function(e, ui) {
          self.hideNewTabButton();
          self.fixZIndexes();
          if (!$(ui.item).hasClass('chrome-tab-current')) {
            return $tabs.sortable('option', 'zIndex', $(ui.item).data().zIndex);
          } else {
            return $tabs.sortable('option', 'zIndex', $tabs.length + 40);
          }
        },
        stop: function(e, ui) {
          self.showNewTabButton();
          return self.setCurrentTab($(ui.item));
        }
      });
    },

    fixTabSizes: function() {
      var self = this;

      var $tabs, margin, width;
      $tabs = self.$shell.find('.chrome-tab');
      margin = self.tabMargin();
      width = self.$shell.width() - 50;
      width = (width / $tabs.length) - margin;
      width = Math.max(self.$shell.data().minWidth, Math.min(self.$shell.data().maxWidth, width));

      self.setNewTabButtonOffset((width + margin) * $tabs.length);

      $tabs.css({
        width: width
      });
    },

    fixZIndexes: function() {
      var self = this;

      var $tabs;
      $tabs = self.$shell.find('.chrome-tab');

      $tabs.each(function(i) {
        var $tab, zIndex;
        $tab = $(this);
        zIndex = $tabs.length - i;
        if ($tab.hasClass('chrome-tab-current')) {
          zIndex = $tabs.length + 40;
        }
        $tab.css({
          zIndex: zIndex
        });
        return $tab.data({
          zIndex: zIndex
        });
      });
    },

    setupShellEvents: function() {
      var self = this;
      var $shell = self.$shell;

      $shell.unbind('dblclick').bind('dblclick', function() {
        self.addNewTab();
      });

      $shell.find('.chrome-tabs-new').unbind('click').click(function() {
        self.addNewTab();
      });
    },

    setupTabEvents: function() {
      var self = this;

      var $shell = self.$shell;

      $shell.find('.chrome-tab').each(function() {
        var $tab;
        $tab = $(this);
        $tab.unbind('click').click(function() {
          return self.setCurrentTab($tab);
        });
        return $tab.find('.chrome-tab-close').unbind('click').click(function() {
          return self.closeTab($tab);
        });
      });
    },

    addNewTab: function(newTabData) {
      var self = this;

      var $shell = self.$shell;

      if ($shell.find('.chrome-tab').length == self.maxTabs) {
        return;
      }

      var $newTab, tabData;
      $newTab = $(tabTemplate);
      $shell.find('.chrome-tabs').append($newTab);
      tabData = $.extend(true, {}, defaultNewTabData, newTabData);
      $newTab.data('id', currentMaxId++);
      self.updateTab($newTab, tabData);
      // add iframe to page
      var elementString = '<iframe id="tabs-' + $newTab.data('id') + '" seamless src="viewer.html?owned=1"/>';
      $('#content').append(elementString);
      var idString = '#tabs-' + $newTab.data('id');
      var iframeWindow = $(idString).get(0).contentWindow;

      self.setCurrentTab($newTab);

      self.viewer.addTabMapping($newTab.data('id'), iframeWindow);
    },

    addStartingTab: function() {
      var self = this;

      self.addNewTab({
        title: 'Starting tab'
      });
    },

    setCurrentTab: function($tab) {
      var self = this;

      var $oldTab = self.$shell.find('.chrome-tab-current');
      $('#tabs-' + $oldTab.data('id')).hide();
      $oldTab.removeClass('chrome-tab-current');
      $tab.addClass('chrome-tab-current');
      $('#tabs-' + $tab.data('id')).show();

      self.viewer.setActiveTabId($tab.data('id'));
      $(self.viewer).trigger('refocus');

      return self.render();
    },

    closeTab: function($tab) {
      var self = this;

      // remove iframe element
      var elementID = '#tabs-' + $tab.data('id');
      $(elementID).remove();

      if ($tab.hasClass('chrome-tab-current')) {
        if ($tab.next().length) {
          self.setCurrentTab($tab.next());
        } else if ($tab.prev().length) {
          self.setCurrentTab($tab.prev());
        } else {
          // if closing final tab, open a starting page
          self.addStartingTab();
        }
      }

      self.viewer.removeTabMapping($tab.data('id'));

      $tab.remove();

      return self.render();
    },

    updateTab: function($tab, tabData) {
      $tab.find('.chrome-tab-title').html(tabData.title);
      $tab.find('.chrome-tab-favicon').css({
        backgroundImage: "url('" + tabData.favicon + "')"
      });

      return $tab.data().tabData = tabData;
    },

    updateTabTitle: function(id, title) {
      var self = this;

      self.getTabById(id).find('.chrome-tab-title').html(title);
    },

    resetTabTitle: function(id) {
      var self = this;
      self.getTabById(id).find('.chrome-tab-title').html(defaultTabTitle);
    },

    getIdByTab: function($tab) {
      return $tab.data('id');
    },

    getTabById: function(id) {
      var self = this;

      return self.$shell.find('.chrome-tab').filter(function() {
        return $(this).data('id') == id;
      });
    },

    addNewTabButton: function() {
      var self = this;

      self.$shell.append('<div class="chrome-tabs-new"></div>');
    },

    hideNewTabButton: function() {
      var self = this;

      self.$shell.find('.chrome-tabs-new').hide();
    },

    showNewTabButton: function() {
      var self = this;

      self.$shell.find('.chrome-tabs-new').show();
    },

    setNewTabButtonOffset: function(offset) {
      var self = this;

      self.$shell.find('.chrome-tabs-new').css('left', offset);
    },

    tabMargin: function() {
      var self = this;

      var $tabs = self.$shell.find('.chrome-tab');
      return (parseInt($tabs.first().css('marginLeft'), 10) + parseInt($tabs.first().css('marginRight'), 10)) || 0;
    }
  };

  window.chromeTabs = chromeTabs;

})(jQuery);

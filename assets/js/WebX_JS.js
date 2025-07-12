// Helper: safely create an element with optional class and id
function createEl(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  return el;
}

// Ensure WebX is defined in the global scope
window.WebX = {
  // Initialize data storage for application
  Data: {
    windows: {
      browser: [],
      finder: [],
      generic: []
    }
  },
  init() {
    // Create main wrapper first
    const webx_wrapper = createEl('div', { id: 'webxWrapper' });
    document.body.appendChild(webx_wrapper);
    
    // Create components after wrapper exists
    this.Browser = new WebX.Browser();
    this.Clock = new WebX.Clock();
    this.Finder = new WebX.Finder();
    this.Dock = new WebX.Dock();
    
    const wallpaperDiv = createEl('div');
    wallpaperDiv.innerHTML = '<img id="wallpaper" src="assets/imgs/wallpaper/Vitrieth_by_iumazark.jpg" alt="" title="" />';
    webx_wrapper.appendChild(wallpaperDiv);

    const starter = Utils.$$('#starter');
    if (starter) starter.style.display = 'none';

    WebX.Menubar.init();
    WebX.Dock.init();
    
    // Check if Dashboard is defined before initializing
    if (this.Dashboard && typeof this.Dashboard.init === 'function') {
      WebX.Dashboard.init();
    }
  },
  Menubar: {
    init() {
      const webx_wrapper = Utils.$$('#webxWrapper');
      const menubar = createEl('div', { id: 'wxMenubar' });
      const user_area = createEl('div', { id: 'mb_user_area' });
      const userNameDiv = createEl('div', { id: 'wx_mb_user_name', text: 'Default User' });
      const userPicDiv = createEl('div', { id: 'wx_mb_user_pic' });
      webx_wrapper.appendChild(menubar);
      menubar.appendChild(user_area);
      WebX.Clock.create('wx_mb_clock', user_area);
      user_area.insertBefore(userNameDiv, user_area.firstChild);
      user_area.insertBefore(userPicDiv, user_area.firstChild);
      for (const item in webx_data.menubar) {
        const menubar_ul = createEl('ul', { className: 'menubar_ul', id: 'menubar_ul_' + item });
        menubar.appendChild(menubar_ul);
        for (const link in webx_data.menubar[item]) {
          WebX.Menubar.create_link(item + '_' + link, menubar_ul);
        }
      }
      // Hide all menubar_ul except finder
      menubar.querySelectorAll('ul.menubar_ul').forEach(ul => {
        if (ul.id !== 'menubar_ul_finder') ul.style.display = 'none';
      });
    },
    create_link(obj, target) {
      const names = obj.split('_');
      const menubar_li = createEl('li', { className: 'mb_item disabled', id: 'mb_' + obj, text: names[1] });
      menubar_li.addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('disabled');
        this.classList.toggle('enabled');
        target.querySelectorAll('li.enabled').forEach(item => {
          if (item !== menubar_li) {
            item.classList.toggle('enabled');
            item.classList.toggle('disabled');
          }
        });
        return false;
      });
      menubar_li.addEventListener('mouseover', function (e) {
        const enabledItems = target.querySelectorAll('li.enabled');
        if (enabledItems.length === 1 && !this.classList.contains('enabled')) {
          enabledItems.forEach(item => {
            item.classList.toggle('enabled');
            item.classList.toggle('disabled');
          });
          this.classList.toggle('enabled');
          this.classList.toggle('disabled');
        }
        return false;
      });
      target.appendChild(menubar_li);
      WebX.Menubar.create_panel(obj, webx_data.menubar[names[0]][names[1]], menubar_li);
    },
    create_panel(panel, contents, target) {
      const panel_name = panel + '_panel';
      const mb_panel = createEl('div', { id: panel_name, className: 'mbWindow' });
      target.appendChild(mb_panel);
      const mb_link_ul = createEl('ul');
      mb_panel.appendChild(mb_link_ul);
      for (const panel_link in contents) {
        WebX.Menubar.create_panel_link(panel_link, contents[panel_link], mb_link_ul);
      }
    },
    create_sub_panel(panel, contents, target) {
      const panel_name = panel + '_sub_panel';
      const mb_panel = createEl('div', { id: panel_name, className: 'mbSubWindow' });
      target.appendChild(mb_panel);
      const mb_link_ul = createEl('ul');
      mb_panel.appendChild(mb_link_ul);
      for (const panel_link in contents) {
        WebX.Menubar.create_panel_link(panel_link, contents[panel_link], mb_link_ul);
      }
    },
    create_panel_link(link_name, link_funcs, target) {
      const mb_link_li = createEl('li', { text: link_name });
      target.appendChild(mb_link_li);
      if (link_funcs.click !== 'false') {
        const func = new Function('return ' + link_funcs.click)();
        mb_link_li.addEventListener('click', function (e) {
          e.preventDefault();
          func();
          return false;
        });
      } else {
        mb_link_li.addEventListener('click', function (e) {
          e.preventDefault();
          return false;
        });
      }
      if (link_funcs.list) {
        WebX.Menubar.create_sub_panel(link_name, link_funcs.list, mb_link_li);
      }
    },
    switch_to(menubar) {
      document.querySelectorAll('.menubar_ul').forEach(ul => {
        if (ul.id !== 'menubar_ul_' + menubar) ul.style.display = 'none';
        else ul.style.display = '';
      });
    }
  },
  Dashboard: {
    init: function () {
      const dashboardPanel = createEl('div', { id: 'dashboardPanel' });
      document.body.appendChild(dashboardPanel);
      dashboardPanel.dataset.dashboardStatus = '0';
      dashboardPanel.dataset.widgetDrawerStatus = '0';

      const dbOverlay = createEl('div', { id: "dbOverlay" });
      Utils.$$('#webxWrapper').appendChild(dbOverlay);
      dbOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        WebX.Dashboard.start();
        return false;
      });

      $('<div>', {
        id: "dbDrawerButton",
        click: function () {
          WebX.Dashboard.drawer();
          return false;
        }
      }).appendTo(dbOverlay);
      
      $('<div>', {
        id: "dbManageButton"
      }).appendTo(dbOverlay);
    },

    start: function () {
      const elements = {
        dashboardPanel: Utils.$$('#dashboardPanel'),
        dbOverlay: Utils.$$('#dbOverlay'),
        dbManageButton: Utils.$$('#dbManageButton'),
        dbDrawerButton: Utils.$$('#dbDrawerButton'),
        webxWrapper: Utils.$$('#webxWrapper')
      };

      // Simplified state handling - toggle dashboard on/off with a single click
      const isActive = elements.dashboardPanel.dataset.dashboardStatus === '1';
      const animationDuration = 1420; // Increased to make animation last longer (1.42 seconds)
      
      if (!isActive) {
        // Turn dashboard ON
        elements.dbManageButton.style.display = 'none';
        
        // Show overlay with fade effect
        elements.dbOverlay.style.opacity = '0';
        elements.dbOverlay.style.display = 'block';
        Animation.fadeIn(elements.dbOverlay, animationDuration);
        
        // Set state to active
        elements.dashboardPanel.dataset.dashboardStatus = '1';
      } else {
        // Turn dashboard OFF - also close drawer if it's open
        if (elements.dashboardPanel.dataset.widgetDrawerStatus === '1') {
          // Reset marginTop if drawer was open
          elements.webxWrapper.style.transition = `margin-top ${animationDuration}ms ${Animation.easings.easeOutExpo}`;
          elements.dbOverlay.style.transition = `margin-top ${animationDuration}ms ${Animation.easings.easeOutExpo}`;
          elements.webxWrapper.style.marginTop = '0px';
          elements.dbOverlay.style.marginTop = '0px';
          
          // Reset drawer button rotation
          elements.dbDrawerButton.style.transition = `transform ${animationDuration}ms ${Animation.easings.easeOutExpo}`;
          elements.dbDrawerButton.style.transform = 'rotate(0deg)';
          
          // Hide manage button when closing drawer
          Animation.fadeOut(elements.dbManageButton, animationDuration).then(() => {
            elements.dbManageButton.style.display = 'none';
          });
          
          // Reset widget drawer state
          elements.dashboardPanel.dataset.widgetDrawerStatus = '0';
        }
        
        // Fade out overlay
        Animation.fadeOut(elements.dbOverlay, animationDuration).then(() => {
          elements.dbOverlay.style.display = 'none';
        });
        
        // Set state to inactive
        elements.dashboardPanel.dataset.dashboardStatus = '0';
      }
    },

    drawer: function () {
      const elements = {
        dashboardPanel: Utils.$$('#dashboardPanel'),
        dbOverlay: Utils.$$('#dbOverlay'),
        dbManageButton: Utils.$$('#dbManageButton'),
        dbDrawerButton: Utils.$$('#dbDrawerButton'),
        webxWrapper: Utils.$$('#webxWrapper')
      }

      const animateDrawerAndManageButton = (isOpening) => {
        const marginValue = isOpening ? '-118px' : '0px';
        const rotationValue = isOpening ? -135 : 0;
        const animationDuration = 1420; // Increased to make animation last longer (1.42 seconds)
        
        // Setup the manage button properly
        if (isOpening) {
          // Make sure it's completely hidden before fadeIn
          elements.dbManageButton.style.opacity = '0';
          elements.dbManageButton.style.display = 'block';
          // Force a reflow to ensure opacity is applied
          void elements.dbManageButton.offsetHeight;
        }
        
        // Setup transitions with longer duration
        elements.webxWrapper.style.transition = `margin-top ${animationDuration}ms ${Animation.easings.easeOutExpo}`;
        elements.dbOverlay.style.transition = `margin-top ${animationDuration}ms ${Animation.easings.easeOutExpo}`;
        elements.dbDrawerButton.style.transition = `transform ${animationDuration}ms ${Animation.easings.easeOutExpo}`;
        
        // Start animations simultaneously
        elements.webxWrapper.style.marginTop = marginValue;
        elements.dbOverlay.style.marginTop = marginValue;
        elements.dbDrawerButton.style.transform = `rotate(${rotationValue}deg)`;
        
        // Use requestAnimationFrame to ensure CSS changes have been applied
        // before starting the fade animation
        requestAnimationFrame(() => {
          // Animate manage button in sync with the same duration
          if (isOpening) {
            Animation.fadeIn(elements.dbManageButton, animationDuration);
          } else {
            Animation.fadeOut(elements.dbManageButton, animationDuration).then(() => {
              elements.dbManageButton.style.display = 'none';
            });
          }
        });
        
        // Update state
        elements.dashboardPanel.dataset.widgetDrawerStatus = isOpening ? '1' : '0';
      };

      if (elements.dashboardPanel.dataset.widgetDrawerStatus === '0') {
        // Opening the drawer
        animateDrawerAndManageButton(true);
      } else if (elements.dashboardPanel.dataset.widgetDrawerStatus === '1') {
        // Closing the drawer
        animateDrawerAndManageButton(false);
      }
    }
  },
  Data: {
    windows: {
      finder: [],
      browser: []
    },
    menubars: []
  }
};

WebX.Clock = function () {};
WebX.Clock.prototype.create = function (ele_id, target) {
  var clock_div = document.createElement('div');
  clock_div.id = ele_id;
  target.appendChild(clock_div);
  WebX.Clock.update(ele_id);
};

WebX.Clock.prototype.update = function (ele_id) {
  var time_ele = document.getElementById(ele_id);
  var now = new Date();
  var hours = now.getHours();
  var mins = now.getMinutes().toString().padStart(2, '0');
  var day = now.getDay();
  var theDay = now.getDate();
  var month = now.getMonth();
  var year = now.getFullYear();
  var dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var AorP = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  time_ele.innerHTML = `${dayList[day]},&nbsp;${monthList[month]}&nbsp;${theDay},&nbsp;${year}&nbsp;&nbsp;|&nbsp;&nbsp;${hours}:${mins}&nbsp;${AorP}`;
  setTimeout(function () {
    WebX.Clock.update(ele_id);
  }, 1000);
};



WebX.Dock = function () {};
WebX.Dock.prototype.init = function () {
  const wxWrapper = document.getElementById('webxWrapper');
  const theDock = createEl('div', { id: 'wxDock' });
  const theDock_wrapper = createEl('div', { id: 'wxDock_wrapper' });
  wxWrapper.appendChild(theDock);
  theDock.appendChild(theDock_wrapper);

  const dock_left = createEl('div', { id: 'wxDock_left' });
  theDock_wrapper.appendChild(dock_left);
  const dock_content = createEl('ul', { id: 'wxDock_ul' });
  theDock_wrapper.appendChild(dock_content);
  const dock_right = createEl('div', { id: 'wxDock_right' });
  theDock_wrapper.appendChild(dock_right);

  for (const item in webx_data.dock) {
    if (item !== 'separator') {
      WebX.Dock.create_icon(webx_data.dock[item]);
    } else {
      WebX.Dock.create_separator();
    }
  }
};

WebX.Dock.prototype.create_icon = function (item, insert, type = null, cb = null) {
  const dock_item = createEl('li', {
    className: 'wxDock_item',
    id: 'wxDock_item_' + item.name.replace(/ /g, '_'),
  });
  if (item.name === 'Trash') {
    dock_item.classList.add('wxDock_no_sort');
  }
  
  const icon_div = createEl('div', {
    className: type ? 'iIcon dockIcon dock_' + type : 'iIcon dockIcon',
    id: 'dock_' + item.name,
  });
  dock_item.appendChild(icon_div);
  
  // Special handling for Dashboard icon
  if (item.name === 'Dashboard') {
    icon_div.addEventListener('click', function(e) {
      e.preventDefault();
      WebX.Dashboard.start();
      return false;
    });
  } else if (item.click !== 'false') {
    const func = eval('(' + item.click + ')');
    const right_func = eval('(' + item.right_click + ')');
    icon_div.addEventListener('click', function (e) {
      if (dock_item.classList.contains('right_clicked')) {
        dock_item.classList.remove('right_clicked');
        document.querySelectorAll('li.wxDock_item').forEach(el => el.classList.remove('no_hover'));
      } else {
        func();
      }
      e.preventDefault();
      return false;
    });
  }

  if (insert) {
    dock_item.id = item.id;
    const div_id = 'dock_' + item.name.replace(/[ '\u2019\-,.]/g, '_');
    icon_div.id = div_id;
    const trashItem = Utils.$$('#wxDock_item_Trash');
    if (trashItem && trashItem.parentNode) {
      trashItem.parentNode.insertBefore(dock_item, trashItem);
    }
  } else {
    const dock_ul = Utils.$$('#wxDock_ul');
    dock_ul.appendChild(dock_item);
  }

  const icon_gloss = createEl('div', { className: 'iGloss' });
  icon_div.appendChild(icon_gloss);
  WebX.Dock.create_icon_tip(dock_item, item.name);
  WebX.Dock.create_icon_context_menu(dock_item, item.right_click_menu);

  if (cb) {
    cb();
  }
  WebX.Dock.center();
};

WebX.Dock.prototype.create_icon_tip = function (icon, text) {
  const tip_id = 'wxDock_tip_' + text.replace(/[ '\u2019\-,.]/g, '_');
  const theTip = createEl('div', { className: 'wxTip', id: tip_id });
  const tipText = createEl('div', { className: 'wxTipText', html: text.replace(/ /g, '&nbsp;') });
  theTip.appendChild(tipText);
  icon.appendChild(theTip);
  const tipPos = document.getElementById(tip_id);
  
  // Get accurate measurements of the tooltip for proper centering
  // First ensure it's visible for accurate measurement
  const originalVisibility = tipPos.style.visibility;
  const originalDisplay = tipPos.style.display;
  const originalPosition = tipPos.style.position;
  
  tipPos.style.visibility = 'hidden';
  tipPos.style.display = 'block';
  tipPos.style.position = 'absolute';
  
  // Get dimensions and calculate half-width for centering
  const tipWidth = tipPos.offsetWidth;
  const tipOff = tipWidth / 2;
  
  // Restore original styles
  tipPos.style.visibility = originalVisibility;
  tipPos.style.display = originalDisplay;
  tipPos.style.position = originalPosition;
  
  // Set margin to center the tooltip
  tipPos.style.marginLeft = '-' + tipOff + 'px';
};

WebX.Dock.prototype.create_minimized_icon = function (name, item, type, cb = null) {
  const item_name = String(name);
  const item_id = 'wxDock_item_' + String(item);
  const minimized_data = {
    name: item_name,
    id: item_id,
    click: `function(){ Utils.$$('#${item}').style.display = 'block'; Utils.$$('#${item_id}').remove(); WebX.Dock.center(); }`,
    right_click: `function(){ }`,
    right_click_menu: [
      {
        item: 'Open ' + item_name,
        click: `function(){ Utils.$$('#${item}').style.display = 'block'; Utils.$$('#${item_id}').remove(); WebX.Dock.center(); }`,
      },
    ],
  };
  WebX.Dock.create_icon(minimized_data, true, type, cb);
};

WebX.Dock.prototype.create_separator = function () {
  const dock_item = createEl('li', { className: 'wxDock_separator wxDock_no_sort' });
  const separator_div = createEl('div', { className: 'dock_separator' });
  dock_item.appendChild(separator_div);
  const dock_ul = Utils.$$('#wxDock_ul');
  dock_ul.appendChild(dock_item);
  WebX.Dock.center();
};

WebX.Dock.prototype.create_icon_context_menu = function (icon, items) {
  const context_menu = createEl('div', { className: 'dock_context' });
  const context_menu_ul = createEl('ul');
  context_menu.appendChild(context_menu_ul);
  for (const item of items) {
    const context_menu_item = WebX.Dock.create_icon_context_item(item);
    context_menu_ul.appendChild(context_menu_item);
  }
  icon.appendChild(context_menu);
  // Positioning logic for context menu
  context_menu.style.top = '-' + (context_menu.offsetHeight + 22) + 'px';
};

WebX.Dock.prototype.create_icon_context_item = function (item) {
  const func = eval('(' + item.click + ')');
  const li = createEl('li');
  li.innerHTML = item.item.replace(/ /g, '&nbsp;');
  li.addEventListener('click', function (e) {
    func();
    e.preventDefault();
    return false;
  });
  return li;
};

WebX.Dock.prototype.center = function () {
  const wxDock = Utils.$$('#wxDock');
  const dockWidth = Utils.getDimensions(wxDock).width;
  if (wxDock) {
    wxDock.style.marginLeft = -(dockWidth / 2) + 'px';
  }
};

WebX.Dock.prototype.hide = function () {
  const wxDock = Utils.$$('#wxDock');
  if (wxDock) {
    wxDock.style.marginBottom = '-58px';
    wxDock.dataset.state = 'closed';
  }
};

WebX.Dock.prototype.show = function () {
  const wxDock = Utils.$$('#wxDock');
  if (wxDock) {
    wxDock.style.marginBottom = '0px';
    wxDock.dataset.state = 'open';
  }
};

WebX.Dock.prototype.toggle = function () {
  const wxDock = Utils.$$('#wxDock');
  if (wxDock && wxDock.style.marginBottom === '0px') {
    WebX.Dock.hide();
  } else {
    WebX.Dock.show();
  }
};

WebX.Browser = function () {};
WebX.Browser.prototype.create = function (site_url) {
  WebX.Menubar.switch_to('browser');
  const finder = Utils.$$('#wxFinder');
  var this_id = WebX.Data.windows['browser'].length;
  const browser = createEl('div', {
    className: 'wx_window wxBrowser',
    id: 'wxBrowser_' + this_id
  });
  Utils.$$('#webxWrapper').appendChild(browser);
  
  WebX.Data.windows['browser'].push("wxBrowser_" + this_id);
  
  const browser_top = createEl('div', {
    className: "wxBrowser_top"
  });
  browser.appendChild(browser_top);

  const browser_top_perms = createEl('div', {
    className: "wxBrowser_top_permanents"
  });
  browser_top.appendChild(browser_top_perms);

  const browser_title = createEl('div', {
    className: "wxBrowser_title",
    text: "Browse"
  });
  browser_top_perms.appendChild(browser_title);

  const browser_top_button_box = createEl('div', {
    className: "wxBrowser_buttons"
  });
  browser_top_perms.appendChild(browser_top_button_box);

  const br_close_btn = createEl('div', {
    className: "button close"
  });
  browser_top_button_box.appendChild(br_close_btn);
  br_close_btn.addEventListener('click', function () {
    WebX.Browser.toggle(browser);
  });

  const br_min_button = createEl('div', {
    className: "button minimize"
  });
  browser_top_button_box.appendChild(br_min_button);
  // Minimize button logic
   
  br_min_button.addEventListener('click', function(){
    WebX.Dock.create_minimized_icon(browser.id, browser.id, 'Browser', function() {
      const dockIcon = Utils.$$('#dock_' + browser.id);
      if (!dockIcon) return;
    
      const dockRect = dockIcon.getBoundingClientRect();
      const targetPoint = {
        x: dockRect.left + (dockRect.width / 2),
        y: dockRect.top + (dockRect.height / 2)
      };
      setTimeout(() => {

        Animation.genie(browser, {
          duration: 700,
          target: targetPoint,
          onComplete: () => {
            browser.style.display = 'none';
          }
        });

      }, 100);
    });
  });

  $('<div/>', {
    className: "button maximize"
  }).appendTo(browser_top_button_box).bind('click', function(){
    debug.log('maximize button clicked');
    WebX.Browser.maximize(browser);
  });

  var browser_nav = $('<div/>', {
    className: "wxBrowser_nav"
  }).appendTo(browser_top);
  // Forward Button
  $('<div/>',{
    className: "wxBrowser_button_forward"
  }).appendTo(browser_nav).bind('click', function(){
    debug.log('forward button clicked');
    return false;
  });
  // Back Button
  $('<div/>',{
    className: "wxBrowser_button_back"
  }).appendTo(browser_nav).bind('click', function(){
    debug.log('back button clicked');
    return false;
  });
  // Home Button
  $('<div/>',{
    className: "wxBrowser_button_home"
  }).appendTo(browser_nav).bind('click', function(){
    debug.log('home button clicked');
    return false;
  });
  // Url Form
  var browser_form = $('<form/>',{
    className: "wxBrowser_url_field browser_resize",
    id: "wxBrowser_form_" + this_id
  }).appendTo(browser_nav);
  // Loader Div
  var loader_div = $('<div/>',{
    className: "wxBrowser_loader"
  }).appendTo(browser_form).hide();
  // Loader Image
  $('<img src="assets/imgs/loaders/browser_loader.gif" />').appendTo(loader_div);
  // Url Form input
  var browser_input = $('<input type="text">').attr({
    "value" : (!site_url) ? "http://google.com" : site_url,
    "class" : "browser_resize"
  }).appendTo(browser_form);
  // Refresh Button
  $('<div/>',{
    className: "wxBrowser_button_refresh"
  }).appendTo(browser_nav).bind('click', function(){
    debug.log('refresh button clicked');
    return false;
  });
  // Stop Button
  $('<div/>',{
    className: "wxBrowser_button_stop"
  }).appendTo(browser_nav).bind('click', function(){
    debug.log('stop button clicked');
    return false;
  });
  // browser tabs
  var browser_tabs_wrapper = $('<div/>', {
    className: "wxBrowser_tabs_wrapper"
  }).appendTo(browser_top);
  // Iframe
  var browser_iframe = $('<iframe/>', {
    className: "wxBrowser_iframe browser_resize",
    id: "wxBrowser_iframe_" + this_id
  }).attr({
    "src" : (!site_url) ? "http://google.com" : site_url
  }).data({
    "history": ["http://google.com"],
    "home": "http://webx.ipwn.me"
  }).appendTo(browser);
  
  browser_form.bind('submit', function(e){
    e.preventDefault();
    e.stopPropagation();
    var wxIframe_source = browser_input.val();
    if(isUrl(wxIframe_source)){
      var history = browser_iframe.data('history');
      history[history.length] = wxIframe_source;
      loader_div.show();
      browser_iframe.attr({'src': wxIframe_source }).data({ "history": history }).bind('load', function(){ loader_div.hide(); });
      $.ajax({
        type: "POST",
        url: "browser/get_page_title",
        data: "url="+wxIframe_source,
        success: function(data) {
          browser_title.html(data);
        }
      });
    } else {
      if(wxIframe_source.match(' ')) {
        loader_div.show();
        browser_iframe.attr({'src': 'https://www.google.com/search?hl=en&q='+ wxIframe_source.replace(' ','+') +'&btnI=I%27m+Feeling+Lucky'}).bind('load', function(){ loader_div.hide(); });
        browser_input.attr({'value': browser_iframe.attr('src')});
      } else {
        var history = browser_iframe.data('history');
        history[history.length] = browser_iframe.data('home');
        loader_div.show();
        browser_iframe.attr({'src': browser_iframe.data('home') }).data({ "history": history }).bind('load', function(){ loader_div.hide(); });
        browser_input.attr({'value': browser_iframe.attr('src')});
        debug.log(history);
      }
    }
  });

  Utils.DragResize.init(browser, {
    handle: browser_top,
    containment: Utils.$$('#webxWrapper'),
    minWidth: 500,
    minHeight: 135,
    alsoResize: '.browser_resize',
    contentOffset: 60,
    onDragStart: () => {
      WebX.Menubar.switch_to('browser');
      browser.style.zIndex = Utils.getNextZIndex();
    },
  }).bringToFront();
  
  return browser;
};

WebX.Browser.prototype.maximize = function (ele) {
  // Make sure WebX.Window is available before using it
  if (typeof WebX.Window === 'function') {
    // Use the Window component's maximize method
    const windowInstance = new WebX.Window();
    windowInstance.maximize(ele);
  } else {
    // Fallback for when WebX.Window isn't available yet
    console.warn('WebX.Window not available, using fallback maximize');
    
    // Simple fallback implementation
    if (ele && ele.style) {
      if (!ele.dataset.isMaximized || ele.dataset.isMaximized === 'false') {
        ele.dataset.isMaximized = 'true';
        ele.style.width = '100%';
        ele.style.height = 'calc(100% - 50px)';
        ele.style.top = '50px';
        ele.style.left = '0';
      } else {
        ele.dataset.isMaximized = 'false';
        ele.style.width = '800px';
        ele.style.height = '600px';
        ele.style.top = '100px';
        ele.style.left = '100px';
      }
    }
  }
};

WebX.Browser.prototype.close = function (ele) {
  // Make sure WebX.Window is available before using it
  if (typeof WebX.Window === 'function') {
    // Use the Window component's close method
    const windowInstance = new WebX.Window();
    windowInstance.close(ele);
  } else {
    // Fallback for when WebX.Window isn't available yet
    console.warn('WebX.Window not available, using fallback close');
    if (ele && ele.style) {
      ele.style.display = 'none';
    }
  }
};

WebX.Browser.prototype.open = function (ele, opt) {
  // Make sure WebX.Window is available before using it
  if (typeof WebX.Window === 'function') {
    // Use the Window component's open method
    const windowInstance = new WebX.Window();
    windowInstance.open(ele, opt);
  } else {
    // Fallback for when WebX.Window isn't available yet
    console.warn('WebX.Window not available, using fallback open');
    if (ele && ele.style) {
      ele.style.display = 'block';
    }
  }
};

WebX.Browser.prototype.toggle = function (ele) {
  // Make sure WebX.Window is available before using it
  if (typeof WebX.Window === 'function') {
    // Use the Window component's toggle method
    const windowInstance = new WebX.Window();
    windowInstance.toggle(ele);
  } else {
    // Fallback for when WebX.Window isn't available yet
    console.warn('WebX.Window not available, using fallback toggle');
    if (ele && ele.style) {
      if (ele.style.display === 'none') {
        WebX.Browser.open(ele);
      } else {
        WebX.Browser.close(ele);
      }
    }
  }
};

WebX.Finder = function () {};
WebX.Finder.prototype.create = function () {
  WebX.Menubar.switch_to('finder');
  const this_id = WebX.Data.windows['finder'].length;
  const finder = createEl('div', {
    className: "wx_window wxFinder",
    id: "wxFinder_" + this_id
  });
  Utils.$$('#webxWrapper').appendChild(finder);
  
  WebX.Data.windows['finder'].push("wxFinder_" + this_id);
  
  const finder_top = createEl('div', { className: "wxFinder_top" });
  finder.appendChild(finder_top);
  
  const finder_top_perms = createEl('div', { className: "wxFinder_top_permanents" });
  finder_top.appendChild(finder_top_perms);
  
  const finder_top_button_box = createEl('div', { className: "wxFinder_buttons" });
  finder_top_perms.appendChild(finder_top_button_box);
  
  const closeButton = createEl('div', { className: "button close" });
  finder_top_button_box.appendChild(closeButton);
  closeButton.addEventListener('click', function(){
    debug.log('close button clicked');
    WebX.Finder.toggle(finder);
  });
  
  const minimizeButton = createEl('div', { className: "button minimize" });
  finder_top_button_box.appendChild(minimizeButton);
  
  minimizeButton.addEventListener('click', function(){
    WebX.Dock.create_minimized_icon(finder.id, finder.id, 'Finder', function() {
      const dockIcon = Utils.$$('#dock_' + finder.id);
      if (!dockIcon) return;
    
      const dockRect = dockIcon.getBoundingClientRect();
      const targetPoint = {
        x: dockRect.left + (dockRect.width / 2),
        y: dockRect.top + (dockRect.height / 2)
      };
      setTimeout(() => {

        Animation.genie(finder, {
          duration: 700,
          target: targetPoint,
          onComplete: () => {
            finder.style.display = 'none';
          }
        });

      }, 100);
    });
  });
  
  const maximizeButton = createEl('div', { className: "button maximize" });
  finder_top_button_box.appendChild(maximizeButton);
  maximizeButton.addEventListener('click', function(){
    debug.log('maximize button clicked');
    WebX.Finder.maximize(finder);
  });

  const finder_title = createEl('div', { className: "wxFinder_title", text: "Finder" });
  finder_top_perms.appendChild(finder_title);
  
  const finder_nav = createEl('div', { className: "wxFinder_nav" });
  finder_top.appendChild(finder_nav);
  
  // Back Button
  const backButton = createEl('div', { className: "wxFinder_button_back" });
  finder_nav.appendChild(backButton);
  backButton.addEventListener('click', function(){
    debug.log('back button clicked');
    return false;
  });
  backButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  backButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // Forward Button
  const forwardButton = createEl('div', { className: "wxFinder_button_forward" });
  finder_nav.appendChild(forwardButton);
  forwardButton.addEventListener('click', function(){
    debug.log('forward button clicked');
    return false;
  });
  forwardButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  forwardButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // Views
  // Icon View
  const iconViewButton = createEl('div', { className: "wxFinder_button_icon_view" });
  finder_nav.appendChild(iconViewButton);
  iconViewButton.addEventListener('click', function(){
    debug.log('icon view button clicked');
    return false;
  });
  iconViewButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  iconViewButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // List View
  const listViewButton = createEl('div', { className: "wxFinder_button_list_view" });
  finder_nav.appendChild(listViewButton);
  listViewButton.addEventListener('click', function(){
    debug.log('list view button clicked');
    return false;
  });
  listViewButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  listViewButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // Column View
  const columnViewButton = createEl('div', { className: "wxFinder_button_column_view" });
  finder_nav.appendChild(columnViewButton);
  columnViewButton.addEventListener('click', function(){
    debug.log('column view button clicked');
    return false;
  });
  columnViewButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  columnViewButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // Coverflow View
  const coverflowViewButton = createEl('div', { className: "wxFinder_button_coverflow_view" });
  finder_nav.appendChild(coverflowViewButton);
  coverflowViewButton.addEventListener('click', function(){
    debug.log('coverflow view button clicked');
    return false;
  });
  coverflowViewButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  coverflowViewButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // Quicklook Button
  const quicklookButton = createEl('div', { className: "wxFinder_button_quicklook" });
  finder_nav.appendChild(quicklookButton);
  quicklookButton.addEventListener('click', function(){
    debug.log('quicklook button clicked');
    return false;
  });
  quicklookButton.addEventListener('mousedown', function(){
    this.classList.add('finder_pressed');
  });
  quicklookButton.addEventListener('mouseup', function(){
    this.classList.remove('finder_pressed');
  });
  
  // Content
  const finder_content = createEl('div', {
    className: "wxFinder_content finder_resize",
    id: "wxFinder_content_" + this_id
  });
  finder.appendChild(finder_content);
  
  const finder_sidebar = createEl('div', {
    className: "wxFinder_sidebar finder_resize",
    id: "wxFinder_sidebar_" + this_id
  });
  finder.appendChild(finder_sidebar);
  
  // Footer
  const finder_footer = createEl('div', { className: "wxFinder_footer" });
  finder.appendChild(finder_footer);

  finder_content.style.height = (finder.offsetHeight - (finder_top.offsetHeight + finder_footer.offsetHeight + 2)) + "px";
  
  finder_sidebar.style.height = (finder.offsetHeight - (finder_top.offsetHeight + finder_footer.offsetHeight + 2)) + "px";
  finder_sidebar.style.top = finder_top.offsetHeight + "px";
  
  // Initialize drag and resize
  Utils.DragResize.init(finder, {
    handle: finder_top,
    containment: Utils.$$('#webxWrapper'),
    minWidth: 500,
    minHeight: 135,
    alsoResize: '.finder_resize',
    contentOffset: 60,
    onDragStart: () => {
      WebX.Menubar.switch_to('finder');
      finder.style.zIndex = Utils.getNextZIndex();
    },
  }).bringToFront();

  return finder;
};

WebX.Finder.prototype.maximize = function (ele) {
  if (typeof WebX.Window === 'function') {
    // Use the Window component's maximize method
    const windowInstance = new WebX.Window();
    windowInstance.maximize(ele);
  } else {
    // Fallback implementation
    console.warn('WebX.Window not available, using fallback maximize');
    const finder = ele || document.querySelector('.wxFinder');
    if (finder) {
      if (finder.classList.contains('maximized')) {
        finder.classList.remove('maximized');
        finder.style.width = finder.dataset.originalWidth || '800px';
        finder.style.height = finder.dataset.originalHeight || '500px';
        finder.style.top = finder.dataset.originalTop || '50px';
        finder.style.left = finder.dataset.originalLeft || '50px';
      } else {
        // Store original dimensions
        finder.dataset.originalWidth = finder.style.width;
        finder.dataset.originalHeight = finder.style.height;
        finder.dataset.originalTop = finder.style.top;
        finder.dataset.originalLeft = finder.style.left;
        
        finder.classList.add('maximized');
        finder.style.width = '100%';
        finder.style.height = '100%';
        finder.style.top = '0';
        finder.style.left = '0';
      }
    }
  }
};

WebX.Finder.prototype.close = function (ele) {
  if (typeof WebX.Window === 'function') {
    // Use the Window component's close method
    const windowInstance = new WebX.Window();
    windowInstance.close(ele);
  } else {
    // Fallback implementation
    console.warn('WebX.Window not available, using fallback close');
    const finder = ele || document.querySelector('.wxFinder');
    if (finder) {
      finder.style.display = 'none';
    }
  }
};

WebX.Finder.prototype.open = function (ele, opt) {
  if (typeof WebX.Window === 'function') {
    // Use the Window component's open method
    const windowInstance = new WebX.Window();
    windowInstance.open(ele, opt);
  } else {
    // Fallback implementation
    console.warn('WebX.Window not available, using fallback open');
    const finder = ele || document.querySelector('.wxFinder');
    if (finder) {
      finder.style.display = 'block';
      finder.style.zIndex = Utils.getNextZIndex();
      
      if (opt && opt.position) {
        if (opt.position.top) finder.style.top = opt.position.top + 'px';
        if (opt.position.left) finder.style.left = opt.position.left + 'px';
      }
    }
  }
};

WebX.Finder.prototype.toggle = function (ele) {
  if (typeof WebX.Window === 'function') {
    // Use the Window component's toggle method
    const windowInstance = new WebX.Window();
    windowInstance.toggle(ele);
  } else {
    // Fallback implementation
    console.warn('WebX.Window not available, using fallback toggle');
    const finder = ele || document.querySelector('.wxFinder');
    if (finder) {
      if (finder.style.display === 'none') {
        this.open(finder);
      } else {
        this.close(finder);
      }
    }
  }
};

// Utility functions
// Utils is now defined in WebXUtils.js

// Create a lowercase 'window' property for backwards compatibility
WebX.window = {
  close: function(ele) {
    if (typeof WebX.Window === 'function') {
      const windowInstance = new WebX.Window();
      windowInstance.close(ele);
    } else {
      console.warn('WebX.Window not available, using fallback close');
      const win = ele || document.querySelector('.wxWindow');
      if (win) {
        win.style.display = 'none';
      }
    }
  },
  open: function(ele, opt) {
    if (typeof WebX.Window === 'function') {
      const windowInstance = new WebX.Window();
      windowInstance.open(ele, opt);
    } else {
      console.warn('WebX.Window not available, using fallback open');
      const win = ele || document.querySelector('.wxWindow');
      if (win) {
        win.style.display = 'block';
        win.style.zIndex = Utils.getNextZIndex();
        
        if (opt && opt.position) {
          if (opt.position.top) win.style.top = opt.position.top + 'px';
          if (opt.position.left) win.style.left = opt.position.left + 'px';
        }
      }
    }
  },
  toggle: function(ele) {
    if (typeof WebX.Window === 'function') {
      const windowInstance = new WebX.Window();
      windowInstance.toggle(ele);
    } else {
      console.warn('WebX.Window not available, using fallback toggle');
      const win = ele || document.querySelector('.wxWindow');
      if (win) {
        if (win.style.display === 'none') {
          this.open(win);
        } else {
          this.close(win);
        }
      }
    }
  },
  maximize: function(ele) {
    if (typeof WebX.Window === 'function') {
      const windowInstance = new WebX.Window();
      windowInstance.maximize(ele);
    } else {
      console.warn('WebX.Window not available, using fallback maximize');
      const win = ele || document.querySelector('.wxWindow');
      if (win) {
        if (win.classList.contains('maximized')) {
          win.classList.remove('maximized');
          win.style.width = win.dataset.originalWidth || '800px';
          win.style.height = win.dataset.originalHeight || '500px';
          win.style.top = win.dataset.originalTop || '50px';
          win.style.left = win.dataset.originalLeft || '50px';
        } else {
          // Store original dimensions
          win.dataset.originalWidth = win.style.width;
          win.dataset.originalHeight = win.style.height;
          win.dataset.originalTop = win.style.top;
          win.dataset.originalLeft = win.style.left;
          
          win.classList.add('maximized');
          win.style.width = '100%';
          win.style.height = '100%';
          win.style.top = '0';
          win.style.left = '0';
        }
      }
    }
  }
};

// Create namespace for creation functions
WebX.create = {
  window: function(type, width, height, id, title, content) {
    if (typeof WebX.Window === 'function' && WebX.Window.create) {
      return WebX.Window.create({
        type: type,
        width: width,
        height: height,
        id: id,
        title: title,
        content: content
      });
    } else {
      console.warn('WebX.Window.create not available, using fallback window creation');
      // Fallback implementation - create a basic window
      const winId = id || 'wx_window_' + Math.floor(Math.random() * 10000);
      const windowType = type || 'browser';
      
      // Create the window container
      const win = document.createElement('div');
      win.id = winId;
      win.className = 'wxWindow wx' + windowType.charAt(0).toUpperCase() + windowType.slice(1);
      win.style.width = width + 'px';
      win.style.height = height + 'px';
      win.style.position = 'absolute';
      win.style.top = '50px';
      win.style.left = '50px';
      win.style.zIndex = Utils.getNextZIndex();
      
      // Create window top (title bar)
      const winTop = document.createElement('div');
      winTop.className = 'wxWindow_top';
      
      // Add title
      const winTitle = document.createElement('div');
      winTitle.className = 'wxWindow_title';
      winTitle.textContent = title || 'Window';
      winTop.appendChild(winTitle);
      
      // Add window buttons
      const winButtons = document.createElement('div');
      winButtons.className = 'wxWindow_buttons';
      
      const closeBtn = document.createElement('div');
      closeBtn.className = 'wxWindow_close';
      closeBtn.onclick = function() { WebX.window.close(win); };
      winButtons.appendChild(closeBtn);
      
      const maxBtn = document.createElement('div');
      maxBtn.className = 'wxWindow_maximize';
      maxBtn.onclick = function() { WebX.window.maximize(win); };
      winButtons.appendChild(maxBtn);
      
      winTop.appendChild(winButtons);
      win.appendChild(winTop);
      
      // Add content
      const winContent = document.createElement('div');
      winContent.className = 'wxWindow_content';
      if (typeof content === 'string') {
        winContent.innerHTML = content;
      } else if (content instanceof Element) {
        winContent.appendChild(content);
      }
      win.appendChild(winContent);
      
      // Add to DOM
      document.getElementById('webxWrapper').appendChild(win);
      
      // Initialize drag and resize
      Utils.DragResize.init(win, {
        handle: winTop,
        containment: Utils.$$('#webxWrapper'),
        minWidth: 200,
        minHeight: 100
      });
      
      return win;
    }
  }
};

/**
 * WebX.Window - Window component that provides core window management functionality
 * 
 * This class serves as a foundation for both the Browser and Finder components,
 * providing shared window functionality like positioning, maximizing, closing,
 * opening, and toggling visibility. It allows for a consistent window interface
 * across different window types in the WebX application.
 */
/**
 * Base window management class - Currently used as a placeholder for future functionality
 */
WebX.Window = function() {};

/**
 * Maximize or restore a window
 * 
 * This method toggles between maximized and normal window states. When maximizing,
 * it stores the original dimensions and position for later restoration.
 * 
 * @param {HTMLElement} ele - The window element to maximize (optional, uses this.element if not provided)
 * @returns {WebX.Window} - The window instance for chaining
 */
WebX.Window.prototype.maximize = function(ele) {
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Get the appropriate modifiers based on window type
  let widthModifier = 0;
  let heightModifier = 0;
  
  // Apply different spacing for finder windows
  if (ele.dataset.windowType === 'finder') {
    widthModifier = 136;
    heightModifier = 27;
  }
  
  // Get wrapper dimensions
  const wrapper = Utils.$$('#webxWrapper');
  const wrapperRect = wrapper ? Utils.getDimensions(wrapper) : { 
    width: window.innerWidth, 
    height: window.innerHeight 
  };
  
  // Get menubar height
  const menubar = Utils.$$('#wxMenubar');
  const menubarHeight = menubar ? Utils.getDimensions(menubar).height : 0;
  
  // Store original state if not already stored
  if (!ele.dataset.sizeState || ele.dataset.sizeState !== "max") {
    const eleRect = Utils.getDimensions(ele);
    
    // Store original dimensions
    ele.dataset.originalLeft = ele.style.left;
    ele.dataset.originalTop = ele.style.top;
    ele.dataset.originalHeight = eleRect.height;
    ele.dataset.originalWidth = eleRect.width;
    ele.dataset.sizeState = "min";
  }
  
  if (ele.dataset.sizeState === "min") {
    // Maximize the window
    ele.style.width = `${wrapperRect.width}px`;
    ele.style.height = `${wrapperRect.height - menubarHeight}px`;
    ele.style.top = `${menubarHeight}px`;
    ele.style.left = `${widthModifier}px`;
    
    // Adjust content size
    const bodyContent = ele.querySelector('.wxWindow_body, .wxBrowser_iframe, .wxFinder_content');
    if (bodyContent) {
      bodyContent.style.width = '100%';
      bodyContent.style.height = `${parseInt(ele.style.height) - 60 - heightModifier}px`;
    }
    
    // Update state
    ele.dataset.sizeState = "max";
  } else {
    // Restore the window to its original size
    ele.style.width = `${ele.dataset.originalWidth}px`;
    ele.style.height = `${ele.dataset.originalHeight}px`;
    ele.style.top = ele.dataset.originalTop;
    ele.style.left = ele.dataset.originalLeft;
    
    // Adjust content size
    const bodyContent = ele.querySelector('.wxWindow_body, .wxBrowser_iframe, .wxFinder_content');
    if (bodyContent) {
      bodyContent.style.width = '100%';
      const heightAdjustment = (ele.dataset.windowType === 'finder') ? heightModifier - 2 : heightModifier;
      bodyContent.style.height = `${parseInt(ele.dataset.originalHeight) - 60 - heightAdjustment}px`;
    }
    
    // Update state
    ele.dataset.sizeState = "min";
  }
  
  return this;
};

/**
 * Close a window with a fade-out animation
 * 
 * @param {HTMLElement} ele - The window element to close (optional, uses this.element if not provided)
 * @returns {WebX.Window} - The window instance for chaining
 */
WebX.Window.prototype.close = function(ele) {
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Initialize viewState if not already set
  if (!ele.dataset.viewState) {
    ele.dataset.viewState = "";
  }
  
  // Only close if not already closed
  if (ele.dataset.viewState !== "closed") {
    // Use Animation API instead of jQuery fadeOut
    ele.animate(
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      { duration: 420, easing: 'ease-out' }
    ).onfinish = () => {
      ele.style.display = 'none';
    };
    
    // Update window state
    ele.dataset.viewState = "closed";
  }
  
  return this;
};

/**
 * Open a window with a fade-in animation
 * 
 * @param {HTMLElement} ele - The window element to open (optional, uses this.element if not provided)
 * @param {Object} opt - Additional options (not currently used)
 * @returns {WebX.Window} - The window instance for chaining
 */
WebX.Window.prototype.open = function(ele, opt) {
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Initialize viewState if not already set
  if (!ele.dataset.viewState) {
    ele.dataset.viewState = "";
  }
  
  // Only open if not already open
  if (ele.dataset.viewState !== "open") {
    // Make sure it's displayed but initially invisible
    ele.style.display = 'block';
    ele.style.opacity = 0;
    
    // Use Animation API instead of jQuery fadeIn
    ele.animate(
      [
        { opacity: 0 },
        { opacity: 1 }
      ],
      { duration: 420, easing: 'ease-in' }
    ).onfinish = () => {
      ele.style.opacity = 1;
    };
    
    // Update window state
    ele.dataset.viewState = "open";
  }
  
  return this;
};

/**
 * Toggle window visibility - opens a closed window or closes an open window
 * If the window doesn't exist and a string selector is provided, creates a new window
 * 
 * @param {HTMLElement|string} ele - The window element or selector
 * @returns {WebX.Window} - The window instance for chaining
 */
WebX.Window.prototype.toggle = function(ele) {
  // If we have a string selector, find or create the window
  if (typeof ele === 'string') {
    const windowEl = document.querySelector(ele);
    
    if (!windowEl) {
      // Need to create the window
      let windowTitle, windowContent, windowType;
      
      // Determine window properties based on the selector
      switch (ele.replace('#wxWindow_', '')) {
        case 'Settings':
          windowTitle = 'Settings';
          windowContent = 'Settings will go here.';
          windowType = 'finder';
          break;
        default:
          windowTitle = 'Title';
          windowContent = '';
          windowType = 'finder';
          break;
      }
      
      // Create the window
      return WebX.Window.create({
        type: windowType,
        id: ele.replace('#', ''),
        title: windowTitle,
        content: windowContent,
        width: 357,
        height: 287
      });
    }
    
    ele = windowEl;
  }
  
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Toggle window visibility
  if (ele.style.display === 'none' || ele.dataset.viewState === "closed") {
    return this.open(ele);
  } else {
    return this.close(ele);
  }
};

/**
 * Create a new window
 * 
 * Factory method that creates and initializes a window with the specified options.
 * Handles all DOM creation, event binding, and initialization.
 * 
 * @param {Object} options - Configuration options for the window
 * @param {string} options.type - Type of window ('generic', 'browser', 'finder', etc.)
 * @param {number} options.width - Window width in pixels
 * @param {number} options.height - Window height in pixels
 * @param {string} options.id - Unique identifier for the window
 * @param {string} options.title - Window title
 * @param {string|HTMLElement} options.content - Content for the window
 * @param {string|Array} options.position - Window position ('center', 'random', or [x,y] coordinates)
 * @returns {HTMLElement|null} - The created window element or null if creation failed
 */
WebX.Window.create = function(options = {}) {
  try {
    // Make sure Utils and createEl are available
    if (typeof Utils === 'undefined' || typeof createEl !== 'function') {
      console.error('Utils or createEl not available for WebX.Window.create');
      return null;
    }
    
    // Set default options
    const defaultOptions = {
      type: 'generic',    // 'browser', 'finder', etc.
      width: 500,
      height: 350,
      id: `wxWindow_${Math.floor(Math.random() * 10000)}`,
      title: 'Window',
      content: '',
      position: 'center'  // 'center', 'random', or [x, y]
    };
    
    const settings = Object.assign({}, defaultOptions, options);
    
    // Create base window element
    const window = createEl('div', {
      className: `wx_window wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}`,
      id: settings.id
    });
    
    // Store window type
    window.dataset.windowType = settings.type;
    
    // Set initial dimensions
    window.style.width = `${settings.width}px`;
    window.style.height = `${settings.height}px`;
    
    // Add to wrapper
    const wrapper = Utils.$$('#webxWrapper');
    if (wrapper) {
      wrapper.appendChild(window);
    } else {
      document.body.appendChild(window);
      console.warn('webxWrapper not found, appending window to document.body');
    }
    
    // Create window top bar
    const windowTop = createEl('div', {
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_top`
    });
    window.appendChild(windowTop);
    
    // Create permanent elements container
    const topPerms = createEl('div', {
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_top_permanents`
    });
    windowTop.appendChild(topPerms);
    
    // Create window title
    const windowTitle = createEl('div', {
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_title`,
      text: settings.title
    });
    topPerms.appendChild(windowTitle);
    
    // Create button box
    const buttonBox = createEl('div', {
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_buttons`
    });
    topPerms.appendChild(buttonBox);
    
    // Create close button
    const closeBtn = createEl('div', {
      className: "button close"
    });
    buttonBox.appendChild(closeBtn);
    closeBtn.addEventListener('click', function() {
      const windowInstance = new WebX.Window();
      windowInstance.element = window;
      windowInstance.close();
    });
    
    // Create minimize button
    const minBtn = createEl('div', {
      className: "button minimize"
    });
    buttonBox.appendChild(minBtn);
    minBtn.addEventListener('click', function() {
      // Create minimized icon in dock
      WebX.Dock.create_minimized_icon(window.id, window.id, settings.type, function() {
        const dockIcon = Utils.$$('#dock_' + window.id);
        if (!dockIcon) return;
      
        const dockRect = dockIcon.getBoundingClientRect();
        const targetPoint = {
          x: dockRect.left + (dockRect.width / 2),
          y: dockRect.top + (dockRect.height / 2)
        };
        
        // Animate window to dock using genie effect or fallback animation
        setTimeout(() => {
          if (typeof Animation !== 'undefined' && Animation.genie) {
            Animation.genie(window, {
              duration: 700,
              target: targetPoint,
              onComplete: () => {
                window.style.display = 'none';
              }
            });
          } else {
            // Fallback animation
            window.animate(
              [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(0.1)', opacity: 0 }
              ],
              { duration: 700, easing: 'ease-in' }
            ).onfinish = () => {
              window.style.display = 'none';
            };
          }
        }, 100);
      });
    });
    
    // Create maximize button
    const maxBtn = createEl('div', {
      className: "button maximize"
    });
    buttonBox.appendChild(maxBtn);
    maxBtn.addEventListener('click', function() {
      const windowInstance = new WebX.Window();
      windowInstance.element = window;
      windowInstance.maximize();
    });
    
    // Create content area
    const contentDiv = createEl('div', {
      className: "wxWindow_body",
      html: settings.content
    });
    window.appendChild(contentDiv);
    
    // Position the window
    const windowInstance = new WebX.Window();
    windowInstance.element = window;
    windowInstance.options = settings;
    
    // Position the window based on settings
    if (settings.position) {
      if (settings.position === 'center') {
        // Center in viewport
        const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : 
          {width: window.innerWidth, height: window.innerHeight, left: 0, top: 0};
        const menubar = Utils.$$('#wxMenubar');
        const menubarHeight = menubar ? menubar.getBoundingClientRect().height : 0;
        
        const windowWidth = parseInt(window.style.width);
        const windowHeight = parseInt(window.style.height);
        
        window.style.left = `${Math.max(0, (wrapperRect.width - windowWidth) / 2)}px`;
        window.style.top = `${Math.max(menubarHeight, (wrapperRect.height - windowHeight) / 2)}px`;
      } else if (settings.position === 'random') {
        // Random position within wrapper
        const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : 
          {width: window.innerWidth, height: window.innerHeight, left: 0, top: 0};
        const menubar = Utils.$$('#wxMenubar');
        const menubarHeight = menubar ? menubar.getBoundingClientRect().height : 0;
        
        const windowWidth = parseInt(window.style.width);
        const windowHeight = parseInt(window.style.height);
        
        const maxLeft = Math.max(0, wrapperRect.width - windowWidth);
        const maxTop = Math.max(menubarHeight, wrapperRect.height - windowHeight);
        
        window.style.left = `${Math.floor(Math.random() * maxLeft)}px`;
        window.style.top = `${Math.floor(Math.random() * (maxTop - menubarHeight)) + menubarHeight}px`;
      } else if (Array.isArray(settings.position) && settings.position.length === 2) {
        // Explicit [x,y] coordinates
        window.style.left = `${settings.position[0]}px`;
        window.style.top = `${settings.position[1]}px`;
      } else if (typeof settings.position === 'object') {
        // Object with explicit coordinates
        if (settings.position.left !== undefined) window.style.left = `${settings.position.left}px`;
        if (settings.position.top !== undefined) window.style.top = `${settings.position.top}px`;
      }
    }
    
    // No need for separate init - already done within the create function
    
    // Track window in WebX.Data
    if (WebX.Data && WebX.Data.windows) {
      if (!WebX.Data.windows[settings.type]) {
        WebX.Data.windows[settings.type] = [];
      }
      WebX.Data.windows[settings.type].push(window.id);
    }
    
    // Return the created window element
    return window;
  } catch (error) {
    console.error('Error creating window:', error);
    return null;
  }
};
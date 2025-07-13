// Helper: safely create an element with optional class and id
function createEl(tag, options = {}) {
  const el = document.createElement(tag);
  Object.entries(options).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key === 'id') el.id = value;
    else if (key === 'text') el.textContent = value;
    else if (key === 'html') el.innerHTML = value;
    else el.setAttribute(key, value);
  });
  return el;
}

// Ensure WebX is defined in the global scope
window.WebX = {
  Data: {
    windows: { browser: [], finder: [], generic: [] },
    menubars: []
  },
  
  init() {
    // Create main wrapper and components
    const webx_wrapper = createEl('div', { id: 'webxWrapper' });
    document.body.appendChild(webx_wrapper);
    
    // Initialize components
    Object.assign(this, {
      Browser: new WebX.Browser(),
      Clock: new WebX.Clock(),
      Finder: new WebX.Finder(),
      Dock: new WebX.Dock()
    });
    
    // Add wallpaper
    webx_wrapper.appendChild(createEl('div', { 
      html: '<img id="wallpaper" src="assets/imgs/wallpaper/Vitrieth_by_iumazark.jpg" alt="" title="" />' 
    }));

    // Hide starter and initialize components
    const starter = Utils.$$('#starter');
    if (starter) starter.style.display = 'none';

    [this.Menubar, this.Dock, this.Dashboard].forEach(component => {
      if (component?.init) component.init();
    });
  },
  Menubar: {
    init() {
      const webx_wrapper = document.getElementById('webxWrapper');
      const menubar = createEl('div', { id: 'wxMenubar' });
      const user_area = createEl('div', { id: 'mb_user_area' });
      
      webx_wrapper.appendChild(menubar);
      menubar.appendChild(user_area);
      
      // Add user elements
      WebX.Clock.create('wx_mb_clock', user_area);
      ['wx_mb_user_name', 'wx_mb_user_pic'].forEach((id, index) => {
        const elem = createEl('div', { 
          id, 
          ...(index === 0 && { text: 'Default User' })
        });
        user_area.insertBefore(elem, user_area.firstChild);
      });
      
      // Create menu items
      Object.keys(webx_data.menubar).forEach(item => {
        const menubar_ul = createEl('ul', { 
          className: 'menubar_ul', 
          id: `menubar_ul_${item}` 
        });
        menubar.appendChild(menubar_ul);
        
        Object.keys(webx_data.menubar[item]).forEach(link => {
          this.create_link(`${item}_${link}`, menubar_ul);
        });
      });
      
      // Hide all except finder
      menubar.querySelectorAll('ul.menubar_ul').forEach(ul => {
        if (ul.id !== 'menubar_ul_finder') ul.style.display = 'none';
      });
    },
    create_link(obj, target) {
      const names = obj.split('_');
      const menubar_li = createEl('li', { 
        className: 'mb_item disabled', 
        id: `mb_${obj}`, 
        text: names[1] 
      });
      
      const toggleState = (item) => {
        item.classList.toggle('disabled');
        item.classList.toggle('enabled');
      };
      
      menubar_li.addEventListener('click', (e) => {
        e.preventDefault();
        toggleState(menubar_li);
        target.querySelectorAll('li.enabled').forEach(item => {
          if (item !== menubar_li) toggleState(item);
        });
        return false;
      });
      
      menubar_li.addEventListener('mouseover', (e) => {
        const enabledItems = target.querySelectorAll('li.enabled');
        if (enabledItems.length === 1 && !menubar_li.classList.contains('enabled')) {
          enabledItems.forEach(toggleState);
          toggleState(menubar_li);
        }
        return false;
      });
      
      target.appendChild(menubar_li);
      this.create_panel(obj, webx_data.menubar[names[0]][names[1]], menubar_li);
    },
    create_panel(panel, contents, target) {
      const mb_panel = createEl('div', { 
        id: `${panel}_panel`, 
        className: 'mbWindow' 
      });
      const mb_link_ul = createEl('ul');
      mb_panel.appendChild(mb_link_ul);
      target.appendChild(mb_panel);
      
      Object.keys(contents).forEach(panel_link => {
        this.create_panel_link(panel_link, contents[panel_link], mb_link_ul);
      });
    },

    create_sub_panel(panel, contents, target) {
      const mb_panel = createEl('div', { 
        id: `${panel}_sub_panel`, 
        className: 'mbSubWindow' 
      });
      const mb_link_ul = createEl('ul');
      mb_panel.appendChild(mb_link_ul);
      target.appendChild(mb_panel);
      
      Object.keys(contents).forEach(panel_link => {
        this.create_panel_link(panel_link, contents[panel_link], mb_link_ul);
      });
    },

    create_panel_link(link_name, link_funcs, target) {
      const mb_link_li = createEl('li', { text: link_name });
      target.appendChild(mb_link_li);
      
      const clickHandler = link_funcs.click !== 'false' ? 
        new Function('return ' + link_funcs.click)() : 
        () => {};
      
      mb_link_li.addEventListener('click', (e) => {
        e.preventDefault();
        clickHandler();
        return false;
      });
      
      if (link_funcs.list) {
        this.create_sub_panel(link_name, link_funcs.list, mb_link_li);
      }
    },

    switch_to(menubar) {
      document.querySelectorAll('.menubar_ul').forEach(ul => {
        ul.style.display = ul.id === `menubar_ul_${menubar}` ? '' : 'none';
      });
    }
  },
  Dashboard: {
    init() {
      // console.log('Dashboard init called');
      const dashboardPanel = createEl('div', { id: 'dashboardPanel' });
      document.body.appendChild(dashboardPanel);
      
      Object.assign(dashboardPanel.dataset, {
        dashboardStatus: '0',
        widgetDrawerStatus: '0'
      });

      const dbOverlay = createEl('div', { id: "dbOverlay" });
      document.getElementById('webxWrapper').appendChild(dbOverlay);
      
      // Create dashboard buttons
      const elements = [
        { id: 'dbDrawerButton', handler: this.drawer.bind(this) },
        { id: 'dbManageButton', handler: null }
      ];
      
      elements.forEach(({ id, handler }) => {
        const button = createEl('div', { id });
        if (handler) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // console.log(`${id} clicked!`);
            handler();
            return false;
          });
        }
        dbOverlay.appendChild(button);
      });
      
      // Overlay click handler
      dbOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        // console.log('Overlay clicked');
        this.start();
        return false;
      });
      
      // console.log('Dashboard elements created');
    },

    start() {
      const elements = this.getElements();
      // console.log('Dashboard start called. Elements found:', elements);
      
      if (!elements.dashboardPanel) {
        console.error('Dashboard panel not found');
        return;
      }

      const { dashboardPanel, dbOverlay, dbManageButton, webxWrapper, dbDrawerButton } = elements;
      const status = dashboardPanel.dataset.dashboardStatus;
      const drawerStatus = dashboardPanel.dataset.widgetDrawerStatus;
      
      // console.log('Current dashboard status:', status);

      if (status === '0') {
        // console.log('Activating dashboard...');
        dbManageButton.style.display = 'none';
        this.fadeToggle(dbOverlay, 420);
        dashboardPanel.dataset.dashboardStatus = '1';
      } else if (status === '1' && drawerStatus === '1') {
        // console.log('Closing dashboard with drawer open...');
        this.animate([webxWrapper, dbOverlay], { marginTop: '0px' }, 420);
        this.rotateElement(dbDrawerButton, 135, 420);
        this.fadeToggle(dbManageButton, 420);
        this.fadeOut(dbOverlay, 420);
        Object.assign(dashboardPanel.dataset, {
          widgetDrawerStatus: '0',
          dashboardStatus: '0'
        });
      } else if (status === '1') {
        // console.log('Closing dashboard...');
        this.fadeOut(dbOverlay, 420);
        dashboardPanel.dataset.dashboardStatus = '0';
      }
    },

    drawer() {
      const elements = this.getElements();
      // console.log('Dashboard drawer called. Elements found:', elements);
      
      if (!elements.dashboardPanel) {
        console.error('Dashboard panel not found');
        return;
      }

      const { dashboardPanel, dbOverlay, dbManageButton, webxWrapper, dbDrawerButton } = elements;
      const status = dashboardPanel.dataset.widgetDrawerStatus;
      
      // console.log('Widget drawer status:', status);

      const actions = {
        '0': () => {
          // console.log('Opening drawer...');
          this.animate([webxWrapper, dbOverlay], { marginTop: '-118px' }, 420);
          this.rotateElement(dbDrawerButton, -135, 420);
          this.fadeToggle(dbManageButton, 420);
          dashboardPanel.dataset.widgetDrawerStatus = '1';
        },
        '1': () => {
          // console.log('Closing drawer...');
          this.animate([webxWrapper, dbOverlay], { marginTop: '0px' }, 420);
          this.rotateElement(dbDrawerButton, 135, 420);
          this.fadeToggle(dbManageButton, 420);
          dashboardPanel.dataset.widgetDrawerStatus = '0';
        }
      };
      
      actions[status]?.();
    },

    // Helper method to get all dashboard elements
    getElements() {
      const ids = ['dashboardPanel', 'dbOverlay', 'dbManageButton', 'webxWrapper', 'dbDrawerButton'];
      return Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
    },

    // Animation helper methods
    animate(elements, properties, duration) {
      (Array.isArray(elements) ? elements : [elements]).forEach(element => {
        if (element) {
          element.style.transition = `all ${duration}ms`;
          Object.assign(element.style, properties);
        }
      });
    },

    fadeOut(element, duration) {
      if (!element) return;
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';
      setTimeout(() => element.style.display = 'none', duration);
    },

    fadeToggle(element, duration) {
      if (!element) return;
      element.style.transition = `opacity ${duration}ms`;
      const isHidden = element.style.display === 'none' || 
                      window.getComputedStyle(element).display === 'none';
      
      if (isHidden) {
        element.style.display = 'block';
        element.style.opacity = '1';
      } else {
        element.style.opacity = '0';
        setTimeout(() => element.style.display = 'none', duration);
      }
    },

    rotateElement(element, degrees, duration) {
      if (!element) return;
      element.style.transition = `transform ${duration}ms`;
      const currentRotation = element.style.transform ? 
        parseInt(element.style.transform.match(/-?\d+/) || 0) : 0;
      element.style.transform = `rotate(${currentRotation + degrees}deg)`;
    }
  },
};

// WebX Components
WebX.Clock = function () {};
WebX.Clock.prototype = {
  create(ele_id, target) {
    const clock_div = createEl('div', { id: ele_id });
    target.appendChild(clock_div);
    this.update(ele_id);
  },

  update(ele_id) {
    const time_ele = document.getElementById(ele_id);
    if (!time_ele) return;
    
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const hours = now.getHours();
    const displayHours = hours % 12 || 12;
    const mins = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? "PM" : "AM";
    
    time_ele.innerHTML = `${days[now.getDay()]},&nbsp;${months[now.getMonth()]}&nbsp;${now.getDate()},&nbsp;${now.getFullYear()}&nbsp;&nbsp;|&nbsp;&nbsp;${displayHours}:${mins}&nbsp;${ampm}`;
    
    setTimeout(() => this.update(ele_id), 1000);
  }
};



WebX.Dock = function () {};
WebX.Dock.prototype = {
  init() {
    const wxWrapper = document.getElementById('webxWrapper');
    const dockStructure = [
      { id: 'wxDock', parent: wxWrapper },
      { id: 'wxDock_wrapper', parent: 'wxDock' },
      { id: 'wxDock_left', parent: 'wxDock_wrapper' },
      { id: 'wxDock_ul', parent: 'wxDock_wrapper', tag: 'ul' },
      { id: 'wxDock_right', parent: 'wxDock_wrapper' }
    ];
    
    // Create dock structure
    dockStructure.forEach(({ id, parent, tag = 'div' }) => {
      const element = createEl(tag, { id });
      const parentEl = typeof parent === 'string' ? document.getElementById(parent) : parent;
      parentEl.appendChild(element);
    });

    // Create dock items
    Object.entries(webx_data.dock).forEach(([key, item]) => {
      if (key !== 'separator') {
        this.create_icon(item);
      } else {
        this.create_separator();
      }
    });
  },

  create_icon(item, insert, type = null, cb = null) {
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

    if (cb) cb();
    this.center();
  },

  create_icon_tip(icon, text) {
    const tip_id = `wxDock_tip_${text.replace(/[ '\u2019\-,.]/g, '_')}`;
    const theTip = createEl('div', { className: 'wxTip', id: tip_id });
    const tipText = createEl('div', { 
      className: 'wxTipText', 
      html: text.replace(/ /g, '&nbsp;') 
    });
    theTip.appendChild(tipText);
    icon.appendChild(theTip);
    
    const tipPos = document.getElementById(tip_id);
    
    // Get accurate measurements for centering
    const originalStyles = ['visibility', 'display', 'position'].map(prop => 
      [prop, tipPos.style[prop]]
    );
    
    Object.assign(tipPos.style, {
      visibility: 'hidden',
      display: 'block',
      position: 'absolute'
    });
    
    const tipOff = tipPos.offsetWidth / 2;
    
    // Restore original styles
    originalStyles.forEach(([prop, value]) => {
      tipPos.style[prop] = value;
    });
    
    tipPos.style.marginLeft = `-${tipOff}px`;
  },

  create_minimized_icon(name, item, type, cb = null) {
    const item_name = String(name);
    const item_id = `wxDock_item_${String(item)}`;
    const openAction = `Utils.$$('#${item}').style.display = 'block'; Utils.$$('#${item_id}').remove(); WebX.Dock.center();`;
    
    const minimized_data = {
      name: item_name,
      id: item_id,
      click: `function(){ ${openAction} }`,
      right_click: `function(){ }`,
      right_click_menu: [{
        item: `Open ${item_name}`,
        click: `function(){ ${openAction} }`
      }]
    };
    
    this.create_icon(minimized_data, true, type, cb);
  },

  create_separator() {
    const dock_item = createEl('li', { className: 'wxDock_separator wxDock_no_sort' });
    const separator_div = createEl('div', { className: 'dock_separator' });
    dock_item.appendChild(separator_div);
    Utils.$$('#wxDock_ul').appendChild(dock_item);
    this.center();
  },

  create_icon_context_menu(icon, items) {
    const context_menu = createEl('div', { className: 'dock_context' });
    const context_menu_ul = createEl('ul');
    context_menu.appendChild(context_menu_ul);
    
    items.forEach(item => {
      context_menu_ul.appendChild(this.create_icon_context_item(item));
    });
    
    icon.appendChild(context_menu);
    context_menu.style.top = `${-(context_menu.offsetHeight + 22)}px`;
  },

  create_icon_context_item(item) {
    const func = eval(`(${item.click})`);
    const li = createEl('li', { html: item.item.replace(/ /g, '&nbsp;') });
    li.addEventListener('click', (e) => {
      func();
      e.preventDefault();
      return false;
    });
    return li;
  },

  center() {
    const wxDock = Utils.$$('#wxDock');
    if (wxDock) {
      const dockWidth = Utils.getDimensions(wxDock).width;
      wxDock.style.marginLeft = `${-(dockWidth / 2)}px`;
    }
  },

  hide() {
    const wxDock = Utils.$$('#wxDock');
    if (wxDock) {
      wxDock.style.marginBottom = '-58px';
      wxDock.dataset.state = 'closed';
    }
  },

  show() {
    const wxDock = Utils.$$('#wxDock');
    if (wxDock) {
      wxDock.style.marginBottom = '0px';
      wxDock.dataset.state = 'open';
    }
  },

  toggle() {
    const wxDock = Utils.$$('#wxDock');
    if (wxDock) {
      if (wxDock.style.marginBottom === '0px') {
        this.hide();
      } else {
        this.show();
      }
    }
  }
};

WebX.Browser = function () {};
WebX.Browser.prototype = {
  create(site_url) {
    WebX.Menubar.switch_to('browser');
    const this_id = WebX.Data.windows.browser.length;
    const browser = createEl('div', {
      className: 'wx_window wxBrowser',
      id: `wxBrowser_${this_id}`
    });
    Utils.$$('#webxWrapper').appendChild(browser);
    
    WebX.Data.windows.browser.push(`wxBrowser_${this_id}`);
    
    // Create browser structure inline
    const defaultUrl = site_url || "http://google.com";
    const browser_top = createEl('div', { className: "wxBrowser_top" });
    const browser_top_perms = createEl('div', { className: "wxBrowser_top_permanents" });
    const browser_title = createEl('div', { className: "wxBrowser_title", text: "Browse" });
    const browser_top_button_box = createEl('div', { className: "wxBrowser_buttons" });
    
    // Build structure first
    browser.appendChild(browser_top);
    browser_top.appendChild(browser_top_perms);
    browser_top_perms.appendChild(browser_title);
    browser_top_perms.appendChild(browser_top_button_box);
    
    // Create buttons with handlers AFTER browser is defined
    const browserInstance = this; // preserve Browser instance context
    
    // Create close button
    const closeBtn = createEl('div', { className: 'button close' });
    closeBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      window.WebX.Browser.close(browser); 
      return false; 
    });
    browser_top_button_box.appendChild(closeBtn);
    
    // Create minimize button
    const minimizeBtn = createEl('div', { className: 'button minimize' });
    minimizeBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      window.WebX.Browser.minimize(browser); 
      return false; 
    });
    browser_top_button_box.appendChild(minimizeBtn);
    
    // Create maximize button
    const maximizeBtn = createEl('div', { className: 'button maximize' });
    maximizeBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      window.WebX.Browser.maximize(browser); 
      return false; 
    });
    browser_top_button_box.appendChild(maximizeBtn);
    
    // Create navigation
    const browser_nav = createEl('div', { className: "wxBrowser_nav" });
    const navButtons = ['forward', 'back', 'home', 'refresh', 'stop'];
    navButtons.forEach(type => {
      const button = createEl('div', { className: `wxBrowser_button_${type}` });
      button.addEventListener('click', () => {
        // console.log(`${type} button clicked`);
        return false;
      });
      browser_nav.appendChild(button);
    });
    
    // Create form and input
    const browser_form = createEl('form', { 
      className: "wxBrowser_url_field browser_resize",
      id: `wxBrowser_form_${this_id}`
    });
    
    const loader_div = createEl('div', { className: "wxBrowser_loader" });
    loader_div.style.display = 'none';
    loader_div.appendChild(createEl('img', { src: "assets/imgs/loaders/browser_loader.gif" }));
    
    const browser_input = createEl('input', { 
      type: "text",
      value: defaultUrl,
      className: "browser_resize"
    });
    
    browser_form.appendChild(loader_div);
    browser_form.appendChild(browser_input);
    
    // Create iframe
    const browser_iframe = createEl('iframe', {
      className: "wxBrowser_iframe browser_resize",
      id: `wxBrowser_iframe_${this_id}`,
      src: defaultUrl
    });
    
    // Set iframe data
    Object.assign(browser_iframe.dataset, {
      history: JSON.stringify([defaultUrl]),
      home: "http://webx.ipwn.me"
    });
    
    // Add form submit handler
    browser_form.addEventListener('submit', (e) => {
      this.handleFormSubmit(e, browser_input, browser_iframe, loader_div, browser_title);
    });
    
    // Complete structure building
    browser_top.appendChild(browser_nav);
    browser_nav.appendChild(browser_form);
    browser_top.appendChild(createEl('div', { className: "wxBrowser_tabs_wrapper" }));
    browser.appendChild(browser_iframe);
    
    // Initialize drag and resize
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
  },

  handleFormSubmit(e, input, iframe, loader, title) {
    e.preventDefault();
    e.stopPropagation();
    
    const url = input.value;
    const showLoader = () => loader.style.display = 'block';
    const hideLoader = () => loader.style.display = 'none';
    
    const loadHandler = () => {
      hideLoader();
      iframe.removeEventListener('load', loadHandler);
    };
    
    // Check if isUrl function exists, otherwise use simple validation
    const isValidUrl = (str) => {
      if (typeof isUrl === 'function') return isUrl(str);
      try {
        new URL(str);
        return true;
      } catch {
        return str.includes('http://') || str.includes('https://') || str.includes('.');
      }
    };
    
    if (isValidUrl(url)) {
      const history = JSON.parse(iframe.dataset.history || '[]');
      history.push(url);
      
      showLoader();
      iframe.src = url;
      iframe.dataset.history = JSON.stringify(history);
      iframe.addEventListener('load', loadHandler);
      
      // Try to fetch page title if endpoint exists
      if (typeof fetch === 'function') {
        fetch("browser/get_page_title", {
          method: "POST",
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `url=${encodeURIComponent(url)}`
        })
        .then(response => response.text())
        .then(data => title.innerHTML = data)
        .catch(error => {
          // console.log('Could not fetch page title:', error);
          title.innerHTML = 'Browse';
        });
      }
    } else if (url.includes(' ')) {
      showLoader();
      const searchUrl = `https://www.google.com/search?hl=en&q=${encodeURIComponent(url)}&btnI=I%27m+Feeling+Lucky`;
      iframe.src = searchUrl;
      input.value = searchUrl;
      iframe.addEventListener('load', loadHandler);
    } else {
      const history = JSON.parse(iframe.dataset.history || '[]');
      const homeUrl = iframe.dataset.home || 'http://google.com';
      history.push(homeUrl);
      
      showLoader();
      iframe.src = homeUrl;
      iframe.dataset.history = JSON.stringify(history);
      input.value = homeUrl;
      iframe.addEventListener('load', loadHandler);
    }
  },

  minimize(browser) {
    WebX.Dock.create_minimized_icon(browser.id, browser.id, 'Browser', () => {
      const dockIcon = Utils.$$(`#dock_${browser.id}`);
      if (!dockIcon) return;
      
      const dockRect = dockIcon.getBoundingClientRect();
      const targetPoint = {
        x: dockRect.left + (dockRect.width / 2),
        y: dockRect.top + (dockRect.height / 2)
      };
      
      setTimeout(() => {
        if (typeof Animation !== 'undefined' && Animation.genie) {
          Animation.genie(browser, {
            duration: 700,
            target: targetPoint,
            onComplete: () => browser.style.display = 'none'
          });
        } else {
          browser.style.display = 'none';
        }
      }, 100);
    });
  },

  maximize(ele) {
    return this.fallbackWindow('maximize', ele);
  },

  close(ele) {
    return this.fallbackWindow('close', ele);
  },

  open(ele, opt) {
    return this.useWindow('open', ele, opt);
  },

  toggle(ele) {
    return this.useWindow('toggle', ele);
  },

  useWindow(method, ele, opt) {
    if (typeof WebX.Window === 'function') {
      const windowInstance = new WebX.Window();
      return windowInstance[method](ele, opt);
    } else {
      console.warn(`WebX.Window not available, using fallback ${method}`);
      return this.fallbackWindow(method, ele, opt);
    }
  },

  fallbackWindow(method, ele, opt) {
    if (!ele || !ele.style) return;
    
    const actions = {
      close: () => {
        // Animate fade out before hiding
        ele.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' })
          .addEventListener('finish', () => {
            ele.style.display = 'none';
            ele.style.opacity = '1'; // Reset for next show
          });
      },
      open: () => {
        ele.style.display = 'block';
        if (opt?.position) {
          if (opt.position.top) ele.style.top = `${opt.position.top}px`;
          if (opt.position.left) ele.style.left = `${opt.position.left}px`;
        }
        // Animate fade in
        ele.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-in' });
      },
      toggle: () => {
        if (ele.style.display === 'none') {
          this.fallbackWindow('open', ele);
        } else {
          this.fallbackWindow('close', ele);
        }
      },
      maximize: () => {
        const isMaximized = ele.dataset.isMaximized === 'true';
        if (!isMaximized) {
          // Store original dimensions
          Object.assign(ele.dataset, { 
            isMaximized: 'true',
            originalWidth: ele.style.width,
            originalHeight: ele.style.height,
            originalTop: ele.style.top,
            originalLeft: ele.style.left
          });
          
          // Animate to maximized state
          ele.animate([
            { 
              width: ele.style.width || '800px',
              height: ele.style.height || '600px',
              top: ele.style.top || '100px',
              left: ele.style.left || '100px'
            },
            { 
              width: '100%',
              height: 'calc(100% - 50px)',
              top: '50px',
              left: '0'
            }
          ], { duration: 420, easing: 'ease-out' })
            .addEventListener('finish', () => {
              Object.assign(ele.style, {
                width: '100%',
                height: 'calc(100% - 50px)',
                top: '50px',
                left: '0'
              });
            });
        } else {
          Object.assign(ele.dataset, { isMaximized: 'false' });
          
          // Animate back to original size
          const originalWidth = ele.dataset.originalWidth || '800px';
          const originalHeight = ele.dataset.originalHeight || '600px';
          const originalTop = ele.dataset.originalTop || '100px';
          const originalLeft = ele.dataset.originalLeft || '100px';
          
          ele.animate([
            { 
              width: '100%',
              height: 'calc(100% - 50px)',
              top: '50px',
              left: '0'
            },
            { 
              width: originalWidth,
              height: originalHeight,
              top: originalTop,
              left: originalLeft
            }
          ], { duration: 420, easing: 'ease-out' })
            .addEventListener('finish', () => {
              Object.assign(ele.style, {
                width: originalWidth,
                height: originalHeight,
                top: originalTop,
                left: originalLeft
              });
            });
        }
      }
    };
    
    actions[method]?.();
  }
};

// Simplified Finder component (condensed version)
WebX.Finder = function () {};
WebX.Finder.prototype = {
  create() {
    WebX.Menubar.switch_to('finder');
    const this_id = WebX.Data.windows.finder.length;
    const finder = createEl('div', {
      className: "wx_window wxFinder",
      id: `wxFinder_${this_id}`
    });
    Utils.$$('#webxWrapper').appendChild(finder);
    
    WebX.Data.windows.finder.push(`wxFinder_${this_id}`);
    
  // create() method defined above

    // Create basic finder structure step by step
    const finder_top = createEl('div', { className: 'wxFinder_top' });
    finder.appendChild(finder_top);
    
    const finder_top_permanents = createEl('div', { className: 'wxFinder_top_permanents' });
    finder_top.appendChild(finder_top_permanents);
    
    const finder_buttons = createEl('div', { className: 'wxFinder_buttons' });
    finder_top_permanents.appendChild(finder_buttons);
    
    const finder_title = createEl('div', { className: 'wxFinder_title', text: 'Finder' });
    finder_top_permanents.appendChild(finder_title);
    
    const finder_nav = createEl('div', { className: 'wxFinder_nav' });
    finder_top.appendChild(finder_nav);
    
    const finder_content = createEl('div', { className: 'wxFinder_content finder_resize', id: `wxFinder_content_${this_id}` });
    finder.appendChild(finder_content);
    
    const finder_sidebar = createEl('div', { className: 'wxFinder_sidebar finder_resize', id: `wxFinder_sidebar_${this_id}` });
    finder.appendChild(finder_sidebar);
    
    const finder_footer = createEl('div', { className: 'wxFinder_footer' });
    finder.appendChild(finder_footer);

    // Add window control buttons
    const buttonBox = finder.querySelector('.wxFinder_buttons');
    
    // Create close button
    const closeBtn = createEl('div', { className: 'button close' });
    closeBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      window.WebX.Finder.close(finder); 
      return false; 
    });
    buttonBox.appendChild(closeBtn);
    
    // Create minimize button
    const minimizeBtn = createEl('div', { className: 'button minimize' });
    minimizeBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      window.WebX.Finder.minimize(finder); 
      return false; 
    });
    buttonBox.appendChild(minimizeBtn);
    
    // Create maximize button
    const maximizeBtn = createEl('div', { className: 'button maximize' });
    maximizeBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      window.WebX.Finder.maximize(finder); 
      return false; 
    });
    buttonBox.appendChild(maximizeBtn);

    // Add navigation buttons
    const nav = finder.querySelector('.wxFinder_nav');
    ['back','forward','icon_view','list_view','column_view','coverflow_view','quicklook'].forEach(type => {
      const btn = createEl('div', { className: `wxFinder_button_${type}` });
      btn.addEventListener('click', () => { /* console.log(`${type} button clicked`); */ return false; });
      ['mousedown','mouseup'].forEach(event => btn.addEventListener(event, function() { this.classList.toggle('finder_pressed', event === 'mousedown'); }));
      nav.appendChild(btn);
    });

    // Initialize drag and resize
    Utils.DragResize.init(finder, {
      handle: finder.querySelector('.wxFinder_top'),
      containment: Utils.$$('#webxWrapper'),
      minWidth: 500,
      minHeight: 135,
      alsoResize: '.finder_resize',
      contentOffset: 60,
      onDragStart: () => { WebX.Menubar.switch_to('finder'); finder.style.zIndex = Utils.getNextZIndex(); }
    }).bringToFront();
    return finder;
  },

  minimize(finder) {
    WebX.Dock.create_minimized_icon(finder.id, finder.id, 'Finder', () => {
      const dockIcon = Utils.$$(`#dock_${finder.id}`);
      if (!dockIcon) return;
      
      const dockRect = dockIcon.getBoundingClientRect();
      const targetPoint = {
        x: dockRect.left + (dockRect.width / 2),
        y: dockRect.top + (dockRect.height / 2)
      };
      
      setTimeout(() => {
        if (typeof Animation !== 'undefined' && Animation.genie) {
          Animation.genie(finder, {
            duration: 700,
            target: targetPoint,
            onComplete: () => finder.style.display = 'none'
          });
        } else {
          finder.style.display = 'none';
        }
      }, 100);
    });
  },
  
  maximize(ele) { 
    return this.fallbackWindow('maximize', ele); 
  },
  
  minimize(finder) {
    WebX.Dock.create_minimized_icon(finder.id, finder.id, 'Finder', () => {
      const dockIcon = Utils.$$(`#dock_${finder.id}`);
      if (!dockIcon) return;
      
      const dockRect = dockIcon.getBoundingClientRect();
      const targetPoint = {
        x: dockRect.left + (dockRect.width / 2),
        y: dockRect.top + (dockRect.height / 2)
      };
      
      setTimeout(() => {
        if (typeof Animation !== 'undefined' && Animation.genie) {
          Animation.genie(finder, {
            duration: 700,
            target: targetPoint,
            onComplete: () => finder.style.display = 'none'
          });
        } else {
          finder.style.display = 'none';
        }
      }, 100);
    });
  },
  
  close(ele) { 
    return this.fallbackWindow('close', ele); 
  },
  
  open(ele, opt) { 
    return this.useWindow('open', ele, opt); 
  },
  
  toggle(ele) { 
    return this.useWindow('toggle', ele); 
  },
  
  useWindow(method, ele, opt) {
    if (typeof WebX.Window === 'function') {
      const windowInstance = new WebX.Window();
      return windowInstance[method](ele, opt);
    } else {
      console.warn(`WebX.Window not available, using fallback ${method}`);
      return this.fallbackWindow(method, ele, opt);
    }
  },
  
  fallbackWindow(method, ele, opt) {
    if (!ele) return;
    
    const actions = {
      close: () => {
        // Animate fade out before hiding
        ele.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' })
          .addEventListener('finish', () => {
            ele.style.display = 'none';
            ele.style.opacity = '1'; // Reset for next show
          });
      },
      open: () => {
        ele.style.display = 'block';
        ele.style.zIndex = Utils.getNextZIndex();
        if (opt?.position) {
          if (opt.position.top) ele.style.top = `${opt.position.top}px`;
          if (opt.position.left) ele.style.left = `${opt.position.left}px`;
        }
        // Animate fade in
        ele.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-in' });
      },
      toggle: () => {
        if (ele.style.display === 'none') {
          this.fallbackWindow('open', ele);
        } else {
          this.fallbackWindow('close', ele);
        }
      },
      maximize: () => {
        const isMaximized = ele.classList.contains('maximized');
        if (!isMaximized) {
          // Store original dimensions
          Object.assign(ele.dataset, {
            originalWidth: ele.style.width,
            originalHeight: ele.style.height,
            originalTop: ele.style.top,
            originalLeft: ele.style.left
          });
          ele.classList.add('maximized');
          
          // Animate to full screen
          ele.animate([
            { 
              width: ele.style.width || '800px',
              height: ele.style.height || '500px',
              top: ele.style.top || '50px',
              left: ele.style.left || '50px'
            },
            { 
              width: '100%', 
              height: '100%', 
              top: '0', 
              left: '0' 
            }
          ], { duration: 420, easing: 'ease-out' })
            .addEventListener('finish', () => {
              Object.assign(ele.style, {
                width: '100%', height: '100%', top: '0', left: '0'
              });
            });
        } else {
          ele.classList.remove('maximized');
          
          // Animate back to original size
          const originalWidth = ele.dataset.originalWidth || '800px';
          const originalHeight = ele.dataset.originalHeight || '500px';
          const originalTop = ele.dataset.originalTop || '50px';
          const originalLeft = ele.dataset.originalLeft || '50px';
          
          ele.animate([
            { 
              width: '100%', 
              height: '100%', 
              top: '0', 
              left: '0' 
            },
            { 
              width: originalWidth,
              height: originalHeight,
              top: originalTop,
              left: originalLeft
            }
          ], { duration: 420, easing: 'ease-out' })
            .addEventListener('finish', () => {
              Object.assign(ele.style, {
                width: originalWidth,
                height: originalHeight,
                top: originalTop,
                left: originalLeft
              });
            });
        }
      }
    };
    
    actions[method]?.();
  }
};

// Simplified Window component and utility functions
WebX.window = {
  close: (ele) => WebX.Window?.prototype.close.call({}, ele) || (ele?.style && (ele.style.display = 'none')),
  open: (ele, opt) => WebX.Window?.prototype.open.call({}, ele, opt) || (ele?.style && (ele.style.display = 'block')),
  toggle: (ele) => ele?.style && (ele.style.display === 'none' ? WebX.window.open(ele) : WebX.window.close(ele)),
  maximize: (ele) => WebX.Window?.prototype.maximize.call({}, ele) || WebX.window.fallbackMaximize(ele),
  
  fallbackMaximize(ele) {
    if (!ele) return;
    const isMaximized = ele.classList.contains('maximized');
    if (!isMaximized) {
      Object.assign(ele.dataset, {
        originalWidth: ele.style.width, originalHeight: ele.style.height,
        originalTop: ele.style.top, originalLeft: ele.style.left
      });
      ele.classList.add('maximized');
      Object.assign(ele.style, { width: '100%', height: '100%', top: '0', left: '0' });
    } else {
      ele.classList.remove('maximized');
      Object.assign(ele.style, {
        width: ele.dataset.originalWidth || '800px',
        height: ele.dataset.originalHeight || '500px',
        top: ele.dataset.originalTop || '50px',
        left: ele.dataset.originalLeft || '50px'
      });
    }
  }
};

WebX.create = {
  window(type, width, height, id, title, content) {
    return WebX.Window.create?.({
      type: type || 'browser',
      width: width || 500,
      height: height || 350,
      id: id || `wx_window_${Math.floor(Math.random() * 10000)}`,
      title: title || 'Window',
      content: content || ''
    }) || null;
  }
};

// Simplified Window component
WebX.Window = function() {};
WebX.Window.prototype = {
  maximize(ele) {
    ele = ele || this.element;
    if (!ele) return this;
    
    const modifiers = ele.dataset.windowType === 'finder' ? { width: 136, height: 27 } : { width: 0, height: 0 };
    const wrapper = Utils.$$('#webxWrapper');
    const wrapperRect = wrapper ? Utils.getDimensions(wrapper) : { width: window.innerWidth, height: window.innerHeight };
    const menubarHeight = Utils.$$('#wxMenubar')?.getBoundingClientRect().height || 0;
    
    if (ele.dataset.sizeState !== "max") {
      const eleRect = Utils.getDimensions(ele);
      Object.assign(ele.dataset, {
        originalLeft: ele.style.left,
        originalTop: ele.style.top,
        originalHeight: eleRect.height,
        originalWidth: eleRect.width,
        sizeState: "max"
      });
      
      Object.assign(ele.style, {
        width: `${wrapperRect.width}px`,
        height: `${wrapperRect.height - menubarHeight}px`,
        top: `${menubarHeight}px`,
        left: `${modifiers.width}px`
      });
    } else {
      Object.assign(ele.style, {
        width: `${ele.dataset.originalWidth}px`,
        height: `${ele.dataset.originalHeight}px`,
        top: ele.dataset.originalTop,
        left: ele.dataset.originalLeft
      });
      ele.dataset.sizeState = "min";
    }
    
    return this;
  },
  
  close(ele) {
    ele = ele || this.element;
    if (!ele || ele.dataset.viewState === "closed") return this;
    
    ele.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' })
      .onfinish = () => ele.style.display = 'none';
    ele.dataset.viewState = "closed";
    return this;
  },
  
  open(ele, opt) {
    ele = ele || this.element;
    if (!ele || ele.dataset.viewState === "open") return this;
    
    ele.style.display = 'block';
    ele.style.opacity = 0;
    ele.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-in' })
      .onfinish = () => ele.style.opacity = 1;
    ele.dataset.viewState = "open";
    return this;
  },
  
  toggle(ele) {
    if (typeof ele === 'string') {
      const windowEl = document.querySelector(ele);
      if (!windowEl) {
        return WebX.Window.create({
          type: 'finder',
          id: ele.replace('#', ''),
          title: ele.replace('#wxWindow_', ''),
          content: 'Window content goes here.',
          width: 357,
          height: 287
        });
      }
      ele = windowEl;
    }
    
    ele = ele || this.element;
    if (!ele) return this;
    
    return (ele.style.display === 'none' || ele.dataset.viewState === "closed") ? 
      this.open(ele) : this.close(ele);
  }
};

WebX.Window.create = function(options = {}) {
  try {
    if (typeof Utils === 'undefined' || typeof createEl !== 'function') {
      console.error('Utils or createEl not available');
      return null;
    }
    
    const settings = Object.assign({
      type: 'generic',
      width: 500,
      height: 350,
      id: `wxWindow_${Math.floor(Math.random() * 10000)}`,
      title: 'Window',
      content: '',
      position: 'center'
    }, options);
    
    const window = createEl('div', {
      className: `wx_window wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}`,
      id: settings.id
    });
    
    window.dataset.windowType = settings.type;
    Object.assign(window.style, {
      width: `${settings.width}px`,
      height: `${settings.height}px`
    });
    
    const wrapper = Utils.$$('#webxWrapper');
    (wrapper || document.body).appendChild(window);
    
    // Create window structure
    const windowTop = createEl('div', { 
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_top` 
    });
    const topPerms = createEl('div', { 
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_top_permanents` 
    });
    const windowTitle = createEl('div', { 
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_title`,
      text: settings.title 
    });
    const buttonBox = createEl('div', { 
      className: `wx${settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}_buttons` 
    });
    
    // Add buttons
    const buttons = [
      { className: "button close", handler: () => new WebX.Window().close(window) },
      { className: "button minimize", handler: () => WebX.Window.minimize(window, settings.type) },
      { className: "button maximize", handler: () => new WebX.Window().maximize(window) }
    ];
    
    buttons.forEach(({ className, handler }) => {
      const button = createEl('div', { className });
      button.addEventListener('click', handler);
      buttonBox.appendChild(button);
    });
    
    // Build structure
    window.appendChild(windowTop);
    windowTop.appendChild(topPerms);
    topPerms.appendChild(windowTitle);
    topPerms.appendChild(buttonBox);
    
    // Add content
    window.appendChild(createEl('div', { 
      className: "wxWindow_body",
      html: settings.content 
    }));
    
    // Position window
    WebX.Window.positionWindow(window, settings, wrapper);
    
    // Track window
    if (WebX.Data?.windows) {
      WebX.Data.windows[settings.type] = WebX.Data.windows[settings.type] || [];
      WebX.Data.windows[settings.type].push(window.id);
    }
    
    return window;
  } catch (error) {
    console.error('Error creating window:', error);
    return null;
  }
};

WebX.Window.minimize = function(window, type) {
  WebX.Dock.create_minimized_icon(window.id, window.id, type, () => {
    setTimeout(() => {
      if (typeof Animation?.genie === 'function') {
        const dockIcon = Utils.$$(`#dock_${window.id}`);
        const dockRect = dockIcon?.getBoundingClientRect();
        if (dockRect) {
          Animation.genie(window, {
            duration: 700,
            target: { x: dockRect.left + dockRect.width/2, y: dockRect.top + dockRect.height/2 },
            onComplete: () => window.style.display = 'none'
          });
        } else {
          window.style.display = 'none';
        }
      } else {
        window.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.1)', opacity: 0 }], 
          { duration: 700, easing: 'ease-in' }).onfinish = () => window.style.display = 'none';
      }
    }, 100);
  });
};

WebX.Window.positionWindow = function(window, settings, wrapper) {
  if (!settings.position) return;
  
  const wrapperRect = wrapper?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
  const menubarHeight = Utils.$$('#wxMenubar')?.getBoundingClientRect().height || 0;
  const windowWidth = parseInt(window.style.width);
  const windowHeight = parseInt(window.style.height);
  
  const positions = {
    center: {
      left: Math.max(0, (wrapperRect.width - windowWidth) / 2),
      top: Math.max(menubarHeight, (wrapperRect.height - windowHeight) / 2)
    },
    random: {
      left: Math.floor(Math.random() * Math.max(0, wrapperRect.width - windowWidth)),
      top: Math.floor(Math.random() * Math.max(0, wrapperRect.height - windowHeight - menubarHeight)) + menubarHeight
    }
  };
  
  let position = positions[settings.position];
  if (Array.isArray(settings.position)) {
    position = { left: settings.position[0], top: settings.position[1] };
  } else if (typeof settings.position === 'object') {
    position = settings.position;
  }
  
  if (position) {
    if (position.left !== undefined) window.style.left = `${position.left}px`;
    if (position.top !== undefined) window.style.top = `${position.top}px`;
  }
};
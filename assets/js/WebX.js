var WebX = {
  init: function () {
    //this.window = new WebX.Window();
    this.Browser = new WebX.Browser();
    this.Finder = new WebX.Finder();
    this.Dock = new WebX.Dock();
    
    var webx_wrapper = document.createElement('div');
    webx_wrapper.id = 'webxWrapper';
    document.body.appendChild(webx_wrapper);

    var wallpaperDiv = document.createElement('div');
    wallpaperDiv.innerHTML = '<img id="wallpaper" src="https://unsplash.it/1280/720/?random" alt="" title="" />';
    webx_wrapper.appendChild(wallpaperDiv);

    var starter = document.getElementById('starter');
    if (starter) starter.style.display = 'none';

    WebX.Menubar.init();
    WebX.Dock.init();
    WebX.Dashboard.init();
    
    //windowResize();
  },
  Menubar: {
    init: function () {
      var webx_wrapper = document.getElementById('webxWrapper'),
      menubar = document.createElement('div'),
      user_area = document.createElement('div'),
      userNameDiv = document.createElement('div'),
      userPicDiv = document.createElement('div');

      menubar.id = "wxMenubar";
      user_area.id = 'mb_user_area';
      userNameDiv.id = 'wx_mb_user_name';
      userPicDiv.id = 'wx_mb_user_pic';

      webx_wrapper.appendChild(menubar);
      menubar.appendChild(user_area);

      WebX.Clock.create('wx_mb_clock', user_area);

      userNameDiv.textContent = 'Default User';
      user_area.insertBefore(userNameDiv, user_area.firstChild);
      
      user_area.insertBefore(userPicDiv, user_area.firstChild);

      // for (var item in webx_data.menubar) {
      //   WebX.menubar.create_link(webx_data.menubar.items[this_item], menubar_ul);
      // }

      for (var item in webx_data.menubar) {
        var menubar_ul = document.createElement('ul');
        menubar_ul.className = "menubar_ul";
        menubar_ul.id = "menubar_ul_" + item;
        menubar.appendChild(menubar_ul);
        for (var link in webx_data.menubar[item]) {
          WebX.Menubar.create_link(item+"_"+link, menubar_ul);
        }
        // 
      }
      // make finder menubar show
      var menubarUls = menubar.querySelectorAll('ul.menubar_ul');
      menubarUls.forEach(function(ul) {
        if (ul.id !== 'menubar_ul_finder') {
          ul.style.display = 'none';
        }
      });
    },
    create_link: function (obj, target) {
      var names = obj.split("_");
      var menubar_li = document.createElement('li');
      menubar_li.className = "mb_item disabled";
      menubar_li.id = 'mb_' + obj;
      menubar_li.textContent = names[1];
      menubar_li.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.toggle('disabled');
        this.classList.toggle('enabled');
        var enabledItems = target.querySelectorAll('li.enabled');
        enabledItems.forEach(function(item) {
          if (item !== menubar_li) {
            item.classList.toggle('enabled');
            item.classList.toggle('disabled');
          }
        });
        return false;
      });
      menubar_li.addEventListener('mouseover', function(e) {
        var enabledItems = target.querySelectorAll('li.enabled');
        if (enabledItems.length === 1 && !this.classList.contains('enabled')) {
          enabledItems.forEach(function(item) {
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
    create_panel: function (panel, contents, target) {
      // debug.log(panel+" panel: "+webx_data.menubar.panels[panel]+" - left: "+webx_data.menubar.panels[panel].styles.left);
      var panel_name = panel + '_panel';
      var mb_panel = document.createElement('div');
      mb_panel.id = panel_name;
      mb_panel.className = "mbWindow";
      target.appendChild(mb_panel); 

      var mb_link_ul = document.createElement('ul');
      mb_panel.appendChild(mb_link_ul);

      for (var panel_link in contents) {
        WebX.Menubar.create_panel_link(panel_link, contents[panel_link], mb_link_ul);
      }
    },
    create_sub_panel: function (panel, contents, target) {
      // debug.log(panel+" panel: "+webx_data.menubar.panels[panel]+" - left: "+webx_data.menubar.panels[panel].styles.left);
      var panel_name = panel + '_sub_panel';
      var mb_panel = document.createElement('div');
      mb_panel.id = panel_name;
      mb_panel.className = "mbSubWindow";
      target.appendChild(mb_panel); 
      // Create the sub-panel links
      var mb_link_ul = document.createElement('ul');
      mb_panel.appendChild(mb_link_ul);

      for (var panel_link in contents) {
        WebX.Menubar.create_panel_link(panel_link, contents[panel_link], mb_link_ul);
      }
    },
    create_panel_link: function (link_name, link_funcs, target) {
      var mb_link_li = document.createElement('li');
      mb_link_li.textContent = link_name;
      target.appendChild(mb_link_li); 

      if(link_funcs.click !== 'false') {
        //console.log("Creating link: " + link_name + " with click function: " + link_funcs.click);
        //var func = eval( "(" + link_funcs.click + ")" );
        var func = new Function('return ' + link_funcs.click)();
        mb_link_li.addEventListener('click', function(e) {
          e.preventDefault();
          func();
          return false;
        });
      } else {
        mb_link_li.addEventListener('click', function(e) {
          e.preventDefault();
          return false;
        });
      }
      if(link_funcs.list) {
        WebX.Menubar.create_sub_panel(link_name,link_funcs.list,mb_link_li);
      }
    },
    switch_to: function(menubar) {
      $('.menubar_ul').not('#menubar_ul_'+menubar).each(function(){ $(this).hide(); });
      $('#menubar_ul_'+menubar).show();
    }
  },
  Dashboard: {
    init: function () {
      const dashboardPanel = document.createElement('div');
      dashboardPanel.id = 'dashboardPanel';
      dashboardPanel.dataset.dashboardStatus = '0';
      dashboardPanel.dataset.widgetDrawerStatus = '0';
      document.body.appendChild(dashboardPanel);

      const dbOverlay = document.createElement('div');
      dbOverlay.id = 'dbOverlay';
      dbOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        WebX.Dashboard.start();
        return false;
      });
      document.getElementById('webxWrapper').appendChild(dbOverlay);

      const dbDrawerButton = document.createElement('div');
      dbDrawerButton.id = 'dbDrawerButton';
      dbDrawerButton.addEventListener('click', function(e) {
        e.preventDefault();
        WebX.Dashboard.drawer();
        return false;
      });
      dbOverlay.appendChild(dbDrawerButton);

      const dbManageButton = document.createElement('div');
      dbManageButton.id = 'dbManageButton';
      dbOverlay.appendChild(dbManageButton);
    },
    start: function () {
      const dashboardPanel = document.getElementById('dashboardPanel');
      const dbOverlay = document.getElementById('dbOverlay');
      const dbManageButton = document.getElementById('dbManageButton');
      const webxWrapper = document.getElementById('webxWrapper');
      const dbDrawerButton = document.getElementById('dbDrawerButton');

      if (dashboardPanel.dataset.dashboardStatus === '0') {
        dbManageButton.style.display = 'none';
        this.fadeToggle(dbOverlay, 420);
        dashboardPanel.dataset.dashboardStatus = '1';
      } else if (dashboardPanel.dataset.dashboardStatus === '1' && dashboardPanel.dataset.widgetDrawerStatus === '1') {
        this.animate([webxWrapper, dbOverlay], {
          marginTop: '0px'
        }, 420);
        this.rotateElement(dbDrawerButton, 135, 420);
        this.fadeToggle(dbManageButton, 420);
        this.fadeOut(dbOverlay, 420);
        dashboardPanel.dataset.widgetDrawerStatus = '0';
        dashboardPanel.dataset.dashboardStatus = '0';
      } else if (dashboardPanel.dataset.dashboardStatus === '1') {
        this.fadeOut(dbOverlay, 420);
        dashboardPanel.dataset.dashboardStatus = '0';
      }
    },
    drawer: function () {
      const dashboardPanel = document.getElementById('dashboardPanel');
      const dbOverlay = document.getElementById('dbOverlay');
      const dbManageButton = document.getElementById('dbManageButton');
      const webxWrapper = document.getElementById('webxWrapper');
      const dbDrawerButton = document.getElementById('dbDrawerButton');

      if (dashboardPanel.dataset.widgetDrawerStatus === '0') {
        this.animate([webxWrapper, dbOverlay], {
          marginTop: '-118px'
        }, 420);
        this.rotateElement(dbDrawerButton, -135, 420);
        this.fadeToggle(dbManageButton, 420);
        dashboardPanel.dataset.widgetDrawerStatus = '1';
      } else if (dashboardPanel.dataset.widgetDrawerStatus === '1') {
        this.animate([webxWrapper, dbOverlay], {
          marginTop: '0px'
        }, 420);
        this.rotateElement(dbDrawerButton, 135, 420);
        this.fadeToggle(dbManageButton, 420);
        dashboardPanel.dataset.widgetDrawerStatus = '0';
      }
    },
    // Animation helper methods
    animate: function(elements, properties, duration) {
      if (!Array.isArray(elements)) elements = [elements];
      elements.forEach(element => {
        element.style.transition = `all ${duration}ms`;
        Object.keys(properties).forEach(prop => {
          element.style[prop] = properties[prop];
        });
      });
    },
    fadeOut: function(element, duration) {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
      }, duration);
    },
    fadeToggle: function(element, duration) {
      element.style.transition = `opacity ${duration}ms`;
      if (element.style.display === 'none') {
        element.style.display = '';
        element.style.opacity = '1';
      } else {
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.display = 'none';
        }, duration);
      }
    },
    rotateElement: function(element, degrees, duration) {
      element.style.transition = `transform ${duration}ms`;
      const currentRotation = element.style.transform ? 
        parseInt(element.style.transform.match(/-?\d+/) || 0) : 0;
      element.style.transform = `rotate(${currentRotation + degrees}deg)`;
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
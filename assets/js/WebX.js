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
      $('<div>', {
        id: "dashboardPanel"
      }).data({
        "dashboard_status": 0,
        "widget_drawer_status": 0
      }).appendTo(document.getElementsByTagName('body')[0]);

      var dbOverlay = $('<div>', {
        id: "dbOverlay",
        click: function () {
          WebX.Dashboard.start();
          return false;
        }
      }).appendTo('div#webxWrapper');

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
      if ($('#dashboardPanel').data('dashboard_status') === 0) {
        $("div#dbManageButton").hide();
        $('div#dbOverlay').animate({
          opacity: "toggle"
        }, 420);
        $('#dashboardPanel').data('dashboard_status', 1);
      } else if ($('#dashboardPanel').data('dashboard_status') === 1 && $('#dashboardPanel').data('widget_drawer_status') === 1) {
        $('div#webxWrapper, div#dbOverlay').animate({
          marginTop: "0px"
        }, {
          queue: false,
          duration: 420
        });
        $("div#dbDrawerButton").animate({
          rotate: '+=135deg'
        }, {
          queue: false,
          duration: 420
        });
        $("div#dbManageButton").animate({
          opacity: 'toggle'
        }, {
          queue: false,
          duration: 420
        });
        $("div#dbOverlay").fadeOut(420);
        $('#dashboardPanel').data('widget_drawer_status', 0);
        $('#dashboardPanel').data('dashboard_status', 0);
      } else if ($('#dashboardPanel').data('dashboard_status') === 1) {
        $("div#dbOverlay").fadeOut(420);
        $('#dashboardPanel').data('dashboard_status', 0);
      }
    },
    drawer: function () {
      if ($('#dashboardPanel').data('widget_drawer_status') === 0) {
        $('div#webxWrapper, div#dbOverlay').animate({
          marginTop: "-118px"
        }, {
          duration: 420
        }, "linear");
        $("div#dbDrawerButton").animate({
          rotate: '-=135deg'
        }, {
          queue: false,
          duration: 420
        });
        $("div#dbManageButton").animate({
          opacity: 'toggle'
        }, {
          queue: false,
          duration: 420
        });
        $('#dashboardPanel').data('widget_drawer_status', 1);
      } else if ($('#dashboardPanel').data('widget_drawer_status') === 1) {
        $('div#webxWrapper, div#dbOverlay').animate({
          marginTop: "0px"
        }, {
          duration: 420
        }, "linear");
        $("div#dbDrawerButton").animate({
          rotate: '+=135deg'
        }, {
          queue: false,
          duration: 420
        });
        $("div#dbManageButton").animate({
          opacity: 'toggle'
        }, {
          queue: false,
          duration: 420
        });
        $('#dashboardPanel').data('widget_drawer_status', 0);
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
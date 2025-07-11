WebX.Dock = function () {};
WebX.Dock.prototype.init = function () {
  var wxWrapper = document.getElementById('webxWrapper');
  var theDock = document.createElement('div');
  var theDock_wrapper = document.createElement('div');
  theDock.id = "wxDock";
  theDock_wrapper.id = "wxDock_wrapper";
  wxWrapper.appendChild(theDock);
  theDock.appendChild(theDock_wrapper);

  var dock_left = document.createElement('div');
  dock_left.id = "wxDock_left";
  theDock_wrapper.appendChild(dock_left);
  
  var dock_content = document.createElement('ul');
  dock_content.id = "wxDock_ul";
  theDock_wrapper.appendChild(dock_content);
  
  var dock_right = document.createElement('div');
  dock_right.id = "wxDock_right";
  theDock_wrapper.appendChild(dock_right);
  
  for (var item in webx_data.dock) {
    if(item !== "separator") {
      WebX.Dock.create_icon(webx_data.dock[item]);
    } else {
      WebX.Dock.create_separator();
    }
  }

  // make sortable
  $(dock_content).sortable({
    opacity: 0.80,
    helper: 'clone',
    revert: true,
    tolerance: 'pointer',
    cancel: '.wxDock_no_sort',
    start: function (event, ui) {
      $(ui.helper[0]).find('.wxTip').hide();
    }
  }).disableSelection();
};

WebX.Dock.prototype.create_icon = function (item,insert, type = null) {
    var dock_item = $('<li>', {
      className: 'wxDock_item',
      id: 'wxDock_item_' + item.name.replace(' ', '_')
    });
    
    if(item.name === "Trash") {
      dock_item.addClass('wxDock_no_sort');
      dock_item.droppable({
        accept: ".wx_window",
        drop: function( event, ui ) {
          $('#dock_Trash').addClass('full');
        }
      });
    }
    var icon_div = document.createElement('div');
    if (type !== null) {
      icon_div.className = 'iIcon dockIcon dock_' + type;
    } else {
      icon_div.className = 'iIcon dockIcon';
    }

    icon_div.id = 'dock_' + item.name;
    dock_item.append(icon_div); 

    
    if(insert) {
      dock_item.id = item.id;
      var div_id = "dock_" + item.name.replace(/[ '\u2019\-,.]/g, "_");
      icon_div.id = div_id;
      var trashItem = document.getElementById('wxDock_item_Trash');
      if (trashItem && trashItem.parentNode) {
        trashItem.parentNode.insertBefore(dock_item[0] || dock_item, trashItem);
      }
    } else {
      var dock_ul = document.getElementById('wxDock_ul');
      dock_ul.appendChild(dock_item[0] || dock_item);
      //dock_item.appendTo('#wxDock_ul');
    }

    var icon_gloss = document.createElement('div');
    icon_gloss.className = "iGloss";
    icon_div.appendChild(icon_gloss);

    WebX.Dock.create_icon_tip(dock_item, item.name);
    WebX.Dock.create_icon_context_menu(dock_item, item.right_click_menu);
    
    if(item.click !== 'false') {
      // console.log('click function: ' + item.click);
      // console.log('click function: ' + item.right_click);
      var func = eval( "(" + item.click + ")" );
      var right_func = eval( "(" + item.right_click + ")" );
      //var func = new Function(item.click);
      //var right_func = new Function(item.right_click);
      icon_div.addEventListener('click', function(e){
        if(dock_item.hasClass('right_clicked')) {
          dock_item.removeClass('right_clicked');
          document.querySelectorAll('li.wxDock_item').forEach(function(el) {
            el.classList.remove('no_hover');
          });
        } else {
          func();
        }
        return false;
      });

      $(dock_item).rightClick(function(e){
        if(dock_item.hasClass('right_clicked')) {
          dock_item.removeClass('right_clicked');
          document.querySelectorAll('li.wxDock_item').forEach(function(el) {
            el.classList.remove('no_hover');
          });
        } else {
          right_func();
          dock_item.addClass('right_clicked');
          $('li.wxDock_item').not(dock_item).addClass('no_hover');
        }
        return false;
      });
    } else {
      var right_func = eval( "(" + item.right_click + ")" );
      icon_div.addEventListener('click', function(e){
        if(dock_item.hasClass('right_clicked')) {
          dock_item.removeClass('right_clicked');
          document.querySelectorAll('li.wxDock_item').forEach(function(el) {
            el.classList.remove('no_hover');
          });
        }
        return false;
      });
      $(dock_item).rightClick(function(e){
        if(dock_item.hasClass('right_clicked')) {
          dock_item.removeClass('right_clicked');
          document.querySelectorAll('li.wxDock_item').forEach(function(el) {
            el.classList.remove('no_hover');
          });
        } else {
          right_func();
          dock_item.addClass('right_clicked');
          $('li.wxDock_item').not(dock_item).addClass('no_hover');
        }
        return false;
      });
    }

    WebX.Dock.center();
  };

  WebX.Dock.prototype.create_icon_tip = function (icon, text) {
    var tip_id = 'wxDock_tip_' + text.replace(/ /g,"_").replace(/'/g,"").replace(/’/g,"").replace(/-/g,"").replace(/\,/g,"").replace(/\./g,"");
    var theTip = document.createElement('div');
    theTip.className = "wxTip";
    theTip.id = tip_id;

    var tipText = document.createElement('div');
    tipText.className = "wxTipText";
    tipText.innerHTML = text.replace(/ /g,"&nbsp;");
    theTip.appendChild(tipText);

    $(icon).append(theTip);

    var tipPos = document.getElementById(tip_id);
    var tipOff = getDimensions(tipPos).width / 2;
    //console.log('tipOff: ' + tipPos);
    tipPos.style.marginLeft = '-' + tipOff + "px";

  };
  
  WebX.Dock.prototype.create_minimized_icon = function (name, item, type) {
    // debug.log('creating minimized icon');
    // debug.log('name : ' + name);
    // debug.log('item : ' + item);
    var item_name = String(name);
    var item_id = 'wxDock_item_' + String(item);
    var minimized_data = {
      "name": item_name,
      "id": item_id,
      "click": "function(){ $('#"+item+"').show('puff', {percent: 100}, 840); $('#"+item_id+"').remove(); WebX.Dock.center(); }",
      "right_click": "function(){ debug.log(\"Minimized item right click\");}",
      "right_click_menu": [{
          "item": "Open " + item_name,
          "click": "function(){ $('#"+item+"').show('puff', {percent: 100}, 840); $('#"+item_id+"').remove(); WebX.Dock.center(); }"
        }
      ]
    }
    WebX.Dock.create_icon(minimized_data, true, type);
  };

  WebX.Dock.prototype.create_separator = function () {
    var dock_item = $('<li>', {
      className: 'wxDock_separator wxDock_no_sort'
    }).appendTo('#wxDock_ul');

    var separator_div = $('<div/>', {
      className: 'dock_separator'
    }).appendTo(dock_item);

    WebX.Dock.center();
  };

  WebX.Dock.prototype.create_icon_context_menu = function (icon, items) {
    var context_menu = $('<div/>', {
      className: "dock_context"
    });
    
    var context_menu_ul = $('<ul/>',{
      
    }).appendTo(context_menu);
    
    for (item in items) {
      var context_menu_item = WebX.Dock.create_icon_context_item(items[item]);
      context_menu_ul.append(context_menu_item);
    }
    $(icon).append(context_menu);
    context_menu.css({
      "top": "-"+(context_menu.height() + 22)+"px"
    });
  };

  WebX.Dock.prototype.create_icon_context_item = function (item) {
    var func = eval( "(" + item.click + ")" );
    return $('<li/>', {
      innerHTML: item.item.replace(/ /g,"&nbsp;")
    }).bind('click', function () {
      func();
      return false;
    });
  };

  WebX.Dock.prototype.center = function () {
    var wxDock = document.getElementById('wxDock'),
    dockWidth = getDimensions(wxDock).width;
    if (wxDock) {
      wxDock.style.marginLeft = (-(dockWidth / 2)) + "px";
    }
  };

  WebX.Dock.prototype.hide = function () {
    $('#wxDock').animate({
      'margin-bottom': '-58px'
    }, 420, 'easeOutExpo', function () {
      var wxDock = document.getElementById('wxDock');
      if (wxDock) wxDock.dataset.state = 'closed';
    });
  };

  WebX.Dock.prototype.show = function () {
    $('#wxDock').animate({
      'margin-bottom': '0px'
    }, 420, 'easeOutExpo', function () {
      var wxDock = document.getElementById('wxDock');
      if (wxDock) wxDock.dataset.state = 'open';
    });
  };

  WebX.Dock.prototype.toggle = function () {
    if ($('#wxDock').css('margin-bottom') === '0px') {
      WebX.Dock.hide();
    } else {
      WebX.Dock.show();
    }
  };

/*
WebX.Dock.prototype.create = function () {
  var theDock = $('<div/>', {
    id: "wxDock"
  }).appendTo('#webxWrapper');
  var theDock_wrapper = $('<div/>', {
    id: "wxDock_wrapper"
  }).appendTo(theDock);

  $('<div/>', {
    id: "wxDock_left"
  }).appendTo(theDock_wrapper);
  var dock_content = $('<ul/>', {
    id: "wxDock_ul"
  }).appendTo(theDock_wrapper);
  $('<div/>', {
    id: "wxDock_right"
  }).appendTo(theDock_wrapper);

  for (var item in webx_data.dock) {
    WebX.dock.create_icon(webx_data.dock[item]);
  }

  // make sortable
  $(dock_content).sortable({
    opacity: 0.80,
    helper: 'clone',
    revert: true,
    tolerance: 'pointer',
    start: function (event, ui) {
      $(ui.helper[0]).find('.wxTip').hide();
    },
    stop: function (event, ui) {
      // $("#" + ui.item[0].id).find('.wxTip').removeClass('moving');
    }
  }).disableSelection();
};

WebX.Dock.prototype.create_icon = function (item) {
  var dock_item = $('<li>', {
    className: 'wxDock_item',
    id: 'wxDock_item_' + item.name.replace(' ', '_')
  }).appendTo('#wxDock_ul');

  var icon_div = $('<div/>', {
    className: 'iIcon dockIcon',
    id: 'dock_' + item.name
  }).appendTo(dock_item);

  $('<div/>', {
    className: "iGloss"
  }).appendTo(icon_div);

  WebX.dock.create_icon_tip(dock_item, item.name);

  if(item.click !== 'false') {
    var func = eval( "(" + item.click + ")" );
    icon_div.bind('click', function(){
      func();
      return false;
    });
  } else {
    icon_div.bind('click', function(){
      return false;
    });
  }
  
  // if (item === "dashboard") {
  //   icon_div.bind('click', function () {
  //     wxDashInit();
  //     return false;
  //   });
  // } else if (item === "settings") {
  //   icon_div.bind('click', function () {
  //     WebX.window.toggle('#wxWindow_Settings');
  //     return false;
  //   });
  // } else if (item === "browser") {
  //   icon_div.bind('click', function () {
  //     WebX.browser.create();
  //     WebX.menubar.switch_to('browser');
  //     return false;
  //   });
  // }
  WebX.dock.center_dock();
};

WebX.Dock.prototype.create_icon_tip = function (icon, text) {
  var tip_id = 'wxDock_tip_' + text;
  var theTip = $('<div/>', {
    className: "wxTip",
    id: tip_id
  });
  $('<div/>', {
    className: "wxTipText",
    text: text
  }).appendTo(theTip);

  $(icon).append(theTip);

  var tipPos = $("div#" + tip_id).width() / 2;

  $("div#" + tip_id).css({
    "margin-left": '-' + tipPos + "px"
  });
};

WebX.Dock.prototype.center_dock = function () {
  var dockWidth = getDimensions($('#wxDock')).width;
  $('#wxDock').css({
    "marginLeft": -(dockWidth / 2) + "px"
  });
};

WebX.Dock.prototype.hide = function () {
  $('#wxDock').animate({
    'margin-bottom': '-58px'
  }, 420, 'easeOutExpo', function () {
    $('#wxDock').data('state', 'closed');
  });
}

WebX.Dock.prototype.show = function () {
  $('#wxDock').animate({
    'margin-bottom': '0px'
  }, 420, 'easeOutExpo', function () {
    $('#wxDock').data('state', 'open');
  });
}

WebX.Dock.prototype.toggle = function () {
  if ($('#wxDock').css('margin-bottom') === '0px') {
    WebX.dock.hide();
  } else {
    WebX.dock.show();
  }
}
  */
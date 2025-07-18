var webx_data;

/*
* method stCap(string)
*	returns a string with first letter capitalized
*	and the rest of the string in lowercase
*/
function stCap(str) {
  return (str.charAt(0).toUpperCase() + str.substr(1).toLowerCase());
}

/*--- WEBX OBJECTS ---*/
WebX.Create = function () {};
WebX.Create.prototype.window = function (type, width, height, id, title, content) {
  var wx_window = $('<div/>', {
    className: "wxWindow wxWindow_" + type,
    id: id,
    css: {
      "width": width + "px",
      "height": height + "px",
      "display": "none"
    }
  }).appendTo("#webxWrapper");
  
  $(wx_window).data('windowType',type);
  $(wx_window).data('windowState','expanded');
  switch(type){
    case "finder":
      break;
    case "settings":
      break;
    case "utility":
      break;
    case "app":
      break;
    default:
      break;
  }

  // top bar
  var wx_window_top = $('<div/>', {
    className: "wxWindow_top"
  }).appendTo(wx_window);

  var wx_window_top_wrapper = $('<div/>', {
    className: "wxWindow_top_wrapper"
  }).appendTo(wx_window_top);

  $('<div/>', {
    className: "wxWindow_top_title",
    html: title
  }).appendTo(wx_window_top_wrapper);
  
  var window_buttons_box = $('<div/>', {
    className: "wxWindow_top_buttons"
  }).appendTo(wx_window_top_wrapper);

  // Close Button
  $('<div/>', {
    className: "button close",
    click: function() {
      WebX.window.close(wx_window);
      return false;
    },
    mouseover: function () {
      $(this).html("x");
    },
    mouseout: function () {
      $(this).html("");
    }
  }).appendTo(window_buttons_box);

  // Minimize Button
  $('<div/>', {
    className: "button minimize",
    click: function () {
      return false;
    },
    mouseover: function () {
      $(this).html("-");
    },
    mouseout: function () {
      $(this).html("");
    }
  }).appendTo(window_buttons_box);
  
  // Maximize Button
  $('<div/>', {
    className: "button maximize",
    click: function() {
      WebX.Finder.maximize(wx_window);
      return false;
    },
    mouseover: function () {
      $(this).html("+");
    },
    mouseout: function () {
      $(this).html("");
    }
  }).appendTo(window_buttons_box);
  
  // Pill button
  $('<div/>', {
    className: "wxWindow_top_pill",
    click: function () {
      var pill_ele = $(this).parent().parent().parent();
      wxWindowPillToggle(pill_ele);
      return false;
    },
    mouseover: function () {
      $(this).html("-");
    },
    mouseout: function () {
      $(this).html("");
    }
  }).appendTo(wx_window_top_wrapper);
  
  $('<div/>', {
    className: "wxWindow_top_toolbar"
  }).appendTo(wx_window_top_wrapper);
  
  // bottom bar
  if(type !== 'app') {
   var wx_window_bottom = $('<div/>', {
     className: "wxWindow_footer"
   }).appendTo(wx_window);
   
   $('<div/>', {
     className: "wxWindow_footer_wrapper"
   }).appendTo(wx_window_bottom); 
  }

  // middle content
  var wx_window_content = $('<div/>', {
    className: "wxWindow_body resize_me",
    css: {
      "height": ($(wx_window).outerHeight(false) - 60 - ((type !== 'app') ? 27 : 3)) + "px"
    }
  }).appendTo(wx_window);
  
  var wx_window_body_wrapper = $('<div/>', {
    className: "wxWindow_body_wrapper",
    css: {
      "width": "100%",
      "height": "100%"
    }
  }).appendTo(wx_window_content);
  
  // Sidebar
  if(type === 'finder') {
    $('<div/>', {
      className: "wxWindow_body_sidebar",
      css: {
        "height": "100%"
      }
    }).appendTo(wx_window_body_wrapper);
  }
  
  // Body Content
  var window_body_width_modifier;
  if(type === 'finder') {
    window_body_width_modifier = 136;
  } else {
    window_body_width_modifier = 0;
  }
  $('<div/>', {
    className: "wxWindow_body_content",
    css: {
      "width": (width - window_body_width_modifier) + "px",
      "height": "100%",
      "left": window_body_width_modifier + "px"
    },
    html: content
  }).appendTo(wx_window_body_wrapper);

  // make draggable
  $(wx_window).draggable({
    containment: document.getElementsByTagName('body')[0],
    stack: ".wx_window",
    handle: wx_window_top,
    zIndex: 10
  });

 // make resizeable
//  $(wxWindow_body_sidebar).resizable({
//    resize: function(event, ui) {
//      $(ui.element).parent().find('.wxWindow_body_content').css({
//        "width": ($(ui.element).outerWidth(false) + $(ui.element).parent().find('.wxWindow_body_content').outerWidth(false)) + "px",
//        "left": $(ui.element).outerWidth(false)
//      });
//    }
//  });
  
  $(wx_window).resizable({
    alsoResize: $(wx_window).find('.resize_me'),
    minHeight: 135,
    minWidth: 250,
    handles: "se",
    resize: function(event, ui) {
      $(ui.element).find('.wxWindow_body_content').css({
        "width": ($(ui.element).outerWidth(false) - (($(ui.element).find('.wxWindow_body_sidebar').length !== 0) ? $(ui.element).find('.wxWindow_body_sidebar').outerWidth(false)+1 : 0)) + "px"
      });
    }
  });

  // position resizer for the right position
  $(wx_window).find('.ui-icon-gripsmall-diagonal-se').css({
    "position": "absolute",
    "bottom": "0px",
    "right": "0px",
    "width": "10px",
    "height": "10px"
  });

  return wx_window;
};

function wxWindowPillExpand(ele) {
var elements;
switch($(ele).data('windowType')) {
  case "finder":
    elements = [
      $(ele),
      $(ele).find('.wxWindow_top'),
      $(ele).find('.wxWindow_footer'),
      $(ele).find('.wxWindow_body_sidebar'),
      $(ele).find('.wxWindow_body_content'),
      $(ele).find('.wxWindow_body')
    ];
    
    var tool_bar_size = elements[0].data('originalStyles').tool_bar_size;
    var footer_size = elements[0].data('originalStyles').footer_size;
    var sidebar_size = elements[0].data('originalStyles').sidebar_size;
    
    elements[0].animate({
        "height": '+=' + (39 + 23),
        "width": '+=' + 135,
        "left": '-=' + 135,
        "-webkit-border-radius": "4px 4px 4px 4px",
        "-moz-border-radius": "4px 4px 4px 4px",
        "border-radius": "4px 4px 4px 4px",
        "border-bottom": "1px solid rgba(155,155,155,1)"
      }, {
        queue: false,
        duration: 420,
        easing: "linear"
      });
      elements[1].animate({
          height: '+=' + 39
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[2].animate({
          height: '23px'
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[3].animate({
          width: '135px'
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[4].animate({
          left: '135px'
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[5].animate({
          width: elements[5].outerWidth(false) + 135 + "px"
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      break;
    case "settings":
      break;
    case "utility":
      break;
    case "app":
      break;
    default:
      break;
  }
  $(ele).data('windowState', 'expanded');
}

function wxWindowPillContract(ele) {
  var elements;
  switch($(ele).data('windowType')) {
    case "finder":
      elements = [
        $(ele),
        $(ele).find('.wxWindow_top'),
        $(ele).find('.wxWindow_footer'),
        $(ele).find('.wxWindow_body_sidebar'),
        $(ele).find('.wxWindow_body_content'),
        $(ele).find('.wxWindow_body')
      ];
      
      var tool_bar_size = elements[0].find('.wxWindow_top_toolbar').outerHeight(false);
      var footer_size = elements[2].outerHeight(false);
      var sidebar_size = elements[3].outerWidth(false);
      
      elements[0].data('originalStyles', {
          "tool_bar_size": tool_bar_size,
          "footer_size": footer_size,
          "sidebar_size": sidebar_size
        }).animate({
          "height": '-=' + (39 + 23),
          "width": '-=' + 135,
          "left": '+=' + 135,
          "-webkit-border-radius": "4px 4px 0px 0px",
          "-moz-border-radius": "4px 4px 0px 0px",
          "border-radius": "4px 4px 0px 0px",
          "border-bottom": "1px solid rgba(155,155,155,0)"
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[1].animate({
          height: '-=' + 39
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[2].animate({
          height: '0px'
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[3].animate({
          width: '0px'
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[4].animate({
          left: '0px'
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      elements[5].animate({
          width: elements[5].outerWidth(false) - 135 + "px"
        }, {
          queue: false,
          duration: 420,
          easing: "linear"
        });
      break;
    case "settings":
      break;
    case "utility":
      break;
    case "app":
      break;
    default:
      break;
  }
  $(ele).data('windowState', 'contracted');
}

function wxWindowPillToggle(ele) {
  if($(ele).data('windowState') === 'expanded'){
    wxWindowPillContract(ele);
  } else {
    wxWindowPillExpand(ele);
  }
}

function windowResize() {
  $('#wallpaper').parent().hide();
  var wallpaper_source = $('#wallpaper').attr('src');
  var browser_size = getDimensions(document.getElementsByTagName('body')[0]);
  var rows = 5;
  var browser_divided = browser_size.height / rows;
  $('div.split_row').remove();
  for (var i = 0; i < rows; i++) {
    var div_row = $('<div>', {
      className: 'split_row',
      id: 'split_row_num_' + i,
      css: {
        'width': browser_size.width + "px",
        'height': browser_divided + "px",
        'background': 'url("' + wallpaper_source + '") no-repeat 0 ' + -(browser_divided * i) + 'px',
        'backgroundSize': '100%',
        'position': 'absolute',
        'top': (i === 0) ? 0 : (browser_divided * i) + 'px',
        'left': 0,
        'zIndex': 2,
        'display': 'block',
        'margin': 0,
        'padding': 0
      }
    }).appendTo('#webxWrapper');
    if (i !== (rows - 1)) {
      $('<div>', {
        css: {
          'width': '45px',
          'height': '45px',
          'background': '#cccccc',
          'color': '#333333',
          'textAlign': 'center',
          'float': 'right'
        },
        text: "open #" + i,
        data: {
          "dash_number": i
        },
        click: function () {
          toggleFolderDashboard($(this).data('dash_number'));
        }
      }).appendTo(div_row);
    }
    $('<div>', {
      className: 'shades',
      css: {
        'width': '100%',
        'height': '100%',
        'background': 'url(assets/imgs/dashboard/overlay.png) repeat',
        'zIndex': 3,
        'display': 'none'
      }
    }).appendTo(div_row);
    var row_dash = $('<div>', {
      className: 'row_dash',
      id: 'row_dash_num_' + i,
      css: {
        'width': browser_size.width + "px",
        'height': browser_divided + "px",
        'background': '#cccccc',
        'position': 'absolute',
        'top': (i === 0) ? 0 : (browser_divided * i) + 'px',
        'left': 0,
        'zIndex': 1,
        'display': 'block',
        'margin': 0,
        'padding': 0
      }
    }).appendTo('#webxWrapper');
  }
}

function openFolderDashboard(val) {
  var this_name = 'div#split_row_num_' + val;
  var height = parseInt($('div.split_row').eq(val).css("height"));
  $('div.split_row').not($('div.split_row').slice(0, (val + 1))).each(function (i) {
    var this_top = parseInt($(this).css('top'));
    var this_height = parseInt($(this).css('height'));
    var new_top = this_height + this_top;
    $(this).animate({
      top: (new_top) + 'px'
    }, {
      queue: false,
      duration: 420
    }, "swing");
  });
  $(this_name).toggleClass('dash_open');
  // $('#theDock').animate({
  //     'bottom' : -(height)+"px"
  //   }, { queue:false, duration:420}, "linear");
}

function closeFolderDashboard(val) {
  var row_num = $('div.split_row').length;
  var this_name = 'div#split_row_num_' + val;
  var height = parseInt($('div.split_row').eq(val).css("height"));
  $('div.split_row').not($('div.split_row').slice(0, (val + 1))).each(function (i) {
    var this_top = parseInt($(this).css('top'));
    var this_height = parseInt($(this).css('height'));
    var new_top = this_top - this_height;
    $(this).animate({
      top: (new_top) + 'px'
    }, {
      queue: false,
      duration: 420
    }, "swing");
  });
  $(this_name).toggleClass('dash_open');
  // $('#theDock').animate({
  //     'bottom' : "0px"
  //   }, { queue:false, duration:420}, "linear");
}

function toggleFolderDashboard(val) {
  var row_num = $('div.split_row').length;
  var this_name = String('div#split_row_num_' + val);

  if ((row_num - 1) === val) {
    return false;
  }

  if ($(this_name).attr('class').match('dash_open') !== null) {
    closeFolderDashboard(val);
    $('.shades').fadeOut(420);
  } else {
    // $('div.split_row').not(this_name).each(function(i){ if($(this).attr('class').match('dash_open') !== null) {
    //   closeFolderDashboard($(this).attr('id').slice(-1));
    // } });
    openFolderDashboard(val);
    $('.shades').fadeIn(420);
  }
}

$(window).bind('resize', function () {
  //windowResize();
});

$(document).ready(function () {
  $.preload([
    'assets/imgs/menubar/default_user.png',
    'assets/imgs/browser/buttons.png',
    'assets/imgs/finder/buttons.png',
    'assets/imgs/dock/dock_ends.png',
    'assets/imgs/dock/dock_02.png',
    'assets/imgs/dock/dock_sprite.png',
    'assets/imgs/dock/separator.png',
    'assets/imgs/dashboard/dashBack.gif',
    'assets/imgs/dashboard/widgetDrawer.png',
    'assets/imgs/dashboard/manage.png',
    'assets/imgs/wallpaper/The_Great_Wave.jpg'
    ], {
    init: function (loaded, total) {
      $("#start_progress").progressbar({ value: ((loaded/total) * 100) });
      $("#starter").find('p').html("Loading...");
    },
    loaded: function (img, loaded, total) {
      $("#start_progress").progressbar({ value: ((loaded/total) * 100) });
      $("#starter").find('p').html("Loading...");
    },
    loaded_all: function (loaded, total) {
      $.post('assets/js/settings.json', function (data) {
        webx_data = data;
        $("#start_progress").progressbar({ value: ((loaded/total) * 100) }).fadeOut(210);
        //$("#starter").find('p').html("Click to Start");
        // $("#starter").click(function () {
          WebX.init();
        //  return false;
        //});
        //$("#starter").click();
      });
    }
  });
  
  if(typeof(console) !== 'undefined' && console != null) {
    var console = {
      log: function (args) {
        
      }
    }
  }
  
});
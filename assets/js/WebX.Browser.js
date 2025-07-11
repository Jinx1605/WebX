WebX.Browser = function () {};
WebX.Browser.prototype.create = function (site_url) {
  WebX.Menubar.switch_to('browser');
  var this_id = WebX.Data.windows['browser'].length;
  var browser = $('<div/>', {
    className: "wx_window wxBrowser",
    id: "wxBrowser_" + this_id
  }).appendTo('#webxWrapper');
  
  WebX.Data.windows['browser'].push("wxBrowser_" + this_id);
  
  var browser_top = $('<div/>', {
    className: "wxBrowser_top"
  }).appendTo(browser);

  var browser_top_perms = $('<div/>', {
    className: "wxBrowser_top_permanents"
  }).appendTo(browser_top);

  var browser_title = $('<div/>', {
    className: "wxBrowser_title",
    text: "Browse"
  }).appendTo(browser_top_perms);

  var browser_top_button_box = $('<div/>', {
    className: "wxBrowser_buttons"
  }).appendTo(browser_top_perms);

  $('<div/>', {
    className: "button close"
  }).appendTo(browser_top_button_box).bind('click', function(){
    //debug.log('close button clicked');
    console.log("browser close button clicked :" + browser.attr('id'));
    WebX.Browser.toggle(browser);
  });

  $('<div/>', {
    className: "button minimize"
  }).appendTo(browser_top_button_box).bind('click', function(){
    debug.log('minimize button clicked');
    browser.hide("puff", {percent: 1}, 840);
    WebX.Dock.create_minimized_icon(browser.attr('id'),browser.attr('id'), 'Browser');
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
  browser.draggable({
		containment: '#webxWrapper',
    stack: ".wx_window",
    handle: browser_top,
    zIndex: 10,
    start: function(event, ui) {
      WebX.Menubar.switch_to('browser');
    }
	}).resizable({
	  alsoResize: "#wxBrowser_" + this_id + " .browser_resize",
    minHeight: 135,
    minWidth: 518,
    handles: "se"
	}).find('.ui-icon-gripsmall-diagonal-se').css({
    "position": "absolute",
    "bottom": "0px",
    "right": "0px",
    "width": "15px",
    "height": "20px",
    "z-index": 11
  });
};

WebX.Browser.prototype.maximize = function (ele) {
  var width_modifier = 0;
  var height_modifier = 0;
  var browser_size = getDimensions(document.getElementsByTagName('body')[0]);
  if (!$(ele).data('sizeState') || $(ele).data('sizeState') !== "max") {
    var eleSize = getDimensions($(ele));
    $(ele).data({
      "originalLeft": $(ele).css("left"),
      "originalTop": $(ele).css("top"),
      "originalHeight": eleSize.height,
      "originalWidth": eleSize.width,
      "sizeState": "min"
    });
  }
  if ($(ele).data('sizeState') === "min") {
    $(ele).css({
      "width": browser_size.width + "px",
      "height": browser_size.height - $('#menubar').outerHeight(true) + "px",
      "top": $('#menubar').outerHeight(true) + "px",
      "left": width_modifier + "px"
    });
    $(ele).find('.wxBrowser_iframe').css({
      "width": "100%",
      "height": ($(ele).outerHeight(false) - 60 - height_modifier) + "px"
    });
    $(ele).data('sizeState', "max");
  } else {
    $(ele).css({
      "width": $(ele).data('originalWidth') + "px",
      "height": $(ele).data('originalHeight') + "px",
      "top": $(ele).data('originalTop'),
      "left": $(ele).data('originalLeft')
    });
    $(ele).find('.wxBrowser_iframe').css({
      "width": "100%",
      "height": ($(ele).data('originalHeight') - 60 - (($(ele).data('windowType') === 'finder') ? height_modifier - 2 : height_modifier)) + "px"
    });
    $(ele).data('sizeState', "min");
  }
};

WebX.Browser.prototype.close = function (ele) {
  if (!$(ele).data('viewState')) {
    $(ele).data({
      "viewState": ""
    });
  }
  if ($(ele).data('viewState') !== "closed") {
    $(ele).fadeOut(420);
    $(ele).data('viewState', "closed");
  }
};

WebX.Browser.prototype.open = function (ele, opt) {
  if (!$(ele).data('viewState')) {
    $(ele).data({
      "viewState": ""
    });
  }
  if ($(ele).data('viewState') !== "open") {
    $(ele).fadeIn(420);
    $(ele).data('viewState', "open");
  }
};

WebX.Browser.prototype.toggle = function (ele) {
  if ($(ele).is(':visible')) {
    WebX.Browser.close(ele);
  } else if (!$(ele).is(':visible')) {
    WebX.Browser.open(ele);
  }
};
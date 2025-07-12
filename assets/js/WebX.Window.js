// WebX.Window - Common window functionality for both Browser and Finder components
// Provides base window management methods that can be used by specific window types

// Make sure WebX is defined
if (typeof window.WebX === 'undefined') {
  window.WebX = {};
}

// Make sure WebX.Data is defined
if (typeof window.WebX.Data === 'undefined') {
  window.WebX.Data = window.WebX.Data || {
    windows: {
      browser: [],
      finder: [],
      generic: []
    }
  };
}

// Define WebX.Window constructor
window.WebX.Window = function() {};

// Common window initialization function
WebX.Window.prototype.init = function(element, options = {}) {
  // Store references
  this.element = element;
  this.options = Object.assign({
    windowType: 'generic',
    width: 500,
    height: 350,
    minWidth: 500,
    minHeight: 135,
    position: 'center',
    title: 'Window',
    resizable: true,
    draggable: true
  }, options);

  // Set initial position if not already set
  if (!element.style.left || !element.style.top) {
    this.position(this.options.position);
  }

  // Initialize resize and drag functionality
  if (this.options.draggable || this.options.resizable) {
    const handle = this.options.handle || element.querySelector('.wxWindow_top') || element;
    
    Utils.DragResize.init(element, {
      handle: handle, 
      containment: Utils.$$('#webxWrapper'),
      minWidth: this.options.minWidth,
      minHeight: this.options.minHeight,
      onDragStart: () => {
        element.style.zIndex = Utils.getNextZIndex();
      }
    }).bringToFront();
  }

  return this;
};

// Position the window (center, top, random, or x,y coordinates)
WebX.Window.prototype.position = function(position) {
  const wrapper = Utils.$$('#webxWrapper');
  const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
  const eleRect = this.element.getBoundingClientRect();
  
  let left, top;
  
  if (position === 'center') {
    left = Math.max(0, (wrapperRect.width - eleRect.width) / 2);
    top = Math.max(0, (wrapperRect.height - eleRect.height) / 2);
  } else if (position === 'random') {
    left = Math.random() * (wrapperRect.width - eleRect.width);
    top = Math.random() * (wrapperRect.height - eleRect.height);
  } else if (Array.isArray(position) && position.length === 2) {
    [left, top] = position;
  } else {
    left = 50;
    top = 50;
  }
  
  this.element.style.left = `${left}px`;
  this.element.style.top = `${top}px`;
  
  return this;
};

// Maximize a window
WebX.Window.prototype.maximize = function(ele) {
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Get the appropriate modifiers based on window type
  let widthModifier = 0;
  let heightModifier = 0;
  
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
    // Maximize
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
    // Restore
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

// Close a window
WebX.Window.prototype.close = function(ele) {
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Initialize viewState if not already set
  if (!ele.dataset.viewState) {
    ele.dataset.viewState = "";
  }
  
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
    
    ele.dataset.viewState = "closed";
  }
  
  return this;
};

// Open a window
WebX.Window.prototype.open = function(ele, opt) {
  // Support both direct element parameter and this.element
  ele = ele || this.element;
  if (!ele) return this;
  
  // Initialize viewState if not already set
  if (!ele.dataset.viewState) {
    ele.dataset.viewState = "";
  }
  
  if (ele.dataset.viewState !== "open") {
    // Make sure it's displayed
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
    
    ele.dataset.viewState = "open";
  }
  
  return this;
};

// Toggle window visibility
WebX.Window.prototype.toggle = function(ele) {
  // If we have a string selector, find or create the window
  if (typeof ele === 'string') {
    const windowEl = document.querySelector(ele);
    
    if (!windowEl) {
      // Need to create the window
      let windowTitle, windowContent, windowType;
      
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
  
  if (ele.style.display === 'none' || ele.dataset.viewState === "closed") {
    return this.open(ele);
  } else {
    return this.close(ele);
  }
};

// Create a new window
WebX.Window.create = function(options = {}) {
  try {
    // Make sure Utils and createEl are available
    if (typeof Utils === 'undefined' || typeof createEl !== 'function') {
      console.error('Utils or createEl not available for WebX.Window.create');
      return null;
    }
    
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
  windowInstance.position(settings.position);
  
  // Initialize window behavior
  windowInstance.init(window, settings);
  
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
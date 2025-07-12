function getDimensions(ele, data = {}, callback = null) {
  var style = window.getComputedStyle(ele);
  var display = style.display;

  // Store original state
  var originalState = {
    visibility: ele.style.visibility,
    display: ele.style.display,
    position: ele.style.position,
    width: ele.style.width,
    height: ele.style.height,
    opacity: ele.style.opacity,
    transform: ele.style.transform,
    transition: ele.style.transition
  };

  // Apply temporary styles for measurement
  ele.style.visibility = data.visibility || 'hidden';
  ele.style.display = data.display || 'block';
  ele.style.position = data.position || 'absolute';
  
  if (data.transition) {
    ele.style.transition = data.transition;
  }

  // Handle transforms
  if (data.rotate) {
    const currentRotation = ele.style.transform ? 
      parseInt(ele.style.transform.match(/-?\d+/) || 0) : 0;
    ele.style.transform = `rotate(${currentRotation + data.rotate}deg)`;
  }

  // Handle opacity
  if (typeof data.opacity !== 'undefined') {
    ele.style.opacity = data.opacity;
  }

  // Get dimensions
  var newWidth = data.width || ele.offsetWidth;
  var newHeight = data.height || ele.offsetHeight;

  // Apply any permanent style changes if specified
  if (!data.temporary) {
    // Keep the new styles
    return { width: newWidth, height: newHeight };
  }

  // Restore original styles if temporary
  Object.keys(originalState).forEach(key => {
    ele.style[key] = originalState[key];
  });

  const dimensions = {
    width: newWidth,
    height: newHeight
  };
  
  if (callback && typeof callback === 'function') {
    callback(dimensions);
  }
  
  return dimensions;
}

function getComputedStyleValue(element, style) {
  return window.getComputedStyle(element, null).getPropertyValue(style);
}

function parentOffsets(obj) {
  var curleft = 0;
  var curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
  }
  return {
    left: curleft,
    top: curtop
  }
}
function isUrl(s) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
}

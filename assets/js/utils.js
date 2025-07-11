function getDimensions(ele) {
  var style = window.getComputedStyle(ele);
  var display = style.display;

  // All *Width and *Height properties give 0 on elements with display none,
  // so enable the element temporarily
  var originalVisibility = ele.style.visibility;
  var originalDisplay = ele.style.display;
  var originalPosition = ele.style.position;

  ele.style.visibility = 'hidden';
  ele.style.display = 'block';
  ele.style.position = 'absolute';

  // Use offsetWidth/offsetHeight for visible elements
  var newWidth = ele.offsetWidth;
  var newHeight = ele.offsetHeight;

  // Restore original styles
  ele.style.visibility = originalVisibility;
  ele.style.display = originalDisplay;
  ele.style.position = originalPosition;

  return {
    width: newWidth,
    height: newHeight
  };
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

/*--- PRELOADER (Vanilla JS) ---*/
var Preloader = (function() {
  var imgList = [];
  return {
	preload: function(imgArr, option) {
	  var setting = Object.assign({
		init: function(loaded, total) {},
		loaded: function(img, loaded, total) {},
		loaded_all: function(loaded, total) {}
	  }, option);
	  var total = imgArr.length;
	  var loaded = 0;

	  setting.init(0, total);
	  for (var i = 0; i < imgArr.length; i++) {
		var img = new window.Image();
		img.onload = function() {
		  loaded++;
		  setting.loaded(this, loaded, total);
		  if (loaded === total) {
			setting.loaded_all(loaded, total);
		  }
		};
		img.src = imgArr[i];
		imgList.push(img);
	  }
	}
  };
})();
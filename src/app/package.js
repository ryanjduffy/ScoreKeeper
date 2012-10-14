(function() {
	var di = enyo.fetchDeviceInfo && enyo.fetchDeviceInfo();
	
	var paths = ["extras.js",
	             "views.js",
	             "app.css"];
	
	if(di && di.screenWidth < 500) {
		paths.push("app-phone.css");
	}
	
	enyo.depends.apply(enyo, paths);
})();
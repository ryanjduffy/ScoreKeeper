var _Singleton = {
	name:"extras.Singleton",
	kind:"Component",
	root:"extras.singleton.data",
	published:{
		base:"",
	},
	create:function() {
		this.inherited(arguments);
		this.window = enyo.windows.getRootWindow();
		enyo.getObject(this.root, this.window);
	},
	set:function(prop, value) {
		enyo.setObject(this.getPath(prop), value, this.window);
	},
	get:function(prop) {
		return enyo.getObject(this.getPath(prop), false, this.window);
	},
	getPath:function(prop) {
		var r = [this.root];
		if(this.base && this.base.length > 0) {
			r.push(this.base);
		}
		
		r.push(prop);
		
		return r.join(".");
	}
};

enyo.kind(_Singleton);

var _AutoPref = {
	name : "extras.AutoPreferencesService",
	kind : "Component",
	components : [{
		kind : "SystemService",
		name : "getPreferences",
		method : "getPreferences",
		onResponse : "getPrefs"
	}, {
		kind : "SystemService",
		name : "setPreferences",
		method : "setPreferences",
		onResponse : "setPrefs"
	}, {
		kind:"extras.Singleton",
		name:"singleton",
		base:"autoprefs"
	}],
	events : {
		onLoad : "",
		onSet : "",
		onError : ""
	},
	deferUpdate:false,
	create : function() {
		this.inherited(arguments);

		var props = [];
		for ( var prop in this.published) {
			props.push(prop);
			this["get" + enyo.cap(prop)] = enyo.bind(this, "getProp", prop);
			this[prop + "Changed"] = enyo.bind(this, "changeHandler", prop);
		}

		this.$.getPreferences.call({
			keys : props
		});
	},
	getProp:function(prop) {
		var p = this.$.singleton.get(prop);
		
		if(p) {
			this[prop] = p;
			return p;
		} else {
			return this[prop];
		}
	},
	changeHandler : function(prop) {
		if (this.deferUpdate)
			return;
		
		this.$.singleton.set(prop, this[prop]);
		
		var o = {};
		o[prop] = this[prop];
		this.$.setPreferences.call(o);
	},
	defer : function(disable) {
		this.deferUpdate = !!disable;
	},
	update : function() {
		this.$.setPreferences.call(this.serialize());
	},
	serialize:function() {
		var o = {};
		for ( var prop in this.published) {
			o[prop] = this[prop];
		}
		
		return o;
	},
	setPrefs : function(source, response) {
		if (!response.returnValue)
			this.doError(response);

		this.doSet();
	},
	getPrefs : function(source, response) {
		if (!response.returnValue)
			this.doError(response);
		
		for ( var prop in this.published) {
			if(response[prop] !== undefined) {
				this[prop] = response[prop];
			}
		}

		this.doLoad();
	}
}

enyo.kind(_AutoPref);

var _Grid = {
	name:"extras.Grid",
	kind:"Control",
	className:"extras-grid",
	published:{
		cellHeight:200,
		cellWidth:150,
		margin:0,
		collapsed:false
	},
	create:function() {
		this.inherited(arguments);
		this.resizeHandler();
	},
	rendered:function() {
		this.inherited(arguments);
		if(!this.dim) {
			this.resizeHandler();
		}
	},
	// iterates children and repositions them
	positionControls:function() {
		var c = this.getControls();
		if(c.length === 0) return;
		
		var colsPerRow = Math.floor(this.dim.width/this.cellWidth);
		
		for(var i=0;i<c.length;i++) {
			this.positionControl(c[i], i, colsPerRow);
		}
		
		var h = Math.floor(c.length/colsPerRow)*this.cellHeight;
		this.applyStyle("height", h + "px")
	},
	// does the position calculation for a control and applies the style
	positionControl:function(control, index, colsPerRow) {
		var top = (this.collapsed) ? 0 : Math.floor(index/colsPerRow)*this.cellHeight;
		var left = (this.collapsed) ? 0 : (index%colsPerRow)*this.cellWidth;
		
		control.applyStyle("top", top + this.margin + "px");
		control.applyStyle("left", left + this.margin + "px");
	},
	collapsedChanged:function() {
		this.positionControls();
	},
	cellWidthChanged:function() {
		this.positionControls();
	},
	cellHeightChanged:function() {
		this.positionControls();
	},
	// reflows controls when window.resize event fires (e.g. device rotation)
	resizeHandler:function() {		
		this.getDimensions();
		this.positionControls();
	},
	getDimensions:function() {
		var s = enyo.dom.getComputedStyle(this.hasNode());
		this.dim = s && {width:parseInt(s.width)-this.margin*2,height:parseInt(s.height)-this.margin*2};
	}
};

enyo.kind(_Grid);

var _SquareGrid = {
	name:"extras.SquareGrid",
	kind:"extras.Grid",
	published:{
		minSize:100,
		maxSize:200
	},
	events:{
		onSizeChanged:""
	},
	calcDimensions:function() {
		if(!this.dim || this.dim.width <= 0) return;
		
		var perRow = Math.ceil(this.dim.width/this.minSize);
		while(this.dim.width/(perRow-1) <= this.minSize && perRow > 0) perRow--;

		w = this.dim.width/(perRow-1); //Math.min(this.maxSize, Math.max(this.minSize, this.dim.width/perRow));
		this.cellWidth = w;
		this.cellHeight = w;
		
		this.doSizeChanged(w);
		
		this.positionControls();
	},
	minSizeChanged:function() {
		this.calcDimensions();
	},
	maxSizeChanged:function() {
		this.calcDimensions();
	},
	resizeHandler:function() {
		this.getDimensions();
		this.calcDimensions();
	}
};

enyo.kind(_SquareGrid);

var _Timer = {
	name:"extras.Timer",
	kind:"Component",
	published:{
		time:{h:0,m:0,s:0,ms:0},
		frequency:20
	},
	events:{
		onTick:""
	},
	create:function() {
		this.inherited(arguments);
		this.timeChanged();
	},
	update:function(silent) {
		var now = new Date().getTime();
		
		if(!this.startTime) {
			this.startTime = now;
		}
		
		if(this.stopTime !== 0) {
			this.pauseTime += now - this.stopTime;
			this.stopTime = 0;
		}
		
		var diff = now - this.startTime - this.pauseTime;
		this.time = this.toTime(diff)
		
		if(silent !== true) {
			this.doTick(diff);
		}
		
		return now;
	},
	timeChanged:function() {
		this.startTime = undefined;
		this.stopTime = 0;
		this.pauseTime = 0;
		clearInterval(this.interval);
	},
	frequencyChanged:function() {
		if(this.interval) {
			this.stop();
			this.start();
		}
	},
	start:function() {
		this.update();
		this.interval = setInterval(enyo.bind(this, "update"), this.frequency);
	},
	stop:function(silent) {
		clearInterval(this.interval);
		this.stopTime = this.update(silent);
	},
	reset:function() {
		this.setTime({h:0,m:0,s:0,ms:0});
	},
	toMilli:function(t) {
		return t.ms + (t.s*1000) + (t.m*60000) + (t.h*360000);
	},
	toTime:function(ms) {
		var t = {};
		var divisions = {ms:1000,s:60,m:60,h:60};
		for(var k in divisions) {
			t[k] = ms%divisions[k];
			ms = Math.floor(ms/divisions[k]);
		}
		
		return t;
	}
};

enyo.kind(_Timer);
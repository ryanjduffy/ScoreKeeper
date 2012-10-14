var _Digit = {
	name:"com.tiqtech.scorekeeper.Digit",
	className:"sb-digit",
	kind:"Control",
	published:{
		value:0,
		hideZero:false,
		size:25
	},
	values:[0,1,2,3,4,5,6,7,8,9,"blank","colon","period"],
	create:function() {
		this.inherited(arguments);
		this.sizeChanged();
	},
	getIndex:function(value) {
		for(var i=0;i<this.values.length;i++) {
			if(this.values[i] === value) {
				return i;
			}
		}
		
		return -1;
	},
	valueChanged:function() {
		var v = (this.value === 0 && this.hideZero) ? "blank" : this.value;
		var index = this.getIndex(v);
		
		this.applyStyle("background-position", -index*this.size + "em 0em");
	},
	hideZeroChanged:function() {
		this.valueChanged();
	},
	sizeChanged:function() {
		var s = (this.size*this.values.length) + "em " + this.size + "em";
		this.applyStyle("background-size", s);
		
		s = this.size + "em";
		this.applyStyle("width", s);
		this.applyStyle("height", s);
		
		// cascade to value because it's dependent on size
		this.valueChanged();
	}
};

var _ThinDigit = {
	name:"com.tiqtech.scorekeeper.ThinDigit",
	kind:"com.tiqtech.scorekeeper.Digit",
	sizeChanged:function() {
		this.inherited(arguments);
		this.applyStyle("width", (this.size/2) + "em");
	}
};

var _Arrows = {
	name:"com.tiqtech.scorekeeper.Arrow",
	kind:"com.tiqtech.scorekeeper.Digit",
	className:"sb-arrow",
	values:["left", "right", "down", "up"]
};

var _Label = {
	name:"com.tiqtech.scorekeeper.Label",
	kind:"Control",
	className:"sb-label",
	published:{
		text:"",
		size:10
	},
	create:function() {
		this.inherited(arguments);
		this.textChanged();
		this.sizeChanged();
	},
	textChanged:function() {
		this.setContent(this.text);
	},
	sizeChanged:function() {
		this.applyStyle("font-size", this.size + "em");
	}
};

var _Display = {
	name:"com.tiqtech.scorekeeper.Display",
	kind:"Control",
	className:"sb-display",
	style:"position:relative",
	published:{
		positions:1,
		value:0,
		size:5
	},
	create:function() {
		this.inherited(arguments);
		this.sizeChanged();
	},
	invalidate:function() {
		this.content = undefined;
		this.hasNode() && this.render();
	},
	getInnerHtml:function() {
		if(!this.content) {
			var s = [];
			for(var i=0;i<this.positions;i++) {
				var x =  Math.pow(10, i);
				var v = ((this.value !== 0 && this.value < x) || (this.value === 0 && i > 0)) ? 10 : Math.floor((this.value%(x*10))/x);
				
				s = s.concat(["<div class='sb-digit' style='",
				          "width:",this.size,"em;",
				          "height:",this.size,"em;",
				          "background-size:",(this.size*13),"em ",this.size,"em;",
				          "background-position:",-v*this.size,"em 0em;",
				          "position:absolute;",
				          "left:",this.size*(this.positions-i-1),"em;",
				          "'></div>"]);
			}
			
			this.content = s.join("");
		}
		
		return this.content;
	},
	positionsChanged:function() {
		this.invalidate();
	},
	valueChanged:function() {
		this.invalidate();
	},
	sizeChanged:function() {
		this.applyStyle("width", (this.positions*this.size)+"em");
		this.applyStyle("height", this.size+"em");
		
		this.invalidate();
	}
};

var _DisplayCarousel = {
	name:"com.tiqtech.scorekeeper.DisplayCarousel",
	kind:"Control",
	className:"sk-display-carousel",
	published:{
		positions:1,
		value:0,
		min:null,
		max:null,
		size:5,
		label:$L("New Value")
	},
	events:{
		onChange:""
	},
	components:[
	    {kind:"Control", name:"wrapper", onmousehold:"showMenu", onclick:"displayClicked", components:[
            {kind:"com.tiqtech.scorekeeper.Display", name:"display", hideZero:true}
//	        {kind:"VirtualCarousel", name:"carousel", onSetupView:"getDisplay", onSnapFinish:"updateValue", viewControl:
//	        	{kind:"com.tiqtech.scorekeeper.Display"}
//            }
		]},
		{kind: "Popup", name:"setupPopup", onClose:"menuClosed", className:"sk-display-carousel-popup", dismissWithClick:false, components:[
			{kind:"IntegerPicker", name:"valueInput"},
			{kind:"Control", components:[
                {kind:"Button", flex:1, className:"enyo-button-light", label:$L("Cancel"), name:"cancelButton", onclick:"cancelClicked"},                          
				{kind:"Button", flex:1, className:"enyo-button-affirmative", label:$L("Done"), onclick:"doneClicked"}
			]}
		]}
	],
	create:function() {
		this.inherited(arguments);
		this.sizeChanged();
		this.positionsChanged();
		this.valueChanged();
	},
//	rendered:function() {
//		this.inherited(arguments);
//		var n = this.hasNode();
//		if(n) {
//			this.log("rendered w/h", n.offsetWidth, n.offsetHeight);
//			this.log("style", n.style.width, n.style.height);
//			this.owner.hasNode().style.fontSize = "0.5px";
//			//n.style.fontSize = "0.5px";
//			var style = enyo.dom.getComputedStyle(n);
//			this.log("computed", style.fontSize, style.width, style.height);
//		}
//	},
	dragstartHandler:function(e) {
    	this.dragging = true;
    	this.dragPosition = {x:window.event.x,y:window.event.y};

    	enyo.job("dragJob", enyo.bind(this, "cancelFlick"), 250);
    },
    dragfinishHandler:function(e) {
    	if(this.dragging) {
    		enyo.job.stop("dragJob");
    		
    		var dx = window.event.x - this.dragPosition.x;
    		var dy = window.event.y - this.dragPosition.y;
    		
    		// check for left/right flick
    		if(Math.abs(Math.atan(dy/dx)) < 0.5) {
    			if(dx < 0) {
    				this.flickLeft();
    			} else {
    				this.flickRight();
    			}
    		}
    	}
    },
    cancelFlick:function() {
    	this.dragging = false;
    },
    flickLeft:function() {
    	this.setValue(this.value+1);
    	this.doChange(this.value);
    },
    flickRight:function() {
    	this.setValue(this.value-1);
    	this.doChange(this.value);
    },
    displayClicked:function() {
    	if(this.dragging) {
    		this.dragging = false;
    	} else {
    		this.setValue(this.value+1);
    		this.doChange(this.value);
    	}
    },
//	updateValue:function(source) {
//		this.value = this.$.carousel.viewIndex;
//		this.doChange(this.value);
//	},
	showMenu:function(source, event) {
		enyo.scrim.show();
		this.$.setupPopup.openAtControl(this);
		
		this.$.valueInput.setLabel(this.label);
		this.$.valueInput.setValue(this.value);
		this.$.valueInput.setMin(this.min || 0);
		this.$.valueInput.setMax(this.max || Math.pow(10, this.positions)-1);
	},
	cancelClicked:function(source, event) {
		this.$.setupPopup.close();
	},
	doneClicked:function(source, event) {
		this.setValue(this.$.valueInput.getValue());
		this.doChange(this.value);
		this.cancelClicked();
	},
	menuClosed:function() {
		enyo.scrim.hide();
	},
//	setNewValue:function() {
//		var i = parseInt(this.$.valueInput.getValue());
//		if(isNaN(i)) return;
//		
//		this.setValue(i);
//		this.doChange(this.getValue());
//
//		this.closeMenu();
//	},
	valueChanged:function() {
		var MAX = Math.pow(10, this.positions)-1;
		
		// bound by (this.min || 0) <= this.value <= (this.max || 10^tihs.positions-1) 
		this.value = Math.min(Math.max(this.value, this.min || 0, 0), this.max || MAX, MAX);
		this.$.display.setValue(this.value);
	},
	positionsChanged:function() {
		this.$.display.setPositions(this.positions);
	},
	sizeChanged:function() {
		//this.log("size", (this.positions*this.size))
		this.applyStyle("width", ((this.positions*this.size))+"em");
		this.applyStyle("height", this.size+"em");
		
		this.$.wrapper.applyStyle("width", ((this.positions*this.size))+"em");
		this.$.wrapper.applyStyle("height", this.size+"em");
		
		this.$.display.setSize(this.size);
	},
};

var _LabeledDisplay = {
	name:"com.tiqtech.scorekeeper.LabeledDisplay",
	kind:"Control",
	className:"sb-labeled-display",
	align:"center",
	components:[ 
		{kind:"com.tiqtech.scorekeeper.Label", name:"label"},
		{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"display", onChange:"doChange"}
	],
	published:{
		label:"",
		positions:1,
		value:0,
		size:75
	},
	events:{
		onChange:""
	},
	create:function() {
		this.inherited(arguments);
		this.positionsChanged();
		this.valueChanged();
		this.labelChanged();
		this.sizeChanged();
	},
	labelChanged:function() {
		this.$.label.setText(this.label);
	},
	positionsChanged:function() {
		this.$.display.setPositions(this.positions);
	},
	valueChanged:function() {
		this.$.display.setValue(this.value);
	},
	sizeChanged:function() {
		this.$.display.setSize(this.size);
	}
};

var _Clock = {
	name:"com.tiqtech.scorekeeper.Clock",
	kind:"Control",
	className:"sk-clock",
	published:{
		running:false,
		time:0,
		size:100,
		direction:"down",
		tenths:false
	},
	events:{
		onTick:"",
		onReset:"",
		onExpiration:"clockExpired",
	},
	components:[
		{kind:"Control", onmousehold:"showMenu", onclick:"prepToggle", components:[
			{kind:"com.tiqtech.scorekeeper.Digit", style:"display:inline-block", name:"m1", value:0, hideZero:true},
			{kind:"com.tiqtech.scorekeeper.Digit", name:"m2", value:0},
			{kind:"com.tiqtech.scorekeeper.ThinDigit", name:"divider", value:"colon"},
			{kind:"com.tiqtech.scorekeeper.Digit", name:"s1", value:0},
			{kind:"com.tiqtech.scorekeeper.Digit", style:"display:inline-block", name:"s2", value:0}
		]},
		
		{kind:"Control", name:"controls", className:"controls", components:[
            {name:"clockSet", className:"clock-set", onclick:"showMenu"},
            {name:"clockToggle", className:"clock-start", onclick:"toggle"},
        ]},
		{kind:"extras.Timer", name:"timer", onTick:"tick", frequency:50},
		{kind:"Popup", name:"setupPopup", onClose:"menuClosed", className:"sk-clock-popup", components:[
            {kind:"RowGroup", caption:$L("Set Time"), components:[
				{kind:"IntegerPicker", name:"setMin", label:$L("Minutes")},
				{kind:"RowItem", layoutKind:"HFlexLayout", components:[
					{content:$L("Seconds"), className:"enyo-picker-label enyo-label", flex:1},
					{kind:"Picker", name:"setSec", label:$L("Seconds")},
				]},
				{kind:"IntegerPicker", name:"setMS", label:$L("Tenths")},
			]},
			{kind:"Control", components:
				[{kind:"Button", flex:1, label:$L("Reset"), name:"resetButton", onclick:"resetClicked", className:"enyo-button-gray"},
				{kind:"Button", flex:1, label:$L("Done"), onclick:"closeMenu", className:"enyo-button-affirmative"}]
			}
		]}
	],
	create:function() {
		this.inherited(arguments);
		this.timeChanged();
		this.sizeChanged();
		
		// only start up time on create if running param was passed truthy
		if(this.running) {
			this.runningChanged();
		}
	},
	runningChanged:function() {
		// kickout if countdown and no time left
		if(this.direction === "down" && this.time <= 0) {
			this.running = false;
			return;
		}
		
		if(this.running) {
			this.$.timer.start();
		} else {
			this.$.timer.stop(true);
			this.displayDivider(true);
		}
		
		this.$.clockToggle.addRemoveClass("clock-start", !this.running);
		this.$.clockToggle.addRemoveClass("clock-pause", this.running);
	},
	timeChanged:function() {
		this.startTime = this.time;
		this.displayTime();
		this.$.timer.reset();
	},
	sizeChanged:function() {
		this.applyStyle("height", this.size+"em");
		this.applyStyle("width", (this.size*4.5)+"em");
		
		this.$.m1.setSize(this.size);
		this.$.m2.setSize(this.size);
		this.$.s1.setSize(this.size);
		this.$.s2.setSize(this.size);
		this.$.divider.setSize(this.size);
	},
	showControls:function() {
		this.$.controls.addRemoveClass("showing", !this.$.controls.hasClass("showing"));
	},
	showMenu:function() {
		
		this.setRunning(false);
		enyo.job.stop("toggle");
		
		enyo.scrim.show();
		this.$.setupPopup.openAtControl(this);
		
		var t = this.$.timer.toTime(this.time);
		
		this.$.setMin.setMax(99);
		this.$.setMin.setValue(t.m);
		
		if(this.$.setSec.getItems().length === 0) {
			var items = [];
			for(var i=0;i<60;i++) {
				var caption = (i<10) ? "0"+i : i;
				items.push({caption:caption, value:i})
			}
			this.$.setSec.setItems(items);
		}
		
		this.$.setSec.setValue(t.s);
		
		this.$.setMS.setValue(Math.floor(t.ms/100));
		this.$.setMS.setMax(9);
	},
	closeMenu:function() {
		var t = {h:0,m:0,s:0,ms:0};
		t.m = this.$.setMin.getValue();
		t.s = this.$.setSec.getValue();
		t.ms = this.$.setMS.getValue()*100;
		
		this.setTime(this.$.timer.toMilli(t));
		
		this.$.setupPopup.close();
	},
	menuClosed:function() {
		enyo.scrim.hide();
	},
	prepToggle:function() {
		enyo.job("toggle", enyo.bind(this, "toggle"), 200);
	},
	toggle:function() {
		this.setRunning(!this.running);		
	},
	tick:function(source, time) {
		this.prevTime = this.time;
		this.time = (this.direction === "down") ? this.startTime - time : time;
		
		if(this.time <= 0 && this.direction === "down") {
			this.startTime = this.time = 0;
			this.$.timer.reset();
			
			this.doExpiration();
		}
		
		this.displayTime();
		this.doTick(this.time);
	},
	displayTime:function() {
		var t = this.$.timer.toTime(this.time);

		this.displayDivider();
		
		if(this.time >= 60000 || !this.tenths) {
			// skip rendering if seconds are the same as last tick.
			if(this.time > 6000 && Math.floor(this.time/1000) === Math.floor(this.prevTime/1000)) return;
			
			this.$.m1.setValue((t.m<10) ? 0 : Math.floor(t.m/10));
			this.$.m2.setValue(t.m%10);
			
			// round up when counting up
			if(this.direction === "up") {
				t.s += Math.ceil(t.ms/1000);
			}
			
			this.$.s1.setValue((t.s<10) ? 0 : Math.floor(t.s/10));
			this.$.s2.setValue(t.s%10);
			this.$.s2.setHideZero(false);
		} else {
			this.$.m1.setValue((t.s<10) ? 0 : Math.floor(t.s/10));
			this.$.m2.setValue(t.s%10);
			
			this.$.s1.setValue(Math.floor(t.ms/100))
			this.$.s2.setValue(0);
			this.$.s2.setHideZero(true);
		}
	},
	displayDivider:function(forceShow) {
		var t = this.$.timer.toTime(this.time);

		// hide divider on alternate seconds
		if(t.ms > 500 && this.running) {
			this.$.divider.setValue("blank");
		} else if(this.time >= 60000 || !this.tenths) {
			this.$.divider.setValue("colon");
		} else {
			this.$.divider.setValue("period");
		}
	},
	reset:function(source, event) {
		this.held = true;
		
		event.stopPropagation();
	},
	resetClicked:function() {
		this.doReset();
		this.$.setupPopup.close();
	}
}

enyo.kind(_Digit);
enyo.kind(_ThinDigit);
enyo.kind(_Arrows);
enyo.kind(_Label);
enyo.kind(_Display);
enyo.kind(_DisplayCarousel);
enyo.kind(_LabeledDisplay);
enyo.kind(_Clock);
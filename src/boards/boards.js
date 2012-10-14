var _Boards = {
	name:"com.tiqtech.scorekeeper.Boards",
	kind:"Component",
	boardList:["Basic", "BasicWithTimer", "BaseballBasic", "Baseball", "BasketballBasic", "Basketball", "FootballBasic", "Football", "SoccerBasic", "Soccer"],
	getBoards:function() {
		if(!this.boards) {
			var boards = [];
			var n = com.tiqtech.scorekeeper.boards;
			for(var i=0;i<this.boardList.length;i++) {
				k = this.boardList[i];
				boards.push({
					kind:n[k].prototype.kindName,
					title:n[k].prototype.title,
					_proto:n[k].prototype
				})
			}
			
			this.boards = boards;
		}
		
		return this.boards;
	}
}

var _Scoreboard = {
	name:"com.tiqtech.scorekeeper.Scoreboard",
	kind:"Control",
	className:"sk-scoreboard",
	components:[
	],
	published:{
		config:{},
		color:"bg-blue"
	},
	events:{
		onExpiration:""
	},
	create:function() {
		this.inherited(arguments);
		this.configChanged();
		this.colorChanged();
		this.initProperties();
		
		this.resizeHandler();
	},
//	rendered:function() {
//		
//		
//		
//		var n = this.hasNode();
//		if(n) {
//
//			var owner = this.parent.hasNode();
//			this.dimensions = {width:owner.offsetWidth-150, height:owner.offsetHeight};
//			n.style.fontSize = "1px";
//			
//			var style = enyo.dom.getComputedStyle(n);
//			this.log("computed", style.fontSize, style.width, style.height);
//		}
//		
//		this.inherited(arguments);
//	},
	serialize:function() {
		var o = {kind:this.kind, title:this.title, config:this.config};
		for(var k in this.published) {
			o[k] = enyo.call(this, "get" + enyo.cap(k));
		}
		
		return o;
	},
	initProperties:function() {
		for(var k in this.published) {
			enyo.call(this, k+"Changed");
		}
	},
	getLabel:function(property) {
		return "";
	},
	configChanged:function() {
		// add defaults from published and provided props
		this.config = enyo.mixin(enyo.mixin({}, this.published), this.config || {});
	},
	colorChanged:function() {
		this.setClassName(this.className + " " + this.color);
	},
	reset:function(property) {
		if(!this.config) {
			this.configure();
			return; // because configure calls reset
		}
		
		if(property) {
			enyo.call(this, "set" + enyo.cap(property), [this.config[property]]);
		} else {
			for(var k in this.config) {
				enyo.call(this, "set" + enyo.cap(k), [this.config[k]]);
			}
		}
	},
	updateProperty:function(source, value) {
		var prop = source.propertyName || source.name;
		if(typeof this.published[prop] !== "undefined") {
			this[prop] = value;
		}
	},
	resetProperty:function(source, value) {
		this.reset(source.propertyName || source.name);
	},
	resizeHandler:function() {
		var owner = this.parent.hasNode();
		this.dimensions = {width:owner.offsetWidth-150, height:owner.offsetHeight};
		
		this.applyStyle("width", this.dimensions.width+"px");
		this.applyStyle("font-size", this.dimensions.width/100 + "px");
		
		//this.log("fon-size",  this.dimensions.width/100 + "px")
		
		// cascade to children
		this.inherited(arguments);
	},
	prefsChangedHandler:function() {
		
	},
	clockExpired:function() {
		this.doExpiration();
	}
}

var _BasicWithTimer = {
	name:"com.tiqtech.scorekeeper.boards.BasicWithTimer",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:"Timed",
	className:"sk-scoreboard basic",
	components:[
	    {kind:"Control", name:"clockWrapper", pack:"center", components:[
	    	{kind:"com.tiqtech.scorekeeper.Clock", name:"clock", propertyName:"time", size:17, onTick:"updateTime", onReset:"resetProperty"}
	    ]},
		{kind:"Control", pack:"justify", components:[
            {components:[
   		        {kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", text:$L("Guest"), size:7, width:"5em"},
   		        {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"away", size:17, label:$L("Guest Score"), onChange:"updateProperty", propertyName:"guestScore", positions:2}
   		    ]},
		    {components:[
		        {kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", text:$L("Home"), size:7, width:"5em"},
		        {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"home", size:17, label:$L("Home Score"), onChange:"updateProperty", propertyName:"homeScore", positions:2}
		    ]}
		]}
	],
	published:{
		time:30*60*1000,
		homeScore:0,
		guestScore:0,
		homeLabel:$L("Home"),
		guestLabel:$L("Guest")
	},
	homeScoreChanged:function() {
		this.$.home.setValue(this.homeScore);
	},
	homeLabelChanged:function() {
		this.$.homeLabel.setContent(this.homeLabel);
	},
	guestScoreChanged:function() {
		this.$.away.setValue(this.guestScore);
	},
	guestLabelChanged:function() {
		this.$.guestLabel.setContent(this.guestLabel);
	},
	timeChanged:function() {
		this.$.clock.setTime(this.time)
	},
	updateTime:function(source, time) {
		this.time = time;
	}
};

var _Basic = {
	name:"com.tiqtech.scorekeeper.boards.Basic",
	kind:"com.tiqtech.scorekeeper.boards.BasicWithTimer",
	className:"sk-scoreboard basic",
	title:"Basic",
	published:{  // redefining to hide time property
		time:undefined,
		homeScore:0,
		guestScore:0,
		homeLabel:$L("Home"),
		guestLabel:$L("Guest")
	},
	create:function() {
		this.inherited(arguments);
		
		this.$.away.setSize(25);
		this.$.home.setSize(25);
		this.$.guestLabel.applyStyle("width", "7em");
		this.$.homeLabel.applyStyle("width", "7em");
		this.$.clockWrapper.hide();
	}
};

var _Basketball = {
	name:"com.tiqtech.scorekeeper.boards.Basketball",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:"Basketball",
	className:"sk-scoreboard basketball-basic",
	components:[
	    {kind:"Control", pack:"center", components:[
	    	{kind:"com.tiqtech.scorekeeper.Clock", name:"clock", onTick:"updateTime", propertyName:"time", onReset:"resetProperty", size:12, style:"margin-bottom:2em"},
	    ]},
		{kind:"Control", pack:"justify", align:"center", style:"margin-bottom:2em", components:[
            {components:[
	            {kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", positions:3, size:5, width:"7em"},
	            {kind:"com.tiqtech.scorekeeper.DisplayCarousel", onChange:"updateProperty", propertyName:"guestScore", name:"guest", positions:3, size:12	},
	        ]},
	        {components:[
                {kind:"com.tiqtech.scorekeeper.Label", text:$L("POS"), positions:1, size:3},
                {className:"sk-display-wrapper", components:[
                    {kind:"com.tiqtech.scorekeeper.Arrow", name:"arrow", value:"left", size:7, onclick:"arrowClicked"},
                ]}
	        ]},
            {components:[
                {kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", positions:3, size:5, width:"7em"},
                {kind:"com.tiqtech.scorekeeper.DisplayCarousel", onChange:"updateProperty", propertyName:"homeScore", name:"home", positions:3, size:12},
            ]},
		]},
		{kind:"Control", name:"bottomWrapper", pack:"justify", align:"center", style:"margin-top:1em", components:[
			{components:[
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("Fouls"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeFouls", positions:2, onChange:"updateProperty", size:8},
			]},
			{kind:"Spacer"},
			{components:[
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("T.O."), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeTimeouts", onChange:"updateProperty", size:8},
			]},
			{kind:"Spacer"},
			{kind:"com.tiqtech.scorekeeper.Label", name:"periodLabel", text:$L("Period"), size:4, style:"padding-right:1em"},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"periodField", onChange:"updateProperty", propertyName:"period", min:1, value:1, max:4, size:8},
			{kind:"Spacer"},
			{components:[
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("T.O."), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestTimeouts", onChange:"updateProperty", size:8},
			]},
			{kind:"Spacer"},
			{components:[
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("Fouls"),  size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestFouls", positions:2, onChange:"updateProperty", size:8},
			]}
		]}
	],
	published:{
		homeLabel:"Home",
		homeScore:0,
		homeFouls:0,
		homeTimeouts:3,
		guestLabel:"Guest",
		guestScore:0,
		guestFouls:0,
		guestTimeouts:3,
		time:15*60*1000,
		period:1,
		possession:"left"
	},
	homeLabelChanged:function() {
		this.$.homeLabel.setText(this.homeLabel);
	},
	homeScoreChanged:function() {
		this.$.home.setValue(this.homeScore);
	},
	homeFoulsChanged:function() {
		this.$.homeFouls.setValue(this.homeFouls)
	},
	homeTimeoutsChanged:function() {
		this.$.homeTimeouts.setValue(this.homeTimeouts);
	},
	guestLabelChanged:function() {
		this.$.guestLabel.setText(this.guestLabel);
	},
	guestScoreChanged:function() {
		this.$.guest.setValue(this.guestScore);
	},
	guestFoulsChanged:function() {
		this.$.guestFouls.setValue(this.guestFouls);
	},
	guestTimeoutsChanged:function() {
		this.$.guestTimeouts.setValue(this.guestTimeouts);
	},
	timeChanged:function() {
		this.$.clock.setTime(this.time);
	},
	periodChanged:function() {
		this.$.periodField.setValue(this.period);
	},
	possessionChanged:function() {
		this.$.arrow.setValue(this.possession);
	},
	updateTime:function(source, time) {
		this.time = time;
	},
	getBackground:function() {
		return "images/bg-basketball.jpg";
	},
	arrowClicked:function() {
		this.setPossession(this.possession === "left" ? "right" : "left");
	}
}

var _BasketballBasic = {
	name:"com.tiqtech.scorekeeper.boards.BasketballBasic",
	kind:"com.tiqtech.scorekeeper.boards.Basketball",
	title:"Basketball Basic",
	create:function() {
		this.inherited(arguments);
		this.$.bottomWrapper.hide();
	}
}

var _BaseballBasic = {
	name:"com.tiqtech.scorekeeper.boards.BaseballBasic",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:"Baseball Basic",
	className:"sk-scoreboard baseball-basic",
	components:[
	    {kind:"Control", name:"topWrapper", pack:"justify", style:"margin-bottom:20px", components:[
	    	{kind:"VFlexBox", align:"center", flex:1, components:[
                {kind:"com.tiqtech.scorekeeper.Label", name:"ballsLabel", text:$L("Balls"), size:4},
                {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"balls", onChange:"updateProperty", min:0, max:4, size:8},
	        ]},
	        {kind:"VFlexBox", align:"center", flex:1, components:[
				{kind:"com.tiqtech.scorekeeper.Label", name:"strikesLabel", text:$L("Strikes"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"strikes", onChange:"updateProperty", min:0, max:3, size:8},
			]},
			{kind:"VFlexBox", align:"center", flex:1, components:[
				{kind:"com.tiqtech.scorekeeper.Label", name:"outsLabel", text:$L("Outs"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"outs", onChange:"updateProperty", min:0, max:3, size:8},
			]},
			{kind:"VFlexBox", align:"center", flex:1, components:[
				{kind:"com.tiqtech.scorekeeper.Label", name:"inningLabel", text:$L("Innings"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"inning", onChange:"updateProperty", min:1, positions:1, size:8},
			]}
	    ]},
	    {kind:"Control", components:[
			{kind:"VFlexBox", flex:1, components:[
			    {height:"10em"},
			    {kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", text:$L("Guest"), size:5, className:"team-label guest"},
			    {kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", text:$L("Home"), size:5, className:"team-label"},
			]},
			{kind:"VFlexBox", className:"column", pack:"center", align:"center", components:[
			    {kind:"com.tiqtech.scorekeeper.Label", text:enyo._$L("Runs"), size:5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestRuns", onChange:"updateProperty", positions:2, size:10},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeRuns", onChange:"updateProperty", positions:2, size:10},
			]},
			{kind:"VFlexBox", className:"column", pack:"center", align:"center", components:[
			    {kind:"com.tiqtech.scorekeeper.Label", text:enyo._$L("Hits"), size:5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestHits", onChange:"updateProperty", positions:2, size:10},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeHits", onChange:"updateProperty", positions:2, size:10},
			]},
			{kind:"VFlexBox", className:"column", pack:"center", align:"center", components:[
			    {kind:"com.tiqtech.scorekeeper.Label", text:$L("Errors"), size:5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestErrors", onChange:"updateProperty", positions:2, size:10},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeErrors", onChange:"updateProperty", positions:2, size:10},
			]},
		]}
	],
	published:{
		homeLabel:"Home",
		homeRuns:0,
		homeHits:0,
		homeErrors:0,
		guestLabel:"Guest",
		guestRuns:0,
		guestHits:0,
		guestErrors:0,
		inning:1,
		balls:0,
		strikes:0,
		outs:0,
	},
	homeLabelChanged:function() {
		this.$.homeLabel.setText(this.homeLabel);
	},
	homeRunsChanged:function() {
		this.$.homeRuns.setValue(this.homeRuns);
	},
	homeHitsChanged:function() {
		this.$.homeHits.setValue(this.homeHits);
	},
	homeErrorsChanged:function() {
		this.$.homeErrors.setValue(this.homeErrors);
	},
	guestLabelChanged:function() {
		this.$.guestLabel.setText(this.guestLabel);
	},
	guestRunsChanged:function() {
		this.$.guestRuns.setValue(this.guestRuns);
	},
	guestHitsChanged:function() {
		this.$.guestHits.setValue(this.guestHits);
	},
	guestErrorsChanged:function() {
		this.$.guestErrors.setValue(this.guestErrors);
	},
	inningChanged:function() {
		this.$.inning.setValue(this.inning);
	},
	ballsChanged:function() {
		this.$.balls.setValue(this.balls);
	},
	strikesChanged:function() {
		this.$.strikes.setValue(this.strikes);
	},
	outsChanged:function() {
		this.$.outs.setValue(this.outs);
	}
};

var _BaseballFull = {
	name : "com.tiqtech.scorekeeper.boards.Baseball",
	title:"Baseball",
	kind : "com.tiqtech.scorekeeper.Scoreboard",
	className:"sk-scoreboard baseball",
	components : [
	    {components:[	// outer wrapper has -20px margin
			{kind:"Repeater", layoutKind:"HFlexLayout", pack:"justify", name:"inningWrapper", onSetupRow:"layoutInning"},
			{kind:"Control", name:"topWrapper", pack:"stretch", style:"margin-top:20px", components:[
				{kind:"com.tiqtech.scorekeeper.Label", flex:1, text:$L("Inning"), size:2.5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"inning", onChange:"updateProperty", positions:1, min:1, size:5},
				{kind:"com.tiqtech.scorekeeper.Label", flex:1, text:$L("Balls"), size:2.5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"balls", onChange:"updateProperty", min:0, max:4, size:5},
				{kind:"com.tiqtech.scorekeeper.Label", flex:1, text:$L("Strikes"), size:2.5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"strikes", onChange:"updateProperty", min:0, max:3, size:5},
				{kind:"com.tiqtech.scorekeeper.Label", flex:1, text:$L("Outs"), size:2.5},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"outs", onChange:"updateProperty", min:0, max:3, size:5},
	 		]},
 		]}
	],
	published:{
		homeLabel:$L("Home"),
		homeScore:null,
		homeHits:0,
		homeErrors:0,
		guestLabel:$L("Guest"),
		guestScore:null,
		guestHits:0,
		guestErrors:0,
		balls:0,
		strikes:0,
		outs:0,
		inning:1
	},
	innings:9,
	deferResize:true,	// have to wait to resize since i'm dynamically building some control
	create:function() {
		this.inherited(arguments);
		
		this.homeScoreChanged();
		this.guestScoreChanged();
	},
	rendered:function() {
		this.deferResize = false;
		this.updateRuns("homeScore");
		this.updateRuns("guestScore");
		this.resizeHandler();
	},
	layoutInning:function(source, index) {
		var k;

		if(index === 0) {
			k = {kind:"VFlexBox", pack:"end", width:"10em", components:[
  					{kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", className:"team-label", text:this.guestLabel || $L("Guest"), size:2.5},
  					{kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", className:"team-label", text:this.homeLabel || $L("Home"), size:2.5},
  				]};
		} else if(index <= this.innings) {
			k = {kind:"VFlexBox", components:[
					{kind:"com.tiqtech.scorekeeper.Label", text:index, size:4},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestInning"+index, onChange:"updateScore", value:this.guestScore[index-1] || 0, size:5},
					{className:"spacer"},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeInning"+index, onChange:"updateScore", value:this.homeScore[index-1] || 0, size:5}
				]};
		} else {
			switch(index) {
				case this.innings+1:
					k = {kind:"VFlexBox", components:[
             				{kind:"com.tiqtech.scorekeeper.Label", text:$L("R"), size:4},
             				{className:"sk-display-wrapper", components:[
                                 {kind:"com.tiqtech.scorekeeper.Display", name:"guestScore", value:0, positions:2, size:5}
                            ]}, 				
             				{className:"spacer"},
             				{className:"sk-display-wrapper", components:[
                                 {kind:"com.tiqtech.scorekeeper.Display", name:"homeScore", value:0, positions:2, size:5}
             				]}
             			]};
					break;
				case this.innings+2:
                 	k = {kind:"VFlexBox", components:[
            			    {kind:"com.tiqtech.scorekeeper.Label", text:$L("H"), size:4},
      	  				    {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestHits", onChange:"updateProperty", value:this.guestHits, positions:2, size:5},
      	  				    {className:"spacer"},
      	  				    {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeHits", onChange:"updateProperty", value:this.homeHits, positions:2, size:5}
        				]};
                 	break;
				case this.innings+3:
                	k = {kind:"VFlexBox", components:[
                   			{kind:"com.tiqtech.scorekeeper.Label", text:$L("E"), size:4},
                            {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestErrors", onChange:"updateProperty", value:this.guestErrors, size:5},
              				{className:"spacer"},
                            {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeErrors", onChange:"updateProperty", value:this.homeErrors, size:5},
              			]};
              		break;
			}
		}
			
		return k;
	},
	homeScoreChanged:function() {
		if(!this.homeScore) {
			this.homeScore = new Array(this.innings);
			for(var i=0;i<this.innings;i++) {
				this.homeScore[i] = 0;
			}
		}
	},
	guestScoreChanged:function() {
		if(!this.guestScore) {
			this.guestScore = new Array(this.innings);
			for(var i=0;i<this.innings;i++) {
				this.guestScore[i] = 0;
			}
		}
	},
	guestHitsChanged:function() {
		this.$.guestHits && this.$.guestHits.setValue(this.guestHits);
	},
	homeHitsChanged:function() {
		this.$.homeHits && this.$.homeHits.setValue(this.homeHits);
	},
	guestErrorsChanged:function() {
		this.$.guestErrors && this.$.guestErrors.setValue(this.guestErrors);
	},
	homeErrorsChanged:function() {
		this.$.homeErrors && this.$.homeErrors.setValue(this.homeErrors);
	},
	ballsChanged:function() {
		this.$.balls.setValue(this.balls);
	},
	strikesChanged:function() {
		this.$.strikes.setValue(this.strikes);
	},
	outsChanged:function() {
		this.$.outs.setValue(this.outs);
	},
	inningChanged:function() {
		this.$.inning.setValue(this.inning);
	},
	updateScore:function(source, value) {
		var score = (source.name.indexOf("home") !== -1) ? "homeScore" : "guestScore";
		var inning = parseInt(source.name.substring(source.name.length-1))-1; // inning index is 1-based
		
		this[score][inning] = value;
		this.updateRuns(score);
	},
	updateRuns:function(score) {
		var sum = 0;
		for(var i=0;i<this[score].length;i++) {
			sum += this[score][i];
		}
		
		this.$[score].setValue(sum);
	}
}

var _FootballBasic = {
	name:"com.tiqtech.scorekeeper.boards.FootballBasic",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:"Football Basic",
	published:{
		homeLabel:$L("Home"),
		homeScore:0,
		guestLabel:$L("Guest"),
		guestScore:0,
		quarter:1,
		down:1,
		toGo:10,
		time:15*60*1000
	},
	components:[
	    {kind:"VFlexBox", components:[
			{kind:"Control", pack:"justify", align:"center", components:[
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", text:$L("Guest"), size:5, width:"5em"},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guest", onChange:"updateProperty", propertyName:"guestScore", positions:2, size:12}
				]},
				{kind:"com.tiqtech.scorekeeper.Clock", name:"clock", onTick:"updateTime", propertyName:"time", onReset:"resetProperty", size:10},
                {components:[
         			{kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", text:$L("Home"), size:5, width:"5em"},
         			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", onChange:"updateProperty", propertyName:"homeScore", name:"home", positions:2, size:12},
         		]}
			]},
			{height:"2em"},
			{kind:"Control", name:"periodBox", className:"period", pack:"justify", align:"center", components:[
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("Quarter"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"quarter", onChange:"updateProperty", min:1, value:1, max:4, size:8},
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("Down"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"down", onChange:"updateProperty", min:1, value:1, max:4, size:8},
				{kind:"com.tiqtech.scorekeeper.Label", text:$L("To Go"), size:4},
				{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"toGo", onChange:"updateProperty", min:1, value:1, positions:2, size:8}
			]}
		]}
	],
	homeScoreChanged:function() {
		this.$.home.setValue(this.homeScore);
	},
	homeLabelChanged:function() {
		this.$.homeLabel.setText(this.homeLabel);
	},
	guestScoreChanged:function() {
		this.$.guest.setValue(this.guestScore);
	},
	guestLabelChanged:function() {
		this.$.guestLabel.setText(this.guestLabel);
	},
	timeChanged:function() {
		this.$.clock.setTime(this.time);
	},
	updateTime:function(source, time) {
		this.time = time;
	},
	quarterChanged:function() {
		this.$.quarter.setValue(this.quarter);
	},
	toGoChanged:function() {
		this.$.toGo.setValue(this.toGo);
	},
	downChanged:function() {
		this.$.down.setValue(this.down);
	}
}

// TODO: Football: fix score saving/loading

var _Football = {
	name:"com.tiqtech.scorekeeper.boards.Football",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:"Football",
	deferResize:true,
	published:{
		homeLabel:$L("Home"),
		homeScore:null,
		guestLabel:$L("Guest"),
		guestScore:null,
		quarter:1,
		down:1,
		toGo:10,
		time:15*60*1000
	},
	components:[
	    {kind:"Control", pack:"center", components:[
	    	{kind:"com.tiqtech.scorekeeper.Clock", name:"clock", onTick:"updateTime", propertyName:"time", onReset:"resetProperty", size:13}
	    ]},
        {kind:"Repeater", layoutKind:"HFlexLayout", pack:"justify", name:"quarters", onSetupRow:"setupQuarter", style:"margin:5em 0em"},
		{kind:"Control", name:"periodBox", className:"period", pack:"justify", align:"center", components:[
			{kind:"com.tiqtech.scorekeeper.Label", text:$L("Quarter"), size:3},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"quarter", onChange:"updateProperty", min:1, value:1, max:4, size:6},
			{kind:"com.tiqtech.scorekeeper.Label", text:$L("Down"), size:3},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"down", onChange:"updateProperty", min:1, value:1, max:4, size:6},
			{kind:"com.tiqtech.scorekeeper.Label", text:$L("To Go"), size:3},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"toGo", onChange:"updateProperty", min:1, value:10, positions:2, size:6}
		]}
	],
	constructor:function() {
		this.inherited(arguments);
		this.homeScore = [];
		this.guestScore = [];
	},
	rendered:function() {
		this.inherited(arguments);
		
		this.deferResize = false;
		this.updateFields("homeScore");
		this.updateFields("guestScore");
		this.resizeHandler();
	},
	homeScoreChanged:function() {
		this.homeScore = this.homeScore || [0,0,0,0,0];
		
		this.updateFields("homeScore");
	},
	guestScoreChanged:function() {
		this.guestScore = this.guestScore || [0,0,0,0,0];
		
		this.updateFields("guestScore");
	},
	timeChanged:function() {
		this.$.clock.setTime(this.time);
	},
	quarterChanged:function() {
		this.$.quarter.setValue(this.quarter);
	},
	toGoChanged:function() {
		this.$.toGo.setValue(this.toGo);
	},
	downChanged:function() {
		this.$.down.setValue(this.down);
	},
	homeLabelChanged:function() {
		this.$.homeLabel && this.$.homeLabel.setText(this.homeLabel);
	},
	guestLabelChanged:function() {
		this.$.guestLabel && this.$.guestLabel.setText(this.guestLabel);
	},
	setupQuarter:function(source, index) {
		if(index === 0) {
			return {components:[
				{kind:"com.tiqtech.scorekeeper.Label", text:"", size:4},
				{kind:"com.tiqtech.scorekeeper.Label", text:this.guestLabel || $L("Guest"), name:"guestLabel", size:3, width:"5em", height:"1.75em"},
				{style:"height:0.5em"},
				{kind:"com.tiqtech.scorekeeper.Label", text:this.homeLabel || $("Home"), name:"homeLabel", size:3, width:"5em", height:"1.75em"}
			]};
		} else if(index < 6) {
			return {components:[
                {kind:"com.tiqtech.scorekeeper.Label", text:(index < 5) ? index : $L("OT"), size:4},
                {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeScore"+index, positions:2, onChange:"scoreChanged", size:6},
                {style:"height:0.5em"},
                {kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestScore"+index, positions:2, onChange:"scoreChanged", size:6}
            ]};	
		} else if(index === 6) {
			return {components:[
                {kind:"com.tiqtech.scorekeeper.Label", text:$L("Score"), size:4},
                {className:"sk-display-wrapper", components:[
                    {kind:"com.tiqtech.scorekeeper.Display", name:"homeScore", positions:2, size:6},
                ]},
                {style:"height:0.5em"},
                {className:"sk-display-wrapper", components:[
                    {kind:"com.tiqtech.scorekeeper.Display", name:"guestScore", positions:2, size:6}
                ]},
            ]};
		}
	},
	scoreChanged:function(source, value) {
		var score = (source.name.indexOf("home") !== -1) ? "homeScore" : "guestScore";
		this.updateScore(score);
	},
	updateTime:function(source, time) {
		this.time = time;
	},
	updateFields:function(score) {
		if(!this.$[score]) return;
		
		this.suppressUpdate = true;
		for(var i=1;i<6;i++) {
			this.$[score+i].setValue(this[score][i-1] || 0);
		}
		this.suppressUpdate = false;
		
		this.updateScore(score);
	},
	updateScore:function(score) {
		if(!this.$[score] || this.suppressUpdate) return;
		
		var total = 0
		for(var i=1;i<6;i++) {
			this[score][i-1] = this.$[score+i].getValue() || 0;
			total += this[score][i-1];
		}
		
		this.$[score].setValue(total);
	}
};

var _TestBoard = {
	name:"com.tiqtech.scorekeeper.boards.TestBoard",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	components:[
        {name:"display", kind:"com.tiqtech.scorekeeper.Display", onflickleft:"flickedLeft", onflick:"flicked"}
    ],
    dragstartHandler:function(e) {
    	this.dragging = true;
    	this.dragPosition = {x:window.event.x,y:window.event.y};

    	enyo.job("dragJob", enyo.bind(this, "cancelFlick"), 250);
    },
    dragfinishHandler:function(e) {
    	if(this.dragging) {
    		enyo.job.stop("dragJob");
    		
    		this.dragging = false;
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
    flickLeft:function() {
    	enyo.log("left!");
    },
    flickRight:function() {
    	enyo.log("right!");
    },
    cancelFlick:function() {
    	this.dragging = false;
    }
};

// TODO: Volleyball Board

var _TennisBasic = {
	name:"com.tiqtech.scorekeeper.boards.TennisBasic",
	kind:"VFlexBox",
	align:"center",
	published:{
		homeLabel:$L("Home"),
		guestLabel:$L("Guest"),
		homeScore:0,
		guestScore:0,
		homeSets:null,
		guestSets:null,
		time:0
	},
	components:[
		{kind:"com.tiqtech.scorekeeper.Clock", propertyName:"time", onReset:"resetProperty", direction:"up"},
		{kind:"Control", components:[
			{kind:"com.tiqtech.scorekeeper.Label", text:$L("Guest"), flex:1},
			{kind:"com.tiqtech.scorekeeper.TennisDisplayCarousel"},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", positions:2},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", positions:2},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", positions:2}
		]},
		{kind:"Control", components:[
			{kind:"com.tiqtech.scorekeeper.Label", text:$L("Home"), flex:1},
			{kind:"com.tiqtech.scorekeeper.TennisDisplayCarousel"},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", positions:2},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", positions:2},
			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", positions:2}
		]},
	]
};

var _TennisDisplayCarousel = {
	name:"com.tiqtech.scorekeeper.TennisDisplayCarousel",
	kind:"com.tiqtech.scorekeeper.DisplayCarousel",
	values:[0,15,30,45,"BR","AD"]
};

var _SoccerBasic = {
	name:"com.tiqtech.scorekeeper.boards.SoccerBasic",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:$L("Soccer Basic"),
	published:{
		homeLabel:$L("Home"),
		homeScore:0,
		guestLabel:$L("Guest"),
		guestScore:0,
		time:0,
		period:1
	},
	config:{
		disableClock:true
	},
	components:[
	    {kind:"VFlexBox", components:[
			{kind:"Control", pack:"justify", align:"center", components:[
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", text:$L("Guest"), size:5, width:"5em"},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guest", onChange:"updateProperty", propertyName:"guestScore", positions:2, size:12}
				]},
				{components:[
					{kind:"com.tiqtech.scorekeeper.Clock", name:"clock", onTick:"updateTime", propertyName:"time", onReset:"resetProperty", size:10, direction:"up"},
					{height:"2em"},
					{kind:"Control", pack:"center", components:[
                        {kind:"com.tiqtech.scorekeeper.Label", name:"periodLabel", text:$L("Period"), size:4, style:"padding-right:1em"},
						{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"periodField", onChange:"updateProperty", propertyName:"period", min:1, value:1, max:2, size:8},
					]},
				]},
                {components:[
         			{kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", text:$L("Home"), size:5, width:"5em"},
         			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", onChange:"updateProperty", propertyName:"homeScore", name:"home", positions:2, size:12},
         		]}
			]}
		]},
	],
	homeScoreChanged:function() {
		this.$.home.setValue(this.homeScore);
	},
	homeLabelChanged:function() {
		this.$.homeLabel.setText(this.homeLabel);
	},
	guestScoreChanged:function() {
		this.$.guest.setValue(this.guestScore);
	},
	guestLabelChanged:function() {
		this.$.guestLabel.setText(this.guestLabel);
	},
	periodChanged:function() {
		this.$.periodField.setValue(this.period);
	},
	timeChanged:function() {
		this.$.clock.setTime(this.time);
	},
	updateTime:function(source, time) {
		this.time = time;
	}
};

var _Soccer = {
	name:"com.tiqtech.scorekeeper.boards.Soccer",
	kind:"com.tiqtech.scorekeeper.Scoreboard",
	title:$L("Soccer"),
	published:{
		homeLabel:$L("Home"),
		homeScore:0,
		homeShots:0,
		homeCorner:0,
		guestLabel:$L("Guest"),
		guestScore:0,
		guestShots:0,
		guestCorner:0,
		time:0,
		period:1
	},
	config:{
		disableClock:true
	},
	components:[
	    {kind:"VFlexBox", components:[
			{kind:"Control", pack:"justify", align:"center", components:[
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", name:"guestLabel", text:$L("Guest"), size:5, width:"5em"},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guest", onChange:"updateProperty", propertyName:"guestScore", positions:2, size:12}
				]},
				{kind:"com.tiqtech.scorekeeper.Clock", name:"clock", onTick:"updateTime", propertyName:"time", onReset:"resetProperty", size:10, direction:"up"},
                {components:[
         			{kind:"com.tiqtech.scorekeeper.Label", name:"homeLabel", text:$L("Home"), size:5, width:"5em"},
         			{kind:"com.tiqtech.scorekeeper.DisplayCarousel", onChange:"updateProperty", propertyName:"homeScore", name:"home", positions:2, size:12},
         		]}
			]},
			{height:"2em"},
			{kind:"Control", name:"bottomWrapper", pack:"justify", align:"center", style:"margin-top:1em", components:[
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", text:$L("Shots"), size:4},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeShots", positions:2, onChange:"updateProperty", size:8},
				]},
				{kind:"Spacer"},
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", text:$L("C Kicks"), size:4},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"homeCorner", onChange:"updateProperty", size:8, positions:2},
				]},
				{kind:"Spacer"},
				{components:[
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"periodField", onChange:"updateProperty", propertyName:"period", min:1, value:1, max:2, size:8, style:"display:block;margin:0px auto;"},
					{kind:"com.tiqtech.scorekeeper.Label", name:"periodLabel", text:$L("Period"), size:4},
				]},
				{kind:"Spacer"},
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", text:$L("C Kicks"), size:4},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestCorner", onChange:"updateProperty", size:8, positions:2},
				]},
				{kind:"Spacer"},
				{components:[
					{kind:"com.tiqtech.scorekeeper.Label", text:$L("Shots"),  size:4},
					{kind:"com.tiqtech.scorekeeper.DisplayCarousel", name:"guestShots", positions:2, onChange:"updateProperty", size:8},
				]}
			]},
		]},
	],
	homeScoreChanged:function() {
		this.$.home.setValue(this.homeScore);
	},
	homeLabelChanged:function() {
		this.$.homeLabel.setText(this.homeLabel);
	},
	homeShotsChanged:function() {
		this.$.homeShots.setValue(this.homeShots);
	},
	homeCornerChanged:function() {
		this.$.homeCorner.setValue(this.homeCorner);
	},
	guestScoreChanged:function() {
		this.$.guest.setValue(this.guestScore);
	},
	guestLabelChanged:function() {
		this.$.guestLabel.setText(this.guestLabel);
	},
	guestShotsChanged:function() {
		this.$.guestShots.setValue(this.guestShots);
	},
	guestCornerChanged:function() {
		this.$.guestCorner.setValue(this.guestCorner);
	},
	periodChanged:function() {
		this.$.periodField.setValue(this.period);
	},
	timeChanged:function() {
		this.$.clock.setTime(this.time);
	},
	updateTime:function(source, time) {
		this.time = time;
	}
};

enyo.kind(_Boards);
enyo.kind(_Scoreboard);
enyo.kind(_BasicWithTimer);
enyo.kind(_Basic);
enyo.kind(_Basketball);
enyo.kind(_BasketballBasic);
enyo.kind(_BaseballBasic);
enyo.kind(_BaseballFull);
enyo.kind(_FootballBasic);
enyo.kind(_Football);
//enyo.kind(_TestBoard);
enyo.kind(_SoccerBasic);
enyo.kind(_Soccer);
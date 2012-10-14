var _App = {
	name:"com.tiqtech.scorekeeper.App",
	kind:"Control",
	savedBoardIndex:-1,
	components:[
	    {kind: "Toolbar", className:"sk-page-header", layoutKind:"HFlexLayout", pack:"justify", components:[
            {kind:"Image", name:"back", className:"back-button  enyo-input enyo-tool-input", src:"app/images/backarrow.png", onclick:"back", showing:false},
            {kind:"Image", className:"title-image enyo-input enyo-tool-input", src:"app/images/title.png"},
            {kind:"Image", name:"help", className:"help-button enyo-input enyo-tool-input", src:"app/images/helpbutton.png", onclick:"helpClicked"},
	    ]},
	    {kind:"SlidingPane", name:"slidingPane", className:"content-pane", fit:true, onSelectView:"slidingViewSelected", components:[
            {width:"224px", layoutKind:"VFlexLayout", name:"savedGamePane", components:[
                {kind:"RowItem", name:"newGameRow", onclick:"newClicked", showing:false, tapHighlight:true, layoutKind:"HFlexLayout", className:"menu-header", components:[
                    {content:"New Game", flex:1},
                    {kind:"Image", src:"app/images/forwardarrow.png"}
                ]},
                {kind:"RowItem", name:"continueGameRow", onclick:"continueCurrentBoard", tapHighlight:true, layoutKind:"HFlexLayout", showing:false, className:"menu-header", components:[
                    {content:"Continue Game", flex:1},
                    {kind:"Image", src:"app/images/forwardarrow.png"}
                ]},
				{kind:"RowItem", content:"Saved Games", className:"menu-header dark"},
				{kind:"FadeScroller", flex:1, components:[
                    {kind:"RowItem", name:"noSavedGamesMessage", content:"No saved games!", style:"background:rgba(255,255,255,0.25);font-style:italic;text-align:center;font-size:smaller"},
					{kind:"VirtualRepeater", name:"savedGameList", onSetupRow:"setupGameRow", components:[
	                    {kind:"SwipeableItem", name:"savedGameRow", tapHighlight:true, onclick:"loadSavedBoard", onConfirm:"removeSavedBoard", className:"save-game", components:[
	                        {name:"savedGameTitle", className:"title"},
	                        {name:"savedGameTime", className:"time", onclick:"timeClicked"}
	                        	
	                    ]}
		            ]}
				]}
			]},
			{name:"contentPane", dragAnywhere:false, layoutKind:"VFlexLayout", components:[
			    {kind:"Pane", name:"pane", flex:1, transitionKind:"enyo.transitions.Simple", onSelectView:"viewSelected", components:[
			        {kind:"com.tiqtech.scorekeeper.ScoreboardGrid", name:"grid", width:"100%", onSelect:"newBoard", onConfigure:"configureBoard"},
			        {kind:"Control", name:"board"}
			    ]},
			    {kind:"Toolbar", className:"sk-toolbar", components: [
     			    {kind:"Image", slidingHandler: true, src: "app/images/drag-handle.png"},
     			    {kind:"ToolInput", name:"boardTitle", selectAllOnFocus:true, showing:false},
     			    {kind:"ToolButton", name:"saveButton", caption:"Save", onclick:"saveBoard", showing:false},
     			    {kind:"Spacer"},
     			    {kind:"ToolButton", name:"resetButton", caption:"Reset", onclick:"resetClicked", showing:false},
     			]}
			]},
		]},
		{kind:"Sound", name:"sound", src:"app/audio/buzzer1.mp3"},
		{kind:"com.tiqtech.scorekeeper.Preferences", name:"prefs", onClose:"prefsClosed"},
		{kind:"com.tiqtech.scorekeeper.About", name:"about"},
		{kind:"com.tiqtech.scorekeeper.Help", name:"helpPopup"},
		{kind:"com.tiqtech.scorekeeper.ConfigToaster", name:"config", onStart:"startCustomBoard"},
		{kind:"com.tiqtech.scorekeeper.Boards", name:"list"},
		{kind:"com.tiqtech.scorekeeper.PrefService", name:"ps", onLoad:"prefsReady"},
		{kind:"AppMenu", name:"appMenu", components:[
			{caption:enyo._$L("Preferences"), onclick:"show", view:"prefs"},
			{caption:enyo._$L("About"), onclick:"show", view:"about"}
		]}
	],
	create:function() {
		this.inherited(arguments);
		this.$.grid.setBoards(this.$.list.getBoards());
		
		var di = enyo.fetchDeviceInfo();
		this.isPhone = (di && di.screenWidth < 500);
		
		enyo.setAllowedOrientation((this.isPhone) ? "left" : "landscape");
	},
	rendered:function() {
		this.inherited(arguments);
		if(!this.$.slidingPane.getMultiView()) {
			this.$.newGameRow.show();
		}
	},
	selectView:function(view) {
		if(!(this.$.slidingPane.getMultiView() && view === this.$.contentPane)) {
			this.$.slidingPane.selectView(view);
		}
	},
	showBoard:function(board) {
		
		this.$.board.destroyControls();
		this.$.board.createComponent(enyo.mixin({name:"scoreboard", owner:this, pack:"center", align:"center", onExpiration:"clockExpired", color:this.$.ps.getBoardColor()}, board));
		this.$.board.render();
		
		enyo.call(this.$.board, "resize");
		
		this.$.pane.selectView(this.$.board);
		this.$.boardTitle.setValue(board.title);
		
		this.selectView(this.$.contentPane);
	},
	configureBoard:function(source, board) {
		this.$.config.setBoard(board);
		this.$.config.open();
		this.$.config.focus();
	},
	startCustomBoard:function(source, board) {
		
		this.$.config.close();
		this.selectSavedBoardRow(-1);
		
		this.showBoard(board);
	},
	newBoard:function(source, board) {
		this.selectSavedBoardRow(-1);

		var config = this.$.ps.getBoardConfig(board.kind);
		enyo.mixin(board, config);
		board.config = config;
		this.showBoard(board);
	},
	loadSavedBoard:function(source, event) {
		var b = this.$.ps.getBoards()[event.rowIndex];
		if(!b) return; // shouldn't occur
		
		b = enyo.json.parse(b);
		this.showBoard(b);
		
		this.selectSavedBoardRow(event.rowIndex);
	},
	continueCurrentBoard:function(source, event) {
		if(!this.currentBoard) return; // shouldn't occur
		
		this.showBoard(this.currentBoard)
	},
	saveBoard:function(source, event) {
		if(this.$.pane.getView() !== this.$.board) return; // shouldn't occur
		
		var b = this.$.scoreboard.serialize();
		b.title = this.$.boardTitle.getValue();
		if(this.savedBoardIndex !== -1) {
			this.$.ps.getBoards().splice(this.savedBoardIndex, 1);
		}
		
		this.$.ps.addBoard(b);
		this.savedBoardIndex = 0;
		this.$.savedGameList.render();
		
		enyo.windows.addBannerMessage(b.title + " saved!", '{action:"notification", reason:"save"}');
	},
	removeSavedBoard:function(source, event) {
		var b = this.$.ps.getBoards();
		b.splice(event.rowIndex, 1);
		this.$.ps.setBoards(b);
		
		this.$.savedGameList.render();
	},
	selectSavedBoardRow:function(index) {
		if(this.savedBoardIndex !== -1) {
			var x = this.savedBoardIndex;
			this.savedBoardIndex = -1;
			this.$.savedGameList.renderRow(x);
		}
		
		if(index !== -1) {
			this.savedBoardIndex = index;
			this.$.savedGameList.renderRow(index);
		}
	},
	openAppMenuHandler: function() {
		this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
		this.$.appMenu.close();
	},
	show:function(source) {
		this.$.prefs.close();
		this.$.about.close();
		
		if(source.view) {
			this.$[source.view].openAtCenter();
		}
	},
	helpClicked:function(source, event) {
		this.$.helpPopup.open();
	},
	newClicked:function() {
		this.$.pane.selectView(this.$.grid);
		this.selectView(this.$.contentPane);
		
		if(this.$.pane.getView() === this.$.board) {
			this.currentBoard = this.$.scoreboard.serialize();
		}
	},
	back:function(source, event) {
		this.$.pane.back();
	},
	slidingViewSelected:function(source, index) {
		var isSingle = !this.$.slidingPane.getMultiView();
		var isBoard = this.$.pane.getView() === this.$.board;
		var isMenu = this.$.slidingPane.getView() === this.$.savedGamePane;
		
		this.$.continueGameRow.setShowing(isMenu && !isBoard && this.currentBoard);
		this.$.newGameRow.setShowing( isSingle || isBoard);
	},
	prefsReady:function() {
		this.$.savedGameList.render();
		
		this.broadcastMessage("prefsChanged");
	},
	viewSelected:function(source, view) {
		var isBoard = view !== this.$.grid;
		
		this.$.back.setShowing(isBoard);
		this.$.newGameRow.setShowing(isBoard);
		this.$.continueGameRow.setShowing(!isBoard);
		this.$.saveButton.setShowing(isBoard);
		this.$.resetButton.setShowing(isBoard);
		this.$.boardTitle.setShowing(isBoard);
	},
	setupGameRow:function(source, index) {
		var boards = this.$.ps.getBoards();
		var board = boards[index];
		
		// show or hide based on existence of saved games and current showing state
		if(boards.length > 0 && this.$.noSavedGamesMessage.getShowing()) {
			this.$.noSavedGamesMessage.hide();
		} else if(boards.length === 0 && !this.$.noSavedGamesMessage.getShowing()) {
			this.$.noSavedGamesMessage.show();
		}
		
		if(board) {
			board = enyo.json.parse(board);
			this.$.savedGameRow.addRemoveClass("enyo-held", index === this.savedBoardIndex);
			this.$.savedGameTitle.setContent(board.title);
			
			var dt = new Date(board.__saveDate);
			this.toggleTimeView(dt, true);
			return true;
		}
	},
	timeClicked:function(source, event) {
		var b = enyo.json.parse(this.$.ps.getBoards()[event.rowIndex]);
		this.toggleTimeView(new Date(b.__saveDate));
		event.stopPropagation();
	},
	toggleTimeView:function(date, forceRelative) {
		var df = new enyo.g11n.DateFmt({time:"short", date:"short"});
		var dtString;
		
		if(forceRelative || this.$.savedGameTime.currentDisplay === "absolute") {
			dtString = df.formatRelativeDate(date);
			
			// reformat times from today
			if(dtString === df.dateTimeHash.relative.today) {
				var diff = new Date().getTime() - date.getTime();
				if(diff < 60000) {
					dtString = Math.round(diff/1000) + $L(" seconds ago");
				} else if(diff < 3600000) {
					dtString = Math.round(diff/60000) + $L(" minutes ago");
				} else {
					dtString = Math.round(diff/3600000) + $L(" hours ago");
				}
			}
			
			this.$.savedGameTime.currentDisplay = "relative";
		} else {
			this.$.savedGameTime.currentDisplay = "absolute";
			dtString = df.format(date);
		}
		
		this.$.savedGameTime.setContent(dtString)
	},
	resetClicked:function(source, event) {
		this.$.scoreboard.reset();
	},
	clockExpired:function() {
		this.$.sound.play();
	},
	prefsClosed:function() {
		this.broadcastMessage("prefsChanged");
	},
	prefsChangedHandler:function() {
		enyo.log("prefsChangedHandler");
		
		this.$.sound.setSrc(this.$.ps.getBuzzer());
		if(this.$.scoreboard) {
			this.$.scoreboard.setColor(this.$.ps.getBoardColor());
		}
	}
}

var _BoardIcon = {
	name:"com.tiqtech.scorekeeper.BoardIcon",
	kind:"Control",
	className:"board-icon",
	published:{
		board:null
	},
	events:{
		onStart:"",
		onConfigure:""
	},
	components:[
	    {kind:"Control", name:"wrapper", className:"wrapper", components:[
            {kind:"Control", name:"header", className:"header"}
        ]},
        {kind:"IconButton", className:"configure", icon:"app/images/configure.png", onclick:"configureClicked"},
        //{kind:"IconButton", className:"start enyo-button-affirmative", icon:"app/images/startbutton.png", onclick:"startClicked"}
	],
	create:function() {
		this.inherited(arguments);
		this.boardChanged();
	},
	boardChanged:function() {
		this.$.wrapper.applyStyle("background-image", "url(boards/images/preview/"+this.board.kind+".png)");
		this.$.header.setContent(this.board.title);
	},
	configureClicked:function(source, event) {
		this.doConfigure(this.board);
		event.stopPropagation();
	},
	clickHandler:function() {
		this.doStart(this.board);
	}
};

var _BoardGrid = {
	name:"com.tiqtech.scorekeeper.ScoreboardGrid",
	className:"sk-scoreboard-grid",
	kind:"FadeScroller",
	horizontal:false,
	published:{
		boards:[]
	},
	events:{
		onSelect:"",
		onConfigure:""
	},
	components:[
	     {kind:"extras.SquareGrid", name:"grid", minSize:150, maxSize:225, margin:5, onSizeChanged:"sizeChanged"},
	     {kind:"ApplicationEvents", onWindowRotated:"windowRotated"}		
	],
	create:function() {
		this.inherited(arguments);
		this.boardsChanged();
		this.$.grid.positionControls();
		this.windowRotated();
	},
	sizeChanged:function(source, size) {
		for(var c, i=0,controls=this.$.grid.getControls();c=controls[i];i++) {
			c.applyStyle("height", size-15 + "px");
			c.applyStyle("width", size-15 + "px");
		}
	},
	boardsChanged:function() {
		var c = [];
		for(var i=0;i<this.boards.length;i++) {
			c.push({board:this.boards[i]});
		}
		
		this.$.grid.createComponents(c, {kind:"com.tiqtech.scorekeeper.BoardIcon", onStart:"doSelect", onConfigure:"doConfigure", owner:this});
	},
	windowRotated:function(source, e) {
		this.log("windowRotated");
		this.$.grid.resizeHandler();
	}
};

var _Preferences = {
	name:"com.tiqtech.scorekeeper.Preferences",
	kind:"Popup",
	width:"75%",
	height:"75%",
	preventContentOverflow:false,
	scrim:true,
	components:[
		{kind:"Toolbar", pack:"start", align:"center", components:[
            {kind:"Control", flex:1, components:[
                {kind:"Image", name:"back", className:"back-button enyo-input enyo-tool-input", src:"app/images/backarrow.png", onclick:"backClicked", style:"margin-top:3px"},
            ]},
			{kind:"Control", flex:4, content:$L("Preferences"), className:"title"},
			{kind:"Spacer"}
			
	    ]},
	    {kind:"RowGroup", caption:$L("General"), components:[
		    {kind:"RowItem", layoutKind:"HFlexLayout", style:"padding:5px", components:[
				{kind:"ListSelector", name:"buzzer", label:$L("Buzzer"), onChange:"buzzerChanged", flex:1, items:[
					{caption:$L("Buzzer 1"), value:"app/audio/buzzer1.mp3"},
					{caption:$L("Buzzer 2"), value:"app/audio/buzzer2.mp3"},
					{caption:$L("Bell 1"), value:"app/audio/bell1.mp3"},
					{caption:$L("None"), value:null}
				]},
				{kind:"ToolButton", name:"play", caption:$L("Play"), onclick:"playClicked"}
			]},
			{kind:"RowItem", components:[
				{kind:"ListSelector", name:"boardColor", label:$L("Board Color"), onChange:"boardColorChanged", flex:1, items:[
					{caption:$L("Blue"), value:"bg-blue"},
					{caption:$L("Red"), value:"bg-red"},
					{caption:$L("Green"), value:"bg-green"},
					{caption:$L("Orange"), value:"bg-orange"},
					{caption:$L("Black"), value:"bg-black"}
				]},
			]}
		]},
		{kind:"com.tiqtech.scorekeeper.PrefService", name:"ps", onLoad:"prefsReady", className:"enyo-tool-button"},
		{kind:"Sound", name:"sound"}
	],
	prefsReady:function() {
		this.$.buzzer.setValue(this.$.ps.getBuzzer());
		this.$.boardColor.setValue(this.$.ps.getBoardColor());
	},
	buzzerChanged:function(source, value) {
		this.$.play.setDisabled(value === null);
		
		this.$.ps.setBuzzer(value);
	},
	boardColorChanged:function(source, value) {
		this.$.ps.setBoardColor(value);
	},
	backClicked:function() {
		this.close();
	},
	playClicked:function() {
		var src = this.$.ps.getBuzzer();
		this.$.sound.setSrc(src);
		this.$.sound.play();
	}
};

var _About = {
	name:"com.tiqtech.scorekeeper.About",
	kind:"Popup",
	layoutKind:"VFlexLayout",
	width:"75%",
	height:"75%",
	preventContentOverflow:false,
	scrim:true,
	components:[
	    {kind:"Toolbar", pack:"start", align:"center", components:[
            {kind:"Control", flex:1, components:[
                {kind:"Image", name:"back", className:"back-button enyo-input enyo-tool-input", src:"app/images/backarrow.png", onclick:"backClicked", style:"margin-top:3px"},
            ]},
			{kind:"Control", flex:4, content:$L("About Score Keeper"), className:"title"},
			{kind:"Control", flex:1, style:"text-align:right;font-size:0.75em", content:"version 1.0"}
			
	    ]},
	    {kind:"BasicScroller", flex:1, style:"margin:0px -12px -12px -12px; -webkit-border-radius:0px 0px 10px 10px;", components:[
	        {components:[
			    {kind:"HtmlContent", srcId:"about", className:"about-content", onLinkClick:"linkClicked"}
		    ]}
	    ]}
	],
	backClicked:function() {
		this.close();
	},
	linkClicked:function(source, url) {
		window.open(url, "_blank");
	}
};


var _Help = {
	name:"com.tiqtech.scorekeeper.Help",
	kind:"Toaster",
	className:"enyo-toaster help-toaster",
	width:"324px",
	height:"100%",
	flyInFrom:"right",
	components:[
	    {className:"enyo-sliding-view-shadow"},
	    {kind:"Toolbar", pack:"start", align:"center", components:[
            {kind:"Control", flex:1, components:[
                {kind:"Image", name:"back", className:"back-button enyo-input enyo-tool-input", src:"app/images/forwardarrow.png", onclick:"backClicked", style:"margin-top:3px"},
            ]},
			{kind:"Control", flex:4, content:$L("Help"), className:"title"},
			{kind:"Spacer"}
			
	    ]},
	    {kind:"Scroller", style:"padding:5px;", components:[
		    {content:"To add:"},
		    {kind:"Control", components:[
		        {className:"help-display", components:[
	                {kind:"Image", src:"app/images/singletap.png", className:"gesture"},
	            ]},
	            {content:"OR", style:"line-height:55px;margin:0px 5px;"},
	            {className:"help-display", components:[
	                {kind:"Image", src:"app/images/swipeleft.png", className:"gesture"}
	            ]},
            ]},
		    {content:"To subtract:"},
	        {className:"help-display", components:[
                {kind:"Image", src:"app/images/swiperight.png", className:"gesture"}
            ]},
		    {content:"To set the value:"},
	        {className:"help-display", components:[
                {kind:"Image", src:"app/images/taphold.png", className:"gesture"}
            ]},
	    ]}
	],
	backClicked:function() {
		this.close();
	},
	
};

var _SKPrefs = {
    name:"com.tiqtech.scorekeeper.PrefService",
    kind:"extras.AutoPreferencesService",
    published:{
    	boards:null,
    	configDefaults:null,
    	buzzer:"app/audio/buzzer1.mp3",
    	boardColor:"bg-blue"
    },
    create:function() {
    	this.inherited(arguments);
    	this.boards = [];
    	this.configDefaults = {};
    },
    addBoard:function(b) {
    	b.__saveDate = new Date();
    	this.boards.unshift(enyo.json.stringify(b));
    	this.setBoards(this.boards);
    },
    getBoardConfig:function(kind) {
    	return this.configDefaults[kind] || {};
    }
}

var _ConfigToaster = {
	name:"com.tiqtech.scorekeeper.ConfigToaster",
	kind:"Control", 
	flyInFrom:"top",
	width:"500px",
	scrim:true,
	className:"enyo-toaster configure-toaster",
	published:{
		board:null
	},
	events:{
		onStart:""
	},
	components:[
	    {className:"toaster-content", components:[
	        {kind:"RowGroup", name:"configClient", components:[
				{kind:"Input", name:"homeLabel", selectAllOnFocus:true, alwaysLooksFocused:true, components:[{content:$L("Home Label"), className:"enyo-label"}]},
				{kind:"Input", name:"guestLabel", selectAllOnFocus:true, alwaysLooksFocused:true, components:[{content:$L("Guest Label"), className:"enyo-label"}]},
				{kind:"RowItem", name:"durationRow", layoutKind:"HFlexLayout", align:"center", components:[
				    {kind:"IntegerPicker", name:"duration", min:0, max:99, label:"", flex:1, style:"margin:-8px 0px"},
					{content:$L("Duration (minutes)"), className:"enyo-label"}
				]},
				{kind:"RowItem", layoutKind:"HFlexLayout", components:[
					{content:$L("Set as Default"), flex:1},
					{kind:"ToggleButton", name:"useAsDefaults"}
				]}
	        ]},
	        {kind:"FittableColumns", pack:"center", components:[
	            {kind:"Button", className:"enyo-button-gray", caption:$L("Cancel"), onclick:"cancelClicked"},
	            {kind:"IconButton", className:"enyo-button-affirmative", _icon:"app/images/startbutton.png", caption:$L("Start"), onclick:"startClicked"},
	        ]}
	    ]},
	    {kind:"com.tiqtech.scorekeeper.PrefService", name:"prefs", onLoad:"prefsLoaded"}
	],
	create:function() {
		this.inherited(arguments);
	},
	doOpen:function() {
		if(this.prefsReady) {
			this.prefsLoaded();
		}
		
		this.inherited(arguments);
	},
	prefsLoaded:function() {
		this.prefsReady = true;
		
		var def = this.$.prefs.getConfigDefaults();
		
		if(this.board && def[this.board.kind]) {
			this.setFieldValues(def[this.board.kind]);
			this.usingDefaults = true;
		}
		
		this.$.useAsDefaults.setState(false);
	},
	boardChanged:function() {
		if(!this.board || !this.hasNode()) return;
		
		var ctor = enyo.constructorForKind(this.board.kind);
		this.$.configClient.setCaption(ctor.prototype.title);
		
		this.setFieldValues(ctor.prototype);
	},
	setFieldValues:function(o) {
		this.$.homeLabel.setValue(o.homeLabel);
		this.$.guestLabel.setValue(o.guestLabel);
		
		if(typeof(o.time) !== "undefined" && !(o.config && o.config.disableClock)) {
			this.$.duration.setValue(o.time/60000);
			this.$.configClient.showRow(2);
		} else {
			this.$.configClient.hideRow(2);
		}
	},
	rendered:function() {
		this.inherited(arguments);

		this.boardChanged();
	},
	serialize:function() {
    	return {
    		homeLabel:this.$.homeLabel.getValue(),
    		guestLabel:this.$.guestLabel.getValue(),
    		time:(this.$.durationRow.getShowing()) ? parseInt(this.$.duration.getValue())*60000 : undefined
    	};
    },
    startClicked:function() {
    	var c = this.serialize();
    	var b = enyo.mixin(this.board, c);
    	b.config = c;
    	
    	if(this.$.useAsDefaults.getState()) {
    		var def = this.$.prefs.getConfigDefaults();
    		def[this.board.kind] = c;
    		this.$.prefs.setConfigDefaults(def);
    	}
    	
    	this.doStart(b);
    },
    cancelClicked:function() {
    	this.close();
    },
    focus:function() {
		this.$.homeLabel.forceFocus();
    }
}

enyo.kind(_ConfigToaster);
enyo.kind(_SKPrefs);
enyo.kind(_App);
enyo.kind(_Preferences);
enyo.kind(_About);
enyo.kind(_Help	);
enyo.kind(_BoardIcon);
enyo.kind(_BoardGrid);
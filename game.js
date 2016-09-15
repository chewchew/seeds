
///////////////////////////////////////////////////////////////
// Data
///////////////////////////////////////////////////////////////
var Game = { 
	'fps' : 50,
	'seeds' : 100
};

Game.initMenuItems = function() {
	Game.menuItems = {
		"Seeds" : (() => { return Game.seeds; }),
	};
}

Game.getMenuItemValue = function(menuItem) {
	return Game.menuItems[menuItem]();
}

Game.getMenuItemHTML = function(menuItem) {
	menuItemValue = Game.getMenuItemValue(menuItem);
	return "<li id=" + menuItem + " value=" + menuItemValue + ">" 
		+ menuItem + ": " + menuItemValue + "</li>"
}

///////////////////////////////////////////////////////////////
// Initialize with GUI
///////////////////////////////////////////////////////////////
Game.clickEvent = function(e) {
	x = Game.hexgrid.getLocalX(e.pageX);
	y = Game.hexgrid.getLocalY(e.pageY);
	tile = Game.hexgrid.getSelectedTile(x,y);

	if (Game.seeds > 0 && !Game.hexgrid.isMarked(tile)) {
		Game.hexgrid.markTile(tile);
		Game.seeds -= 1;
	}
}

Game.initCanvas = function(hexgrid,canvas) {
	Game.hexgrid = hexgrid;
	canvas.click(Game.clickEvent);
};

Game.initMenu = function(menu) {
	Game.menu = menu;
	var list = Game.menu.append("<ul></ul>");
	for (var menuItem in Game.menuItems) {
		list.append(Game.getMenuItemHTML(menuItem));
	}
};

///////////////////////////////////////////////////////////////
// Main Initialization
///////////////////////////////////////////////////////////////
Game.init = function(hexgrid,menu,canvas) {
	Game.initCanvas(hexgrid,canvas);
	Game.initMenuItems();
	Game.initMenu(menu);
};

///////////////////////////////////////////////////////////////
// Game Logic
///////////////////////////////////////////////////////////////
Game.update = function() {
	var markedTiles = Game.hexgrid.getMarkedTiles();
	for (var i = 0; i < markedTiles.length; i++) {
		var tile = markedTiles[i];
		if (tile.seeds > 0) {
		    var tick = Game.hexgrid.growTile(tile);
		    if (tick) {
		    	var neighbours = Game.hexgrid.getNeighbours(tile);
		    	var randi = Math.floor(Math.random() * neighbours.length);
		    	if (Game.hexgrid.markTile(neighbours[randi])) {
		    		tile.seeds -= 1;
		    	}
		    }
		}
	};
};

Game.drawMenu = function() {
	for (var menuItem in Game.menuItems) {
		var menuItemDOM = $("#"+menuItem);
		menuItemValue = Game.getMenuItemValue(menuItem);
		if (menuItemDOM.val() != menuItemValue) {
			menuItemDOM.replaceWith(Game.getMenuItemHTML(menuItem));
		}
	};
}

Game.drawTiles = function() {
	markedTiles = Game.hexgrid.getMarkedTiles();
	for (var i = 0; i < markedTiles.length; i++) {
	    Game.hexgrid.drawTile(markedTiles[i]);
	};
};

Game.draw = function() {
	Game.drawMenu();
	Game.drawTiles();
};

Game.run = function() {
	Game.update();
	Game.draw();
};

function gameloop(hexgrid,menu,canvasId) {
	Game.init(hexgrid,menu,$("#"+canvasId));

	// Start the game loop
	Game._intervalId = setInterval(Game.run, 1000 / Game.fps);

	// To stop the game, use the following:
	// clearInterval(Game._intervalId);
};


function setupGrid(canvasId,rows,cols) {
	var hexagonGrid = new HexagonGrid(canvasId, 10);
    hexagonGrid.drawHexGrid(rows, cols, 50, 50, false);
    return hexagonGrid;
}

function setupMenu(canvasId) {
	var wrap = $('#wrap');
    var menu = $('#menu');
    var canvas = $('#'+canvasId);

    menu.width(wrap.width() - canvas.width());
    menu.height(wrap.height());

    return menu;
}

$(document).ready(function () {
	var canvasId = "HexCanvas";

	grid = setupGrid(canvasId,30,50);
	menu = setupMenu(canvasId);

	gameloop(grid,menu,canvasId);
});
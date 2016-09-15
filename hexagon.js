// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

function HexagonGrid(canvasId, radius) {
    this.radius = radius;

    this.height = Math.sqrt(3) * radius;
    this.width = 2 * radius;
    this.side = (3 / 2) * radius;

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvasOriginX = 0;
    this.canvasOriginY = 0;
    
    this.tileColor = "#111111";
    this.tileColorInt = parseInt("0x"+this.tileColor.substring(1));
    this.tileMarkedColor = "#ffffff";
    
    this.dGrowth = 0x010101;
    this.growthCap = 0x202020;
    // this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
};

HexagonGrid.prototype.getDGrowth = function() {
    dGrowth = this.dGrowth + (0x010101 * this.marked.tiles.length);
    if (dGrowth > this.growthCap) {
        dGrowth = this.growthCap;
    }
    return dGrowth;
};

HexagonGrid.prototype.drawHexGrid = function (rows, cols, originX, originY, isDebug) {
    this.canvas.height = originY + rows*this.height + this.height / 2 + this.context.lineWidth;
    this.canvas.width = originX + cols*this.width;

    this.canvasOriginX = originX;
    this.canvasOriginY = originY;

    this.nrows = rows;
    this.ncols = cols;
    
    this.marked = {
        isMarked : [],
        tiles : [],
    };

    this.tiles = [];

    var currentHexX;
    var currentHexY;
    var debugText = "";

    var offsetColumn = false;

    for (var col = 0; col < cols; col++) {
        this.marked.isMarked.push([]);
        this.tiles.push([]);
        for (var row = 0; row < rows; row++) {

            if (!offsetColumn) {
                currentHexX = (col * this.side) + originX;
                currentHexY = (row * this.height) + originY;
            } else {
                currentHexX = col * this.side + originX;
                currentHexY = (row * this.height) + originY + (this.height * 0.5);
            }

            if (isDebug) {
                debugText = col + "," + row;
            }

            this.drawHex(currentHexX, currentHexY, this.tileColor, debugText);

            this.marked.isMarked[col].push(false);
            this.tiles[col].push(this.constructTile(col,row));
        }
        offsetColumn = !offsetColumn;
    }
};

HexagonGrid.prototype.getCenter = function(tile) {
    var x = this.canvasOriginX + this.side * tile.column + this.width / 2;
    var y = tile.column % 2 == 0 ? (tile.row * this.height) + this.canvasOriginY : (tile.row * this.height) + this.canvasOriginY + (this.height / 2);
    y += this.height / 2;
    return [x,y];
}

HexagonGrid.prototype.drawHexAtColRow = function(column, row, color) {
    var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);
    var drawx = (column * this.side) + this.canvasOriginX;

    this.drawHex(drawx, drawy, color, "");
};

HexagonGrid.prototype.drawTile = function(tile) {
    isMarked = this.isMarked(tile);
    color = isMarked ? tile.color : this.tileColor;
    this.drawHexAtColRow(tile.column,tile.row,color);
    if (isMarked) {
        this.drawMarkedTile(tile);
    }
};

HexagonGrid.prototype.drawMarkedTile = function(tile) {
    var draw = this.getCenter(tile);
    var drawx = draw[0];
    var drawy = draw[1];
    this.context.beginPath();
    this.context.arc(drawx,drawy,this.width/4,0,2*Math.PI);
    this.context.fillStyle = "#000";
    this.context.fill();
    this.context.closePath();
    this.context.stroke();
};

HexagonGrid.prototype.growTile = function(tile) {
    toInt = parseInt("0x"+tile.color.substring(1)) - this.getDGrowth();
    if (toInt > this.tileColorInt) {
        toStr = "#" + toInt.toString(16);
        tile.color = toStr;
        return false;
    } else {
        tile.color = this.tileMarkedColor;
        return true;
    }
};

HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText) {
    this.context.strokeStyle = "#1ec503";
    this.context.beginPath();
    this.context.moveTo(x0 + this.width - this.side, y0);
    this.context.lineTo(x0 + this.side, y0);
    this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
    this.context.lineTo(x0 + this.side, y0 + this.height);
    this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
    this.context.lineTo(x0, y0 + (this.height / 2));

    if (fillColor) {
        this.context.fillStyle = fillColor;
        this.context.fill();
    }

    this.context.closePath();
    this.context.stroke();

    if (debugText) {
        this.context.font = "8px";
        this.context.fillStyle = "#000";
        this.context.fillText(debugText, x0 + (this.width / 2) - (this.width/4), y0 + (this.height - 5));
    }
};

//Recusivly step up to the body to calculate canvas offset.
HexagonGrid.prototype.getRelativeCanvasOffset = function() {
	var x = 0, y = 0;
	var layoutElement = this.canvas;
    if (layoutElement.offsetParent) {
        do {
            x += layoutElement.offsetLeft;
            y += layoutElement.offsetTop;
        } while (layoutElement = layoutElement.offsetParent);
        
        return { x: x, y: y };
    }
}

HexagonGrid.prototype.isOutOfBounds = function(column,row) {
    return !(column >= 0 && column < this.ncols && row >= 0 && row < this.nrows);
};

HexagonGrid.prototype.constructTile = function(column,row) {
    return { 
        column: column, 
        row: row, 
        color: this.tileColor, 
        marked: false,
        seeds: 0 
    };
};

HexagonGrid.prototype.getTile = function(column,row) {
    if (!this.isOutOfBounds(column,row)) {
        return this.tiles[column][row];
    } else {
        return null;
    }
};

//Uses a grid overlay algorithm to determine hexagon location
//Left edge of grid has a test to acuratly determin correct hex
HexagonGrid.prototype.getSelectedTile = function(mouseX, mouseY) {

	var offSet = this.getRelativeCanvasOffset();

    mouseX -= offSet.x;
    mouseY -= offSet.y;

    var column = Math.floor((mouseX) / this.side);
    var row = Math.floor(
        column % 2 == 0
            ? Math.floor((mouseY) / this.height)
            : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);


    //Test if on left side of frame            
    if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {


        //Now test which of the two triangles we are in 
        //Top left triangle points
        var p1 = new Object();
        p1.x = column * this.side;
        p1.y = column % 2 == 0
            ? row * this.height
            : (row * this.height) + (this.height / 2);

        var p2 = new Object();
        p2.x = p1.x;
        p2.y = p1.y + (this.height / 2);

        var p3 = new Object();
        p3.x = p1.x + this.width - this.side;
        p3.y = p1.y;

        var mousePoint = new Object();
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;

        if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {
            column--;

            if (column % 2 != 0) {
                row--;
            }
        }

        //Bottom left triangle points
        var p4 = new Object();
        p4 = p2;

        var p5 = new Object();
        p5.x = p4.x;
        p5.y = p4.y + (this.height / 2);

        var p6 = new Object();
        p6.x = p5.x + (this.width - this.side);
        p6.y = p5.y;

        if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {
            column--;

            if (column % 2 == 0) {
                row++;
            }
        }
    }

    return this.tiles[column][row];
};

HexagonGrid.prototype.getNeighbours = function(tile) {
    var c1 = (tile.column % 2 == 0 ? -1 : 0);
    var c2 = (tile.column % 2 == 0 ? 0 : 1);
    neighbours_i = [
        [tile.column - 1,tile.row + c1],
        [tile.column - 1,tile.row + c2],
        
        [tile.column,tile.row-1],
        [tile.column,tile.row+1],

        [tile.column + 1,tile.row + c1],
        [tile.column + 1,tile.row + c2],
    ];
    neighbours = [];
    for (i = 0; i < neighbours_i.length; i++) {
        neighbour = this.getTile(neighbours_i[i][0],neighbours_i[i][1]);
        if (neighbour) {
            neighbours.push(neighbour);
        }
    }
    return neighbours;
};

HexagonGrid.prototype.sign = function(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

//TODO: Replace with optimized barycentric coordinate method
HexagonGrid.prototype.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
    var b1, b2, b3;

    b1 = this.sign(pt, v1, v2) < 0.0;
    b2 = this.sign(pt, v2, v3) < 0.0;
    b3 = this.sign(pt, v3, v1) < 0.0;

    return ((b1 == b2) && (b2 == b3));
};

HexagonGrid.prototype.getLocalX = function (mouseX) {
    return mouseX - this.canvasOriginX;
}

HexagonGrid.prototype.getLocalY = function (mouseY) {
    return mouseY - this.canvasOriginY;
}

HexagonGrid.prototype.markTile = function(tile) {
    if (tile.marked) {
        return false;
    }
    this.marked.isMarked[tile.column][tile.row] = true;
    tile.marked = true;
    tile.color = this.tileMarkedColor;
    tile.seeds = 10;
    this.marked.tiles.push(tile);
    return true;
}

HexagonGrid.prototype.isMarked = function(tile) {
    return this.marked.isMarked[tile.column][tile.row];
}

HexagonGrid.prototype.getMarkedTiles = function() {
    return this.marked.tiles;
}

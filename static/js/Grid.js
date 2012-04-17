var Grid = function(canvas) {
    this.canvas = new Raphael(document.getElementById("grid"), canvas.width(), canvas.height());
    this.grid = {};
    this.place_mode = false;
    this.place_type = 0;
    this.hover = null;

    this.render = function(sx, sy) {
        var r = 32;
        var xoffset;
        for(var x = 0; x < sx; x++) {
            this.grid[x] = {};
            for(var y = 0; y < sy; y++) {
                if(y % 2 == 1) xoffset = r - 2;
                else xoffset = 0;
                this.grid[x][y] = this.canvas.hexagon(
                        (x * (r - 2) * 2) + r + xoffset, 
                        (y * (r - 6) * 2) + r, 
                        r
                    );
                this.grid[x][y].rotate(30).attr({fill: "#FFF", stroke: "#F0F3F6"})
                    .data("coord", x + "_" + y)
                    .data("grid", this)
                    .mousedown(this.mousedown)
                    .mouseup(this.mouseup)
                    .mouseover(this.mouseover)
                    .mouseout(this.mouseout);
            }
        }
    }
    
    // Loads a json object into the grid
    this.load = function(coords) {
        var coord, selected;
        for(coord in coords) {
            selected = this.get(coord);
            selected.setType(coords[coord]['type']);
            selected.setOwner(coords[coord]['player']);
            selected.setHealth(coords[coord]['health']);
        }
    }
    //
    // Gets a coordinate on the grid
    this.get = function(x, y) {
        return new Coord(this, x, y);
    }

    // Sets the grid up for placing a tile
    this.placeMode = function(type) {
        this.place_type = type;
        this.place_mode = true;
    }

    this.normalMode = function() {
        if(this.hover != null) this.hover.elem.attr({fill: GameStyle['color']['coord']});

        this.place_type = 0;
        this.place_mode = false;
    }

    // 
    // Events:
    // 
    this.mousedown = function() {
    }

    this.mouseup = function(e) {
        var grid = this.data("grid");
        var coord = grid.get(this.data("coord"));

        if(grid.place_mode) {
            GameEvents.placeTile(coord);
        }
    }

    this.mouseover = function() {
        var grid = this.data("grid");
        var coord = grid.get(this.data("coord"));

        grid.hover = coord;
        if(grid.place_mode) {
            if(PlaceCheck[grid.place_type](coord)) {
                coord.elem.attr({fill: GameStyle['color']['place_good']});
            } else {
                coord.elem.attr({fill: GameStyle['color']['place_bad']});
            }
        }
    }

    this.mouseout = function() {
        var grid = this.data("grid");
        var coord = grid.get(this.data("coord"));
        grid.hover = null;

        if(grid.place_mode) {
            if(coord.getData("player") > 0) {
                coord.elem.attr({fill: GameData['colors'][coord.getData("player")]});
            } else {
                coord.elem.attr({fill: GameStyle['color']['coord']});
            }
        }
    };
}

var PlaceCheck = {
    1: function(coord) {
        if (coord.inRangeOf(1, GameData['pid']) && !coord.exists()) {
            return true;
        } else {
            return false;
        }
    },
    3: function(coord) {
        if (coord.inRangeOf(99) && coord.isOwnedBy(GameData['pid']) && coord.getType() == 1) {
            return true;
        }

        return false
    },
    4: Grid.defaultCheck,
    5: Grid.defaultCheck,
    6: Grid.defaultCheck,
    7: Grid.defaultCheck,
    8: function(coord) {
        if(coord.isOwnedBy(GameData['pid'])) {
            return true;
        }
        return false;
    },
};

var TileProps = {
    1: {
        "health": 25,
        "price": 25
    },
    2: {
        "health": 100,
    },
    3: {
        "health": 50,
        "price": 100
    },
    4: {
        "health": 25,
        "price": 100
    },
    5: {
        "health": 50,
        "price": 50,
    },
    6: {
        "health": 50,
        "price": 200
    },
    7: {
        "health": 50,
        "price": 100
    },
    8: {
        "health": 25,
        "price": 25
    },
}

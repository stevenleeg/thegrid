var Grid = function(canvas, sx, sy) {
    this.r = 32;
    this.x = sx;
    this.y = sy;
    canvas.width((sx * (this.r - 2) * 2) + (this.r) + 2);
    canvas.height((sy * (this.r - 6) * 2) + (this.r / 2) - 3);
    this.canvas = new Raphael(canvas.get(0), canvas.width(), canvas.height());
    this.grid = {};
    this.place_mode = false;
    this.place_type = 0;
    this.hover = null;
    this.evt_callbacks = [];
    this.evt_filters = {};

    this.render = function() {
        var xoffset;
        for(var x = 0; x < sx; x++) {
            this.grid[x] = {};
            for(var y = 0; y < sy; y++) {
                if(y % 2 == 1) xoffset = this.r - 2;
                else xoffset = 0;
                this.grid[x][y] = this.canvas.hexagon(
                        (x * (this.r - 2) * 2) + this.r + xoffset, 
                        (y * (this.r - 6) * 2) + this.r, 
                        this.r
                    );
                this.grid[x][y].rotate(30).attr({fill: "#FFF", stroke: "#F0F3F6"})
                    .data("coord", x + "_" + y)
                    .data("grid", this)
                    .mousedown(Coord.mousedown)
                    .mouseup(Coord.mouseup)
                    .mouseover(Coord.mouseover)
                    .mouseout(Coord.mouseout);
            }
        }

        // Setup modify callbacks
        for(tile in TileProps) {
            if(TileProps[tile]['events'] != undefined) {
                for(evt in TileProps[tile]['events']) {
                    this.registerEventCallback(TileProps[tile]['events'][evt]);
                }
            }
        }
    }
    
    // Loads a json object into the grid
    this.load = function(coords) {
        var coord, selected;
        this.setGlobalFilter("grid.loaded", false);
        for(coord in coords) {
            selected = this.get(coord);
            selected.setOwner(coords[coord]['player']);
            selected.setType(coords[coord]['type']);
            selected.setHealth(coords[coord]['health']);
        }

        this.setGlobalFilter("grid.loaded", true);
        for(coord in coords) {
            this.sendEventCallback({
                coord: this.get(coord),   
                filter: { type: coords[coord]['type'] }
            }, "grid.load.tiles");
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

        if(this.hover == null) return;
        if(PlaceCheck[this.place_type](this.hover)) {
            this.hover.elem.attr({fill: GameStyle['color']['place_good']});
            this.hover.setData("place", true);
        } else {
            this.hover.elem.attr({fill: GameStyle['color']['place_bad']});
        }
    }

    this.normalMode = function() {
        if(this.hover != null) this.hover.elem.attr({fill: GameStyle['color']['coord']});

        this.place_type = 0;
        this.place_mode = false;
    }

    // Registers a function to be called every time a
    // tile is modified. Used especially with shields.
    this.registerEventCallback = function(callback) {
        this.evt_callbacks.push(callback);
    }

    // Called by modifying functions
    // Goes through and notifies all registered callbacks
    // that a coordinate has changed. Evt is the event type
    // id. It has three possible values:
    // 0: Remove
    // 1: Add/Modify
    this.sendEventCallback = function(data, evt) {
        var selected;
        var filter_good = true;
        for(i in this.evt_callbacks) {
            selected = this.evt_callbacks[i];
            if(selected['when'].indexOf(evt) == -1) continue;

            // Add global filters
            if(data['filter'] == undefined) data['filter'] = this.evt_filters;
            else for(var key in this.evt_filters) { data['filter'][key] = this.evt_filters[key]; }
            
            if(selected['filter'] != undefined && data['filter'] != undefined) {
                for(i in selected['filter']) {
                    if(selected['filter'][i] != data['filter'][i])
                        filter_good = false;
                }
            }

            if(filter_good) selected['cb'](data, evt);
        }
    }

    // Registers a filter that is added to all events
    this.setGlobalFilter = function(name, val) {
        this.evt_filters[name] = val;
    }
}

Grid.defaultCheck = function(coord) {
    if(coord.isOwnedBy(GameData['pid']) && coord.getType() == 1) return true;
    else return false;
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
    9: Grid.defaultCheck
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
    9: {
        "health": 25,
        "price": 200,
        "events": [
            {
                // Determine if we should glow or not after every
                // change of a coordinate
                cb: function(data, evt) {
                    // Look for shields owned by this player
                    var coord = data['coord'];
                    var around = coord.around(9, coord.getData("player"));
                    if(around.length == 0) return;

                    if(evt == "coord.destroy") coord.unGlow();
                    else coord.glow("blue");
                },
                filter: {"grid.loaded": true},
                when: ["coord.destroy", "coord.setOwner"]
            }, 
            {
                // Look for all shields on the grid and glow any tiles around
                // them
                cb: function(data, evt) {
                    var coord = data['coord'];
                    var around = coord.around(0, coord.getData("player"));
                    for(i in around) {
                        around[i].glow("blue");
                    }
                },
                filter: {type: 9},
                when: ["grid.load.tiles"]
            }
        ],
    },

    // Natural tiles...
    99: {},
}

var Grid = function(canvas, sx, sy) {
    this.r = 32;
    this.padding = 128;
    this.x = parseInt(sx);
    this.y = parseInt(sy);
    canvas.width(this.padding + (sx * (this.r - 2) * 2) + (this.r) + 2);
    canvas.height(this.padding + (sy * (this.r - 6) * 2) + (this.r / 2) - 3);
    this.canvas = new Raphael(canvas.get(0), canvas.width(), canvas.height());
    this.grid = {};
    this.place_mode = false;
    this.place_type = 0;
    this.hover = null;
    this.evt_callbacks = [];
    this.evt_filters = {};

    this.render = function() {
        var coord;
        for(var x = 0; x < sx; x++) {
            this.grid[x] = {};
            for(var y = 0; y < sy; y++) {
                coord = this.translate(x, y);
                this.grid[x][y] = this.canvas.hexagon(
                        coord[0], 
                        coord[1], 
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

    // Translates an x, y into a set of actual coordinates
    this.translate = function(x, y) {
        var xoffset;

        if(y % 2 == 1) xoffset = this.r - 2;
        else xoffset = 0;

        return [
            (this.padding / 2) + (x * (this.r - 2) * 2) + this.r + xoffset,
            (this.padding / 2) + (y * (this.r - 6) * 2) + this.r
        ];
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
            if(coords[coord]['rot'] != null) selected.rotate(parseInt(coords[coord]['rot']), true);
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

    this.showMenu = function(coord) {
        // Find the locations of each hexagon around us
        var around = coord.around();
        var points = {};
        var hexes = [];

        // Add in any default menus
        var menus = (coord.property("menu") != undefined) ? coord.property("menu") : {};
        for(var dir in Coord.defaultProperty("menu")) menus[dir] = Coord.defaultProperty("menu")[dir];

        for(var dir in menus) {
            var around = coord.direction(dir, true);
            var point = this.translate(around[0], around[1]);
            var set = this.canvas.set();
            var hex = this.canvas.hexagon(point[0], point[1], 32);
            hex.attr({
                fill: "#000",
                opacity:0,
                stroke: 0,
                transform:"r30"
            });
            hex.animate({opacity:.95}, 75);
            set.push(hex);
            // Find out if we're overlaying text
            if(menus[dir]['text'] != undefined) {
                var text = this.canvas.text(point[0], point[1], menus[dir]['text']);
                text.attr({fill:"#FFF", "font-size": 14});
                set.push(text);
            }
            set.data("coord", coord)
                .data("grid", this)
                .data("dir", dir)
                .data("hex", hex);
            set.mouseup(Grid.menuUp);
            set.mouseover(Grid.menuOver);
            set.mouseout(Grid.menuOut);
            
            hexes.push(set);
        }

        coord.setData("menu", hexes);
    }

    this.hideMenu = function(coord) {
        var hexes = coord.getData("menu");
        if(hexes == undefined) return;
        for(item in hexes) {
            hexes[item].animate({opacity:0});
            hexes[item].remove();
        }

        coord.rmData("menu");
    }
}

Grid.defaultCheck = function(coord) {
    if(coord.isOwnedBy(GameData['pid']) && coord.getType() == 1) return true;
    else return false;
}

Grid.menuUp = function() {
    var coord = this.data("coord");
    var grid = this.data("grid");
    var menu =  coord.property("menu");

    if(menu == undefined) menu = Coord.defaultProperty("menu");
    menu[this.data("dir")]['onSelect'](grid, coord);

    grid.hideMenu(coord);
    coord.hideHealth();
}

Grid.menuOver = function() {
    this.data("hex").attr({fill: GameStyle['color']['blue']});
}

Grid.menuOut = function() {
    if(this.data("hex") == undefined) return;
    this.data("hex").attr({fill: GameStyle['color']['dark']});
}

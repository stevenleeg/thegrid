var Coord = function(grid, x, y) {
    // Parse the arguments
    if(y == undefined && typeof(x) == "string") {
        var xy = x.split("_");
        this.x = parseInt(xy[0]);
        this.y = parseInt(xy[1]);
    } else {
        this.x = x;
        this.y = y;
    }
    this.str = this.x + "_" + this.y;
    this.grid = grid;
    
    // Make sure they are in the grid
    if((this.x < 0 || this.y < 0) || (this.x >= this.grid.x || this.y >= this.grid.y)) {
        this.is_real = false;
        return;
    }
    this.is_real = true;

    this.elem = grid.grid[this.x][this.y];

    // Returns value from grid's data
    this.getData = function(key) {
        return this.elem.data(key);
    }
    
    this.setData = function(key, val) {
        this.elem.data(key, val);
    }

    this.rmData = function(key) {
        this.elem.removeData(key);
    }

    // Makes it easier to get tile properties
    this.property = function(key) {
        return TileProps[this.getType()][key];
    }
    
    // Returns tile type
    this.getType = function() {
        return this.getData("type");
    }

    // Sets the tile type
    this.setType = function(type) {
        var point, img;
        this.setData("type", type);
        
        if(type < 2) return;
        point = this.point();
        img = this.grid.canvas.image(
            "/static/img/tiles/" + type + ".png",
            point[0] - (this.grid.r / 2),
            point[1] - (this.grid.r / 2),
            32,
            32
        );
        // Natural tiles have a slightly different color
        if(type > 50) this.elem.attr({fill: GameStyle['color']['coord_natural']});
        img.data("coord", this.str)
            .data("grid", this.grid)
            .mousedown(Coord.mousedown)
            .mouseup(Coord.mouseup)
            .mouseover(Coord.mouseover)
            .mouseout(Coord.mouseout)
            .attr({opacity:0})
            .animate({opacity:1}, 75);
        this.setData("tile", img);
        this.grid.sendEventCallback({coord: this}, "coord.setType");

        // Anything else?
        if(this.property("onPlace") != undefined) this.property("onPlace")(this);
    }

    // Returns the absolute X/Y coordinates on the svg
    this.point = function() {
        return this.grid.translate(this.x, this.y);
    }

    // Sets the owner of the tile and its color
    this.setOwner = function(owner) {
        if(GameData['colors'][owner] == undefined) return;

        if(this.getData("type") == undefined) this.setData("type", 1);
        this.elem.animate({fill: GameData['colors'][owner]}, 75);
        this.setData("player", owner);

        this.grid.sendEventCallback({coord: this}, "coord.setOwner");
    }

    // Destroys the coord without leaving a trace.
    this.destroy = function() {
        if(this.getData("healthbar") != undefined) this.getData("healthbar").remove();
        if(this.getData("tile") != undefined) this.getData("tile").remove();
        if(this.getData("glow") != undefined) this.getData("glow").remove();
        // Send a modify alert
        this.grid.sendEventCallback({coord: this}, "coord.destroy");

        this.unGlow();

        this.elem.attr({fill: "#FFF"}).removeData()
            .data("grid", this.grid)
            .data("coord", this.str);
    }

    this.inRangeOf = function(type, owner) {
        var selected;
        // Start scanning
        for(dir in Coord.compass) {
            selected = this.direction(dir);
            // Make sure the coord we're looking at is in the grid
            if(selected.is_real == false) continue;
            if(selected.getType() == type || (owner && type == 1)) {
                if(owner && selected.isOwnedBy(owner)) return true;
                if(!owner) return true;
            }
        }

        return false;
    }

    // Gets all coords around us
    this.around = function(type, owner) {
        var selected, pts;
        // Start scanning
        pts = [];
        for(dir in Coord.compass) {
            selected = this.direction(dir);
            // Make sure the coord we're looking at is in the grid
            if(selected.is_real == false) continue;
            if(type && selected.getType() != type) continue;
            if(owner && selected.getData("player") != owner) continue;
            pts.push(selected);
        }
        return pts;
    }

    this.direction = function(dir, points_only) {
        var coord;
        if(points_only == true)
            coord = Coord.XYCompass[dir](this);
        else
            coord = Coord.compass[dir](this);
        
        return coord;
    }

    // Tells us if a player owns this or not
    this.isOwnedBy = function(pid) {
        if(this.getData("player") == pid) {
            return true;
        }
        return false
    }

    this.setHealth = function(health) {
        var perc, point, rect, width, cls;
        if(TileProps[this.getType()] != undefined) {
            perc = (health / this.property("health"));
        }
        this.setData("health", health);
        this.grid.sendEventCallback({coord: this}, "coord.setHealth");

        cls = "health_good";
        if(perc > 1) cls = "blue";
        if(perc <= .5) cls = "health_poor";
        if(perc <= .25) cls = "health_bad";

        // Out with the old!
        if(this.getData("healthbar") != undefined) this.getData("healthbar").remove();

        point = this.point();

        // Determine the width and if we're boosted
        if(perc > 1) width = ((this.grid.r * 1.5) - 4) * 1;
        else width = ((this.grid.r * 1.5) - 4) * perc;

        rect = this.grid.canvas.rect(point[0] - this.grid.r + 10, point[1] - 5 + 10, width, 5);

        if(perc > 1) { 
            rect.data("glow", rect.glow({color: GameStyle['color']['blue'], }));
            rect.data("glow").attr({opacity:0})
                .toBack()
                .mouseup(Coord.mouseup) 
                .data("grid", this.grid)
                .data("coord", this.str);
        }

        rect.attr({fill: GameStyle['color'][cls], stroke:"none", opacity:0})
            .data("grid", this.grid)
            .data("coord", this.str)
            .mouseup(Coord.mouseup)
            .toBack();
        this.setData("healthbar", rect);
    }

    this.showHealth = function() {
        this.getData("healthbar").toFront().animate({opacity:1}, 75);
        if(this.getData("tile") != undefined) this.getData("tile").animate({opacity:0}, 75);
        if(this.getData("healthbar").data("glow") != undefined) {
            this.getData("healthbar").data("glow").toFront().animate({opacity:.05}, 75);
        }
        if(this.getData("glow") != undefined) this.getData("glow").animate({opacity:0}, 75);
        this.elem.animate({fill: "#F0F3F6"}, 75);
    }

    this.hideHealth = function() {
        this.getData("healthbar").animate({opacity:0}, 75, function() { this.toBack(); });
        if(this.getData("tile") != undefined) this.getData("tile").animate({opacity:1}, 75);
        this.elem.animate({fill: GameData['colors'][this.getData("player")]}, 75);
        if(this.getData("healthbar").data("glow") != undefined) {
            this.getData("healthbar").data("glow").animate({opacity:0}, 75, function() { this.toBack() });
        }
        if(this.getData("glow") != undefined) this.getData("glow").animate({opacity:.1}, 75);
    }

    this.pingHealth = function() {
        var coord = this;
        this.showHealth();

        if(coord.getData("ping") != undefined) clearTimeout(coord.getData("ping"));

        coord.setData("ping", setTimeout(function() {
            coord.hideHealth();
        }, 750));
    }

    this.glow = function(color) {
        var glow = this.elem.glow({
            color: GameStyle['color'][color],
            opacity: 0
        });
        glow.animate({opacity:.1}, 200);
        this.setData("glow", glow);
    }

    this.unGlow = function() {
        if(this.getData("glow") == undefined) return;
        var glow = this.getData("glow");
        glow.animate({opacity:0}, 200, function() {
            this.remove();   
        });
    }

    // Does this coord exist?
    // TODO: Make this work with naturals
    this.exists = function() {
        return this.getData("type") > 0;
    }

    this.rotate = function(deg, direct) {
        var start, end;
        if(direct) start = 0;
        else if(this.getData("rot") != undefined) start = this.getData("rot");
        else start = 0;
        
        if(direct) end = deg;
        else end = start + deg;
        if(end > 360) { 
            this.getData("tile").transform("r0");
            end -= 360;
        }
        if(end >= 120) scale = -1;
        if(end < 120 || end >= 300) scale = 1;

        // Rotate the tile's image
        this.getData("tile").animate({transform: "r" + end + "s1," + scale}, 75);
        
        this.setData("rot", end);
    }
}

Coord.compass = {
    "NE": function(coord) {
        if(coord.y % 2 == 0)
            return coord.grid.get(coord.x, coord.y - 1);
        else
            return coord.grid.get(coord.x + 1, coord.y - 1);
    },
    "NW": function(coord) {
        if(coord.y % 2 == 0)
            return coord.grid.get(coord.x - 1, coord.y - 1);
        else
            return coord.grid.get(coord.x, coord.y - 1);
    },
    "W": function(coord) {
        return coord.grid.get(coord.x - 1, coord.y);
    },
    "E": function(coord) {
        return coord.grid.get(coord.x + 1, coord.y);
    },
    "SE": function(coord) {
        if(coord.y % 2 == 0)
            return coord.grid.get(coord.x, coord.y + 1);
        else
            return coord.grid.get(coord.x + 1, coord.y + 1);
    },
    "SW": function(coord) {
        if(coord.y % 2 == 0)
            return coord.grid.get(coord.x - 1, coord.y + 1);
        else
            return coord.grid.get(coord.x, coord.y + 1);
    }
}

Coord.XYCompass = {
    "NE": function(coord) {
        if(coord.y % 2 == 0)
            return [coord.x, coord.y - 1];
        else
            return [coord.x + 1, coord.y - 1];
    },
    "NW": function(coord) {
        if(coord.y % 2 == 0)
            return [coord.x - 1, coord.y - 1];
        else
            return [coord.x, coord.y - 1];
    },
    "W": function(coord) {
        return [coord.x - 1, coord.y];
    },
    "E": function(coord) {
        return [coord.x + 1, coord.y];
    },
    "SE": function(coord) {
        if(coord.y % 2 == 0)
            return [coord.x, coord.y + 1];
        else
            return [coord.x + 1, coord.y + 1];
    },
    "SW": function(coord) {
        if(coord.y % 2 == 0)
            return [coord.x - 1, coord.y + 1];
        else
            return [coord.x, coord.y + 1];
    }
}


Coord.defaultProperty = function(prop) {
    return TileProps[0][prop];
}

// 
// Events:
// 
Coord.mousedown = function(e) {
    var grid = this.data("grid");
    var coord = grid.get(this.data("coord"));
    
    // See if we can rotate
    if(e.which == 3) {
        if(!coord.exists() || coord.getData("player") != GameData['pid'] || coord.property("rotate") == undefined) return;
        coord.rotate(60);
        GameEvents.rotate(coord);
        return;
    }
    if(grid.place_mode || !coord.exists()) return;
    if(coord.getType() < 2 || coord.getType() > 50) return;

    coord.showHealth();
    grid.showMenu(coord);
    grid.health = coord;
}

Coord.mouseup = function(e) {
    var grid = this.data("grid");
    var coord = grid.get(this.data("coord"));

    if(grid.place_mode) {
        grid.hover = null;
        GameEvents.placeTile(coord);
        grid.hover = coord;
    } else {
        if(grid.health == null) return;
        coord = grid.health;
        if(coord.getType() < 2 || coord.getType() > 50) return;
        coord.hideHealth();
        grid.hideMenu(coord);
    }
}

Coord.mouseover = function() {
    var grid = this.data("grid");
    var coord = grid.get(this.data("coord"));

    grid.hover = coord;
    if(grid.place_mode) {
        if(PlaceCheck[grid.place_type](coord)) {
            coord.elem.attr({fill: GameStyle['color']['place_good']});
            coord.setData("place", true);
        } else {
            coord.elem.attr({fill: GameStyle['color']['place_bad']});
        }
    }
}

Coord.mouseout = function() {
    var grid = this.data("grid");
    if(grid == undefined) return;
    var coord = grid.get(this.data("coord"));
    grid.hover = null;

    if(grid.place_mode) {
        coord.rmData("place");
        if(coord.getData("player") > 0) {
            coord.elem.attr({fill: GameData['colors'][coord.getData("player")]});
        } else {
            coord.elem.attr({fill: GameStyle['color']['coord']});
        }
    }
}

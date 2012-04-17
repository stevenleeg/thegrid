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

    // Returns tile type
    this.getType = function() {
        return this.getData("type");
    }

    // Sets the tile type
    this.setType = function(type) {
        var point;
        this.setData("type", type);
        
        if(type < 2) return;
        point = this.point();
        this.grid.canvas.image(
            "/static/img/tiles/" + type + ".png",
            point[0] - (this.grid.r / 2),
            point[1] - (this.grid.r / 2),
            32,
            32
        );
    }

    // Returns the absolute X/Y coordinates on the svg
    this.point = function() {
        var xoffset = 0;
        if(this.y % 2 == 1) xoffset = this.grid.r - 2;
        else xoffset = 0;
        return [(this.x * (this.grid.r - 2) * 2) + this.grid.r + xoffset,
            (this.y * (this.grid.r - 6) * 2) + this.grid.r];
    }

    // Sets the owner of the tile and its color
    this.setOwner = function(owner) {
        if(GameData['colors'][owner] == undefined) return;

        if(this.getData("type") == undefined) this.setData("type", 1);
        this.elem.attr({fill: GameData['colors'][owner]});
        this.setData("player", owner);
    }

    this.setHealth = function(health) {
        var perc, point, rect, cls;
        if(TileProps[this.getType()] != undefined) {
            perc = (health / TileProps[this.getType()]['health']);
        }
        this.setData("health", health);

        // TODO: This...
        cls = "health_good";
        if(perc <= .5) cls = "health_poor";
        if(perc <= .25) cls = "health_bad";

        point = this.point();
        rect = this.grid.canvas.rect(point[0] - this.grid.r + 10, point[1] - 5 + 10, (this.grid.r * 1.5) - 4, 5);
        rect.attr({fill: GameStyle['color'][cls], stroke:"none", opacity:0});
        this.setData("healthbar", rect);
    }

    // Destroys the coord without leaving a trace.
    this.destroy = function() {
        this.elem.attr({fill: "#FFF"}).removeData();
    }

    this.inRangeOf = function(type, owner) {
        var x, y, startX, startY, selected, skip;
        // Generate the scanning start points
        startX = this.x - 1;
        startY = this.y - 1;
        if(startX < 0) startX = 0;
        if(startY < 0) startY = 0;

        skip = [this.x + "_" + this.y];
        if(this.y % 2 == 1) {
            skip.push((this.x - 1) + "_" + (this.y + 1));
            skip.push((this.x - 1) + "_" + (this.y - 1));
        } else {
            skip.push((this.x + 1) + "_" + (this.y + 1));
            skip.push((this.x + 1) + "_" + (this.y - 1));
        }

        // Start scanning
        for(x = startX; x <= (this.x + 1); x++) {
            for(y = startY; y <= (this.y + 1); y++) {
                selected = this.grid.get(x, y);
                if(skip.indexOf(selected.str) != -1) continue;

                if(selected.getType() == type) {
                    if(owner && selected.isOwnedBy(owner)) return true;
                    if(!owner) return true;
                }
            }
        }

        return false;
    }

    // Tells us if a player owns this or not
    this.isOwnedBy = function(pid) {
        if(this.getData("player") == pid) {
            return true;
        }
        return false
    }

    // Does this coord exist?
    // TODO: Make this work with naturals
    this.exists = function() {
        return this.getData("type") > 0;
    }
}

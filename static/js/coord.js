var Coord = function(x, y) {
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
    this.dom = $("#" + this.str);
    this.ovr = $("#o" + this.str);

    // Returns value from grid's data
    this.getData = function(key) {
        return this.dom.data(key);
    }

    // Returns tile type
    this.getType = function() {
        var cls = this.ovr.attr("class");
        if(cls == "ocol t1") {
            return 1;
        } else if(cls == "ocol") {
            return 0;
        }
        return parseInt(cls
                .replace("ocol ", "")
                .replace("t1 ","")
                .replace("t", "")
                .replace("place_good",""));
    }

    // Sets the tile type
    this.setType = function(type) {
        if(type == 1) {
            this.ovr.attr("class", "ocol t1");
        } else {
            this.ovr.attr("class", "ocol t" + type);
        }
    }

    // Sets the owner of the tile and its color
    this.setOwner = function(owner) {
        if(GameData['colors'][owner] == undefined) return;

        if(!this.ovr.hasClass("t1")) this.ovr.addClass("t1");
        this.dom.css("color", GameData['colors'][owner]);
        this.dom.data("player", owner);
    }

    this.setHealth = function(health) {
        this.dom.data("health", health);
    }

    // Destroys the coord without leaving a trace.
    this.destroy = function() {
        this.dom.removeClass()
            .css("background-color", "")
            .removeData()
            .html("").addClass("ocol");
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
                selected = new Coord(x, y);
                if(skip.indexOf(selected.str) != -1) continue;

                if(selected.dom.hasClass("t" + type) || selected.ovr.hasClass("t" + type)) {
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
        return this.ovr.hasClass('t1');
    }
}

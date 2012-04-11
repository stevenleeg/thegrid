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

    // Returns value from grid's data
    this.getData = function(key) {
        return this.dom.data(key);
    }

    // Returns tile type
    this.getType = function() {
        var cls = this.dom.attr("class");
        if(cls == undefined) {
            return 0;
        } else if(cls == "t1") {
            return 1;
        }
        return parseInt(cls.replace("t1 ", "")
                .replace("t", "")
                .replace("place_good",""));
    }

    // Destroys the coord without leaving a trace.
    this.destroy = function() {
        this.dom.removeClass()
            .css("background-color", "")
            .removeData()
            .html("");
    }

    // Scans for coords with a given type/owner
    this.inRangeOf = function(type, radius, owner) {
        var startX, startY, selected;

        startX = this.x - radius;
        if (startX < 0) {
            startX = 0;
        }
        for (var x = startX; x <= (this.x + radius); x++) {
            selected = new Coord(x, this.y)
            if (selected.dom.hasClass("t" + type) && x != this.x) {
                if (owner && selected.getData("player") == owner) {
                    return true;
                } else if (!owner) {
                    return true;
                }
            }
        }

        startY = this.y - radius;
        if (startY < 0) {
            startY = 0;
        }
        for (var y = startY; y <= (this.y + radius); y++) {
            selected = new Coord(this.x, y);
            if (selected.dom.hasClass("t" + type) && y != this.y) {
                if (owner && selected.getData("player") == owner) {
                    return true;
                } else if (!owner) {
                    return true;
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
        return this.dom.hasClass('t1');
    }
}

var Grid = function(canvas) {
    paper.install(window);
    paper.setup(canvas);
    this.grid = {};

    this.render = function(sx, sy) {
        var r = 32;
        var xoffset;
        for(var x = 0; x < sx; x++) {
            this.grid[x] = {};
            for(var y = 0; y < sy; y++) {
                if(y % 2 == 1) xoffset = r - 2;
                else xoffset = 0;
                this.grid[x][y] = new Path.RegularPolygon(new Point(
                            (x * (r - 2) * 2) + r + xoffset, 
                            (y * (r - 6) * 2) + r 
                        ), 6, r);
                //this.grid[x][y].rotate(30);
                this.grid[x][y].fillColor = "#FFF";
                this.grid[x][y].selected = true;
            }
        }
    }
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

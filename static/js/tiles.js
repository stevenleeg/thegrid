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
    9: Grid.defaultCheck,
    10: Grid.defaultCheck
};

var TileProps = {
    // Default tile properties
    0: {
        "menu": {
            "NE": {
                "text": "destroy",
                "onSelect": function() {
                    console.log("Destroy me!");
                },
            }
        },
    },
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
                    var around;
                    // Look for shields owned by this player
                    var coord = data['coord'];
                    if(coord.getType() == 9 && evt == "coord.destroy") {
                        around = coord.around(0, coord.getData("player"));
                        for(i in around) {
                            around[i].unGlow();
                        }
                    } else if(coord.getType() == 9 && evt == "coord.setType") {
                        around = coord.around(0, coord.getData("player"));
                        for(i in around) {
                            around[i].glow("blue");
                        }
                    } else {
                        around = coord.around(9, coord.getData("player"));
                        if(around.length == 0) coord.unGlow();
                        else coord.glow("blue");
                    }
                },
                filter: {"grid.loaded": true},
                when: ["coord.destroy", "coord.setType"]
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

    10: {
        "health": 50,
        "price": 200,
        "rotate": true,
        "menu": {
            "E": {
                "text": "shoot",
                "onSelect": function() { console.log("SHOTS FIRED!"); }
            }
        }
    },

    // Natural tiles...
    99: {},
}

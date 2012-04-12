var Grid = (function() {
    var colors,
    pid,
    place_type;

    function load(coords) {
        var coord, selected;
        for (coord in coords) {
            selected = new Coord(coord);
            selected.setType(coords[coord]['type']);
            selected.setOwner(coords[coord]['player']);
            selected.setHealth(coords[coord]['health']);
        }
    }

    function setupEvents() {
        $("#overlay .ocol").mouseenter(function() {
            var coord = new Coord($(this).attr("id").replace("o",""));
            Grid.hover = coord;

            // See if we're placing a tile
            if(Grid.place_mode) {
                if (PlaceCheck[Grid.place_type](coord)) {
                    coord.dom.addClass("place_good");
                } else {
                    coord.dom.addClass("place_bad");
                }
            }
        }).mouseleave(function() {
            var coord = new Coord($(this).attr("id").replace("o",""));
            Grid.hover = null;

            if(Grid.place_mode) {
                coord.dom.removeClass("place_good place_bad");
            }
        }).mouseup(function(e) {
            if(Grid.place_mode && e.which == 1) {
                var coord = new Coord($(this).attr("id").replace("o",""));
                console.log("placing");
                GameEvents.placeTile(coord);
            }
        });
    }

    function placeMode(type) {
        var on = Grid.hover;
        Grid.place_type = type;
        Grid.place_mode = true;
        $("#grid").addClass("place_mode");
        if (Grid.hover != null) {
            on.dom.css("background-color", "")
                .data("class", on.attr("class"));
            if (PlaceCheck[Grid.place_type](Grid.hover)) {
                on.dom.addClass("place_good");
            } else {
                on.dom.addClass("place_bad");
            }
        }
    }

    function normalMode() {
        $("#grid").removeClass("place_mode");
        $("#grid td.place_good, #grid td.place_bad").each(function() {
            $(this).removeClass().addClass($(this).data("class"));
            $(this).css("background-color", GameData['colors'][$(this).data("player")]);
        });

        Grid.place_type = 0;
        Grid.place_mode = false;
    }

    function place(coord, type, color) {
        coord.dom.removeClass("place_good")
            .addClass("t" + type)
            .html("")
            .data("player", GameData['pid'])
            .data("health", TileProps[type]['health']);

        $("<div class='health'>&nbsp;</div>").hide().appendTo(coord);
        Grid.setHealth(coord, TileProps[type]['health']);
        if (color != undefined) {
            coord.dom.css("background-color", color);
        }
    }

    function setHealth(coord, val) {
        var percentage, color;
        // Determine percentage
        percentage = val / TileProps[coord.getType()]['health'] * 100;
        // Determine the color
        if (percentage >= 66) color = "green";
        if (percentage < 66 && percentage > 33) color = "yellow";
        if (percentage <= 33) color = "red";
        coord.dom.children(".health").css("width", percentage + "%")
            .attr("class", "health " + color);
    }

    function pingHealth(coord) {
        var health;
        coord = coord.dom;
        if (coord.length != 0) {
            health = coord.children(".health");
            clearTimeout(health.data("to"));
            clearTimeout(coord.data("in-to"));
            // Fade background
            coord.animate({
                "background-color": "#F0F3F6"
            },
            100,
            function() {
                coord.data("in-to", setTimeout(function() {
                    coord.animate({
                        "background-color": GameData['colors'][coord.data("player")]
                    },
                    100);
                },
                1000));
            });

            // Fade in health
            health.fadeIn(100,
            function() {
                health.data("to", setTimeout(function() {
                    health.fadeOut(100);
                },
                1000));
            });
        }
    }

    function defaultCheck(coord) {
        if (coord.isOwnedBy(GameData['pid']) && coord.getType() == 1) {
            return true;
        }
        return false;
    }

    return {
        "load": load,
        "colors": colors,
        "placeMode": placeMode,
        "normalMode": normalMode,
        "place": place,
        "place_type": place_type,
        "setupEvents": setupEvents,
        "place_mode": false,
        "setHealth": setHealth,
        "pingHealth": pingHealth,
        "defaultCheck": defaultCheck,
        "hover": null,
    };
})();

var PlaceCheck = {
    1: function(coord) {
        if (coord.inRangeOf(1, GameData['pid']) && !coord.exists()) {
            return true;
        } else {
            return false;
        }
    },
    3: function(coord) {
        if (coord.inRangeOf(99) && coord.isOwnedBy(GameData['pid'])) {
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

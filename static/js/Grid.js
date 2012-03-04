var Grid = (function() {
    var colors,
    pid,
    place_type;

    function load(coords) {
        var coord, c, rotate;
        for (coord in coords) {
            selected = $("#" + coord);
            selected.addClass("t" + coords[coord]['type']).data("player", coords[coord]['player']).data("health", coords[coord]['health']);
            if (coords[coord]['player'] > 0) {
                selected.css("background-color", Grid.colors[coords[coord]['player']]).addClass("t1");
                selected.html("");
                $("<div class='health'>&nbsp;</div>").appendTo(selected).hide();
                Grid.setHealth(coord, coords[coord]['health']);
            }
            if(coords[coord]['rot'] != null) {
                rotate = parseInt(coords[coord]['rot']);
                selected.rotate(rotate * 90);
            }
        }
    }

    function setupEvents() {
        $("#grid").bind("contextmenu", function() {
            return false;
        });
        $("#grid td").off().mouseenter(function() {
            var rotate;
            Grid.hover = $(this).attr("id");
            if (Grid.place_mode) {
                $(this).data("class", $(this).attr("class"));
                rotate = $(this).rotate();
                $(this).css("background-color", "");
                if (PlaceCheck[Grid.place_type]($(this).attr("id"))) {
                    $(this).addClass("place_good");
                } else {
                    $(this).addClass("place_bad");
                }
                $(this).addClass("t" + Grid.place_type);
                $(this).rotate(rotate);
            }
        }).mouseleave(function() {
            Grid.hover = null;
            if (Grid.place_mode) {
                //$(this).removeClass("place_bad").removeClass("place_good");
                $(this).removeClass().addClass($(this).data("class")).removeData("class");
                $(this).css("background-color", Grid.colors[$(this).data("player")]);
            }
        }).bind("contextmenu", function(e) {
            var coord;
            coord = parseCoord($(this).attr("id"));
            if(TileProps[getType(coord[0], coord[1])]['rotate'] == true) {
                GameEvents.rotate(e);
            }
        }).mousedown(function(e) {
            var health;
            health = $(this).children(".health")
            if (health.length != 0 && !Grid.place_mode && e.which == 1) {
                $(this).css("background-color", "");
                $(this).addClass("info");
                health.fadeIn(50);
            }
        }).mouseup(function(e) {
            // Place a tile?
            if(Grid.place_mode && e.which == 1) {
                GameEvents.placeTile(e)
            } 
            // Show the health bar
            else if(e.which == 1) {
                var health, td;
                health = $("#grid td.info").children(".health")
                td = $("#grid td.info");
                if (health.length != 0 && !Grid.place_mode) {
                    td.css("background-color", Grid.colors[td.data("player")]);
                    td.removeClass("info");
                    health.fadeOut(50);
                }
            }
        });
    }

    function get(x, y) {
        return $("#" + x + "_" + y).data("d");
    }

    function getInfo(x, y, key) {
        return $("#" + x + "_" + y).data("d")[key];
    }

    function parseCoord(coord) {
        coord = coord.split("_");
        return [parseInt(coord[0]), parseInt(coord[1])];
    }

    function getCoord(x, y) {
        return $("#" + x + "_" + y);
    }

    function getType(x, y) {
        var coord,
        cls;

        coord = getCoord(x, y);
        cls = coord.attr("class");
        if(cls == undefined) {
            return 0;
        } else if(cls == "t1") {
            return 1;
        }
        return parseInt(cls.replace("t1 ", "").replace("t", "").replace("place_good",""));
    }

    function placeMode(type) {
        var on;
        Grid.place_type = type;
        Grid.place_mode = true;
        $("#grid").addClass("place_mode");
        on = $("#" + Grid.hover);
        on.data("class", on.attr("class"));
        if (Grid.hover != null) {
            on.css("background-color", "");
            if (PlaceCheck[Grid.place_type](Grid.hover)) {
                on.addClass("place_good");
            } else {
                on.addClass("place_bad");
            }
            on.addClass("t" + Grid.place_type);
        }
    }

    function normalMode() {
        $("#grid").removeClass("place_mode");
        $("#grid td.place_good, #grid td.place_bad").each(function() {
            $(this).removeClass().addClass($(this).data("class"));
            $(this).css("background-color", Grid.colors[$(this).data("player")]);
        });

        Grid.place_type = 0;
        Grid.place_mode = false;
    }

    function place(coord, type, color) {
        var c;
        c = $("#" + coord)
        c.removeClass("place_good");
        c.addClass("t" + type).html("");
        c.data("player", Grid.pid).data("health", TileProps[type]['health']);
        $("<div class='health'>&nbsp;</div>").hide().appendTo(c);
        Grid.setHealth(coord, TileProps[type]['health']);
        if (color != undefined) {
            c.css("background-color", color);
        }
    }

    function destroy(coord) {
        $("#" + coord).removeClass().css("background-color", "").removeData().html("");
    }

    function inRangeOf(coord, type, radius, owner) {
        coord = parseCoord(coord);
        startX = coord[0] - radius;
        if (startX < 0) {
            startX = 0;
        }
        for (var x = startX; x <= (coord[0] + radius); x++) {
            selected = getCoord(x, coord[1])
            if (selected.hasClass("t" + type) && x != coord[0]) {
                if (owner && selected.data("player") == owner) {
                    return true;
                } else if (!owner) {
                    return true;
                }
            }
        }

        startY = coord[1] - radius;
        if (startY < 0) {
            startY = 0;
        }
        for (var y = startY; y <= (coord[1] + radius); y++) {
            selected = getCoord(coord[0], y);
            if (selected.hasClass("t" + type) && y != coord[1]) {
                if (owner && selected.data("player") == owner) {
                    return true;
                } else if (!owner) {
                    return true;
                }
            }
        }
    }

    function isOwned(coord, pid) {
        if ($("#" + coord).data("player") == pid) {
            return true;
        }
        return false;
    }

    function exists(coord) {
        return $("#" + coord).hasClass("t1");
    }

    function setHealth(coord, val) {
        var percentage, 
        c,
        color;
        // Determine percentage
        c = parseCoord(coord);
        percentage = val / TileProps[getType(c[0], c[1])]['health'] * 100;
        // Determine the color
        if (percentage >= 66) color = "green";
        if (percentage < 66 && percentage > 33) color = "yellow";
        if (percentage <= 33) color = "red";
        $("#" + coord + " .health").css("width", percentage + "%").attr("class", "health " + color);
    }

    function pingHealth(coord) {
        var health;
        coord = $("#" + coord);
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
                        "background-color": Grid.colors[coord.data("player")]
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
        if (Grid.isOwned(coord, Grid.pid) && $("#" + coord).attr("class") == "t1") {
            return true;
        }
        return false;
    }

    function shotCheck(coord) {
        var parse = parseCoord(coord);
        if(Grid.isOwned(coord, Grid.pid) && getType(parse[0], parse[1]) == 9) {
            return true;
        }
        return false;
    }

    return {
        "load": load,
        "get": get,
        "getInfo": getInfo,
        "getType": getType,
        "colors": colors,
        "placeMode": placeMode,
        "normalMode": normalMode,
        "place": place,
        "place_type": place_type,
        "destroy": destroy,
        "parseCoord": parseCoord,
        "inRangeOf": inRangeOf,
        "isOwned": isOwned,
        "exists": exists,
        "setupEvents": setupEvents,
        "place_mode": false,
        "setHealth": setHealth,
        "pingHealth": pingHealth,
        "defaultCheck": defaultCheck,
        "shotCheck": shotCheck,
        "hover": null,
    };
})();

var PlaceCheck = {
    1: function(coord) {
        if (Grid.inRangeOf(coord, 1, 1, Grid.pid) && !Grid.exists(coord)) {
            return true;
        } else {
            return false;
        }
    },
    3: function(coord) {
        if (Grid.inRangeOf(coord, 99, 1) && Grid.isOwned(coord, Grid.pid)) {
            return true;
        }

        return false
    },
    4: Grid.defaultCheck,
    5: Grid.defaultCheck,
    6: Grid.defaultCheck,
    7: Grid.defaultCheck,
    8: function(coord) {
        if(Grid.isOwned(coord, Grid.pid)) {
            return true;
        }
        return false;
    },
    9: Grid.defaultCheck,
    10: Grid.shotCheck,
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
        "health": 50,
        "price": 250,
        "rotate": true
    },
    10: {
        "health": 5,
        "price": 25
    }
}

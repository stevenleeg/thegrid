var Grid = (function() {
	var colors, pid, place_type;

  function load(coords) {
    var coord, c;
    for(coord in coords) {
		 selected = $("#" + coord);
		 if(coords[coord]['player'] > 0) {
			selected.css("background-color", Grid.colors[coords[coord]['player']]).addClass("t1");
		 }
      selected.addClass("t" + coords[coord]['type']).data("player", coords[coord]['player']).data("health", coords[coord]['health']);
    }
  }

  function setupEvents() {
		$("#grid td").off().mouseenter(function() {
			Grid.hover = $(this).attr("id");
			if(Grid.place_mode) {
				$(this).css("background-color", "");
				if(PlaceCheck[Grid.place_type]($(this).attr("id"))) {
						$(this).addClass("place_good");
					} else {
						$(this).addClass("place_bad");
				}
			}
		}).mouseleave(function() {
			Grid.hover = null;
			if(Grid.place_mode) {
				$(this).removeClass("place_bad").removeClass("place_good");
				$(this).css("background-color", Grid.colors[$(this).data("player")]);
			}
		}).click(function(e) {
			if(Grid.place_mode) {
				GameEvents.placeTile(e);
			}
		});
  }

  function get(x, y) {
	  return $("#" + x + "_" + y).data("d");
  }

  function getInfo(x,y, key) {
	  return $("#" + x + "_" + y).data("d")[key];
  }

  function parseCoord(coord) {
		coord = coord.split("_");
		return [parseInt(coord[0]), parseInt(coord[1])];
  }

  function getCoord(x, y) {
		return $("#" + x + "_" + y);
  }

  function placeMode(type) {
	   Grid.place_type = type;
		Grid.place_mode = true;
		$("#grid").addClass("place_mode");
		if(Grid.hover != null) {
			$("#" + Grid.hover).css("background-color", "");
			if(PlaceCheck[Grid.place_type](Grid.hover)) {
					$("#" + Grid.hover).addClass("place_good");
				} else {
					$("#" + Grid.hover).addClass("place_bad");
			}
		}
	}

  function normalMode() {
		$("#grid").removeClass("place_mode");
		$("#grid td.place_good, #grid td.place_bad").each(function() {
			$(this).removeClass("place_good").removeClass("place_bad");
			$(this).css("background-color", Grid.colors[$(this).data("player")]);
		});
			
		Grid.place_type = 0;
		Grid.place_mode = false;
  }

  function place(coord, type, color) {
	  	var coord;
	  	coord = $("#" + coord)
		coord.addClass("t" + type)
		coord.data("player", Grid.pid).data("health", TileProps[type]['health']);
		if(color != undefined) {
			coord.css("background-color", color);
		}
  }

  function destroy(coord) {
		$("#" + coord).attr("class", "").css("background-color", "").removeData();
  }

  function inRangeOf(coord, type, radius, owner) {
	  	coord = parseCoord(coord);
		startX = coord[0] - radius;
		if(startX < 0) {
			startX = 0;
		}
		for(var x = startX; x <= (coord[0] + radius); x++) {
			selected = getCoord(x, coord[1])
			if(selected.hasClass("t" + type) && x != coord[0]) {
				if(owner && selected.data("player") == owner) {
					return true;
				} else if(!owner) {
					return true;
				}
			}
		}

		startY = coord[1] - radius;
		if(startY < 0) {
			startY = 0;
		}
		for(var y = startY; y <= (coord[1] + radius); y++) {
			selected = getCoord(coord[0], y);
			if(selected.hasClass("t" + type) && y != coord[1]) {
				if(owner && selected.data("player") == owner) {
					return true;
				} else if(!owner) {
					return true;
				}
			}
		}
  }

	function isOwned(coord, pid) {
		if($("#" + coord).data("player") == pid) {
			return true;
		}
		return false;
	}

	function exists(coord) {
		return $("#" + coord).hasClass("t1");
	}

  return {
    "load": load,
    "get": get,
    "getInfo": getInfo,
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
	 "hover": null,
  };
})();

var PlaceCheck = {
	1: function(coord) {
		if(Grid.inRangeOf(coord, 1, 1, Grid.pid) && !Grid.exists(coord)) {
			return true;
		} else {
			return false;
		}
	},
	3: function(coord) {
		if(Grid.inRangeOf(coord, 99, 1) && Grid.isOwned(coord, Grid.pid)) {
			return true;
		} 

		return false
	},
	4: function(coord) {
		if(Grid.isOwned(coord, Grid.pid)) {
			return true;
		}
		return false;
	}
};

var TileProps = {
	1: { 
		"health": 25,
		"price": 25
	},
	3: { 
		"health": 50,
		"price": 100
	},
	4: {
		"health": 25,
		"price": 100
	}
}

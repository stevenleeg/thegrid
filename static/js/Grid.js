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
		$("#grid").addClass("place_mode");
		$("#grid td").off().mouseenter(function() {
			if(PlaceCheck[type]($(this).attr("id"))) {
				$(this).addClass("place_good");
			} else {
				$(this).addClass("place_bad");
			}
		}).mouseleave(function() {
			$(this).removeClass("place_bad").removeClass("place_good");
		}).click(GameEvents.placeTile);
	}

  function normalMode() {
		$("#grid").removeClass("place_mode");
		$("#grid td.place_good, #grid td.place_bad").removeClass("place_good").removeClass("place_bad");
		$("#grid td").off();
		Grid.place_type = 0;
  }

  function place(coord, type, color) {
	  	var coord;
	  	coord = $("#" + coord)
		coord.addClass("t" + type)
		coord.data("player", Grid.pid).data("health", TileHealth[type]);
		if(color != undefined) {
			coord.css("background-color", color);
		}
  }

  function destroy(coord) {
		$("#" + coord).attr("class", "").css("background-color", "");
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
			if(owner && selected.data("player") == owner) {
				return true;
			} else if(!owner) {
				return true;
			}
		}

		return false;
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
  };
})();

var PlaceCheck = {
	1: function(coord) {
		if(Grid.inRangeOf(coord, 1, 1, Grid.pid)) {
			return true;
		} else {
			return false;
		}
	}
};

var TileHealth = {
	1: 25,
}

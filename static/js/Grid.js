var Grid = (function() {
	var colors, pid, place_type;

  function load(coords) {
    var coord, c;
    for(coord in coords) {
		 if(coords[coord]['player'] > 0) {
			$("#" + coord).css("background-color", Grid.colors[coords[coord]['player']]);
		 }
      $("#" + coord).attr("class", "t" + coords[coord]['type']).data("d", coords[coord]);
    }
  }

  function get(x, y) {
    return $("#" + x + "_" + y).data("d");
  }

  function getInfo(x,y, key) {
    return $("#" + x + "_" + y).data("d")[key];
  }

  function placeMode(type) {
	   Grid.place_type = type;
		$("#grid").addClass("place_mode");
		$("#grid td").off().mouseenter(function() {
			if(PlaceCheck[type](this)) {
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
		if(color != undefined) {
			coord.css("background-color", color);
		}
  }

  function destroy(coord) {
		$("#" + coord).attr("class", "").css("background-color", "");
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
	 "destroy": destroy
  };
})();

var PlaceCheck = {
	1: function() {
		return true;
	}
};

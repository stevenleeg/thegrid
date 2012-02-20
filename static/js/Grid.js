var Grid = (function() {
	var colors, pid;

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

  return {
    "load": load,
    "get": get,
    "getInfo": getInfo,
	 "colors": colors
  };
})();

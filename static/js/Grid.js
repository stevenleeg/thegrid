var Grid = (function() {
  function load(coords) {
    var coord, c;
    for(coord in coords) {
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
    "getInfo": getInfo
  };
})();

var GameView = (function() {
	var tpl = "game.html";
	
	function onLoad(pass) {
		var x, y, grid;

		// Populate the grid
		grid = $("#grid")
		for(y = 0; y < pass['size']; y++) {
			tr = $("<tr id='"+y+"'></tr>").appendTo(grid)
			for(x = 0; x < pass['size']; x++) {
				$("<td id='"+x+"_"+y+"' class='hidden'>&nbsp;</td>").appendTo(tr)
			}
		}
	}

	return {
		"tpl": tpl,
	 	"onLoad": onLoad
	}
})();

var GameView = (function() {
	var tpl = "game.html";
	var gid, color, uid, view_size;
	
	/*
	 * INITIAL LOADING FUNCTIONS/CALLBACKS
	 */
	function onLoad(pass) {
		var x, y, grid;

		gid = pass['gid'];
		color = pass['color'];

		// Start the client
		GameClient.connect(joinGame)
		// Populate the grid
		grid = $("#grid")
		for(y = 0; y < pass['size']; y++) {
			tr = $("<tr id='"+y+"'></tr>").appendTo(grid)
			for(x = 0; x < pass['size']; x++) {
				$("<td id='"+x+"_"+y+"' class='hidden'>&nbsp;</td>").appendTo(tr)
			}
		}
	}

	function postFade(pass) {
		view_size = [$("#container").width(), $("#container").height()];
		GameEvents.setupKeys()
	}

	function joinGame() {
		GameClient.send("joinGame", {
			"gid": gid,
			"color": color
		}, joinGameCb);
	}

	function joinGameCb(data) {
		if(data['status'] != 200) {
			return alert("Something went wrong while trying to join the room! " + data['status']);
		}
	}

	/*
	 * GAME INTERFACE FUNCTIONS
	 */
	function panViewport(x, y) {
		var cont;
		cont = $("#container");
		cont.scrollTop(cont.scrollTop() - y);
		cont.scrollLeft(cont.scrollLeft() + x);
	}

	function setViewport(x, y) {
		var cont;
		cont = $("#container");
		cont.scrollTop(view_size[1] - y);
		cont.scrollLeft(x);
	}

	return {
		"tpl": tpl,
		"onLoad": onLoad,
		"postFade": postFade,

		// Variables
		"view_size": view_size,

		// Public methods
		"panViewport": panViewport,
		"setViewport": setViewport
	}
})();

var GameView = (function() {
	var tpl = "game.html";
	var gid;
	var color;
	var uid;
	
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

		alert("Joined the room!");
	}

	return {
		"tpl": tpl,
	 	"onLoad": onLoad
	}
})();

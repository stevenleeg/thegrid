var GameView = (function() {
	var tpl = "game.html";
	var gid, color, uid, view_size, size;
	
	/*
	 * INITIAL LOADING FUNCTIONS/CALLBACKS
	 */
	function onLoad(pass) {
		var x, y, grid;

		gid = pass['gid'];
		color = pass['color'];
		size = pass['size'];

		if(pass['uid'] != undefined) {
			Grid.uid = pass['uid'];
		}

		// Start the client
		AsyncClient.connect(joinGame)
		// Populate the grid
		grid = $("#grid")
		for(y = 0; y < pass['size']; y++) {
			tr = $("<tr id='"+y+"'></tr>").appendTo(grid)
			for(x = 0; x < pass['size']; x++) {
				$("<td id='"+x+"_"+y+"'>&nbsp;</td>").appendTo(tr)
			}
		}
	}

	function postFade(pass) {
		view_size = [$("#container").width(), $("#container").height()];
		GameEvents.setupKeys()
	}

	function joinGame() {
		if(Grid.uid != undefined) {
			AsyncClient.send("rejoinGrid", {
				"uid": Grid.uid
			}, rejoinGameCb);
		} else {
			AsyncClient.send("joinGrid", {
				"gid": gid,
				"color": color
			}, joinGameCb);
		}
	}

	function rejoinGameCb(data) {
		if(data['status'] == 404) {
			$.cookie("uid", null);
			return ViewController.load(HomeView);
		}
		if(data['status'] != 200) {
			alert("Something went wrong while trying to join the room! " + data['status']);
			$.cookie("uid", null);
			ViewController.load(HomeView);
		}
		Grid.colors = data['colors'];
		pid = data['pid'];
		color = data['color'];
		Grid.load(data['coords']);
	}
	function joinGameCb(data) {
		if(data['status'] != 200) {
			alert("Something went wrong while trying to join the room! " + data['status']);
			ViewController.load(HomeView)
		}
		Grid.colors = data['colors'];
		pid = data['pid'];
		uid = data['uid'];
		$.cookie("uid", uid, 1);
		$.cookie("size", size, 1);
		Grid.load(data['coords']);
	}

	/*
	 * GAME INTERFACE FUNCTIONS
	 */
	function panViewport(x, y) {
		var cont;
		cont = $("#container");
		cont.scrollTop(cont.scrollTop() + y);
		cont.scrollLeft(cont.scrollLeft() + x);
	}

	function setViewport(x, y) {
		var cont;
		cont = $("#container");
		cont.scrollTop(y);
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

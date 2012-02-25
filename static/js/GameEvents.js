var GameEvents = (function() {
	var scrolling = {};

	function moveViewport(e) {
		var x, y, move;
		if(scrolling[e.which] != undefined) {
			return;
		}
		x = 0;
		y = 0;
		move = 10;
		switch(e.which) {
			case 38: // Up
				y = -move;
				break;
			case 40: // Down
				y = move;
				break;
			case 37: // Left
				x = -move;
				break;
			case 39: // Right
				x = move;
				break;
		}

		scrolling[e.which] = setInterval(function() {
			GameView.panViewport(x, y);
		}, 10);
	}

	function stopMoveViewport(e) {
		clearInterval(scrolling[e.which]);
		delete scrolling[e.which];
	}

	function placeTile(e) {
		var color, coord;
		if($(e.target).hasClass("place_good") == false) {
			return;
		}

		// Make sure they have enough cash for it
		if(GameView.getCash() < TileProps[Grid.place_type]['price']) {
			BaseUI.notify("Not enough cash", true);
			return;
		}

		color = Grid.colors[Grid.pid];
		coord = $(e.target).attr("id");
		Grid.place(coord, Grid.place_type, color);

		AsyncClient.send("place", {
			"coord": coord,
			"tile": Grid.place_type,
			"color": color
		}, placeTileCb);

		Grid.normalMode();
		GameView.returnMain();
	}

	function placeTileCb(data) {
		if(data['status'] != 200) {
			Grid.destroy(data['coord']);
		}
	}

	return {
		"placeTile": placeTile,
		"moveViewport": moveViewport,
		"stopMoveViewport": stopMoveViewport,
	};
})();

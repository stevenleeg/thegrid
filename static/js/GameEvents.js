var GameEvents = (function() {
	var scrolling = {};

	function setupKeys() {
		//key('up, down, left, right', moveViewport);
		$(document).bind("keydown","up down left right", moveViewport)
		$(document).bind("keyup","up down left right", stopMoveViewport)
	}

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

	function placeTile() {
		var color, coord;
		if($(this).hasClass("place_good") == false) {
			return;
		}
		if(Grid.place_type == 1) {
			color = Grid.colors[Grid.pid];
		}
		coord = $(this).attr("id");
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
		"setupKeys": setupKeys,
		"placeTile": placeTile,
	};
})();

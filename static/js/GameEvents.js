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
		var color;
		if(Grid.place_type == 1) {
			color = Grid.colors[Grid.pid];
		}
		Grid.place($(this).attr("id"), Grid.place_type, color);

		Grid.normalMode();
		GameView.returnMain();
	}

	return {
		"setupKeys": setupKeys,
		"placeTile": placeTile,
	};
})();

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

	function placeTile(coord) {
		var t, grid;
        grid = coord.getData("grid");
		if(coord.getData("place") != true) {
			return;
		}

		// Make sure they have enough cash for it
		if(GameView.getCash() < TileProps[grid.place_type]['price']) {
			BaseUI.notify("Not enough cash", true, 2);
			return;
		}

		// And territory
		t = GameView.getTerritory();
		if(grid.place_type == 1 && t[0] >= t[1]) {
			BaseUI.notify("Not enough territory. Place more houses", true, 1);
			return;
		}

        // Place the tile
        coord.destroy();
        coord.setOwner(GameData['pid']);
        coord.setType(grid.place_type);
        coord.setHealth(TileProps[grid.place_type]['health']);

		AsyncClient.send("place", {
			"coord": coord.str,
			"tile": grid.place_type,
		}, placeTileCb);

		grid.normalMode();
		GameView.returnMain();
	}

	function placeTileCb(data) {
		if(data['status'] != 200) {
			GameData['grid'].get(data['coord']).destroy();
		}
	}

    function rotate(coord) {
        AsyncClient.send("rotate", {
            "coord": coord.str,
            "rot": coord.getData("rot")
        });
    }

	return {
		"placeTile": placeTile,
        "rotate": rotate,
		"moveViewport": moveViewport,
		"stopMoveViewport": stopMoveViewport,
	};
})();

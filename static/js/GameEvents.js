var GameEvents = (function() {
	function setupKeys() {
		//key('up, down, left, right', moveViewport);
	}

	function moveViewport(e, h) {
		switch(h.shortcut) {
			case "up":
				GameView.panViewport(0,5);
				break;
			case "down":
				GameView.panViewport(0, -5);
				break;
			case "left":
				GameView.panViewport(-5, 0);
				break;
			case "right":
				GameView.panViewport(5, 0);
				break;
		}
	}

	return {
		"setupKeys": setupKeys
	};
})();

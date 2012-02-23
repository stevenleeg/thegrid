var GameClient = (function() {
	function test(data) {
		alert(data['hello']);
	}

	function set(data) {
		Grid.place(data['coord'], data['tile'], Grid.colors[data['player']]);
		$("#" + data['coord']).data("player", data['player']);
		$("#" + data['coord']).data("health", data['health']);
	}

	function addPlayer(data) {
		Grid.colors[data['pid']] = data['color'];
		BaseUI.notify("A new player has joined");
	}

	return {
		"test": test,
	 	"set": set,
	 	"addPlayer": addPlayer,
	}
})();

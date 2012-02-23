var GameClient = (function() {
	function test(data) {
		alert(data['hello']);
	}

	function set(data) {
		Grid.place(data['coord'], data['tile'], Grid.colors[data['player']]);
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

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

	function newMessage(data) {
		BaseUI.newMessage(Grid.colors[data['pid']], data['text']);
	}

	function setCash(data) {
		GameView.setCash(data['cash']);
	}

	function setInc(data) {
		GameView.setIncome(data['inc']);
	}

	return {
		"test": test,
	 	"set": set,
	 	"addPlayer": addPlayer,
		"newMessage": newMessage,
		"setCash": setCash,
		"setInc": setInc,
	}
})();

var GameClient = (function() {
	function test(data) {
		alert(data['hello']);
	}

	function set(data) {
		Grid.place(data['coord'], data['tile'], Grid.colors[data['player']]);
	}

	return {
		"test": test,
	 	"set": set,
	}
})();

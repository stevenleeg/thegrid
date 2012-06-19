var GameClient = (function() {
	function test(data) {
		alert(data['hello']);
	}

    function startGame(data) {
        ViewController.load(GameView);
    }

	function set(data) {
        var coord = GameData['grid'].get(data['coord']);
        coord.destroy();

        coord.setOwner(data['player']);
        coord.setType(data['tile']);
        coord.setHealth(data['health']);
	}

	function addPlayer(data) {
        GameData['players_active'].push(data['pid']);
        if(GameData['active'] == true) BaseUI.notify("A new player has joined");
        else {
            $("#p" + data['pid']).css("background", GameData['colors'][data['pid']]);
            if(GameData['players_active'].length > 1) $("input[name=start]").removeClass("disabled");
        }
	}

	function delPlayer(data) {
        var index = GameData['players_active'].indexOf(data['pid']);
        GameData['players_active'].splice(index, 1);
        if(GameData['active'] == true) BaseUI.notify("A player has disconnected");
        else {
            $("#p" + data['pid']).css("background", "");
            if(GameData['players_active'].length <= 1) $("input[name=start]").addClass("disabled");
        }
	}

	function newMessage(data) {
		BaseUI.newMessage(GameData['colors'][data['pid']], data['text']);
	}

	function setCash(data) {
		GameView.setCash(data['cash']);
	}

	function setInc(data) {
		GameView.setIncome(data['inc']);
	}

	function del(data) {
		Grid.destroy(data['coord'])
	}

	function setTerritory(data) {
		GameView.setTerritory(data['tused'], data['tlim']);
	}

	function setHealth(data) {
        var coord = GameData['grid'].get(data['coord']);
        coord.setHealth(data['health']);
        coord.pingHealth();
	}

    function rotate(data) {
        var coord = GameData['grid'].get(data['coord']);
        coord.rotate(data['rot'], true);
    }

    function newGrid(data) {
        if(ViewController.current != HomeView) return;
        ViewController.current.grids[data['gid']] = data;
        ViewController.current.gridList.addItem([data['name'], data['players'] + " players"], data['gid']);
    }

	return {
		"test": test,
	 	"set": set,
        "startGame": startGame,
	 	"addPlayer": addPlayer,
        "delPlayer": delPlayer,
		"newMessage": newMessage,
		"setCash": setCash,
		"setInc": setInc,
		"del": del,
		"setTerritory": setTerritory,
		"setHealth": setHealth,
        "rotate": rotate,
        "newGrid": newGrid,
	}
})();

var GameClient = (function() {
	function test(data) {
		alert(data['hello']);
	}

    function startGame(data) {
        ViewController.load(GameView);
    }

	function set(data) {
        var c;
        var exists = true;
        if($("#" + data['coord']).attr("class") == undefined) exists = false;
        c = new Coord(data['coord']);

        c.destroy();
		Grid.place(c, data['tile'], GameData['colors'][data['player']]);

		c.dom.data("player", data['player'])
            .data("health", data['health']);

        if(parseInt(data['player']) == GameData['pid'] && parseInt(data['tile']) > 1) {
            c.dom.addClass("t1");
        }
		Grid.setHealth(c, parseInt(data['health']));
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
        var coord = new Coord(data['coord']);
		Grid.setHealth(coord, data['health']);
		Grid.pingHealth(coord);
	}

    function newGrid(data) {
        $("#loading_list").hide();
        $("<tr><td>"+ data['name'] +"</td><td>"+ data['players'] +" players</td></tr>")
            .appendTo(".gridlist")
            .data("gid", data['gid'])
            .data("active", data['active'])
            .data("name", data['name'])
            .data("size", data['size']);
        HomeView.setupList();
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
        "newGrid": newGrid
	}
})();

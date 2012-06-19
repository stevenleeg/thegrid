var HomeView = (function() {
    var tpl = "home.html";
    this.grids = {};

    function onLoad() {
        var xTiles, yTiles, grid;
        
        // Load list views
        this.gridList = new BaseUI.List("#gridList", function(val) {
            GameData['gid'] = val;
            GameData['size'] = parseInt(this.grids[val]['size']);
            GameData['name'] = this.grids[val]['name'];
            GameData['active'] = this.grids[val]['active'];
        });
        this.serverList = new BaseUI.List("#serverList", function(val) {
            GameData['server'] = val;
            $("#connect").removeClass("disabled");
        });

        // If we've connected to a server try to load it up
        if(GameData['server'])
            fetchGrids();
        else {
            $("#screen").show();
            $("#server_browser").show();
            this.serverList.addItem(["thegrid public"], 'localhost:8080');
        }

        $("#enter").click(function() {
            if(GameData['active'] == 1) ViewController.load(GameView);
            else enterRoom();
        });

        $("#connect").click(function() {
            fetchGrids();
            $("#server_browser, #screen").fadeOut(150);
            $("#connection_server").text(GameData['server']);
            $("#connection").show();
        });

        $(".side_menu a").on("click", function() {
            if($(".fade.open").attr("id") == $(this).attr("fade")) return;

            $(".side_menu a.selected").removeClass("selected");
            $(this).addClass("selected");

            $(".fade").fadeOut(250).removeClass("open");
            $("#" + $(this).attr("fade")).fadeIn(250).addClass("open");
            HomeView.current = $(this).attr("fade");
        });

		$("a.option").click(BaseUI.optionSelect);
		$("input[name=create]").click(createGame);
        $("input[name=start]").on("click", startGame);
    }

    // Makes sure we're connected to the server
    // and then fetches a list of active grids
    // for the player to join
    function fetchGrids() {
        AsyncClient.connect(function() {
            AsyncClient.send("getGrids", {}, getGridsCb);
        });
    }

    function getGridsCb(data) {
        var grids = data['grids'];
        $("#loading_list").hide();
        for(grid in grids) {
            this.gridList.addItem([grids[grid]['name'], grids[grid]['players'] + " players"], grids[grid]['gid']);
            this.grids[grids[grid]['gid']] = grids[grid];
        }

        if(grids.length == 0) {
            ViewController.current.gridList.setLoadingText("No grids found.");
        }
    }

	function createGame() {
		SyncClient.post("grid/create", {
			"name": $("input[name=room]").val(),
			"size": $("input[name=size]").val(),
		}, createGameCb);
	}

	function createGameCb(data) {
		if(data['status'] != 200) {
			alert("Error! " + data['status']);
			return;
		}

        GameData['gid'] = data['gid'];
        GameData['size'] = parseInt($("input[name=size]").val());
        GameData['name'] = $("input[name=room]").val();
		enterRoom();
	}

    /*
     * Waiting room stuff
     */
    function enterRoom() {
        AsyncClient.send("joinRoom", {gid: GameData['gid'], pid: GameData['pid']}, joinRoomCb);
        $("#menu_lobby").text(GameData['name'] + " lobby").addClass("selected").fadeIn(250);
        $(".side_menu a.selected").removeClass("selected");
    }

    function startGame() {
        if(GameData['players_active'].length <= 1) return;

        AsyncClient.send("startGame");
    }

    function joinRoomCb(data) {
        // Load the game data
        GameData['pid'] = parseInt(data['pid']);
        GameData['colors'] = data['colors'];
        GameData['color'] = GameData['colors'][GameData['pid']];
        GameData['players_active'] = data['active'];
        GameData['active'] = false;
        GameData['has_init'] = true;

        // Update the UI
        $("#roomname").text(GameData['name']);
        $.each(GameData['players_active'], function(i, pid) {
            $("#p" + pid).css("background", GameData['colors'][pid]);
        });

        if(GameData['active'].length > 1) {
            $("input[name=start]").removeClass("disabled");
        }
        $(".open").removeClass("open");
        $("#waiting").fadeIn(250).addClass("open");
    }

    return {
        "tpl": tpl,
        "onLoad": onLoad,
    }
})();

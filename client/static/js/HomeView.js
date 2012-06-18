var HomeView = (function() {
    var tpl = "home.html";

    function onLoad() {
        var xTiles, yTiles, grid;
        
        // Load list views
        this.gridList = new BaseUI.List("#gridList");
        this.serverList = new BaseUI.List("#serverList", function(val) {
            GameData['server'] = val;
        });

        if(GameData['server'])
            fetchGrids();
        else {
            $("#screen").show();
            $("#server_browser").show();
            this.serverList.addItem(["thegrid public"], 'localhost:8080');
        }

        $("#enter").click(function() {
            var selected = $(".gridlist tr.selected");
            if(selected.length == 0) {
                return;
            }
            GameData['gid'] = selected.data("gid");
            GameData['size'] = parseInt(selected.data("size"));
            GameData['name'] = selected.data("name");
            if(selected.data("active") == 1) ViewController.load(GameView);
            else enterRoom();
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
            $("<tr><td>"+ grids[grid]['name'] +"</td><td>"+ grids[grid]['players'] +" players</td></tr>")
                .appendTo(".gridlist")
                .data("gid", grids[grid]['gid'])
                .data("active", grids[grid]['active'])
                .data("name", grids[grid]['name'])
                .data("size", grids[grid]['size']);
        }

        if(grids.length == 0) {
            $("#loading_list").text("No grids found.").show();
        }
        setupList();
    }

    function setupList() {
        $(".gridlist tr").off().click(function(e) {
            $(".gridlist tr.selected").removeClass("selected");
            $(this).addClass("selected");
            $("#enter").removeClass("disabled");
        });
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
        "setupList": setupList,
    }
})();

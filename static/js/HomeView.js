var HomeView = (function() {
    var tpl = "home.html";

    function onLoad() {
        var xTiles, yTiles, grid;
        AsyncClient.connect(function() {
            AsyncClient.send("getGrids", {}, getGridsCb);           
        });
        $("#enter").click(function() {
            var selected = $(".gridlist tr.selected");
            if(selected.length == 0) {
                return;
            }
            GameData['gid'] = selected.data("gid");
            GameData['size'] = parseInt(selected.data("size"));
            GameData['name'] = selected.data("name");
            if(selected.data("active") == 1) ViewController.load(GameView);
            else ViewController.load(RoomView);
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
        $(window).resize(windowResize);

        generateGrid();
    }

    function generateGrid() {
        // Populate the homegrid based on the window size
        HomeView.x_tiles = parseInt($(window).width() / 32) + 2;
        HomeView.y_tiles = parseInt($(window).height() / 32) + 2;
        grid = $("#home_grid").html("");
        $(".grid_container").css("width", $(window).width()).css("height", $(window).height())
		for(var y = 0; y < HomeView.y_tiles; y++) {
			tr = $("<tr id='"+y+"'></tr>").appendTo(grid)
			for(var x = 0; x < HomeView.x_tiles; x++) {
				$("<td id='"+x+"_"+y+"'>&nbsp;</td>").appendTo(tr)
			}
        }
    }

    function windowResize() {
        clearTimeout(HomeView.resize_to);
        HomeView.resize_to = setTimeout(generateGrid, 250);
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
		ViewController.load(RoomView);
	}


    return {
        "tpl": tpl,
        "onLoad": onLoad,
        "setupList": setupList
    }
})();

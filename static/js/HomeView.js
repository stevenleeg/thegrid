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

    // Background animation stuff
    // Compass starts at 0 and goes clockwise
    function startBgAnimation() {
        HomeView.anim = setInterval(proceedBgAnimation, 50);
        HomeView.dots = [];
        sendBgWave();
    }
    function sendBgWave() {
        var classes = ["blue", "green", "red", "yellow"];
        var elems = $("#home_grid tr:first-child td").get().sort(function(){ 
          return Math.round(Math.random())-0.5
        }).slice(0,1)
        $(elems).each(function() {
            var coord = Grid.parseCoord($(this).attr("id"));
            var cls = classes[Math.floor(Math.random() * classes.length)]; 
            $("#" + coord[0] + "_" + coord[1]).addClass(cls);
            HomeView.dots.push({"x": coord[0], "y": coord[1], "class": cls});
        });
        HomeView.wave = setTimeout(sendBgWave, Math.floor(Math.random() * (500 - 200 + 1)) + 200); 
    }

    function proceedBgAnimation() {
        $.each(HomeView.dots, function(i, dot) {
            var coord, dir, next;
            if(dot == undefined) return;
            coord = $("#" + dot['x'] + "_" + dot['y']);
            dir = checkDir(dot['x'], dot['y'], 2);
            if(dir != true) {
                HomeView.dots.splice(i, 1);
                coord.removeClass(dot['class']);
                return;
            }
            next = getMovedCoords(dot['x'], dot['y'], 2);
            coord.removeClass(dot['class']);
            coord = $("#" + next[0] + "_" + next[1]);
            coord.addClass(dot['class']);
            HomeView.dots[i]['x'] = next[0];
            HomeView.dots[i]['y'] = next[1];
        });
    }

    function stopBgAnimation() {
        clearInterval(HomeView.anim);
        clearTimeout(HomeView.wave);
    }

    function checkDir(x, y, d) {
        var next;
        next = getMovedCoords(x, y, d);
        if($("#"+ next[0] + "_" + next[1]).length == 0) {
            return false
        } else return true;
    }

    function getMovedCoords(x, y, d) {
        switch(d) {
            case 0:
                y--;
                break;
            case 1:
                x++;
                break;
            case 2:
                y++;
                break;
            case 3:
                x--;
                break;
        }
        return [x, y];
    }

    function generateGrid() {
        // Populate the homegrid based on the window size
        HomeView.x_tiles = parseInt($(window).width() / 32) - 1;
        HomeView.y_tiles = parseInt($(window).height() / 32) - 1;
        grid = $("#home_grid").html("");
        $(".grid_container").css("width", $(window).width()).css("height", $(window).height())
		for(var y = 0; y < HomeView.y_tiles; y++) {
			tr = $("<tr id='"+y+"'></tr>").appendTo(grid)
			for(var x = 0; x < HomeView.x_tiles; x++) {
				$("<td id='"+x+"_"+y+"'>&nbsp;</td>").appendTo(tr)
			}
        }
        startBgAnimation();
    }

    function windowResize() {
        stopBgAnimation();
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
        "startBgAnimation": startBgAnimation,
        "stopBgAnimation": stopBgAnimation,
        "sendBgWave": sendBgWave,
        "setupList": setupList,
    }
})();

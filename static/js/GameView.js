var GameView = (function() {
	var tpl = "game.html";
	var gid, uid, view_size, size;
	
	/*
	 * INITIAL LOADING FUNCTIONS/CALLBACKS
	 */
	function onLoad(pass) {
		var x, y, grid, open;

		gid = pass['gid'];
		color = pass['color'];
		size = pass['size'];

		if(pass['uid'] != undefined) {
			Grid.uid = pass['uid'];
		}

		// Start the client
		AsyncClient.connect(joinGame)
		// Populate the grid
		grid = $("#grid")
		for(y = 0; y < pass['size']; y++) {
			tr = $("<tr id='"+y+"'></tr>").appendTo(grid)
			for(x = 0; x < pass['size']; x++) {
				$("<td id='"+x+"_"+y+"'>&nbsp;</td>").appendTo(tr)
			}
		}

		setupEvents();
		Grid.setupEvents();
	}

	function postFade(pass) {
		view_size = [$("#container").width(), $("#container").height()];
	}

	function setupEvents() {
		$(".menu").click(clickMenu);
		$(".submenu a").on("click",selectType);

		KeyEvents.setup();
	}

	function joinGame() {
		if(Grid.uid != undefined) {
			AsyncClient.send("rejoinGrid", {
				"uid": Grid.uid
			}, rejoinGameCb);
		} else {
			AsyncClient.send("joinGrid", {
				"gid": gid,
				"color": color
			}, joinGameCb);
		}
	}

	function rejoinGameCb(data) {
		if(data['status'] == 404) {
			$.cookie("uid", null);
			Grid.uid = undefined;
			return ViewController.load(HomeView);
		}
		if(data['status'] != 200) {
			alert("Something went wrong while trying to join the room! " + data['status']);
			$.cookie("uid", null);
			ViewController.load(HomeView);
		}
		Grid.colors = data['colors'];
		Grid.pid = data['pid'];
		Grid.color = data['color'];
		Grid.load(data['coords']);
		GameView.setCash(data['cash']);
		GameView.setIncome(data['inc']);
		GameView.setTerritory(parseInt(data['tused']), parseInt(data['tlim']));
	}

	function joinGameCb(data) {
		if(data['status'] != 200) {
			alert("Something went wrong while trying to join the room! " + data['status']);
			ViewController.load(HomeView)
		}
		Grid.colors = data['colors'];
		Grid.pid = data['pid'];
		Grid.uid = data['uid'];
		$.cookie("uid", Grid.uid, 1);
		$.cookie("size", size, 1);
		Grid.load(data['coords']);
		GameView.setCash(data['cash']);
		GameView.setIncome(data['inc']);
		GameView.setTerritory(parseInt(data['tused']), parseInt(data['tlim']));
	}

	/*
	 * GAME INTERFACE FUNCTIONS
	 */
	function panViewport(x, y) {
		var cont;
		cont = $("#container");
		cont.scrollTop(cont.scrollTop() + y);
		cont.scrollLeft(cont.scrollLeft() + x);
	}

	function setViewport(x, y) {
		var cont;
		cont = $("#container");
		cont.scrollTop(y);
		cont.scrollLeft(x);
	}

	function setCash(amt) {
		current = parseInt($("#cash").text());
		if(amt < current) {
			$("#cash").css("color", "#FF0000");
			$("#cash").animate({"color": "#1D1D1D"}, 500);
		} else if(amt > current) {
			$("#cash").css("color", "#00FF00");
			$("#cash").animate({"color": "#1D1D1D"}, 500);
		}
		$("#cash").text(amt);
	}

	function setIncome(val) {
		current = parseInt($("#inc").text());
		if(val < current) {
			$("#inc").css("color", "#FF0000");
			$("#inc").animate({"color": "#1D1D1D"}, 500);
		} else if(val > current) {
			$("#inc").css("color", "#00FF00");
			$("#inc").animate({"color": "#1D1D1D"}, 500);
		}
		$("#inc").text(val);
	}

	function setTerritory(tused, tlim) {
		if(tused > 0) {
			$("#tused").text(tused);
		}
		if(tlim > 0) {
			$("#tlim").text(tlim);
		}
	}

	function getCash() {
		return parseInt($("#cash").text());
	}

	/*
	 * Menu interactions
	 */
	function clickMenu(e) {
		var menu;
		menu = $(e.target)
		open = menu.attr("opens");
		$(".menu").fadeOut(50, function() {
			menu.addClass("selected");
			$(".menu.selected, #menu_"+open).fadeIn(50)
		});
		$(menu).off().click(returnMain);
		KeyEvents.setScope("build", returnMain);
	}

	function returnMain() {
		var menu;
		menu = $(".menu.selected");
		deselectType();
		$(".menu.selected, #menu_" + open).fadeOut(50, function() {
			$(menu).off().click(clickMenu);
			menu.removeClass("selected");
			$(".menu").fadeIn(50);
		});
		KeyEvents.clearScope();
	}

	function selectType(e) {
		var places;
		$(e.target).addClass("selected");
		$(".submenu a").off("click", selectType).on("click",deselectType);
		$(".submenu a:not(.selected)").hide();
		places = $(e.target).attr("places");
		Grid.placeMode(places);
		KeyEvents.setScope("place", returnMain);
	}

	function deselectType() {
		$(".submenu a.selected").removeClass("selected");
		$(".submenu a").show();
		$(".submenu a").off("click", deselectType).on("click",selectType);
		Grid.normalMode();
		KeyEvents.setScope("build", returnMain);
	}

	return {
		"tpl": tpl,
		"onLoad": onLoad,
		"postFade": postFade,

		// Variables
		"view_size": view_size,

		// Public methods
		"panViewport": panViewport,
		"setViewport": setViewport,
		"setCash": setCash,
		"getCash": getCash,
		"setIncome": setIncome,
		"setTerritory": setTerritory,
		"clickMenu": clickMenu,
		"selectType": selectType,
		"deselectType": deselectType,
		"returnMain": returnMain
	}
})();

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

		setupEvents()
	}

	function postFade(pass) {
		view_size = [$("#container").width(), $("#container").height()];
		GameEvents.setupKeys()
	}

	function setupEvents() {
		$(".menu").click(clickMenu);
		$(".submenu a").on("click",selectType);
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


	/*
	 * Menu interactions
	 */
	function clickMenu() {
		var menu;
		menu = $(this)
		open = menu.attr("opens");
		$(".menu").fadeOut(50, function() {
			menu.addClass("selected");
			$(".menu.selected, #menu_"+open).fadeIn(50)
		});
		$(menu).off().click(returnMain);
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
	}

	function selectType() {
		var places;
		$(this).addClass("selected");
		$(".submenu a").off("click", selectType).on("click",deselectType);
		$(".submenu a:not(.selected)").hide();
		places = $(this).attr("places");
		Grid.placeMode(places);
	}

	function deselectType() {
		$(".submenu a.selected").removeClass("selected");
		$(".submenu a").show();
		$(".submenu a").off("click", deselectType).on("click",selectType);
		Grid.normalMode();
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
		"deselectType": deselectType,
		"returnMain": returnMain
	}
})();

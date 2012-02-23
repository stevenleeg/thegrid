var KeyEvents = (function() {
	var scope = "main";
	var callback = function() {};

	function setup() {
		$(document).bind("keyup", "esc", esc);
		$(document).bind("keypress", "b", b);
		$(document).bind("keypress", "t", t);

		$(document).bind("keydown","up down left right", GameEvents.moveViewport)
		$(document).bind("keyup","up down left right", GameEvents.stopMoveViewport)
	}

	function setScope(to, backCb) {
		KeyEvents.scope = to;
		if(backCb == undefined) {
			KeyEvents.callback = function() {};
		} else {
			KeyEvents.callback = backCb;
		}
	}

	function esc() {
		KeyEvents.scope = "main";
		KeyEvents.callback();
	}

	function b() {
		var e = {};
		if(KeyEvents.scope == "main") {
			e.target = $(".menu[opens=buildings]");
			GameView.clickMenu(e)
			setScope("build", GameView.returnMain);
		}
	}

	function t() {
		var e = {};
		if(KeyEvents.scope == "build") {
			e.target = $(".submenu a[places=1]");
			GameView.selectType(e);
			setScope("place", GameView.returnMain);
		}
	}

	return {
		"setup": setup,
	 	"setScope": setScope,
		"scope": scope
	};
})();

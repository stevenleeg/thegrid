var KeyEvents = (function() {
	var scope = "main";
	var callback = function() {};

	function setup() {
		$(document).bind("keydown", "esc", esc);
		$(document).bind("keypress", "b", b);
		$(document).bind("keypress", "t", t);
		$(document).bind("keypress", "m", m);
		$(document).bind("keypress", "h", h);
		$(document).bind("keypress", "a", a);
		$(document).bind("keypress", "f", f);
		$(document).bind("keypress", "d", d);
		$(document).bind("keypress", "w", w);

		$(document).bind("keydown","up down left right", GameEvents.moveViewport)
		$(document).bind("keyup","up down left right", GameEvents.stopMoveViewport)
		$(document).bind("keydown", "return", enter);
	}

	function setScope(to, backCb) {
		KeyEvents.scope = to;
		if(backCb == undefined) {
			KeyEvents.callback = function() {};
		} else {
			KeyEvents.callback = backCb;
		}
	}

	function clearScope() {
		KeyEvents.scope = "main";
		KeyEvents.callback = function() {};
	}

	function esc() {
		KeyEvents.scope = "main";
		KeyEvents.callback();
	}

	function h() {
		var e = {};
		if(KeyEvents.scope == "buildings") {
			e.target = $(".submenu a[places=5]");
			GameView.selectType(e);
		}
	}

	function f() {
		var e = {};
		if(KeyEvents.scope == "attack") {
			e.target = $(".submenu a[places=4]");
			GameView.selectType(e);
		}
	}

    function d() {
        var e = {};
        if(KeyEvents.scope == "attack") {
            e.target = $(".submenu a[places=6]");
            GameView.selectType(e);
        } else if(KeyEvents.scope == "buildings") {
			e.target = $(".submenu a[places=8]");
			GameView.selectType(e);
		}
    }

	function a() {
		var e = {};
		if(KeyEvents.scope == "main") {
			e.target = $(".menu[opens=attack]");
			GameView.clickMenu(e)
		}
	}

	function b() {
		var e = {};
		if(KeyEvents.scope == "main") {
			e.target = $(".menu[opens=buildings]");
			GameView.clickMenu(e)
		}
	}

	function t() {
		var e = {};
		if(KeyEvents.scope == "buildings") {
			e.target = $(".submenu a[places=1]");
			GameView.selectType(e);
		}
	}

	function m() {
		var e = {};
		if(KeyEvents.scope == "buildings") {
			e.target = $(".submenu a[places=3]");
			GameView.selectType(e);
		}
	}

	function w() {
		var e = {};
		if(KeyEvents.scope == "buildings") {
			e.target = $(".submenu a[places=7]");
			GameView.selectType(e);
		}
	}

	function enter() {
		BaseUI.showChatbox();
	}

	return {
		"setup": setup,
	 	"setScope": setScope,
		"clearScope": clearScope,
		"scope": scope
	};
})();

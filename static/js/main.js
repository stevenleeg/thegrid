var ViewController = (function() {
	var current;

	function load(controller, pass) {
		// Be ready to display a loading box
		BaseUI.loading();

		// Create a temporary container for the new view
		$("<div id='content2'></div>").appendTo("body").hide();
		$("#content2").load("/static/tpl/" + controller.tpl, function() {
			// Fade the old content
			$("#content").fadeOut(250, function() {
				// Delete the old and set up the new 
				$("#content").remove();

				current = controller;
				current.onLoad(pass);

				// Fade in the new content and change its id to normal content
				$("#content2").fadeIn(250, function() {
					$("#content2").attr("id", "content")
					BaseUI.done()
				});
			});
		});
	}

	return {
		"current": current,
		"load": load,
	};
})();

var BaseUI = (function() {
	function loading() {
		load_timeout = setTimeout(function() {
			$("#loading").show();
		}, 600);
	}
	
	function done() {
		clearTimeout(load_timeout);
		$("#loading").hide();
	}

	function optionSelect(e) {
		var targ, selector, name;
		// Set some initial variables
		targ = $(e.target);
		selector = $(e.target).parent();
		name = selector.attr("name");
		
		// Set the value
		if($("input[name="+name+"]").length == 0) {
			// Create a hidden input for us
			$("<input name='"+name+"' type='hidden' />").appendTo(selector)
		}
		$("input[name="+name+"]").val(targ.attr("value"));

		// Now for styling
		$("a.option.selected").removeClass("selected");
		targ.addClass("selected");
	}

	return {
		"loading": loading,
	 	"done": done,
	 	"optionSelect": optionSelect
	};
})();

var SyncServer = (function() {
	function get(command, args, callback) {
		$.getJSON("/api/" + command, args, callback);
	}

	function post(command, args, callback) {
		$.post("/api/" + command, args, callback, "json");
	}

	return {
		"get": get,
	 	"post": post
	};
})();

$(document).ready(function() {
	ViewController.load(HomeView);
	// Artificially load a game
	/*
	ViewController.load(GameView,{ 
		"gid": 1,
		"size": 64,
		"color":"#FF0000"
	}); */
});

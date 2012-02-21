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
					if(current.hasOwnProperty("postFade")) {
						current.postFade(pass);
					}
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

var SyncClient = (function() {
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

var AsyncClient = (function() {
	var ws;
	var callbacks = {};

	function connect(callback) {
		ws = new WebSocket("ws://localhost:8080/api/socket");
		ws.onopen = callback; 
		ws.onmessage = newMessage;
		ws.onclose = closeSocket;
	}

	function send(func, data, callback) {
		// Generate a random callback identifier
		cid = parseInt(Math.random() * 100);

		data['f'] = func;
		data['cid'] = cid;
		ws.send(JSON.stringify(data));
		callbacks[cid] = callback;
	}

	function newMessage(evt) {
		data = JSON.parse(evt.data);
		// Run the callback for the identifier we get back
		if(data['cid'] == undefined) {
			GameClient[data['f']](data);
		} else {
			callbacks[data['cid']](data);
			delete callbacks[data['cid']];
		}
	}

	function closeSocket() {
		
	}

	return {
		"connect": connect,
		"send": send,
		"callbacks":callbacks,
		"ws": ws
	};
})();

$(document).ready(function() {
	if($.cookie("uid") != undefined) {
		ViewController.load(GameView, {
			"uid": $.cookie("uid"),
			"size": $.cookie("size"),
		});
	} else {
		ViewController.load(HomeView);
	}
	// Artificially load a game
	/*
	ViewController.load(GameView,{ 
		"gid": 1,
		"size": 64,
		"color":"#FF0000"
	}); */
});

$(document).unload(function() {
	if(AsyncClient.ws != undefined) {
		AsyncClient.ws.close()
	}
});

var GameData = {};

var ViewController = (function() {

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
                
                if(ViewController.current == undefined) ViewController.current = {};
                if(ViewController.current.hasOwnProperty("cleanup")) ViewController.current.cleanup();
				ViewController.current = controller;
				ViewController.current.onLoad(pass);

				// Fade in the new content and change its id to normal content
				$("#content2").fadeIn(250, function() {
					$("#content2").attr("id", "content")
					BaseUI.done()
					if(ViewController.current.hasOwnProperty("postFade")) {
						ViewController.current.postFade(pass);
					}
				});
			});
		});
	}
	return {
		"load": load,
	};
})();

var BaseUI = (function() {
	var show_msg = false;
	
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
		if(targ.hasClass("disabled")) {
			return;
		}
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

	function notify(message, error, typeid) {
		var notification;
        // See if we need to show it
        if(typeid != undefined && BaseUI.notif_disp.indexOf(typeid) != -1) {
            notification = $(".notifications .notification[typeid="+typeid+"]");
            clearInterval(notification.data("timeout"));
            notification.data("timeout", setTimeout(function() {
                notification.fadeOut(250, function() {
                    BaseUI.notif_disp.pop(BaseUI.notif_disp.indexOf(typeid), 1);
                    notification.remove();
                });
            }, 2000));
            return;
        } else if(typeid != undefined) {
            BaseUI.notif_disp.push(typeid);
        } else {
            typeid = 0;
        }
		// Yellow or red notification
		if(error) {
			notification = $("<div typeid="+typeid+" class='notification error'></div>");
		} else {
			notification = $("<div class='notification'></div>");
		}
		// Show it
		notification.hide().text(message).prependTo(".notifications").fadeIn(250);
		notification.click(function() {
			clearInterval($(this).data("timeout"));
			$(this).fadeOut(function() {
                if($(this).attr("typeid") != undefined) {
                    BaseUI.notif_disp.pop(BaseUI.notif_disp.indexOf(parseInt($(this).attr("typeid"))), 1);
                }
				$(this).remove();
			});
		});

		notification.data("timeout", setTimeout(function() {
			notification.fadeOut(250, function() {
                if($(this).attr("typeid") != undefined) {
                    BaseUI.notif_disp.pop(BaseUI.notif_disp.indexOf(parseInt($(this).attr("typeid"))), 1);
                }
				$(this).remove();
			});
		}, 2000));
	}

	function newMessage(color, text) {
		var msg;
		msg = $("<div class='message'>" + text + "</div>").hide().insertBefore("input[name=message]");
		msg.css("border-color", color);
		msg.data("in", true);
		if(!BaseUI.show_msg) {
			msg.fadeIn(500, function() {
				$(this).data("in", false);
			});
			msg.data("timeout", setTimeout(function() {
				msg.fadeOut(500);
			}, 3000));
		} else {
			msg.fadeIn(250, function() {
				$(this).data("in", false);
			});
		}
	}

	function showChatbox() {
		$(".chatbox .message").each(function() {
			clearTimeout($(this).data("timeout"));
			$(this).show();
		});
		$(".chatbox").addClass("show");
		$(".chatbox input").focus().bind("keydown", "return", hideChatbox);
		BaseUI.show_msg = true;
	}

	function hideChatbox() {
		$(".chatbox .message").each(function() {
			if(!$(this).data("in")) {
				$(this).hide();
			}
		});
		BaseUI.show_msg = false;
		msgbox = $(".chatbox input");
		$(".chatbox").removeClass("show");
		if(msgbox.val().length > 0) {
			newMessage(GameData['colors'][GameData['pid']], msgbox.val());
			AsyncClient.send("sendMessage", {
				"text": msgbox.val()
			}, sendMessageCb);
		}
		msgbox.val("").blur().off();
	}

	function sendMessageCb(data) {
		if(data['status'] != 200) {
			BaseUI.notify("There was an error while trying to send your message.", true);
		}
	}

    // List container element
    // element: The element of the list container
    // callback: The function to be called whenever an item
    // is selected. function(val)
    var List = function(element, callback) {
        if(callback == undefined) selectCallback = function() {};

        this.el = $(element);
        this.callback = callback;
        this.table = this.el.children("table");
        this.loading = this.el.children(".listcontainer_loading");

        function clickItem() {
            if($(this).hasClass("selected")) {
                $(this).removeClass("selected");
                $(this).data("list").callback(null);
            } else {
                $(this).siblings(".selected").removeClass("selected");
                $(this).addClass("selected");
                $(this).data("list").callback($(this).attr("value"));
            }
        }

        this.addItem = function(item, value) {
            this.loading.hide();
            var str = "<tr>";
            for(var i in item) {
                str += "<td>" + item[i] + "</td>";
            };
            str += "</tr>";
            var el = $(str);
            el.click(clickItem);
            el.attr("value", value);
            el.data("list", this);
            this.table.append(el);
        }

        this.setLoadingText = function(val) {
            this.loading.text(val);
        }
    }

	return {
		"loading": loading,
	 	"done": done,
	 	"optionSelect": optionSelect,
		"notify": notify,
		"newMessage": newMessage,
		"showChatbox": showChatbox,
		"hideChatbox": hideChatbox,
		"show_msg": show_msg,
        "notif_disp": [],
        "List": List
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
        if(ws != undefined && ws.readyState == ws.OPEN) return callback();

        if(GameData['server'] == undefined)
            ws = new WebSocket("ws://"+ document.domain + ":" + window.location.port + "/api/socket");
        else
            ws = new WebSocket("ws://" + GameData['server'] + "/api/socket")

		ws.onopen = callback; 
		ws.onmessage = newMessage;
		ws.onclose = closeSocket;
	}

	function send(func, data, callback) {
		// Generate a random callback identifier
		cid = parseInt(Math.random() * 100);

        if(data == undefined) data = {};
        if(callback == undefined) callback = function() {};

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
    
    function connected() {
        return ws.readyState == ws.OPEN;
    }

	return {
		"connect": connect,
        "connected": connected,
		"send": send,
		"callbacks":callbacks,
		"ws": ws
	};
})();

$(document).ready(function() {
    // Prevent annoying caching
    $.ajaxSetup({ cache: false });
    this.onselectstart = function() { return false; }

	if($.cookie("server") != undefined && $.cookie("gid") != undefined) {
        GameData['server'] = $.cookie("server");
        GameData['pid'] = $.cookie("pid");
        GameData['gid'] = $.cookie("gid");
        GameData['size'] = $.cookie("size");
		ViewController.load(GameView);
	} else {
		ViewController.load(HomeView);
	}
});

$(document).unload(function() {
	if(AsyncClient.ws != undefined) {
		AsyncClient.ws.close()
	}
});

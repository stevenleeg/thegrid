var CreateView = (function() {
	var tpl = "create.html";
	var color;
	
	function onLoad(pass) {
		// Register events
		$("a.option").click(BaseUI.optionSelect);
		$("input[name=create]").click(createGame);
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
		ViewController.load(RoomView);
	}

	return {
		"tpl": tpl,
	 	"onLoad": onLoad
	};
})();

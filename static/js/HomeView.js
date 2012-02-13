var HomeView = (function() {
	var tpl = "home.html"
	var load_timeout;
	// Private
	function roomEnterCb(data) {
		BaseUI.done();
		if(data['status'] == 200) {
			alert("Yeah it exists!");
		} else {
			ViewController.load(CreateView, {"name": $("input[name=room]").val()})
		}
	}
	
	// Public
	function onLoad(pass) {
		$("input[name=enter]").bind("click", roomEnter);
		$("a.option").bind("click", BaseUI.optionSelect);
	}
	// Called after clicking "enter" on the room select form
	function roomEnter(e) {
		var errors = false;
		// Make sure they have everything set
		if($("input[name=room]").val() == "") {
			$("input[name=room]").effect("highlight", { color: "#FF0000" });
			errors = true;
		}
		if($("input[name=color]").val() == "") {
			$(".colors").effect("highlight", { color: "#FF0000" });
			errors = true;
		}

		if(errors == true) {
			return
		}

		BaseUI.loading();
		SyncServer.get(
			"game/exists", 
			{ name: $("input[name=room]").val() },
			roomEnterCb
		);
	}

	// Release public methods/vars
	return {
		"tpl": tpl,
		"onLoad": onLoad,
		"roomEnter":roomEnter,
	};
})();

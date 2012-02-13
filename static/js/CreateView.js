var CreateView = (function() {
	var tpl = "create.html";
	
	function onLoad(pass) {
		if(pass != undefined) {
			$("input[name=room]").val(pass['name']);
		}
		// Register events
		$("a.option").click(BaseUI.optionSelect);
	}

	return {
		"tpl": tpl,
	 	"onLoad": onLoad
	};
})();

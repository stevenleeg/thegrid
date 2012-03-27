var HomeView = (function() {
    var tpl = "home.html";

    function onLoad() {
        AsyncClient.connect(function() {
            AsyncClient.send("getGrids", {}, getGridsCb);           
        });
        $("input[name=create]").click(function() {
            ViewController.load(CreateView);
        });
        $("input[name=enter]").click(function() {
            var selected = $(".gridlist tr.selected");
            if(selected.length == 0) {
                return;
            }
            ViewController.load(RoomView, {"gid": selected.data("gid"), "size": parseInt(selected.data("size"))});
        });
    }

    function getGridsCb(data) {
        var grids = data['grids'];
        $("#loading_list").hide();
        for(grid in grids) {
            $("<tr><td>"+ grids[grid]['name'] +"</td><td>"+ grids[grid]['players'] +" players</td></tr>").appendTo(".gridlist").data("gid", grids[grid]['gid']).data("size", grids[grid]['size']);
        }

        if(grids.length == 0) {
            $("#loading_list").text("No grids found.").show();
        }
        setupList();
    }

    function setupList() {
        $(".gridlist tr").off().click(function(e) {
            $(".gridlist tr.selected").removeClass("selected");
            $(this).addClass("selected");
            $("input[name=enter]").removeClass("disabled");
        });
    }

    return {
        "tpl": tpl,
        "onLoad": onLoad,
        "setupList": setupList
    }
})();

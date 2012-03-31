var RoomView = (function() {
    var tpl = "room.html";

    function onLoad() {
        AsyncClient.send("joinRoom", {gid: GameData['gid'], pid: GameData['pid']}, joinRoomCb);
    }

    function joinRoomCb(data) {
        // Load the game data
        GameData['pid'] = data['pid'];
        GameData['colors'] = data['colors'];
        GameData['color'] = GameData['colors'][GameData['pid']];
        GameData['active'] = data['active'];
        GameData['has_init'] = true;

        // Update the UI
        $.each(GameData['active'], function(i, pid) {
            $("#p" + pid).css("background", GameData['colors'][pid]);
        });

        if(GameData['active'].length > 1) {
            $("input[name=start]").removeClass("disabled");
        }
    }

    return {
        "tpl": tpl,
        "onLoad": onLoad
    };
})();

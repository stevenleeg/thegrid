var RoomView = (function() {
    var tpl = "room.html";

    function onLoad() {
        AsyncClient.send("joinRoom", {gid: GameData['gid'], pid: GameData['pid']}, joinRoomCb);
    }

    function joinRoomCb(data) {
        GameData['pid'] = data['pid'];
        GameData['colors'] = data['colors'];
        GameData['color'] = GameData['colors'][GameData['pid']];
        GameData['active'] = data['active'];
        GameData['has_init'] = true;
    }

    return {
        "tpl": tpl,
        "onLoad": onLoad
    };
})();

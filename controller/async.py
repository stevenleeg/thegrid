from model import Grid, User, TileAdd, TileProps
from utility import UpdateManager
from time import time

def test(handler, **args):
    return {"hello":"world"}

def exit(handler, **args):
    if handler.user.exists() is False:
        return {"status": 403}

    handler.on_close()
    handler.user['grid'] = None
    return {"status": 200}

def getGrids(handler, **args):
    grids = []
    for grid in Grid.all(inactive = True):
        grids.append({
            "gid": grid['id'],
            "name": grid['name'],
            "size": grid['size'],
            "players": len(grid.getUsers())
        })

    return {"status": 200, "grids": grids}

def joinRoom(handler, **args):
    try:
        g = Grid(args['gid'])
    except KeyError:
        return {"status": 404, "error": "no gid"}

    pid = None
    if "pid" in args:
        pid = args['pid']

    if g.exists() is False:
        return {"status":404, "error":"Grid not found."}

    # Add the user to the grid and UpdateManager
    pid = g.addUser(handler.user, pid)

    if pid is False:
        return { "status":406, "error": "Grid is full" }

    handler.user['pid'] = pid
    handler.user['grid'] = g['id']
    handler.user['active'] = True

    # Get a list of active players
    active = []
    for player in g.getPlayers():
        active.append(int(player['pid']))

    return {
        "status":200,
        "pid": pid,
        "active": active,
        "colors": g.getColors(),
    }

def joinGrid(handler, **args):
    try:
        #TODO: Sanity checks
        gid = args['gid']
    except KeyError:
        return {"status": 406, "error": "no gid"}

    pid = None
    if "pid" in args:
        pid = args['pid']

    g = Grid(gid)
    if g.exists() is False:
        return {"status":404, "error":"Grid not found."}

    # Add the user to the grid/UpdateManager
    pid = g.addUser(handler.user, pid)

    if pid is False:
        return { "status":406, "error": "Grid is full" }
    
    handler.user['pid'] = pid
    handler.user['grid'] = gid
    handler.user['active'] = True
    player = handler.user.getPlayer()

    # Looks like it's a new player, go ahead and init them
    if g.playerExists(pid) is False:
        player['cash'] = g['init_cash'] # Starting cash value
        player['inc'] = 0
        player['lastInc'] = int(time())
        player['tused'] = g['init_tused']
        player['tlim'] = g['init_tlim']

        updated = g.loadEvent("join_%s" % pid)
        # Add their new coords 
        for coord in updated:
            UpdateManager.sendCoord(g, coord, handler.user)

    # Announce our color to all other clients
    UpdateManager.sendGrid(g, "addPlayer", handler.user)

    return {
        "status":200,
        "uid": handler.user['id'],
        "pid": pid,
        "cash": player['cash'],
        "inc": player['inc'],
        "tused": player['tused'],
        "tlim": player['tlim'],
        "colors": g.getColors(),
        "color": player['color'],
        "coords": g.dump()
    }

def place(handler, **args):
    try:
        coord = args['coord']
        tile = int(args['tile'])
        props = TileProps[int(args['tile'])]
    except KeyError, ValueError:
        return { "status": 406 }

    g = Grid(handler.user['grid'])
    c = g.get(coord)
    player = handler.user.getPlayer()
    if c.exists() and c['type'] != "1" and tile not in [8, 10, 11]:
        return { "status":405, "coord": coord, "error": "coord exists" }

    try:
        placeable = TileAdd[tile](g, c, player)
    except KeyError:
        return { "status": 406, "coord": coord, "error": "invalid tile" }

    # If it's not placeable
    if placeable is False:
        return { "status": 412, "coord": coord, "error": "invalid placement" }

    # Make sure they have enough cash for it
    if int(player['cash']) < props['price']:
        return { "status": 412, "coord": coord, "error": "not enough cash" }

    # Make sure they have enough territory
    if tile == 1 and int(player['tused']) >= int(player['tlim']):
        return { "status": 412, "coord": coord, "error": "territory limit" }
    elif tile == 1:
        player['tused'] = int(player['tused']) + 1
        UpdateManager.sendClient(handler.user, "setTerritory", 
            tused = player['tused'],
            tlim = player['tlim']
        )

    # Subtract the cash
    player.addCash(-props['price'])
    UpdateManager.sendClient(handler.user, "setCash", cash = player['cash'])

    c['type'] = tile
    c['player'] = handler.user['pid']
    c['health'] = props['health']

    UpdateManager.sendCoord(g, c, handler.user)

    return { "status": 200 }

def sendMessage(handler, **args):
    UpdateManager.sendGrid(Grid(handler.user['grid']), "newMessage", handler.user,
        pid = handler.user['pid'],
        text = args['text']
    )

    return { "status": 200 }

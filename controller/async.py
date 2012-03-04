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
    for grid in Grid.all():
        grids.append({
            "gid": grid['id'],
            "name": grid['name'],
            "size": grid['size'],
            "players": len(grid.getUsers())
        })

    return {"status": 200, "grids": grids}

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

    # Looks like it's a new player, go ahead and init them
    if g.playerExists(pid) is False:
        handler.user['cash'] = g['init_cash'] # Starting cash value
        handler.user['inc'] = 0
        handler.user['lastInc'] = int(time())
        handler.user['tused'] = g['init_tused']
        handler.user['tlim'] = g['init_tlim']

        updated = g.loadEvent("join_%s" % pid)
        # Add their new coords 
        for coord in updated:
            UpdateManager.sendCoord(g, coord, handler.user)

    UpdateManager.addClient(handler.user, handler)

    # Announce our color to all other clients
    UpdateManager.sendGrid(g, "addPlayer", handler.user)

    return {
        "status":200,
        "uid": handler.user['id'],
        "pid": pid,
        "cash": handler.user['cash'],
        "inc": handler.user['inc'],
        "tused": handler.user['tused'],
        "tlim": handler.user['tlim'],
        "colors": g.getColors(),
        "color": handler.user['color'],
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
    if c.exists() and c['type'] != "1" and tile not in [8, 10]:
        return { "status":405, "coord": coord, "error": "coord exists" }

    try:
        placeable = TileAdd[tile](g, c, handler.user)
    except KeyError:
        return { "status": 406, "coord": coord, "error": "invalid tile" }

    # If it's not placeable
    if placeable is False:
        return { "status": 412, "coord": coord, "error": "invalid placement" }

    # Make sure they have enough cash for it
    if int(handler.user['cash']) < props['price']:
        return { "status": 412, "coord": coord, "error": "not enough cash" }

    # Make sure they have enough territory
    if tile == 1 and int(handler.user['tused']) >= int(handler.user['tlim']):
        return { "status": 412, "coord": coord, "error": "territory limit" }
    elif tile == 1:
        handler.user['tused'] = int(handler.user['tused']) + 1
        UpdateManager.sendClient(handler.user, "setTerritory", 
            tused = handler.user['tused'],
            tlim = handler.user['tlim']
        )

    # Subtract the cash
    handler.user.addCash(-props['price'])
    UpdateManager.sendClient(handler.user, "setCash", cash = handler.user['cash'])

    c['type'] = tile
    c['player'] = handler.user['pid']
    c['health'] = props['health']
    if c['rot'] is None:
        c['rot'] = 0

    UpdateManager.sendCoord(g, c, handler.user)

    return { "status": 200 }

def rotate(handler, **args):
    """
    Rotates a tile and sends the rotation to all other players
    TODO: Validate rotation 
    """
    try:
        coord = args['coord']
        rot = int(args['rot'])
    except KeyError, ValueError:
        return { "status": 406 }

    g = Grid(handler.user['grid'])
    c = g.get(coord)
    if c.exists() is False:
        return { "status": 404 }

    # Make sure it's a valid angle
    if rot not in [0, 1, 2, 3]:
        return { "status": 406 }

    c['rot'] = rot
    UpdateManager.sendCoord(g, c, handler.user)
    return {"status": 200}

def sendMessage(handler, **args):
    UpdateManager.sendGrid(Grid(handler.user['grid']), "newMessage", handler.user,
        pid = handler.user['pid'],
        text = args['text']
    )

    return { "status": 200 }

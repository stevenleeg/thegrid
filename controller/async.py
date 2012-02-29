from model import Grid, User, TileAdd, TileProps
from utility import UpdateManager

def test(handler, **args):
	return {"hello":"world"}

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
		return {"status": 406}

	g = Grid(gid)
	if g.exists() is False:
		return {"status":404, "error":"Grid not found."}

	# Add the user to the grid/UpdateManager
	pid = g.addUser(handler.user)

	if pid is False:
		return { "status":406, "error": "Grid is full" }

	handler.user['pid'] = pid
	handler.user['grid'] = gid
	handler.user['cash'] = g['init_cash'] # Starting cash value
	handler.user['inc'] = 0
	handler.user['active'] = True
	handler.user['tused'] = g['init_tused']
	handler.user['tlim'] = g['init_tlim']
	UpdateManager.addClient(handler.user, handler)

	# Announce our color to all other clients
	UpdateManager.sendGrid(g, "addPlayer", handler.user, pid = pid, color = handler.user['color'])

	# Add their new coords 
	updated = g.loadEvent("join_%s" % pid)
	for coord in updated:
		UpdateManager.sendCoord(g, coord, handler.user)

	return {
		"status":200,
		"uid": handler.user['id'],
		"pid": pid,
		"cash": handler.user['cash'],
		"inc": 0,
		"tused": handler.user['tused'],
		"tlim": handler.user['tlim'],
		"colors": g.getColors(),
        "color": handler.user['color'],
		"coords": g.dump()
	}

def rejoinGrid(handler, **args):
	try:
		uid = args['uid']
	except KeyError:
		return { "status": 406 }

	# Get the gid of the user
	u = User(uid)
	handler.user.remove()
	handler.user = u
	if u.exists() is False:
		return { "status": 404, "error": "User" }

	# Make sure their former grid exists still
	g = Grid(u['grid'])
	if g.exists() is False:
		return { "status": 404, "error": "grid" }

	# See if we can get their spot
	pid = g.addUser(handler.user, u['pid'])
	if pid is False:
		return { "status": 404, "error": "full" }

	handler.user['active'] = True
	UpdateManager.addClient(handler.user, handler)

	return {
		"status":200,
		"uid": handler.user['id'],
		"cash": handler.user['cash'],
		"inc": handler.user['inc'],
		"pid": pid,
		"tused": handler.user['tused'],
		"tlim": handler.user['tlim'],
		"colors": g.getColors(),
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
	if c.exists() and c['type'] != "1":
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

	UpdateManager.sendCoord(g, c, handler.user)

	return { "status": 200 }

def sendMessage(handler, **args):
	UpdateManager.sendGrid(Grid(handler.user['grid']), "newMessage", handler.user,
		pid = handler.user['pid'],
		text = args['text']
	)

	return { "status": 200 }

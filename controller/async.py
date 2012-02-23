from model import Grid, User, TileChecks, TileProps
from utility import UpdateManager

def test(handler, **args):
	return {"hello":"world"}

def joinGrid(handler, **args):
	try:
		#TODO: Sanity checks
		gid = args['gid']
		color = args['color']
	except KeyError:
		return {"status": 406}

	g = Grid(gid)
	if g.exists() is False:
		return {"status":404, "error":"Grid not found."}

	handler.user['color'] = color
	# Add the user to the grid/UpdateManager
	pid = g.addUser(handler.user)
	if pid is False:
		return { "status":406, "error": "Grid is full" }

	handler.user['pid'] = pid
	handler.user['grid'] = gid
	handler.user['active'] = True
	UpdateManager.addClient(handler.user, handler)

	# Announce our color to all other clients
	UpdateManager.sendGrid(g, "addPlayer", handler.user, pid = pid, color = color)

	return {
		"status":200,
		"uid": handler.user['id'],
		"pid": pid,
		"colors": g.getColors(),
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
		"pid": pid,
		"colors": g.getColors(),
		"coords": g.dump()
	}

def place(handler, **args):
	try:
		coord = args['coord']
		tile = int(args['tile'])
	except KeyError, ValueError:
		return { "status": 406 }

	g = Grid(handler.user['grid'])
	c = g.get(coord)
	if c.exists():
		return { "status":405, "coord": coord, "error": "coord exists" }

	try:
		placeable = TileChecks[tile](c)
	except KeyError:
		return { "status": 406, "coord": coord, "error": "invalid tile" }

	c['type'] = tile
	c['player'] = handler.user['pid']
	c['health'] = TileProps[tile]

	UpdateManager.sendGrid(g, "set", handler.user,
		coord = str(c),
		tile = tile,
		player = handler.user['pid'],
		health = TileProps[tile]
	)

	return { "status": 200 }

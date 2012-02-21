from model import Grid, User
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
	UpdateManager.addClient(handler.user, handler)

	# List the pid:colors
	colors = {}
	for uid in g.getUsers():
		u = User(uid)
		colors[u['pid']] = u['color']

	return {
		"status":200,
		"uid": handler.user['uid'],
		"pid": pid,
		"colors": colors,
		"coords": g.dump()
	}

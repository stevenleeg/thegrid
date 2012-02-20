from model import Grid
from utility import grids, clients

def test(handler, **args):
	return {"hello":"world"}

def joinGrid(handler, **args):
	# Make sure we have what we need
	try:
		#TODO: Check these for sanity
		gid = args['gid']
		color = args['color']
	except KeyError:
		return {"status":406}

	g = Grid(gid)
	if g.exists() is False:
		return {"status":404, "error":"Grid not found."}
	
	status, client = handler.joinGrid(g, color)

	# Generate a player/color list
	colors = {}
	# Get uids
	for pid in grids[gid]:
		uid = grids[gid][pid]
		colors[pid] = clients[client.uid]['color']
	
	if status is not True:
		return { "status":406, "error": uid }

	return {
    "status":200, 
    "uid":client.uid,
	 "pid": client.pid,
    "coords": g.dump(),
	 "colors": colors
  }

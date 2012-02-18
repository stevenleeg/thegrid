from model import Grid

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
	
	uid = handler.joinGrid(gid, color)
	return {
    "status":200, 
    "uid":uid,
    "coords": g.dump()
  }

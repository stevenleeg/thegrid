from model import Game

def test(handler, **args):
	return {"hello":"world"}

def joinGame(handler, **args):
	# Make sure we have what we need
	try:
		#TODO: Check these for sanity
		gid = args['gid']
		color = args['color']
	except KeyError:
		return {"status":406}

	g = Game(gid)
	if g.exists() is False:
		return {"status":404, "error":"Room not found."}
	
	uid = handler.joinGame(gid, color)
	return {"status":200, "uid":uid}

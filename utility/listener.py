import redis
import json

# Used for storing active WebSocket clients
grids = {}
clients = {}
"""
Structure of these variables:
grids = {
	"gid": {0: "uid1", 1: "uid2"}
}

clients {
	"uid1": {
		"cb": [tornado WebSocketHandler]
		"grid": gid,
		"color": color,
	}, etc...
}
"""

def Listener():
	r = redis.Redis()
	ps = r.pubsub()
	ps.subscribe("UpdateGrid")

	for message in ps.listen():
		if message['type'] != 'message':
			continue
		message = json.loads(message['data'])

		# Sending to all clients in a grid 
		if 'game' in message and message['grid'] in grids:
			for cid in grids[message['grid']]:
				clients[cid]['cb'].write_message(message['data'])

		# Sending to only one client
		if 'client' in message and message['client'] in clients:
			clients[message['client']]['cb'].write_message(message['data'])

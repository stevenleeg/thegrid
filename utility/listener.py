import redis
import json

# Used for storing active WebSocket clients
games = {}
clients = {}
"""
Structure of these variables:
games = {
	"gid": ["uid1", "uid2"]
}

clients {
	"uid1": {
		"cb": [tornado WebSocketHandler]
		"game": gid,
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

		# Sending to all clients in a game
		if 'game' in message and message['game'] in games:
			for cid in games[message['game']]:
				clients[cid]['cb'].write_message(message['data'])

		# Sending to only one client
		if 'client' in message and message['client'] in clients:
			clients[message['client']]['cb'].write_message(message['data'])

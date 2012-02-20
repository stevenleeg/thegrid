from tornado.websocket import WebSocketHandler
from model import Grid
from utility import clients, grids
import async
import json
from uuid import uuid4

class Client(WebSocketHandler):
	def open(self):
		self.gid = None
		self.uid = None
		self.pid = None
		pass

	def send(self, data):
		self.write_message(json.dumps(data))

	def on_message(self, message):
		try:
			message = json.loads(message)
		except:
			pass

		# Load the function
		ret = getattr(async, message['f'])(self, **message)
		ret['cid'] = message['cid']
		self.send(ret)
	
	def joinGrid(self, grid, color):
		# Generate a unique id
		self.uid = str(uuid4())[0:5]
		# Make sure it doesn't exist already
		while self.uid in clients:
			self.uid = str(uuid4())[0:5]

		gid = grid['id']
		self.gid = grid['id']

		# Add the client to a grid 
		if gid not in grids:
			grids[gid] = {}

		if len(grids[gid]) >= int(grid['players']):
			return (False, "Grid is full")

		# Get the next available playerid for the grid
		for i in range(1, int(grid['players'])):
			if i not in grids[gid]:
				self.pid = i
				grids[gid][i] = self.uid
				break

		# Add the client to the clients dict
		clients[self.uid] = {
			"cb": self,
			"grid": gid,
			"color": color,
			"pid": self.pid
		}

		return (True, self)
	
	def on_close(self):
		if self.uid in clients:
			del(clients[self.uid])
		if self.gid in grids:
			if self.pid in grids[self.gid]:
				del(grids[self.gid][self.pid])

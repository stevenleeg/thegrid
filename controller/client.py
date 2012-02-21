from tornado.websocket import WebSocketHandler
from utility import UpdateManager
from model import User, Grid
from uuid import uuid4
import async
import json

class SocketHandler(WebSocketHandler):
	def send(self, data):
		return self.write_message(json.dumps(data))
	
	def call(self, func, **kwargs):
		"""
		Calls a method on the client
		"""
		payload = {"f": func}
		payload.update(kwargs)

		self.send(payload)
	
	def open(self):
		self.user = User.create()

	def on_message(self, message):
		try:
			message = json.loads(message)
		except:
			return

		# Call it!
		ret = getattr(async, message['f'])(self, **message)
		ret['cid'] = message['cid']
		self.send(ret)
	
	def on_close(self):
		# Notify UpdateManger
		UpdateManager.delClient(self.user)
		# Remove them from their grid
		if self.user['grid'] != None:
			g = Grid(self.user['grid'])
			g.delUser(self.user)

			self.user['active'] = False

import redis
import json

class UpdateManager(object):
	clients = {}

	@classmethod
	def listen(obj):
		"""
		Listener for redis' pubsub
		"""
		r = redis.Redis()
		ps = r.pubsub()
		ps.subscribe("messages")
		
		for message in ps.listen():
			if message['data'] == "clients":
				print "clients"
				print obj.clients
	
	@classmethod
	def addClient(obj, user, callback):
		"""
		Adds a client to the clients list
		"""
		obj.clients[user['id']] = callback
	
	@classmethod
	def delClient(obj, user):
		if user['id'] in obj.clients:
			del(obj.clients[user['id']])
	
	@classmethod
	def sendClient(obj, user, function, **kwargs):
		obj.clients[user['id']].call(function, **kwargs)
	
	@classmethod
	def sendGrid(obj, grid, function, **kwargs):
		if grid.exists() is False:
			return

		for uid in grid.getUsers():
			obj.clients[uid].call(function, **kwargs)


from utility import db
from time import time
import re

class Game:
	def __init__(self, gid):
		self.dbid = "g:%s" % gid
		self.uid = gid
	
	@classmethod
	def fromName(obj, name):
		uid = db.hget("nameid", name)
		if uid is None:
			return None

		return obj(uid)

	@classmethod
	def create(obj, name, size):
		if re.match("^[A-z0-9]*$", name) is None:
				return (False, "name")

		# Generate an id for the game
		uid = db.incr("uid")
		# For matching names with ids
		db.hset("nameid", name, uid)

		db.hmset("g:%s" % uid, {
			"name": name,
			"size": size,
			"started": int(time()),
		})

		return (True, obj(uid))

	def exists(self):
		return db.exists(self.dbid)

	def __getitem__(self, key):
		if key == "id":
			return self.uid

		return db.hget(self.dbid, key)

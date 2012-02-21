from utility import db
from uuid import uuid4
import time

class User:
	def __init__(self, uid):
		self.uid = uid
		self.dbid = "u:%s" % uid
	
	@classmethod
	def create(obj):
		uid = str(uuid4())[0:7]
		u = obj(uid)
		u['create'] = int(time.time())
		
		return u

	def exists(self):
		return db.exists(self.dbid)

	def remove(self):
		return db.delete(self.dbid)

	def __getitem__(self, key):
		if key == "id":
			return self.uid
		return db.hget(self.dbid, key)
	
	def __setitem__(self, key, val):
		return db.hset(self.dbid, key, val)


from utility import db

class Game:
	def __init__(self, gid):
		self.dbid = "g:%s" % gid
		self.uid = gid
	
	def exists(self):
		return db.exists(self.dbid)

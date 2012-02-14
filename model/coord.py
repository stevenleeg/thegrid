from utility import db

class Coord:
	def __init__(self, grid, x, y = None):
		# Convert a strcoord into a regular one
		if type(x) is str:
			split = x.split("_")
			x = split[0]
			y = split[1]

		# Set some instance variables
		self.x = x
		self.y = y

		self.dbid = "c:%s:%s" % (grid, str(self))
	
	def __str__(self):
		return "%s_%s" % (self.x, self.y)

	def __getitem__(self, key):
		return db.hget(self.dbid, key)

	def __setitem__(self, key, val):
		return db.hset(self.dbid, key, val)

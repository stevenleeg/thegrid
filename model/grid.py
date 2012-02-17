from utility import db
from coord import Coord
from time import time
import itertools
import re

class Grid:
	def __init__(self, gid):
		# Tie ourselves to a game id
		self.dbid = "g:%s" % gid
		self.uid = gid
	
	@classmethod	
	def fromName(obj, name):
		uid = db.hget("nameid", name)

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

	def loadMap(self):
		""" Loads a dict of coord data onto the grid """
		pass

	def around(self, point, radius):
		""" 
		Finds all points located around the radius
		Used for vision tiles
		"""
		pts = []
		# Get a range of coords to try
		x = range(point.x - radius, point.x + radius)
		y = range(point.y - radius, point.y + radius)
		points = itertools.product(x, y)
		for point in points:
			c = self.get(point[0], point[1])
			if c.exists():
				pts.append(c)

		return pts

	def get(self, x, y):
		""" Gets a coordinate from the grid """
		return Coord(self.uid, x, y)

	def exists(self):
		return db.exists(self.dbid)

	def __getitem__(self, key):
		if key == "id":
			return self.uid
		return db.hget(self.dbid, key)

	def __setitem__(self, key, value):
		return db.hset(self.dbid, key, value)
	
	def __eq__(self, other):
		return int(self.uid) == int(other.uid)

	def __repr__(self):
		return "<Grid id:%s>" % (self.uid)

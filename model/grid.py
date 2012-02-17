from utility import db
from coord import Coord
import itertools

class Grid:
	def __init__(self, gid):
		# Tie ourselves to a game id
		self.dbid = "g:%s" % gid
		self.uid = gid
	
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

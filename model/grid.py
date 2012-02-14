from utility import db
from model import Coord

class Grid:
	def __init__(self, gid):
		# Tie ourselves to a game id
		self.dbid = "g:%s" % gid
		self.uid = gid
	
	def loadMap(self):
		""" Loads a dict of coord data onto the grid """
		pass

	def dump(self):
		""" 
		Dumps all coord data to a json object 
		This is usually used for initial data loading
		"""

	def get(self, x, y):
		""" Gets a coordinate from the grid """
		return Coord(self.uid, x, y)

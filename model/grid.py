from utility import db, UpdateManager
from coord import Coord
from user import User
from time import time
import re, json, itertools

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
	def create(obj, name, size, mapname):
		if re.match("^[A-z0-9]*$", name) is None:
				return (False, "name")

		# Generate an id for the game
		uid = db.incr("uid")
		# For matching names with ids
		db.hset("nameid", name, uid)

		db.hmset("g:%s" % uid, {
			"name": name,
			"size": size,
			"map": mapname,
			"started": int(time()),
		})

		# Load the initial coords from the map file
		g = obj(uid)
		g.loadEvent("init")

		return (True, g)

	# Client handling
	def addUser(self, user, pid = None):
		if pid != None:
			if db.hexists(self.dbid + ":usr", pid):
				return False

			db.hset(self.dbid + ":usr", pid, user['id'])
			return pid
		
		# Get a pid
		pid = 0
		if db.hlen(self.dbid + ":usr") >= int(self['players']):
			return False

		for i in range(1, int(self['players']) + 1):
			if db.hexists(self.dbid + ":usr", i):
				continue
			pid = i
			break

		db.hset(self.dbid + ":usr", pid, user['id'])
		if db.hget(self.dbid + ":clr", pid) is None:
			db.hset(self.dbid + ":clr", pid, user['color'])

		return pid

	def delUser(self, user):
		db.hdel(self.dbid + ":usr", user['pid'])
	
	def getUsers(self):
		uids = []
		users = db.hgetall(self.dbid + ":usr")
		for pid in users:
			uids.append(users[pid])

		return uids

	def getColors(self):
		return db.hgetall(self.dbid + ":clr")

	def getUsedColors(self):
		colors = []
		for uid in self.getUsers():
			colors.append(User(uid)['color'])

		return colors

	def load(self, coords):
		""" Loads a dict of coord data onto the grid """
		for coord in coords:
			c = coord.split("_")
			c = self.get(int(c[0]), int(c[1]))
			for key in coords[coord]:
				c[key] = coords[coord][key]

		return True

	def loadEvent(self, event):
		f = open("static/maps/%s_%s.json" % (self['size'], self['map']), "r")
		data = json.loads(f.read())
		f.close()

		if event == "init":
			self['players'] = data['players']

		# Load event
		coords = {}
		for coord in data['events'][event]:
			coords[coord] = data['coords'][coord]

		self.load(coords)

		coords = []
		for coord in data['events'][event]:
			coords.append(self.get(coord))

		return coords

	def dump(self):
		""" Dumps all coords on the grid """
		coords = db.keys("c:%s:*" % self.uid)
		rets = {}
		for coord in coords:
			coord = coord.replace("c:%s:" % self.uid, "")
			rets[coord] = self.get(coord).baseInfo()

		return rets

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

	def get(self, x, y = None):
		""" Gets a coordinate from the grid """
		if type(x) in (str, unicode) and y is None:
			return Coord(self.uid, x)

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

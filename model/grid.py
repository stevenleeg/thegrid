from utility import db
from tiles import TileDest
from user import User, Player
from time import time
import re, json, itertools, random

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
    def all(obj, inactive = False):
        grids = []
        for gid in db.hvals("nameid"):
            g = obj(gid)
            if inactive is False and int(g['active']) == False:
                continue
            grids.append(g)

        return grids

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
            "active": 0,
            "started": int(time()),
        })

        # Load the initial coords from the map file
        g = obj(uid)
        g.loadEvent("init")
        if int(g['autogenerate']) == True:
            g.generateTerrain()

        return (True, g)

    def generateTerrain(self):
        """
        Pretty self explanitory. Goes through and generates mines and such
        """
        size = int(self['size'])
        add = False
        for x in range(0, size):
            for y in range(0, size):
                r = random.randint(0, 30)
                if r == 4 or add:
                    c = self.get(x, y)
                    if c.exists():
                        add = True
                        continue

                    c['type'] = 99
                    add = False
                    

    # Client handling
    def addUser(self, user, pid = None):
        # Make sure we're not adding a player twice
        if user['grid'] == self['id']:
            return user['pid']

        # And if they already have a pid
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
        user['color'] = self.getColor(pid)

        # remove them from the nogrid list
        db.srem("nogrid", user['id'])

        return pid

    def delUser(self, user):
        db.hdel(self.dbid + ":usr", user['pid'])
    
    def getUsers(self):
        uids = []
        users = db.hgetall(self.dbid + ":usr")
        for pid in users:
            uids.append(users[pid])

        return uids

    def getPlayers(self):
        players = []
        for pid in db.hkeys(self.dbid + ":usr"):
            players.append(Player(self.uid, pid))
        return players

    def getPlayer(self, pid):
        return Player(self.uid, pid)

    def playerExists(self, pid):
        return db.exists(self.dbid + ":pid:" + str(pid))

    def getColors(self):
        return db.hgetall(self.dbid + ":clr")

    def getColor(self, pid):
        return db.hget(self.dbid + ":clr", pid)

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
            for key in data:
                if key not in ["colors", "coords", "events"]:
                    self[key] = data[key]

            for pid in data['colors']:
                db.hset(self.dbid + ":clr", pid, data['colors'][pid])

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

    def around(self, point, tile, radius, diagonals = False):
        """ 
        Finds all points located around the radius
        Used for vision tiles
        """
        if type(tile) is int:
            tile = [tile]

        pts = []
        # Get a range of coords to try
        x = range(point.x - radius, point.x + radius + 1)
        y = range(point.y - radius, point.y + radius + 1)
        if diagonals:
            points = itertools.product(x, y)
        else:
            points = []
            for pt_x in x:
                points.append((pt_x, point.y))
            for pt_y in y:
                points.append((point.x, pt_y))

        for point in points:
            c = self.get(point[0], point[1])
            if c.exists() and (int(c['type']) in tile or tile == [0]):
                pts.append(c)

        return pts

    def inRangeOf(self, coord, tile, radius):
        minX = coord.x - radius
        minY = coord.y - radius
        if minX < 0:
            minX = 0
        if minY < 0:
            minY = 0

        x_range = range(minX, coord.x + radius + 1)
        y_range = range(minY, coord.y + radius + 1)
        in_range = 0

        for x in x_range:
            c = self.get(x, coord.y)
            if c.exists() and int(c['type']) == tile and c != coord:
                in_range += 1

        for y in y_range:
            c = self.get(coord.x, y)
            if c.exists() and int(c['type']) == tile and c != coord:
                in_range += 1

        return in_range

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

class Coord:
    def __init__(self, grid, x, y = None):
        if type(x) in (str, unicode):
            split = x.split("_")
            x = split[0]
            y = split[1]
        elif y is None:
            raise TypeError

        # Set some instance variables
        self.x = int(x)
        self.y = int(y)

        self.gid = grid
        self.dbid = "c:%s:%s" % (grid, str(self))

    def getGrid(self):
        return Grid(self.gid)

    def damage(self, amt):
        if self.exists() is False:
            return
        
        new = int(self['health']) - amt
        if new <= 0:
            # Call the destroy event
            g = self.getGrid()
            try:
                TileDest[int(self['type'])](g, self, g.getPlayer(self['player']))
            except KeyError:
                pass

            self['type'] = 1
            self['health'] = 25
        else:
            self['health'] = new
    
    def baseInfo(self):
        keys = ["type", "player", "health"]
        vals = db.hmget(self.dbid, keys)
        return dict(zip(keys, vals))

    def remove(self):
        db.delete(self.dbid)

    def exists(self):
        return db.exists(self.dbid)

    def __str__(self):
        return "%s_%s" % (self.x, self.y)

    def __getitem__(self, key):
        return db.hget(self.dbid, key)

    def __setitem__(self, key, val):
        return db.hset(self.dbid, key, val)

    def __repr__(self):
        return "<Coord (%s, %s)>" % (self.x, self.y)

    def __eq__(self, other):
        return str(self) == str(other)

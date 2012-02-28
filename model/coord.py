from utility import db

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

        self.dbid = "c:%s:%s" % (grid, str(self))

    def damage(self, amt):
        if self.exists() is False:
            return
        
        new = int(self['health']) - amt
        if new <= 0:
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

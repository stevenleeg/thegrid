from utility import db, UpdateManager
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
    
    def getPlayer(self):
        return Player(self['grid'], self['pid'])

    def __getitem__(self, key):
        if key == "id":
            return self.uid

        return db.hget(self.dbid, key)
    
    def __setitem__(self, key, val):
        return db.hset(self.dbid, key, val)

class Player:
    def __init__(self, gid, pid):
        self.gid = gid
        self.pid = pid
        self.dbid = "g:%s:pid:%s" % (gid, pid)

    def addCash(self, amt):
        return db.hincrby(self.dbid, "cash", amt)

    def addIncome(self, amt):
        return db.hincrby(self.dbid, "inc", amt)

    def getUser(self):
        return User(db.hget("g:%s:usr" % self.gid, self.pid))

    def __getitem__(self, key):
        if key == "pid":
            return self.pid
        return db.hget(self.dbid, key)

    def __setitem__(self, key, val):
        return db.hset(self.dbid, key, val)

from __init__ import db
import redis
import json

class UpdateManager(object):
    clients = {}

    @classmethod
    def listen(obj):
        """
        Listener for redis' pubsub
        """
        r = redis.Redis()
        ps = r.pubsub()
        ps.subscribe("messages")
        
        for message in ps.listen():
            if message['data'] == "clients":
                print "clients"
                print obj.clients
            if message['data'] == "income":
                from model.periodical import payDay
                payDay()
    
    @classmethod
    def addClient(obj, user, callback):
        """
        Adds a client to the clients list
        """
        obj.clients[user['id']] = callback
    
    @classmethod
    def delClient(obj, user):
        if user['id'] in obj.clients:
            del(obj.clients[user['id']])
    
    @classmethod
    def sendClient(obj, user, function, **kwargs):
        try:
            obj.clients[user['id']].call(function, **kwargs)
        except KeyError:
            pass
    
    @classmethod
    def sendGrid(obj, grid, function, exclude = None, **kwargs):
        if grid.exists() is False:
            return

        users = grid.getUsers()
        if exclude != None:
            try:
                users.remove(exclude['id'])
            except ValueError:
                pass

        for uid in users:
            obj.clients[uid].call(function, **kwargs)
    
    @classmethod
    def sendCoord(obj, grid, coord, exclude = None):
        if coord.exists() is False:
            obj.sendGrid(grid, "del", coord = str(coord))
            return

        obj.sendGrid(grid, "set", exclude,
            coord = str(coord),
            tile = coord['type'],
            player = coord['player'],
            health = coord['health'],
            rot = coord['rot']
        )

    @classmethod
    def sendNogrids(obj, func, **kwargs):
        for uid in db.smembers("nogrid"):
            if uid not in obj.clients:
                db.srem("nogrid", uid)
            else:
                obj.clients[uid].call(func, **kwargs)

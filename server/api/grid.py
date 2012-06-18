import tornado.web
from model import Grid
from utility.template import jsonify
from utility import UpdateManager
import json, os

class Exists(tornado.web.RequestHandler):
    def get(self):
        name = self.get_argument("name", None)
        if name is None:
            return jsonify(self, status=406)

        grid = Grid.fromName(name)
        if grid.exists() is False:
            return jsonify(self, status=404)

        return jsonify(self, status=200, colors = grid.getUsedColors())

class Create(tornado.web.RequestHandler):
    def post(self):
        name = self.get_argument("name", None)
        size = self.get_argument("size", None)
        mapfile = "default"

        if name is None or size is None:
            return jsonify(self, status=406, error = "name")
        try:
            int(size)
        except ValueError:
            return jsonify(self, status=406, error = "size")


        if size not in ['16', '32', '64']:
            return jsonify(self, status=404)

        # Make sure the name doesn't already exist
        if Grid.fromName(name).exists():
            return jsonify(self, status=406, error = "Name taken")

        status, g = Grid.create(name, size, "default")

        if status == False:
            return jsonify(self, status=406, error=g)

        # Send to nogrids
        UpdateManager.sendNogrids("newGrid", 
            gid = g['id'],
            size = size,
            active = g['active'],
            name = g['name'], 
            players = 1,
        )

        return jsonify(self, status=200, gid = g['id'])

class Info(tornado.web.RequestHandler):
    def get(self):
        name = self.get_argument("name", None)
        gid = self.get_argument("gid", None)
        if name is None and gid is None:
            return jsonify(self, status=406)
        
        if gid is None:
            g = Grid.fromName(name)
        elif name is None:
            g = Grid(gid)

        if g.exists() is False:
            return jsonify(self, status=404)

        return jsonify(self, status=200, data = {
            "gid": g['id'],
            "size": g['size']
        })

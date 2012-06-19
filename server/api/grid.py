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

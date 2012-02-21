import tornado.web
from model import Grid
from utility.template import jsonify
import json, os

class Exists(tornado.web.RequestHandler):
	def get(self):
		name = self.get_argument("name", None)
		if name is None:
			return jsonify(self, status=406)

		grid = Grid.fromName(name)
		if grid.exists() is False:
			return jsonify(self, status=404)

		return jsonify(self, status=200)

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

		status, g = Grid.create(name, size)

		if status == False:
			return jsonify(self, status=406, error=g)

		# Now preload the grid with a mapfile
		# TODO: Get map from URL
		f = open("static/maps/%s_%s.json" % (size, mapfile), "r")
		data = json.loads(f.read())
		f.close()
		g.load(data['coords'])
		g['players'] = data['players']

		return jsonify(self, status=200, gid = g['id'])

class Info(tornado.web.RequestHandler):
	def get(self):
		name = self.get_argument("name", None)
		if name is None:
			return jsonify(self, status=406)
		
		g = Grid.fromName(name)
		if g is None:
			return jsonify(self, status=404)

		return jsonify(self, status=200, data = {
			"gid": g['id'],
			"size": g['size']
		})

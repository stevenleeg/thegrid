import tornado.web
from model import Game
from utility.template import jsonify
from utility import games

class Exists(tornado.web.RequestHandler):
	def get(self):
		game = Game.fromName(self.get_argument("name", None))

		if game is None:
			return jsonify(self, status=406)
		
		if game is None:
			return jsonify(self, status=404)

		return jsonify(self, status=200)

class Create(tornado.web.RequestHandler):
	def post(self):
		name = self.get_argument("name", None)
		size = self.get_argument("size", None)

		if name is None or size is None:
			return jsonify(self, status=406, error = "name")
		try:
			int(size)
		except ValueError:
			return jsonify(self, status=406, error = "size")


		if size not in ['16', '32', '64']:
			return jsonify(self, status=404)

		status, g = Game.create(name, size)

		if status == False:
			return jsonify(self, status=406, error=g)

		return jsonify(self, status=200, gid = g['id'])

class Info(tornado.web.RequestHandler):
	def get(self):
		name = self.get_argument("name", None)
		if name is None:
			return jsonify(self, status=406)
		
		g = Game.fromName(name)
		if g is None:
			return jsonify(self, status=404)

		return jsonify(self, status=200, data = {
			"gid": g['id'],
			"size": g['size']
		})

import tornado.web
from model import Game
from utility.template import jsonify

class Exists(tornado.web.RequestHandler):
	def get(self):
		try:
			game = Game(self.request.arguments['name'])
		except KeyError:
			return jsonify(self, {'status':406})
		
		if game.exists():
			return jsonify(self, {'status':200})

		return jsonify(self, {'status':404})

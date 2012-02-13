import tornado.web
import tornado.ioloop
import controller
import api

# URL Routing
app = tornado.web.Application([
  # The API... Hereeee we go.
  ('/api/game/exists', api.game.Exists),

	("/static/(.*)", tornado.web.StaticFileHandler, {"path":"static"}),
	("/", controller.Index),
], debug = True)

if __name__ == "__main__":
	app.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

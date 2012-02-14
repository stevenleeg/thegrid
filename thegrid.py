import tornado.web
import tornado.ioloop
import threading

import controller
import api
import utility


# URL Routing
app = tornado.web.Application([
  # The API... Hereeee we go.
  ('/api/game/exists', api.game.Exists),
  ('/api/game/create', api.game.Create),
  ('/api/game/info', api.game.Info),

  ('/api/socket', controller.Client),

	("/static/(.*)", tornado.web.StaticFileHandler, {"path":"static"}),
	("/", controller.Index),
], debug = True)

if __name__ == "__main__":
	app.listen(8080)

	# Thread for listener process
	listener = threading.Thread(target = utility.Listener)
	listener.daemon = True
	listener.start()

	tornado.ioloop.IOLoop.instance().start()

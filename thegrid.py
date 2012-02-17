import tornado.web
import tornado.ioloop
import threading

import controller
import api
import utility


# URL Routing
app = tornado.web.Application([
  # The API... Hereeee we go.
  ('/api/grid/exists', api.grid.Exists),
  ('/api/grid/create', api.grid.Create),
  ('/api/grid/info', api.grid.Info),

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

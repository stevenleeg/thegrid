import tornado.web
import tornado.ioloop
import threading

import utility
import controller
import api
import model.periodical


# URL Routing
app = tornado.web.Application([
    # The API... Hereeee we go.
    ('/api/grid/exists', api.grid.Exists),
    ('/api/grid/create', api.grid.Create),
    ('/api/grid/info', api.grid.Info),

    ('/api/socket', controller.SocketHandler),

    ("/static/(.*)", tornado.web.StaticFileHandler, {"path":"static"}),
    ("/", controller.Index),
], debug = True)

if __name__ == "__main__":
    app.listen(8080)

    loop = tornado.ioloop.IOLoop.instance()
    tornado.ioloop.PeriodicCallback(model.periodical.payDay, 500, loop).start()
    tornado.ioloop.PeriodicCallback(model.periodical.infector, 1000, loop).start()
    tornado.ioloop.PeriodicCallback(model.periodical.damager, 2000, loop).start()
    tornado.ioloop.PeriodicCallback(model.periodical.defender, 1000, loop).start()
    tornado.ioloop.PeriodicCallback(model.periodical.userCheck, 2500, loop).start()

    loop.start()

from tornado.web import RequestHandler
from utility.template import render

class Index(RequestHandler):
	def get(self):
		return render(self, "index.html")

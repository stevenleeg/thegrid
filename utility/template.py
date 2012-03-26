from tornado.template import Loader
from json import dumps

def render(sender, tpl, **context):
	loader = Loader("templates/")
	return sender.write(loader.load(tpl).generate(**context))

def jsonify(sender, **obj):
	return sender.write(dumps(obj))

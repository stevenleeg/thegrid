from tornado.template import Loader
from json import dumps
import config

def render(sender, tpl, **context):
	loader = Loader(config.path + "templates/")
	return sender.write(loader.load(tpl).generate(**context))

def jsonify(sender, **obj):
	return sender.write(dumps(obj))

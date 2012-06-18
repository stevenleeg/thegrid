import template
from updatemanager import *
import config

import redis
db = redis.Redis(**config.database)


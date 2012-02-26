from utility import db, UpdateManager
from grid import Grid
from user import User

def payDay():
	for grid in Grid.all():
		for uid in grid.getUsers():
			u = User(uid)
			if(u['active']):
				u.addCash(int(u['inc']))
			
				UpdateManager.sendClient(u, "setCash", cash = u['cash'])

def infector():
	for grid in Grid.all():
		length = db.llen(grid.dbid + ":inf")
		for i in range(0, length):
			print "running!"
			c = grid.get(db.lpop(grid.dbid + ":inf"))
			around = grid.around(c, 1, 1, True)
			for coord in around:
				print "deleting coord %s" % coord
				coord['player'] = c['player']
				UpdateManager.sendGrid(grid, "set", coord=str(coord), tile = 1, player = c['player'])

			# And delete the infector
			c['type'] = 1
			c['health'] = 25
			UpdateManager.sendGrid(grid, "set", coord=str(c), tile = 1, player = c['player'])

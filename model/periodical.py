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
			c = grid.get(db.lpop(grid.dbid + ":inf"))
			around = grid.around(c, 1, 1, True)
			for coord in around:
				coord['player'] = c['player']
				UpdateManager.sendCoord(grid, coord)

			# And delete the infector
			c['type'] = 1
			c['health'] = 25
			UpdateManager.sendCoord(grid, c)

def damager():
	for grid in Grid.all():
		length = db.llen(grid.dbid + ":dam")

		# List of tiles that can be damaged
		takes_damage = [2, 3, 4, 5, 6, 7]

		for i in range(0, length):
			c = grid.get(db.lindex(grid.dbid + ":dam", i))
			around = grid.around(c, 0, 1)
			for coord in around:
				# Make sure we can damage it
				if (int(coord['type']) not in takes_damage) or (c['player'] == coord['player']):
					continue

				before = coord['type']
				coord.damage(10) 
				if coord['type'] == before:
					UpdateManager.sendGrid(grid, "setHealth", coord=str(coord), health=coord['health'])
				else:
					UpdateManager.sendGrid(grid, "set", coord=str(coord), tile = 1, player = coord['player'], health=25)

			# Damage/delete the damager
			c.damage(10)
			if int(c['type']) == 6:
				UpdateManager.sendGrid(grid, "setHealth", coord=str(c), health=c['health'])
			else:
				db.lrem(grid.dbid + ":dam", str(c), 0)
				UpdateManager.sendCoord(grid, c)

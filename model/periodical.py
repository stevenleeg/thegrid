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

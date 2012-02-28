from utility import db, UpdateManager

def add_territory(grid, coord, user):
	return True

def add_headquarters(grid, coord, user):
	return False

def add_miner(grid, coord, user):
	mines = grid.inRangeOf(coord, 99, 1)
	if mines == 0:
		return False
	
	income = mines * 5
	total = user.addIncome(income)

	UpdateManager.sendClient(user, "setInc", inc = total)

	return True

def add_infector(grid, coord, user):
	db.rpush(grid.dbid + ":inf", str(coord))
	return True

def add_damager(grid, coord, user):
	db.lpush(grid.dbid + ":dam", str(coord))
	return True

def add_house(grid, coord, user):
	new_tlim = int(user['tlim']) + 4
	if new_tlim > int(grid['tlim']):
		new_tlim = int(grid['tlim'])
	
	user['tlim'] = new_tlim
	UpdateManager.sendClient(user, "setTerritory", tlim = user['tlim'], tused = user['tused'])
	return True

TileAdd = {
	1: add_territory,
	2: add_headquarters,
	3: add_miner,
	4: add_infector,
	5: add_house,
	6: add_damager
}

TileProps = {
	1: {
		"health": 25,
		"price": 25,
	},
	2: {
		"health": 100,
	},
	3: {
		"health": 50,
		"price": 100
	},
	4: {
		"health": 25,
		"price": 100
	},
	5: {
		"health": 50,
		"price": 50
	},
	6: {
		"health": 50,
		"price": 200
	}
}

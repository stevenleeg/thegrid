from utility import UpdateManager

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

TileAdd = {
	1: add_territory,
	2: add_headquarters,
	3: add_miner
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
	}
}

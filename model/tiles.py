def add_territory(coord):
	return True

def add_headquarters(coord):
	return False

def add_miner(coord):
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

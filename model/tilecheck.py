def territory(coord):
	return True

def headquarters(coord):
	return False

def miner(coord):
	return True

TileChecks = {
	1: territory,
	2: headquarters,
	3: miner
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

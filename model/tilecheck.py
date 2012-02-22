def territory(coord):
	return True

def headquarters(coord):
	return False

TileChecks = {
	1: territory,
	2: headquarters
}

TileProps = {
	1: {
		"health": 25,
	},
	2: {
		"health": 100,
	}
}

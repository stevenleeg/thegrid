from utility import db, UpdateManager
from time import time

def add_territory(grid, coord, player):
    return True

def add_headquarters(grid, coord, player):
    return False

def add_miner(grid, coord, player):
    mines = grid.inRangeOf(coord, 99)
    if mines == 0:
        return False
    
    income = mines * 5
    total = player.addIncome(income)

    UpdateManager.sendClient(player.getUser(), "setInc", inc = total)

    return True

def add_infector(grid, coord, player):
    db.zadd(grid.dbid + ":inf", str(coord), int(time()))
    return True

def add_damager(grid, coord, player):
    db.lpush(grid.dbid + ":dam", str(coord))
    return True

def add_house(grid, coord, player):
    new_tlim = int(player['tlim']) + 4
    if new_tlim > int(grid['tlim']):
        new_tlim = int(grid['tlim'])
    
    player['tlim'] = new_tlim
    UpdateManager.sendClient(player.getUser(), "setTerritory", tlim = player['tlim'], tused = player['tused'])
    return True

def add_wall(grid, coord, player):
    return True

def add_defender(grid, coord, player):
    # Rename the defending coord
    db.rename(coord.dbid, "def:" + coord.dbid)
    coord['type'] = 8
    coord['health'] = 25
    coord['player'] = player['pid']
    db.zadd(grid.dbid + ":def", str(coord), int(time()))
    UpdateManager.sendCoord(grid, coord)
    return True

TileAdd = {
    1: add_territory,
    2: add_headquarters,
    3: add_miner,
    4: add_infector,
    5: add_house,
    6: add_damager,
    7: add_wall,
    8: add_defender,
}

#
# Destroy events
#
def dest_miner(grid, coord, player):
    mines = grid.inRangeOf(coord, 99)
    if mines == 0:
        return
    
    income = mines * 5
    total = player.addIncome(-income)

    UpdateManager.sendClient(player.getUser(), "setInc", inc = total)

def dest_house(grid, coord, player):
    new_tlim = int(player['tlim']) - 4

    player['tlim'] = new_tlim
    UpdateManager.sendClient(player.getUser(), "setTerritory", tlim = player['tlim'], tused = player['tused'])

def dest_territory(grid, coord, player):
    new_tused = int(player['tused']) - 1
    player['tused'] = new_tused
    UpdateManager.sendClient(player.getUser(), "setTerritory", tlim = player['tlim'], tused = new_tused)

def dest_inf(grid, coord, player):
    db.zrem(grid.dbid + ":inf", str(coord))

def dest_defender(grid, coord, player):
    db.zrem(grid.dbid + ":def", str(coord))
    db.delete(coord.dbid)
    db.rename("def:" + coord.dbid, coord.dbid)
    UpdateManager.sendCoord(grid, coord)

TileDest = {
    1: dest_territory,
    3: dest_miner,
    4: dest_inf,
    5: dest_house,
    8: dest_defender
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
    },
    7: {
        "health": 50,
        "price": 100
    },
    8: {
        "health": 25,
        "price": 25
    },
}

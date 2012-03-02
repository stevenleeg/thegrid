from utility import db, UpdateManager
from time import time

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
    db.zadd(grid.dbid + ":inf", str(coord), int(time()))
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

def add_wall(grid, coord, user):
    return True

TileAdd = {
    1: add_territory,
    2: add_headquarters,
    3: add_miner,
    4: add_infector,
    5: add_house,
    6: add_damager,
    7: add_wall
}

#
# Destroy events
#
def dest_miner(grid, coord, user):
    mines = grid.inRangeOf(coord, 99, 1)
    if mines == 0:
        return
    
    income = mines * 5
    total = user.addIncome(-income)

    UpdateManager.sendClient(user, "setInc", inc = total)

def dest_house(grid, coord, user):
    new_tlim = int(user['tlim']) - 4

    user['tlim'] = new_tlim
    UpdateManager.sendClient(user, "setTerritory", tlim = user['tlim'], tused = user['tused'])

def dest_territory(grid, coord, user):
    new_tused = int(user['tused']) - 1
    user['tused'] = new_tused
    UpdateManager.sendClient(user, "setTerritory", tlim = user['tlim'], tused = new_tused)

TileDest = {
    1: dest_territory,
    3: dest_miner,
    5: dest_house
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
    }
}

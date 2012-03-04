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

def add_defender(grid, coord, user):
    # Rename the defending coord
    db.rename(coord.dbid, "def:" + coord.dbid)
    coord['type'] = 8
    coord['health'] = 25
    coord['player'] = user['pid']
    db.zadd(grid.dbid + ":def", str(coord), int(time()))
    UpdateManager.sendCoord(grid, coord)
    return True

def add_cannon(grid, coord, user):
    return True

def add_damage(grid, coord, user):
    rot = coord['rot']
    db.rename(coord.dbid, "prev:" + coord.dbid)
    coord['rot'] = rot
    prid = db.incr(grid.dbid + ":prid")
    db.hmset("p:" + str(prid), {
        "pos": str(coord),
        "grid": grid['id']
    })
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
    9: add_cannon,
    10: add_damage
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

def dest_inf(grid, coord, user):
    db.zrem(grid.dbid + ":inf", str(coord))

def dest_defender(grid, coord, user):
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

def act_damage(grid, coord):
    coord.damage(10)
    UpdateManager.sendGrid(grid, "setHealth", coord = str(coord), health=coord['health'])

ProjAct = {
    10: act_damage
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
    9: {
        "health": 50,
        "price": 250,
        "rotate": True
    },
    10: {
        "health": 5,
        "price": 25,
    }
}

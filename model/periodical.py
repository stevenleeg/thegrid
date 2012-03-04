from utility import db, UpdateManager
from grid import Grid
from user import User
from tiles import TileDest, ProjAct
from time import time
import math

def userCheck():
    for grid in Grid.all():
        for uid in grid.getUsers():
            if uid not in UpdateManager.clients:
                user = User(uid)
                UpdateManager.delClient(user)
                grid.delUser(user)

def payDay():
    for grid in Grid.all():
        for u in grid.getPlayers():
            inc = int(u['inc'])
            last = time() - float(u['lastInc'])
            if not u['active']:
                continue
            
            # Check their interval
            if inc == 0:
                continue
            if inc * 100 < int(u['cash']):
                continue
            if last < math.log(inc) / 2:
                continue
            u.addCash(inc)
            u['lastInc'] = time()
            UpdateManager.sendClient(u, "setCash", cash = u['cash'])

def infector():
    for grid in Grid.all():
        dbid = "g:%s:inf" % grid['id']
        # Get the most recently placed infector
        try:
            latest = db.zrange(dbid, 0, 1)[0]
        except IndexError:
            continue

        l_time = db.zrank(dbid, latest)
        if (int(time()) - int(l_time)) < 3:
            # The most recent has been sittig for under 3 seconds, 
            # so we're done here
            continue
        # Looks like we can't take that shortcut. Let's loop.
        coords = db.zrange(dbid, 0, -1)
        for infector in coords:
            c = grid.get(infector)
            if int(time()) - int(db.zscore(dbid, infector)) < 3:
                break

            around = grid.around(c, [1,4], 1, True)
            for coord in around:
                if coord['player'] == c['player']:
                    continue
                if coord['type'] == "4":
                    TileDest[4](grid, coord, grid.getPlayer(coord['player']))
                    coords.remove(str(coord))
                else:
                    TileDest[1](grid, coord, grid.getPlayer(coord['player']))
                coord['type'] = 1
                coord['player'] = c['player']
                UpdateManager.sendCoord(grid, coord)

            # Delete the infector
            db.zrem(dbid, str(c))
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

def defender():
    for grid in Grid.all():
        dbid = "g:%s:def" % grid['id']
        # Get the most recently placed infector
        try:
            latest = db.zrange(dbid, 0, 1)[0]
        except IndexError:
            continue
        l_time = db.zscore(dbid, latest)
        if int(time()) - int(l_time) < 3:
            return

        defenders = db.zrange(dbid, 0, -1)
        for defender in defenders:
            c = grid.get(defender)
            if int(time()) - int(db.zscore(dbid, defender)) < 3:
                break
            TileDest[8](grid, c, grid.getPlayer(c['player']))
            db.zrem(dbid, str(defender))

def projectile():
    tiles = db.keys("p:*")
    for tile in tiles:
        t = db.hgetall(tile)
        g = Grid(t['grid'])
        c = g.get(t['pos'])
        rot = int(c['rot'])

        # Directions. cn = coord_next
        if rot == 0:
            cn = g.get(c.x + 1, c.y)
        elif rot == 1:
            cn = g.get(c.x, c.y + 1)
        elif rot == 2:
            cn = g.get(c.x - 1, c.y)
        elif rot == 3:
            cn = g.get(c.x, c.y + 1)

        # Looks like someone blows at aiming
        if cn.x < 0 or cn.y < 0 or cn.x >= int(g['size']) or cn.y >= int(g['size']):
            db.delete(c.dbid)
            db.delete(tile)
            UpdateManager.sendCoord(g, c)
            UpdateManager.sendCoord(g, cn)
            continue

        # It's false! Let's move
        if cn.exists() is False:
            cn['type'] = c['type']
            cn['health'] = c['health']
            cn['rot'] = rot
            cn['player2'] = c['player']
            db.hset(tile, "pos", str(cn))

            db.delete(c.dbid)
            if db.exists("prev:" + c.dbid):
                db.rename("prev:" + c.dbid, c.dbid)

        else:
            if(cn['player'] != c['player2']):
                ProjAct[int(c['type'])](g, cn, g.getPlayer(t['player']))
            # Delete the projectile
            db.delete(c.dbid)
            db.delete(tile)

        UpdateManager.sendCoord(g, c)
        UpdateManager.sendCoord(g, cn)


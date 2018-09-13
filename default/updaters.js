/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvesters');
 * mod.thing == 'a thing'; // true
 */

var _ = require('lodash');


var wantedUpdaterCount = 3
var updaterBody = [WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
var updaterRole = "updater"

module.exports = {
    selectAll(currentRoom) {
        return _.filter(Game.creeps, function (creep) {
            return (currentRoom == null || creep.room == currentRoom) &&
                creep.memory.role == updaterRole
        })
    },

    spawnNeeded() {
        for (var spawnName in Game.spawns) {
            var localSpawn = Game.spawns[spawnName]

            var currentCreeperCount = this.selectAll(localSpawn.room).length;
            if (currentCreeperCount >= wantedUpdaterCount) {
                continue;
            }

            localSpawn.spawnCreep(updaterBody, updaterRole + "_" + Game.time + "_" + _.random(0, 10000), {
                memory: { role: updaterRole, harvesting: true }
            })

        }
    },

    runAll() {       
        _.forEach(this.selectAll(), function(updater) {
            if (updater.carry.energy >= updater.carryCapacity) {
                updater.memory.harvesting = false
            }
            if (updater.carry.energy <= 0) {
                updater.memory.harvesting = true
            }

            if (updater.memory.harvesting) {
                var source = updater.pos.findClosestByRange(FIND_SOURCES)
                var err = updater.harvest(source)
                if (err == ERR_NOT_IN_RANGE) {
                    updater.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } })

                }
            } else {
                var target = updater.room.controller

                err = updater.transfer(target, RESOURCE_ENERGY)
                if (err == ERR_NOT_IN_RANGE) {
                    updater.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } })

                }
            }
        })
    }
};
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvesters');
 * mod.thing == 'a thing'; // true
 */

var _ = require('lodash');
var helper = require('helper');


var wantedHarvesterCount = 4
var harvesterBody = [WORK, MOVE, CARRY]
var harvesterRole = "harvester"

module.exports = {
    selectAll(currentRoom) {
        return _.filter(Game.creeps, function (creep) {
            return (currentRoom == null || creep.room == currentRoom) &&
                creep.memory.role == harvesterRole
        })
    },

    spawnNeeded() {
        for (var spawnName in Game.spawns) {
            var localSpawn = Game.spawns[spawnName]

            var currentCreeperCount = this.selectAll(localSpawn.room).length;
            if (currentCreeperCount >= wantedHarvesterCount) {
                continue;
            }

            var err = localSpawn.spawnCreep(
                harvesterBody,
                harvesterRole + "_" + Game.time + "_" + _.random(0, 10000),
                { memory: { role: harvesterRole, status: true } }
            )
            if (err != OK) {
                console.log("spawning harvester:", err)
            }
        }
    },

    runAll() {
        _.forEach(this.selectAll(), function (harvester) {
            if (harvester.carry.energy >= harvester.carryCapacity) {
                harvester.memory.harvesting = false
            }
            if (harvester.carry.energy <= 0) {
                harvester.memory.harvesting = true
            }

            if (harvester.memory.harvesting) {
                var source = harvester.pos.findClosestByRange(FIND_SOURCES)
                var err = harvester.harvest(source)
                if (err == ERR_NOT_IN_RANGE) {
                    harvester.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } })
                }

            } else {
                var target = harvester.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
                })

                err = harvester.transfer(target, RESOURCE_ENERGY)
                if (err == ERR_NOT_IN_RANGE) {
                    harvester.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } })
                }
            }
        })
    }

};

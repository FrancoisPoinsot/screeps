/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builders');
 * mod.thing == 'a thing'; // true
 */

var _ = require('lodash');
var movement = require("movement")


var wantedbuilderCount = 1
var builderBody = [WORK, CARRY, CARRY, MOVE]
var builderRole = "builder"

module.exports = {
    spawnNeeded,
    runAll,
    selectAll
};


function runAll() {
    _.forEach(selectAll(), function (creep) {
        if (!creep.memory.state || !states[creep.memory.state]) {
            console.log("could not find valid state, reset to default", creep)
            creep.memory.state = "harvesting"
        }
        states[creep.memory.state](creep)
    })
}

function selectAll(currentRoom) {
    return _.filter(Game.creeps, function (creep) {
        return (currentRoom == null || creep.room == currentRoom) &&
            creep.memory.role == builderRole
    })
}

function spawnNeeded() {
    for (var spawnName in Game.spawns) {
        var localSpawn = Game.spawns[spawnName]

        var currentCreeperCount = selectAll(localSpawn.room).length;
        if (currentCreeperCount >= wantedbuilderCount) {
            continue;
        }

        localSpawn.spawnCreep(
            builderBody,
            builderRole + "_" + Game.time + "_" + _.random(0, 10000),
            { memory: { role: builderRole, state: "harvesting" } }
        )
    }
}

var states = {
    harvesting(creep) {
        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.state = "building"
            return
        }

        var source = creep.pos.findClosestByRange(FIND_SOURCES)
        var err = creep.harvest(source)
        if (err == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } })
            return
        }
    },

    building(creep) {
        if (creep.carry.energy <= 0) {
            creep.memory.state = "harvesting"
            return
        }

        var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        if (!target) {
            creep.memory.state = "idling"
            return
        }

        var err = creep.build(target)
        if (err == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } })
            return
        }
    },

    idling(creep) {
        var rand = _.random(0, 100)

        if (rand < 20) {
            movement.moveRandomStep(creep)
            return
        }
        if (rand < 30) {
            creep.memory.state = "building"
            return
        }
    }
}
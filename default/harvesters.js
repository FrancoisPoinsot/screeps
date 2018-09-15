/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * let mod = require('harvesters');
 * mod.thing == 'a thing'; // true
 */

let _ = require('lodash');
let helper = require('helper')


const wantedharvesterCount = 5
const bigHarvesterBody = [WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY]
const harvesterBody = [WORK, MOVE, CARRY]
const harvesterRole = "harvester"

module.exports = {
    spawnNeeded,
    runAll,
    selectAll
};


function runAll() {
    _.forEach(selectAll(), function (creep) {
        if (!creep.memory.state || !states[creep.memory.state]) {
            console.log("could not find valid state, reset to default", creep)
            helper.changeState(creep, "harvesting")
        }
        creep.say(creep.memory.role.substring(0, 2) + " " + creep.memory.state.substring(0, 2))
        states[creep.memory.state](creep)
    })
}

function selectAll(currentRoom) {
    return _.filter(Game.creeps, function (creep) {
        return (currentRoom == null || creep.room == currentRoom) &&
            creep.memory.role == harvesterRole
    })
}

function spawnNeeded() {
    _.forEach(Game.spawns, (localSpawn) => {
        let currentCreeperCount = selectAll(localSpawn.room).length;
        if (currentCreeperCount >= wantedharvesterCount) {
            return;
        }

        err = localSpawn.spawnCreep(
            bigHarvesterBody,
            harvesterRole + "_big_" + Game.time + "_" + localSpawn.id,
            { memory: { role: harvesterRole, state: "harvesting" } }
        )
        if (err == ERR_NOT_ENOUGH_ENERGY) {
            localSpawn.spawnCreep(
                harvesterBody,
                harvesterRole + "_" + Game.time + "_" + localSpawn.id,
                { memory: { role: harvesterRole, state: "harvesting" } }
            )
        }
    })
}

let states = {
    //default: (creep) => { this.harvesting(creep) },
    harvesting: helper.defaultHarvesting("storing"),
    idling: helper.defaultIdling("harvesting"),

    storing(creep) {
        if (creep.carry.energy <= 0) {
            helper.changeState(creep, "harvesting")
            return
        }

        let target = helper.findTarget(creep, () => {
            return creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            })
        })
        if (!target) {
            helper.changeState(creep, "idling")
            return
        }

        err = creep.transfer(target, RESOURCE_ENERGY)
        switch (err) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, { reusePath: 1000, visualizePathStyle: { stroke: '#ffffff' } })
                if (err == ERR_NO_PATH) {
                    creep.memory._move = ""
                }
                return
            case ERR_FULL:
            case ERR_INVALID_TARGET:
                creep.memory.target_id = ""
        }
    }
}
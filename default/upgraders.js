/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * let mod = require('upgraders');
 * mod.thing == 'a thing'; // true
 */

let _ = require('lodash');
let helper = require('helper')


let wantedupgraderCount = 2
let bigUpgraderBody = [WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
let upgraderBody = [WORK, MOVE, CARRY]
let upgraderRole = "upgrader"

module.exports = {
    spawnNeeded,
    runAll,
    selectAll
};


function runAll() {
    _.forEach(selectAll(), function (creep) {
        if (!creep.memory.state || !states[creep.memory.state]) {
            console.log("could not find valid state, reset to default", creep)
            helper.changeState(creep, "withdrawing")
        }
        creep.say(creep.memory.role.substring(0, 2) + " " + creep.memory.state.substring(0, 2))
        states[creep.memory.state](creep)
    })
}

function selectAll(currentRoom) {
    return _.filter(Game.creeps, function (creep) {
        return (currentRoom == null || creep.room == currentRoom) &&
            creep.memory.role == upgraderRole
    })
}

function spawnNeeded() {
    _.forEach(Game.spawns, (localSpawn) => {
        let currentCreeperCount = selectAll(localSpawn.room).length;
        if (currentCreeperCount >= wantedupgraderCount) {
            return;
        }

        err = localSpawn.spawnCreep(
            bigUpgraderBody,
            upgraderRole + "_big_" + Game.time + "_" + localSpawn.id,
            { memory: { role: upgraderRole, state: "withdrawing" } }
        )
        if (err == ERR_NOT_ENOUGH_ENERGY) {
            localSpawn.spawnCreep(
                upgraderBody,
                upgraderRole + "_" + Game.time + "_" + localSpawn.id,
                { memory: { role: upgraderRole, state: "withdrawing" } }
            )
        }
    })
}

let states = {
    withdrawing: helper.defaultWithdrawEnergy("upgrading"),

    upgrading(creep) {
        if (creep.carry.energy <= 0) {
            helper.changeState(creep, "withdrawing")
            return
        }

        let target = creep.room.controller

        err = creep.transfer(target, RESOURCE_ENERGY)
        switch (err) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, { reusePath: 1000, visualizePathStyle: { stroke: '#ffffff' } })
                if (err == ERR_NO_PATH) {
                    creep.memory._move = ""
                }
                return
            case ERR_INVALID_TARGET:
                creep.memory.target_id = ""
        }
    }
}
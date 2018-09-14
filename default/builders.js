/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * let mod = require('builders');
 * mod.thing == 'a thing'; // true
 */

let _ = require('lodash');
let helper = require('helper')


let wantedbuilderCount = 1
let builderBody = [WORK, CARRY, MOVE]
let bigBuilderBody = [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
let builderRole = "builder"

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
	_.forEach(Game.spawns, (localSpawn) => {
		let currentCreeperCount = selectAll(localSpawn.room).length;
		if (currentCreeperCount >= wantedbuilderCount) {
			return;
		}

		err = localSpawn.spawnCreep(
			bigBuilderBody,
			builderRole + "_big_" + Game.time + "_" + localSpawn.id,
			{ memory: { role: builderRole, state: "harvesting" } }
		)
		if (err == ERR_NOT_ENOUGH_ENERGY) {
			localSpawn.spawnCreep(
				builderBody,
				builderRole + "_" + Game.time + "_" + localSpawn.id,
				{ memory: { role: builderRole, state: "harvesting" } }
			)
		}
	})
}

let states = {
	harvesting(creep) {
		if (creep.carry.energy >= creep.carryCapacity) {
			helper.changeState(creep, "building")
			return
		}

		let target = helper.findTarget(creep, () => {
			return _.sample(creep.room.find(FIND_SOURCES))
		})

		let err = creep.harvest(target)
		if (err == ERR_NOT_IN_RANGE) {
			creep.moveTo(target, { reusePath: 1000, visualizePathStyle: { stroke: '#ffffff' } })
			return
		}
	},

	building(creep) {
		if (creep.carry.energy <= 0) {
			helper.changeState(creep, "harvesting")
			return
		}

		let target = helper.findTarget(creep, () => { return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES) })
		if (!target) {
			helper.changeState(creep, "idling")
			return
		}

		let err = creep.build(target)
		switch (err) {
			case ERR_NOT_IN_RANGE:
				creep.moveTo(target, { reusePath: 1000, visualizePathStyle: { stroke: '#ffffff' } })
				return
			case ERR_INVALID_TARGET:
				creep.memory.target_id = ""
		}
	},

	idling(creep) {
		let rand = _.random(0, 100)

		if (rand < 10) {
			helper.moveRandomStep(creep)
			return
		}
		if (Game.time % 20 == 0) {
			helper.changeState(creep, "building")
			return
		}
	}
}
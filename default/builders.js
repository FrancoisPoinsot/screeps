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

let builderRole = "builder"

module.exports = {
	runAll,
	selectAll
};


function runAll() {
	_.forEach(selectAll(), function (creep) {
		if (!creep.memory.state || !states[creep.memory.state]) {
			console.log("could not find valid state, reset to default", creep)
            helper.changeState(creep, "withdrawing")
		}
		creep.say(creep.memory.role.substring(0,2) + " " + creep.memory.state.substring(0, 2))
		states[creep.memory.state](creep)
	})
}

function selectAll(currentRoom) {
	return _.filter(Game.creeps, function (creep) {
		return (currentRoom == null || creep.room == currentRoom) &&
			creep.memory.role == builderRole
	})
}

let states = {
    withdrawing: helper.defaultWithdrawEnergy("building"),
	idling: helper.defaultIdling("building"),

	building(creep) {
		if (creep.carry.energy <= 0) {
			helper.changeState(creep, "withdrawing")
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
				if (err == ERR_NO_PATH) {
					creep.memory._move = ""
				}
				return
			case ERR_INVALID_TARGET:
				creep.memory.target_id = ""
		}
	}
}
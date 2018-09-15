let _ = require('lodash');

module.exports = {
	findTarget,
	changeState,
	errString,
	moveRandomStep,
	bodyCost,
	defaultHarvesting,
	defaultIdling,
	defaultWithdrawEnergy
};

function findTarget(creep, selectTarget) {
	let target
	if (creep.memory.target_id) {
		return Game.getObjectById(creep.memory.target_id)
	}

	target = selectTarget()
	if (target) {
		creep.memory.target_id = target.id
	}
	return target
}

function changeState(creep, newState) {
	creep.memory.state = newState
	creep.memory.target_id = ""
}

let err_codes = {
	"0": "OK",
	"-1": "ERR_NOT_OWNER",
	"-2": "ERR_NO_PATH",
	"-3": "ERR_NAME_EXISTS",
	"-4": "ERR_BUSY",
	"-5": "ERR_NOT_FOUND",
	"-6": "ERR_NOT_ENOUGH_RESOURCES",
	"-7": "ERR_INVALID_TARGET",
	"-8": "ERR_FULL",
	"-9": "ERR_NOT_IN_RANGE",
	"-10": "ERR_INVALID_ARGS:",
	"-11": "ERR_TIRED:",
	"-12": "ERR_NO_BODYPART:",
	"-14": "ERR_RCL_NOT_ENOUGH:",
	"-15": "ERR_GCL_NOT_ENOUGH:",
}

function errString(code) {
	return err_codes[code]
}

var directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]

function moveRandomStep(creep) {
	var direction = _.sample(directions)
	let err = creep.move(direction)
}

function bodyCost(body) {
	return body.reduce(function (cost, part) {
		return cost + BODYPART_COST[part];
	}, 0);
}

function defaultHarvesting(nextState) {
	return (creep) => {
		if (creep.carry.energy >= creep.carryCapacity) {
			changeState(creep, nextState)
			return
		}

		let target = findTarget(creep, () => {
			return creep.pos.findClosestByRange(FIND_SOURCES)
		})

		let err = creep.harvest(target)
		if (err == ERR_NOT_IN_RANGE) {
			err = creep.moveTo(target, { reusePath: 1000, visualizePathStyle: { stroke: '#ffffff' } })
			if (err == ERR_NO_PATH) {
				creep.memory._move = ""
			}
			return
		}
	}
}

function defaultIdling(nextState) {
	return (creep) => {
		let rand = _.random(0, 100)

		if (rand < 5) {
			moveRandomStep(creep)
			return
		}
		if (Game.time % 20 == 0) {
			changeState(creep, nextState)
			return
		}
	}
}

function defaultWithdrawEnergy(nextState) {
	return (creep) => {
		if (creep.carry.energy >= creep.carryCapacity) {
			changeState(creep, nextState)
			return
		}

		let target = findTarget(creep, () => {
			return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION) &&
						structure.energy > 0;
				}
			})
		})

		let err = creep.withdraw(target, RESOURCE_ENERGY)
		switch (err) {
			case ERR_NOT_IN_RANGE:
				err = creep.moveTo(target, { reusePath: 1000, visualizePathStyle: { stroke: '#ffffff' } })
				if (err == ERR_NO_PATH) {
					creep.memory._move = ""
				}
			case ERR_NOT_ENOUGH_RESOURCES:
			case ERR_INVALID_TARGET:
				creep.memory.target_id = ""
		}
	}
}
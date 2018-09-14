let _ = require('lodash');

module.exports = {
	findTarget,
	changeState,
	errString,
	moveRandomStep,
	bodyCost
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

var directions = ["TOP", "TOP_RIGHT", "RIGHT", "BOTTOM_RIGHT", "BOTTOM", "BOTTOM_LEFT", "LEFT", "TOP_LEFT"]

function moveRandomStep(creep) {
    var direction = _.sample(directions)
    creep.move(direction)
}

function bodyCost(body) {
	return body.reduce(function (cost, part) {
		return cost + BODYPART_COST[part];
	}, 0);
}
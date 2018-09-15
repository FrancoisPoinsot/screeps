var harvesters = require("harvesters")
var upgraders = require("upgraders")
var builders = require("builders")
let _ = require('lodash')

module.exports = {
	runAll,
};

function runAll() {
	_.forEach(selectAll(), function (creep) {
		if (!creep.memory.state || !states[creep.memory.state]) {
			console.log("could not find valid state, reset to default", creep)
            helper.changeState(creep, "harvesting")
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
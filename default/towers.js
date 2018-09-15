let _ = require('lodash');
let helper = require('helper')


module.exports = {
	runAll
}

function runAll() {
	_.forEach(selectAll(), (tower) => {
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
	})
}

function selectAll(currentRoom) {
	return _.filter(Game.structures, function (structure) {
		return (currentRoom == null || structure.room == currentRoom) &&
			structure.structureType == STRUCTURE_TOWER &&
			structure.isActive()
	})
}
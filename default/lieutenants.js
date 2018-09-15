const _ = require('lodash');
const helper = require('helper')

module.exports = {
	sampleRooms,
	spawnAllNeeded
};

// key: role, value: order list of body (biggest first)
const creepSpecs = {
	"harvester": [
		{ name: "harvester_big", body: [WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY] },
		{ name: "harvester", body: [WORK, MOVE, CARRY] }
	]
	//TODO other roles
}

function sampleRooms() {
	// list controlled rooms
	let controlledRoomNames = new Set()
	_.forEach(Game.spawns, (localSpawn) => {
		controlledRoomNames.add(localSpawn.room.name)
	})
	Memory.controlledRoomNames = [...controlledRoomNames]

	_.forEach(Memory.controlledRoomNames, (roomName) => {
		assessNeededCreeps(Game.rooms[roomName])
	})
}

function assessNeededCreeps(room) {
	let neededCreeps = {}
	let sources = room.find(FIND_SOURCES)
	neededCreeps["harvester"] = sources.length * 3
	//TODO other roles
	room.memory.neededCreeps = neededCreeps
}

function spawnAllNeeded() {
	_.forEach(Memory.controlledRoomNames, (roomName) => {
		spawnNeeded(Game.rooms[roomName])
	})
}

function spawnNeeded(room) {
	_.forEach(room.memory.neededCreeps, (neededCount, role) => {
		let currentCount = selectAll(role, room).length;
		if (currentCount >= neededCount) {
			return;
		}
		
		//try to spawn the biggest possible
		let anySpawn = room.find(FIND_MY_SPAWNS)[0]
		_.forEach(creepSpecs[role],(spec) => {
			let err = anySpawn.spawnCreep(
				spec.body,
				spec.name + "_" + Game.time + "_" + anySpawn.id,
				{ memory: { role: role, state: "default" } }
			)
			if (err == OK) {
				return false //break
			}
		})
	});
}


function selectAll(role, room) {
	return _.filter(Game.creeps, function (creep) {
		return (room == null || creep.room == room) &&
			creep.memory.role == role
	})
}
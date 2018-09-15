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
		{ name: "harvester", body: [WORK, MOVE, CARRY] },
	],
	"upgrader": [
		{ name: "bigUpgraderBody", body: [WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY] },
		{ name: "upgraderBody", body: [WORK, MOVE, CARRY] }
	],
	"builder": [
		{ name: "bigBuilderBody", body: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]},
		{ name: "builderBody", body: [WORK, CARRY, MOVE] }
	]
}

function sampleRooms() {
	
	// list controlled rooms
	let controlledRoomNames = new Set()
	_.forEach(Game.spawns, (localSpawn) => {
		controlledRoomNames.add(localSpawn.room.name)
	})
	Memory.controlledRoomNames = [...controlledRoomNames]

	// assess expected number of creep for each roles for each rooms
	// then persiste it in room memory
	_.forEach(Memory.controlledRoomNames, (roomName) => {
		assessNeededCreeps(Game.rooms[roomName])
	})
}

function assessNeededCreeps(room) {
	let neededCreeps = {}

	// harvesters
	let sources = room.find(FIND_SOURCES)
	neededCreeps["harvester"] = sources.length * 3

	// builders
	constructionSites = room.find(FIND_CONSTRUCTION_SITES)
	neededCreeps["builder"] = Math.ceil(constructionSites.length / 5)

	// upgraders
	neededCreeps["upgrader"] = 4

	// TODO other roles
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

		// try to spawn the biggest possible
		// TODO search for more than one spawn in a room
		let anySpawn = room.find(FIND_MY_SPAWNS)[0]
		_.forEach(creepSpecs[role], (spec) => {
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
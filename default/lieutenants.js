const _ = require('lodash');
const helper = require('helper')
const roads = require('roads')

// lieutenant is room level
// try not to micro manage. He rather allocate creeps to role or area
// algorythms may be heavy but don't need to run often

module.exports = {
	sampleRooms,
	spawnAllNeeded,
	allocateHarvestersToSource,
	buildAllNeededRoads
};

const requiredHarvestersPerSource = 3

// key: role, value: order list of body (biggest first)
const creepSpecs = {
	"harvester": [
		{ name: "harvester_big", body: [WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY] },
		{ name: "harvester_medium", body: [WORK, WORK, MOVE, CARRY] },
		{ name: "harvester", body: [WORK, MOVE, CARRY] }
	],
	"upgrader": [
		{ name: "upgrader_big", body: [WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY] },
		{ name: "upgrader", body: [WORK, MOVE, CARRY] }
	],
	"builder": [
		{ name: "builder_big", body: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] },
		{ name: "builder", body: [WORK, CARRY, MOVE] }
	]
}

function sampleRooms() {
	// assess expected number of creep for each roles for each rooms
	// then persiste it in room memory
	_.forEach(Memory.controlledRoomNames, (roomName) => {
		assessNeededCreeps(Game.rooms[roomName])
	})
}

function assessNeededCreeps(room) {
	if (room.controller.my) {
		let neededCreeps = {}

		// harvesters
		let sources = room.find(FIND_SOURCES)
		neededCreeps["harvester"] = sources.length * requiredHarvestersPerSource

		// builders
		constructionSites = room.find(FIND_CONSTRUCTION_SITES)
		neededCreeps["builder"] = Math.min(Math.ceil(constructionSites.length / 5), 4)

		// upgraders
		neededCreeps["upgrader"] = 4

		// TODO other roles
		room.memory.neededCreeps = neededCreeps
	}
}

function spawnAllNeeded() {
	_.forEach(Game.rooms, (room) => {
		spawnNeeded(room)
	})
}

function spawnNeeded(room) {
	_.forEach(room.find(FIND_MY_SPAWNS), (spawn) => {
		if (spawn.spawning) {
			return
		}

		_.forEach(room.memory.neededCreeps, (neededCount, role) => {
			let currentCount = selectAll(role, room).length;
			if (currentCount >= neededCount) {
				return;
			}

			_.forEach(creepSpecs[role], (spec) => {
				let err = spawn.spawnCreep(
					spec.body,
					spec.name + "_" + Game.time + "_" + spawn.id,
					{ memory: { role: role, state: "default" } }
				)
				if (err == OK) {
					return false //break 
				}
			})
			if (spawn.spawning) {
				return false // break => next spawn
			}
		})
	})
}


function selectAll(role, room) {
	return _.filter(Game.creeps, function (creep) {
		return (room == null || creep.room == room) &&
			creep.memory.role == role
	})
}

function allocateHarvestersToSource() {
	_.forEach(Memory.controlledRoomNames, (roomName) => {
		let room = Game.rooms[roomName]

		// init sources memory if not exist
		// this is not for performance, rather to give possiblity to store memory for sources
		if (!room.memory.sources) {
			let sources = []
			_.forEach(room.find(FIND_SOURCES), (source) => {
				sources.push({ source_id: source.id })
			})
			room.memory.sources = sources
		}

		_.forEach(room.memory.sources, (sourceSpec) => {

			// select harvesters allocated to this source
			let harvesters = room.find(FIND_MY_CREEPS, {
				filter: function (creep) {
					return creep.memory.role == "harvester" && creep.memory.allocated_to == sourceSpec.source_id
				}
			})

			let harvesterCount = harvesters.length
			if (harvesterCount >= requiredHarvestersPerSource) {
				return
			}

			let freeHarvesters = room.find(FIND_MY_CREEPS, {
				filter: function (creep) {
					return creep.memory.role == "harvester" && !creep.memory.allocated_to
				}
			})

			// Allocate harvesters up to either:
			// - required harvesters count
			// - available free harvesters
			_.forEach(freeHarvesters, (creep) => {
				creep.memory.allocated_to = sourceSpec.source_id
				harvesterCount++
				if (harvesterCount >= requiredHarvestersPerSource) {
					return false
				}
			})
		})
	})
}

function buildAllNeededRoads(role, room) {
	_.forEach(Game.rooms, (room) => {
		buildNeededRoads(room)
	})
}

function buildNeededRoads(room) {
	let roadRequests = roads.getRequestedRoads(room)
	_.forEach(roadRequests, (request, key) => {
		if (request.x && request.y) {
			roomPosition = room.getPositionAt(request.x, request.y)
			if (roads.canBuildRoad(roomPosition)) {
				room.createConstructionSite(roomPosition, STRUCTURE_ROAD)
			}
		}
		delete roadRequests[key]
	})
}
const _ = require('lodash');
const helper = require('helper')

// store request for roads, does not build it
// expose said requests, organised by room, for anyone who want to build

module.exports = {
	ensureRoadExist,
	getRequestedRoads,
	canBuildRoad
};

function requestRoad(roomPosition) {
	let room = Game.rooms[roomPosition.roomName]
	if (!room.memory.road_requested) {
		room.memory.road_requested = {}
	}

	let positionKey = getPositiontionKey(roomPosition)
	let exisitingRequest = room.memory.road_requested[positionKey]
	if (!exisitingRequest) {
		room.memory.road_requested[positionKey] = { x: roomPosition.x, y: roomPosition.y, weight: 1 }
	} else {
		room.memory.road_requested[positionKey] = { x: roomPosition.x, y: roomPosition.y, weight: exisitingRequest.weight + 1 }
	}
}

function getPositiontionKey(roomPosition) {
	return roomPosition.roomName + "_" + roomPosition.x + "_" + roomPosition.y
}

function getRequestedRoads(room) {
	return room.memory.road_requested
}

function ensureRoadExist(roomPosition) {
	if (canBuildRoad(roomPosition)) {
		requestRoad(roomPosition)
	}
}

function canBuildRoad(roomPosition) {
	let stuffThere = roomPosition.look()
	let anyStructure = _.find(stuffThere, (something) => {
		something.type == LOOK_STRUCTURES || something.type == LOOK_CONSTRUCTION_SITES
	})

	return !anyStructure
}
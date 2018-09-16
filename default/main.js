// executed on new global 
// var mod = require('mod');

var harvesters = require("harvesters")
var upgraders = require("upgraders")
var builders = require("builders")
var lieutenants = require("lieutenants")
var towers = require("towers")
var helper = require("helper")
let _ = require('lodash')


module.exports.loop = function () {
	if (Game.time % 20 == 0) {
		lieutenants.sampleRooms()
		lieutenants.allocateHarvestersToSource()
		lieutenants.buildAllNeededRoads()
	}
	lieutenants.spawnAllNeeded()

	harvesters.runAll()
	upgraders.runAll()
	builders.runAll()
	towers.runAll()

	cleanupMemory()
}

function cleanupMemory() {
	for (var name in Memory.creeps) {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}
}
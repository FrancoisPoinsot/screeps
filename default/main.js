// executed on new global 
// var mod = require('mod');

var harvesters = require("harvesters")
var upgraders = require("upgraders")
var builders = require("builders")
let _ = require('lodash')
var helper = require("helper")
var lieutenants = require("lieutenants")

module.exports.loop = function () {

	if(Game.time % 100 == 0){
		lieutenants.sampleRooms()
	}
	lieutenants.spawnAllNeeded()

	harvesters.runAll()
	upgraders.runAll()
	builders.runAll()

}
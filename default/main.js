// executed on new global 
//var mod = require('mod');

var harvesters = require("harvesters")
var updaters = require("updaters")
var builders = require("builders")
var helper = require("helper")
let _ = require('lodash')

module.exports.loop = function () {
	// executed every tick
	//mod.foo();

	harvesters.spawnNeeded()
	harvesters.runAll()
	updaters.spawnNeeded()
	updaters.runAll()
	builders.spawnNeeded()
	builders.runAll()
}
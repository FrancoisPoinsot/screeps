// executed on new global 
//var mod = require('mod');

var harvesters = require("harvesters")
var upgraders = require("upgraders")
var builders = require("builders")
let _ = require('lodash')
var helper = require("helper")

module.exports.loop = function () {
	
	harvesters.spawnNeeded()
	harvesters.runAll()
	upgraders.spawnNeeded()
	upgraders.runAll()
	builders.spawnNeeded() 
	builders.runAll()

}
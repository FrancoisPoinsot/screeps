var _ = require('lodash');

module.exports = {
    directions,
    moveRandomStep    
}

var directions = ["TOP", "TOP_RIGHT", "RIGHT", "BOTTOM_RIGHT", "BOTTOM", "BOTTOM_LEFT", "LEFT", "TOP_LEFT"]

function moveRandomStep(creep) {
    var direction = _.sample(directions)
    creep.move(direction)
}

var mongoose = require('mongoose');
var Event = require('./event.js');

// Allocation Schema
var DistributionSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['fixed', 'normal', 'uniform', 'starts-with', 'starts-after']},
    value1: { type: Number, default: 0},
    value2: { type: Number},
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
})

module.exports = mongoose.model('Distribution', DistributionSchema);
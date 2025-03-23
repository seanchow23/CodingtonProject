var mongoose = require('mongoose');
var Event = require('./event.js');

// Rebalance Schema
var RebalanceSchema = new mongoose.Schema({
    allocation: { type: Number, required: true },
    change: { type: Number, required: true },
});

RebalanceSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('rebalance', RebalanceSchema);
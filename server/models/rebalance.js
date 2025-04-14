var mongoose = require('mongoose');
var Event = require('./event.js');
var Allocation = require('./allocation.js');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Rebalance Schema
var RebalanceSchema = new mongoose.Schema({
    allocation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Allocation' }],
    change: { type: Number, required: true },
});

RebalanceSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('rebalance', RebalanceSchema);
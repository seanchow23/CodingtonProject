var mongoose = require('mongoose');
var Event = require('./event.js');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Rebalance Schema
var RebalanceSchema = new mongoose.Schema({
    allocation: { type: Number, required: true },
    change: { type: Number, required: true },
});

RebalanceSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('rebalance', RebalanceSchema);
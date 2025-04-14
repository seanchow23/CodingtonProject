var mongoose = require('mongoose');
var Event = require('./event.js');
var Allocation = require('./allocation.js');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Invest Schema
var InvestSchema = new mongoose.Schema({
    allocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Allocation' }],
    max: { type: Number, required: true },
});

InvestSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('invest', InvestSchema);
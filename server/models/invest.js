var mongoose = require('mongoose');
var Event = require('./event.js');
var Investment = require('./investment.js');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Allocation Schema
var AllocationSchema = new mongoose.Schema({
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
    percentage: { type: Number, required: true, min: 0, max: 100 }
})

// Invest Schema
var InvestSchema = new mongoose.Schema({
    allocations: [AllocationSchema],
    max: { type: Number, required: true },
});

InvestSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('invest', InvestSchema);
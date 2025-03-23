var mongoose = require('mongoose');
var Event = require('./event.js');

// Invest Schema
var InvestSchema = new mongoose.Schema({
    allocation: { type: Number, required: true },
    max: { type: Number, required: true },
});

InvestSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('invest', InvestSchema);
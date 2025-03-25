var mongoose = require('mongoose');
var Event = require('./event.js');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Invest Schema
var InvestSchema = new mongoose.Schema({
    allocation: { type: Number, required: true },
    max: { type: Number, required: true },
});

InvestSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('invest', InvestSchema);
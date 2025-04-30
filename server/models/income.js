var mongoose = require('mongoose');
var Event = require('./event.js');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Income Schema
var IncomeSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    change: { type: Number, required: true },
    inflation: { type: Boolean, required: true },
    ss: { type: Boolean, required: true }
});

IncomeSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('Income', IncomeSchema);
var mongoose = require('mongoose');
var Event = require('./event.js');

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

module.exports = Event.discriminator('income', IncomeSchema);
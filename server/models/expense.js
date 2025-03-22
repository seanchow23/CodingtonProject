var mongoose = require('mongoose');
var Event = require('./event.js');

// Expense Schema
var ExpenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    change: { type: Number, required: true },
    inflation: { type: Boolean, required: true },
    discretionary: { type: Boolean, required: true }
});

ExpenseSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = Event.discriminator('expense', ExpenseSchema);
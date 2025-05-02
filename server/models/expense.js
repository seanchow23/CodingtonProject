var mongoose = require('mongoose');
var Event = require('./event.js');

/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

// Expense Schema
var expenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    change: { type: Number, required: true },
    inflation: { type: Boolean, required: true },
    discretionary: { type: Boolean, required: true }
});

expenseSchema.virtual('url').get(function () {
    return this._id;
});


module.exports = Event.discriminator('expense', expenseSchema);
const mongoose = require('mongoose');
var Event = require('./event.js');
var Investment = require('./investment.js');

const scenarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    married: { type: Boolean, required: true },
    birthYearUser: { type: Number, required: true },
    birthYearSpouse: { type: Number },
    lifeExpectancyUser: { type: Number, required: true },
    lifeExpectancySpouse: { type: Number },
    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    inflation: { type: Number, required: true },
    annualLimit: { type: Number, required: true },
    spendingStrategy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
    withdrawalStrategy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    rmd: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    rothStrategy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    rothOptimizer: { type: Boolean, default: false },
    sharingSettings: { type: String },
    financialGoal: { type: Number, required: true },
    state: { type: String, required: true },
});

module.exports = mongoose.model('Scenario', scenarioSchema);
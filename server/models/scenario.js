const mongoose = require('mongoose');

/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

const scenarioSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', immutable: true },      
    name: { type: String, required: true },
    married: { type: Boolean, required: true },
    birthYearUser: { type: Number, required: true },
    birthYearSpouse: { type: Number },
    lifeExpectancyUser: { type: Number, required: true },
    lifeExpectancySpouse: { type: Number },
    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    investmentTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentType' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    inflation: { type: Number, required: true },
    annualLimit: { type: Number, required: true },
    spendingStrategy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'expense' }],
    withdrawalStrategy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    rmd: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    rothStrategy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    rothYears: [{ type: Number }],
    rothOptimizer: { type: Boolean, default: false },
    sharing: { type: String },
    financialGoal: { type: Number, required: true },
    state: { type: String, required: true },
    random: [{ type: Number }],
});

module.exports = mongoose.model('Scenario', scenarioSchema);
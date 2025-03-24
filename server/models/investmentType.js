const mongoose = require('mongoose');

const investmentTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    expectedAnnualReturn: { type: Number, required: true },
    expenseRatio: { type: Number, required: true },
    expectedAnnualIncome: { type: Number, required: true },
    taxability: { type: Boolean, required: true }
});

module.exports = mongoose.model('InvestmentType', investmentTypeSchema);;
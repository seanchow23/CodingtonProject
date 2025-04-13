const mongoose = require('mongoose');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

const investmentTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    expectedAnnualReturn: { type: Number, required: true },
    expenseRatio: { type: Number, required: true },
    expectedAnnualIncome: { type: Number, required: true },
    taxability: { type: Boolean, required: true }
});

module.exports = mongoose.model('InvestmentType', investmentTypeSchema);;
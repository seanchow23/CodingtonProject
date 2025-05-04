const mongoose = require('mongoose');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

const investmentTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    expectedAnnualReturn: { type: mongoose.Schema.Types.ObjectId, ref: 'Distribution', required: true},
    expenseRatio: { type: Number, required: true },
    expectedAnnualIncome: { type: mongoose.Schema.Types.ObjectId, ref: 'Distribution', required: true},
    taxability: { type: Boolean, required: true },
});

module.exports = mongoose.model('InvestmentType', investmentTypeSchema);
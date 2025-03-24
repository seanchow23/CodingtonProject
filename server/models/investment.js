const mongoose = require('mongoose');
const InvestmentType = require('./investmentType');

const investmentSchema = new mongoose.Schema({
    investmentType: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentType', required: true },
    value: { type: Number, required: true },
    taxStatus: { type: String, enum: ['non-retirement', 'pre-tax retirement', 'after-tax retirement'], required: true }
});

module.exports = mongoose.model('Investment', investmentSchema);
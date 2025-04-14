const mongoose = require('mongoose');
const InvestmentType = require('./investmentType');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */

const investmentSchema = new mongoose.Schema({
    investmentType: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentType', required: true },
    value: { type: Number, required: true },
    basValue: { type: Number, required: true },
    taxStatus: { type: String, enum: ['non-retirement', 'pre-tax retirement', 'after-tax retirement'], required: true }
});

module.exports = mongoose.model('Investment', investmentSchema);
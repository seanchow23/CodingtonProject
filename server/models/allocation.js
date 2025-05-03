var mongoose = require('mongoose');
var Investment = require('./investment.js');

// Allocation Schema
var AllocationSchema = new mongoose.Schema({
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    finalPercentage: { type: Number, min: 0, max: 100 },
    glide: { type: Number, default: 0 }
})

module.exports = mongoose.model('Allocation', AllocationSchema);
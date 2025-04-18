var mongoose = require('mongoose');
var Investment = require('./investment.js');

// Allocation Schema
var AllocationSchema = new mongoose.Schema({
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
    percentage: { type: Number, required: true, min: 0, max: 100 }
})

module.exports = mongoose.model('Allocation', AllocationSchema);
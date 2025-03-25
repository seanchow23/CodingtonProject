var mongoose = require('mongoose');

// Base Event Schema
var EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    startYear: { type: Number, required: true },
    duration: { type: Number, required: true }
}, {
    discriminatorKey: 'type'
});

EventSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = mongoose.model('Event', EventSchema);
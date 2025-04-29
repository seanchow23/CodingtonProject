var mongoose = require('mongoose');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */
// Base Event Schema
var EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    startYear: { type: Number, required: true },
    duration: { type: Number, required: true },
    random: [{ type: Number }]
}, {
    discriminatorKey: 'type'
});

EventSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = mongoose.model('Event', EventSchema);
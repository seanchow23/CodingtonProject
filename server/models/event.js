var mongoose = require('mongoose');
/* this schema was originally prompted from chatgpt but had to be cut down and edited to be more concise */
// Base Event Schema
var EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    startYear: { type: mongoose.Schema.Types.ObjectId, ref: 'Distribution', required: true},
    duration: { type: mongoose.Schema.Types.ObjectId, ref: 'Distribution', required: true},
}, {
    discriminatorKey: 'type'
});

EventSchema.virtual('url').get(function () {
    return this._id;
});

module.exports = mongoose.model('Event', EventSchema);
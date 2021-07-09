const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EntrySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.String,
        ref: 'user',
        required: true
    },
    mood: {
        type: String,
        required: true
    },
    emotion: {
        type: String,
        required: true
    },
    activities: [],
    tags: [],    
    text: {
        type: String,
        required: true
    },
    linkedEntry: {
        type: mongoose.Schema.Types.String,
        ref: 'entry'
    },
    dateUpdated: {
        type: Date
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Create a text index on the entry model field "mood"
// EntrySchema.index({ mood: "text" });

module.exports = Entry = mongoose.model('entry', EntrySchema);
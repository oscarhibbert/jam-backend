const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EntrySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.String,
        ref: 'user'
    },
    mood: {
        type: String,
        required: true
    },
    emotion: {
        type: String,
        required: true
    },
    tags: [],    
    text: {
        type: String,
        required: true
    },
    dateUpdated: {
        type: Date
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

module.exports = Entry = mongoose.model('entry', EntrySchema);
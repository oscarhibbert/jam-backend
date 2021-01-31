const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EntrySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        required: true
    },
    tags: [
        {
            tag: {
                type: String,
                unique: true
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Entry = mongoose.model('entry', EntrySchema);
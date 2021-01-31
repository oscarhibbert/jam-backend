const mongoose = require('mongoose');

const UserSchema = new.mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    journalTags: [
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

module.exports = Users = mongoose.model('user', UserSchema);
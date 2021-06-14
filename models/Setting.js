const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SettingSchema = new Schema({
    user: {
        type: String,
        ref: 'user',
        required: true,
        unique: true
    },
    tags: [
        {
            name: {
                type: String
            },
            type: {
                type: String,
                required: true
            }
        }
    ],
    dailyReflectionAlert: {
        type: Boolean,
        required: true,
        default: true
    },
    dailyReflectionAlertTime: {
        type: Number,
        required: true
    }
});

module.exports = Setting = mongoose.model('setting', SettingSchema);
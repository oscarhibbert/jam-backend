const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SettingSchema = new Schema({
    user: {
        type: String,
        ref: 'user',
        required: true,
        unique: true
    },
    dailyReflectionAlert: {
        type: Boolean,
        required: true,
        default: true
    },
    dailyReflectionAlertTime: {
        type: Number,
        default: 21,
        required: true
    },
    settingsSetupComplete: {
    type: Boolean,
    default: false,
    required: true,
  }
});

module.exports = Setting = mongoose.model('setting', SettingSchema);
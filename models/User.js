const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  auth0UserId: {
    type: String,
    required: true,
  },
  profileSetupComplete: {
    type: Boolean,
    default: false,
    required: true,
  },
  dateCreated: {
    type: String,
    default: Date.now
  },
});

module.exports = User = mongoose.model('user', UserSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.String,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
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

module.exports = Categories = mongoose.model('categories', CategoriesSchema);
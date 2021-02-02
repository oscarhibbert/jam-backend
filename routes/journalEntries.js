// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const {
    validateNewEntry
} = require('../middleware/validators');

// Import controllers
const {
    createNewEntry
} = require('../controllers/journalEntries');

const router = express.Router();

// Post Requests
// Create new journal entry
router.route('/:id')
    .post(validateNewEntry, createNewEntry);

module.exports = router;
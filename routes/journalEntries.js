// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const {
    validateNewEntry
} = require('../middleware/validators');

// Import controllers
const {
    createNewEntry,
    updateEntry
} = require('../controllers/journalEntries');

const router = express.Router();

// POST Request
// Create new journal entry
router.route('/:id')
    .post(validateNewEntry, createNewEntry);

// PUT Request
// Update an existing journal entry
router.route('/:id')
    .patch(updateEntry);

module.exports = router;
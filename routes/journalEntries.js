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
    updateEntry,
    deleteEntry
} = require('../controllers/journalEntries');

const router = express.Router();

// POST Request
// Create new journal entry by user ID
router.route('/:id')
    .post(validateNewEntry, createNewEntry);

// PUT Request
// Update a journal entry by entry ID
router.route('/:id')
    .patch(updateEntry);

// DELETE Request
// Delete a journal entry by entry ID
router.route('/:id')
    .delete(deleteEntry);

module.exports = router;
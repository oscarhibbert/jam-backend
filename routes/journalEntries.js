// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const {
    validateEntry
} = require('../middleware/validators');

// Import controllers
const {
    createEntry,
    updateEntry,
    deleteEntry,
    getAllEntries
} = require('../controllers/journalEntries');

const router = express.Router();

// POST Request
// Create new journal entry by user ID
router.route('/:id')
    .post(validateEntry, createEntry);

// PUT Request
// Update a journal entry by entry ID
router.route('/:id')
    .patch(updateEntry);

// DELETE Request
// Delete a journal entry by entry ID
router.route('/:id')
    .delete(deleteEntry);

// GET Requests
// Get all journal entries by user ID
router.route('/:id')
    .get(getAllEntries);

module.exports = router;
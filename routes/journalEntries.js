// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const {
    validateEntry
} = require('../middleware/validators');

const { authorise } = require('../middleware/authorise');

// Import controller methods
const {
    createEntry,
    updateEntry,
    deleteEntry,
    getAllEntries,
    getEntry
} = require('../controllers/journalEntries');

const router = express.Router();

// @desc   Create a journal entry by user ID
// @route  POST api/v1/entries/id
// @access Private
router.route('/:id')
    .post(authorise, validateEntry, createEntry);

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

// Get journal entry by entry ID
router.route('/entry/:id')
    .get(getEntry);

module.exports = router;
// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const { authorise } = require('../middleware/authorise');
const { checkJwt } = require('../middleware/checkJwt');

const {
    validateEntry,
    validateUpdateEntry
} = require('../middleware/validators');

// Import controller methods
const {
    createEntry,
    updateEntry,
    deleteEntry,
    getAllEntries,
    getEntry
} = require('../controllers/journalEntries');

const router = express.Router();

// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
router.route('/')
    .post(checkJwt, validateEntry, createEntry);

// @desc   Update a journal entry by entry ID
// @route  PATCH api/v1/entries/id
// @access Private
router.route('/:id')
    .patch(authorise, validateUpdateEntry, updateEntry);

// @desc   Delete a journal entry by entry ID
// @route  DELETE api/v1/entries/id
// @access Private
router.route('/:id')
    .delete(authorise, deleteEntry);

// @desc   Get all journal entries
// @route  GET api/v1/entries
// @access Private
router.route('/')
    .get(authorise, getAllEntries);

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/id
// @access Private
router.route('/:id')
    .get(authorise, getEntry);

module.exports = router;
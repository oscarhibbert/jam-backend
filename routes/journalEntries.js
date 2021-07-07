// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const { checkJwt } = require('../middleware/checkJwt');

const {
    validateEntry
} = require('../middleware/validators');

// Import controller methods
const {
    createEntry,
    editEntry,
    deleteEntry,
    getAllEntries,
    getEntry,
    getClosestEntry
} = require('../controllers/journalEntries');

const router = express.Router();

// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
router.route('/')
    .post(checkJwt, validateEntry, createEntry);

// @desc   Edit a journal entry by entry ID
// @route  PATCH api/v1/entries/:id
// @access Private
router.route('/:id')
    .patch(checkJwt, editEntry);

// @desc   Delete a journal entry by entry ID
// @route  DELETE api/v1/entries/id
// @access Private
router.route('/:id')
    .delete(checkJwt, deleteEntry);

// @desc   Get all journal entries
// @route  GET api/v1/entries
// @access Private
router.route('/')
    .get(checkJwt, getAllEntries);

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/id
// @access Private
router.route('/:id')
    .get(checkJwt, getEntry);

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/closestmatch/:id
// @access Private
router.route('/closestmatch/:id')
    .get(checkJwt, getClosestEntry);

module.exports = router;
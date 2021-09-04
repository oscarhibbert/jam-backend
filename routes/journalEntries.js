// This is the journal entries routes file

// Imports
const express = require('express');

// Import middleware
const { checkJwt } = require('../middleware/checkJwt');

// Import logger middleware
const { logger } = require('../middleware/logger');

const {
    validateEntry,
    validateGetAllEntries,
    validateGetStats
} = require('../middleware/validators');

// Import controller methods
const {
    createEntry,
    editEntry,
    deleteEntry,
    getAllEntries,
    getEntry,
    getMostRecentEntry,
    getClosestEntry,
    getStats
} = require('../controllers/journalEntries');

const router = express.Router();

// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
router.route('/')
    .post(checkJwt, logger, validateEntry, createEntry);

// @desc   Edit a journal entry by entry ID
// @route  PATCH api/v1/entries/:id
// @access Private
router.route('/:id')
    .patch(checkJwt, logger, editEntry);

// @desc   Delete a journal entry by entry ID
// @route  DELETE api/v1/entries/id
// @access Private
router.route('/:id')
    .delete(checkJwt, logger, deleteEntry);

// @desc   Get all journal entries
// @route  GET api/v1/entries
// @access Private
router.route('/')
    .get(checkJwt, logger, validateGetAllEntries, getAllEntries);

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/id
// @access Private
router.route('/:id')
    .get(checkJwt, logger, getEntry);

// @desc   Get the most recent entry for the specified user
// @route  GET api/v1/entries/fetch/newest
// @access Private
router.route('/fetch/newest')
    .get(checkJwt, logger, getMostRecentEntry);

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/closestmatch/:id
// @access Private
router.route('/closestmatch/:id')
    .get(checkJwt, logger, getClosestEntry);

// @desc   Get stats on journalling for specified user between a start dateTime and end dateTime
// @route  GET api/v1/entries/fetch/stats
// @access Private
router.route('/fetch/stats')
    .get(checkJwt, logger, validateGetStats, getStats);

module.exports = router;
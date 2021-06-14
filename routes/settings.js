// This is the settings routes file

// Imports
const express = require('express');

// Import checkJwt middleware (Auth0)
const { checkJwt } = require('../middleware/checkJwt');

// Import validator middleware
const {
    validateAddTags,
    validateEditTag,
    validateDeleteTags
} = require('../middleware/validators');

// Import controller methods
const {
    addTags,
    editTag,
    deleteTags,
    getAllTags
} = require('../controllers/settings');

// Set router
const router = express.Router();

/**
 * @desc                        Attempt to add tags to the user's settings.
 * @route                       POST api/v1/settings/tags
 * @access                      Private.
 */
router.route('/tags')
    .post(checkJwt, validateAddTags, addTags);

/**
 * @desc                        Attempt to edit tag for user.
 * @route                       PATCH api/v1/settings/tags
 * @access                      Private.
 */
router.route('/tags')
    .patch(checkJwt, validateEditTag, editTag);

/**
 * @desc                        Attempt to delete specified tags for user.
 * @route                       DELETE api/v1/settings/tags
 * @access                      Private.
 */
router.route('/tags')
    .delete(checkJwt, validateDeleteTags, deleteTags);

/**
 * @desc                        Attempt to get all tags for specified user.
 * @route                       GET api/v1/settings/tags
 * @access                      Private.
 */
router.route('/tags')
    .get(checkJwt, getAllTags);

module.exports = router;
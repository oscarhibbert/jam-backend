// This is the settings routes file

// Imports
const express = require('express');

// Import checkJwt middleware (Auth0)
const { checkJwt } = require('../middleware/checkJwt');

// Import validator middleware
const {
    validateEditSettingsSetupStatus,
    validateAddTags,
    validateEditTag,
    validateDeleteTags,
    validateAddActivities
} = require('../middleware/validators');

// Import controller methods
const {
    getSettings,
    checkSettingsSetupStatus,
    editSettingsSetupStatus,
    addTags,
    editTag,
    deleteTags,
    getAllTags,
    checkTagInUse,
    addActivities
} = require('../controllers/settings');

// Set router
const router = express.Router();

/**
 * @desc                        Attempt to get settings object for specified user.
 * @route                       GET api/v1/settings
 * @access                      Private.
 */
router.route('/')
    .get(checkJwt, getSettings);

/**
 * @desc                        Attempt to get status of settings setup for specified user.
 * @route                       GET api/v1/settings/status
 * @access                      Private.
 */
router.route('/status')
    .get(checkJwt, checkSettingsSetupStatus);

/**
 * @desc                        Attempt to change the settings setup status for the specified user.
 * @route                       PUT api/v1/settings/status
 * @access                      Private.
 */
router.route('/status')
    .put(checkJwt, validateEditSettingsSetupStatus, editSettingsSetupStatus);

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

/**
 * @desc                        Attempt to check whether the specified tag is in use.
 * @route                       GET api/v1/settings/tags/inuse/:id
 * @access                      Private.
 */
router.route('/tags/inuse/:id')
    .get(checkJwt, checkTagInUse);

/**
 * @desc                        Attempt to add activities to the user's settings.
 * @route                       POST api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .post(checkJwt, validateAddActivities, addActivities);

module.exports = router;
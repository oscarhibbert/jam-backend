// This is the settings routes file

// Imports
const express = require('express');

// Import checkJwt middleware (Auth0)
const { checkJwt } = require('../middleware/checkJwt');

// Import validator middleware
const {
    validateEditSettingsSetupStatus,
    validateAddCategories,
    validateEditCategory,
    validateDeleteCategories,
    validateAddActivities,
    validateEditActivity,
    validateDeleteActivities
} = require('../middleware/validators');

// Import controller methods
const {
    getSettings,
    checkSettingsSetupStatus,
    editSettingsSetupStatus,
    addCategories,
    editCategory,
    deleteCategories,
    getAllCategories,
    checkCategoryInUse,
    addActivities,
    editActivity,
    deleteActivities,
    getAllActivities,
    checkActivityInUse
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
 * @desc                        Attempt to add categories for the specified user.
 * @route                       POST api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .post(checkJwt, validateAddCategories, addCategories);

/**
 * @desc                        Attempt to edit caetgory for the specified user.
 * @route                       PATCH api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .patch(checkJwt, validateEditCategory, editCategory);

/**
 * @desc                        Attempt to delete specified categories for specified user.
 * @route                       DELETE api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .delete(checkJwt, validateDeleteCategories, deleteCategories);

/**
 * @desc                        Attempt to get all categories for specified user.
 * @route                       GET api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .get(checkJwt, getAllCategories);

/**
 * @desc                        Attempt to check whether the specified category is in use.
 * @route                       GET api/v1/settings/categories/inuse/:id
 * @access                      Private.
 */
router.route('/categories/inuse/:id')
    .get(checkJwt, checkCategoryInUse);

/**
 * @desc                        Attempt to add activities to the user's settings.
 * @route                       POST api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .post(checkJwt, validateAddActivities, addActivities);

/**
 * @desc                        Attempt to edit activity for user.
 * @route                       PATCH api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .patch(checkJwt, validateEditActivity, editActivity);

/**
 * @desc                        Attempt to delete specified activities for user.
 * @route                       DELETE api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .delete(checkJwt, validateDeleteActivities, deleteActivities);

/**
 * @desc                        Attempt to get all activities for specified user.
 * @route                       GET api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .get(checkJwt, getAllActivities);

/**
 * @desc                        Attempt to check whether the specified activity is in use.
 * @route                       GET api/v1/settings/activities/inuse/:id
 * @access                      Private.
 */
router.route('/activities/inuse/:id')
    .get(checkJwt, checkActivityInUse);

module.exports = router;
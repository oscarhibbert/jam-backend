// This is the settings routes file

// Imports
const express = require('express');

// Import checkJwt middleware (Auth0)
const { checkJwt } = require('../middleware/checkJwt');

// Import logger middleware
const { logger } = require('../middleware/logger');

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
    createDefaultCategories,
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
    .get(checkJwt, logger, getSettings);

/**
 * @desc                        Attempt to get status of settings setup for specified user.
 * @route                       GET api/v1/settings/status
 * @access                      Private.
 */
router.route('/status')
    .get(checkJwt, logger, checkSettingsSetupStatus);

/**
 * @desc                        Attempt to change the settings setup status for the specified user.
 * @route                       PUT api/v1/settings/status
 * @access                      Private.
 */
router.route('/status')
    .put(checkJwt, logger, validateEditSettingsSetupStatus, editSettingsSetupStatus);

/**
 * @desc                        Attempt to create default categories for the specified user.
 * @route                       POST api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories/default')
    .post(checkJwt, logger, createDefaultCategories);

/**
 * @desc                        Attempt to add categories for the specified user.
 * @route                       POST api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .post(checkJwt, logger, validateAddCategories, addCategories);

/**
 * @desc                        Attempt to edit caetgory for the specified user.
 * @route                       PATCH api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .patch(checkJwt, logger, validateEditCategory, editCategory);

/**
 * @desc                        Attempt to delete specified categories for specified user.
 * @route                       DELETE api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .delete(checkJwt, logger, validateDeleteCategories, deleteCategories);

/**
 * @desc                        Attempt to get all categories for specified user.
 * @route                       GET api/v1/settings/categories
 * @access                      Private.
 */
router.route('/categories')
    .get(checkJwt, logger, getAllCategories);

/**
 * @desc                        Attempt to check whether the specified category is in use.
 * @route                       GET api/v1/settings/categories/inuse/:id
 * @access                      Private.
 */
router.route('/categories/inuse/:id')
    .get(checkJwt, logger, checkCategoryInUse);

/**
 * @desc                        Attempt to add activities to the user's settings.
 * @route                       POST api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .post(checkJwt, logger, validateAddActivities, addActivities);

/**
 * @desc                        Attempt to edit activity for user.
 * @route                       PATCH api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .patch(checkJwt, logger, validateEditActivity, editActivity);

/**
 * @desc                        Attempt to delete specified activities for user.
 * @route                       DELETE api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .delete(checkJwt, logger, validateDeleteActivities, deleteActivities);

/**
 * @desc                        Attempt to get all activities for specified user.
 * @route                       GET api/v1/settings/activities
 * @access                      Private.
 */
router.route('/activities')
    .get(checkJwt, logger, getAllActivities);

/**
 * @desc                        Attempt to check whether the specified activity is in use.
 * @route                       GET api/v1/settings/activities/inuse/:id
 * @access                      Private.
 */
router.route('/activities/inuse/:id')
    .get(checkJwt, logger, checkActivityInUse);

module.exports = router;
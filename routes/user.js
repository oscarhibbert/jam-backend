// This is the users routes file

// Imports
const express = require('express');

// Import middleware
const { checkJwt } = require('../middleware/checkJwt');

// Import logger middleware
const { logger } = require('../middleware/logger');

// Import validators
const {

} = require('../middleware/validators');

// Import controller methods
const {
    getUserProfile
} = require('../controllers/user');

const router = express.Router();

// @desc   Get the user profile
// @route  GET api/v1/user/profile
// @access Private
router.route('/profile')
    .get(checkJwt, logger, getUserProfile);


module.exports = router;
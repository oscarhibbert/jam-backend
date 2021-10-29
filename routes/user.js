// This is the users routes file

// Imports
const express = require('express');

// Import middleware
const { checkJwt } = require('../middleware/checkJwt');

// Import logger middleware
const { logger } = require('../middleware/logger');

// Import JWTAuthz
const jwtAuthz = require('express-jwt-authz');

// Import validators
const {
    validateCreateUser,
    validateDeleteUserByEmail
} = require('../middleware/validators');

// Import controller methods
const {
    createUser,
    getUserProfile,
    deleteUser,
    deleteUserByEmail
} = require('../controllers/user');

const router = express.Router();

// @desc   Create a new user
// @route  POST api/v1/user
// @access Private
// @scope create:users
router.route('/')
    .post(
        checkJwt,
        logger,
        jwtAuthz(
            ['create:users'],
            { customScopeKey: 'permissions' }
        ),
        validateCreateUser,
        createUser);

// @desc   Get the user profile
// @route  GET api/v1/user/profile
// @access Private
router.route('/profile')
    .get(checkJwt, logger, getUserProfile);

// @desc   Get the user profile
// @route  DELETE api/v1/user
// @access Private
router.route('/')
    .delete(checkJwt, logger, deleteUser);

// @desc   Delete a user by email address
// @route  POST api/v1/user/email
// @access Private
// @scope delete:users
router.route('/email')
    .delete(
        checkJwt,
        logger,
        jwtAuthz(
            ['delete:users'],
            { customScopeKey: 'permissions' }
        ),
        validateDeleteUserByEmail,
        deleteUserByEmail);

module.exports = router;
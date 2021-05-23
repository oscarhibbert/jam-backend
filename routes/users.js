// This is the users routes file

// Imports
const express = require('express');

// Import middleware
const {
    validateUser
} = require('../middleware/validators');
const { authorise } = require('../middleware/authorise');
const { checkJwt } = require('../middleware/checkJwt');


// Import controller methods
const { registerUser } = require('../controllers/users');
const { createUserProfile } = require('../controllers/users');

const router = express.Router();

// POST Request
// Register a new user
router.route('/')
    .post(validateUser, registerUser);

// POST Request
// Create user profile via profileID from Auth0
router.route('/profile')
    .post(checkJwt, createUserProfile);

module.exports = router;

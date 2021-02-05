// This is the users routes file

// Imports
const express = require('express');

// Import middleware
const {
    validateUser
} = require('../middleware/validators');

// Import controller methods
const {
    registerUser
} = require('../controllers/users');

const router = express.Router();

// POST Request
// Register a new user
router.route('/')
    .post(validateUser, registerUser);

module.exports = router;    

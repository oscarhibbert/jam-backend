// This is the auth routes file

// Imports
const express = require('express');

// Import middleware
const { validateLogin } = require('../middleware/validators');

// Import controller methods
const { loginUser } = require('../controllers/auth');

const router = express.Router();

// POST Request
// Login user (authenticate user & get token)
router.route('/').post(validateLogin, loginUser);

module.exports = router;

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

} = require('../controllers/users');

const router = express.Router();


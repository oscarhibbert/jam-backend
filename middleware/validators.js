// This file contains all middleware validators

// Imports
const { check, validationResult } = require('express-validator');

// Journal entry validator
exports.validateEntry = [
    // Checking configuration
    check('text', 'Text is required!').not().isEmpty(),
    check('mood', 'Please select your mood!').not().isEmpty(),
    
    // Errors middleware function 
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ success: false, errors: errors.array() });
        next();
    }
];

// Register user validator
exports.validateUser = [
    // Checking configuration
    check('firstName', 'First name is required!').not().isEmpty(),
    check('lastName', 'Last name is required!').not().isEmpty(),
    check('email', 'Please specify a valid email!').not().isEmpty(),
    check('password',
        'Please enter a password with 8 or more characters!')
        .isLength({ min: 8 }),
    
    // Errors middleware function 
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ success: false, errors: errors.array() });
        next();
    }
];
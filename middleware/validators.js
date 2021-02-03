// This file contains all middleware validators

// Imports
const { check, validationResult } = require('express-validator');

// New journal entry validator
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
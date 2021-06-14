// This file contains all middleware validators

// Imports
const { check, validationResult } = require('express-validator');

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

// Login user validator
exports.validateLogin = [
    // Checking configuration
    check('email', 'Please include a valid email!').isEmail(),
    check('password', 'Password is required!').exists(),

    // Errors middleware function 
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ success: false, errors: errors.array() });
        next();
    }
];

// Journal entry validator
exports.validateEntry = [
  // Checking configuration
  check('mood', 'Please specifcy a mood type!').not().isEmpty(),
  check('mood', 'Invalid mood type!').isIn(
    ['High Energy, Unpleasant', 'Low Energy, Unpleasant',
    'High Energy, Pleasant', 'Low Energy, Pleasant']),
  check('emotion', 'Please select your emotion!').not().isEmpty(),
  check('text', 'Text is required!').not().isEmpty(),

  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  },
];

// Update journal entry validator
exports.validateUpdateEntry = [
  // Checking configuration
  check('text', 'Text is required!')
    .optional()
    .not()
    .isEmpty(),
  check('mood', 'Please select your mood!')
    .optional()
    .not()
    .isEmpty(),

  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  },
];

/**
 * @desc     Add tags validator
 */
exports.validateAddTags = [
  // Checking configuration
  check('tags', 'Key tags is required. Value must be array of new tags!')
    .not()
    .isEmpty(),
  
  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  }
];

/**
 * @desc     Edit tag validator
 */
exports.validateEditTag = [
  // Checking configuration
  check('tagId', 'TagId key with a string value is required!')
    .not()
    .isEmpty(),
  check('tagName', 'tagName key is required!')
    .optional()
    .not()
    .isEmpty(),
  check('tagType', 'tagType is required!')
    .optional()
    .not()
    .isEmpty(),
  
  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  }
];

/**
 * @desc     Edit tags validator
 */
exports.validateDeleteTags = [
  // Checking configuration
  check('tags',
    "'tags' key and value is missing!")
    .not()
    .isEmpty(),
  check('tags', "'tags' value is not an array!")
    .isArray(),

  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  }
];
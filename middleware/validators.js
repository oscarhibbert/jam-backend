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

/**
 * @desc     Edit settings setup status validator
 */
exports.validateEditSettingsSetupStatus = [
  // Checking configuration
  check('status',
    "Key 'status' and value is missing!")
    .not()
    .isEmpty(),
  check('status', "Key 'status' value is not a boolean!")
    .isBoolean(),

  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  }
];

/**
 * @desc     Add categories validator
 */
exports.validateAddCategories = [
  // Checking configuration
  check('categories', "'categories' value is not an array. Must be an array!")
    .isArray(),
  check('categories', "Key 'categories' is required. Value must be array of new categories as objects!")
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
 * @desc     Edit category validator
 */
exports.validateEditCategory = [
  // Checking configuration
  check('categoryId', 'categoryId key with a string value is required!')
    .not()
    .isEmpty(),
  check('categoryName', 'categoryName key is required!')
    .optional()
    .not()
    .isEmpty(),
  check('categoryType', 'categoryType is required!')
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
 * @desc     Delete categories validator
 */
exports.validateDeleteCategories = [
  // Checking configuration
  check('categories',
    "'categories' key and value is missing!")
    .not()
    .isEmpty(),
  check('categories', "'categories' value is not an array!")
    .isArray(),

  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  }
];

/**
 * @desc     Add activities validator
 */
exports.validateAddActivities = [
  // Checking configuration
  check('activities', "'activities' value is not an array. Must be an array!")
    .isArray(),
  check('activities', 'Key activities is required. Value must be array of new activities as objects!')
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
 * @desc     Edit activity validator
 */
exports.validateEditActivity = [
  // Checking configuration
  check('activityId', 'activityId key with a string value is required!')
    .not()
    .isEmpty(),
  check('activityName', 'activityName key is required!')
    .optional()
    .not()
    .isEmpty(),
  check('activityType', 'activityType is required!')
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
 * @desc     Delete activities validator
 */
exports.validateDeleteActivities = [
  // Checking configuration
  check('activities',
    "'activities' key and value is missing!")
    .not()
    .isEmpty(),
  check('activities', "'activities' value is not an array of activities to be deleted!")
    .isArray(),

  // Errors middleware function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });
    next();
  }
];
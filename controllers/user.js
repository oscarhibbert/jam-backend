// This controller contains all user controller methods

// Import logger
const logger = require('../loaders/logger');

// Service imports
const UserService = require('../services/UserService');
const UserServiceInstance = new UserService();

// @desc   Create a new user
// @route  POST api/v1/user
// @access Private
// @scope create:users
exports.createUser = async (req, res) => {
  try {
    // Extract params from the request
    const { email, firstName, lastName } = req.body;

    const newUser = await UserServiceInstance.createUser(email, firstName, lastName);

    // Set response to empty object
    let response = {};

    // Add response success property: true
    response.success = true;

    // Add response msg
    response.msg = newUser.msg;

    // Add response data
    response.data = newUser.data;

    // Respond
    res.json(response);

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  };
};

// Controller methods
// @desc   Get the user profile
// @route  GET api/v1/user/profile
// @access Private
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.sub;

    let response = await UserServiceInstance.getUserProfile(userId);

    // Add response success property: true
    response.success = true;

    // Add response userId propery
    response.userId = userId;

    // Respond
    res.json(response);

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error', userId: req.user.sub });
  };
};

// @desc   Delete the user profile by specified user ID
// @route  DELETE api/v1/user
// @access Private
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.sub;

    await UserServiceInstance.deleteUser(userId);

    // Set response to empty object
    let response = {};

    // Add response success property: true
    response.success = true;

    // Add response userId propery
    response.userId = userId;

    // Respond
    res.json(response);

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error', userId: req.user.sub });
  };
};

// @desc   Delete the user profile by specified user ID
// @route  DELETE api/v1/user/email
// @access Private
exports.deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    await UserServiceInstance.deleteUserByEmail(email);

    // Set response to empty object
    let response = {};

    // Add response success property: true
    response.success = true;

    // Respond
    res.json(response);

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error', userId: req.user.sub });
  };
};
// This controller contains all user controller methods

// Import logger
const logger = require('../loaders/logger');

// Service imports
const UserService = require('../services/UserService');
const UserServiceInstance = new UserService();

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

// @desc   Get the user profile
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
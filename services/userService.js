// Imports
const bcrypt = require('bcryptjs');

// Events
const EventEmitter = require('events').EventEmitter;
const userServiceEvents = new EventEmitter;

// Model imports
const User = require('../models/User');

/**
 * @description Create an instance of the UserService class.
 */
module.exports = class UserService {
  /**
   * @desc                         Attempt to register user with user info.
   * @param  {Object}    userInfo  Object containing user info.
   * @return                       Object with success boolean and message.
   */
  async RegisterUser(userInfo) {
    try {
      // Create response obj
      let response;
      let success;
      let msg;

      // Destructure obj body
      const { firstName, lastName, email, password } = userInfo;

      // Check if the user already exists
      let userExists = await this.CheckUser(email);

      // If the user doesn't exist
      if (userExists.success === false) {
        // Create a new instance of the user saved to the newUser variable
        let newUser = new User({
          firstName,
          lastName,
          email,
          password,
        });

        // Generate password salt
        const salt = await bcrypt.genSalt(10);

        // Encrypt the password using bcryptjs
        newUser.password = await bcrypt.hash(password, salt);

        // Save the new user to the database
        await newUser.save();

        // Set success
        (success = true), (msg = 'New user created successfully');

        // Emit userCreated event
        userServiceEvents.emit('userCreated');
      }

      // Else set response new user failed
      else {
        (success = false);
        (msg = 'Create new user failed - user already exists');
      }

      // Build response object
      response = {
        success: success,
        msg: msg,
      };

      // Return response obj
      return response;
    } catch (err) {
      console.error(err.message);
      return {
        success: false,
        msg: 'Server Error',
      };
    }
  }

  /**
   * @desc                    Check whether user exists by email address.
   * @param  {string} email   String containing user email address.
   * @return {Object}         Object with success boolean and message.
   */
  async CheckUser(email) {
    // Check if user exists and save to user
    let user = await User.findOne({ email });

    // Create result
    let result;
    let msg;

    // Result logic
    if (!user) {
      result = false;
      msg = 'New user created successfully';
    } else {
      result = true;
      msg = 'User exists';
    }

    // Set response object
    let response = {
      success: result,
      msg: msg,
    };

    // Return response object
    return response;
  }
};
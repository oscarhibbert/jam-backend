// Imports
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
     * @description Attempt to register user with user info.
     * @param userInfo {object} User info object.
     */
    async RegisterUser(userInfo) {
        try {
            // Create response obj
            let response;

            // Destructure obj body
            const { firstName, lastName, email, password } = userInfo;

            // Check if the user exists
            let userExists = await this.CheckUser(email);

            // If the user doesn't exist
            if (userExists.success === false) {
                // Create a new instance of the user saved to the newUser variable
                let newUser = new User({
                    firstName,
                    lastName,
                    email,
                    password
                });

                // Generate password salt
                const salt = await bcrypt.genSalt(10);

                // Encrypt the password using bcryptjs
                newUser.password = await bcrypt.hash(password, salt);

                // Save the new user to the database
                await newUser.save();

                // Set response object
                response = {
                    success: true,
                    msg: 'New user created successfully'
                };

            }
            
            // Else set response object new user failed
            else {
                response = {
                    success: false,
                    msg: 'Create new user failed - user already exists'
                };
            };

            // Emit userCreated event
            userServiceEvents.emit('userCreated');

            // Return response obj
            return response;

        } catch (err) {
            console.error(err.message);
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };

    /**
     * @description Check user by user email address. Returns boolean.
     * @param email {object} User email object.
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
        msg: msg
        };

        // Return response object
        return response;
    };
};
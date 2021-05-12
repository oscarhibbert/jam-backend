// Imports
const config = require('config');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model imports
const User = require('../models/User');

// Events
const EventEmitter = require('events').EventEmitter;
const authServiceEvents = new EventEmitter;

/**
 * @description Create an instance of the AuthService class.
 */
module.exports = class AuthService {
    /**
     * @desc                         Login a user method.
     * @param {string} userEmail     String containing user email.
     * @param {string} userPassword  String containing user password.
     * @return                       Object containing response including jwtToken if successful.
     */
    async loginUser(userEmail, userPassword) {
        try {
            let response;
            let success;
            let msg;
            let jwtToken;
        
            // Look for the user by email address
            let user = await User.findOne({ email: userEmail });

            // If the user isn't found set msg - invalid credentials
            if (!user) {
              success = false;
              msg = 'Invalid Credentials';
            }
            
            // Else (if the user exists), continue
            else {
                // Next compare plain text & encrypted password
                // user.password comes from User.findOne
                const isMatch = await bcryptjs.compare(
                    userPassword,
                    user.password
                );

                // If the passwords do not match
                if (!isMatch) {
                    success = false;
                    msg = 'Invalid Credentials';
                }

                // Else, continue onward (if the passwords do match)
                else {
                    /* user.findOne() returned a promise allowing us to access the
                        record id user user.id. Mongoose abstracts ._id to .id */

                    // Construct JWT payload
                    const payload = {
                    user: {
                        id: user.id,
                    },
                    };

                    // Load getToken function
                    function getToken() {
                    return new Promise((resolve, reject) => {
                        jwt.sign(
                        payload,
                        config.get('jwtSecret'),
                        { expiresIn: config.get('jwtDuration') },
                        (err, token) => {
                            if (err) reject(err);
                            else resolve(token);
                        }
                        );
                    });
                    }

                    // Set jwtToken
                    jwtToken = await getToken();

                    // Set rest of response
                    success = true;
                    msg = 'JWT Token';

                    // Emit userLoggedIn event
                    authServiceEvents.emit('userLoggedIn');
                }
            };

            

            // Build response
            response = {
                success: success,
                msg: msg,
                jwtToken: jwtToken
            };

            // Return response object
            return response;

        } catch (err) {
            console.error(err.message);
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };
};
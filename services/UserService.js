// Import logger
const logger = require('../loaders/logger');

// Model imports
const User = require('../models/User');

// Auth0 Service Import
const Auth0Service = require('../services/Auth0Service');
const Auth0ServiceInstance = new Auth0Service();

/**
 * @description Create an instance of the UserService class.
 */
module.exports = class JournalService {
    /**
     * @desc                                       Get a user profile method.
     * @param {string}    userId                   String containing user ID.
     * @return                                     Object containing message object and data object.
     */
    async getUserProfile(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get user profile failed - userId parameter empty. Must be supplied');
            };
            
            // Attempt to get user profile via the Auth0 Service
            let userProfile = await Auth0ServiceInstance.getUserProfile(userId);

            // Destructure desired properties from data
            const { email, name } = userProfile.data;

            // Overwrite userProfile.data to an empty object
            userProfile.data = {};

            // Update userProfile.data to only include the desired properties
            userProfile.data = { email, name };

            // Return the userProfile
            return userProfile;

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };
};
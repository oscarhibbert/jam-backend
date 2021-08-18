// Import logger
const logger = require('../loaders/logger');

// Model imports
const User = require('../models/User');

// Auth0 Service Import
const Auth0Service = require('../services/Auth0Service');
const Auth0ServiceInstance = new Auth0Service();

// Settings Service Import
const SettingsService = require('../services/SettingsService');
const SettingsServiceInstance = new SettingsService();

// Journal Service Import
const JournalService = require('../services/JournalService');
const JournalServiceInstance = new JournalService();

// Import the User Mongoose model
const User = require('../models/User');

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

    /**
     * @desc                                       Delete a user method.
     * @param {string}    userId                   String containing user ID.
     * @return                                     Object containing message object and data object.
     */
    async deleteUser(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Delete user failed - userId parameter empty. Must be supplied');
            };
            
            // Attempt to delete Auth0 user via the Auth0 Service
            await Auth0ServiceInstance.deleteUser(userId);

            // Delete all journal entries for the user via the Journal Service
            await JournalServiceInstance.deleteAllEntries(userId);

            // Delete all categories for the user via the Settings Service
            await SettingsServiceInstance.deleteAllCategories(userId);

            // Delete all activities for the user via the Settings Service
            await SettingsServiceInstance.deleteAllActivities(userId);

            // Attempt to delete the settings object for the user
            await SettingsServiceInstance.deleteSettings(userId);

            // Attempt to delete the user from the MongoDB user collection
            await User.deleteOne(
                {
                    user: userId
                }
            );

            // Log success
            logger.info(`Aura user deleted successfully ${userId}`);
            
            // Return object with success boolean
            return { success: true };

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };
};
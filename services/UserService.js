// Import logger
const logger = require('../loaders/logger');

// Model imports
const User = require('../models/User');

// Auth0 Service Import
const Auth0Service = require('../services/Auth0Service');
const Auth0ServiceInstance = new Auth0Service();

// Mixpanel Service Import
const MixpanelService = require('../services/MixpanelService');
const MixpanelServiceInstance = new MixpanelService();

// Settings Service Import
const SettingsService = require('../services/SettingsService');
const SettingsServiceInstance = new SettingsService();

// Journal Service Import
const JournalService = require('../services/JournalService');
const JournalServiceInstance = new JournalService();

/**
 * @description Create an instance of the UserService class.
 */
module.exports = class UserService {
    /**
     * @desc                                                Create a new Aura Journal user
     * @param {string}                      email           The email address of the new user
     * @param {string}                      firstName       The first name of the new user
     * @param {string}                      lastName        The surname of the new user
     * @return                                              Object with msg and data
     */
    async createUser(email, firstName, lastName) {
        try {
            // Check email parameter exists
            if (!email) {
                throw new Error('Create new user failed - email parameter empty. Must be supplied');
            };

            // Check firstName parameter exists
            if (!firstName) {
                throw new Error('Create new user failed - firstName parameter empty. Must be supplied');
            };

            // Check lastName parameter exists
            if (!lastName) {
                throw new Error('Create new user failed - lastName parameter empty. Must be supplied');
            };

            // Create the new user in Auth0
            const newUser = await Auth0ServiceInstance.createUser(email, firstName, lastName);

            // Create a new user in Mixpanel
            MixpanelServiceInstance.createOrUpdateUser(
                newUser.data.user_id,
                newUser.data.given_name,
                newUser.data.family_name,
                newUser.data.email
            );

            // Log success
            logger.info(`New Aura Journal user created successfully`);

            return { msg: 'New Aura Journal user created successfully', data: newUser.data };

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };

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
            const { email, name, given_name, family_name } = userProfile.data;

            // Overwrite userProfile.data to an empty object
            userProfile.data = {};

            // Update userProfile.data to only include the desired properties
            userProfile.data = { email, name, given_name, family_name };

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

            // Check the user object exists for this user
            const user = await User.findOne(
                { auth0UserId: userId }
            ).lean();

            // If settings object for user not found throw error
            if (!user) {
                throw new Error(`Delete user failed - user object for user not found - ${userId}`);
            };

            // Attempt to delete all journal entries for the user via the Journal Service
            await JournalServiceInstance.deleteAllEntries(userId);

            // Attempt to delete all categories for the user via the Settings Service
            await SettingsServiceInstance.deleteAllCategories(userId);

            // Attempt to delete all activities for the user via the Settings Service
            await SettingsServiceInstance.deleteAllActivities(userId);

            // Attempt to delete the settings object for the user
            await SettingsServiceInstance.deleteSettings(userId);

            // Attempt to delete user from Mixpanel
            MixpanelServiceInstance.deleteUser(userId);

            // Attempt to delete the user from the MongoDB user collection
            await User.deleteOne(
                {
                    auth0UserId: userId
                }
            );

            // Attempt to delete Auth0 user via the Auth0 Service
            await Auth0ServiceInstance.deleteUser(userId);

            // Log success
            logger.info(`Aura user deleted successfully ${userId}`);
            
            // Return
            return;

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };

    /**
     * @desc                                       Delete a user by email address method
     * @param {string}    email                    String containing user email address
     * @return                                     Object containing message object and data object
     */
    async deleteUserByEmail(email) {
        try {
            // Check userId parameter exists
            if (!email) {
                throw new Error('Delete user by email failed - email parameter empty. Must be supplied');
            };

            // Get the user by email address
            const { data } = await Auth0ServiceInstance.getUserByEmail(email);

            if (!data) throw new Error('Delete user by email failed - user does not exists')

            // Delete the user
            await this.deleteUser(data.user_id);
            
            // Return
            return;

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };
};
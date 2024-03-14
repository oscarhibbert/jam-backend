// Import logger
const logger = require('../loaders/logger');

// Model imports
const User = require('../models/User');

// Auth0 Service Import
const Auth0Service = require('../services/Auth0Service');

// Mixpanel Service Import
const MixpanelService = require('../services/MixpanelService');

// Settings Service Import
const SettingsService = require('../services/SettingsService');

// Journal Service Import
const JournalService = require('../services/JournalService');

/**
 * @description Create an instance of the UserService class.
 */
module.exports = class UserService {
    /**
     * Represents the UserService constructor.
     * @constructor
     * @param {Object} params - An object containing parameters for the instance.
     *   @param {string} params.userId - A string containing the userId
     *   @param {string} params.firstName - A string containing the user first name
     *   @param {string} params.lastName - A string containing the user last name
     *   @param {string} params.email - A string containing the user email address
     */
    constructor(params = {}) {
        // User properties
        this._userId = params.userId;
        this._firstName = params.firstName;
        this._lastName = params.lastName;
        this._email = params.email;
    };

    /**
     * Creates a new Jam user.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new UserService({
     *   email: " ",
     *   firstName: " ",
     *   lastName: " "
     * });
     * 
     * await SettingsService.createUser();
     */
    async createUser() {
        try {
            // Check email parameter exists
            if (!this._email) {
                throw new Error('Create new user failed - email parameter empty. Must be supplied');
            };

            // Check firstName parameter exists
            if (!this._firstName) {
                throw new Error('Create new user failed - firstName parameter empty. Must be supplied');
            };

            // Check lastName parameter exists
            if (!this._lastName) {
                throw new Error('Create new user failed - lastName parameter empty. Must be supplied');
            };


            // Create Auth0 Service Instance
            const Auth0Instance = new Auth0Service(
                {
                    email: this._email,
                    firstName: this._firstName,
                    lastName: this._lastName
                }
            );

            // Create the new user in Auth0
            const createAuth0User = await Auth0Instance.createUser();
            
            // Create Mixpanel Service Instance
            const MixpanelInstance = new MixpanelService(
                {
                    userId: createAuth0User.data.user_id,
                    firstName: createAuth0User.data.given_name,
                    lastName: createAuth0User.data.family_name,
                    email: createAuth0User.data.email,
                    eventName: "New User",
                    dateCreated: createAuth0User.data.created_at,
                    properties: {
                        $time: createAuth0User.data.created_at
                    }
                }

            );

            // Create a new user in Mixpanel
            await MixpanelInstance.createOrUpdateUser();

            // Create Mixpanel Event New User
            await MixpanelInstance.createEvent();

            // Log success
            logger.info(`New Aura Journal user created successfully`);

            return { msg: 'New Aura Journal user created successfully', data: createAuth0User.data };

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };

    /**
     * Gets a Jam user.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new UserService({
     *   userId: " "
     * });
     * 
     * await SettingsService.getUserProfile();
     */
    async getUserProfile() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get user profile failed - userId parameter empty. Must be supplied');
            };

            // Create Auth0 Instance
            const Auth0Instance = new Auth0Service(
                { userId: this._userId }
            );
            
            // Attempt to get user profile via the Auth0 Service
            let userProfile = await Auth0Instance.getUserProfile();

            // Destructure desired properties from data
            const { email, name, given_name, family_name } = userProfile.data;

            // Overwrite userProfile.data to an empty object
            userProfile.data = { };

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
     * Deletes a Jam user.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new UserService({
     *   userId: " "
     * });
     * 
     * await SettingsService.deleteUser();
     */
    async deleteUser() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete user failed - userId parameter empty. Must be supplied');
            };

            // Check the user object exists for this user
            const user = await User.findOne(
                { auth0UserId: this._userId }
            ).lean();

            // If settings object for user not found throw error
            if (!user) {
                throw new Error(`Delete user failed - user object for user not found - ${this._userId}`);
            };

            // Create new journal service instance
            const JournalServiceInstance = new JournalService(
                { userId: this._userId }
            );

            // Create new journal service instance
            const SettingsServiceInstance = new SettingsService(
                { userId: this._userId }
            );

            // Create new journal service instance
            const MixpanelServiceInstance = new MixpanelService(
                { userId: this._userId }
            );

            // Attempt to delete all journal entries for the user via the Journal Service
            await JournalServiceInstance.deleteAllEntries();

            // Attempt to delete all categories for the user via the Settings Service
            await SettingsServiceInstance.deleteAllCategories();

            // Attempt to delete all activities for the user via the Settings Service
            await SettingsServiceInstance.deleteAllActivities();

            // Attempt to delete the settings object for the user
            await SettingsServiceInstance.deleteSettings();

            // Attempt to delete user from Mixpanel
            await MixpanelServiceInstance.deleteUser();

            // Attempt to delete the user from the MongoDB user collection
            await User.deleteOne(
                {
                    auth0UserId: this._userId
                }
            );

            // Attempt to delete Auth0 user via the Auth0 Service
            await Auth0ServiceInstance.deleteUser(this._userId);

            // Log success
            logger.info(`Aura user deleted successfully ${this._userId}`);
            
            // Return
            return;

        } catch (err) {
            // Log error
            logger.error(err);
            throw err;
        };
    };

    /**
     * Deletes a Jam user by email address.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new UserService({
     *   email: " "
     * });
     * 
     * await SettingsService.deleteUserByEmail();
     */
    async deleteUserByEmail() {
        try {
            // Check userId parameter exists
            if (!this._email) {
                throw new Error('Delete user by email failed - email parameter empty. Must be supplied');
            };

            // Create Auth0 Service Instance
            const Auth0ServiceInstance = new Auth0Service(
                { email: this._email }
            );

            // Get the user by email address
            const { data } = await Auth0ServiceInstance.getUserByEmail();

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
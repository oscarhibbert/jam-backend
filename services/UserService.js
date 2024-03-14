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
     *   email: "",
     *   firstName: "",
     *   lastName: ""
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

            // Create the new user in Auth0
            const newUser = await Auth0ServiceInstance.createUser(this._email, this._firstName, this._lastName);

            // Create a new user in Mixpanel
            MixpanelServiceInstance.createOrUpdateUser(
                newUser.data.user_id,
                newUser.data.given_name,
                newUser.data.family_name,
                newUser.data.email,
                newUser.data.created_at
            );

            // Create Mixpanel Event New User
            MixpanelServiceInstance.createEvent(
                'New User',
                newUser.data.user_id,
                {
                    $time: newUser.data.created_at
                }
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
     * Gets a Jam user.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new UserService({
     *   userId: ""
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
            
            // Attempt to get user profile via the Auth0 Service
            let userProfile = await Auth0ServiceInstance.getUserProfile(this._userId);

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
     * Deletes a Jam user.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new UserService({
     *   userId: ""
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

            // Attempt to delete all journal entries for the user via the Journal Service
            await JournalServiceInstance.deleteAllEntries(this._userId);

            // Attempt to delete all categories for the user via the Settings Service
            await SettingsServiceInstance.deleteAllCategories(this._userId);

            // Attempt to delete all activities for the user via the Settings Service
            await SettingsServiceInstance.deleteAllActivities(this._userId);

            // Attempt to delete the settings object for the user
            await SettingsServiceInstance.deleteSettings(this._userId);

            // Attempt to delete user from Mixpanel
            MixpanelServiceInstance.deleteUser(this._userId);

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
     *   email: ""
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

            // Get the user by email address
            const { data } = await Auth0ServiceInstance.getUserByEmail(this._email);

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
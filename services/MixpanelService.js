// Import Logger
const logger = require('../loaders/logger');

// Import Config
const config = require('config');

// Import Mixpanel
const Mixpanel = require('mixpanel');

/**
 * @description Create an instance of the Mixpanel Service class
 */
module.exports = class MixpanelService {
    /**
     * Represents a Mixpanel Service instance constructor.
     * @constructor
     * @param {Object} params - An object containing parameters for the instance.
     *   @param {string}  params.userId - A string containing the user ID
     *   @param {string}  params.firstName - A string containing user first name
     *   @param {string}  params.lastName - A string containing the user last name
     *   @param {string}  params.email - A string containing the user email
     *   @param {string}  params.dateCreated - A string containing the user dateCreated in ISO8601 Zulu time
     *   @param {string}  params.eventName - A string containing the event name
     *   @param {{}}      params.properties - An object containing additional event properties
     */
    constructor(params = {}) {
        // Mixpanel user properties
        this._userId = params.userId;
        this._firstName = params.firstName;
        this._lastName = params.lastName;
        this._email = params.email;
        this._dateCreated = params.dateCreated;

        // Mixpanel event properties
        this._eventName = params.eventName;
        this._properties = params.properties;

        /**The Mixpanel API token should be specified in the .env file*/
        this.mixpanelToken = config.get('mixpanelToken');
        /** The Mixpanel client instance */
        this.mixpanelClient = Mixpanel.init(this.mixpanelToken, {
            protocol: 'https'
        });
    };

    /**
     * Creates a Mixpanel event
     * using eventName, userId and any additional properties
     * as an object via the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const MixpanelService = new MixpanelService({
     *   eventName: "",
     *   userId: "",
     *   properties: ""
     * });
     * 
     * await Mixpanel.createEvent();
     */
    createEvent() {
        try {
            // Create propertiesObject
            let propertiesObj;

            /* If the properties object exists
            let propertiesObj equal properties */
            if (this._properties) {
                propertiesObj = this._properties
            };

            // Add distinct_id property to the propertiesObj
            propertiesObj.distinct_id = this._userId;

            // Create the event in Mixpanel
            this.mixpanelClient.track(
                this._eventName,
                propertiesObj
            );

            return { success: true };

        } catch (err) {
            throw err;
        };
    };

    /**
     * Create or update a user in Mixpanel using userId,
     * firstName, lastName, email and dateCreated via constructor
     * properties.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const MixpanelService = new MixpanelService({
     *   userId: "",
     *   firstName: "",
     *   lastName: "",
     *   email: "",
     *   dateCreated: ""
     * });
     * 
     * await MixpanelService.createOrUpdateUser();
     */
    createOrUpdateUser() {
        try {
            // Create properties object
            let properties = {};

            // If the properties are provided add them to properties object
            if (this._firstName) properties.$first_name = this._firstName;
            if (this._lastName) properties.$last_name = this._lastName;
            if (this._email) properties.$email = this._email;
            if (this._dateCreated) properties.dateCreated = this._dateCreated;

            // Create or update the existing user in Mixpanel
            this.mixpanelClient.people.set(
                this._userId,
                properties,
            );

            logger.info(`Mixpanel user profile created successfully ${this._userId}`);

            return { success: true };

        } catch (err) {
            throw err;
        };
    };

    /**
     * Delete a user in Mixpanel using the userId property
     * via the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const MixpanelService = new MixpanelService({
     *   userId: "",
     * });
     * 
     * await MixpanelService.deleteUser();
     */
    deleteUser() {
        try {
            // Remove the existing user from Mixpanel
            this.mixpanelClient.people.delete_user(
                this._userId
            );

            logger.info(`Mixpanel user profile deleted successfully ${this._userId}`);

            return { success: true };

        } catch (err) {
            throw err;
        };
    };
};
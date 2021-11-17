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
     * Represents a Mixpanel Service constructor
     * @constructor
     */
    constructor() {
        /**The Mixpanel API token should be specified in the .env file*/
        this.mixpanelToken = config.get('mixpanelToken');
        /** The Mixpanel client instance */
        this.mixpanelClient = Mixpanel.init(this.mixpanelToken, {
            protocol: 'https'
        });
    };

    /**
       * @desc                                      Creates a Mixpanel event
       * @param      {string}        eventName      The event name as a string
       * @param      {string}        userId         The UserId as a string
       * @param      {object}        properties     Any additional properties as an object
       * @return                                    
    */
    createEvent(eventName, userId, properties) {
        try {
            // Create propertiesObject
            let propertiesObj;

            /* If the properties object exists
            add it to propertiesObj */
            if (properties) propertiesObj = properties;

            // Create the event in Mixpanel
            this.mixpanelClient.track(
                eventName,
                {
                    distinct_id: userId,
                    propertiesObj
                }
            );

            return { success: true };

        } catch (err) {
            throw err;
        };
    };

    /**
       * @desc                                        Creates a new user in Mixpanel
       * @param      {string}        userId           The UserId as a string
       * @param      {string}        firstName        The first name of the user (optional)
       * @param      {string}        lastName         The surname of the user (optional)
       * @param      {string}        email            The email address of the user (optional)
       * @param      {Date}          dateCreated      The date the user was created in Zulu time (optional)
       * @return                                    
    */
    createOrUpdateUser(userId, firstName, lastName, email, dateCreated) {
        try {
            // Create properties object
            let properties = {};

            // If the properties are provided add them to properties object
            if (firstName) properties.$first_name = firstName;
            if (lastName) properties.$last_name = lastName;
            if (email) properties.$email = email;
            if (dateCreated) properties.dateCreated = dateCreated;

            // Create or update the existing user in Mixpanel
            this.mixpanelClient.people.set(
                userId,
                properties,
            );

            logger.info(`Mixpanel user profile created successfully ${userId}`);

            return { success: true };

        } catch (err) {
            throw err;
        };
    };

    /**
       * @desc                                        Deletes an existing user from Mixpanel
       * @param      {string}        userId           The UserId as a string
       * @return                                    
    */
    deleteUser(userId) {
        try {
            // Remove the existing user from Mixpanel
            this.mixpanelClient.people.delete_user(
                userId
            );

            logger.info(`Mixpanel user profile deleted successfully ${userId}`);

            return { success: true };

        } catch (err) {
            throw err;
        };
    };
};
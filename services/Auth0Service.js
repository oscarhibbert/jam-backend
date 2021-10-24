// Import logger
const logger = require('../loaders/logger');

// Import Config
const config = require('config');

// Import Auth0 Management Client
const ManagementClient = require('auth0').ManagementClient;

/**
 * @description Create an instance of the Auth0Service class
 */
module.exports = class Auth0Service {
    /**
     * Represents the Auth0 instance constructor
     * @constructor
     */
    constructor() {
        /** Sets the Auth0 domain */
        this.auth0Domain = config.auth0.domain;
        /** Sets the Auth0 application client ID */
        this.auth0ClientId = config.auth0.clientId;
        /** Sets the Auth0 application client secret */
        this.auth0ClientSecret = config.auth0.clientSecret;
        
        /** Instantiate the Auth0 management client */
        this.auth0 = new ManagementClient({
            domain: this.auth0Domain,
            clientId: this.auth0ClientId,
            clientSecret: this.auth0ClientSecret
        });
    };

    /**
     * @desc                                                Create a new passwordless user in Auth0
     * @param {string}                      email           The email address of the new user
     * @param {string}                      firstName       The first name of the new user
     * @param {string}                      lastName        The surname of the new user
     * @return                                              Object with msg and data
     */
    async createUser(email, firstName, lastName) {
        try {
            // Create the user using the email connection type
            // (magic link)
            const newUser = await this.auth0.createUser(
                {
                    email: email,
                    given_name: firstName,
                    family_name: lastName,
                    connection: "email",
                }
            );

            // Log success
            logger.info(`Auth0 user created successfully ${newUser.user_id}`);

            // Return message and data
            return { msg: "Success – Auth0 user created", data: newUser };
            
        } catch (err) {
            // Log error
            logger.error(err);
        };
    };

    /**
     * @desc                                                Get an Auth0 user by email address
     * @param {string}                      email           The email address of the user
     * @return                                              Object with msg and data
     */
    async getUserByEmail(email) {
        try {
            // Try fetch the user profile from Auth0
            const user = await this.auth0.getUsersByEmail(email);

            if (user.length === 0) throw new Error('No user found');
            
            // Log success
            logger.info(`Auth0 user found successfully with email address ${email}`);

            // Return message and data
            return { msg: `User profile found for email address ${email}`, data: user[0] };
            
        } catch (err) {
            // If error not found return message empty data
            if (err.message === 'No user found') {
                return {msg: `No user found with email address ${email}`};
            };

            if (err.message.includes("Object didn't pass validation for format email")) {
                return {msg: `Incorrect email syntax for email address ${email}`};
            };

            // Log error
            logger.error(err);
        };
    };

    /**
     * @desc                                       Get a user profile from Auth0
     * @param {string}    userId                   String containing user ID
     * @return                                     Object with msg and data
     */
    async getUserProfile(userId) {
        try {
            // Try fetch the user profile from Auth0
            let userProfile = await this.auth0.getUser({ id: userId });
            
            // Log success
            logger.info(`Auth0 user profile fetched successfully ${userId}`);

            // Return message and data
            return {msg: "User profile found", data: userProfile};

        } catch (err) {
            // Log error
            logger.error(err);

            // If error not found return message empty data
            if (err.name === 'Not Found') {
                return {msg: "User profile not found", data: {}};
            };
            throw err;
        };
    };

    /**
     * @desc                                                Get a user profile from Auth0
     * @param {string}                      userId          String containing user ID
     * @param {object}                      newInfo         Object containing user data to update
     * @return                                              Object with msg
     */
    async updateUser(userId, newInfo) {
        try {
            // Try fetch the user profile from Auth0
            let updateProfile = await this.auth0.updateUser(
                { id: userId },
                newInfo
            );

            // Log success
            logger.info(`Auth0 user updated successfully ${userId}`);

            // Return message and data
            return {msg: "Profile updated successfully", data: updateProfile};

        } catch (err) {
            // Log error
            logger.error(err);

            // If error name is not found return message & empty data
            if (err.name === 'Not Found') {
                return {msg: "User profile not found", data: {}};
            };

            // If error name is bad request return message & empty
            if (err.name === 'Bad Request') {
                return {msg: "Bad request - check JSON keys", data: {}};
            };

            throw err;
        };
    };

    /**
     * @desc                                                Get a user from Auth0
     * @param {string}                      userId          String containing user ID
     * @return                                              Object with msg
     */
    async deleteUser(userId) {
        try {
            // Try to get the user profile so error throws if not found
            // There is a small bug with the Auth0 
            const { msg } = await this.getUserProfile(userId);

            if (msg === 'User profile not found') {
                return {msg: "User profile not found"};
            };

            // Try to delete the user from Auth0
            const deleteUser = await this.auth0.deleteUser({id: userId});
            
            // Log success
            logger.info(`Auth0 user deleted successfully ${userId}`);

            // Return message and data
            return {msg: "Success - user deleted"};

        } catch (err) {
            // Log error
            logger.error(err);

            // If error not found return message
            if (err.name === 'Not Found') {
                return {msg: "User not found"};
            };
            throw err;
        };
    };
};
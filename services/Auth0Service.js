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
     * Represents the Auth0 instance constructor.
     * @constructor
     * @param {Object} params - An object containing parameters for the instance.
     *   @param {string}  params.email - A string containing the user email
     *   @param {string}  params.firstName - A string containing user first name
     *   @param {string}  params.lastName - A string containing the user last name
     *   @param {string}  params.mainUserId - A string containing the user main Auth0 ID
     *   @param {string}  params.secondaryUserId - A string containing the user secondary Auth0 ID
     *   @param {string}  params.provider - The identity provider of the user secondary account 
     *   @param {boolean} params.setEmailVerified - A boolean value for setting whether email is verified
     *   @param {{}}      params.newInfo - An object containing user profile properties
     */
    constructor(params = {}) {
        // User profile properties
        this._email = params.email;
        this._firstName = params.firstName;
        this._lastName = params.lastName;
        this._mainUserId = params.mainUserId;
        this._secondaryUserId = params.secondaryUserId;
        this._provider = params.provider;
        this._setEmailVerified = params.setEmailVerified;

        // User profile as an object property
        this._newInfo = params.newInfo;
        
        /** Auth0 instance properties */
        this._auth0Domain = config.auth0.domain;
        /** Sets the Auth0 application client ID */
        this._auth0ClientId = config.auth0.clientId;
        /** Sets the Auth0 application client secret */
        this._auth0ClientSecret = config.auth0.clientSecret;
        /** Sets the Auth0 passwordless email connection ID */
        this._auth0EmailConnectionId = config.auth0.emailConnectionId;
        
        /** Set the Auth0 management instance property */
        this._auth0 = new ManagementClient({
            domain: this._auth0Domain,
            clientId: this._auth0ClientId,
            clientSecret: this._auth0ClientSecret
        });
    };

    /**
     * Creates a new passwordless user in Auth0 
     * using email, firstName, lastName and
     * optionally setEmailVerified properties from the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const Auth0Service = new Auth0Service({
     *   email: "",
     *   firstName: "",
     *   lastName: "",
     *   setEmailVerified: true
     * });
     * 
     * await Auth0Service.createUser();
     */
    async createUser() {
        try {

            // Set email verified var
            let emailVerified = false;

            if (this._setEmailVerified) {
                if (this._setEmailVerified === true) emailVerified = true;
            }

            // Create the user using the email connection type
            // (magic link)
            const newUser = await this._auth0.createUser(
                {
                    email: this._email,
                    given_name: this._firstName,
                    family_name: this._lastName,
                    connection: "email",
                    email_verified: emailVerified
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
     * Get an Auth0 user by email address
     * using the email property from the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const Auth0Service = new Auth0Service({
     *   email: ""
     * });
     * 
     * await Auth0Service.getUserByEmail();
     */
    async getUserByEmail() {
        try {
            // Try fetch the user profile from Auth0
            const user = await this._auth0.getUsersByEmail(this._email);

            if (user.length === 0) throw new Error('No user found');
            
            // Log success
            logger.info(`Auth0 user found successfully with email address ${this._email}`);

            // Return message and data
            return { msg: `User profile found for email address ${this._email}`, data: user[0] };
            
        } catch (err) {
            // If error not found return message empty data
            if (err.message === 'No user found') {
                return {msg: `No user found with email address ${this._email}`};
            };

            if (err.message.includes("Object didn't pass validation for format email")) {
                return {msg: `Incorrect email syntax for email address ${this._email}`};
            };

            // Log error
            logger.error(err);
        };
    };

    /**
     * Get an Auth0 user profile
     * by userId property from the constructor.
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const Auth0Service = new Auth0Service({
     *   userId: ""
     * });
     * 
     * await Auth0Service.getUserProfile();
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
     * Update an Auth0 user profile
     * by userId and newInfo properties from the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const Auth0Service = new Auth0Service({
     *   userId: "",
     *   newInfo: {}
     * });
     * 
     * await Auth0Service.updateUser();
     */
    async updateUser() {
        try {
            // Try fetch the user profile from Auth0
            let updateProfile = await this._auth0.updateUser(
                { id: this._userId },
                this._newInfo
            );

            // Log success
            logger.info(`Auth0 user updated successfully ${this._userId}`);

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
     * Delete an Auth0 user
     * by the userId property from the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const Auth0Service = new Auth0Service({
     *   userId: ""
     * });
     * 
     * await Auth0Service.deleteUser();
     */
    async deleteUser() {
        try {
            // Try to get the user profile so error throws if not found
            // There is a small bug with the Auth0 
            const { msg } = await this.getUserProfile(this._userId);

            if (msg === 'User profile not found') {
                return {msg: "User profile not found"};
            };

            // Try to delete the user from Auth0
            await this._auth0.deleteUser({id: this._userId});
            
            // Log success
            logger.info(`Auth0 user deleted successfully ${this._userId}`);

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

    /**
     * Link a pimary Auth0 user with a secondary Auth0 user profile
     * by mainUserId, secondaryUserId and provider of the second account
     * properties of the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const Auth0Service = new Auth0Service({
     *   mainUserId: "",
     *   secondaryUserId: "",
     *   provider: ""
     * });
     * 
     * await Auth0Service.linkUsers();
     */
    async linkUsers() {
        try {
            // Try to link the
            await this._auth0.linkUsers(
                // Main account
                this._mainUserId,
                // User to link to the main account
                {
                    user_id: this._secondaryUserId,
                    connection_id: this._auth0EmailConnectionId,
                    provider: this._provider
                }
            );

            return { msg: `Auth0 user ${this._mainUserId} linked successfully to ${this._secondaryUserId}` };

        } catch (err) {
            // Log error
            logger.error(err);

            throw err;
        };
    };
};
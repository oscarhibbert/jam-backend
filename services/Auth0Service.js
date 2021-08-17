// Import logger
const logger = require('../loaders/logger');

// Import Config
const config = require('config');

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
        this.auth0Domain = config.auth0.issuer;
        /** Sets the Auth0 application client ID */
        this.auth0ClientId = config.auth0.clientId;
        /** Sets the Auth0 application client secret */
        this.auth0ClientSecret = config.auth0.clientSecret;
    };
}
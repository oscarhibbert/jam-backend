// Auth0
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const auth0Config = require('../config/auth0Config');

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
exports.checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: auth0Config.jwksUri,
    }),

    // Validate the audience and the issuer.
    audience: auth0Config.audience,
    issuer: [auth0Config.issuer],
    algorithms: [auth0Config.algorithms],
});

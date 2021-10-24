// Auth0
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const config = require('config');

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
    jwksUri: config.auth0.jwksUri,
    }),

    // Validate the audience and the issuer.
    audience: config.auth0.audience,
    issuer: [config.auth0.issuer],
    algorithms: [config.auth0.algorithms],
});

// Check permissions middleware
exports.CheckPermissions = jwtAuthz(
    config.auth0.permissions,
    { }
);

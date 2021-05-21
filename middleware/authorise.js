// This file contains the auth middleware function

// Old Code
// Imports
const config = require('config');
const jwt = require('jsonwebtoken');

exports.authorise = (req, res, next) => {
    // Get the token from the header
    const token = req.header('x-auth-token');

    // If there is no token respond with a 401
    if (!token) {
        return res.status(401).json({ success: false, msg: 'No token, authorisation denied' });
    }

    // If there is a token
    try {
        
        // Try to decode it
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // If decoded is successful set req.user to the decoded user object
        // This contains the User ID (user.id)
        req.user = decoded.user;

        next();

    } catch (err) {
        res.status(401).json({ success: false, msg: 'Token is not valid, authorisation denied' });
    }
};
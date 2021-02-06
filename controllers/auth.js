// This controller contains all authentication methods

// Imports
const config = require('config');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model imports
const User = require('../models/User');

// Controller methods
// @desc   Authenticate user & get token (login)
// @route  POST api/v1/auth
// @access Public
exports.loginUser = async (req, res, next) => {
    try {
        // Destructure req body
        const { email, password } = req.body;

        // Look for the user via email
        let user = await User.findOne({ email });

        // Check if the user exists
        if (user) {

            // Compare plain text & encrypted password
            // user.password comes from User.findOne
            const isMatch = await bcryptjs.compare(password, user.password);
            
            // If the passwords do not match
            if (!isMatch) {
                throw new Error('Invalid Credentials');
            }

            /* user.fineOne() returns a promise allowing us to access the
            record id using user.id. Mongoose abstracts ._id to .id */

            // Construct JWT payload
            const payload = {
                user: {
                    id: user.id
                },
            };

            // Sign & respond with the JWT token
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: config.get('jwtDuration') },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        msg: 'JWT token',
                        token: token
                    });
                },
            );
        }

        // Else...
        else {
            throw new Error('Invalid Credentials');
        }

    } catch (err) {
        console.error(err.message);
        if (err.message === 'Invalid Credentials') {
            return res.status(400).json({ success: false, msg: 'Invalid Credentials' });
        }
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
}
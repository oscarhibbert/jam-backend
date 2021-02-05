// This controller contains all user methods

// Imports
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model imports
const User = require('../models/User');

// Controller methods
// @desc   Register a new user
// @route  POST api/v1/users
// @access Public
exports.registerUser = async (req, res) => {
    try {
        // Destructure req.body
        const {
            firstName,
            lastName,
            email,
            password } = req.body;
        
        // Check if the user exists
        let user = await User.findOne({ email });

        // If the user doesn't exist
        if (!user) {
            // Update the user variable, create new instance of a user
            user = new User({
                firstName,
                lastName,
                email,
                password
            });

            // Generate password salt
            const salt = await bcrypt.genSalt(10);

            // Encrypt the password using bcryptjs
            user.password = await bcrypt.hash(password, salt);

            // Save the user to the database
            await user.save();

            // Respond with the josnwebtoken
            /* user.save() returns a promise allowing us to access the
            record id using user.id. Mongoose abstracts ._id to .id */
            const payload = {
              user: {
                id: user.id,
              },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                        res.json({ token });
                }
            );
        }
        
        // Else respond the user already exists
        else {
            throw new Error('User already exists');
        }


    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
}
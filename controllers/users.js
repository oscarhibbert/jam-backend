// This controller contains all user methods

// Imports
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model imports
const User = require('../models/User');

// Service imports
const UserService = require('../services/UserService');
const userService = new UserService();

// Controller methods
// @desc   Register a new user
// @route  POST api/v1/users
// @access Public
exports.registerUser = async (req, res, next) => {
    try {
        const userInfo = req.body;

        let response = await userService.RegisterUser(userInfo);
        console.log(response);
        res.json(response);

        // // Destructure req.body
        // const {
        //     firstName,
        //     lastName,
        //     email,
        //     password } = req.body;
        
        // // Check if the user exists
        // let user = await User.findOne({ email });

        // // If the user doesn't exist
        // if (!user) {
        //   // Update the user variable, create new instance of a user
        //   user = new User({
        //     firstName,
        //     lastName,
        //     email,
        //     password,
        //   });

        //   // Generate password salt
        //   const salt = await bcrypt.genSalt(10);

        //   // Encrypt the password using bcryptjs
        //   user.password = await bcrypt.hash(password, salt);

        //   // Save the user to the database
        //   await user.save();

        //   // Response
        //   // Build response object
        //   const response = {
        //     success: true,
        //     msg: `New user created successfully`
        //   };

        //   console.log(response);
        //   res.json(response);

        // }
        
        // // Else respond the user already exists
        // else {
        //     throw new Error('User already exists');
        // }


    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server Error' });
    };
};
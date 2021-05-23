// This controller contains all user controller methods

// Service imports
const UserService = require('../services/UserService');
const UserServiceInstance = new UserService();

// Controller methods
// @desc   Register a new user
// @route  POST api/v1/users
// @access Public
exports.registerUser = async (req, res, next) => {
    try {
        // Destructure req.body
        const { firstName, lastName, email, password } = req.body;

        let response = await UserServiceInstance.RegisterUser(
            firstName, lastName, email, password
        );
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

// @desc   Create user profile via profileID from Auth0
// @route  POST api/v1/users/profile
// @access Private
exports.createUserProfile = async (req, res, next) => {
    try {
        console.log(req.body.auth0Id)
        // Set auth0Id
        const auth0Id = req.body.auth0Id;

        let response = await UserServiceInstance.CreateUserProfile(auth0Id);

        console.log(response);
        res.json(response);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server Error' });
    };
};
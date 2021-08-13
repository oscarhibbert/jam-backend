// This controller contains all authentication methods

// Service imports
const AuthService = require('../services/AuthService');
const AuthServiceInstance = new AuthService();

// Controller methods
// @desc   Authenticate user & get token (login)
// @route  POST api/v1/auth
// @access Public
exports.loginUser = async (req, res, next) => {
    try {
        // Destructure req.body
        const { email, password } = req.body;

        let response = await AuthServiceInstance.loginUser(email, password);

        if (response.msg === 'Invalid Credentials') {
            // Return a 401 authorisation denied
            return res
                .status(400)
                .json({ success: false, msg: 'Invalid Credentials' });
        }

        // console.log(response);

        res.json(response);

    } catch (err) {
        console.error(err.message);

        res.status(500).json({ success: false, msg: 'Server Error' });
    };
};
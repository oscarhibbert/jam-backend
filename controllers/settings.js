// This controller contains all settings controller methods

// Service imports
const SettingsService = require('../services/SettingsService');
const SettingsServiceInstance = new SettingsService();
/**
 * @desc                        Attempt to get settings object for the specified user.
 * @route                       GET api/v1/settings
 * @access                      Private.
 */
exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.sub;

        const response =
            await SettingsServiceInstance.getSettings(
                userId);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to check the settings setup status for the specified user.
 * @route                       GET api/v1/settings/status
 * @access                      Private.
 */
exports.checkSettingsSetupStatus = async (req, res) => {
    try {
        const userId = req.user.sub;

        const response =
            await SettingsServiceInstance.checkSettingsSetupStatus(
                userId);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to change the settings setup status for the specified user.
 * @route                       PUT api/v1/settings/status
 * @access                      Private.
 */
exports.editSettingsSetupStatus = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { status } = req.body;

        const response =
            await SettingsServiceInstance.editSettingsSetupStatus(
                userId, status);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to add categories to the user's settings.
 * @route                       POST api/v1/settings/categories
 * @access                      Private.
 */
exports.addCategories = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { categories } = req.body;

        const response =
            await SettingsServiceInstance.addCategories(
                userId, categories);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to edit category for user.
 * @route                       PATCH api/v1/settings/categories
 * @access                      Private.
 */
exports.editCategory = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { categoryId, categoryName, categoryType } = req.body;

        const response =
            await SettingsServiceInstance.editCategory(
                userId, categoryId, categoryName, categoryType);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to delete specified categories from the user's settings.
 * @route                       DELETE api/v1/settings/categories
 * @access                      Private.
 */
exports.deleteCategories = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { categories } = req.body;

        const response =
            await SettingsServiceInstance.deleteCategories(
                userId, categories);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to get all categories for the specified user.
 * @route                       GET api/v1/settings/categories
 * @access                      Private.
 */
exports.getAllCategories = async (req, res) => {
    try {
        const userId = req.user.sub;

        const response =
            await SettingsServiceInstance.getAllCategories(
                userId);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to check if specified category is in use for the specified user.
 * @route                       GET api/v1/settings/categories/inuse/:id
 * @access                      Private.
 */
exports.checkCategoryInUse = async (req, res) => {
    try {
        const userId = req.user.sub;
        const categoryId = req.params.id;

        const response =
            await SettingsServiceInstance.checkCategoryInUse(
                userId, categoryId);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to add activities to the user's settings.
 * @route                       POST api/v1/settings/activities
 * @access                      Private.
 */
exports.addActivities = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { activities } = req.body;

        const response =
            await SettingsServiceInstance.addActivities(
                userId, activities);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to edit activity for user.
 * @route                       PATCH api/v1/settings/activities
 * @access                      Private.
 */
exports.editActivity = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { activityId, activityName, activityType } = req.body;

        const response =
            await SettingsServiceInstance.editActivity(
                userId, activityId, activityName, activityType);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to delete specified activities from the user's settings.
 * @route                       DELETE api/v1/settings/activities
 * @access                      Private.
 */
exports.deleteActivities = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { activities } = req.body;

        const response =
            await SettingsServiceInstance.deleteActivities(
                userId, activities);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to get all activities for the specified user.
 * @route                       GET api/v1/settings/activities
 * @access                      Private.
 */
exports.getAllActivities = async (req, res) => {
    try {
        const userId = req.user.sub;

        const response =
            await SettingsServiceInstance.getAllActivities(
                userId);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};

/**
 * @desc                        Attempt to check if specified activity is in use for the specified user.
 * @route                       GET api/v1/settings/activities/inuse/:id
 * @access                      Private.
 */
exports.checkActivityInUse = async (req, res) => {
    try {
        const userId = req.user.sub;
        const activityId = req.params.id;

        const response =
            await SettingsServiceInstance.checkActivityInUse(
                userId, activityId);
        
        console.log(response);

        res.json(response);
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                errors: [
                    {
                        msg: err.message
                    }
                ]
            }
        );
    };
};
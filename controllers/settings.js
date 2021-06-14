// This controller contains all settings controller methods

// Service imports
const SettingsService = require('../services/SettingsService');
const SettingsServiceInstance = new SettingsService();

/**
 * @desc                        Attempt to add tags to the user's settings.
 * @route                       POST api/v1/settings/tags
 * @access                      Private.
 */
exports.addTags = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { tags } = req.body;

        const response =
            await SettingsServiceInstance.addTags(
                userId, tags);
        
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
 * @desc                        Attempt to edit tag for user.
 * @route                       PATCH api/v1/settings/tags
 * @access                      Private.
 */
exports.editTag = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { tagId, tagName, tagType } = req.body;

        const response =
            await SettingsServiceInstance.editTag(
                userId, tagId, tagName, tagType);
        
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
 * @desc                        Attempt to delete specified tags from the user's settings.
 * @route                       DELETE api/v1/settings/tags
 * @access                      Private.
 */
exports.deleteTags = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { tags } = req.body;

        const response =
            await SettingsServiceInstance.deleteTags(
                userId, tags);
        
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
 * @desc                        Attempt to get all tags for the specified user.
 * @route                       GET api/v1/settings/tags
 * @access                      Private.
 */
exports.getAllTags = async (req, res) => {
    try {
        const userId = req.user.sub;

        const response =
            await SettingsServiceInstance.getAllTags(
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
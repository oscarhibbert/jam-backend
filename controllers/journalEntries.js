// This controller contains all journal entry methods


// Model imports
const User = require('../models/User');
const Entry = require('../models/Entry');


// Controller methods
// @desc   Create a new journal entry by user ID
// @route  POST api/v1/entries/create/id
// @access Public
exports.createNewEntry = async (req, res) => {

    try {
        // Check if user ID exists
        const check = await User.countDocuments({ _id: req.params.id });
        if (check !== 1)
            return res.status(404).json({ success: false, msg: 'User ID error' });
        
        // Else, continue
        // Destructure request body
        const {
            text,
            mood,
            tags
        } = req.body;

        // Create new object newEntry
        const newEntry = {};

        // Add objects to newEntry Object
        newEntry.user = req.params.id,
        newEntry.text = text,
        newEntry.mood = mood
        
        // Only add tags object if present
        if (tags) newEntry.tags = tags;

        // Create a new entry in the database
        let entry = new Entry(newEntry);
        await entry.save();

        // Response
        // Build response object
        const response = {
            success: true,
            msg: `New journal entry created for user ${req.params.id}`,
            data: newEntry
        };

        console.log(response);
        res.json(response);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId')
            return res.status(500).json({ success: false, msg: 'User ID error' });
        res.status(500).send('Server Error');
    }
};


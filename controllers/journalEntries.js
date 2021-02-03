// This controller contains all journal entry methods


// Model imports
const User = require('../models/User');
const Entry = require('../models/Entry');


// Controller methods
// @desc   Create a new journal entry by user ID
// @route  POST api/v1/entries/id
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
        newEntry.user = req.params.id;
        newEntry.text = text;
        newEntry.mood = mood;
        
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

// @desc   Update a journal entry by entry ID
// @route  PATCH api/v1/entries/id
// @access Public
exports.updateEntry = async (req, res) => {
    try {

        // Check if the journal entry exists in the database
        let check = await Entry.countDocuments({ _id: req.params.id });

        // If the journal entry is found
        if (check === 1) {
          // Destructure request body
          const { text, mood, tags } = req.body;

          // Create new object newEntry
          const updatedEntry = {};

          // Add objects to newEntry Object
          if (text) updatedEntry.text = text;
          if (mood) updatedEntry.mood = mood;
          if (!tags) updatedEntry.tags = [];
          else {
            updatedEntry.tags = tags;
          }
          updatedEntry.dateUpdated = Date.now();

          // Update at the database
          await Entry.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updatedEntry },
            { new: true }
          );

          // Response
          const response = {
            success: true,
            msg: `Journal entry updated with ID ${req.params.id}`,
            data: updatedEntry,
          };

          console.log(response);
          res.json(response);
        }
        
        // Else throw error
        else {
          throw new Error('Journal Entry not found');
        };
        
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId' || err.message === 'Journal Entry not found')
          return res.status(500).json({ success: false, msg: 'User ID error' });
        res.status(500).send('Server Error');       
    }
}

// @desc   Delete a journal entry by entry ID
// @route  DELETE api/v1/entries/id
// @access Public
exports.deleteEntry = async (req, res) => {
  try {
    // Check if the journal entry exists in the database
    let check = await Entry.countDocuments({ _id: req.params.id });

    // If the journal entry is found
    if (check === 1) {

      // Delete the journal entry
      await Entry.deleteOne({ _id: req.params.id });

      // Response
      const response = {
        success: true,
        msg: `Journal entry deleted with ID ${req.params.id}`
      };

      console.log(response);
      res.json(response);
    }

    // Else throw error
    else {
      throw new Error('Journal Entry not found');
    }
  } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId' || err.message === 'Journal Entry not found')
        return res.status(500).json({ success: false, msg: 'User ID error' });
      res.status(500).send('Server Error');
  }
}
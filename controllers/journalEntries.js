// This controller contains all journal entry methods


// Model imports
const User = require('../models/User');
const Entry = require('../models/Entry');


// Controller methods
// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
exports.createEntry = async (req, res) => {

    try {
        // Check if user ID exists
        const check = await User.countDocuments({ _id: req.user.id });
        if (check !== 1)
            // Return a 401 authorisation denied
            return res.status(401).json({ success: false, msg: 'Authorisation denied' });
        
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
        newEntry.user = req.user.id;
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
          msg: `New journal entry created`,
          data: {
            text: newEntry.text,
            mood: newEntry.mood,
            tags: newEntry.tags,
          }
        };

        console.log(response);
        res.json(response);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId')
            return res.status(500).json({ success: false, msg: 'User ID error' });
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc   Update a journal entry by entry ID
// @route  PATCH api/v1/entries/id
// @access Private
exports.updateEntry = async (req, res) => {
    try {

      // Check if the journal entry exists in the database
      // Check is for req.params.id AND req.user.id
      let check = await Entry.countDocuments(
        {
          $and: [
            { _id: req.params.id },
            { user: req.user.id }
          ]
        });

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
            {
              $and: [
                { _id: req.params.id },
                { user: req.user.id }],
            },
            { $set: updatedEntry },
            { new: true }
          );

          // Response
          const response = {
            success: true,
            msg: `Journal entry updated with ID ${req.params.id}`,
            data: {
              text: updatedEntry.text,
              mood: updatedEntry.mood,
              tags: updatedEntry.tags
            }
          };

          console.log(response);
          res.json(response);
        }
        
        // Else return a 401 authorisation denied
        else {
          return res
            .status(401)
            .json({ success: false, msg: 'Authorisation denied' });
        };
        
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId')
          return res.status(500).json({ success: false, msg: 'Journal entry ID error' });
        res.status(500).json({ success: false, msg: 'Server Error' });    
    }
}

// @desc   Delete a journal entry by entry ID
// @route  DELETE api/v1/entries/id
// @access Private
exports.deleteEntry = async (req, res) => {
  try {
    // Check if the journal entry exists in the database
    // Check is for req.params.id AND req.user.id
    let check = await Entry.countDocuments(
      {
        $and: [
          { _id: req.params.id },
          { user: req.user.id }
        ],
    });

    // If the journal entry is found
    if (check === 1) {

      // Delete the journal entry
      await Entry.deleteOne(
        {
          $and: [
            { _id: req.params.id },
            { user: req.user.id }
          ],
      });

      // Response
      const response = {
        success: true,
        msg: `Journal entry deleted with ID ${req.params.id}`
      };

      console.log(response);
      res.json(response);
    }

    // Else return a 401 authorisation denied
    else {
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }
  } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId')
        return res.status(500).json({ success: false, msg: 'Journal ID error' });
      res.status(500).json({ success: false, msg: 'Server Error' });
  }
}

// @desc   Get all journal entries by user ID
// @route  GET api/v1/entries
// @access Private
exports.getAllEntries = async (req, res) => {
  try {

    // Check if the journal entry exists in the database
    // Check is for req.user.id
    let check = await User.countDocuments({ _id: req.user.id });

    // If the user is found
    if (check === 1) {
      // Get all entries in the Entry collection from req.user.id
      // Sort by newest first. +1 would be oldest first
      const entries = await Entry.find({ user: req.user.id }).sort({ date: -1 });

      // Build response object
      // Response
      const response = {
        success: true,
        msg: `All journal entries`,
        data: entries,
      };

      console.log(response);
      res.json(response);

    } else {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }
    
  } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId')
        return res.status(500).json({ success: false, msg: 'User ID error' });
      res.status(500).json({ success: false, msg: 'Server Error' });
  }
}

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/entry/id
// @access Private
exports.getEntry = async (req, res) => {
  try {
    // Check if the journal entry exists in the database
    // Check is for req.params.id AND req.user.id
    let check = await Entry.countDocuments(
      {
        $and: [
          { _id: req.params.id },
          { user: req.user.id }
        ],
    });

    // If the journal entry is found
    if (check === 1) {
      // Get the journal entry
      const entry = await Entry.findOne(
        {
          $and: [
            { _id: req.params.id },
            { user: req.user.id }
          ],
      });

      // Response
      const response = {
        success: true,
        msg: `Journal entry with ID ${req.params.id}`,
        data: {
          text: entry.text,
          mood: entry.mood,
          tags: entry.tags
        }
      };

      console.log(response);
      res.json(response);
    }

    // Else throw error
    else {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }
  } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId')
        return res.status(500).json({ success: false, msg: 'Journal entry ID error' });
      res.status(500).json({ success: false, msg: 'Server Error' });
  }
}
// This controller contains all journal entry controller methods

// Service imports
const JournalService = require('../services/JournalService');
const JournalServiceInstance = new JournalService();


// Controller methods
// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
exports.createEntry = async (req, res) => {

  try {
    const userID = req.user.id;
    const journalEntry = req.body;

    let response = await JournalServiceInstance.createEntry(
      userID, journalEntry);

    console.log(response);

    if (response.authorise === false) {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }

    // Remove authorise from response as not needed
    delete response.authorise;

    res.json(response);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  };
};

// @desc   Update a journal entry by entry ID
// @route  PATCH api/v1/entries/id
// @access Private
exports.updateEntry = async (req, res) => {
  try {
    const journalID = req.params.id;
    const userID = req.user.id;
    const journalEntry = req.body;

    let response = await JournalServiceInstance.updateEntry(
      journalID, userID, journalEntry);

    console.log(response);

    if (response.authorise === false) {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }

    // Remove authorise from response as not needed
    delete response.authorise;

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

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
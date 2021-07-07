// This controller contains all journal entry controller methods

// Service imports
const JournalService = require('../services/JournalService');
const JournalServiceInstance = new JournalService();

// Controller methods
// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
exports.createEntry = async (req, res) => {
  console.log(req.user);
  try {
    const userID = req.user.sub;
    const { mood, emotion, activities, tags, text, linkedEntry } = req.body;

    let response = await JournalServiceInstance.createEntry(
      userID,
      mood,
      emotion,
      activities,
      tags,
      text,
      linkedEntry
    );

    console.log(response);

    if (response.authorise === false) {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }

    // Remove authorise from response as not needed
    delete response.authorise;

    // Respond
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc   Edit a journal entry by entry ID
// @route  PATCH api/v1/entries/:id
// @access Private
exports.editEntry = async (req, res) => {
  try {
    const userId = req.user.sub;
    const journalId = req.params.id;
    const { mood, emotion, activities, tags, text, linkedEntry } = req.body;

    let response = await JournalServiceInstance.editEntry(
      userId,
      journalId,
      mood,
      emotion,
      activities,
      tags,
      text,
      linkedEntry
    );

    console.log(response);

    if (response.authorise === false) {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    };

    // Remove authorise from response as not needed
    delete response.authorise;

    // Respond
    res.json(response);
  } catch (err) {
    console.error(err.message);
    // if (err.kind === 'ObjectId')
    //   return res
    //     .status(500)
    //     .json({ success: false, msg: 'Journal ID error' });
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc   Delete a journal entry by entry ID
// @route  DELETE api/v1/entries/:id
// @access Private
exports.deleteEntry = async (req, res) => {
  try {
    const userID = req.user.sub;
    const journalID = req.params.id;

    let response = await JournalServiceInstance.deleteEntry(userID, journalID);

    console.log(response);

    if (response.authorise === false) {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }

    // Remove authorise from response as not needed
    delete response.authorise;

    // Respond
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc   Get all journal entries by user ID
// @route  GET api/v1/entries
// @access Private
exports.getAllEntries = async (req, res) => {
  try {
    const userID = req.user.sub;

    let response = await JournalServiceInstance.getAllEntries(userID);

    console.log(response);

    if (response.authorise === false) {
      // Return 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }

    // Remove authorise from response as not needed
    delete response.authorise;

    // Respond
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc   Get single journal entry by entry ID
// @route  GET api/v1/entries/entry/:id
// @access Private
exports.getEntry = async (req, res) => {
  try {
    const userID = req.user.sub;
    const journalID = req.params.id;

    let response = await JournalServiceInstance.getEntry(userID, journalID);

    console.log(response);

    if (response.authorise === false) {
      // Return a 401 authorisation denied
      return res
        .status(401)
        .json({ success: false, msg: 'Authorisation denied' });
    }

    // Remove authorise from response as not needed
    delete response.authorise;
    
    // Respond
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};
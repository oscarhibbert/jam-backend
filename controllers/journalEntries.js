// This controller contains all journal entry controller methods

// Import logger
const logger = require('../loaders/logger');

// Service imports
const JournalService = require('../services/JournalService');

// Controller methods
// @desc   Create a journal entry
// @route  POST api/v1/entries
// @access Private
exports.createEntry = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { mood, emotion, categories, activities, text, linkedEntry } = req.body;

    // Instantiate the Journal Service Class and pass req.body values
    const JournalServiceInstance = new JournalService(
      {
        userId: userId,
        entryMood: mood,
        entryEmotion: emotion,
        entryCategories: categories,
        entryActivities: activities,
        entryText: text,
        linkedEntry: linkedEntry
      }
    );

    // Create a journal entry
    let response = await JournalServiceInstance.createEntry();

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
    logger.error(err.message);
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
    const { mood, emotion, categories, activities, text, linkedEntry } = req.body;

    let response = await JournalServiceInstance.editEntry(
      userId,
      journalId,
      mood,
      emotion,
      categories,
      activities,
      text,
      linkedEntry
    );

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
    logger.error(err.message);
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
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc   Get all journal entries by user ID
// @route  GET api/v1/entries
// @access Private
exports.getAllEntries = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { startDateTime, endDateTime, categoryId } = req.body;

    let response = await JournalServiceInstance.getAllEntries(
      userId, startDateTime, endDateTime, categoryId
    );

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
    logger.error(err.message);
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
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc   Get the most recent entry for the specified user
// @route  GET api/v1/entries/fetch/newest
// @access Private
exports.getMostRecentEntry = async (req, res) => {
  try {
    const userId = req.user.sub;

    let response = await JournalServiceInstance.getMostRecentEntry(userId);
    
    // Respond
    res.json(response);

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  };
};

// @desc   Get the closest matching journal entry for the specified user to the specified entry
// @route  GET api/v1/entries/closestmatch/:id
// @access Private
exports.getClosestEntry = async (req, res) => {
  try {
    const userId = req.user.sub;
    const journalId = req.params.id;

    let response = await JournalServiceInstance.getClosestEntry(userId, journalId);
    
    // Respond
    res.json(response);
    
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  };
};

// @desc   Get stats on journalling for specified user between a start dateTime and end dateTime
// @route  GET api/v1/entries/fetch/stats
// @access Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { startDateTime } = req.body;
    const { endDateTime } = req.body;
    const { categoryId } = req.body;

    let response = await JournalServiceInstance.getStats(
      userId, startDateTime, endDateTime, categoryId);
    
    // Respond
    res.json(response);
    
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
  };
};
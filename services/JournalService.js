// Import logger
const logger = require('../loaders/logger');

// Import evervault
const evervault = require('../loaders/evervault');

// Model imports
const User = require('../models/User');
const Entry = require('../models/Entry');
const Categories = require('../models/Categories');
const Activities = require('../models/Activities');

// Events
const EventEmitter = require('events').EventEmitter;
const journalServiceEvents = new EventEmitter;

// Import Percentage Round
const percentRound = require('percent-round');

// Import helpers
const checkIsoDate = require('../helpers/checkIsoDate');

/**
 * @description Create an instance of the JournalService class for handling journal entries.
 */
module.exports = class JournalService {
    /**
     * Represents the JournalService instance constructor.
     * @constructor
     * @param {Object} params - An object containing parameters for the instance.
     *   @param {string}  params.userId - A string containing the userId
     *   @param {string}  params.journalId - A string containing the journalId
     *   @param {string}  params.entryMood - A string containing the entry mood type
     *   @param {string}  params.entryEmotion - A string containing the entry emotion type
     *   @param {[]}      params.entryCategories - An array of objects containing entry categories
     *   @param {[]}      params.entryActivities - An array of objects containing entry activities
     *   @param {string}  params.entryText - A string containing entry text
     *   @param {string}  params.linkedEntry - A string containing the journalId of the entry to link
     *   @param {string}  params.startDateTime - A string containing a start date and time in ISO8601 in UTC for querying
     *   @param {string}  params.endDateTime - A string containing an end date and time in ISO8601 in UTC for querying
     *   @param {string}  params.categoryId - A string containing the categoryId for querying
     */
    constructor(params = {}) {
        // User properties
        this._userId = params.userId;

        // Journal entry properties
        this._journalId = params.journalId;
        this._entryMood = params.entryMood;
        this._entryEmotion = params.entryEmotion;
        this._entryCategories = params.entryCategories;
        this._entryActivities = params.entryActivities;
        this._entryText = params.entryText;
        this._linkedEntry = params.linkedEntry;

        // Journal query properties
        this._startDateTime = params.startDateTime;
        this._endDateTime = params.endDateTime;
        this._categoryId = params.categoryId;
        
        /** Sets the only accepted mood types for the JournalService.
         * As an array of moodType objects.
         */
        this._moodTypes = [
            {
                moodType: "High Energy, Unpleasant"
            },
            {
                moodType: 'Low Energy, Unpleasant'
            },
            {
                moodType: 'High Energy, Pleasant'
            },
            {
                moodType: 'Low Energy, Pleasant'
            }
        ];
    };

    /**
     * Creates a new journal entry using the journalId, 
     * entryMood, entryText, and linkedEntry (optional) properties from the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   entryMood: "",
     *   entryEmotion: "",
     *   entryCategories: [{}],
     *   entryActivities: [{}],
     *   entryText: "",
     *   linkedEntry: ""
     * });
     * 
     * await journalService.createEntry();
     */
    async createEntry() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Add journal entry failed - userId parameter empty. Must be supplied.');
            };

            // Check entryMood parameter exists
            if (!this._entryMood) {
                throw new Error(`Add journal entry failed - entryMood parameter empty. Must be supplied. ${this._userId}`);
            };

            // Check entryEmotion parameter exists
            if (!this._entryEmotion) {
                throw new Error(`Add journal entry failed - entryEmotion parameter empty. Must be supplied. ${this._userId}`);
            };

            // Check entryText parameter exists
            if (!this._entryText) {
                throw new Error(`Add journal entry failed - entryText parameter empty. Must be supplied. ${this._userId}`);
            };

            // If linkedEntry parameter exists and entry mood parameter is unpleasant
            // Throw error
            if (this._linkedEntry && this._entryMood.includes('Pleasant')) {
                throw new Error(`Add journal entry failed - cannot link an entry when current entry mood type is pleasant. ${this._userId}`);
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if specified user ID exists in the DB
            const check = await User.countDocuments({ auth0UserId: this._userId });

            // If user is not found
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'User not found';
            }

            // Else, continue
            else {

                // Create newEntry object
                const newEntry = {};

                // Add journal details to newEntry object
                newEntry.user = this._userId;
                newEntry.mood = await evervault.encrypt(this._entryMood);
                newEntry.emotion = await evervault.encrypt(this._entryEmotion);

                // Only add categories array if categories present
                if (this._entryCategories) newEntry.categories = this._entryCategories;

                // Only add activities arrary if activities present
                if (this._entryActivities) newEntry.activities = this._entryActivities;

                // Add journal details to newEntry object
                newEntry.text = await evervault.encrypt(this._entryText);

                // Only add linkedEntry if linkedEntry present
                if (this._linkedEntry) newEntry.linkedEntry = this._linkedEntry;

                // Add journal entry to the database
                let entry = new Entry(newEntry);
                await entry.save();
                
                // Emit journalCreated event
                journalServiceEvents.emit('journalEntryCreated');

                // Log success
                logger.info(`New journal entry created successfully for user ${this._userId}`);

                // Set response
                success = true;
                authorise = true;
                (msg = 'New journal entry created successfully'),
                    (data = {
                    _id: entry._id,
                    user: this._userId,
                    mood: newEntry.mood,
                    emotion: newEntry.emotion,
                    categories: newEntry.categories,
                    activities: newEntry.activities,
                    text: newEntry.text,
                    linkedEntry: newEntry.linkedEntry
                    });
            };
            
            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg,
                data: data
            };

            // Return response object
            return response;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

   /**
     * Edit a journal entry provide the userId, journalId.
     * Optionally provide entryMood, entryEmotion, entryText, 
     * entryCategories, entryActivities and linkedEntry properties from the constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   journalId, "",
     *   entryMood: "",
     *   entryEmotion: "",
     *   entryCategories: [{}],
     *   entryActivities: [{}],
     *   entryText: "",
     *   linkedEntry: ""
     * });
     * 
     * await journalService.editEntry();
     */
    async editEntry() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Edit journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!this._journalId) {
                throw new Error(`Edit journal entry failed - journalId parameter empty. Must be supplied. ${this._userId}`);
            };

            // If linkedEntry exists and entryMood does not exists
            // Throw error
            if (this._linkedEntry && !this._entryMood) {
                throw new Error(`Add journal entry failed - cannot link an entry when current entry mood type parameter is empty. ${this._userId}`);
            }

            // If linkedEntry parameter exists and entry mood parameter is pleasant
            // Throw error
            if (this._linkedEntry && this._entryMood.includes('Pleasant')) {
                throw new Error(`Add journal entry failed - cannot link an entry when current entry mood type is pleasant. ${this._userId}`);
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the journal entry exists in the database
            // Checks against userId, journalId
            let check = await Entry.countDocuments(
                {
                    $and: [
                        { _id: this._journalId },
                        { user: this._userId }
                    ]
                }
            );

            // If journal entry is not found
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'Journal entry not found'
            }
            
            // Else, continue
            else {

                // Create new object updatedEntry
                const updatedEntry = {};

                // Add objects to newEntry object if found
                if (this._entryMood) updatedEntry.mood = await evervault.encrypt(this._entryMood);
                if (this._entryEmotion) updatedEntry.emotion = await evervault.encrypt(this._entryEmotion);
                if (this._entryCategories) updatedEntry.categories = this._entryCategories;
                if (this._entryActivities) updatedEntry.activities = this._entryActivities;
                if (this._entryText) updatedEntry.text = await evervault.encrypt(this._entryText);

                if (this._linkedEntry) updatedEntry.linkedEntry = this._linkedEntry;

                // Populate the dateUpdated field of the journal entry
                updatedEntry.dateUpdated = Date.now();

                // Save to the database
                await Entry.findOneAndUpdate(
                    {
                        $and: [
                            { _id: this._journalId },
                            { user: this._userId }
                        ]
                    },
                    { $set: updatedEntry },
                    { new: true }
                );

                // Emit journalUpdated event
                journalServiceEvents.emit('journalEntryUpdated');

                // Log success
                logger.info(`Journal entry edited successfully for user ${this._userId}`);

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully updated with ID ${this._journalId}`;
                data = {
                    user: this._userId,
                    mood: updatedEntry.mood,
                    emotion: updatedEntry.emotion,
                    categories: updatedEntry.categories,
                    activities: updatedEntry.activities,
                    text: updatedEntry.text,
                    linkedEntry: updatedEntry.linkedEntry
                };
            };

            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg,
                data: data
            };

            // Return response object
            return response;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Delete a journal entry provide the userId, journalId.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   journalId, ""
     * });
     * 
     * await journalService.deleteEntry();
     */
    async deleteEntry() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!this._journalId) {
                throw new Error(`Delete journal entry failed - journalId parameter empty. Must be supplied. ${this._userId}`);
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;

            // Check if the journal entry exists in the database
            // Checks against userId, journalId
            let check = await Entry.countDocuments(
                {
                    $and: [
                        { _id: this._journalId },
                        { user: this._userId }
                    ]
                }
            );

            // If journal entry is not found
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'Journal entry not found'
            }

            // Else, continue
            else {
                // Delete journal entry from the database
                await Entry.deleteOne(
                    {
                        $and: [
                            { _id: this._journalId },
                            { user: this._userId }
                        ]
                    }
                );

                // Emit journalDeleted event
                journalServiceEvents.emit('journalEntryDeleted');

                // Log success
                logger.info(`Journal entry deleted successfully for user ${this._userId}`);

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully deleted with ID ${this._journalId}`;
            };

            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg,
                user: this._userId
            };

            // Return response object
            return response;
            
        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Fetch all journal entries for the specified user provide the userId, startDateTime
     * and endDateTime. Optionally provide a categoryId for filtering.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   startDateTime: "",
     *   endDateTime: "",
     *   categoryId: ""
     * });
     * 
     * await journalService.getAllEntries();
     */
    async getAllEntries() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get all journal entries failed - userId parameter empty. Must be supplied');
            };

            // If startDateTime parameter exists and endDateTime parameter doesn't exist
            if (this._startDateTime && !this._endDateTime) {
                throw new Error(`Get all journal entries failed - endDateTime parameter empty. Must be supplied with startDateTime parameter. ${this._userId}`);
            };

            // If startDateTime & endDateTime parameters exists
            if (this._startDateTime && this._endDateTime) {
                // Check startDateTime and endDateTime is ISO 8601 formatted
                if (!checkIsoDate(this._startDateTime)) {
                    throw new Error(`Get all journal entries failed - startDateTime parameter must be an ISO 8601 string in Zulu time. ${this._userId}`);
                };

                if (!checkIsoDate(this._endDateTime)) {
                    throw new Error(`Get all journal entries failed - endDateTime parameter must be an ISO 8601 string in Zulu time. ${this._userId}`);
                };
            };

            // If the categoryId parameter has been provided
            // Check it exists in the database
            if (this._categoryId) {
                const checkCategory = await Categories.find({ _id: this._categoryId }).lean();

                if (checkCategory.length === 0) {
                    throw new Error(`Get all journal entries failed - specified categoryId not found. ${this._userId}`);
                };
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the user exists
            let check = await User.countDocuments({ auth0UserId: this._userId });

            // If the user is not found
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'Journal entries not found';
            }

            // Else, continue
            else {
                // Build main aggregation pipeline stages
                const stages = [
                    // Get records by userId
                    {
                        $match: { user: { $eq: this._userId } }
                    }
                ];

                // Conditional aggregation pipeline stages
                // Category filter (add to start of stages array)
                if (this._categoryId) {
                    stages.unshift(
                        {
                            $match: { "categories.0._id": { $eq: this._categoryId } }
                        }
                    )
                };
                // startDateTime & endDateTime filter (add to end of stages array)
                if (this._startDateTime && this._endDateTime) {
                    stages.push(
                        {
                            $match: { dateCreated: { $gte: new Date(this._startDateTime), $lt: new Date(this._endDateTime) } }
                        }
                    )
                };

                // Add date sort stage to the end of the aggregation pipeline
                stages.push(
                    // Sort the records oldest to newest
                    {
                        $sort: { dateCreated: 1 }
                    }
                );

                const entries = await Entry.aggregate(stages);
                
                // Emit journalEntriesFetched event
                journalServiceEvents.emit('journalEntriesFetched');

                // Decrypt all fields of each entry in entries
                async function decryptEntries(entries) {
                    await Promise.all(entries.map(async (entry) => {
                        const decryptedEntry = await evervault.decrypt(entry);

                        entry = decryptedEntry;
                        // if (entry.mood) entry.mood = await evervault.decrypt(entry.mood);
                        // if (entry.emotion) entry.emotion = await evervault.decrypt(entry.emotion);
                        // if (entry.text) entry.text = await evervault.decrypt(entry.text);
                    }));
                };

                await decryptEntries(entries)
                    .then(() => {

                    })
                    .catch(err => {
                        logger.error("Error during decryption:", err);
                    });
                    
                // Log success
                logger.info(`Journal entries retrieved successfully for user ${this._userId}`);
                
                // Set response
                success = true;
                authorise = true;
                msg = 'Journal entries for requested user';
                data = entries;
            };

            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg,
                data: data,
                user: this._userId
            };

            // Return response object
            return response;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Delete all journal entries for the specified user provide the userId.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: ""
     * });
     * 
     * await journalService.deleteAllEntries();
     */
    async deleteAllEntries() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete journal entry failed - userId parameter empty. Must be supplied');
            };

            // Delete all journal entries for the specified user from the database
            await Entry.deleteMany(
                {
                    user: this._userId
                }
            );

            // Log success
            logger.info(`All journal entries deleted successfully for user ${this._userId}`);

            // Build response
            const response = {
                success: true,
                msg: `All journal entries delete successfully`,
                user: this._userId
            };

            // Return response object
            return response;
            
        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Get a specific journal entry for the specified user.
     * Provide userId and journalId.
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   journalId: ""
     * });
     * 
     * await journalService.getEntry();
     */
    async getEntry() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!this._journalId) {
                throw new Error(`Get journal entry failed - journalId parameter empty. Must be supplied. ${this._userId}`);
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the journal entry exists in the database
            // Check against userId, journalId
            let check = await Entry.countDocuments(
                {
                    $and: [
                        { _id: this._journalId },
                        { user: this._userId }
                    ]
                }
            );

            // If journal entry not found
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'Journal entry not found'
            }

            // Else, continue
            else {
                // Get the journal entry
                const entry = await Entry.findOne(
                    {
                        $and: [
                            { _id: this._journalId },
                            { user: this._userId }
                        ]
                    }
                );

                // Log success
                logger.info(`Entry retrieved successfully for user ${this._userId}`);

                // Emit journalEntryFetched event
                journalServiceEvents.emit('journalEntryFetched');

                const decryptedEntry = await evervault.decrypt(entry);

                // Decrypt each journal entry field
                // if (entry.mood) entry.mood = await evervault.decrypt(entry.mood);
                // if (entry.emotion) entry.emotion = await evervault.decrypt(entry.emotion);
                // if (entry.text) entry.text = await evervault.decrypt(entry.text);

                // Set response
                success = true;
                authorise = true;
                msg = 'Journal entry found'
                data = decryptedEntry;
            };

            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg,
                data: data
            };

            // Return response object
            return response;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Get the most recent journal entry for the specified user.
     *  If no journal entries exist, returned array will be empty.
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: ""
     * });
     * 
     * await journalService.getMostRecentEntry();
     */
    async getMostRecentEntry() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get most recent journal entry failed - userId parameter empty. Must be supplied');
            };

            // Get most recent journal entry
            let fetchMostRecentEntry = await Entry
                .find({ user: this._userId })
                .limit(1)
                .sort({ dateCreated: -1 });
            
            // Decrypt most recent journal entry
            const decryptedEntry = await evervault.decrypt(fetchMostRecentEntry);

            const mostRecentEntry = decryptedEntry;
            
            // Decrypt each journal entry field
            // if (mostRecentEntry.mood) mostRecentEntry.mood =
            //     await evervault.decrypt(mostRecentEntry.mood);
            // if (mostRecentEntry.emotion) mostRecentEntry.emotion =
            //     await evervault.decrypt(mostRecentEntry.emotion);
            // if (mostRecentEntry.text) mostRecentEntry.text =
            //     await evervault.decrypt(mostRecentEntry.text);
            
            // Set response
            let response;

            // If mostRecentEntry is an empty array add an object with the user property
            if (mostRecentEntry.length === 0) response = [{ user: this._userId, data: [] }]

                // Else add mostRecentEntry to the response object
            else {
                response = {
                    user: this._userId,
                    data: mostRecentEntry
                }
            };
            
            // Log success
            logger.info(`Most recent entry retrieved successfully for user ${this._userId}`);

            return response;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Get the closest matching && most recent journal entry in the past,
     *  for the specified userId and journalId.
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   journalId: ""
     * });
     * 
     * await journalService.getclosestEntry();
     */
    async getClosestEntry() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get closest journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!this._journalId) {
                throw new Error(`Get closest journal entry failed - journalId parameter empty. Must be supplied. ${this._userId}`);
            };

            // Get entry for checking
            // Check if the journal entry exists in the database
            // Check against userId, journalId
            const fetchEntry = await Entry.findOne(
                {
                    $and: [
                        { _id: this._journalId },
                        { user: this._userId }
                    ]
                }
            );

            // If journal entry not found
            if (!fetchEntry) {
                throw new Error(`Get closest journal entry failed - journal entry not found. ${this._userId}`);
            };

            const checkEntry = await evervault.decrypt(fetchEntry);

            // // Decrypt checkEntry fields
            // checkEntry.mood = await evervault.decrypt(checkEntry.mood);
            // checkEntry.emotion = await evervault.decrypt(checkEntry.emotion);
            // checkEntry.text = await evervault.decrypt(checkEntry.text);
            
            /* Fetch all entries for the current user 
            where dateCreated is before check dateCreated */
            const entries = await Entry.find(
                { user: this._userId, dateCreated: { $lt: checkEntry.dateCreated } }).lean();

            // If journal entry not found
            if (!entries) {
                throw new Error(`Get closest journal entry failed - journal entries not found. ${this._userId}`);
            };

            // Decrypt all entries
            const decryptedEntries = await evervault.decrypt(entries);
            
            // Find closest matching entry logic
            let closestEntry = null;
            // Initialise rank for closest match
            let closestRank = 0;
            
            for (const entry of decryptedEntries) {
                try {
                    // Skip the current record if ids are the same
                    if (entry._id.toString() === this._journalId) continue;

                    const decryptedEntry = entry;

                    // // Decrypted encrypted values for the current entry
                    // const decryptedEntry = await evervault.decrypt(entry);

                    // Decrypted encrypted values for the current entry
                    // const decryptedEntry = {
                    //     ...entry,
                    //     mood: await evervault.decrypt(entry.mood),
                    //     emotion: await evervault.decrypt(entry.emotion)
                    // };

                    // Ensure other values required for ranking exist for the current entry
                    // if (entry.categories) decryptedEntry.categories = entry.categories;
                    // if (entry.activities) decryptedEntry.activities = entry.activities;
                    // if (entry.dateCreated) decryptedEntry.dateCreated = entry.dateCreated;

                    // Track the rank for the current entry
                    let rank = 0;

                    /* Award points for exact matches between the current entry
                    and the supplied entry  */
                    rank += (decryptedEntry.mood === checkEntry.mood) ? 4 : 0;
                    rank += (decryptedEntry.emotion === checkEntry.emotion) ? 3 : 0;

                    // Award points for category or activity overlap (if categories exist)
                    if (decryptedEntry.categories && checkEntry.categories) {
                        rank += decryptedEntry.categories.some(
                            cat => checkEntry.categories.includes(cat)) ? 2 : 0;
                        rank += decryptedEntry.categories.some(
                            cat => checkEntry.activities.includes(cat)) ? 1 : 0;
                    };

                    // Award point for dateCreated being before current record
                    // rank += entry.dateCreated < checkEntry.dateCreated ? 2 : 0;

                    // Update closestEntry based on rank and dateCreated (simplified)
                    if (rank > closestRank || (rank === closestRank)) {
                        closestEntry = decryptedEntry;
                        closestRank = rank;
                    };

                } catch (err) {
                    logger.error("Error ranking entry:", err);
                    throw err;
                }
            };

            if (closestEntry.mood !== checkEntry.mood) {
                throw new Error('Get closest journal entry failed – no result found.')
            };

            // Log success
            logger.info(`Closest matching entry retrieved successfully for user ${this._userId}`);

            // Add userId to closestEntry object
            closestEntry.user = this._userId;
            
            // Return data
            return { user: this._userId, data: closestEntry };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Get journalling stats for the specified userId,
     *  between a startDateTime and endDateTime. Optionally provide a categoryId for filtering.
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const journalService = new JournalService({
     *   userId: "",
     *   startDateTime: "",
     *   endDateTime: "",
     *   categoryId: ""
     * });
     * 
     * await journalService.getclosestEntry();
     */
    async getStats() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get stats failed - userId parameter empty. Must be supplied');
            };

            // Check startDateTime parameter exists
            if (!this._startDateTime) {
                throw new Error(`Get stats failed - startDateTime parameter empty. Must be supplied. ${this._userId}`);
            };

            // Check endDateTime parameter exists
            if (!this._endDateTime) {
                throw new Error(`Get stats failed - endDateTime parameter empty. Must be supplied. ${this._userId}`);
            };

            // Check startDateTime and endDateTime is ISO 8601 formatted
            if (!checkIsoDate(this._startDateTime)) {
                throw new Error(`Get stats failed - startDateTime parameter must be an ISO 8601 string in Zulu time. ${this._userId}`);
            };

            if (!checkIsoDate(this._endDateTime)) {
                throw new Error(`Get stats failed - endDateTime parameter must be an ISO 8601 string in Zulu time. ${this._userId}`);
            };

            // If the categoryId parameter has been provided
            // Check it exists in the database
            if (this._categoryId) {
                const checkCategory = await Categories.find({ _id: this._categoryId }).lean();

                if (checkCategory.length === 0) {
                    throw new Error(`Get stats failed - specified categoryId not found. ${this._userId}`);
                };
            };

            // Build MongoDB aggregation pipeline query
            let aggregationPipeline = [
                // Pipeline stage
                // Get records by userId and between startDateTime & endDateTime
                {
                    $match: {
                        $and: [
                            { user: { $eq: this._userId } },
                            { dateCreated: { $gte: new Date(this._startDateTime), $lt: new Date(this._endDateTime) } },
                        ],
                    },
                },

                // // Project an additional array, stands for "moodStats", "copingStats" & "datesTimes"
                // { "$project": {
                //     "_id": 0,
                //     "mood": 1,
                //     "categories": 1,
                //     "dateCreated": 1,
                //     "type": { "$literal": ["ms", "cs", "dt"] }
                // }
                // },
                
                // // Unwind that array, creates three documents by "type"
                // { "$unwind": "$type" },

                // {
                //     "$group": {
                //         "_id": {
                //             "mood": "$mood",
                //         },
                //         "dateCreated": "$dateCreated",
                //         "count": { "$sum": 1 }
                //     }
                // },



                // {
                //     "$project": {
                //         "count": 1,
                //         "percentage": {
                //             "$concat": [{ "$substr": [{ "$multiply": [{ "$divide": ["$count", { "$literal": 3 }] }, 100] }, 0, 2] }, "", "%"]
                //         }
                //     }
                // }
            ];

            // If categoryId parameter exists
            if (this._categoryId) {
                // Add pipeline stage to start of aggregationPipeline array
                aggregationPipeline.unshift(
                    // Pipeline stage
                    // Match records where categories.0._id === this._categoryId parameter
                    {
                        $match: { "categories.0._id": { $eq: this._categoryId } }
                    }
                );
            };

            // Get records
            const encryptedRecords = await Entry.aggregate(
                aggregationPipeline
            );

            const getRecords = await evervault.decrypt(encryptedRecords);

            // Set counts variable
            let counts = {
                recordsCount: 0,
                highEnergyUnpleasantCount: 0,
                lowEnergyUnpleasantCount: 0,
                highEnergyPleasantCount: 0,
                lowEnergyPleasantCount: 0,
                copingActivityCounts: [],
                dateTimeCounts: []
            };

            // Get copingActivities
            let copingActivities = await Activities.find({ user: this._userId }).lean();
            //     [
            //         // Pipeline stage
            //         // Get records by userId
            //         {
            //             $match: { user: { $eq: userId } }
            //         },
            //     ]
            // );

            // Build counts.copingActivityCounts
            copingActivities.map(
                activity => {
                    counts.copingActivityCounts.push(
                        {
                            copingActivityId: activity._id.toString(),
                            copingActivityName: activity.name,
                            copingActivityType: activity.type, 
                            count: 0
                        }
                    )
                }
            );

            // Calculate mood counts & coping activity counts
            for (const record of getRecords) {
                // +1 to counts.recordsCount
                counts.recordsCount ++;

                // Calculate mood type counts
                if (record.mood === 'High Energy, Unpleasant') counts.highEnergyUnpleasantCount ++;
                if (record.mood === 'Low Energy, Unpleasant') counts.lowEnergyUnpleasantCount ++;
                if (record.mood === 'High Energy, Pleasant') counts.highEnergyPleasantCount ++;
                if (record.mood === 'Low Energy, Pleasant') counts.lowEnergyPleasantCount++;

                // Calculate copingActivity counts
                for (const activity of counts.copingActivityCounts) {
                    // If record.activities array is populated
                    if (record.activities.length > 0) {
                        // If record activity Id matches
                        // activity Id
                        if (record.activities[0]._id === activity.copingActivityId) {
                            // Update activity count
                            activity.count ++;
                        }

                        // Continue
                        continue;
                    };

                    // Continue
                    continue;
                };
                
                // Continue
                continue;
            };

            // Build array of mood counts
            // [HEU,LEU,HEP,LEP]
            const moodCounts =
                [counts.highEnergyUnpleasantCount, counts.lowEnergyUnpleasantCount,
                counts.highEnergyPleasantCount, counts.lowEnergyPleasantCount];

            // Calculate mood breakdown stats in %
            // [HEU,LEU,HEP,LEP]
            const moodStatsCalculated = percentRound(
                moodCounts
            );
            
            // Check that there is at least one mood count greater than 0
            let moodCountCheck = false;

            moodCounts.map(
                moodCount => {
                    if (moodCount > 0) moodCountCheck = true
                }
            );

            // Set highestMood to empty object
            let highestMood = {};
            
            // If moodCountCheck is true
            if (moodCountCheck === true) {
                // Get the index with the highest mood count
                let highestMoodIndex = moodCounts.indexOf(Math.max.apply(Math, moodCounts.map
                    (moodCount => moodCount))
                );

                if (highestMoodIndex === 0) highestMood = {
                    moodType: 'High Energy, Unpleasant',
                    stat: moodStatsCalculated[0].toFixed().toString() + "%"
                };

                if (highestMoodIndex === 1) highestMood = {
                    moodType: 'Low Energy, Unpleasant',
                    stat: moodStatsCalculated[1].toFixed().toString() + "%"
                };

                if (highestMoodIndex === 2) highestMood = {
                    moodType: 'High Energy, Pleasant',
                    stat: moodStatsCalculated[2].toFixed().toString() + "%"
                };

                if (highestMoodIndex === 3) highestMood = {
                    moodType: 'Low Energy, Pleasant',
                    stat: moodStatsCalculated[3].toFixed().toString() + "%"
                };
            }

            // Else, if moodCountCheck is false
            else {
                highestMood = {
                    moodType: "",
                    count: ""
                };
            };

            // // Build stats object
            let stats = {

                // Start and end time/date
                timePeriod: {
                    startDate: this._startDateTime,
                    endDate: this._endDateTime
                },

                // Category filter Id
                categoryFilterId: this._categoryId,

                // Mood stats
                moodStats: {
                    highestMood: highestMood,
                    highEnergyUnpleasant:
                        moodStatsCalculated[0].toFixed().toString() + "%",
                    lowEnergyUnpleasant:
                        moodStatsCalculated[1].toFixed().toString() + "%",
                    highEnergyPleasant:
                        moodStatsCalculated[2].toFixed().toString() + "%",
                    lowEnergyPleasant:
                        moodStatsCalculated[3].toFixed().toString() + "%"
                },

                // Coping stats array
                copingStats: counts.copingActivityCounts,

            };
            
            // Return the stats object
            return { success: true, user: this._userId, data: stats };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };
};
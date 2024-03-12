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
 * @description Create an instance of the JournalService class.
 */
module.exports = class JournalService {
    /**
     * Represents the AuraService instance constructor.
     * @constructor
     */
    constructor() {
        /** Sets the only accepted mood types for the JournalService.
         * As an array of moodType objects.
         */
        this.moodTypes = [
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
     * @desc                                       Create a journal entry method.
     * @param {string}    userId                   String containing user ID.
     * @param {string}    entryMood                String containing journal entry mood.
     * @param {string}    entryEmotion             String containing journal entry text.
     * @param {array}     entryCategories          Array containing journal entry categories. Can be null.
     * @param {array}     entryActivities          Array containing journal entry activities. Can be null.
     * @param {string}    entryText                String containing journal entry text.
     * @param {string}    linkedEntry              String containing the linkedEntry ID. Only allowed for unpleasant mood type. Can be null.
     * @return                                     Object containing response.
     */
    async createEntry(userId, entryMood, entryEmotion, entryCategories, entryActivities, entryText, linkedEntry) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Add journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check entryMood parameter exists
            if (!entryMood) {
                throw new Error(`Add journal entry failed - entryMood parameter empty. Must be supplied. ${userId}`);
            };

            // Check entryEmotion parameter exists
            if (!entryEmotion) {
                throw new Error(`Add journal entry failed - entryEmotion parameter empty. Must be supplied. ${userId}`);
            };

            // Check entryText parameter exists
            if (!entryText) {
                throw new Error(`Add journal entry failed - entryText parameter empty. Must be supplied. ${userId}`);
            };

            // If linkedEntry parameter exists and entry mood parameter is unpleasant
            // Throw error
            if (linkedEntry && entryMood.includes('Pleasant')) {
                throw new Error(`Add journal entry failed - cannot link an entry when current entry mood type is pleasant. ${userId}`);
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if specified user ID exists in the DB
            const check = await User.countDocuments({ auth0UserId: userId });

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
                newEntry.user = userId; 
                newEntry.mood = await evervault.encrypt(entryMood);
                newEntry.emotion = await evervault.encrypt(entryEmotion);

                // Only add categories array if categories present
                if (entryCategories) newEntry.categories = entryCategories;

                // Only add activities arrary if activities present
                if (entryActivities) newEntry.activities = entryActivities;

                // Add journal details to newEntry object
                newEntry.text = await evervault.encrypt(entryText);

                // Only add linkedEntry if linkedEntry present
                if (linkedEntry) newEntry.linkedEntry = linkedEntry;

                // Add journal entry to the database
                let entry = new Entry(newEntry);
                await entry.save();
                
                // Emit journalCreated event
                journalServiceEvents.emit('journalEntryCreated');

                // Log success
                logger.info(`New journal entry created successfully for user ${userId}`);

                // Set response
                success = true;
                authorise = true;
                (msg = 'New journal entry created successfully'),
                    (data = {
                    _id: entry._id,
                    user: userId,
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
     * @desc                                         Edit a journal entry method.
     * @param {string}   userId                      String containing user ID.
     * @param {string}   journalId                   String containing journal ID.
     * @param {string}   entryMood                   String containing journal entry mood. Can be null.
     * @param {string}   entyEmotion                 String containing journal entry mood. Can be null.
     * @param {array}    entryCategories             Array containing journal entry categories. Can be null.
     * @param {array}    entryActivities             Array containing journal entry activities. Can be null.
     * @param {string}   entryText                   String containing journal entry text. Can be null.
     * @param {string}   linkedEntry                 String containing the linkedEntry ID. Only allowed for unpleasant mood type. Can be null.
     * @return                                       Object containing response. If authorisation fails includes authorise: false.
     */
    async editEntry(userId, journalId, entryMood, entryEmotion, entryCategories, entryActivities, entryText, linkedEntry) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Edit journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error(`Edit journal entry failed - journalId parameter empty. Must be supplied. ${userId}`);
            };

            // If linkedEntry exists and entryMood does not exists
            // Throw error
            if (linkedEntry && !entryMood) {
                throw new Error(`Add journal entry failed - cannot link an entry when current entry mood type parameter is empty. ${userId}`);
            }

            // If linkedEntry parameter exists and entry mood parameter is pleasant
            // Throw error
            if (linkedEntry && entryMood.includes('Pleasant')) {
                throw new Error(`Add journal entry failed - cannot link an entry when current entry mood type is pleasant. ${userId}`);
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
                        { _id: journalId },
                        { user: userId }
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
                if (entryMood) updatedEntry.mood = await evervault.encrypt(entryMood);
                if (entryEmotion) updatedEntry.emotion = await evervault.encrypt(entryEmotion);
                if (entryCategories) updatedEntry.categories = entryCategories;
                if (entryActivities) updatedEntry.activities = entryActivities;
                if (entryText) updatedEntry.text = await evervault.encrypt(entryText);

                if (linkedEntry) updatedEntry.linkedEntry = linkedEntry;

                // Populate the dateUpdated field of the journal entry
                updatedEntry.dateUpdated = Date.now();

                // Save to the database
                await Entry.findOneAndUpdate(
                    {
                        $and: [
                            { _id: journalId },
                            { user: userId }
                        ]
                    },
                    { $set: updatedEntry },
                    { new: true }
                );

                // Emit journalUpdated event
                journalServiceEvents.emit('journalEntryUpdated');

                // Log success
                logger.info(`Journal entry edited successfully for user ${userId}`);

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully updated with ID ${journalId}`;
                data = {
                    user: userId,
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
     * @desc                         Delete a journal entry method.
     * @param {string} userId        String containing user ID.
     * @param {string} journalId     String containing journal ID.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async deleteEntry(userId, journalId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Delete journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error(`Delete journal entry failed - journalId parameter empty. Must be supplied. ${userId}`);
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
                        { _id: journalId },
                        { user: userId }
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
                            { _id: journalId },
                            { user: userId }
                        ]
                    }
                );

                // Emit journalDeleted event
                journalServiceEvents.emit('journalEntryDeleted');

                // Log success
                logger.info(`Journal entry deleted successfully for user ${userId}`);

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully deleted with ID ${journalId}`;
            };

            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg,
                user: userId
            };

            // Return response object
            return response;
            
        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * @desc                                                    Get all journal entries method
     * @param {string}                         userId           String containing user ID
     * @param {"2021-01-01T00:00:00.000Z"}     startDateTime    A start dateTime. Must be an ISO 8601 string in Zulu time (optional)
     * @param {"2022-01-01T00:00:00.000Z"}     endDateTime      An end dateTime. Must be an ISO 8601 string in Zulu time (optional, must be included with startDateTime)
     * @param {string}                         categoryId       A categoryId, for filtering. Optional
     * @return                                                  Object containing response. If authorisation fails includes authorise: false
     */
    async getAllEntries(userId, startDateTime, endDateTime, categoryId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get all journal entries failed - userId parameter empty. Must be supplied');
            };

            // If startDateTime parameter exists and endDateTime parameter doesn't exist
            if (startDateTime && !endDateTime) {
                throw new Error(`Get all journal entries failed - endDateTime parameter empty. Must be supplied with startDateTime parameter. ${userId}`);
            };

            // If startDateTime & endDateTime parameters exists
            if (startDateTime && endDateTime) {
                // Check startDateTime and endDateTime is ISO 8601 formatted
                if (!checkIsoDate(startDateTime)) {
                    throw new Error(`Get all journal entries failed - startDateTime parameter must be an ISO 8601 string in Zulu time. ${userId}`);
                };

                if (!checkIsoDate(endDateTime)) {
                    throw new Error(`Get all journal entries failed - endDateTime parameter must be an ISO 8601 string in Zulu time. ${userId}`);
                };
            };

            // If the categoryId parameter has been provided
            // Check it exists in the database
            if (categoryId) {
                const checkCategory = await Categories.find({ _id: categoryId }).lean();

                if (checkCategory.length === 0) {
                    throw new Error(`Get all journal entries failed - specified categoryId not found. ${userId}`);
                };
            };

            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the user exists
            let check = await User.countDocuments({ auth0UserId: userId });

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
                        $match: { user: { $eq: userId } }
                    }
                ];

                // Conditional aggregation pipeline stages
                // Category filter (add to start of stages array)
                if (categoryId) {
                    stages.unshift(
                        {
                            $match: { "categories.0._id": { $eq: categoryId } }
                        }
                    )
                };
                // startDateTime & endDateTime filter (add to end of stages array)
                if (startDateTime && endDateTime) {
                    stages.push(
                        {
                            $match: { dateCreated: { $gte: new Date(startDateTime), $lt: new Date(endDateTime) } }
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
                logger.info(`Journal entries retrieved successfully for user ${userId}`);
                
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
                user: userId
            };

            // Return response object
            return response;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

        /**
     * @desc                         Delete all journal entries method.
     * @param {string} userId        String containing user ID.
     * @return                       Object containing response.
     */
    async deleteAllEntries(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Delete journal entry failed - userId parameter empty. Must be supplied');
            };

            // Delete all journal entries for the specified user from the database
            await Entry.deleteMany(
                {
                    user: userId
                }
            );

            // Log success
            logger.info(`All journal entries deleted successfully for user ${userId}`);

            // Build response
            const response = {
                success: true,
                msg: `All journal entries delete successfully`,
                user: userId
            };

            // Return response object
            return response;
            
        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * @desc                         Get single journal entry method.
     * @param {string} userId        String containing user ID.
     * @param {string} journalId     String containing journal ID.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async getEntry(userId, journalId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error(`Get journal entry failed - journalId parameter empty. Must be supplied. ${userId}`);
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
                        { _id: journalId },
                        { user: userId }
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
                            { _id: journalId },
                            { user: userId }
                        ]
                    }
                );

                // Log success
                logger.info(`Entry retrieved successfully for user ${userId}`);

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
     * @desc                         Get the most recent journal entry for the specified user.
     * @param {string}     userId    String containing user ID.
     * @return                       Returns array with the most recent journal entry. If no entries, will be an empty array.
     */
    async getMostRecentEntry(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get most recent journal entry failed - userId parameter empty. Must be supplied');
            };

            // Get most recent journal entry
            let mostRecentEntry = await Entry
                .find({ user: userId })
                .limit(1)
                .sort({ dateCreated: -1 });
            
            // Decrypt most recent journal entry
            const decryptedEntry = await evervault.decrypt(mostRecentEntry);
            
            // Decrypt each journal entry field
            // if (mostRecentEntry.mood) mostRecentEntry.mood =
            //     await evervault.decrypt(mostRecentEntry.mood);
            // if (mostRecentEntry.emotion) mostRecentEntry.emotion =
            //     await evervault.decrypt(mostRecentEntry.emotion);
            // if (mostRecentEntry.text) mostRecentEntry.text =
            //     await evervault.decrypt(mostRecentEntry.text);
            
            // If mostRecentEntry is an empty array add an object with the user property
            if (mostRecentEntry.length === 0) mostRecentEntry = [{ user: userId }];
            
            // Log success
            logger.info(`Most recent entry retrieved successfully for user ${userId}`);

            return mostRecentEntry;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * @desc                                      Get the closest matching journal entry for the specified user to the specified entry.
     * @param {string} userId                     String containing user ID.
     * @param {string}  journalId                 String containing journal ID.
     * @return                                    Returns array with closest matched journal entry. If no match, array will be empty.
     */
    async getClosestEntry(userId, journalId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get closest journal entry failed - userId parameter empty. Must be supplied');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error(`Get closest journal entry failed - journalId parameter empty. Must be supplied. ${userId}`);
            };

            // Get entry for checking
            // Check if the journal entry exists in the database
            // Check against userId, journalId
            const fetchEntry = await Entry.findOne(
                {
                    $and: [
                        { _id: journalId },
                        { user: userId }
                    ]
                }
            );

            // If journal entry not found
            if (!fetchEntry) {
                throw new Error(`Get closest journal entry failed - journal entry not found. ${userId}`);
            };

            const checkEntry = await evervault.decrypt(fetchEntry);

            // // Decrypt checkEntry fields
            // checkEntry.mood = await evervault.decrypt(checkEntry.mood);
            // checkEntry.emotion = await evervault.decrypt(checkEntry.emotion);
            // checkEntry.text = await evervault.decrypt(checkEntry.text);
            
            /* Fetch all entries for the current user 
            where dateCreated is before check dateCreated */
            const entries = await Entry.find(
                { user: userId, dateCreated: { $lt: checkEntry.dateCreated } }).lean();

            // If journal entry not found
            if (!entries) {
                throw new Error(`Get closest journal entry failed - journal entries not found. ${userId}`);
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
                    if (entry._id.toString() === journalId) continue;

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
            logger.info(`Closest matching entry retrieved successfully for user ${userId}`);

            // Add userId to closestEntry object
            closestEntry.user = userId;
            
            // Return data
            return { data: closestEntry, user: userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * @desc                                                                 Get stats on journalling between a start dateTime and end dateTime
     * @param {string}                         userId                        String containing user ID
     * @param {"2021-08-27T00:00:00.000Z"}     startDateTime                 A start dateTime. Must be an ISO 8601 string in Zulu time
     * @param {"2021-08-27T00:00:00.000Z"}     endDateTime                   An end dateTime. Must be an ISO 8601 string in Zulu time
     * @param {string}                         categoryId                    A category Id, for filtering stats. Optional
     * @return                                                               Returns object with stats
     */
    async getStats(userId, startDateTime, endDateTime, categoryId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get stats failed - userId parameter empty. Must be supplied');
            };

            // Check startDateTime parameter exists
            if (!startDateTime) {
                throw new Error(`Get stats failed - startDateTime parameter empty. Must be supplied. ${userId}`);
            };

            // Check endDateTime parameter exists
            if (!endDateTime) {
                throw new Error(`Get stats failed - endDateTime parameter empty. Must be supplied. ${userId}`);
            };

            // Check startDateTime and endDateTime is ISO 8601 formatted
            if (!checkIsoDate(startDateTime)) {
                throw new Error(`Get stats failed - startDateTime parameter must be an ISO 8601 string in Zulu time. ${userId}`);
            };

            if (!checkIsoDate(endDateTime)) {
                throw new Error(`Get stats failed - endDateTime parameter must be an ISO 8601 string in Zulu time. ${userId}`);
            };

            // If the categoryId parameter has been provided
            // Check it exists in the database
            if (categoryId) {
                const checkCategory = await Categories.find({ _id: categoryId }).lean();

                if (checkCategory.length === 0) {
                    throw new Error(`Get stats failed - specified categoryId not found. ${userId}`);
                };
            };

            // Build MongoDB aggregation pipeline query
            let aggregationPipeline = [
                // Pipeline stage
                // Get records by userId and between startDateTime & endDateTime
                {
                    $match: {
                        $and: [
                            { user: { $eq: userId } },
                            { dateCreated: { $gte: new Date(startDateTime), $lt: new Date(endDateTime) } },
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
            if (categoryId) {
                // Add pipeline stage to start of aggregationPipeline array
                aggregationPipeline.unshift(
                    // Pipeline stage
                    // Match records where categories.0._id === categoryId parameter
                    {
                        $match: { "categories.0._id": { $eq: categoryId } }
                    }
                );
            };

            // Get records
            const getRecords = await Entry.aggregate(
                aggregationPipeline
            );

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
            let copingActivities = await Activities.find({ user: userId }).lean();
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
                    moodType: '',
                    count: ''
                };
            };

            // // Build stats object
            let stats = {

                // Start and end time/date
                timePeriod: {
                    startDate: startDateTime,
                    endDate: endDateTime
                },

                // Category filter Id
                categoryFilterId: categoryId,

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
            return { success: true, data: stats, user: userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };
};
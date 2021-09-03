// Import logger
const logger = require('../loaders/logger');

// Model imports
const User = require('../models/User');
const Entry = require('../models/Entry');

// Events
const EventEmitter = require('events').EventEmitter;
const journalServiceEvents = new EventEmitter;

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
                newEntry.mood = entryMood;
                newEntry.emotion = entryEmotion;

                // Only add categories array if categories present
                if (entryCategories) newEntry.categories = entryCategories;

                // Only add activities arrary if activities present
                if (entryActivities) newEntry.activities = entryActivities;

                // Add journal details to newEntry object
                newEntry.text = entryText;

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
                if (entryMood) updatedEntry.mood = entryMood;
                if (entryEmotion) updatedEntry.emotion = entryEmotion;
                if (entryCategories) updatedEntry.categories = entryCategories;
                if (entryActivities) updatedEntry.activities = entryActivities;
                if (entryText) updatedEntry.text = entryText;
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
     * @desc                         Get all journal entries method.
     * @param {string} userId        String containing user ID.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async getAllEntries(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get all journal entries failed - userId parameter empty. Must be supplied');
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
                // Get all entries in the Entry collection against userId
                // Sort by newest first. +1 instead of -1 would be oldest first
                const entries = await Entry
                    .find({ user: userId })
                    .sort({ date: -1, });
                
                // Emit journalEntriesFetched event
                journalServiceEvents.emit('journalEntriesFetched');

                // Log success
                logger.info(`All entries retrieved successfully for user ${userId}`);
                
                // Set response
                success = true;
                authorise = true;
                msg = 'All journal entries for requested user';
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

                // Emit journalEntryFetched event
                journalServiceEvents.emit('journalEntryFetched');

                // Log success
                logger.info(`Entry retrieved successfully for user ${userId}`);

                // Set response
                success = true;
                authorise = true;
                msg = 'Journal entry found'
                data = entry;
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
            const checkEntry = await Entry.findOne(
                {
                    $and: [
                        { _id: journalId },
                        { user: userId }
                    ]
                }
            );

            // If journal entry not found
            if (!checkEntry) {
                throw new Error(`Get closest journal entry failed - journal entry not found. ${userId}`);
            };

            // Get closestEntry to checkEntry
            // Mood, emotion, categories, activities. Priority high to low
            // Get the newest match
            const closestEntry = await Entry.aggregate(
                [
                    // Pipeline stage 1
                    // Get records from the Entry model
                    // That have the same mood as checkEntry
                    {
                        $match: {
                            // $text: {
                            //     $search: "unpleasant"
                            // }
                            $and: [
                                { user: { $eq: userId } },
                                { mood: { $eq: checkEntry.mood } },
                                { linkedEntry: { $exists: true } }
                            ],
                            // $or: [
                            //     { "emotion": { $eq: checkEntry.emotion } },
                            //     { "categories": { $eq: checkEntry.categories } },
                            //     { "activities": { $eq: checkEntry.activities } },
                            // ]
                        }
                    },

                    // Pipeline stage 2
                    // Add field to each record named rank
                    // Where the the current record and checkEntry field are equal
                    // Add to the rank for the current record
                    {
                        $addFields: {
                            rank: {
                                $sum: [
                                    { $cond: [{ $eq: ["$mood", checkEntry.mood] }, 4, 0] },
                                    { $cond: [{ $eq: ["$emotion", checkEntry.emotion] }, 3, 0] },
                                    { $cond: [{ $eq: ["$categories", checkEntry.categories] }, 2, 0] },
                                    { $cond: [{ $eq: ["$activities", checkEntry.activities] }, 1, 0] }
                                ]
                            }
                        }
                    },

                    // Pipeline stage 3
                    // Match all records in the pipeline that have a rank greater than 0
                    { $match: { rank: { $gt: 0 } } },

                    // Pipeline stage 4
                    // Match all records that don't have the same ID as checkEntry.id
                    { $match: { _id: { $ne: checkEntry._id } } },

                    // Pipeline stage 5
                    // Sort the records highest to lowest rank and newest to oldest
                    { $sort: { rank: -1, dateCreated: -1 } },

                    // Pipeline stage 6
                    // Return only the first record
                    { $limit: 1 }
                ]
            );

            // // If closestEntry doesn't have any results, throw error.
            // if (closestEntry.length === 0) {
            //     throw new Error('Get closest journal entry failed - no results found.');
            // }

            // Log success
            logger.info(`Closest matching entry retrieved successfully for user ${userId}`);

            // Add userId to closestEntry object
            closestEntry.user = userId;
            
            // Return data
            return {data: closestEntry, user: userId};

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * @desc                                                                 Get stats between a start dateTime and end dateTime
     * @param {string}                         userId                        String containing user ID
     * @param {"2021-08-27T00:00:00.000Z"}     startDateTime                 A start dateTime. Must be an ISO 8601 string in Zulu time
     * @param {"2021-08-27T00:00:00.000Z"}     endDateTime                   An end dateTime. Must be an ISO 8601 string in Zulu time
     * @param {"year"}                         datesTimesFormat              A format for datesTimes. Defaults to year Optional
     * @param {string}                         categoryId                    A category Id, for filtering stats. Optional
     * @return                                                               Returns object with stats
     */
    async getStats(userId, startDateTime, endDateTime, datesTimesFormat, categoryId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get stats failed - userId parameter empty. Must be supplied');
            };

            // Check startDateTime parameter exists
            if (!startDateTime) {
                throw new Error('Get stats failed - startDateTime parameter empty. Must be supplied');
            };

            // Check endDateTime parameter exists
            if (!endDateTime) {
                throw new Error('Get stats failed - endDateTime parameter empty. Must be supplied');
            };

            // Check startDateTime and endDateTime is ISO 8601 formatted
            // See here: https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
            function isIsoDate(str) {
                if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
                var d = new Date(str);
                return d.toISOString() === str;
            };

            if (!isIsoDate(startDateTime)) {
                throw new Error('Get stats failed - startDateTime parameter must be an ISO 8601 string in Zulu time');
            };

            if (!isIsoDate(endDateTime)) {
                throw new Error('Get stats failed - endDateTime parameter must be an ISO 8601 string in Zulu time');
            };

            // Set datesTimesFormatOptions
            const datesTimesFormatOptions = ['year', 'month', 'week', 'day'];

            // Check datesTimesFormat option is correct
            if (datesTimesFormat) {
                if (!datesTimesFormatOptions.includes(datesTimesFormat)) {
                    throw new Error('Get stats failed - datesTimesFormat option does not exist');
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

            for (const record of getRecords) {
                console.log(record);
                // +1 to counts.recordsCount
                counts.recordsCount ++;

                // Update mood type count
                if (record.mood === 'High Energy, Unpleasant') counts.highEnergyUnpleasantCount ++;
                if (record.mood === 'Low Energy, Unpleasant') counts.lowEnergyUnpleasantCount ++;
                if (record.mood === 'High Energy, Pleasant') counts.highEnergyPleasantCount ++;
                if (record.mood === 'Low Energy, Pleasant') counts.lowEnergyPleasantCount ++;
            };

            // // Build stats object
            let stats = {

                // Start and end time/date
                timePeriod: {
                    startDate: startDateTime,
                    endDate: endDateTime
                },

                // Mood stats
                moodStats: {
                    highEnergyUnpleasant:
                        ((counts.highEnergyUnpleasantCount / counts.recordsCount) * 100).toFixed(1).toString() + "%",
                    lowEnergyUnpleasant:
                        ((counts.lowEnergyUnpleasantCount / counts.recordsCount) * 100).toFixed(1).toString() + "%",
                    highEnergyPleasant:
                        ((counts.highEnergyPleasantCount / counts.recordsCount) * 100).toFixed(1).toString() + "%",
                    lowEnergyPleasant:
                        ((counts.lowEnergyPleasantCount / counts.recordsCount) * 100).toFixed(1).toString() + "%"
                },

                // Coping stats array
                copingStats: [],

                // Dates entries exist array
                dateTimes: []
            };
            
            // // Return the stats object
            return stats;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };
};
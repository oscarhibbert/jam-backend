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
     * Represents the AcornService instance constructor.
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
     * @desc                                 Create a journal entry method.
     * @param {string}    userId             String containing user ID.
     * @param {string}    entryMood          String containing journal entry mood.
     * @param {string}    entryEmotion       String containing journal entry text.
     * @param {array}     entryActivities    Array containing journal entry activities. Can be null.
     * @param {array}     entryTags          Array containing journal entry tags. Can be null.
     * @param {string}    entryText          String containing journal entry text.
     * @param {string}    linkedEntry        String containing the linkedEntry ID. Only allowed for unpleasant mood type. Can be null.
     * @return                               Object containing response.
     */
    async createEntry(userId, entryMood, entryEmotion, entryActivities, entryTags, entryText, linkedEntry) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Add journal entry failed - userId parameter empty. Must be supplied.');
            };

            // Check entryMood parameter exists
            if (!entryMood) {
                throw new Error('Add journal entry failed - entryMood parameter empty. Must be supplied.');
            };

            // Check entryEmotion parameter exists
            if (!entryEmotion) {
                throw new Error('Add journal entry failed - entryEmotion parameter empty. Must be supplied.');
            };

            // Check entryText parameter exists
            if (!entryText) {
                throw new Error('Add journal entry failed - entryText parameter empty. Must be supplied.');
            };

            // If linkedEntry exists and entry mood is pleasant
            // Throw error
            if (linkedEntry && entryMood.includes('Pleasant')) {
                throw new Error('Add journal entry failed - cannot link an entry when current entry mood type is pleasant.');
            };

            // Fetch the linkedEntry if it's provided - can only be an entry with a pleasant mood
            if (linkedEntry) {
                // Fetch the linkedEntry from the DB
                const fetchLinkedEntry = await Entry.findById(linkedEntry);

                 // If the linkedEntry mood type contains unpleasant throw an error
                if (fetchLinkedEntry.mood.includes('Unpleasant')) {
                    throw new Error('Add journal entry failed - cannot link an entry when linked entry mood type is unpleasant.')
                };
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
                newEntry.text = entryText;

                // Only add activities object if activities present
                if (entryActivities) newEntry.activities = entryActivities;

                // Only add tags object if tags present
                if (entryTags) newEntry.tags = entryTags;

                // Only add linkedEntry if linkedEntry present
                if (linkedEntry) newEntry.linkedEntry = linkedEntry;

                // Add journal entry to the database
                let entry = new Entry(newEntry);
                await entry.save();

                // Emit journalCreated event
                journalServiceEvents.emit('journalEntryCreated');

                // Set response
                success = true;
                authorise = true;
                (msg = 'New journal entry created successfully'),
                    (data = {
                    mood: newEntry.mood,
                    emotion: newEntry.emotion,
                    activities: newEntry.activities,
                    tags: newEntry.tags,
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
            throw err;
        };
    };

    /**
     * @desc                                   Edit a journal entry method.
     * @param {string}   userId                String containing user ID.
     * @param {string}   journalId             String containing journal ID.
     * @param {string}   entryMood             String containing journal entry mood. Can be null.
     * @param {string}   entyEmotion           String containing journal entry mood. Can be null.
     * @param {array}    entryActivities       Array containing journal entry activities. Can be null.
     * @param {array}    entryTags             Array containing journal entry tags. Can be null.
     * @param {string}   entryText             String containing journal entry text. Can be null.
     * @param {string}    linkedEntry        String containing the linkedEntry ID. Only allowed for unpleasant mood type. Can be null.
     * @return                                 Object containing response. If authorisation fails includes authorise: false.
     */
    async editEntry(userId, journalId, entryMood, entryEmotion, entryActivities, entryTags, entryText, linkedEntry) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Edit journal entry failed - userId parameter empty. Must be supplied.');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error('Edit journal entry failed - journalId parameter empty. Must be supplied.');
            };

            // Check the original entry
            const originalEntry = await Entry.findById(journalId);

            // If linkedEntry exists and entry mood is pleasant
            // Throw error
            if (linkedEntry && originalEntry.mood.includes('Pleasant')) {
                throw new Error('Add journal entry failed - cannot link an entry when current entry mood type is pleasant.');
            };

            // Fetch the linkedEntry if it's provided - can only be an entry with a pleasant mood
            if (linkedEntry) {
                // Fetch the linkedEntry from the DB
                const fetchLinkedEntry = await Entry.findById(linkedEntry);

                 // If the linkedEntry mood type contains unpleasant throw an error
                if (fetchLinkedEntry.mood.includes('Unpleasant')) {
                    throw new Error('Add journal entry failed - cannot link an entry when linked entry mood type is unpleasant.')
                };
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
                if (entryActivities) updatedEntry.activities = entryActivities;
                if (entryTags) updatedEntry.tags = entryTags;
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

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully updated with ID ${journalId}`;
                data = {
                    mood: updatedEntry.mood,
                    emotion: updatedEntry.emotion,
                    activities: updatedEntry.activities,
                    tags: updatedEntry.tags,
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
                throw new Error('Delete journal entry failed - userId parameter empty. Must be supplied.');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error('Delete journal entry failed - journalId parameter empty. Must be supplied.');
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

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully deleted with ID ${journalId}`;
            };

            // Build response
            response = {
                success: success,
                authorise: authorise,
                msg: msg
            };

            // Return response object
            return response;
            
        } catch (err) {
            console.error(err.message);
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
                throw new Error('Get all journal entries failed - userId parameter empty. Must be supplied.');
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
                data: data
            };

            // Return response object
            return response;

        } catch (err) {
            console.error(err.message);
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
                throw new Error('Get journal entry failed - userId parameter empty. Must be supplied.');
            };

            // Check journalId parameter exists
            if (!journalId) {
                throw new Error('Get journal entry failed - journalId parameter empty. Must be supplied.');
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
            console.error(err.message);
            throw err;
        };
    };
};
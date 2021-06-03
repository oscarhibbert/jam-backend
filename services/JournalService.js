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
     * @desc                         Create a journal entry method.
     * @param {string} userID        String containing user ID.
     * @param {string} entryText     String containing journal entry text.
     * @param {string} entryMood     String containing journal entry mood.
     * @param {Object[]} entryTags   Array containing journal entry tags.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async createEntry(userID, entryText, entryMood, entryTags) {
        try {
            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if user ID exists
            const check = await User.countDocuments({ auth0UserId: userID });

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
              newEntry.user = userID;
              newEntry.text = entryText;
              newEntry.mood = entryMood;

              // Only add tags object if tags present
              if (entryTags) newEntry.tags = entryTags;

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
                  text: newEntry.text,
                  mood: newEntry.mood,
                  tags: newEntry.tags
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
            console.error(err.message);
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };

    /**
     * @desc                         Update a journal entry method.
     * @param {string} userID        String containing user ID.
     * @param {string} journalID     String containing journal ID.
     * @param {string} entryText     String containing journal entry text.
     * @param {string} entryMood     String containing journal entry mood.
     * @param {Object[]} entryTags   Array containing journal entry tags.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async updateEntry(userID, journalID, entryText, entryMood, entryTags) {
        try {
            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the journal entry exists in the database
            // Checks against userID, journalID
            let check = await Entry.countDocuments(
                {
                    $and: [
                        { _id: journalID },
                        { user: userID }
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
                if (entryText) updatedEntry.text = entryText;
                if (entryMood) updatedEntry.mood = entryMood;
                if (entryTags) updatedEntry.tags = entryTags;

                // Populate the dateUpdated field of the journal entry
                updatedEntry.dateUpdated = Date.now();

                // Save to the database
                await Entry.findOneAndUpdate(
                    {
                        $and: [
                            { _id: journalID },
                            { user: userID }
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
                msg = `Journal entry successfully updated with ID ${journalID}`;
                data = {
                    text: updatedEntry.text,
                    mood: updatedEntry.mood,
                    tags: updatedEntry.tags
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
            console.error(err.message);
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };

    /**
     * @desc                         Delete a journal entry method.
     * @param {string} userID        String containing user ID.
     * @param {string} journalID     String containing journal ID.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async deleteEntry(userID, journalID) {
        try {
            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;

            // Check if the journal entry exists in the database
            // Checks against userID, journalID
            let check = await Entry.countDocuments(
                {
                    $and: [
                        { _id: journalID },
                        { user: userID }
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
                            { _id: journalID },
                            { user: userID }
                        ]
                    }
                );

                // Emit journalDeleted event
                journalServiceEvents.emit('journalEntryDeleted');

                // Set response
                success = true;
                authorise = true;
                msg = `Journal entry successfully deleted with ID ${journalID}`;
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
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };

    /**
     * @desc                         Get all journal entries method.
     * @param {string} userID        String containing user ID.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async getAllEntries(userID) {
        try {
            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the user exists
            let check = await User.countDocuments({ _id: userID });

            // If the user is not found
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'Journal entries not found';
            }

            // Else, continue
            else {
                // Get all entries in the Entry collection against userID
                // Sort by newest first. +1 instead of -1 would be oldest first
                const entries = await Entry
                    .find({ user: userID })
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
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };

    /**
     * @desc                         Get single journal entry method.
     * @param {string} userID        String containing user ID.
     * @param {string} journalID     String containing journal ID.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async getEntry(userID, journalID) {
        try {
            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if the journal entry exists in the database
            // Check against userID, journalID
            let check = await Entry.countDocuments(
                {
                    $and: [
                        { _id: journalID },
                        { user: userID }
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
                            { _id: journalID },
                            { user: userID }
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
            return {
                success: false,
                msg: 'Server Error'
            };
        };
    };
};
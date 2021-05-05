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
     * @desc                         Create a journal entry.
     * @param {string} userID        String containing user ID.
     * @param {Object} journalEntry  Object containing the journal entry.
     * @return                       Object containing response. If authorisation fails includes authorise: false.
     */
    async createEntry(userID, journalEntry) {
        try {
            // Create response obj
            let response;
            let authorise;
            let success;
            let msg;
            let data;

            // Check if user ID exists
            const check = await User.countDocuments({ _id: userID });
            if (check !== 1) {
                success = false;
                authorise = false;
                msg = 'User not found';
            }

            // Else, continue
            else {
              // Destructure journalEntry
              const { text, mood, tags } = journalEntry;

              // Create newEntry object
              const newEntry = {};

              // Add journal details to newEntry object
              newEntry.user = userID;
              newEntry.text = text;
              newEntry.mood = mood;

              // Only add tags object if tags present
              if (tags) newEntry.tags = tags;

              // Add journal entry to the database
              let entry = new Entry(newEntry);
              await entry.save();

              // Emit userCreated event
              journalServiceEvents.emit('journalEntryCreated');

              // Set response
              success = true;
              authorise = true;
              (msg = 'New journal entry created successfully'),
                (data = {
                  text: newEntry.text,
                  mood: newEntry.mood,
                  tags: newEntry.tags,
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

};
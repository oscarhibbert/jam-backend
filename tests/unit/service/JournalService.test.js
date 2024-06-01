// Journal Service Unit Tests

// Imports
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


// Mock imports
const JournalService = require('../../../services/JournalService');
const logger = require('../../../loaders/logger');
const evervault = require('../../../loaders/evervault');
const User = require('../../../models/User');
const Entry = require('../../../models/Entry');
const Categories = require('../../../models/Categories');
const Activities = require('../../../models/Activities');
const { JsonWebTokenError } = require('jsonwebtoken');

// Fetch test data


// Function to drop all database collections
async function clearDatabase() {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Tests
describe('JournalService', () => {
    // Test resets
    beforeEach(async () => {
        // Clear fs mock override before each test
        jest.resetModules();

        // Ensure a clean database before each test
        await clearDatabase();
    });

    afterEach(() => {
        // Resets all mocks before each test
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test('Journal Service constructor sets properties correctly', () => {
        const params = {
            userId: '123',
            journalId: '456',
            entryMood: 'Low Energy, Pleasant',
            entryCategories: [
                { "category": "Home 🏠" }
            ],
            entryText: 'This is a journal entry.',
            startDateTime: '2024-03-14T00:00:00Z',
        };

        const service = new JournalService(params);

        expect(service._userId).toBe('123');
        expect(service._journalId).toBe('456');
        expect(service._entryMood).toBe('Low Energy, Pleasant');
        expect(service._entryCategories).toEqual(
            [
                { "category": "Home 🏠" }
            ]
        );
        expect(service._entryText).toBe('This is a journal entry.');
        expect(service._startDateTime).toBe('2024-03-14T00:00:00Z');
        expect(service._moodTypes).toEqual([
            { moodType: 'High Energy, Unpleasant' },
            { moodType: 'Low Energy, Unpleasant' },
            { moodType: 'High Energy, Pleasant' },
            { moodType: 'Low Energy, Pleasant' },
        ]);
    });

    describe('createEntry', () => {
        test('createEntry creates a new entry successfully', async () => {
            // Mock Evervault encryption
            const mockEvervault = { encrypt: jest.fn().mockResolvedValue('encryptedValue') };

            // Mock User.countDocuments() directly
            User.countDocuments = jest.fn().mockReturnValue(1);

            // Set spies
            jest.spyOn(evervault, 'encrypt').mockImplementation(mockEvervault.encrypt);

            // Instantiate the Journal Service
            const service = new JournalService({
                userId: '12345',
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryText: 'This is a positive journal entry.',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
            });

            // Run the createEntry method
            const response = await service.createEntry();

            // Assert createEntry returned value contains correct key value pairs
            expect(response).toMatchObject({
                success: true,
                authorise: true,
                msg: 'New journal entry created successfully',
                data: {
                    user: '12345',
                    mood: 'encryptedValue',
                    emotion: 'encryptedValue',
                    categories: [{ name: 'Category 1' }],
                    activities: [{ name: 'Activity 1' }],
                    text: 'encryptedValue',
                },
            });
        });

        test('createEntry throws an error when userId is missing', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // Omitting userId to simulate the missing parameter scenario
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryText: 'This is a test journal entry.',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
            });

            // Assertion
            await expect(service.createEntry()).rejects.toThrow(
                'Add journal entry failed - userId parameter empty. Must be supplied.');
        });

        test('createEntry throws an error when entryMood is missing', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // Omitting entryMood to simulate the missing parameter scenario
                userId: '12345',
                entryEmotion: 'Relaxed',
                entryText: 'This is a test journal entry.',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
            });

            // Assertion
            await expect(service.createEntry()).rejects.toThrow(
                'Add journal entry failed - entryMood parameter empty. Must be supplied.');
        });

        test('createEntry throws an error when entryEmotion is missing', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // Omitting entryEmotion to simulate the missing parameter scenario
                userId: '12345',
                entryMood: 'Low Energy, Pleasant',
                entryText: 'This is a test journal entry.',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
            });

            // Assertion
            await expect(service.createEntry()).rejects.toThrow(
                'Add journal entry failed - entryEmotion parameter empty. Must be supplied.');
        });

        test('createEntry throws an error when entryText is missing', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // Omitting entryText to simulate the missing parameter scenario
                userId: '12345',
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
            });

            // Assertion
            await expect(service.createEntry()).rejects.toThrow(
                'Add journal entry failed - entryText parameter empty. Must be supplied.');
        });

        test('createEntry throws an error when trying to link to an entry whilst entryMood is pleasant', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // entryMood includes "pleasant"
                userId: '12345',
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
                entryText: 'This is a journal entry test.',
                linkedEntry: '83745934875'
            });

            // Assertion
            await expect(service.createEntry()).rejects.toThrow(
                'Add journal entry failed - cannot link an entry when current entry mood type is pleasant. 12345');
        });

        test('createEntry throws an error when user is not found', async () => {
            // Setup: Create a JournalService instance with a userId
            const service = new JournalService({
                userId: '123456',
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryCategories: [{ name: 'Category 1' }],
                entryActivities: [{ name: 'Activity 1' }],
                entryText: 'This is a journal entry test.'
            });

            // Run the createEntry method with no user found
            const response = await service.createEntry();

            // Method returns this specific response in case of user not found
            expect(response).toMatchObject({
                success: false,
                authorise: false,
                msg: 'User not found',
            });
        });
    });

    describe('editEntry', () => {
        test('editEntry edits an entry successfully', async () => {
            // Set userId
            const userId = '123456789'

            // Create new entry directly in the database
            const newEntry = {
                user: userId,
                mood: "Low Energy, Pleasant",
                emotion: "Relaxed",
                text: "This is a test journal entry.",
                categories: [{ category: 'Category 1' }],
                activities: [{ activity: 'Activity 2' }]
            };

            let saveEntry = new Entry(newEntry);

            await saveEntry.save();

            // Get the journalId for editEntry
            const journalId = saveEntry._id.toString();

            // Mock User.countDocuments() directly
            User.countDocuments = jest.fn().mockReturnValue(1);

            // Mock Evervault encryption
            const mockEvervault = { encrypt: jest.fn().mockResolvedValue('encryptedValue') };

            // Set Evervault encryption spy
            jest.spyOn(evervault, 'encrypt').mockImplementation(mockEvervault.encrypt);

            // Attempt to edit the existing journal entry
            const editEntry = new JournalService(
                {
                    userId: userId,
                    journalId: journalId,
                    entryMood: "High Energy, Pleasant",
                    entryEmotion: "Excited",
                    entryText: "Now I'm feeling excited.",
                    entryActivities: [{ activity: 'Activity 2' }],
                }
            );

            const response = await editEntry.editEntry();

            // Assert response object
            expect(response).toMatchObject({
                success: true,
                authorise: true,
                msg: `Journal entry successfully updated with ID ${journalId}`,
                data: {
                    user: '123456789',
                    mood: 'encryptedValue',
                    emotion: 'encryptedValue',
                    activities: [{ activity: 'Activity 2' }],
                    text: 'encryptedValue'
                }
            });
        });

        test('editEntry throws an error when userId is missing', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // Omitting userId to simulate the missing parameter scenario
                journalId: "983457938475",
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryText: 'This is a test journal entry.'
            });

            // Assertion
            await expect(service.editEntry()).rejects.toThrow(
                'Edit journal entry failed - userId parameter empty. Must be supplied.');
        });

        test('editEntry throws an error when journalId is missing', async () => {
            // Setup: Create a JournalService instance without providing a userId
            const service = new JournalService({
                // Omitting journalId to simulate the missing parameter scenario
                userId: "123456789",
                entryMood: 'Low Energy, Pleasant',
                entryEmotion: 'Relaxed',
                entryText: 'This is a test journal entry.'
            });

            // Assertion
            await expect(service.editEntry()).rejects.toThrow(
                'Edit journal entry failed - journalId parameter empty. Must be supplied. 123456789');
        });

        test('editEntry throws an error when linkedEntry exists and entryMood does not exist', async () => {

        });

        test('editEntry throws an error when trying to link to an entry whilst entryMood is pleasant', async () => {

        });
    });
});

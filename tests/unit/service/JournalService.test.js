// Journal Service Unit Tests

// Imports
const fs = require('fs');
const path = require('path');
const Mockingoose = require('mockingoose');

// Mock imports
const JournalService = require('../../../services/JournalService');
const evervault = require('../../../loaders/evervault');
const User = require('../../../models/User');
const Entry = require('../../../models/Entry');
const Categories = require('../../../models/Categories');
const Activities = require('../../../models/Activities');

// Fetch test data


// Tests
describe('JournalService', () => {
    // Test resets
    beforeEach(() => {
        // Clear fs mock override before each test
        jest.resetModules();

        // Resets all mocks before each test
        jest.clearAllMocks();

        // Reset Mockingoose mocks explicitly before each test
        Mockingoose.resetAll();
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
            // Set mocks
            const mockUser = { countDocuments: jest.fn().mockReturnValue(1) };
            const mockEvervault = { encrypt: jest.fn().mockResolvedValue('encryptedValue') };
            const mockJournalServiceEvents = { emit: jest.fn() };
            const mockLogger = { info: jest.fn() };

            // Set Mongoose mocks
            Mockingoose(Entry);

            // Mock User.countDocuments directly (no need for spy)
            User.countDocuments = jest.fn().mockReturnValue(1);

            // Mock the save method
            Entry.prototype.save = jest.fn().mockResolvedValue({ _id: '123' });

            // Set spies
            jest.spyOn(evervault, 'encrypt').mockImplementation(mockEvervault.encrypt);
            jest.spyOn(mockJournalServiceEvents, 'emit').mockImplementation(mockJournalServiceEvents.emit);
            jest.spyOn(mockLogger, 'info').mockImplementation(mockLogger.info);

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

            // Assert createEntry returned value is correct
            expect(response).toEqual({
                success: true,
                authorise: true,
                msg: 'New journal entry created successfully',
                data: {
                    _id: '123',
                    user: '12345',
                    mood: 'Low Energy, Pleasant',
                    emotion: 'Relaxed',
                    categories: [{ name: 'Category 1' }],
                    activities: [{ name: 'Activity 1' }],
                    text: 'This is a positive journal entry.',
                },
            });

            // Final assertions
            expect(mockUser.countDocuments).toHaveBeenCalledWith({ auth0UserId: '12345' });
            expect(mockEvervault.encrypt).toHaveBeenCalledTimes(3); // mood, emotion, text
            expect(mockEntry.save).toHaveBeenCalled();
            expect(mockJournalServiceEvents.emit).toHaveBeenCalledWith('journalEntryCreated');
            expect(mockLogger.info).toHaveBeenCalledWith(`New journal entry created successfully for user 12345`);
        });
    });
})
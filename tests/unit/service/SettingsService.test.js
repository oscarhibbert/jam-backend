// Settings Service Unit Tests

// Imports
const mongoose = require('mongoose');

// Mock Imports
const SettingsService = require('../../../services/SettingsService');

// Model Imports
const Setting = require('../models/Setting');
const Categories = require('../models/Categories');
const Activities = require('../models/Activities');
const Entry = require('../models/Entry');

// Tests
describe('SettingsService', () => {
  // Test resets
  beforeEach(async () => {
    // Clear fs mock ocerride before each test
    jest.restModules();

    // Ensure a clean database before each test
    await clearDatabase();
  });

  afterEach(() => {
    // Resets all mocks before each test
    jest.clearAllMocks();
    jest.restAllMocks();
    jest.restoreAllMocks();
  });

  test(' Settings Service constructor sets properties correctly', () => {
    const params = {
      userId: "123456",
      categoryId: "9834578",
      categoryName: "Test Name",
      categoreType: "General",
      categories: [
        {
          "name": "Test Category",
          "type": "General"
        },
        {
          "name": "Test Category 2",
          "type": "General"
        }
      ],
      activityId: "123456",
      activityName: "Test Activity",
      activityType: "Coping",
      activities: [
        {
          "name": "Running",
          "type": "Coping"
        },
        {
            "name": "Walking",
            "type": "Coping"
        },
      ]
    }

    const service = new JournalService(params);

    expect
  })

})

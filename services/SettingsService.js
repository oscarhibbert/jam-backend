// Model imports
const Setting = require('../models/Setting');
const Entry = require('../models/Entry');

/**
 * @description Create an instance of the SettingsService class.
 */
module.exports = class SettingsService {
    /**
     * Represents the SettingsService constructor.
     * @constructor
     */
    constructor() {
        /** Set allowed category types. */
        this.categoryTypes = ["General"];
        /** Set allowed activity types. */
        this.activityTypes = ["Coping"];
    };
    /**
       * @desc                                  Attempt to get the settings object for the specified user.
       * @param      {string}        userId     String containing the UserId.
       * @return                                Settings object.
       */
    async getSettings(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get settings failed - userId parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Get settings failed - settings object for user not found.');
            };

            // Return success and data
            console.log(settings);
            return settings;

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

        /**
       * @desc                                  Attempt to check the settings setup status for the specified user.
       * @param      {string}        userId     String containing the UserId.
       * @return                                Object with success boolean and key called data with key status and boolean value.
       */
    async checkSettingsSetupStatus(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Check settings setup status - userId parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Check settings setup status - settings object for user not found.');
            };

            // Get status
            const status = settings.settingsSetupComplete;

            return {
                success: true,
                data: {
                    status: status
                }
            };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

        /**
       * @desc                                  Attempt to change the settings setup status for the specified user.
       * @param      {string}        userId     String containing the UserId.
       * @param      {boolean}       status     Boolean true or false.
       * @return                                Object with success boolean.
       */
    async editSettingsSetupStatus(userId, status) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Check settings setup status - userId parameter empty. Must be supplied.');
            };

            // Check status parameter is a boolean value
            if (typeof status !== "boolean") {
                throw new Error('Check settings setup status - status parameter must be a boolean value.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Check settings setup status - settings object for user not found.');
            };

            // Update status for profileSetupComplete in the user settings object.
            await Setting.findOneAndUpdate(
                { user: userId },
                { settingsSetupComplete: status }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    async setReflectionAlertTime() {
    };

    /**
       * @desc                                                                        Attempt to add categories to the user's settings.
       * @param  {string}                                              userId         String containing the UserId.
       * @param  {[{"name":"Example Name","type":"General"}]}          categories     Array containing categories as objects.
       * @return                                                                      Object with success boolean.
       */
    async addCategories(userId, categories) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Add categories failed - userId parameter empty. Must be supplied.')
            };

            // Check categories parameter exists
            if (!categories) {
                throw new Error('Add categories failed - categories parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Add categories failed - settings object for user not found.')
            };

            // Else, continue
            // Get existing categories
            const existingCategories = settings.categories;

            // Get new categories array and put them into the newCategories variable
            const newCategories = categories;
                
            /* Check newCategories array of category objects for errors */
            for (const newCategory of newCategories) {
                
                // Check category name exists
                if (!newCategory.name) {
                    throw new Error(`Add categories failed - category missing name. Must be supplied.`);
                };

                // Check category type exists
                if (!newCategory.type) {
                    throw new Error(`Add categories failed - category '${newCategory.name}' missing type. Must be supplied.`);
                };

                // Check activity type for newCategory is valid
                /* Check newCategory.type is correct activity. If categoryTypes
                    does not include newCategory.type, throw error. */
                if (!this.categoryTypes.includes(newCategory.type)) {
                    throw new Error(`Add categories failed - type '${newCategory.type}' for category '${newCategory.name}' is invalid.`);
                };
                continue;
            };

            // Check newCategory names for duplicate against existing categories
            for (const existingCategory of existingCategories) {
                for (const newCategory of newCategories) {
                    if (existingCategory.name === newCategory.name) {
                        throw new Error(`Add categories failed - category name '${newCategory.name}' is already in use. Check value for key 'name'.`);
                    };
                    continue;
                };
                continue;
            };
            
            // Add newCategories into the categories array in the user's settings object
            await Setting.findOneAndUpdate(
                { user: userId },
                { $push: { categories: newCategories } }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                       Attempt to edit category.
       * @param  {string}    userId                  String containing the UserId.
       * @param  {string}    categoryId              String containing the categoryId to be updated.
       * @param  {string}    categoryName            String containing the new categoryName. Can be null.
       * @param  {string}    categoryType            String containing the new categoryType. Can be null.
       * @return                                     Object with success boolean.
       */
    async editCategory(userId, categoryId, categoryName, categoryType) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Edit category failed - userId parameter empty. Must be supplied.')
            };

            // Check categoryId parameter exists
            if (!categoryId) {
                throw new Error('Edit category failed - categoryId parameter empty. Must be supplied.')
            };

            // If categoryName && categoryType parameter are not provided
            if (!categoryName && !categoryType) {
                throw new Error('Edit category failed - categoryName & categoryType empty. At least one must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Edit category failed - settings object for user not found.');
            }

            // Set existing categories
            const existingCategories = settings.categories;

            // Prepare original category object
            const originalCategory = {};

            // Else, continue

            /* Loop through each existing category in settings and check the
            specified category exists. Then set originalCategory info. 
            If it doesn't match, throw error.
            */
            let categoryFound = false;

            // Check for match
            for (const existingCategory of existingCategories) {
                if (existingCategory.id === categoryId) {
                    // Set category found to true
                    categoryFound = true;

                    // Set original category object
                    originalCategory.id = existingCategory.id;
                    originalCategory.name = existingCategory.name;
                    originalCategory.type = existingCategory.type;

                    break;
                };
                continue;
            }

            // If not found, throw error
            if (categoryFound === false) {
                throw new Error('Edit category failed - existing category not found. Check categoryId parameter.');
            };
                
            /* Check the new category name is not the same as any of the other categories 
            except it's own name - that is ok. Otherwise, throw error.
            */
            // For each existing category
            for (const existingCategory of existingCategories) {
                // If the existing category name is equal to the new category name
                if (existingCategory.name === categoryName) {
                    // If existing category name and new category name match, continue (this is ok)
                    if (existingCategory.id === categoryId) {
                        break;
                    }
                    // Else, as they do not have the same ID throw error as duplicate cannot be created
                    else {
                        throw new Error(`Edit category failed - category name '${categoryName}' already in use. Check categoryName parameter.`);
                    };
                };

                // Otherwise, continue
                continue;
            };

            /* Check categoryType is correct activity. If categoryType exists
            and categoryTypes does not include categoryType, throw error. */
            if (categoryType && !this.categoryTypes.includes(categoryType)) {
                throw new Error(`Edit category failed - category type '${categoryType}' invalid. Check categoryType parameter.`);
            };

            // Else, continue

            // Set updatedCategory object
            const updatedCategory = {};

            // Create updatedCategory object
            // Set the _id otherwise it will be overwritten with null by Mongoose b/c of $set. Same with other fields.
            updatedCategory._id = originalCategory.id;
            // If categoryName param is provided, set it into object. Else, keep existingCategory.name.
            if (categoryName) updatedCategory.name = categoryName; else { updatedCategory.name = originalCategory.name };
            // If categoryType param is provided, set it into object. Else, keep the existingCategory.type.
            if (categoryType) updatedCategory.type = categoryType; else { updatedCategory.type = originalCategory.type };
         
            // Add updatedCategory into the categories array overwriting the original in the user's settings object
            await Setting.findOneAndUpdate(
                { user: userId },
                { $set: { "categories.$[el]": updatedCategory } },
                { arrayFilters: [{ "el._id": categoryId }] }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                        Attempt to delete categories.
       * @param  {string}             userId          String containing the UserId.
       * @param  {[{id:"123456"}]}    categories      Array of category objects to be deleted. Each object must include _id.
       * @return                                      Object with success boolean.
       */
    async deleteCategories(userId, categories) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Delete categories failed - userId parameter empty. Must be supplied.');
            };

            // Check categories parameter exists
            if (!categories) {
                throw new Error('Delete categories failed - categories parameter empty. Must be supplied.');
            };

            // Set idsForDeletion array
            const idsForDeletion = [];

            // Check all categories supplied include the key _id, add _id to array
            for (const category of categories) {
                // Check _id key for category exists
                if (!category.id) {
                    throw new Error(`Delete categories failed - a category object is missing required key 'id'.`);
                };

                // Else

                // Add id to idsForDeletion array
                idsForDeletion.push(category.id);

                continue;
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Delete categories failed - settings object for user not found.');
            };

            // Get categories from settings
            const getCategories = settings.categories;

            // Set existingCategories array
            const existingCategories = [];

            // Have to create this array b/c _id has to be converted to a string
            for (const category of getCategories) {
                existingCategories.push(category.id);
            };

            // If ID in parameter does not exist, throw error
            for (const id of idsForDeletion) {
                // If ID is not included in existingCategories, throw error
                if (!existingCategories.includes(id)) {
                    throw new Error(`Delete categories failed - category with ID '${id}' does not exist.`);
                };

                // Else, continue
                continue;
            };

            // Delete category objects from the user's category array in the settings object
            await Setting.updateOne(
                { user: userId },
                { $pull: { categories: { _id: idsForDeletion } } }
            );

            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                  Attempt to get all categories for specified user.
       * @param      {string}        userId     String containing the UserId.
       * @return                                Object with success boolean and key called data with array of categories.
       */
    async getAllCategories(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get all categories failed - userId parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Get all categories failed - settings object for user not found.');
            };

            // Get categories
            const categories = settings.categories.toObject();

            // Return success and data
            console.log(categories);
            return {
                success: true,
                data: categories
            };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                       Attempt to check whether category is in use.
       * @param  {string}             userId         String containing the userId.
       * @param  {string}             categoryId     categoryId to be checked as a string.
       * @return                                     Object with success boolean and exists boolean.
    */
    async checkCategoryInUse(userId, categoryId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Check category in use failed - userId parameter empty. Must be supplied.')
            };

            // Check categoryId parameter exists
            if (!categoryId) {
                throw new Error('Check category in use failed - categoryId parameter empty. Must be supplied.')
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Check category in use failed - settings object for user not found.')
            };

            // Try to get the specified category from the user's settings
            const category = settings.categories.find(category => category.id === categoryId);
            
            // If the specified category does not exists throw error
            if (!category) {
                throw new Error('Check category in use failed - category does not exist.');
            };

            // Count how many journal entries use this category
            const checkCategory = await Entry.countDocuments(
                {
                    categories: {
                        $elemMatch: {
                            _id: category.id
                        }
                    }
                }
            );

            // Set exists variable
            let inUse;

            // If check category exists set exists to true
            if (checkCategory > 0) inUse = true;

            // if check category does not exist set exists to false
            if (checkCategory === 0) inUse = false;

            // Return response
            return {
                success: true,
                inuse: inUse
            };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                                                        Attempt to add activities to the user's settings.
       * @param  {string}                                              userId         String containing the UserId.
       * @param  {[{"name":"Example Name","type":"Coping"}]}           activities     Array containing activities as objects.
       * @return                                                                      Object with success boolean.
       */
    async addActivities(userId, activities) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Add activities failed - userId parameter empty. Must be supplied.')
            };

            // Check activities parameter exists
            if (!activities) {
                throw new Error('Add activities failed - activities parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Add activities failed - settings object for user not found.')
            };

            // Else, continue
            // Get existing activities
            const existingActivities = settings.activities;

            // Get new activities array and put them into newActivities variable
            const newActivities = activities;
                
            /* Check newActivities array of activity objects for errors */
            for (const newActivity of newActivities) {
                
                // Check activity name exists
                if (!newActivity.name) {
                    throw new Error(`Add activities failed - activity missing name. Must be supplied.`);
                };

                // Check activity type exists
                if (!newActivity.type) {
                    throw new Error(`Add activities failed - activity '${newActivity.name}' missing type. Must be supplied.`);
                };

                // Check type for newActivity is valid
                /* Check newActivity.type is correct type. If activityTypes
                    does not include newActivity.type, throw error. */
                if (!this.activityTypes.includes(newActivity.type)) {
                    throw new Error(`Add activities failed - type '${newActivity.type}' for activity '${newActivity.name}' is invalid.`);
                };
                continue;
            };

            // Check newActivity names for duplicate against existing categories
            for (const existingActivity of existingActivities) {
                for (const newActivity of newActivities) {
                    if (existingActivity.name === newActivity.name) {
                        throw new Error(`Add activity failed - activity name '${newActivity.name}' is already in use. Check value for key 'name'.`);
                    };
                    continue;
                };
                continue;
            };
            
            // Add newActivities into the activities array in the user's settings object
            await Setting.findOneAndUpdate(
                { user: userId },
                { $push: { activities: newActivities } }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                       Attempt to edit activity.
       * @param  {string}    userId                  String containing the UserId.
       * @param  {string}    activityId              String containing the activityId to be updated.
       * @param  {string}    activityName            String containing the new activityName. Can be null.
       * @param  {string}    activityType            String containing the new activityType. Can be null.
       * @return                                     Object with success boolean.
       */
    async editActivity(userId, activityId, activityName, activityType) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Edit activity failed - userId parameter empty. Must be supplied.');
            };

            // Check activityId parameter exists
            if (!activityId) {
                throw new Error('Edit activity failed - activityId parameter empty. Must be supplied.');
            };

            // If at least activityName or activityType parameter is not provided
            if (!activityName && !activityType) {
                throw new Error('Edit activity failed - activityName & ActivityType empty. At least one must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Edit activity failed - settings object for user not found.');
            }

            // Set existing activities
            const existingActivities = settings.activities;

            // Prepare original activity object
            const originalActivity = {};

            // Else, continue

            /* Loop through each existing activity in settings and check the
            specified activity exists. Then set originalActivity info. 
            If it doesn't match, throw error.
            */
            let activityFound = false;

            // Check for match
            for (const existingActivity of existingActivities) {
                if (existingActivity.id === activityId) {
                    // Set activity found to true
                    activityFound = true;

                    // Set original activity object
                    originalActivity.id = existingActivity.id;
                    originalActivity.name = existingActivity.name;
                    originalActivity.type = existingActivity.type;

                    break;
                };
                continue;
            }

            // If not found, throw error
            if (activityFound === false) {
                throw new Error('Update activity failed - existing activity not found. Check activityId parameter.');
            };
                
            /* Check the new activity name is not the same as any of the other activities 
            except it's own name - that is ok. Otherwise, throw error.
            */
            // For each existing activity
            for (const existingActivity of existingActivities) {
                // If the existing activity name is equal to the new activity name
                if (existingActivity.name === activityName) {
                    // If existing activity name and new activity name match, continue (this is ok)
                    if (existingActivity.id === activityId) {
                        break;
                    }
                    // Else, as they do not have the same ID throw error as duplicate cannot be created
                    else {
                        throw new Error(`Update activity failed - activity name '${activityName}' already in use. Check activityName parameter.`);
                    };
                };

                // Otherwise, continue
                continue;
            };

            /* Check activityType is correct type. If activityType exists
            and activitiesTypes does not include activityType, throw error. */
            if (activityType && !this.activityTypes.includes(activityType)) {
                throw new Error(`Update activity failed - activity type '${activityType}' invalid. Check activityType parameter.`);
            };

            // Else, continue

            // Set updatedActivity object
            const updatedActivity = {};

            // Create updatedActivity object
            // Set the _id otherwise it will be overwritten with null by Mongoose b/c of $set. Same with other fields.
            updatedActivity._id = originalActivity.id;
            // If activityName param is provided, set it into object. Else, keep existingActivity.name.
            if (activityName) updatedActivity.name = activityName; else { updatedActivity.name = originalActivity.name };
            // If activityType param is provided, set it into object. Else, keep the existingActivity.type.
            if (activityType) updatedActivity.type = activityType; else { updatedActivity.type = originalActivity.type };
         
            // Add newActivity into the activities array in the user's settings object
            await Setting.findOneAndUpdate(
                { user: userId },
                { $set: { "activities.$[el]": updatedActivity } },
                { arrayFilters: [{ "el._id": activityId }] }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                        Attempt to delete activities.
       * @param  {string}             userId          String containing the UserId.
       * @param  {[{id:"123456"}]}    activities      Array of activity objects to be deleted. Each object must include _id.
       * @return                                      Object with success boolean.
       */
    async deleteActivities(userId, activities) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Delete activities failed - userId parameter empty. Must be supplied.');
            };

            // Check activities parameter exists
            if (!activities) {
                throw new Error('Delete activities failed - activities parameter empty. Must be supplied.');
            };

            // Set idsForDeletion array
            const idsForDeletion = [];

            // Check all activities supplied include the key _id, add _id to array
            for (const activity of activities) {
                // Check _id key for activity exists
                if (!activity.id) {
                    throw new Error(`Delete activities failed - an activity object is missing required key 'id'.`);
                };

                // Else

                // Add id to idsForDeletion array
                idsForDeletion.push(activity.id);

                continue;
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Delete activities failed - settings object for user not found.');
            };

            // Get activities from settings
            const getActivities = settings.activities;

            // Set existingActivities array
            const existingActivities = [];

            // Have to create this array b/c _id has to be converted to a string
            for (const activity of getActivities) {
                existingActivities.push(activity.id);
            };

            // If ID in parameter does not exist, throw error
            for (const id of idsForDeletion) {
                // If ID is not included in existingActivities, throw error
                if (!existingActivities.includes(id)) {
                    throw new Error(`Delete activities failed - activity with ID '${id}' does not exist.`);
                };

                // Else, continue
                continue;
            };

            // Delete activity objects from the user's activity array in the settings object
            await Setting.updateOne(
                { user: userId },
                { $pull: { activities: { _id: idsForDeletion } } }
            );

            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                  Attempt to get all activities for the specified user.
       * @param      {string}        userId     String containing the UserId.
       * @return                                Object with success boolean and key called data with array of activities.
       */
    async getAllActivities(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get all activities failed - userId parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Get all activities failed - settings object for user not found.');
            };

            // Get activities
            const activities = settings.activities.toObject();

            // Return success and data
            console.log(activities);
            return {
                success: true,
                data: activities
            };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                       Attempt to check whether the specified activity is in use.
       * @param  {string}             userId         String containing the userId.
       * @param  {string}             activityId     activityId to be checked as a string.
       * @return                                     Object with success boolean and exists boolean.
    */
    async checkActivityInUse(userId, activityId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Check activity in use failed - userId parameter empty. Must be supplied.')
            };

            // Check activityId parameter exists
            if (!activityId) {
                throw new Error('Check activity in use failed - activityId parameter empty. Must be supplied.')
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Check activity in use failed - settings object for user not found.')
            };

            // Try to get the specified activity from the user's settings
            const activity = settings.activities.find(activity => activity.id === activityId);
            
            // If the specified activity does not exists throw error
            if (!activity) {
                throw new Error('Check activity in use failed - activity does not exist.');
            };

            // Count how many journal entries use this activity
            const checkActivity = await Entry.countDocuments(
                {
                    activities: {
                        $elemMatch: {
                            _id: activity.id
                        }
                    }
                }
            );

            // Set exists variable
            let inUse;

            // If check activity count is more than 0 set exists to true
            if (checkActivity > 0) inUse = true;

            // if check activity count is equal to 0 set exists to false
            if (checkActivity === 0) inUse = false;

            // Return response
            return {
                success: true,
                inuse: inUse
            };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };
};
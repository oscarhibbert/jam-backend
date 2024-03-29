// Import logger
const logger = require('../loaders/logger');

// Model imports
const Setting = require('../models/Setting');
const Categories = require('../models/Categories');
const Activities = require('../models/Activities');
const Entry = require('../models/Entry');

/**
 * @description Create an instance of the SettingsService class.
 */
module.exports = class SettingsService {
    /**
     * Represents the SettingsService constructor.
     * @constructor
     * @param {Object} params - An object containing parameters for the instance.
     *   @param {string}  params.userId - A string containing the userId
     *   @param {boolean} params.status - A boolean value denoting the setup status of user settings
     *   @param {string}  params.categoryId - A string value denoting the categoryId
     *   @param {string}  params.categoryName - A string value denoting the category name
     *   @param {string}  params.categoryType - A string value denoting the category type
     *   @param {[{}]}    params.categories - An array of objects containing categories
     *   @param {string}  params.activityId - A string value denoting the activityId
     *   @param {string}  params.activityName - A string value denoting the activityName
     *   @param {string}  params.activityType - A string value denoting the activityType
     *   @param {[{}]}    params.activities - An array of objects containing activities
     * 
     */
    constructor(params = {}) {
        // User properties
        this._userId = params.userId;

        // Settings properties
        this._status = params.status;

        // Category properties
        this._categoryId = params.categoryId;
        this._categoryName = params.categoryName;
        this._categoryType = params.categoryType;
        this._categories = params.categories;

        /** Set allowed category types. */
        this.categoryTypes = ["General"];

        // Activity properties
        this._activityId = params.activityId;
        this._activityName = params.activityName;
        this._activityType = params.activityType;
        this._activities = params.activities;
        
        /** Set allowed activity types. */
        this.activityTypes = ["Coping"];
    };

    /**
     * Gets settings for the user
     * from the constructor via the userId property.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new SettingsService({
     *   userId: ""
     * });
     * 
     * await SettingsService.getSettings();
     */
    async getSettings() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error(`Get settings failed - userId parameter empty. Must be supplied`);
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: this._userId }
            ).lean();

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error(`Get settings failed - settings object for user not found - ${this._userId}`);
            };

            // Get the user's categories and add them to the setting object
            // (as originally categories was contained in the settings object)
            const categories = await Categories.find({ user: this._userId });

            // Add categories as a property of the settings object
            settings.categories = categories;

            // Get the user's activities and add them to the setting object
            // (as originally activities was contained in the settings object)
            const activities = await Activities.find({ user: this._userId });

            // Add categories as a property of the settings object
            settings.activities = activities;

            // Log success
            logger.info(`Settings retrieved successfully for user ${this._userId}`);

            // Return data
            return settings;

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
     * Checks the status of the current user settings setup
     * via the userId property of the class constructor.
     * 
     * @returns {Promise<Object>} - A promise that resolves to a response object
     * @example
     * const SettingsService = new SettingsService({
     *   userId: ""
     * });
     * 
     * await SettingsService.checkSettingsSetupStatus();
     */
    async checkSettingsSetupStatus() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error(`Check settings setup status - userId parameter empty. Must be supplied`);
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: this._userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error(`Check settings setup status - settings object for user not found - ${this._userId}`);
            };

            // Get status
            const status = settings.settingsSetupComplete;

            // Log success
            logger.info(`Settings setup status retrieved successfully for user ${this._userId}`);

            return {
                success: true,
                data: {
                    user: this._userId,
                    status: status
                }
            };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Edit the settings setup status for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   status: true
         * });
         * 
         * await SettingsService.editSettingsSetupStatus();
         */
    async editSettingsSetupStatus() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Check settings setup status - userId parameter empty. Must be supplied');
            };

            // Check status parameter is a boolean value
            if (typeof this._status !== "boolean") {
                throw new Error(`Check settings setup status - status parameter must be a boolean value. ${this._userId}`);
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: this._userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error(`Check settings setup status - settings object for user not found. ${this._userId}`);
            };

            // Update status for profileSetupComplete in the user settings object.
            await Setting.findOneAndUpdate(
                { user: this._userId },
                { settingsSetupComplete: this._status }
            );

            logger.info(`Settings setup status edited successfully for user ${this._userId}`);

            // Return response
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    // async setReflectionAlertTime() {
    // };

    /**
         * Create default categories for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.createDefaultCategories();
         */
    async createDefaultCategories() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Create default categories failed - userId parameter empty. Must be supplied')
            };

            // Get the existing categories and convert cursor to array for the specified user
            const existingCategories = await Categories.find({ user: this._userId }).lean();

            // Create the default categories array and put them into the newCategories variable
            const newCategories = [
                    {
                        user: this._userId,
                        name: "Home 🏠",
                        type: "General"
                    },
                    {
                        user: this._userId,
                        name: "Work 💻",
                        type: "General"
                    },
                    {
                        user: this._userId,
                        name: "Hobbies 💃",
                        type: "General"
                    },
                    {
                        user: this._userId,
                        name: "Self-Care 🥰",
                        type: "General"
                    }
            ]
                
            /* Check newCategories array of category objects for errors */
            for (const newCategory of newCategories) {
                
                // Check category name exists
                if (!newCategory.name) {
                    throw new Error(`Create default categories failed - category missing name. Must be supplied. ${this._userId}`);
                };

                // Check category type exists
                if (!newCategory.type) {
                    throw new Error(`Create default categories failed - category '${newCategory.name}' missing type. Must be supplied. ${this._userId}`);
                };

                // Check activity type for newCategory is valid
                /* Check newCategory.type is correct activity. If categoryTypes
                    does not include newCategory.type, throw error. */
                if (!this.categoryTypes.includes(newCategory.type)) {
                    throw new Error(`Create default categories failed - type '${newCategory.type}' for category '${newCategory.name}' is invalid. ${this._userId}`);
                };
                continue;
            };

            // Check newCategory names for duplicate against existing categories
            for (const existingCategory of existingCategories) {
                for (const newCategory of newCategories) {
                    if (existingCategory.name === newCategory.name) {
                        throw new Error(`Create default categories failed - category name '${newCategory.name}' is already in use. Check value for key 'name'. ${this._userId}`);
                    };
                    continue;
                };
                continue;
            };
            
            // Write each object inside the newCategories array to the Categories collection
            await Categories.insertMany(
                newCategories
            );

            logger.info(`Default categories created successfully for user ${this._userId}`);

            // Return response
            return { success: true, user: this._userId, data: newCategories };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Add categories for the specified user
         * via the userId and categories property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   categories: [
         *      { "name": "Example Name", "type": "General" }
         *   ]
         * });
         * 
         * await SettingsService.addCategories();
         */
    async addCategories() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Add categories failed - userId parameter empty. Must be supplied')
            };

            // Check categories parameter exists
            if (!this._categories) {
                throw new Error(`Add categories failed - categories parameter empty. Must be supplied. ${this._userId}`);
            };

            // Get the existing categories and convert cursor to array for the specified user
            const existingCategories = await Categories.find({ user: this._userId }).lean();

            // Get new categories array and put them into the newCategories variable
            let newCategories = this._categories;
                
            /* Check newCategories array of category objects for errors */
            for (const newCategory of newCategories) {
                
                // Check category name exists
                if (!newCategory.name) {
                    throw new Error(`Add categories failed - category missing name. Must be supplied. ${this._userId}`);
                };

                // Check category type exists
                if (!newCategory.type) {
                    throw new Error(`Add categories failed - category '${newCategory.name}' missing type. Must be supplied. ${this._userId}`);
                };

                // Check activity type for newCategory is valid
                /* Check newCategory.type is correct activity. If categoryTypes
                    does not include newCategory.type, throw error. */
                if (!this.categoryTypes.includes(newCategory.type)) {
                    throw new Error(`Add categories failed - type '${newCategory.type}' for category '${newCategory.name}' is invalid. ${this._userId}`);
                };
                continue;
            };

            // Check newCategory names for duplicate against existing categories
            for (const existingCategory of existingCategories) {
                for (const newCategory of newCategories) {
                    if (existingCategory.name === newCategory.name) {
                        throw new Error(`Add categories failed - category name '${newCategory.name}' is already in use. Check value for key 'name'. ${this._userId}`);
                    };
                    continue;
                };
                continue;
            };

            // Reorder all category properties
            for (const [index, newCategory] of newCategories.entries()) {
                // Reorder current newCategory object
                newCategories[index] = {
                    user: this._userId,
                    name: newCategory.name,
                    type: newCategory.type
                };

                continue;
            };
            
            // Write each object inside the newCategories array to the Categories collection
            await Categories.insertMany(
                newCategories
            );

            logger.info(`New categories created successfully for user ${this._userId}`);

            // Return response
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Edit category for the specified user
         * via the userId, categoryId, categoryName,
         * categoryType property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   categoryId: "",
         *   categoryName: "",
         *   categoryType: ""
         * });
         * 
         * await SettingsService.editCategory();
         */
    async editCategory() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Edit category failed - userId parameter empty. Must be supplied')
            };

            // Check categoryId parameter exists
            if (!this._categoryId) {
                throw new Error(`Edit category failed - categoryId parameter empty. Must be supplied. ${this._userId}`)
            };

            // If categoryName && categoryType parameter are not provided
            if (!this._categoryName && !this._categoryType) {
                throw new Error(`Edit category failed - categoryName & categoryType empty. At least one must be supplied. ${this._userId}`);
            };

            // Get the existing categories from the categories collection for the specified user
            const existingCategories = await Categories.find({ user: this._userId });

            // If no categories for the user found throw error
            if (!existingCategories) {
                throw new Error(`Edit category failed - no categories for the user found. ${this._userId}`);
            };

            // Prepare original category object
            const originalCategory = {};

            // Else, continue

            /* Loop through each existing category and check the
            specified category exists. Then set originalCategory info. 
            If there isn't a match, throw error.
            */
            let categoryFound = false;

            // Check for match
            for (const existingCategory of existingCategories) {
                if (existingCategory.id === this._categoryId) {
                    // Set category found to true
                    categoryFound = true;

                    // Set original category object
                    originalCategory.id = existingCategory.id;
                    originalCategory.name = existingCategory.name;
                    originalCategory.type = existingCategory.type;

                    break;
                };
                continue;
            };

            // If category not found, throw error
            if (categoryFound === false) {
                throw new Error(`Edit category failed - existing category not found. Check categoryId parameter. ${this._userId}`);
            };
                
            /* Check the new category name is not the same as any of the other categories 
            except it's own name - that is ok. Otherwise, throw error.
            */
            // For each existing category
            for (const existingCategory of existingCategories) {
                // If the existing category name is equal to the new category name
                if (existingCategory.name === this._categoryName) {
                    // If existing category name and new category name match, continue (this is ok)
                    if (existingCategory.id === this._categoryId) {
                        break;
                    }
                    // Else, as they do not have the same ID throw error as duplicate cannot be created
                    else {
                        throw new Error(`Edit category failed - category name '${this._categoryName}' already in use. Check categoryName parameter. ${this._userId}`);
                    };
                };

                // Otherwise, continue
                continue;
            };

            /* Check categoryType is correct activity. If categoryType exists
            and categoryTypes does not include categoryType, throw error. */
            if (this._categoryType && !this.categoryTypes.includes(this._categoryType)) {
                throw new Error(`Edit category failed - category type '${this._categoryType}' invalid. Check categoryType parameter. ${this._userId}`);
            };

            // Else, continue

            // Set updatedCategory object
            const updatedCategory = {};

            // Create updatedCategory object
            // Set the _id otherwise it will be overwritten with null by Mongoose b/c of $set. Same with other fields.
            // updatedCategory._id = originalCategory.id;

            // If categoryName param is provided, set it into object. Else, keep existingCategory.name.
            if (this._categoryName) updatedCategory.name = this._categoryName; /* else { updatedCategory.name = originalCategory.name }; */
            // If categoryType param is provided, set it into object. Else, keep the existingCategory.type.
            if (this._categoryType) updatedCategory.type = this._categoryType; /* else { updatedCategory.type = originalCategory.type }; */
         
            // // Add updatedCategory into the categories array overwriting the original in the user's settings object
            // await Setting.findOneAndUpdate(
            //     { user: userId },
            //     { $set: { "categories.$[el]": updatedCategory } },
            //     { arrayFilters: [{ "el._id": categoryId }] }
            // );

            // Update category in the categories collection
            await Categories.findOneAndUpdate(
                { _id: originalCategory.id },
                {
                    "$set":
                    {
                        name: updatedCategory.name,
                        type: updatedCategory.type
                    }
                }
            );

            logger.info(`Category edited successfully for user ${this._userId}`);

            // Return response
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Delete specified categories for the specified user
         * via the userId and categories properties of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   categories: [
         *      { id: "123456"}
         *   ]
         * });
         * 
         * await SettingsService.deleteCategories();
         */
    async deleteCategories() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete categories failed - userId parameter empty. Must be supplied');
            };

            // Check categories parameter exists
            if (!this._categories) {
                throw new Error(`Delete categories failed - categories parameter empty. Must be supplied. ${this._userId}`);
            };

            // Set idsForDeletion array
            const idsForDeletion = [];

            // Check all categories supplied include the key _id, add _id to array
            for (const category of this._categories) {
                // Check _id key for category exists
                if (!category.id) {
                    throw new Error(`Delete categories failed - a category object is missing required key 'id'. ${this._userId}`);
                };

                // Else

                // Add id to idsForDeletion array
                idsForDeletion.push(category.id);

                continue;
            };

            // Get the existing categories for the specified user from the categories collection
            const getCategories = await Categories.find({ user: this._userId });

            // If no categories for the user found throw error
            if (!getCategories) {
                throw new Error(`Delete categories failed - no categories for the user found. ${this._userId}`);
            };

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
                    throw new Error(`Delete categories failed - category with ID '${id}' does not exist. ${this._userId}`);
                };

                // Else, continue
                continue;
            };

            // // Delete category objects from the user's category array in the settings object
            // await Setting.updateOne(
            //     { user: userId },
            //     { $pull: { categories: { _id: idsForDeletion } } }
            // );

            // Delete specified categories for deletion from the categories collection for the specified user
            await Categories.deleteMany(
                {
                    user: this._userId,
                    _id: {
                        $in: idsForDeletion
                    }
                }
            );

            logger.info(`Categories deleted successfully for user ${this._userId}`);

            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Delete all categories for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.deleteAllCategories();
         */
    async deleteAllCategories() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete all categories failed - userId parameter empty. Must be supplied');
            };

            await Categories.deleteMany(
                {
                    user: this._userId,
                }
            );

            logger.info(`All categories deleted successfully for user ${this._userId}`);

            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Get all categories for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.getAllCategories();
         */
    async getAllCategories() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get all categories failed - userId parameter empty. Must be supplied');
            };

            // Get the existing categories for the specified user from the categories collection
            // Use .lean() to get the clean record
            const categories = await Categories.find({ user: this._userId }).lean();

            // If no categories for the user found throw error
            if (!categories) {
                throw new Error(`Get all categories failed - no categories for the user found. ${this._userId}`);
            };

            // Log success
            logger.info(`All categories retrieved successfully for user ${this._userId}`);

            // Return success and data
            return {
                success: true,
                user: this._userId,
                data: categories
            };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Check category in use for the specified user
         * via the userId and categoryId properties of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.checkCategoryInUse();
         */
    async checkCategoryInUse() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Check category in use failed - userId parameter empty. Must be supplied');
            };

            // Check categoryId parameter exists
            if (!this._categoryId) {
                throw new Error(`Check category in use failed - categoryId parameter empty. Must be supplied. ${this._userId}`);
            };

            // Get the existing categories for the specified user from the categories collection
            const categories = await Categories.find({ user: this._userId });

            // If no categories for the user found throw error
            if (!categories) {
                throw new Error(`Check category in use failed - no categories for the user found. ${this._userId}`);
            };

            // Try to get the specified category from the categories array
            const category = categories.find(category => category.id === this._categoryId);
            
            // If the specified category does not exists throw error
            if (!category) {
                throw new Error(`Check category in use failed - category does not exist. ${this._userId}`);
            };

            // Count how many journal entries use this category in the entries collection
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
            
            // Log success
            logger.info(`Retrieved category in use status successfully for user ${this._userId}`);

            // Return response
            return {
                success: true,
                user: this._userId,
                inuse: inUse,
                data: category
            };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Add activities for the specified user
         * via the userId and activities properties of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   activities: [
         *      { name: "Example Name", type: "Coping"}
         *   ]
         * });
         * 
         * await SettingsService.addActivities();
         */
    async addActivities() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Add activities failed - userId parameter empty. Must be supplied.')
            };

            // Check activities parameter exists
            if (!this._activities) {
                throw new Error(`Add activities failed - activities parameter empty. Must be supplied. ${this._userId}`);
            };

            // Get the existing activities and convert cursor to array for the specified user
            const existingActivities = await Activities.find({ user: this._userId }).lean();

            // Get new activities array and put them into newActivities variable
            const newActivities = this._activities;
                
            /* Check newActivities array of activity objects for errors */
            for (const newActivity of newActivities) {
                
                // Check activity name exists
                if (!newActivity.name) {
                    throw new Error(`Add activities failed - activity missing name. Must be supplied. ${this._userId}`);
                };

                // Check activity type exists
                if (!newActivity.type) {
                    throw new Error(`Add activities failed - activity '${newActivity.name}' missing type. Must be supplied. ${this._userId}`);
                };

                // Check type for newActivity is valid
                /* Check newActivity.type is correct type. If activityTypes
                    does not include newActivity.type, throw error. */
                if (!this.activityTypes.includes(newActivity.type)) {
                    throw new Error(`Add activities failed - type '${newActivity.type}' for activity '${newActivity.name}' is invalid. ${this._userId}`);
                };
                continue;
            };

            // Check newActivity names for duplicate against existing categories
            for (const existingActivity of existingActivities) {
                for (const newActivity of newActivities) {
                    if (existingActivity.name === newActivity.name) {
                        throw new Error(`Add activity failed - activity name '${newActivity.name}' is already in use. Check value for key 'name'. ${this._userId}`);
                    };
                    continue;
                };
                continue;
            };
            
            // Reorder all activity properties
            for (const [index, newActivity] of newActivities.entries()) {
                // Reorder current newCategory object
                newActivities[index] = {
                    user: this._userId,
                    name: newActivity.name,
                    type: newActivity.type
                };

                continue;
            };

            // Write each object inside the newActivities array to the Activities collection
            await Activities.insertMany(
                newActivities
            );

            // Log success
            logger.info(`Activities created successfully for user ${this._userId}`);

            // Return response
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Edit activity for the specified user
         * via the userId, activityId, activityName,
         * activityType properties of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   activityId: "",
         *   activityName: "",
         *   activityType: ""
         * });
         * 
         * await SettingsService.editActivity();
         */
    async editActivity() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Edit activity failed - userId parameter empty. Must be supplied');
            };

            // Check activityId parameter exists
            if (!this._activityId) {
                throw new Error(`Edit activity failed - activityId parameter empty. Must be supplied. ${this._userId}`);
            };

            // If at least activityName or activityType parameter is not provided
            if (!this._activityName && !this._activityType) {
                throw new Error(`Edit activity failed - activityName & ActivityType empty. At least one must be supplied. ${this._userId}`);
            };

            // Get the existing activities from the activities collection for the specified user
            const existingActivities = await Activities.find({ user: this._userId });

            // If no activities for the user found throw error
            if (!existingActivities) {
                throw new Error(`Edit activity failed - no activities for the user found. ${this._userId}`);
            };

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
                if (existingActivity.id === this._activityId) {
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
                throw new Error(`Update activity failed - existing activity not found. Check activityId parameter. ${this._userId}`);
            };
                
            /* Check the new activity name is not the same as any of the other activities 
            except it's own name - that is ok. Otherwise, throw error.
            */
            // For each existing activity
            for (const existingActivity of existingActivities) {
                // If the existing activity name is equal to the new activity name
                if (existingActivity.name === this._activityName) {
                    // If existing activity name and new activity name match, continue (this is ok)
                    if (existingActivity.id === this._activityId) {
                        break;
                    }
                    // Else, as they do not have the same ID throw error as duplicate cannot be created
                    else {
                        throw new Error(`Update activity failed - activity name '${this._activityName}' already in use. Check activityName parameter. ${this._userId}`);
                    };
                };

                // Otherwise, continue
                continue;
            };

            /* Check activityType is correct type. If activityType exists
            and activitiesTypes does not include activityType, throw error. */
            if (this._activityType && !this.activityTypes.includes(this._activityType)) {
                throw new Error(`Update activity failed - activity type '${this._activityType}' invalid. Check activityType parameter. ${this._userId}`);
            };

            // Else, continue

            // Set updatedActivity object
            const updatedActivity = {};

            // // Create updatedActivity object
            // // Set the _id otherwise it will be overwritten with null by Mongoose b/c of $set. Same with other fields.
            // updatedActivity._id = originalActivity.id;
            
            // If activityName param is provided, set it into object. Else, keep existingActivity.name.
            if (this._activityName) updatedActivity.name = this._activityName; /* else { updatedActivity.name = originalActivity.name }; */
            // If activityType param is provided, set it into object. Else, keep the existingActivity.type.
            if (this._activityType) updatedActivity.type = this._activityType; /* else { updatedActivity.type = originalActivity.type }; */
         
            // // Add newActivity into the activities array in the user's settings object
            // await Setting.findOneAndUpdate(
            //     { user: userId },
            //     { $set: { "activities.$[el]": updatedActivity } },
            //     { arrayFilters: [{ "el._id": activityId }] }
            // );

            // Update activity in the activities colleciton
            await Activities.findOneAndUpdate(
                { _id: originalActivity.id },
                {
                    "$set":
                    {
                        name: updatedActivity.name,
                        type: updatedActivity.type
                    }
                }
            );

            // Log success
            logger.info(`Activity edited successfully for user ${this._userId}`);

            // Return response
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Delete specified activities for the specified user
         * via the userId and activities properties of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: "",
         *   activities: [
         *      { id: "123456"}
         *   ]
         * });
         * 
         * await SettingsService.deleteActivities();
         */
    async deleteActivities() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete activities failed - userId parameter empty. Must be supplied');
            };

            // Check activities parameter exists
            if (!this._activities) {
                throw new Error(`Delete activities failed - activities parameter empty. Must be supplied. ${this._userId}`);
            };

            // Set idsForDeletion array
            const idsForDeletion = [];

            // Check all activities supplied include the key _id, add _id to array
            for (const activity of this._activities) {
                // Check _id key for activity exists
                if (!activity.id) {
                    throw new Error(`Delete activities failed - an activity object is missing required key 'id'. ${this._userId}`);
                };

                // Else

                // Add id to idsForDeletion array
                idsForDeletion.push(activity.id);

                continue;
            };

            // Get the existing activities for the specified user from the activities collection
            const getActivities = await Activities.find({ user: this._userId });

            // If no activities for the user found throw error
            if (!getActivities) {
                throw new Error(`Delete activities failed - no activities for the user found. ${this._userId}`);
            };

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
                    throw new Error(`Delete activities failed - activity with ID '${id}' does not exist. ${this._userId}`);
                };

                // Else, continue
                continue;
            };

            // // Delete activity objects from the user's activity array in the settings object
            // await Setting.updateOne(
            //     { user: userId },
            //     { $pull: { activities: { _id: idsForDeletion } } }
            // );

            // Delete specified activities for deletion from the activities collection for the specified user
            await Activities.deleteMany(
                {
                    user: this._userId,
                    _id: {
                        $in: idsForDeletion
                    }
                }
            );

            // Log success
            logger.info(`Activities deleted successfully for user ${this._userId}`);
            
            // Return success
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Delete all activities for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.deleteAllActivities();
         */
    async deleteAllActivities() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Delete activities failed - userId parameter empty. Must be supplied');
            };

            // Delete all activities for the specified user
            await Activities.deleteMany(
                {
                    user: this._userId
                }
            );

            // Log success
            logger.info(`All activities deleted successfully for user ${this._userId}`);
            
            // Return success
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Get all activities for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.getAllActivities();
         */
    async getAllActivities() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Get all activities failed - userId parameter empty. Must be supplied');
            };

            // Get the existing activities for the specified user from the activities collection
            // Use .lean() to get the clean record
            const activities = await Activities.find({ user: this._userId }).lean();

            // If no activities for the user found throw error
            if (!activities) {
                throw new Error(`Get all activities failed - no activities for the user found. ${this._userId}`);
            };

            // Log success
            logger.info(`All activities retrieved successfully for user ${this._userId}`);

            // Return success and data
            return {
                success: true,
                user: this._userId,
                data: activities
            };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Check activity in use for the specified user
         * via the userId and activityId properties of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.checkActivityInUse();
         */
    async checkActivityInUse() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error('Check activity in use failed - userId parameter empty. Must be supplied')
            };

            // Check activityId parameter exists
            if (!this._activityId) {
                throw new Error(`Check activity in use failed - activityId parameter empty. Must be supplied. ${this._userId}`)
            };

            // Get the existing activities for the specified user from the activities collection
            const activities = await Activities.find({ user: this._userId });

            // If no activities for the user found throw error
            if (!activities) {
                throw new Error(`Check activity in use failed - no activities for the user found. ${this._userId}`);
            };            

            // Try to get the specified activity from the user's settings
            const activity = activities.find(activity => activity.id === this._activityId);
            
            // If the specified activity does not exists throw error
            if (!activity) {
                throw new Error(`Check activity in use failed - activity does not exist. ${this._userId}`);
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
            
            // Log success
            logger.info(`Retrieved activity in use status successfully for user ${this._userId}`);

            // Return success and data response
            return {
                success: true,
                user: this._userId,
                inuse: inUse,
                data: activity
            };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };

    /**
         * Delete settings for the specified user
         * via the userId property of the class constructor.
         * 
         * @returns {Promise<Object>} - A promise that resolves to a response object
         * @example
         * const SettingsService = new SettingsService({
         *   userId: ""
         * });
         * 
         * await SettingsService.deleteSettings();
         */
    async deleteSettings() {
        try {
            // Check userId parameter exists
            if (!this._userId) {
                throw new Error(`Delete settings failed - userId parameter empty. Must be supplied`);
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: this._userId }
            ).lean();

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error(`Delete settings failed - settings object for user not found - ${this._userId}`);
            };

            // Delete the user settings object
            await Setting.deleteOne(
                {
                    user: this._userId
                }
            );

            // Log success
            logger.info(`Settings deleted successfully for user ${this._userId}`);
            
            // Return success
            return { success: true, user: this._userId };

        } catch (err) {
            logger.error(err.message);
            throw err;
        };
    };
};
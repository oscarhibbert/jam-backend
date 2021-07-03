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
        /** Set allowed tag types. */
        this.tagTypes = ["General Activity", "Soothing Activity"];
        /** Set allowed activity types. */
        this.activityTypes = ["Soothing"];
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
       * @desc                                                                  Attempt to add tags to the user's settings.
       * @param  {string}                                              userId   String containing the UserId.
       * @param  {[{"name":"Example Name","type":"General Activity"}]} tags     Array containing tags as objects.
       * @return                                                                Object with success boolean.
       */
    async addTags(userId, tags) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Add tags failed - userId parameter empty. Must be supplied.')
            };

            // Check tags parameter exists
            if (!tags) {
                throw new Error('Add tags failed - tags parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Add tags failed - settings object for user not found.')
            };

            // Else, continue
            // Get existing tags
            const existingTags = settings.tags;

            // Get new tags array and put them into newTags variable
            const newTags = tags;
                
            /* Check newTags array of tag objects for errors */
            for (const newTag of newTags) {
                
                // Check tag name exists
                if (!newTag.name) {
                    throw new Error(`Add tags failed - tag missing name. Must be supplied.`);
                };

                // Check tag type exists
                if (!newTag.type) {
                    throw new Error(`Add tags failed - tag '${newTag.name}' missing type. Must be supplied.`);
                };

                // Check activity type for newTag is valid
                /* Check newTag.type is correct activity. If tagTypes
                    does not include newTag.type, throw error. */
                if (!this.tagTypes.includes(newTag.type)) {
                    throw new Error(`Add tags failed - type '${newTag.type}' for tag '${newTag.name}' is invalid.`);
                };
                continue;
            };

            // Check newTag names for duplicate against existing tags
            for (const existingTag of existingTags) {
                for (const newTag of newTags) {
                    if (existingTag.name === newTag.name) {
                        throw new Error(`Add tags failed - tag name '${newTag.name}' is already in use. Check value for key 'name'.`);
                    };
                    continue;
                };
                continue;
            };
            
            // Add newTags into the tags array in the user's settings object
            await Setting.findOneAndUpdate(
                { user: userId },
                { $push: { tags: newTags } }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                  Attempt to edit tag.
       * @param  {string}    userId             String containing the UserId.
       * @param  {string}    tagId              String containing the tagId to be updated.
       * @param  {string}    tagName            String containing the new tagName. Can be null.
       * @param  {string}    tagType            String containing the new tagType. Can be null.
       * @return                                Object with success boolean.
       */
    async editTag(userId, tagId, tagName, tagType) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Edit tag failed - userId parameter empty. Must be supplied.')
            };

            // Check tagId parameter exists
            if (!tagId) {
                throw new Error('Edit tag failed - tagId parameter empty. Must be supplied.')
            };

            // If at least tagName or tagType parameter is not provided
            if (!tagName && !tagType) {
                throw new Error('Edit tag failed - tagName & tagType empty. At least one must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Edit tag failed - settings object for user not found.')
            }

            // Set existing tags
            const existingTags = settings.tags;

            // Prepare original tag object
            const originalTag = {};

            // Else, continue

            /* Loop through each existing tag in settings and check the
            specified tag exists. Then set originalTag info. 
            If it doesn't match, throw error.
            */
            let tagFound = false;

            // Check for match
            for (const existingTag of existingTags) {
                if (existingTag.id === tagId) {
                    // Set tag found to true
                    tagFound = true;

                    // Set original tag object
                    originalTag.id = existingTag.id;
                    originalTag.name = existingTag.name;
                    originalTag.type = existingTag.type;

                    break;
                };
                continue;
            }

            // If not found, throw error
            if (tagFound === false) {
                throw new Error('Edit tag failed - existing tag not found. Check tagId parameter.');
            };
                
            /* Check the new tag name is not the same as any of the other tags 
            except it's own name - that is ok. Otherwise, throw error.
            */
            // For each existing tag
            for (const existingTag of existingTags) {
                // If the existing tag name is equal to the new tag name
                if (existingTag.name === tagName) {
                    // If existing tag name and new tag name match, continue (this is ok)
                    if (existingTag.id === tagId) {
                        break;
                    }
                    // Else, as they do not have the same ID throw error as duplicate cannot be created
                    else {
                        throw new Error(`Edit tag failed - tag name '${tagName}' already in use. Check tagName parameter.`);
                    };
                };

                // Otherwise, continue
                continue;
            };

            /* Check tagType is correct activity. If tagType exists
            and tagTypes does not include tagType, throw error. */
            if (tagType && !this.tagTypes.includes(tagType)) {
                throw new Error(`Edit tag failed - tag type '${tagType}' invalid. Check tagType parameter.`);
            };

            // Else, continue

            // Set updatedTag object
            const updatedTag = {};

            // Create updatedTag object
            // Set the _id otherwise it will be overwritten with null by Mongoose b/c of $set. Same with other fields.
            updatedTag._id = originalTag.id;
            // If tagName param is provided, set it into object. Else, keep existingTag.name.
            if (tagName) updatedTag.name = tagName; else { updatedTag.name = originalTag.name };
            // If tagType param is provided, set it into object. Else, keep the existingTag.type.
            if (tagType) updatedTag.type = tagType; else { updatedTag.type = originalTag.type };
         
            // Add newTags into the tags array in the user's settings object
            await Setting.findOneAndUpdate(
                { user: userId },
                { $set: { "tags.$[el]": updatedTag } },
                { arrayFilters: [{ "el._id": tagId }] }
            );

            // Return response
            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                  Attempt to delete tags.
       * @param  {string}             userId    String containing the UserId.
       * @param  {[{id:"123456"}]}    tags      Array of tag objects to be deleted. Each object must include _id.
       * @return                                Object with success boolean.
       */
    async deleteTags(userId, tags) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Delete tags failed - userId parameter empty. Must be supplied.');
            };

            // Check tags parameter exists
            if (!tags) {
                throw new Error('Delete tags failed - tags parameter empty. Must be supplied.');
            };

            // Set idsForDeletion array
            const idsForDeletion = [];

            // Check all tags supplied include the key _id, add _id to array
            for (const tag of tags) {
                // Check _id key for tag exists
                if (!tag.id) {
                    throw new Error(`Delete tags failed - a tag object is missing required key 'id'.`);
                };

                // Else

                // Add id to idsForDeletion array
                idsForDeletion.push(tag.id);

                continue;
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Delete tags failed - settings object for user not found.');
            };

            // Get tags from settings
            const getTags = settings.tags;

            // Set existingTags array
            const existingTags = [];

            // Have to create this array b/c _id has to be converted to a string
            for (const tag of getTags) {
                existingTags.push(tag.id);
            };

            // If ID in parameter does not exist, throw error
            for (const id of idsForDeletion) {
                // If ID is not included in existingTags, throw error
                if (!existingTags.includes(id)) {
                    throw new Error(`Delete tags failed - tag with ID '${id}' does not exist.`);
                };

                // Else, continue
                continue;
            };

            // Delete tag objects from the user's tag array in the settings object
            await Setting.updateOne(
                { user: userId },
                { $pull: { tags: { _id: idsForDeletion } } }
            );

            return { success: true };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                  Attempt to get all tags for specified user.
       * @param      {string}        userId     String containing the UserId.
       * @return                                Object with success boolean and key called data with array of tags.
       */
    async getAllTags(userId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Get all tags failed - userId parameter empty. Must be supplied.');
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne(
                { user: userId }
            );

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Get all tags failed - settings object for user not found.');
            };

            // Get tags
            const tags = settings.tags.toObject();

            // Return success and data
            console.log(tags);
            return {
                success: true,
                data: tags
            };

        } catch (err) {
            console.error(err.message);
            throw err;
        };
    };

    /**
       * @desc                                  Attempt to check whether tag is in use.
       * @param  {string}             userId    String containing the userId.
       * @param  {string}             tagId     tagId to be checked as a string.
       * @return                                Object with success boolean and exists boolean.
    */
    async checkTagInUse(userId, tagId) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Check tag in use failed - userId parameter empty. Must be supplied.')
            };

            // Check tagId parameter exists
            if (!tagId) {
                throw new Error('Check tag in use failed - tagId parameter empty. Must be supplied.')
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId });

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Check tag in use failed - settings object for user not found.')
            };

            // Try to get the specified tag from the user's settings
            const tag = settings.tags.find(tag => tag.id === tagId);
            
            // If the specified tag does not exists throw error
            if (!tag) {
                throw new Error('Check tag in use failed - tag does not exist.');
            };

            // Count how many journal entries use this tag
            const checkTag = await Entry.countDocuments(
                {
                    tags: {
                        $elemMatch: {
                            _id: tag.id
                        }
                    }
                }
            );

            // Set exists variable
            let inUse;

            // If check tag exists set exists to true
            if (checkTag > 0) inUse = true;

            // if check tag does not exist set exists to false
            if (checkTag === 0) inUse = false;

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
       * @param  {[{"name":"Example Name","type":"Soothing"}]}         activities     Array containing activities as objects.
       * @return                                                                      Object with success boolean.
       */
    async addActivities(userId, activities) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Add activities failed - userId parameter empty. Must be supplied.')
            };

            // Check tags parameter exists
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

            // Check newActivity names for duplicate against existing tags
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
};
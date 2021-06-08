// Model imports
// Model imports
const Setting = require('../models/Setting');

/**
 * @description Create an instance of the SettingsService class.
 */
module.exports = class SettingsService {
/**
     * Represents the SettingsService constructor.
     * @constructor
     */
    constructor() {
        /** Set allowed activity types (tag types). */
        this.activityTypes = ["General Activity", "Soothing Activity"];
    };
/**
   * @desc                                                                  Attempt to add tags to the user's settings.
   * @param  {string}                                              userId   String containing the UserId.
   * @param  {[{"tag":"Example Name","type":"General Activity"}]}  tags     Array containing tags as objects.
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
            // Set existing tags
            const existingTags = settings.tags;

            // Set tags into newTags variable
            const newTags = tags;
                
            /* Check newTags array of tag objects for errors */
            for (newTag of newTags) {
                
                // Check tag name exists
                if (!newTag.tag) {
                    throw new Error(`Add tags failed - tag missing name. Must be supplied.`);
                };

                // Check tag type exists
                if (!newTag.type) {
                    throw new Error(`Add tags failed - tag '${newTag.tag}' missing type. Must be supplied.`);
                };

                // Check activity type for newTag is valid
                /* Check newTag.type is correct activity. If activityTypes
                    does not include newTag.type, throw error. */
                if (!this.activityTypes.includes(newTag.type)) {
                    throw new Error(`Add tags failed - type '${newTag.type}' for tag '${newTag.tag}' is invalid.`);
                };
                continue;
            };

            // Check newTag names for duplicate against existing tags
            for (existingTag of existingTags) {
                for (newTag of newTags) {
                    if (existingTag.tag === newTag.tag) {
                    throw new Error(`Add tags failed - tag name '${newTag.tag}' is already in use. Check value for key 'tag'.`);
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
            return { success: false };
        }
};

/**
   * @desc                                  Attempt to edit tag.
   * @param  {string}    userId             String containing the UserId.
   * @param  {string}    tagId              String containing the tagId to be updated.
   * @param  {string}    TagName            String containing the new tagName. Can be null.
   * @param  {string}    TagType            String containing the new tagType. Can be null.
   * @return                                Object with success boolean.
   */ 
    async editTag(userId, tagId, tagName, tagType) {
        try {
            // Check userId parameter exists
            if (!userId) {
                throw new Error('Edit tags failed - userId parameter empty. Must be supplied.')
            };

            // Check userId parameter exists
            if (!tagId) {
                throw new Error('Edit tags failed - tagId parameter empty. Must be supplied.')
            };

            // Check the settings object exists for this user
            const settings = await Setting.findOne({ user: userId }).lean();

            // If settings object for user not found throw error
            if (!settings) {
                throw new Error('Edit tags failed - settings object for user not found.')
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
            for (existingTag of existingTags) {
                if (existingTag._id.toString() === tagId) {
                    // Set tag found to true
                    tagFound = true;

                    // Set original tag object
                    originalTag._id = existingTag._id.toString();
                    originalTag.tag = existingTag.tag;
                    originalTag.type = existingTag.type;

                    continue;
                };
                continue;
            };

            // If not found, throw error
            if (tagFound === false) {
                throw new Error('Update tag failed - existing tag not found. Check tagId parameter.');
            };
                
            /* Check the new tag name is not the same as any of the other tags 
            except it's own name - that is ok. Otherwise, throw error.
            */
            // For each existing tag
            for (existingTag of existingTags) {
                // If the existing tag name is equal to the new tag name
                if (existingTag.tag === tagName) {
                    // If existing tag name and new tag name match, continue (this is ok)
                    if (existingTag._id.toString() === tagId) {
                        continue;
                    }
                    // Else, as they do not have the same ID throw error as duplicate cannot be created
                    else {
                        throw new Error(`Update tag failed - tag name '${tagName}' already in use. Check tagName parameter.`);
                    };
                };

                // Otherwise, continue
                continue;
            };

            /* Check tagType is correct activity. If tagType exists
            and activityTypes does not include tagType, throw error. */
            if (tagType && !this.activityTypes.includes(tagType)) {
                throw new Error(`Update tag failed - tag type '${tagType}' invalid. Check tagType parameter.`);
            };

            // Else, continue

            // Set updatedTag object
            const updatedTag = {};

            // Create updatedTag object
            // Set the _id otherwise it will be changed by Mongoose b/c of $set. Same with other fields.
            updatedTag._id = originalTag._id;
            // If tagName param is provided, set it into object. Else, keep existingTag.tag.
            if (tagName) updatedTag.tag = tagName; else { updatedTag.tag = originalTag.tag };
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
            return { success: false };
        }
};

/**
   * @desc                                  Attempt to delete tags.
   * @param  {string}              userId   String containing the UserId.
   * @param  {[{_id:"123456"}]}    tags     Array of tag objects to be deleted. Each object must include _id.
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
            for (tag of tags) {
                // Check _id key for tag exists
                if (!tag._id) {
                    throw new Error(`Delete tags failed - a tag object is missing required key '_id'.`);
                };

                // Else

                // Add _id to idsForDeletion array
                idsForDeletion.push(tag._id.toString());

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
            for (tag of getTags) {
                existingTags.push(tag._id.toString());
            };

            // If ID in parameter does not exist, throw error
            for (id of idsForDeletion) {
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
                { $pull: {tags: {_id: idsForDeletion}} }
            );

            return { success: true };

        } catch (err) {
            console.error(err.message);
            return { success: false };
        };
    };
    
    async setReflectionAlertTime() {

    }
}
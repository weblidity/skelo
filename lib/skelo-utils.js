const fs = require('fs');
const yamljs = require('yamljs');
const path = require('path');

const { getFilesFromPatterns, getParentPath, getPathSlugify, setExtensionIfMissing, slugify } = require('./skelo-files');
const { getSchema, validateFiles } = require('./skelo-schema');
const { renderTemplate } = require('./skelo-template');

const LINK = 1;
const CATEGORY = 2;
const TOPIC = 3;

const SIDEBAR_ITEM_TYPE = {
    CATEGORY,
    LINK,
    TOPIC,
};

/**
 * Provides utility functions and operations for managing sidebar items and layouts.
 *
 * This module includes functions for building different types of sidebar items
 * (categories, links, topics), validating files against a schema, rendering templates,
 * and handling file operations related to sidebars. It also includes constants for
 * sidebar item types and functions for detecting duplicated sidebar labels.
 *
 * Functions:
 * - getItemType: Determines the type of a sidebar item.
 * - buildCategory: Constructs a category sidebar item.
 * - buildLink: Constructs a link sidebar item.
 * - buildTopic: Constructs a topic sidebar item and saves it.
 * - buildCategoryItems: Builds sidebar items for a category.
 * - buildSidebarItems: Builds sidebar items from a list.
 * - buildSidebarsLayout: Generates a layout for sidebars based on file patterns.
 * - validateFilesAndShowDuplicatedLabels: Validates files and identifies duplicated sidebar labels.
 * - saveTopic: Saves a topic item to a file.
 * - saveDocument: Saves content to a specified file path.
 * - findDuplicatedSidebarLabels: Finds duplicated labels in sidebar files.
 * - getSidebars: Retrieves sidebar data from a YAML file.
 * - normalizeItem: Normalizes a sidebar item structure.
 * - generateSidebarsFile: Generates a sidebars file from data and options.
 *
 * Constants:
 * - SIDEBAR_ITEM_TYPE: Enum for sidebar item types (CATEGORY, LINK, TOPIC).
 */

//
// Utility functions
//

/**
 * Determines the type of a sidebar item.
 *
 * The function takes an item object as its argument and returns a string
 * indicating the type of the item. The possible values returned are:
 * - 'INVALID_ITEM' if the item is not an object or is an array.
 * - 'UNKNOWN' if the item is missing a label property or if the label is
 *   not a string or is an empty string.
 * - 'LINK' if the item is a link with a valid href property.
 * - 'CATEGORY' if the item is a category with at least one item.
 * - 'TOPIC' if the item is a topic with no items.
 *
 * @param {object} item - A sidebar item object.
 * @returns {string} The type of the sidebar item.
 */
function getItemType(item) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return 'INVALID_ITEM';
    }

    if (!item.label || typeof item.label !== 'string' || item.label.length === 0) {
        return 'UNKNOWN';
    }

    if (item.href && typeof item.href === 'string' && item.href.length > 0) {
        return LINK;
    }

    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
        return CATEGORY;
    }

    if (!item.items || (Array.isArray(item.items) && item.items.length === 0)) {
        return TOPIC;
    }
}

//
// Functions related to building sidebar items
//

/**
 * Constructs a category sidebar item.
 *
 * The function takes an item object and an options object as arguments and
 * returns a category sidebar item object. The item object must have a label
 * property with a string value. The options object is passed to buildCategoryItems
 * to build the items array.
 *
 * @param {object} item - An item object with a label property.
 * @param {object} options - Options for building the items array.
 * @returns {object} A category sidebar item object.
 */
function buildCategory(item, options) {
    if (typeof item !== 'object' || item === null) {
        throw new Error('Item must be an object');
    }

    if (typeof item.label !== 'string') {
        throw new Error('Item label must be a string');
    }

    return {
        type: 'category',
        label: item.label,
        items: buildCategoryItems(item.items, options)
    }
}

/**
 * Constructs a link sidebar item.
 *
 * The function takes an item object and an options object as arguments and
 * returns a link sidebar item object. The item object must have a label and
 * href property with string values. An optional title property can also be
 * provided. The options object is not used in the current implementation but
 * is included for potential future use.
 *
 * @param {object} item - An item object with label, href, and optional title properties.
 * @param {object} options - Options for building the link item (not currently used).
 * @returns {object} A link sidebar item object.
 */
function buildLink(item, options) {
    const { label, href, title } = item;
    return {
        type: 'link',
        label,
        title,
        href
    };
}

/**
 * Constructs a topic sidebar item and saves it.
 *
 * The function takes an item object and an options object as arguments and
 * returns the href of the topic item. The item object must have a label and
 * path property with string values. An optional id and slug property can
 * also be provided. The options object must have a parentPath property with a
 * string value. The function saves the topic item to a file and returns the
 * href of the topic item.
 *
 * @param {object} item - An item object with label, path, and optional id and slug properties.
 * @param {object} options - Options for saving the topic item, including the parentPath property.
 * @returns {string} The href of the topic item.
 */
function buildTopic(item, options) {
    const { label, slug, id } = item;
    const topicPath = getParentPath(options.parentPath, item.path);
    const itemId = id || slug || slugify(label);
    const href = [topicPath, itemId].filter(item => item.length > 0).join('/');
    saveTopic(item, href, options);
    return href;
}

/**
 * Builds an array of sidebar items filtered and constructed based on their type.
 *
 * This function processes a given array of items, filters them by checking if
 * their type is one of the recognized sidebar item types (TOPIC, LINK, CATEGORY),
 * and then constructs each valid item using the appropriate build function.
 *
 * @param {Array} items - An array of sidebar item objects to be processed.
 * @param {Object} options - Options used for constructing sidebar items.
 * @returns {Array} An array of constructed sidebar items, filtered by type.
 */
function buildCategoryItems(items, options) {
    const filteredItems = items.filter(item => [TOPIC, LINK, CATEGORY].includes(getItemType(item)));
    return filteredItems.map(item => {
        switch (getItemType(item)) {
            case CATEGORY:
                return buildCategory(item, options);
            case TOPIC:
                return buildTopic(item, options);
            case LINK:
                return buildLink(item, options);
            default:
                return null;
        }
    }).filter(item => item !== null);
}

/**
 * Builds an array of sidebar items, filtered by type (TOPIC, CATEGORY) and constructed using the appropriate build functions.
 *
 * This function processes a given array of items, filters them by checking if
 * their type is one of the recognized sidebar item types (TOPIC, CATEGORY),
 * and then constructs each valid item using the appropriate build function.
 *
 * @param {Array} items - An array of sidebar item objects to be processed.
 * @param {Object} options - Options used for constructing sidebar items.
 * @returns {Array} An array of constructed sidebar items, filtered by type.
 */
function buildSidebarItems(items, options) {
    const filteredItems = items.filter(item => [TOPIC, CATEGORY].includes(getItemType(item)));
    return filteredItems.map(item => {
        switch (getItemType(item)) {
            case CATEGORY:
                return buildCategory(item, options);
            case TOPIC:
                return buildTopic(item, options);
            default:
                return null;
        }
    }).filter(item => item !== null);
}

//
// Functions related to sidebar layout and validation
//

/**
 * Builds a layout for sidebars by processing a given array of files and options.
 *
 * This function first retrieves an array of files from the given patterns and
 * options.fallbackPatterns. It then validates the files against a schema and
 * separates them into valid and invalid files. It then finds any duplicated
 * sidebar labels in the valid files and builds a sidebars layout by reducing the
 * valid files into a single object. Each key in the object is a sidebar label
 * and each value is an array of sidebar items, filtered to exclude any items with
 * duplicated labels. Finally, it returns the generated sidebars layout.
 *
 * @param {Array} patterns - Glob patterns for outline files.
 * @param {Object} options - Options used for constructing sidebar items.
 * @returns {Object} A layout for sidebars, with each key being a sidebar label and
 * each value being an array of sidebar items.
 */
function buildSidebarsLayout(patterns, options) {
    const files = getFilesFromPatterns(patterns, options.fallbackPatterns);
    try {
        const schema = getSchema(options);
        const { validFiles, invalidFiles } = validateFiles(files, schema);
        const { duplicatedSidebarLabels, sidebarLabelsSummary } = findDuplicatedSidebarLabels(validFiles);

        const generatedSidebarsLayout = validFiles.reduce((acc, file) => {
            const { sidebars, ...rest } = getSidebars(file);
            sidebars.filter((sidebar) => !duplicatedSidebarLabels.includes(sidebar.label)).forEach(sidebar => {
                const { label, items = [] } = sidebar;
                const parentPath = getParentPath(options.path);
                options = (parentPath) ? { ...options, parentPath } : options;
                acc[label] = buildSidebarItems(items, options);
            });
            return acc;
        }, {});

        return generatedSidebarsLayout;
    } catch (error) {
        console.error(error);
        return {};
    }
}

/**
 * Validates outline files against a schema and identifies duplicated sidebar labels.
 *
 * This function processes an array of file patterns and options to retrieve and
 * validate files against a specified schema. It logs any invalid files and identifies
 * duplicated sidebar labels among the valid ones. A summary of label occurrences
 * across files is also printed.
 *
 * @param {Array} patterns - Glob patterns for outline files.
 * @param {Object} options - Options for file processing and validation, including:
 *   @param {Array} [options.fallbackPatterns] - Fallback glob patterns if no files are found.
 *
 * @throws {Error} Logs errors encountered during file retrieval, validation, or label processing.
 */
function validateFilesAndShowDuplicatedLabels(patterns, options) {
    try {
        // Retrieve files from patterns and fallback patterns
        const fallbackPatterns = options.fallbackPatterns || [];
        const files = getFilesFromPatterns(patterns, fallbackPatterns);

        // Validate files against a schema
        const schema = getSchema(options);
        const { validFiles, invalidFiles } = validateFiles(files, schema);

        // Print any invalid files
        if (Object.keys(invalidFiles).length > 0) {
            console.warn('Invalid files: ');
            Object.keys(invalidFiles).sort().forEach(filename => console.warn(`- ${filename}`));
        }

        // Find duplicated sidebar labels and print a summary of label occurrences
        try {
            const { duplicatedSidebarLabels, sidebarLabelsSummary } = findDuplicatedSidebarLabels(validFiles);
            if (duplicatedSidebarLabels.length > 0) {
                console.log(`Duplicated sidebar labels: ${duplicatedSidebarLabels.sort().join(', ')}`);
            }

            console.log('Label summary: ');
            Object.keys(sidebarLabelsSummary).sort().forEach(label => {
                const labelInfo = sidebarLabelsSummary[label];
                console.log(`  Label: ${label}, Total Count: ${Object.values(labelInfo.files).reduce((a, b) => a + b, 0)}`);
                console.log('    Files: ');
                Object.keys(labelInfo.files)
                    .sort()
                    .forEach(file => console.log(`      - ${file}: ${labelInfo.files[file]}`));
            });
        } catch (error) {
            console.error('Error finding duplicated sidebar labels:', error.message);
        }
    } catch (error) {
        console.error('validateFilesAndShowDuplicatedLabels: Error:', error.message);
    }
}

//
// Functions related to file operations
//

/**
 * Saves a topic item to a markdown file.
 *
 * @param {Object} item - A topic item object to be saved.
 * @param {string} topicBasename - The base name for the topic file, which will be
 *   slugified and used as the filename.
 * @param {Object} options - Options for saving the topic, including:
 *   @param {string} options.docs - The path to the Docusaurus documentation
 *     directory.
 *
 * @throws {Error} If options.docs or topicBasename are not strings.
 */
function saveTopic(item, topicBasename, options) {
    if (typeof options.docs !== 'string' || typeof topicBasename !== 'string') {
        throw new Error('Invalid input: `options.docs` and `topicBasename` must be strings.');
    }

    const content = buildTopicContent(item, options);

    const topicFilename = [getPathSlugify(options.docs), topicBasename].filter(item => item.length > 0).join('/');
    const topicFilenameWithExtension = setExtensionIfMissing(topicFilename, '.md');
    saveDocument(topicFilenameWithExtension, content);
}

function buildTopicContent(item, options) {
    const { label, title } = item;
    return renderTemplate('topic', { label, title}, options);
}

/**
 * Saves content to a specified file path, creating directories if necessary.
 *
 * @param {string} filePath - The path to the file where content should be saved.
 * @param {string} content - The content to save in the file.
 * @throws {Error} If the filePath is not a valid string, or if content is null or undefined.
 */
function saveDocument(filePath, content) {
    // Validate filePath is a non-empty string
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid filePath: expected a non-empty string.');
    }

    // Ensure content is not null or undefined
    if (content === null || content === undefined) {
        throw new Error('Invalid content: cannot be null or undefined.');
    }

    // Extract directory path from the file path
    const directory = path.parse(filePath).dir;

    // Create directory recursively if it doesn't exist
    if (directory && !fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    // Write content to the file in UTF-8 encoding
    fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Finds duplicated sidebar labels in the valid files.
 *
 * This function iterates over the valid files and creates an object that summarizes
 * the sidebar labels. The object has two properties: duplicatedSidebarLabels and
 * sidebarLabelsSummary.
 *
 * duplicatedSidebarLabels is an array of sidebar labels that are duplicated across
 * files. sidebarLabelsSummary is an object with label keys and values that contain
 * the count of the label and an object with file names as keys and the count of the
 * label in that file as the value.
 *
 * @param {Array<string>} validFiles - An array of file paths for valid outline files.
 * @returns {Object} An object with two properties: duplicatedSidebarLabels and sidebarLabelsSummary.
 */
function findDuplicatedSidebarLabels(validFiles) {
    if (!validFiles || !Array.isArray(validFiles)) {
        throw new Error('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
    }

    const sidebarLabelsSummary = {};

    // Iterate over the valid files and create the sidebar labels summary.
    validFiles.forEach(file => {
        if (typeof file !== 'string') {
            throw new Error('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
        }

        const { sidebars } = getSidebars(file);

        if (!sidebars || !Array.isArray(sidebars)) {
            throw new Error('findDuplicatedSidebarLabels: sidebars must be an array of objects.');
        }

        // Iterate over the sidebars and count the occurrences of each label.
        sidebars.forEach(sidebar => {
            const label = sidebar.label;

            if (!sidebarLabelsSummary[label]) {
                sidebarLabelsSummary[label] = { count: 0, files: {} };
            }

            sidebarLabelsSummary[label].files[file] = (sidebarLabelsSummary[label].files[file] || 0) + 1;

            // Update the total count of the label.
            sidebarLabelsSummary[label].count = Object.values(sidebarLabelsSummary[label].files).reduce((sum, count) => sum + count, 0);
        });
    });

    // Extract the duplicated sidebar labels from the summary.
    const duplicatedSidebarLabels = Object.keys(sidebarLabelsSummary).filter(label => sidebarLabelsSummary[label].count > 1);

    return { duplicatedSidebarLabels, sidebarLabelsSummary };
}

/**
 * Loads sidebars configuration from a YAML file.
 *
 * This function reads a YAML file, parses its content, and extracts the sidebars array.
 * Each item in the sidebars array is normalized before being returned.
 *
 * @param {string} yamlFilename - The path to the YAML file containing the sidebar configuration.
 * @returns {Object} An object containing the normalized sidebars and any additional properties from the YAML file.
 * @throws {Error} If yamlFilename is not a string or if the YAML content is invalid.
 */
function getSidebars(yamlFilename) {
    if (!yamlFilename || typeof yamlFilename !== 'string') {
        throw new Error('Invalid yamlFilename: expected a non-empty string.');
    }

    try {
        // Load and parse the YAML file content
        const yamlContent = yamljs.load(yamlFilename);
        if (!yamlContent || typeof yamlContent !== 'object') {
            throw new Error('Invalid YAML content: expected an object.');
        }

        const { sidebars, ...rest } = yamlContent;
        if (!Array.isArray(sidebars)) {
            throw new Error('Invalid sidebars: expected an array.');
        }

        // Normalize each sidebar item and return the result
        return { sidebars: sidebars.map(item => normalizeItem(item)), ...rest };
    } catch (error) {
        console.error('Error reading or parsing YAML file:', error);
        return { fileSidebars: null };
    }
}

/**
 * Normalizes a sidebar item to ensure it has a valid label and items property.
 *
 * If the item is a string, it is converted to an object with a label property
 * set to the string value.
 * If the item is an object, it is modified in place to ensure it has a valid
 * label and items property.
 * If the item has a single property, the property key is used as the label and
 * the property value is used as the items array.
 * If the item has a label property, it is trimmed and set to the trimmed value.
 * If the item has an items property, it is normalized recursively.
 * If the item has a headings property, it is normalized recursively.
 * If the item has both items and headings properties, an error is thrown.
 *
 * @param {object|string} item - The sidebar item to normalize.
 * @returns {object} The normalized sidebar item.
 * @throws {Error} If the item is invalid.
 */
function normalizeItem(item) {
    // Validate the item is a string or an object
    if (item == null || (typeof item !== 'string' && typeof item !== 'object')) {
        throw new Error('Item must be a string or an object.');
    }

    // Normalize a string item to an object
    if (typeof item === 'string') {
        item = { label: item };
    }

    // Normalize an object item with a single property to have a label property
    if (typeof item === 'object' && !item.label && Object.keys(item).length === 1) {
        const firstPropertyKey = Object.keys(item)[0];
        const firstPropertyValue = item[firstPropertyKey];
        if (!Array.isArray(firstPropertyValue)) {
            throw new Error(`Invalid sidebar item: ${firstPropertyKey} property must be an array if item is an object with a single property.`);
        }

        item = { label: firstPropertyKey, items: firstPropertyValue };
    }

    // Validate the item has a valid label property
    if (!item.label || typeof item.label !== 'string' || item.label.trim() === '') {
        throw new Error(`Invalid sidebar label for item: ${item.label}`);
    }

    // Trim the item's label property
    item.label = item.label.trim();

    // Normalize the item's items property
    if (item.items) {
        if (!Array.isArray(item.items)) {
            throw new Error(`Invalid 'items' property for item: ${item.label}`);
        }

        item.items = item.items.map(normalizeItem);
    }

    // Normalize the item's headings property
    if (item.headings) {
        if (!Array.isArray(item.headings)) {
            throw new Error(`Invalid 'headings' property for item: ${item.label}`);
        }

        item.headings = item.headings.map(normalizeItem);
    }

    // Validate the item does not have both items and headings properties
    if (item.items && item.headings) {
        throw new Error(`Item cannot have both 'items' and 'headings' properties: ${item.label}`);
    }

    return item;
}

//
// Functions related to rendering templates
//

/**
 * Generates a sidebars file from data and options.
 *
 * This function renders a sidebars template using the sidebarsData and options,
 * and then writes the rendered content to a file specified by
 * options.sidebarsFilename. If options.verbose is true, it logs a message
 * indicating the file was written.
 *
 * @param {Object} sidebarsData - The data to be written to the sidebars file.
 * @param {Object} options - Options for generating the sidebars file.
 * @param {string} options.sidebarsFilename - The path to the sidebars file to be generated.
 * @param {boolean} [options.verbose] - Whether to log information about the sidebars file being written.
 * @throws {Error} If sidebarsData or options are missing.
 * @throws {Error} If options.sidebarsFilename is missing.
 * @throws {Error} If there is an error writing the sidebars file.
 */
function generateSidebarsFile(sidebarsData, options) {
    // Validate arguments
    if (!sidebarsData || !options) {
        throw new Error('generateSidebarsFile: sidebarsData and options are required');
    }

    const sidebarsFilename = options.sidebarsFilename;
    if (!sidebarsFilename) {
        throw new Error('generateSidebarsFile: options.sidebarsFilename is required');
    }

    // Render the sidebars template
    const outputContent = renderTemplate('sidebars', { sidebars: JSON.stringify(sidebarsData, null, 2) }, options);

    // Determine the output filename
    const outputFilename = setExtensionIfMissing(sidebarsFilename, '.js');

    try {
        // Write the rendered content to the file
        saveDocument(outputFilename, outputContent);

        // Log a message if verbose
        if (options.verbose) {
            console.log(`Wrote sidebars file to ${outputFilename}`);
        }
    } catch (error) {
        // Log an error if verbose
        if (options.verbose) {
            console.error('Error generating sidebars file:', error);
        }

        // Rethrow the error
        throw error;
    }
}

module.exports = {
    buildCategory,
    buildCategoryItems,
    buildLink,
    buildSidebarItems,
    buildSidebarsLayout,
    buildTopic,
    findDuplicatedSidebarLabels,
    generateSidebarsFile,
    getItemType,
    getSidebars,
    normalizeItem,
    saveDocument,
    saveTopic,
    validateFilesAndShowDuplicatedLabels,
    SIDEBAR_ITEM_TYPE,
};
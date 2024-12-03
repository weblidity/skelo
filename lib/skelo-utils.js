const fs = require('fs');
const glob = require('glob');
const Handlebars = require('handlebars');
const { Validator } = require('jsonschema');
const yamljs = require('yamljs');
const path = require('path');

const {buildSidebarItems} = require('./skelo-build');
const {getFilesFromPatterns, getParentPath, getPathSlugify, setExtensionIfMissing, slugify} = require('./skelo-files');

const {getSchema, validateFiles} = require('./skelo-schema');
const {renderTemplate} = require('./skelo-template');

/**
 * Constructs the sidebar layout for Docusaurus documentation by processing outline files.
 *
 * This function takes an array of patterns and options to retrieve and validate outline files.
 * It identifies duplicated sidebar labels and constructs the sidebar layout, excluding any
 * duplicated labels. The constructed layout is based on the valid outline files and their
 * respective sidebar items.
 *
 * @param {Array} patterns - An array of glob patterns used to identify outline files.
 * @param {Object} options - Configuration options, including fallback patterns and path settings.
 * @returns {Object} The generated sidebar layout, where each key is a unique sidebar label and
 *                   its value is an array of constructed sidebar items.
 */
function buildSidebarsLayout(patterns, options) {
    const files = getFilesFromPatterns(patterns, options.fallbackPatterns);
    // TODO: log information that no outline files were found, show patterns
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
 * Identifies duplicated sidebar labels across multiple YAML files.
 *
 * This function processes an array of file paths, each expected to contain
 * YAML data with a 'sidebars' array. It checks for duplicated labels within
 * these sidebars and returns a summary of the findings.
 *
 * @param {string[]} validFiles - An array of file paths to YAML files.
 * @returns {Object} An object containing:
 *   - duplicatedSidebarLabels: An array of labels that appear more than once.
 *   - sidebarLabelsSummary: An object summarizing the occurrence of each label
 *     across the provided files.
 *
 * @throws {Error} If 'validFiles' is not an array of strings, or if the
 *         'sidebars' in any file is not an array of objects.
 */
function findDuplicatedSidebarLabels(validFiles) {
    // Validate input
    if (!validFiles || !Array.isArray(validFiles)) {
        throw new Error('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
    }

    const sidebarLabelsSummary = {};

    validFiles.forEach(file => {
        // Validate each file path
        if (typeof file !== 'string') {
            throw new Error('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
        }

        const { sidebars } = getSidebars(file);

        // Ensure sidebars is an array
        if (!sidebars || !Array.isArray(sidebars)) {
            throw new Error('findDuplicatedSidebarLabels: sidebars must be an array of objects.');
        }

        // Process each sidebar
        sidebars.forEach(sidebar => {
            const label = sidebar.label;

            // Initialize label summary if not already present
            if (!sidebarLabelsSummary[label]) {
                sidebarLabelsSummary[label] = { count: 0, files: {} };
            }

            // Update counts for each file
            sidebarLabelsSummary[label].files[file] = (sidebarLabelsSummary[label].files[file] || 0) + 1;

            // Calculate total count across files
            sidebarLabelsSummary[label].count = Object.values(sidebarLabelsSummary[label].files).reduce((sum, count) => sum + count, 0);
        });
    });

    // Determine duplicated labels
    const duplicatedSidebarLabels = Object.keys(sidebarLabelsSummary).filter(label => sidebarLabelsSummary[label].count > 1);

    return { duplicatedSidebarLabels, sidebarLabelsSummary };
}

/**
 * Generates a sidebars file using the provided sidebar data and options.
 *
 * @param {Object} sidebarsData - The data to be used for generating the sidebars.
 * @param {Object} options - Configuration options for generating the sidebars file.
 * @param {string} options.sidebarsFilename - The filename for the output sidebars file.
 * @param {boolean} [options.verbose=false] - If true, logs messages to the console.
 *
 * @throws {Error} Throws an error if sidebarsData, options, or options.sidebarsFilename are null or undefined.
 * @throws {Error} Throws an error if the file system module (fs) is null.
 *
 * @description
 * This function compiles a Handlebars template named 'sidebars' with the provided sidebar data,
 * writes the compiled content to a file with the specified filename, and logs the operation if verbose mode is enabled.
 */
function generateSidebarsFile(sidebarsData, options) {
    // Validate input
    if (!sidebarsData || !options) {
        throw new Error('generateSidebarsFile: sidebarsData and options are required');
    }

    // Validate sidebarsFilename
    const sidebarsFilename = options.sidebarsFilename;
    if (!sidebarsFilename) {
        throw new Error('generateSidebarsFile: options.sidebarsFilename is required');
    }

    // Render the sidebars template with the provided data
    const outputContent = renderTemplate('sidebars', { sidebars: JSON.stringify(sidebarsData, null, 2) }, options);

    // Construct the output filename
    const outputFilename = setExtensionIfMissing(sidebarsFilename, '.js');

    try {
        // Save the rendered content to the file
        saveDocument(outputFilename, outputContent);

        // Log the operation if verbose mode is enabled
        if (options.verbose) {
            console.log(`Wrote sidebars file to ${outputFilename}`);
        }
    } catch (error) {
        // Log any errors if verbose mode is enabled
        if (options.verbose) {
            console.error('Error generating sidebars file:', error);
        }

        // Rethrow the error
        throw error;
    }
}

/**
 * Retrieves and normalizes sidebar data from a YAML file.
 *
 * @param {string} yamlFilename - The path to the YAML file containing sidebar definitions.
 * @returns {Object} An object containing the normalized sidebars and any additional properties.
 * @throws {Error} If the yamlFilename is not a valid string or if the YAML content is invalid.
 * Logs an error and returns an object with `fileSidebars` set to null if reading or parsing fails.
 */
function getSidebars(yamlFilename) {
    if (!yamlFilename || typeof yamlFilename !== 'string') {
        throw new Error('Invalid yamlFilename: expected a non-empty string.');
    }

    try {
        const yamlContent = yamljs.load(yamlFilename);
        if (!yamlContent || typeof yamlContent !== 'object') {
            throw new Error('Invalid YAML content: expected an object.');
        }

        const { sidebars, ...rest } = yamlContent;
        if (!Array.isArray(sidebars)) {
            throw new Error('Invalid sidebars: expected an array.');
        }

        return { sidebars: sidebars.map(item => normalizeItem(item)), ...rest };
    } catch (error) {
        console.error('Error reading or parsing YAML file:', error);
        return { fileSidebars: null };
    }
}

/**
 * Normalizes an item by ensuring it is a valid object with a 'label' property.
 * Converts a string item into an object with a 'label' property.
 * Validates that the item is either a string or an object with specific properties.
 * Throws an error if the item is invalid, such as having both 'items' and 'headings' properties.
 * Recursively normalizes nested 'items' or 'headings' arrays if present.
 *
 * @param {string|object} item - The item to normalize, which can be a string or an object.
 * @returns {object} The normalized item with a 'label' and optionally 'items' or 'headings'.
 * @throws {Error} If the item is not a string or object, or if it has invalid properties.
 */
function normalizeItem(item) {
    /**
     * Ensure the item is a valid object with a 'label' property.
     * If the item is a string, convert it to an object with a 'label' property.
     * If the item is an object with a single property, normalize it to an object with a 'label' property.
     * Throw an error if the item is invalid.
     */
    if (item == null || (typeof item !== 'string' && typeof item !== 'object')) {
        throw new Error('Item must be a string or an object.');
    }

    if (typeof item === 'string') {
        item = { label: item };
    }

    if (typeof item === 'object' && !item.label && Object.keys(item).length === 1) {
        const firstPropertyKey = Object.keys(item)[0];
        const firstPropertyValue = item[firstPropertyKey];
        if (!Array.isArray(firstPropertyValue)) {
            throw new Error(`Invalid sidebar item: ${firstPropertyKey} property must be an array if item is an object with a single property.`);
        }

        item = { label: firstPropertyKey, items: firstPropertyValue };
    }

    /**
     * Validate that the item has a valid 'label' property.
     */
    if (!item.label || typeof item.label !== 'string' || item.label.trim() === '') {
        throw new Error(`Invalid sidebar label for item: ${item.label}`);
    }

    item.label = item.label.trim();

    /**
     * Normalize any nested 'items' or 'headings' arrays if present.
     */
    if (item.items) {
        if (!Array.isArray(item.items)) {
            throw new Error(`Invalid 'items' property for item: ${item.label}`);
        }

        item.items = item.items.map(normalizeItem);
    }

    if (item.headings) {
        if (!Array.isArray(item.headings)) {
            throw new Error(`Invalid 'headings' property for item: ${item.label}`);
        }

        item.headings = item.headings.map(normalizeItem);
    }

    /**
     * Throw an error if the item has both 'items' and 'headings' properties.
     */
    if (item.items && item.headings) {
        throw new Error(`Item cannot have both 'items' and 'headings' properties: ${item.label}`);
    }

    return item;
}

/**
 * Saves the specified content to a file at the given path.
 *
 * @param {string} filePath - The path to the file to write.
 * @param {string} content - The content to write to the file.
 * @throws {Error} If the file path is empty or not a string, or if the content is null or undefined.
 */
function saveDocument(filePath, content) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid filePath: expected a non-empty string.');
    }

    if (content === null || content === undefined) {
        throw new Error('Invalid content: cannot be null or undefined.');
    }

    const directory = path.parse(filePath).dir;
    if (directory && !fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Saves a topic item to a file with the specified basename and options.
 *
 * @param {object} item - The topic item to save.
 * @param {string} topicBasename - The basename for the topic file.
 * @param {object} options - Configuration options, including the docs path.
 * @throws {Error} If options.docs or topicBasename are not strings.
 */
function saveTopic(item, topicBasename, options) {
    if (typeof options.docs !== 'string' || typeof topicBasename !== 'string') {
        throw new Error('Invalid input: `options.docs` and `topicBasename` must be strings.');
    }

    const topicFilename = [getPathSlugify(options.docs), topicBasename].filter(item => item.length > 0).join('/');
    const topicFilenameWithExtension = setExtensionIfMissing(topicFilename, '.md');
    saveDocument(topicFilenameWithExtension, JSON.stringify(item, null, 2));
}

module.exports = {
    buildSidebarsLayout,
    findDuplicatedSidebarLabels,
    generateSidebarsFile,
    getSidebars,
    normalizeItem,
    saveDocument,
    saveTopic,
};
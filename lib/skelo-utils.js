const fs = require('fs');
const Handlebars = require('handlebars');
const glob = require('glob');
const Ajv = require('ajv');
const yamljs = require('yamljs');

function buildSidebarsLayout(patterns, options) {
    const files = getFilesFromPatterns(patterns, options.fallbackPatterns);
    // TODO: log information that no outline files were found, show patterns

    const schema = {type: 'object'}

    const {validFiles, invalidFiles} = validateFiles(files, schema);

    const duplicatedSidebarLabels = findDuplicatedSidebarLabels(validFiles);

    const generatedSidebarsLayout = validFiles.reduce((acc, file) => {
        const {sidebars, ...rest} = getSidebars(file);
        sidebars.filter((sidebar) => !duplicatedSidebarLabels.includes(sidebar.label)).forEach(sidebar => {
            const {label, items = []} = sidebar;
            acc[label] = items;
        })
        return acc;
    }, {})

    return generatedSidebarsLayout;
}


/**
 * Finds and returns a list of duplicated sidebar labels from a set of valid files.
 *
 * @param {string[]} validFiles - An array of file paths to be processed.
 * @returns {string[]} An array containing duplicated sidebar labels.
 */
function findDuplicatedSidebarLabels(validFiles) {
    const labels = validFiles.reduce((acc, file) => {
        const { sidebars } = getSidebars(file);
        return acc.concat(sidebars.map(sidebar => sidebar.label));
    }, []);

    return labels.filter((label, index) => labels.indexOf(label) !== index);
}


/**
 * Loads and normalizes sidebar data from a YAML file.
 *
 * @param {string} yamlFilename - The path to the YAML file containing sidebar configuration.
 * @returns {Object} An object containing the normalized sidebars and any additional properties from the YAML file.
 *                   If an error occurs during file reading or parsing, returns an object with `fileSidebars` set to null.
 */
function getSidebars(yamlFilename) {
    try {
        const yamlContent = yamljs.load(yamlFilename);
        const { sidebars, ...rest } = yamlContent;
        return { sidebars : sidebars.map(normalizeItem), ...rest };
    } catch (error) {
        console.error('Error reading or parsing YAML file:', error);
        return { fileSidebars: null, ...{} };
    }
}


/**
 * Normalizes an item by ensuring it is a valid object with a 'label' property.
 * If the item is a string, it converts it to an object with a 'label' property.
 * If the item is an object with a single property, it converts it to an object
 * with 'label' and 'items' properties, where 'items' is an array.
 * Throws an error if the item is not a string or object, or if the object
 * structure is invalid.
 * Recursively normalizes any 'items' or 'headings' properties.
 * Ensures that an item cannot have both 'items' and 'headings' properties.
 *
 * @param {string|object} item - The item to normalize.
 * @returns {object} The normalized item.
 * @throws {Error} If the item is not valid.
 */
function normalizeItem(item) {
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
    if (!item.label || typeof item.label !== 'string' || item.label.trim() === '') {
        throw new Error(`Invalid sidebar label for item: ${item.label}`);
    }
    item.label = item.label.trim();
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
    if (item.items && item.headings) {
        throw new Error(`Item cannot have both 'items' and 'headings' properties: ${item.label}`);
    }
    return item;
}

/**
 * Validates an array of file paths against a given JSON schema.
 *
 * @param {string[]} files - An array of file paths to be validated.
 * @param {object} schema - A JSON schema object used for validation.
 * @throws {Error} Throws an error if the files parameter is not an array of strings,
 *                 if the schema is not an object, or if the validation function is not defined.
 * @returns {object} An object containing two properties: 'validFiles', an array of file paths
 *                   that passed validation, and 'invalidFiles', an object mapping file paths
 *                   to their respective validation errors.
 */
function validateFiles(files, schema) {
    if (!Array.isArray(files)) {
        throw new Error('Files must be an array of strings.');
    }

    if (!schema || typeof schema !== 'object') {
        throw new Error('Schema must be an object.');
    }

    const ajv = new Ajv({allErrors: true});
    const validate = ajv.compile(schema);

    if (!validate || typeof validate !== 'function') {
        throw new Error('Validation function is not defined or is not a function.');
    }

    const validFiles = [];
    const invalidFiles = {};

    files.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8'); // Specify encoding
            const data = yamljs.parse(content);
            if (!data || typeof data !== 'object') {
                throw new Error('Data is not an object.');
            }

            const valid = validate(data);

            if (!valid) {
                if (!validate.errors || !Array.isArray(validate.errors)) {
                    throw new Error('Validation errors are not defined or are not an array.');
                }

                if (validate.errors.length > 0) {
                    invalidFiles[file] = validate.errors;
                }
            } else {
                validFiles.push(file);
            }
        } catch (error) {
            if (!error || typeof error !== 'object') {
                throw new Error('An unexpected error occurred while validating files.');
            }

            invalidFiles[file] = [error];
        }
    });

    return { validFiles, invalidFiles };
}

/**
 * Retrieves a list of files matching the provided patterns.
 *
 * This function takes two arrays of string patterns, `patterns` and `fallbackPatterns`,
 * and attempts to find files that match these patterns using glob matching.
 * If the patterns are not valid arrays of strings, an error is thrown.
 * In case of any error during file retrieval, an empty array is returned.
 *
 * @param {string[]} patterns - An array of glob patterns to match files.
 * @param {string[]} fallbackPatterns - An array of fallback glob patterns to match files if the primary patterns fail.
 * @returns {string[]} An array of file paths that match the provided patterns.
 * @throws {Error} Throws an error if the input patterns are not arrays of strings.
 */
function getFilesFromPatterns(patterns, fallbackPatterns) {
    if (!Array.isArray(patterns) || !patterns.every(item => typeof item === 'string')) {
        throw new Error('Patterns should be an array of strings.');
    }

    if (!Array.isArray(fallbackPatterns) || !fallbackPatterns.every(item => typeof item === 'string')) {
        throw new Error('Fallback patterns should be an array of strings.');
    }

    const allPatterns = [].concat(patterns, fallbackPatterns);
    // console.log("🚀 ~ allPatterns:", allPatterns);

    try {
        const files = allPatterns.reduce((acc, pattern) => {
            if (typeof pattern !== 'string') {
                throw new Error('Pattern should be a string.');
            }

            return acc.concat(glob.sync(pattern));
        }, []);
        // console.log("🚀 ~ files ~ files:", files);
        return files;
    } catch (error) {
        console.error('Error processing patterns:', error);
        return [];
    }
}

/**
 * Generates a sidebars file for Docusaurus.
 *
 * @param {object} sidebarData - Data to be passed to the sidebars template.
 * @param {object} options - Options to be passed to the template:
 *   - sidebarsFilename {string} - Desired name of the generated sidebars file.
 *   - templates {string} - Path to the templates directory.
 *   - templateExtension {string} - Extension of the template file.
 *   - verbose {boolean} - Whether to log extra information.
 *
 * @throws {Error} - If any of the arguments are invalid, or if the template file is not found or empty.
 * @throws {Error} - If there is an error generating the sidebars file.
 */
function generateSidebarsFile(sidebarData, options) {
    if (sidebarData === null || sidebarData === undefined) {
        throw new Error('generateSidebarsFile: sidebarData was null or undefined.');
    }

    if (options === null || options === undefined) {
        throw new Error('generateSidebarsFile: options was null or undefined.');
    }

    const sidebarsFilename = options.sidebarsFilename;
    if (sidebarsFilename === null || sidebarsFilename === undefined) {
        throw new Error('generateSidebarsFile: options.sidebarsFilename was null or undefined.');
    }

    try {
        const outputContent = renderTemplate('sidebars', { sidebars: JSON.stringify(sidebarData, null, 2) }, options);
        const outputFilename = setExtensionIfMissing(options.sidebarsFilename, '.js');
        if (outputFilename === null) {
            throw new Error('generateSidebarsFile: outputFilename was null.');
        }

        if (fs === null) {
            throw new Error('generateSidebarsFile: fs was null.');
        }

        fs.writeFileSync(outputFilename, outputContent, 'utf-8');

        if (options.verbose) {
            console.log(`Wrote sidebars file to ${outputFilename}`);
        }
    } catch (error) {
        if (options.verbose) {
            console.error('Error generating sidebars file:', error);
        }

        throw error;
    }
}

/**
 * Renders a Handlebars template with data and options.
 *
 * @param {string} templateName - Name of the template file.
 * @param {object} data - Data to be passed to the template.
 * @param {object} options - Options to be passed to the template:
 *   - templateExtension {string} - Extension of the template file.
 *   - templates {string} - Path to the templates directory.
 *
 * @returns {string} - The rendered template.
 *
 * @throws {Error} - If any of the arguments are invalid, or if the template file is not found or empty.
 */
function renderTemplate(templateName, data, options) {
    if (options === null) {
        throw new Error('renderTemplate: options was null.');
    }

    const { templateExtension, templates } = options;

    if (!templateName || !data || !options) {
        throw new Error('Invalid arguments: templateName, data, and options are required.');
    }

    if (typeof templateName !== 'string' || typeof templates !== 'string') {
        throw new TypeError('templateName and templates path must be strings.');
    }

    if (typeof templateExtension !== 'string') {
        throw new TypeError('templateExtension must be a string.');
    }

    const templatePath = setExtensionIfMissing(`${templates}/${templateName}`, templateExtension);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    if (!templateContent) {
        throw new Error(`Template file is empty: ${templatePath}`);
    }

    const template = Handlebars.compile(templateContent);
    return template(data);
}

/**
 * Appends a file extension to a file path if the extension is not already present.
 *
 * @param {string} filePath The file path.
 * @param {string} extension The file extension to add (e.g., "txt", ".md").  Leading dots are optional,  and trailing whitespace is trimmed.
 * @returns {string} The file path with the extension appended if it wasn't already present.
 * @throws {Error} If `extension` is not a string, is empty after trimming whitespace, contains characters other than alphanumeric and dots, or ends with a dot.
 *
 * @example
 * // Returns "filename.txt"
 * setExtensionIfMissing('filename', 'txt');
 *
 * @example
 * // Returns "filename.md"
 * setExtensionIfMissing('filename', '.md');
 *
 * @example
 * // Returns "filename.js"  (trailing whitespace is trimmed)
 * setExtensionIfMissing('filename', 'js   ');
 *
 * @example
 * // Returns "filename.hbs"
 * setExtensionIfMissing("filename", ".hbs");
 *
 *  @example
 * // Returns "path/to/file.txt"
 * setExtensionIfMissing('path/to/file', 'txt');
 *
 * @example
 * // Returns "./path/to/file.txt" (Handles relative paths)
 * setExtensionIfMissing('./path/to/file', 'txt');
 *
 * @example
 * // Throws "Invalid extension: extension must be a string."
 * setExtensionIfMissing('filename', 123);
 *
 * @example
 * // Throws "Invalid extension: extension cannot be empty or contain special characters (excluding ".").."
 * setExtensionIfMissing('filename', ' '); // Empty after trim
 *
 * @example
 * // Throws "Invalid extension: extension cannot be empty or contain special characters (excluding ".").."
 * setExtensionIfMissing('filename', 'f@ile.txt'); // Invalid characters
 *
 * @example
 * // Throws "Invalid extension: extension cannot end with a dot."
 * setExtensionIfMissing('filename', 'txt.');
 *
 * @example
 * // Throws "Invalid extension: extension cannot end with a dot."
 * setExtensionIfMissing('filename', '.');
 *
 *  @example
 * // Returns filename
 * setExtensionIfMissing("filename.", ".");
 *
 * @example
 * // Returns "filename.md"
 * setExtensionIfMissing("filename.md", "md");
 *
 */
function setExtensionIfMissing(filePath, extension) {
    if (typeof extension !== 'string') {
        throw new Error('Invalid extension: extension must be a string.');
    }

    const trimmedExtension = extension.trim();

    if (!trimmedExtension || !/^[a-zA-Z0-9.]+$/.test(trimmedExtension)) {
        throw new Error('Invalid extension: extension cannot be empty or contain special characters (excluding ".")..');
    }

    if (trimmedExtension.endsWith('.')) {
        throw new Error('Invalid extension: extension cannot end with a dot.');
    }

    const finalExtension = trimmedExtension.startsWith('.') ? trimmedExtension : `.${trimmedExtension}`;

    if (filePath.endsWith(finalExtension)) {
        return filePath;
    }

    return `${filePath}${finalExtension}`;
}

module.exports = {
    buildSidebarsLayout,
    findDuplicatedSidebarLabels,
    generateSidebarsFile,
    getFilesFromPatterns,
    getSidebars,
    normalizeItem,
    renderTemplate,
    setExtensionIfMissing,
    validateFiles,
};

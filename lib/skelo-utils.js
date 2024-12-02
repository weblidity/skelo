const fs = require('fs');
const glob = require('glob');
const Handlebars = require('handlebars');
const { Validator } = require('jsonschema');
const yamljs = require('yamljs');



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
                acc[label] = items;
            })
            return acc;
        }, {})

        return generatedSidebarsLayout;
    } catch (error) {
        console.error(error);
        return {}
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
    if (!validFiles || !Array.isArray(validFiles)) {
        throw new Error('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
    }

    const sidebarLabelsSummary = {};

    validFiles.forEach(file => {
        if (typeof file !== 'string') {
            throw new Error('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
        }

        const { sidebars } = getSidebars(file);

        if (!sidebars || !Array.isArray(sidebars)) {
            throw new Error('findDuplicatedSidebarLabels: sidebars must be an array of objects.');
        }

        sidebars.forEach(sidebar => {
            const label = sidebar.label;
            sidebarLabelsSummary[label] = sidebarLabelsSummary[label] || { count: 0, files: {} };
            sidebarLabelsSummary[label].files[file] = (sidebarLabelsSummary[label].files[file] || 0) + 1;
            sidebarLabelsSummary[label].count = Object.values(sidebarLabelsSummary[label].files).reduce((sum, count) => sum + count, 0);
        });
    });

    const duplicatedSidebarLabels = Object.keys(sidebarLabelsSummary).filter(label => sidebarLabelsSummary[label].count > 1);

    return { duplicatedSidebarLabels, sidebarLabelsSummary };
}


/**
 * Generates a sidebars file using the provided sidebar data and options.
 * 
 * @param {Object} sidebarData - The data to be used for generating the sidebars.
 * @param {Object} options - Configuration options for generating the sidebars file.
 * @param {string} options.sidebarsFilename - The filename for the output sidebars file.
 * @param {boolean} [options.verbose=false] - If true, logs messages to the console.
 * 
 * @throws {Error} Throws an error if sidebarData, options, or options.sidebarsFilename are null or undefined.
 * @throws {Error} Throws an error if the file system module (fs) is null.
 * 
 * @description
 * This function compiles a Handlebars template named 'sidebars' with the provided sidebar data,
 * writes the compiled content to a file with the specified filename, and logs the operation if verbose mode is enabled.
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
 * Retrieves a list of files matching the provided patterns, using fallback patterns if necessary.
 *
 * @param {string[]} patterns - An array of glob patterns to match files.
 * @param {string[]} fallbackPatterns - An array of fallback glob patterns to use if the primary patterns fail.
 * @returns {string[]} An array of file paths that match the given patterns.
 * @throws {Error} Throws an error if the input patterns or fallback patterns are not arrays of strings.
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
 * Retrieves and parses a JSON schema from a specified file.
 *
 * @param {Object} options - Configuration options for retrieving the schema.
 * @param {string} options.schemaFilename - The path to the schema file.
 * @throws {Error} If options or options.schemaFilename is null or undefined.
 * @throws {TypeError} If options.schemaFilename is not a string.
 * @throws {Error} If there is an error reading or parsing the schema file.
 * @returns {Object} The parsed JSON schema.
 */
function getSchema(options) {
    if (!options || !options.schemaFilename) {
        throw new Error('getSchema: options or options.schemaFilename is null or undefined.');
    }

    const schemaPath = options.schemaFilename;
    if (typeof schemaPath !== 'string') {
        throw new TypeError('getSchema: options.schemaFilename must be a string.');
    }

    try {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        return JSON.parse(schemaContent);
    } catch (err) {
        throw new Error(`getSchema: error reading or parsing schema file at ${schemaPath}: ${err.message}`);
    }
};

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
 * Renders a template using the specified template name, data, and options.
 *
 * @param {string} templateName - The name of the template to render.
 * @param {Object} data - The data to be used in the template.
 * @param {Object} options - Options for rendering the template, including:
 *   @param {string} options.templateExtension - The file extension for the template.
 *   @param {string} options.templates - The path to the templates directory.
 * @throws {Error} If options is null, or if templateName, data, or options are missing.
 * @throws {TypeError} If templateName, templates path, or templateExtension are not strings.
 * @throws {Error} If the template file does not exist or is empty.
 * @returns {string} The rendered template as a string.
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
 * Appends the specified extension to the file path if it is not already present.
 *
 * @param {string} filePath - The path of the file to which the extension should be added.
 * @param {string} extension - The extension to append to the file path. Must be a non-empty string
 *                             containing only alphanumeric characters and dots, and must not end with a dot.
 * @returns {string} - The file path with the extension appended if it was not already present.
 * @throws {Error} - Throws an error if the extension is not a valid string or contains invalid characters.
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


/**
 * Validates an array of file paths against a given JSON schema.
 *
 * @param {string[]} files - An array of file paths to be validated.
 * @param {object} schema - A JSON schema object used for validation.
 * @throws {Error} Throws an error if the files parameter is not an array of strings,
 *                 if the schema is not an object, or if the validation function is not defined.
 * @returns {object} An object containing two properties: 
 *                   - validFiles: an array of file paths that passed validation.
 *                   - invalidFiles: an object mapping file paths to arrays of validation errors.
 */
function validateFiles(files, schema) {
    if (!Array.isArray(files)) {
        throw new Error('Files must be an array of strings.');
    }

    if (!schema || typeof schema !== 'object') {
        throw new Error('Schema must be an object.');
    }

    const validator = new Validator();

    const validFiles = [];
    const invalidFiles = {};

    files.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8'); // Specify encoding
            const data = yamljs.parse(content);
            if (!data || typeof data !== 'object') {
                throw new Error('Data is not an object.');
            }

            const validationResult = validator.validate(data, schema);

            if (!validationResult.valid) {
                invalidFiles[file] = validationResult.errors;
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

module.exports = {
    buildSidebarsLayout,
    findDuplicatedSidebarLabels,
    generateSidebarsFile,
    getFilesFromPatterns,
    getSchema,
    getSidebars,
    normalizeItem,
    renderTemplate,
    setExtensionIfMissing,
    validateFiles,
};
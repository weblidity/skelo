
const fs = require('fs').promises;
const fsSync = require('fs');
const {globSync} = require('glob');
const Handlebars = require('handlebars');
const { validate } = require('jsonschema');
const path = require('path');


/**
 * Retrieves files matching specified patterns, using fallback patterns if necessary.
 *
 * @param {string | string[]} primaryPatterns - Primary glob patterns to match.
 * @param {string | string[]} fallbackPatterns - Fallback glob patterns to use if primary patterns yield no results.
 * @returns {string[]} An array of file paths matching the patterns. Returns an empty array if no files are found.
 * 
 */
function getFilesFromPatterns(primaryPatterns, fallbackPatterns) {
    const primaryFiles = globSync(primaryPatterns);
    if (primaryFiles.length > 0) {
        return primaryFiles;
    }

    const fallbackFiles = globSync(fallbackPatterns);
    return fallbackFiles;
}

/**
 * Validates an array of files against a JSON schema.
 *
 * @param {string[]} files - An array of file paths to validate.
 * @param {string} schemaPath - The path to the JSON schema file.
 * @returns {Object} An object containing arrays of valid and invalid files.  Invalid files include error details.
 * @throws {Error} If the schema file is invalid or cannot be read.
 */
function validateFilesAgainstSchema(files, schemaPath) {
    try {
        const schemaContent = JSON.parse(fsSync.readFileSync(schemaPath, 'utf8'));
        const validFiles = [];
        const invalidFiles = {};

        for (const file of files) {
            try {
                const fileContent = JSON.parse(fsSync.readFileSync(file, 'utf8'));
                const validationResult = validate(fileContent, schemaContent);
                if (validationResult.valid) {
                    validFiles.push(file);
                } else {
                    invalidFiles[file] = validationResult.errors;
                }
            } catch (error) {
                invalidFiles[file] = [ {message: error.message} ];
            }
        }

        return { validFiles, invalidFiles };
    } catch (error) {
        throw new Error(`Error reading or parsing schema file: ${schemaPath} - ${error.message}`);
    }
}

/**
 * Builds the documentation sidebars layout based on the provided patterns and options.
 *
 * @param {string[]} patterns - An array of glob patterns to match outline files.
 * @param {Object} options - An object containing options for building the sidebars layout.  Must include `docs` property.
 * @returns {Object} An object representing the documentation sidebars layout. Keys are strings, values are arrays of strings or objects.
 * @throws {Error} If options object is invalid or missing required properties.
 */
function buildDocumentationSidebarsLayout(patterns, options) {
    const matchedFiles = getFilesFromPatterns(patterns, options.fallbackPatterns);

    const {validFiles, invalidFiles} = validateFilesAgainstSchema(matchedFiles, options.schema)

    // Placeholder implementation:  Replace with your actual logic to process patterns and build the sidebars layout.
    // This example returns a sample layout.  You'll need to adapt this based on how your outline files are structured and how you want to organize the sidebars.

    const sidebarsLayout = {
        'Introduction': [
            'index.md',
            {
                type: 'category',
                label: 'Getting Started',
                items: [
                    'getting-started/installation.md',
                    'getting-started/configuration.md',
                ],
            },
        ],
        'Guides': [
            'guides/overview.md',
            'guides/advanced-usage.md',
        ],
        'API Reference': [
            'api/introduction.md',
            {
                type: 'category',
                label: 'Core Modules',
                items: [
                    'api/core/module1.md',
                    'api/core/module2.md',
                ],
            },
        ],
    };

    return sidebarsLayout;
}

/**
 * Generates a sidebars file for documentation using a Handlebars template.
 *
 * @param {Object} documentationSidebars - The sidebars data to be included in the documentation.
 * @param {Object} options - Configuration options for generating the sidebars file.
 * @param {string} options.templates - Path to the directory containing the Handlebars templates.
 * @param {string} options.sidebars - Path to the output directory for the generated sidebars file.
 * @throws {Error} Throws an error if the options object is invalid or if required files/directories are missing.
 * @returns {Promise<void>} A promise that resolves when the sidebars file is successfully generated.
 */
async function generateSidebarsFile(documentationSidebars, options) {
    if (!options || !options.templates || !options.sidebars) {
        throw new Error('Invalid options object: `templates` and `sidebars` properties are required.');
    }

    try {
        const sidebarsTemplateFilename = path.join(options.templates, 'sidebars.hbs');
        const sidebarsTemplateContent = await fs.readFile(sidebarsTemplateFilename, 'utf8');
        const compiledTemplate = Handlebars.compile(sidebarsTemplateContent);
        const sanitizedSidebars = sanitizeInput(documentationSidebars);
        const sidebarsString = compiledTemplate({ sidebars: JSON.stringify(sanitizedSidebars, null, 2) });
        const documentationSidebarsFilename = path.join(options.sidebars);
        await fs.writeFile(documentationSidebarsFilename, sidebarsString);
    } catch (error) {
        if (error.code === 'ENOENT') {
            if (error.path.includes('sidebars.hbs')) {
                throw new Error('Error: sidebars.hbs template not found. Please ensure that a sidebars.hbs file exists in your templates directory.');
            } else if (error.path.includes(options.sidebars)) {
                throw new Error(`Error: The specified sidebars output directory does not exist: ${options.sidebars}`);
            }
        }

        throw new Error(`An unexpected error occurred: ${error.message}`);
    }
}

/**
 * Sanitizes the input object to prevent injection attacks.  This is a placeholder and needs robust implementation based on your specific needs and threat model.
 *
 * @param {Object} inputObject - The object to sanitize.
 * @returns {Object} The sanitized object.  Returns an empty object if input is invalid.
 */
function sanitizeInput(inputObject) {
    if (typeof inputObject !== 'object' || inputObject === null || Array.isArray(inputObject)) {
        console.error('Invalid input object for sanitization.');
        return {}; // Return empty object for invalid input
    }

    // Implement robust sanitization logic here.  This is a placeholder.
    // Consider using a library like DOMPurify if dealing with HTML content.
    // For other data types, consider escaping special characters or using validation against allowed characters/formats.

    const sanitizedObject = {};
    for (const key in inputObject) {
        if (inputObject.hasOwnProperty(key)) {
            // Sanitize each value based on its type.  This is a very basic example.
            let value = inputObject[key];
            if (typeof value === 'string') {
                value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Basic HTML escaping
            }

            sanitizedObject[key] = value;
        }
    }

    return sanitizedObject;
}

module.exports = {
    generateSidebarsFile,
    sanitizeInput,
    buildDocumentationSidebarsLayout,
    getFilesFromPatterns,
    validateFilesAgainstSchema,
}

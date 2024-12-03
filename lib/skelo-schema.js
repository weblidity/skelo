const fs = require('fs');
const { Validator } = require('jsonschema');
const yamljs = require('yamljs');

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
    getSchema,
    validateFiles,
}
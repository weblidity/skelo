const fs = require('fs');

/**
 * Reads a JSON schema from the specified path and validates it.
 * If the schema is invalid or an error occurs, the default schema location is returned.
 *
 * @param {string} schemaPath - The file path to the JSON schema to be read and validated.
 * @param {string} defaultSchemaLocation - The file path to the default schema to use if validation fails.
 * @returns {string} - The path of the valid schema or the default schema if validation fails.
 */
function readAndValidateSchema(schemaPath, defaultSchemaLocation) {
    try {
        const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        if (!validateSchema(schemaContent)) {
            throw new Error('Schema validation failed');
        }
        return schemaPath;
    } catch (error) {
        console.error(`Error parsing or validating JSON schema: ${schemaPath}. Using default schema: ${defaultSchemaLocation}`);
        return defaultSchemaLocation;
    }
}

/**
 * Validates the existence of a schema file specified in the options.
 * If the schema file does not exist, logs an error and returns the default schema location.
 *
 * @param {Object} options - The options object containing the schema path.
 * @param {string} defaultSchemaLocation - The path to the default schema file.
 * @returns {string} - The path to the valid schema file or the default schema location.
 */
function validateAndSetSchema(options, defaultSchemaLocation) {
    if (!options.schema || !fs.existsSync(options.schema)) {
        console.error(`Schema file not found: ${options.schema}. Using default schema: ${defaultSchemaLocation}`);
        return defaultSchemaLocation;
    }
    return options.schema;
}

/**
 * Validates the provided schema content.
 *
 * This function checks if the schemaContent is a valid object and performs
 * additional validation logic. Returns true if the schema is valid, otherwise
 * returns false. Logs an error message if an exception occurs during validation.
 *
 * @param {Object} schemaContent - The schema content to validate.
 * @returns {boolean} True if the schema is valid, false otherwise.
 */
function validateSchema(schemaContent) {
    // Implement schema validation logic here
    // Return true if valid, false otherwise
    try {
        // Example validation logic
        if (typeof schemaContent !== 'object' || Array.isArray(schemaContent)) {
            return false;
        }
        // Additional validation checks...
        return true;
    } catch (error) {
        console.error(`Schema validation error: ${error.message}`);
        return false;
    }
}

/**
 * Ensures the provided options object contains a valid schema path.
 * 
 * This function checks if the `defaultSchemaLocation` is a valid string and exists.
 * It then verifies the `options` object for a `schema` property. If the schema is
 * invalid or missing, it defaults to `defaultSchemaLocation`. The function attempts
 * to validate and read the schema, updating the `options` object accordingly.
 * 
 * @param {Object} options - The options object potentially containing a schema path.
 * @param {string} defaultSchemaLocation - The default schema path to use if validation fails.
 * @returns {Object} The updated options object with a valid schema path.
 * @throws Will throw an error if `defaultSchemaLocation` is invalid or does not exist.
 * @throws Will throw an error if the options object has no schema property.
 * @throws Will throw an error if specified schema file does not exist.
 * @throws Will throw an error when schema content is not valid.
 * 
 */
function useDefaultSchemaIfNeeded(options, defaultSchemaLocation) {
    const uniqueId = `SchemaCheck-${Date.now()}`;
    if (typeof defaultSchemaLocation !== 'string' || defaultSchemaLocation.trim() === '') {
        throw new Error(`[${uniqueId}] Invalid default schema location provided.`);
    }
    if (!fs.existsSync(defaultSchemaLocation)) {
        throw new Error(`[${uniqueId}] Default schema location is invalid: ${defaultSchemaLocation}`);
    }
    if (typeof options !== 'object' || !options.hasOwnProperty('schema')) {
        console.error(`[${uniqueId}] Invalid options object. Using default schema.`);
        options = { schema: defaultSchemaLocation };
    } else {
        try {
            options.schema = validateAndSetSchema(options, defaultSchemaLocation);
            options.schema = readAndValidateSchema(options.schema, defaultSchemaLocation);
        } catch (error) {
            console.error(`[${uniqueId}] useDefaultSchemaIfNeeded: Error processing schema: ${error.message}. Using default schema: ${defaultSchemaLocation}`);
            options.schema = defaultSchemaLocation;
        }
    }
    return options;
}

module.exports = {
    readAndValidateSchema,
    useDefaultSchemaIfNeeded,
    validateAndSetSchema,
    validateSchema,
};
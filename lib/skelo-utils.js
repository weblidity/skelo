
const fs = require('fs').promises;
const Handlebars = require('handlebars');
const path = require('path');

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
}

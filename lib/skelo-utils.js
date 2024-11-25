const fsSync = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

/**
 * Builds the layout for documentation sidebars.
 *
 * @param {Array} patterns - An array of patterns used to generate the sidebar layout.
 * @param {Object} options - Configuration options for building the sidebar layout.
 * @returns {Object} An object representing the sidebar layout.
 */
function buildDocumentationSidebarsLayout(patterns, options) {
    return {
        "sidebarName": []
    };
}

/**
 * Generates a sidebars file using the provided documentation sidebars and options.
 *
 * @param {Object} documentationSidebars - An object representing the documentation sidebars.
 * @param {Object} options - Configuration options for generating the sidebars file.
 * @param {string} options.templates - The path to the templates directory.
 * @param {string} options.sidebars - The path where the generated sidebars file should be saved.
 * @throws Will throw an error if the documentationSidebars is not an object.
 * @throws Will throw an error if the options object is missing required properties.
 * @throws Will throw an error if the template or sidebars path does not exist.
 */
function generateSidebarsFile(documentationSidebars, options) {
    if (!documentationSidebars || typeof documentationSidebars !== 'object') {
        throw new Error('Invalid documentationSidebars: expected an object.');
    }

    if (!options || typeof options !== 'object' || !options.templates || !options.sidebars) {
        throw new Error('Invalid options: expected an object with `templates` and `sidebars` properties.');
    }

    const sidebarsTemplateFilename = path.resolve(options.templates, 'sidebars.hbs');
    if (!fsSync.existsSync(sidebarsTemplateFilename)) {
        throw new Error(`Invalid path: ${sidebarsTemplateFilename} does not exist.`);
    }

    if (!fsSync.existsSync(options.sidebars)) {
        throw new Error(`Invalid path: ${options.sidebars} does not exist.`);
    }

    let templateContent;
    try {
        templateContent = fsSync.readFileSync(sidebarsTemplateFilename, 'utf8');
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return;
    }

    const compiledTemplate = Handlebars.compile(templateContent);
    const sidebarsContent = compiledTemplate({sidebars: JSON.stringify(documentationSidebars, null, 4)});

    const {sidebars} = options;
    try {
        fsSync.writeFileSync(sidebars, sidebarsContent, 'utf8');
        console.log(`Successfully wrote sidebars to ${sidebars}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

module.exports = {
    buildDocumentationSidebarsLayout,
    generateSidebarsFile,
};
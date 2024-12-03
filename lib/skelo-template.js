const fs = require('fs');
const Handlebars = require('handlebars');

const {setExtensionIfMissing} = require('./skelo-files');

/**
 * Renders a template using the specified template content and data.
 *
 * @param {string} templateContent - The template content to be rendered.
 * @param {Object} data - The data to be used in the template.
 * @throws {TypeError} If templateContent is not a string.
 * @throws {TypeError} If data is not an object.
 * @returns {string} The rendered template as a string.
 */
function renderLiteral(templateContent, data) {
    if (typeof templateContent !== 'string') {
        throw new TypeError('renderLiteral: templateContent must be a string');
    }

    if (!data || typeof data !== 'object') {
        throw new TypeError('renderLiteral: data must be a non-null object');
    }

    try {
        const compiledTemplate = Handlebars.compile(templateContent);
        return compiledTemplate(data);
    } catch (error) {
        console.error('Error rendering template:', error);
        throw error;
    }
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
    if (options === null || options === undefined) {
        throw new Error('renderTemplate: options was null or undefined.');
    }

    const { templateExtension, templates } = options;

    if (!templateName || !data || !options || !templateExtension || !templates) {
        throw new Error('Invalid arguments: templateName, data, options.templateExtension, and options.templates are required.');
    }

    if (typeof templateName !== 'string' || typeof templates !== 'string' || typeof templateExtension !== 'string') {
        throw new TypeError('templateName, templates path, and templateExtension must be strings.');
    }

    const templatePath = setExtensionIfMissing(`${templates}/${templateName}`, templateExtension);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    return renderLiteral(templateContent, data);
}

module.exports = {
    renderLiteral,
    renderTemplate
}
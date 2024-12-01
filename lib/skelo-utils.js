const fs = require('fs');
const Handlebars = require('handlebars');

/**
 * Generates a sidebars file for Docusaurus.
 *
 * @param {object} sidebarData - Data to be passed to the sidebars template.
 * @param {object} options - Options to be passed to the template:
 *   - sidebarsFilename {string} - Desired name of the generated sidebars file.
 *   - templates {string} - Path to the templates directory.
 *   - templateExtension {string} - Extension of the template file.
 *   - verbose {boolean} - Whether to log extra information.
 */
function generateSidebarsFile(sidebarData, options) {

    if (!sidebarData) {
        throw new Error('generateSidebarsFile: sidebarData was null or undefined.');
    }

    if (!options) {
        throw new Error('generateSidebarsFile: options was null or undefined.');
    }

    const sidebarsFilename = options.sidebarsFilename;
    if (!sidebarsFilename) {
        throw new Error('generateSidebarsFile: options.sidebarsFilename was null or undefined.');
    }

    try {
        const outputContent = renderTemplate('sidebars', {sidebars: JSON.stringify(sidebarData, null, 2)}, options);
        const outputFilename = setExtensionIfMissing(options.sidebarsFilename, '.js');
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
    generateSidebarsFile,
    renderTemplate,
    setExtensionIfMissing
};

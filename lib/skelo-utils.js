const fs = require('fs');
const Handlebars = require('handlebars');

function generateSidebarsFile(sidebarData, options) {
    const {templateExtension, template, templates, output} = options;
    const templatePath = setExtensionIfMissing(template, templateExtension);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const templateFn = Handlebars.compile(templateContent);
    const renderedTemplate = templateFn(sidebarData);
    fs.writeFileSync(output, renderedTemplate, 'utf-8');
}

function renderTemplate(templateName, data, options) {
    const {templateExtension, templates} = options;
    const templatePath = setExtensionIfMissing(`${templates}/${templateName}`, templateExtension);
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));
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

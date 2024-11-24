const jsonschema = require('jsonschema');
const fs = require('fs');
const yaml = require('js-yaml');

const {globSync} = require('glob');

/**
 * Retrieves files using primary patterns, falling back to secondary patterns if necessary.
 *
 * @param {string|string[]} primaryPatterns - Primary patterns to search for files.
 * @param {string|string[]} fallbackPatterns - Fallback patterns if primary patterns yield no results.
 * @returns {string[]} - Array of file paths found, or an empty array if no files are found.  Throws an error if input is invalid.
 */
function getFiles(primaryPatterns, fallbackPatterns) {
    // if (primaryPatterns && typeOf primaryPatterns === 'number') {
    //     primaryPatterns = primaryPatterns.toString();
    // }
    if (!primaryPatterns || (typeof primaryPatterns !== 'string' && !Array.isArray(primaryPatterns))) {
        throw new Error('Invalid input: `primaryPatterns` must be a string or an array of strings.');
    }

    // if (fallbackPatterns && typeOf fallbackPatterns === 'number') {
    //     fallbackPatterns = fallbackPatterns.toString();
    // }
    if (!fallbackPatterns && (typeof fallbackPatterns !== 'string' && !Array.isArray(fallbackPatterns))) {
        throw new Error('Invalid input: `fallbackPatterns` must be a string or an array of strings.');
    }

    const primaryFiles = globSync(primaryPatterns);
    if (primaryFiles.length > 0) {
        return primaryFiles;
    }

    if (fallbackPatterns) {
        return globSync(fallbackPatterns);
    }

    return [];
}

/**
 * Validates an array of filenames against a JSON schema.
 *
 * @param {string[]} filenames - An array of filenames to validate.
 * @param {object} options - An object containing validation options.
 * @param {string} options.schema - The path to the JSON schema file.
 * @returns {object} - An object containing valid and invalid files.
 */

function validateFiles(filenames, options) {
    if (!Array.isArray(filenames) || filenames.length === 0 || !options || !options.schema) {
        return { validFiles: [], invalidFiles: {} };
    }

    const schemaContent = readSchema(options.schema);
    if (!schemaContent) {
        return { validFiles: [], invalidFiles: { schema: ['Schema read error'] } };
    }

    const validFiles = [];
    const invalidFiles = {};

    for (const filename of filenames) {
        const yamlContent = readYamlFile(filename);
        if (!yamlContent) {
            invalidFiles[filename] = ['YAML read error'];
            continue;
        }

        const errors = validateYaml(yamlContent, schemaContent);
        if (errors.length === 0) {
            validFiles.push(filename);
        } else {
            invalidFiles[filename] = errors;
        }
    }

    return { validFiles, invalidFiles };
}

function readSchema(schemaPath) {
    try {
        return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    } catch {
        return null;
    }
}

function readYamlFile(filePath) {
    try {
        return yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

function validateYaml(yamlContent, schemaContent) {
    const validator = new jsonschema.Validator();
    const result = validator.validate(yamlContent, schemaContent);
    return result.errors;
}

/**
 * Sanitizes and slugifies a given path string.
 *
 * This function takes a path string, replaces backslashes with forward slashes,
 * and splits it into parts. Each part is validated to contain only alphanumeric
 * characters, dots, underscores, or hyphens. If any part fails validation, an
 * empty string is returned. Otherwise, each part is slugified, and the resulting
 * slugs are joined with slashes. The final result is trimmed of leading and
 * trailing slashes and periods.
 *
 * @param {string} str - The path string to sanitize and slugify.
 * @returns {string} - The sanitized and slugified path, or an empty string if
 *                     the input is invalid or an error occurs during slugification.
 */
function sanitizeAndSlugifyPath (str) {
    if (typeof str !== 'string' || str.length === 0) {
        return '';
    }

    const parts = str.replace(/\\/g, '/').split('/');
    if (!parts.every(part => /^[a-zA-Z0-9._-]+$/.test(part))) {
        return '';
    }

    const slugs = parts.map(part => {
        try {
            return slugify(part);
        } catch (error) {
            console.error(`Error slugifying part: ${part}`, error);
            return '';
        }
    });
    const result = slugs.join('/');

    return trimSlashesAndPeriods(result);
};

/**
 * Converts a given string into a URL-friendly slug by replacing non-alphanumeric
 * characters with a specified replacement character. Consecutive replacement
 * characters are reduced to a single instance, and leading or trailing replacements
 * are removed. The resulting slug is returned in lowercase.
 *
 * @param {string} str - The input string to be converted into a slug.
 * @param {string} [replacement='-'] - The character to replace non-alphanumeric characters with.
 * @returns {string} - The resulting slug, or an empty string if the slug is empty.
 */
function slugify(str, replacement = '-') {
    let slug = str.toLowerCase().replace(/[^a-z0-9-_]/g, replacement)
        .replace(new RegExp(`${replacement}+`, 'g'), replacement)
        .replace(new RegExp(`^${replacement}|${replacement}$`, 'g'), '');

    if (slug.length === 0) {
        return '';
    }

    return slug;
};

function trimCharsFromString(str, charsToRemove) {
    let newStr = str;
    while (charsToRemove.includes(newStr.charAt(0))) {
        newStr = newStr.substring(1);
    }

    while (charsToRemove.includes(newStr.charAt(newStr.length - 1))) {
        newStr = newStr.substring(0, newStr.length - 1);
    }

    return newStr;
};

/**
 * Removes leading and trailing slashes and periods from the given string.
 *
 * @param {string} str - The string from which to remove slashes and periods.
 * @returns {string} - The trimmed string with specified characters removed from both ends.
 */
const trimSlashesAndPeriods = (str) => {
    const charsToRemove = ['.', '/', '\\'];
    return trimCharsFromString(str, charsToRemove);
};

module.exports = {
    slugify,
    trimSlashesAndPeriods,
    sanitizeAndSlugifyPath,
    validateFiles,
    getFiles,
}
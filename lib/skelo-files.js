const {globSync} = require('glob');
const path = require('path');


/**
 * Retrieves a list of files matching the specified patterns using glob.
 * If no files are found with the primary patterns, it attempts to match
 * using fallback patterns. Both patterns and fallbackPatterns should be
 * arrays of strings. Logs an error and returns an empty array if globbing fails.
 *
 * @param {string[]} patterns - The primary glob patterns to match files.
 * @param {string[]} fallbackPatterns - The fallback glob patterns if no files are found.
 * @returns {string[]} - An array of file paths matching the patterns.
 * @throws {Error} - Throws an error if patterns or fallbackPatterns are not arrays of strings.
 */
function getFilesFromPatterns(patterns, fallbackPatterns) {
    if (patterns == null) {
        patterns = [];
    }

    if (!Array.isArray(patterns) || !patterns.every(item => typeof item === 'string')) {
        throw new Error('Patterns should be an array of strings.');
    }

    if (fallbackPatterns == null) {
        fallbackPatterns = [];
    }

    if (!Array.isArray(fallbackPatterns) || !fallbackPatterns.every(item => typeof item === 'string')) {
        throw new Error('Fallback patterns should be an array of strings.');
    }

    try {
        const files = globSync(patterns);
        if (files.length === 0) {
            return globSync(fallbackPatterns);
        }
        return files;
    } catch (error) {
        console.error('Glob error:', error);
        return [];
    }
}

/**
 * Constructs a path by joining the provided parent and item paths.
 *
 * @param {string} parentPath - The parent directory path.
 * @param {string} itemPath - The item or file path to append.
 * @returns {string} The combined path, with segments separated by '/'.
 */
function getParentPath(parentPath, itemPath) {
    return [parentPath, itemPath].filter(item => item).join('/');
}

/**
 * Converts a given file path string into a slugified format.
 *
 * This function replaces backslashes with forward slashes, removes empty segments,
 * and applies slugification to each segment of the path. It ensures the input is a string
 * and throws an error if it is not.
 *
 * @param {string} pathString - The file path string to be slugified.
 * @returns {string} - The slugified version of the input path string.
 * @throws {Error} - Throws an error if the input is not a string.
 */
function getPathSlugify(pathString = '') {
    if (typeof pathString !== 'string') {
        throw new Error('getPathSlugify: pathString must be a string');
    }

    const directory = path.parse(pathString).dir;
    const slugifiedPath = directory
        .replace(/\\/g, '/')
        .split('/') // Split into segments
        .filter(item => item) // Filter out empty segments
        .map(slugify) // Apply slugify to each segment
        .join('/'); // Join back with slashes

    return slugifiedPath;
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
 * Converts a given string into a URL-friendly slug.
 *
 * This function transforms the input string to lowercase, replaces spaces and underscores
 * with hyphens, removes non-alphanumeric characters (except hyphens), and trims leading
 * and trailing hyphens. It also collapses multiple consecutive hyphens into a single one.
 *
 * @param {string} s - The input string to be slugified.
 * @returns {string} The slugified version of the input string, or an empty string if the input is null or undefined.
 */
function slugify(s) {
    if (s == null) {
        return ''; // Return an empty string if the input is null or undefined
    }

    return s
        .toString()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/(^-|-$)/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
}

module.exports = {
    getFilesFromPatterns,
    getParentPath,
    getPathSlugify,
    setExtensionIfMissing,
    slugify,
};

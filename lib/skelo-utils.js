
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

// TODO: Improve trimCharsFromString

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
}
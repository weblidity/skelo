
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
const slugify = (str, replacement = '-') => {
    let slug = str.toLowerCase().replace(/[^a-z0-0-_]/g, replacement)
        .replace(new RegExp(`${replacement}+`, 'g'), replacement)
        .replace(new RegExp(`^${replacement}|${replacement}$`, 'g'), '');

    if (slug.length === 0) {
        return '';
    }

    return slug;
};

const trimCharsFromString = (str, charsToRemove) => {
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
}
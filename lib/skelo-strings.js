/**
 * Constructs a normalized path by combining a parent path and an item path.
 *
 * This function takes two path segments, filters out any empty segments,
 * applies the `getPathSlugify` function to each segment to ensure they are
 * properly formatted, and then joins them into a single path string using '/'.
 *
 * @param {string} parentPath - The parent directory path.
 * @param {string} itemPath - The item or subdirectory path.
 * @returns {string} - The combined and normalized path.
 */
function buildParentPath (parentPath, itemPath) {
  return [parentPath, itemPath].filter(item => item).map(getPathSlugify).join('/')
}

/**
 * Converts a file path to a slugified version by replacing backslashes with forward slashes,
 * splitting the path into parts, slugifying each part, and then joining them back with slashes.
 *
 * @param {string} str - The file path to be slugified.
 * @returns {string} - The slugified version of the file path.
 * @throws {Error} - If the input is not a string.
 */
function getPathSlugify (str) {
  if (str === null || str === undefined) return str;
  str = str.replace(/\\/g, '/')
  const parts = str.split('/').filter(part => part)
  return parts.map(slugify).join('/')
}

/**
 * Converts a given string into a URL-friendly slug.
 *
 * This function transforms the input string to lowercase, trims whitespace,
 * and replaces non-alphanumeric characters with hyphens. It also removes
 * leading and trailing hyphens and underscores, and collapses multiple
 * consecutive hyphens into a single one.
 *
 * @param {string} str - The input string to be slugified.
 * @returns {string} - The slugified version of the input string.
 * @throws {Error} - Throws an error if the input is not a string.
 */
function slugify (str) {
  if (typeof str !== 'string') {
    throw new Error('Invalid input: expected a string.')
  }

  // Convert the string to lowercase
  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '')
    .replace(/^_+/g, '').replace(/_+$/g, '')
    .replace(/^[-_]+/, '').replace(/[_-]+$/, '')
    .replace(/-+/g, '-')

  return str
}

module.exports = {
  buildParentPath,

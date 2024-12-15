
const path = require('path');
const matter = require('gray-matter');
const fs = require('fs');

/**
 * Extracts a document outline from Markdown content.
 * @param {string} markdown The Markdown content to extract the outline from.
 * @returns {Object} An object containing the title of the document and an
 *     optional `headings` property, which is an array of objects representing
 *     the headings in the document. Each heading object contains a `label`
 *     property with the text of the heading, and an optional `items` property
 *     which is an array of objects representing the subheadings.
 * @throws {Error} If the input is not a string, or if the document does not
 *     contain a title (either in frontmatter or as the first heading).
 */
function extractMarkdownStructure(markdown) {
    if (typeof markdown !== 'string') {
        throw new Error("Invalid input: Markdown content must be a string.");
    }

    // Parse the frontmatter and content from the markdown
    const { data: frontmatter, content } = matter(markdown);
    let title = frontmatter?.title || frontmatter?.sidebar_label || null;

    // Regular expression to match markdown headings
    const headingRegex = /^(#+\s*)(.*?)$/gm;
    let headingMatch;
    const headings = [];

    // Extract all headings from the markdown content
    while ((headingMatch = headingRegex.exec(content)) !== null) {
        headings.push({
            level: headingMatch[1].trim().length,
            text: headingMatch[2].trim(),
        });
    }

    // If no headings or title, use the first line as the title
    if (headings.length === 0 && !title) {
        const h1Match = content.match(/^#+\s+(.+?)$/m);
        title = h1Match ? h1Match[1].trim() : null;
    }

    // Find the top-level heading (H1) and remove it from the list
    const topLevelHeading = headings.find(h => h.level === 1);
    const headingsWithoutH1 = headings.filter(h => h.level > 1);
    title = topLevelHeading ? topLevelHeading.text : title;

    if (!title) {
        throw new Error("Unable to determine title. Please provide a title in frontmatter or a heading.");
    }

    // Start processing headings from level 2
    let currentLevel = 2;

    /**
     * Recursive function to build the document outline.
     * @param {number} level The current level of headings to process.
     * @returns {Array} An array of objects representing the headings at the
     *     current level, each containing a `label` property with the text of
     *     the heading, and an optional `items` property which is an array of
     *     objects representing the subheadings.
     */
    const buildTree = (level) => {
        const items = [];
        while (headingsWithoutH1.length > 0 && headingsWithoutH1[0].level === level) {
            const currentHeading = headingsWithoutH1.shift();

            // Recursively build subheadings if the next heading is deeper
            if (headingsWithoutH1.length > 0 && headingsWithoutH1[0].level > level) {
                items.push({
                    label: currentHeading.text,
                    items: buildTree(level + 1),
                });
            } else {
                items.push(currentHeading.text);
            }
        }

        return items;
    };

    // Destructure to extract sidebar_label and title from frontmatter
    let { sidebar_label, title: _title, ...rest } = frontmatter;

    // Conditionally include title in rest if it's different from sidebar_label
    if (_title && (_title !== sidebar_label)) {
        rest.title = _title;
    }

    // Create a new object excluding 'sidebar_label' and conditionally 'title'
    let outline = {
        ...rest,
        label: sidebar_label || frontmatter.title,
    };
    if (headingsWithoutH1.length > 0) {
        outline.headings = buildTree(currentLevel);
    }

    if (Object.keys(outline).length === 1 && outline.label) {
        return outline.label;
    }

    return outline;
}

/**
 * Loads the Docusaurus configuration from the specified file.
 *
 * @param {Object} options - Options object with a 'sidebarsFilename' property
 *     pointing to the Docusaurus configuration file.
 *
 * @returns {Object} The loaded Docusaurus configuration object.
 *
 * @throws {Error} If the configuration file does not exist or is not a valid
 *     JavaScript file.
 */
function loadDocusaurusConfig(sidebarsFilename) {
    const configFile = path.resolve(sidebarsFilename);

    if (!fs.existsSync(configFile)) {
        throw new Error(`Configuration file does not exist: ${configFile}`);
    }

    try {
        return require(configFile);
    } catch (error) {
        throw new Error(`Failed to load configuration file: ${error.message}`);
    }
}



module.exports = {
    extractMarkdownStructure,
    loadDocusaurusConfig,
};
const LINK = 1;
const CATEGORY = 2;
const TOPIC = 3;

const {getParentPath, slugify} = require('../lib/skelo-files');

const {saveTopic} = require('../lib/skelo-utils');

const SIDEBAR_ITEM_TYPE = {
    CATEGORY,
    LINK,
    TOPIC,
}

/**
 * Constructs a category object with a specified label and nested items.
 *
 * @param {Object} item - The item representing the category, containing a label and items.
 * @param {Object} options - Additional options to customize the category building process.
 * @returns {Object} A category object with a type, label, and processed items.
 */
function buildCategory(item, options) {
    if (typeof item !== 'object' || item === null) {
        throw new Error('Item must be an object');
    }
    if (typeof item.label !== 'string') {
        throw new Error('Item label must be a string');
    }
    return {
        type: 'category',
        label: item.label,
        items: buildCategoryItems(item.items, options)
    }
}

/**
 * Constructs a link item for a sidebar.
 *
 * @param {object} item - The link item containing properties like label, href, and title.
 * @param {object} options - Configuration options, including the parent path.
 * @returns {object} The constructed link item, which includes properties like type, label, title, and href.
 */
function buildLink(item, options) {
    const { label, href, title } = item;
    return {
        type: 'link',
        label,
        title,
        href
    };
}

/**
 * Builds a list of sidebar items by filtering and transforming the input items.
 *
 * @param {Array} items - The list of items to process, each item can be a topic or category.
 * @param {Object} options - Configuration options used during the building process.
 * @returns {Array} An array of sidebar items, each being a category or topic object.
 */
function buildSidebarItems(items, options) {
    const filteredItems = items.filter(item => [TOPIC, CATEGORY].includes(getItemType(item)));
    return filteredItems.map(item => {
        switch (getItemType(item)) {
            case CATEGORY:
                return buildCategory(item, options);
            case TOPIC:
                return buildTopic(item, options);
            default:
                return null;
        }
    }).filter(item => item !== null);
}


/**
 * Processes an array of items and builds a list of category, topic, or link objects
 * based on their type. Filters out invalid items and maps each valid item to its
 * corresponding build function.
 *
 * @param {Array} items - The array of items to be processed.
 * @param {Object} options - Additional options to be used in the build functions.
 * @returns {Array} An array of built category, topic, or link objects.
 */
function buildCategoryItems(items, options) {
    const filteredItems = items.filter(item => [TOPIC, LINK, CATEGORY].includes(getItemType(item)));
    return filteredItems.map(item => {
        switch (getItemType(item)) {
            case CATEGORY:
                return buildCategory(item, options);
            case TOPIC:
                return buildTopic(item, options);
            case LINK:
                return buildLink(item, options);
            default:
                return null;
        }
    }).filter(item => item !== null);
}

/**
 * Constructs the URL path for a topic item.
 *
 * This function generates a URL path for a topic item by constructing the path
 * from the provided parent path, item path, and a unique identifier for the item.
 * The identifier is determined based on the item's id, slug, or label properties.
 *
 * @param {object} item - The topic item containing properties like label, slug, and id.
 * @param {object} options - Configuration options, including the parent path.
 * @returns {string} The constructed URL path for the topic item.
 */
function buildTopic(item, options) {
    const { label, slug, id } = item;
    const topicPath = getParentPath(options.parentPath, item.path);
    const itemId = id || slug || slugify(label);
    const href = [topicPath, itemId].filter(item => item.length > 0).join('/');
    saveTopic(item, href, options);
    return href;
}

/**
 * Determines the type of a sidebar item based on its properties.
 *
 * @param {object} item - The sidebar item to check.
 * @returns {number} A numeric constant representing the item type: LINK, CATEGORY, or TOPIC.
 */
function getItemType(item) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return 'INVALID_ITEM';
    }

    if (!item.label || typeof item.label !== 'string' || item.label.length === 0) {
        return 'UNKNOWN';
    }


    if (item.href && typeof item.href === 'string' && item.href.length > 0) {
        return LINK;
    }
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
        return CATEGORY;
    }
    if (!item.items || (Array.isArray(item.items) && item.items.length === 0)) {
        return TOPIC;
    } 
    
    
}

module.exports = {
    buildCategory,
    buildCategoryItems,
    buildLink,
    buildSidebarItems,
    buildTopic,
    getItemType,
    SIDEBAR_ITEM_TYPE,
}
const LINK = 1;
const CATEGORY = 2;
const TOPIC = 3;

const SIDEBAR_ITEM_TYPE = {
    CATEGORY, 
    LINK, 
    TOPIC,
}

/**
 * Constructs a category item for a sidebar.
 *
 * @param {object} item - The category item containing properties like label and items.
 * @param {object} options - Configuration options, including the parent path.
 * @returns {object} The constructed category item, which includes properties like type, label, and items.
 */
function buildCategory(item, options) {
    const { label, items } = item;
    return {
        type: 'category',
        label,
        items: buildSidebarItems(items, options)
    };
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
 * Constructs sidebar items by filtering and mapping input items based on their type.
 *
 * This function processes an array of sidebar items, filtering out invalid items
 * and mapping valid items to their respective structures (category, topic, or link).
 * Invalid items are those that do not match the predefined types: TOPIC, LINK, or CATEGORY.
 *
 * @param {Array} items - The array of sidebar items to process.
 * @param {Object} options - Configuration options, potentially used by item constructors.
 * @returns {Array} An array of constructed sidebar items, excluding any invalid items.
 */
function buildSidebarItems(items, options) {
    const filteredItems = items.filter(item => [TOPIC, LINK, CATEGORY].includes(getItemType(item)));
    return filteredItems.map(item => {
        switch (getItemType(item)) {
            case CATEGORY:
                return buildCategory(item, options);
            case TOPIC:
                return buildTopic(item, options);
            case LINK:
                return item;
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

    if (item.href) {
        return LINK;
    } else if (item.items && Array.isArray(item.items) && item.items.length > 0) {
        return CATEGORY;
    } else if (item.label) {
        return TOPIC;
    } else {
        return 'UNKNOWN';
    }
}

module.exports = {
    buildCategory,
    buildLink,
    buildSidebarItems,
    buildTopic,
    getItemType,

    SIDEBAR_ITEM_TYPE,
}
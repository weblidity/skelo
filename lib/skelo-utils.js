const fsSync = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { globSync } = require('glob');
const { validate } = require('jsonschema');
const yamljs = require('yamljs');

const { buildParentPath, getPathSlugify, slugify } = require('./skelo-strings');
const { logInfo, logDebug, logWarn, logError } = require('./skelo-logger');

const SIDEBAR_ITEM_TYPE = {
  CATEGORY: 0,
  TOPIC: 1,
  LINK: 2
};

/**
 * Builds a documentation sidebar.
 *
 * @param {Array} sidebarItems - An array of sidebar items.
 * @param {Object} options - Configuration options for building the sidebar.
 * @returns {Array} An array of sidebar items.
 */
function buildDocumentationSidebar(sidebarItems, options) {
  const filteredItems = sidebarItems // .filter(item => getTypeOfSidebarItem(item) !== SIDEBAR_ITEM_TYPE.LINK);
  return buildSidebarCategory(filteredItems, options);
}

/**
 * Builds the layout for documentation sidebars.
 *
 * @param {Array} patterns - An array of patterns used to generate the sidebar layout.
 * @param {Object} options - Configuration options for building the sidebar layout.
 * @returns {Object} An object representing the sidebar layout.
 */
function buildDocumentationSidebarsLayout(patterns, options) {
  const files = getFilesFromPatterns(patterns, options.fallbackPatterns);
  const schemaObject = JSON.parse(fsSync.readFileSync(options.schema, 'utf8'));
  const validFiles = files.filter(file => isValidOutlineFile(file, schemaObject));

  const duplicatedSidebars = findDuplicatedSidebarLabels(validFiles);
  const documentationSidebars = validFiles.reduce((acc, file) => {
    const { sidebars: outlineSidebars, ...rest } = getSidebars(file);
    const uniqueSidebars = outlineSidebars.filter((sidebar) => !duplicatedSidebars.includes(sidebar.label));
    for (const sidebar of uniqueSidebars) {
      if (!acc[sidebar.label]) {
        acc[sidebar.label] = buildDocumentationSidebar(sidebar.items || [], { ...options, parentPath: buildParentPath(rest.path) });
      }
    }

    return acc;
  }, {});

  const sortedDocumentationSidebars = Object.keys(documentationSidebars).sort().reduce((acc, key) => {
    acc[key] = documentationSidebars[key];
    return acc;
  }, {});

  return sortedDocumentationSidebars;
}

/**
 * Builds a sidebar category or topic.
 *
 * @param {Array} sidebarItems - An array of sidebar items.
 * @param {Object} options - Configuration options for building the sidebar.
 * @returns {Array} An array of sidebar categories or topics.
 */
function buildSidebarCategory(sidebarItems, options) {
  return sidebarItems.map(item => buildSidebarItem(item, options));
}

/**
 * Builds a sidebar item.
 *
 * @param {Object} sidebarItem - A sidebar item.
 * @param {Object} options - Configuration options for building the sidebar.
 * @returns {Object|Array} A sidebar item or an array of sidebar items.
 */
function buildSidebarItem(sidebarItem, options) {
  const type = getTypeOfSidebarItem(sidebarItem);
  switch (type) {
    case SIDEBAR_ITEM_TYPE.CATEGORY:
      logInfo(options.verbose, `Building sidebar category: ${sidebarItem.label}`);
      return {
        type: 'category',
        label: sidebarItem.label,
        items: buildSidebarCategory(
          sidebarItem.items,
          {
            ...options,
            parentPath: buildParentPath(options.parentPath, sidebarItem.path)
          }
        )
      };
    case SIDEBAR_ITEM_TYPE.TOPIC:
      return buildSidebarTopic(sidebarItem, options);
    case SIDEBAR_ITEM_TYPE.LINK:
      return buildSidebarLink(sidebarItem, options);
    default:
      throw new Error(`Unknown sidebar item type: ${type}`);
  }
}

/**
 * Constructs a sidebar link object with the specified properties.
 *
 * @param {Object} sidebarItem - The sidebar item containing label and href.
 * @param {Object} options - Additional options for building the link.
 * @returns {Object} An object representing a sidebar link with type, label, and href.
 */
function buildSidebarLink(sidebarItem, options) {
  return {
    type: 'link',
    label: sidebarItem.label,
    href: sidebarItem.href
  };
}

/**
 * Builds a sidebar topic.
 *
 * @param {Object} sidebarItem - A sidebar item.
 * @param {Object} options - Configuration options for building the sidebar.
 * @returns {Object} A sidebar topic.
 */
function buildSidebarTopic(sidebarItem, options) {
  const topicPath = buildParentPath(options.parentPath, sidebarItem.path);

  const { id, slug, label } = sidebarItem;

  itemId = [id, slug, slugify(label)].map(getPathSlugify).filter(item => item).join('');
  const filename = [topicPath, itemId].filter(item => item && item.trim() !== '').join('/');
  logInfo(options.verbose, `Building sidebar topic: ${filename}`);
  return filename;
}

/**
 * Finds duplicated sidebar labels in the given files.
 *
 * @param {Array} files - An array of file paths to check for duplicated sidebar labels.
 * @returns {Array} An array of duplicated sidebar labels.
 */
function findDuplicatedSidebarLabels(files) {
  const labelCounts = {};
  for (const file of files) {
    try {
      const { sidebars } = getSidebars(file);
      for (const sidebar of sidebars) {
        const label = sidebar.label;
        labelCounts[label] = labelCounts[label] || { count: 0, files: [] };
        labelCounts[label].count++;
        labelCounts[label].files.push(file);
      }
    } catch (error) {
      logError(true, `Error processing file ${file}: ${error.message}`);
      // console.error(`Error processing file ${file}: ${error.message}`);
    }
  }

  const duplicatedLabels = Object.entries(labelCounts)
    .filter(([label, { count }]) => count > 1)
    .map(([label]) => label);

  return duplicatedLabels;
}

/**
 * Retrieves files matching the given patterns or fallback patterns.
 *
 * @param {Array} patterns - An array of patterns to match files.
 * @param {Array} fallbackPatterns - An array of fallback patterns if no files match the primary patterns.
 * @returns {Array} An array of file paths matching the patterns.
 */
function getFilesFromPatterns(patterns, fallbackPatterns) {
  const files = globSync(patterns);
  if (files.length > 0) return files;
  return globSync(fallbackPatterns);
}

/**
 * Extracts sidebars from a given file.
 *
 * @param {string} file - The file path to extract sidebars from.
 * @returns {Object} An object containing the extracted sidebars.
 */
function getSidebars(file) {
  const { sidebars, ...rest } = yamljs.load(file);
  return { sidebars: sidebars.map(normalizeSidebarItem), ...rest };
}

/**
 * Determines the type of a sidebar item.
 *
 * @param {Object} sidebarItem - The sidebar item to determine the type of.
 * @returns {number} A numeric constant representing the type of the sidebar item: CATEGORY, TOPIC, or LINK.
 */
function getTypeOfSidebarItem(sidebarItem) {
  if (Array.isArray(sidebarItem.items) && sidebarItem.items.length > 0) {
    return SIDEBAR_ITEM_TYPE.CATEGORY;
  } else if (sidebarItem.href) {
    return SIDEBAR_ITEM_TYPE.LINK;
  } else {
    return SIDEBAR_ITEM_TYPE.TOPIC;
  }
}

/**
 * Validates a YAML file against a given schema.
 *
 * @param {string} file - The path to the YAML file to be validated.
 * @param {object} schema - The schema to validate the YAML file against.
 * @returns {boolean} - Returns true if the file is valid, otherwise false.
 * @throws {Error} - Throws an error if validation fails, with details of the validation errors.
 */
function isValidOutlineFile(file, schema) {
  try {
    const result = validate(yamljs.load(file), schema);
    if (result.valid)
      return result.valid;
    throw new Error(result.errors.map(error => error.stack).join('\n'));
  } catch (error) {
    logError(true, `Error validating outline file ${file}: ${error.message}`);
    return false;
  }
}

/**
 * Normalizes a sidebar item by ensuring it has a label and proper structure.
 *
 * @param {Object|string} sidebarItem - The sidebar item to normalize.
 * @returns {Object} The normalized sidebar item.
 * @throws Will throw an error if the sidebar item structure is invalid.
 */
function normalizeSidebarItem(sidebarItem) {
  if (typeof sidebarItem === 'string' && sidebarItem.trim() !== '') {
    return { label: sidebarItem };
  } else if (typeof sidebarItem === 'object' && !sidebarItem.label) {
    const firstKey = Object.keys(sidebarItem)[0];
    const firstValue = sidebarItem[firstKey];
    sidebarItem = { label: firstKey, items: firstValue };
    return normalizeSidebarItem(sidebarItem);
  }

  if (typeof sidebarItem === 'object' && sidebarItem.label && typeof sidebarItem.label === 'string') {
    sidebarItem.label = sidebarItem.label.trim();
  }

  if (sidebarItem.headings && Array.isArray(sidebarItem.headings)) {
    sidebarItem.headings = sidebarItem.headings.map(normalizeSidebarItem);
  }

  if (sidebarItem.headings && !Array.isArray(sidebarItem.headings)) {
    throw new Error('Invalid sidebar item: headings property must be an array.');
  }

  if (sidebarItem.items && Array.isArray(sidebarItem.items)) {
    sidebarItem.items = sidebarItem.items.map(normalizeSidebarItem);
  }

  if (sidebarItem.items && !Array.isArray(sidebarItem.items)) {
    throw new Error('Invalid sidebar item: items property must be an array.');
  }

  if (sidebarItem.headings && Array.isArray(sidebarItem.headings) && sidebarItem.items && Array.isArray(sidebarItem.items)) {
    throw new Error('Invalid sidebar item: both headings and items properties cannot be arrays simultaneously.');
  }

  return sidebarItem;
}

/**
 * Generates a sidebars file using the provided documentation sidebars and options.
 *
 * @param {Object} documentationSidebars - An object representing the documentation sidebars.
 * @param {Object} options - Configuration options for generating the sidebars file.
 * @param {string} options.templates - The path to the templates directory.
 * @param {string} options.sidebars - The path where the generated sidebars file should be saved.
 * @throws Will throw an error if the documentationSidebars is not an object.
 * @throws Will throw an error if the options object is missing required properties.
 * @throws Will throw an error if the template or sidebars path does not exist.
 */
function generateSidebarsFile(documentationSidebars, options) {
  if (!documentationSidebars || typeof documentationSidebars !== 'object') {
    throw new Error('Invalid documentationSidebars: expected an object.');
  }

  if (!options || typeof options !== 'object' || !options.templates || !options.sidebars) {
    throw new Error('Invalid options: expected an object with `templates` and `sidebars` properties.');
  }

  const sidebarsContent = renderTemplateFile(
    'sidebars',
    { sidebars: JSON.stringify(documentationSidebars, null, 4) },
    {
      templates: options.templates,
      templateExtension: options.templateExtension
    }
  )

  const sidebars = setDefaultExtension(options.sidebars, '.js');
  try {
    fsSync.writeFileSync(sidebars, sidebarsContent, 'utf8');
    logInfo(options.verbose, `Successfully wrote sidebars to ${sidebars}`);
  } catch (error) {
    logError(options.verbose, `Error writing file: ${error.message}`);
  }
}

/**
 * Renders a template file using Handlebars.
 *
 * @param {string} templateName - The name of the template file.
 * @param {Object} data - The data to be used in the template.
 * @param {Object} options - Options for rendering the template.
 * @returns {string} The rendered template content.
 * @throws Will throw an error if the template file does not exist.
 */
function renderTemplateFile(templateName, data, options) {
  const { templates = 'templates', templateExtension = '.hbs' } = options;

  const templateFilenameBase = path.resolve(templates, `${templateName}`);
  const templateFilename = (templateExtension) ? setDefaultExtension(templateFilenameBase, templateExtension) : templateFilenameBase;

  if (!fsSync.existsSync(templateFilename)) {
    throw new Error(`Invalid path: ${templateFilename} does not exist.`);
  }

  let templateContent;
  try {
    templateContent = fsSync.readFileSync(templateFilename, 'utf8');
  } catch (error) {
    logError(true, `Error reading file: ${error.message}`);
    return;
  }

  const compiledTemplate = Handlebars.compile(templateContent);
  const content = compiledTemplate(data);
  return content;
}

/**
 * Sets the default extension for sidebars to '.js'.
 *
 * @param {string} sidebarsPath - The path to the sidebars file.
 * @returns {string} The path to the sidebars file with the default extension.
 */
function setDefaultExtension(sidebarsPath, ext) {
  if (!sidebarsPath) {
    throw new Error('Invalid sidebarsPath: expected a string.');
  }

  const extension = path.extname(sidebarsPath);
  if (extension === ext) {
    return sidebarsPath;
  } else {
    return `${sidebarsPath}${ext}`;
  }
}

module.exports = {
  buildDocumentationSidebar,
  buildDocumentationSidebarsLayout,
  buildSidebarCategory,
  buildSidebarItem,
  buildSidebarLink,
  buildSidebarTopic,
  findDuplicatedSidebarLabels,
  generateSidebarsFile,
  getFilesFromPatterns,
  getSidebars,
  getTypeOfSidebarItem,
  isValidOutlineFile,
  normalizeSidebarItem,
  renderTemplateFile,
  setDefaultExtension
};
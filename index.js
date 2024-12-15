#!/usr/bin/env node

const {  loadDocusaurusConfig } = require('./lib/skelo-outline');
const jsYaml = require('yamljs');
const { slugify} = require('./lib/skelo-files');
const { extractMarkdownStructure } = require('./lib/skelo-outline');

const { generateSidebarsFile, buildSidebarsLayout, validateFilesAndShowDuplicatedLabels } = require('./lib/skelo-utils');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

const FALLBACK_PATTERNS = [
  '**/*.outline.yaml',
  '**/*.outline.yml',
  '__outlines__/**/*.yaml',
  '__outlines__/**/*.yml'
]

const SKELO_CONFIG_FILE = './skelo.config.json';

const DEFAULT_TEMPLATE_NAMES = {
  templateNames: {
    SIDEBARS_TEMPLATE: "sidebars",
    TOPIC_TEMPLATE: "topic",
    HEADING_TEMPLATE: "heading"
  }
};

const DEFAULT_OPTIONS = {
  verbose: false,
  docs: 'docs',
  sidebarsFilename: 'sidebars.js',
  fallbackPatterns: FALLBACK_PATTERNS,
  templates: 'templates',
  templateExtension: '.hbs',
  schemaFilename: 'schemas/outline/v1/outline.schema.json',
  config: SKELO_CONFIG_FILE, // Default config file path
};

const { version, name, description } = require('./package.json');

/**
 * Reads a configuration file and returns a merged configuration
 * object containing default options, template names, and options
 * loaded from the configuration file. Options specified in the
 * configuration file override the default options.
 *
 * @param {string} configFile - The path to the configuration file.
 * @returns {Object} Merged configuration object.
 */
function getConfiguration(configFile) {
  const config = { ...DEFAULT_OPTIONS, ...DEFAULT_TEMPLATE_NAMES };  // Start with defaults

  try {
    const resolvedConfigPath = path.resolve(configFile); // Resolve path

    if (fs.existsSync(resolvedConfigPath)) {
      const configContent = fs.readFileSync(resolvedConfigPath, 'utf8');
      const loadedConfig = JSON.parse(configContent);

      // Merge loaded config, overriding defaults and template names
      Object.assign(config, loadedConfig, loadedConfig.templateNames ? { templateNames: loadedConfig.templateNames } : {});

      // Resolve relative paths in config file relative to the config file's directory.
      for (const option of ['docs', 'sidebarsFilename', 'templates', 'schemaFilename']) {
        if (typeof config[option] === 'string') {
          config[option] = path.resolve(path.dirname(resolvedConfigPath), config[option]);
        }
      }
    } else {
      console.warn(`Config file not found at ${resolvedConfigPath}. Using default options.`);
    }
  } catch (err) {
    console.error("Error reading or parsing config file:", err);
  }

  return config;
}

let program = new Command();

program
  .name(name)
  .description(description)
  .version(version)
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    showGlobalOptions: true,
    width: 100
  })

program
  .command('build', { isDefault: true })
  .alias('b')
  .description('Build Docusaurus documentation')

  .argument('[patterns...]', 'Glob patterns for outline files')

  .option('-v, --verbose', 'Verbose output')
  .option('-d, --docs <path>', 'Docusaurus documentation directory', 'docs')
  .option('-s, --sidebarsFilename <filePath>', 'Sidebars file name', 'sidebars.js')
  .option('--fallback-patterns <patterns...>', 'Fallback glob patterns for outline files', FALLBACK_PATTERNS)
  .option('--templates <path>', 'Templates directory', 'templates')
  .option('--templateExtension <ext>', 'Template file extension', '.hbs')
  .option('--schemaFilename <path>', 'Schema file', 'schemas/outline/v1/outline.schema.json')
  .option('-c, --config <path>', 'Path to the configuration file', SKELO_CONFIG_FILE) // Add config option
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    width: 100
  })

  .action((patterns, options) => {
    const configFilePath = path.resolve(options.config); // Resolve the provided config path
    const config = getConfiguration(configFilePath);    // Use the resolved path
    const combinedOptions = { ...config, ...options }; // Config overrides options
    const generatedSidebarsLayout = buildSidebarsLayout(patterns, combinedOptions);
    generateSidebarsFile(generatedSidebarsLayout, combinedOptions);
  })

program
  .command('validate')
  .alias('v')
  .description('Validate outline files')
  .argument('[patterns...]', 'Glob patterns for outline files')
  .option('-v, --verbose', 'Verbose output')
  .option('--fallback-patterns <patterns...>', 'Fallback glob patterns for outline files', FALLBACK_PATTERNS)
  .option('--schemaFilename <path>', 'Schema file', 'schemas/outline/v1/outline.schema.json')
  .option('-c, --config <path>', 'Path to the configuration file', SKELO_CONFIG_FILE) // Add config option
  .action((patterns, options) => {
    const configFilePath = path.resolve(options.config); // Resolve the provided config path
    const config = getConfiguration(configFilePath);    // Use the resolved path
    const combinedOptions = { ...config, ...options }; // Config overrides options
    validateFilesAndShowDuplicatedLabels(patterns, combinedOptions);
  })

  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    width: 100
  })

program
  .command('init')
  .alias('i')
  .argument('[configFile]', 'Path to the configuration file', SKELO_CONFIG_FILE)
  .description('Create a default configuration file')
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    width: 100
  })
  .action((configFile) => {
    const configFilePath = path.resolve(configFile || SKELO_CONFIG_FILE);
    const defaultConfig = { ...DEFAULT_OPTIONS, ...DEFAULT_TEMPLATE_NAMES };

    const sortedConfig = Object.keys(defaultConfig).sort().reduce((obj, key) => {
      let value = defaultConfig[key];

      // Sort array values if the value is an array
      if (Array.isArray(value)) {
        value = value.sort();
      }

      // Sort object values recursively by key names if the value is an object
      else if (typeof value === 'object' && value !== null) {
        value = Object.keys(value).sort().reduce((sortedObj, innerKey) => {
          sortedObj[innerKey] = value[innerKey];
          return sortedObj;
        }, {});
      }

      obj[key] = value;
      return obj;
    }, {});

    try {
      fs.writeFileSync(configFilePath, JSON.stringify(sortedConfig, null, 2), 'utf8');
      console.log(`Configuration file created at ${configFilePath}`);
    } catch (err) {
      console.error(`Error creating configuration file: ${err.message}`);
    }
  });

program
  .command('outline')
  .alias('o')
  .description('Create outline files from a directory of markdown files')
  .argument('targetOutlineDir', 'Target directory for outline files')
  .option('-c, --config <path>', 'Path to the configuration file', SKELO_CONFIG_FILE) // Add config option
  .option('-v, --verbose', 'Verbose output')
  .option('-d, --docs <path>', 'Docusaurus documentation directory', 'docs')
  // .option('--fallback-patterns <patterns...>', 'Fallback glob patterns for outline files', FALLBACK_PATTERNS)
  .option('-s, --sidebarsFilename <filePath>', 'Sidebars file name', 'sidebars.js')
  .option('--schemaFilename <path>', 'Schema file', 'schemas/outline/v1/outline.schema.json')

  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    width: 100
  })
  .action((targetOutlineDir, options) => {
    const sidebars = loadDocusaurusConfig(path.join(options.sidebarsFilename)); // gets the sidebars.js file specified in options.sidebarsFilename

    Object.entries(sidebars).forEach(([sidebarName, items]) => {
      const outlineSidebar = {
        sidebars: [{
        label: sidebarName,
        items: items.reduce((acc, item) => {
          const sidebarItemFilename = path.join(options.docs, `${item}.md`); // path.join(options.docs, item);
          const sidebarItemContent = fs.readFileSync(sidebarItemFilename, 'utf8');
          const sidebarItem = extractMarkdownStructure(sidebarItemContent)
          acc.push(sidebarItem);
          return acc;
        }, [])
      }]}

      const outlineFilename = path.resolve(targetOutlineDir, `${slugify(sidebarName)}.outline.yaml`);
      try {
        fs.mkdirSync(path.dirname(outlineFilename), { recursive: true });
        fs.writeFileSync(outlineFilename, jsYaml.stringify(outlineSidebar, 10, 4), 'utf8');
      } catch (err) {
        console.error(`Error writing outline file ${outlineFilename}: ${err.message}`);
      }
    })
  });

program.parse("node index.js outline __generated_outlines__ --verbose ".split(' '));
// program.parse("node index.js sample.outline.yaml --verbose ".split(' '));
// program.parse();

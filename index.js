#!/usr/bin/env node

const { Command } = require('commander')
const path = require('path')
const fsSync = require('fs')

const { useDefaultSchemaIfNeeded } = require('./lib/skelo-validate-schema')
const { generateSidebarsFile, buildDocumentationSidebarsLayout, isValidOutlineFile, getFilesFromPatterns, findDuplicatedSidebarLabels } = require('./lib/skelo-utils')

const { logInfo, logDebug, logWarn, logError } = require('./lib/skelo-logger');

const program = new Command()

const fallbackPatterns = [
  '**/*.[Oo]outline.yaml', '**/*.[Oo]outline.yml',
  '__outlines__/**/*.yaml', '__outlines__/**/*.yml'
]

const defaultSchemaLocation = path.join(__dirname, '../skelo/schemas/outline/v1/outline.schema.json')

const { name, description, version } = require('./package.json')
const { log } = require('console')

program
  .name(name)
  .description(description)
  .version(version)

program
  .command('build', { isDefault: true })
  .description('Build documentation files from outline files matching the filename patterns')

  .argument('[patterns...]', 'outline filename patterns')

  .option('-d, --docs <path>', 'path to folder of generated documentation files', 'docs')
  .option('-s, --sidebars <filepath>', 'path and filename of sidebars file', 'sidebars.js')
  .option('--fallback-patterns <patterns...>', 'fallback patterns', fallbackPatterns)
  .option('--verbose', 'verbose output')
  .option('--schema <filepath>', 'json schema validation filename', defaultSchemaLocation)
  .option('--templates <path>', 'path to folder of template files', path.join(__dirname, 'templates'))
  .option('--template-extension <ext>', 'template file extension', '.hbs')

  /**
   * Builds documentation files from outline files matching the filename patterns.
   *
   * @param {Array} patterns - An array of patterns used to find outline files.
   * @param {Object} options - Configuration options for building documentation.
   * @param {string} options.docs - The path to the folder of generated documentation files.
   * @param {string} options.sidebars - The path and filename of the sidebars file.
   * @param {Array} options.fallbackPatterns - Fallback patterns for finding outline files.
   * @param {boolean} options.verbose - Whether to display verbose output.
   * @param {string} options.schema - The path to the JSON schema validation file.
   * @param {string} options.templates - The path to the folder of template files.
   * @param {string} options.templateExtension - The template file extension.
   */
  .action((patterns, options) => {
    try {
      const opts = useDefaultSchemaIfNeeded(options, defaultSchemaLocation)
      const documentationSidebars = buildDocumentationSidebarsLayout(patterns, opts)
      generateSidebarsFile(documentationSidebars, opts)
    } catch (error) {
      logError(options.verbose, error.message)
      process.exit(1)
    }
  })

program
  .command('validate')
  .description('Validate outline files matching the filename patterns')
  .argument('[patterns...]', 'outline filename patterns')
  .option('--schema <filepath>', 'json schema validation filename', defaultSchemaLocation)
  .option('--verbose', 'verbose output')
  .option('--fallback-patterns <patterns...>', 'fallback patterns', fallbackPatterns)

  /**
   * Validates outline files matching the provided filename patterns.
   *
   * @param {Array} patterns - An array of patterns used to find outline files.
   * @param {Object} options - Configuration options for validation.
   * @param {string} options.schema - The path to the JSON schema validation file.
   * @param {boolean} options.verbose - Whether to display verbose output.
   * @param {Array} options.fallbackPatterns - Fallback patterns for finding outline files.
   */
  .action((patterns, options) => {
    try {
      const files = getFilesFromPatterns(patterns, options.fallbackPatterns);
      const schemaObject = JSON.parse(fsSync.readFileSync(options.schema, 'utf8'));
      const invalidFiles = files.filter(file => !isValidOutlineFile(file, schemaObject));
      const validFiles = files.filter(file => !invalidFiles.includes(file));

      const duplicatedSidebars = findDuplicatedSidebarLabels(validFiles);
      if (duplicatedSidebars.length > 0) {
        logError(options.verbose, `Duplicated sidebars labels: ${duplicatedSidebars.join(', ')}`);
      }

      if (invalidFiles.length > 0) {
        logError(options.verbose, `Invalid outline file(s): ${invalidFiles.join(', ')}`);
      }

      if (duplicatedSidebars.length > 0 || invalidFiles.length > 0) {
        logError(options.verbose, `Invalid outline file(s): ${invalidFiles.join(', ')}`);
        process.exit(1);
      }

      logInfo(options.verbose, `All outline files are valid. No duplicated sidebars labels.`);
    } catch (error) {
      logError(options.verbose, error.message)
      process.exit(1)
    }
  })

program.configureHelp({
  sortSubcommands: true,
  sortOptions: true,
  showGlobalOptions: true,
  showDirSummary: true,
  helpWidth: 100
})

program.parse();

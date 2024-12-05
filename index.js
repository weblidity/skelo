#!/usr/bin/env node

const {generateSidebarsFile, buildSidebarsLayout, validateFilesAndShowDuplicatedLabels} = require('./lib/skelo-utils');

const { Command} = require('commander');

const fallbackPatterns = [
  '**/*.outline.yaml',
  '**/*.outline.yml',
  '__outlines__/**/*.yaml',
  '__outlines__/**/*.yml'
]

const {version, name, description} = require('./package.json');

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
  .command('build', {isDefault: true})
  .alias('b')
  .description('Build Docusaurus documentation')

  .argument('[patterns...]', 'Glob patterns for outline files')

  .option('-v, --verbose', 'Verbose output')
  .option('-d, --docs <path>', 'Docusaurus documentation directory', 'docs')
  .option('-s, --sidebarsFilename <filePath>', 'Sidebars file name', 'sidebars.js')
  .option('--fallback-patterns <patterns...>', 'Fallback glob patterns for outline files', fallbackPatterns)
  .option('--templates <path>', 'Templates directory', 'templates')
  .option('--templateExtension <ext>', 'Template file extension', '.hbs')
  .option('--schemaFilename <path>', 'Schema file', 'schemas/outline/v1/outline.schema.json')

  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    width: 100
  })

  .action((patterns, options) => {
    const generatedSidebarsLayout = buildSidebarsLayout(patterns, options);
    generateSidebarsFile(generatedSidebarsLayout, options);
  })

program
  .command('validate')
  .alias('v')
  .description('Validate outline files')
  .argument('[patterns...]', 'Glob patterns for outline files')
  .option('-v, --verbose', 'Verbose output')
  .option('--fallback-patterns <patterns...>', 'Fallback glob patterns for outline files', fallbackPatterns)
  .option('--schemaFilename <path>', 'Schema file', 'schemas/outline/v1/outline.schema.json')
  .action((patterns, options) => {
    validateFilesAndShowDuplicatedLabels(patterns, options);
  })

  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    width: 100
  })

// program.parse("node index.js validate  --verbose".split(" "))
// program.parse("node index.js -d test/website/docs -s test/website/sidebars.js --verbose".split(" "))
program.parse();

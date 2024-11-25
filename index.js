const { Command } = require('commander');
const path = require('path');

const {useDefaultSchemaIfNeeded} = require('./lib/skelo-validate-schema');


let program = new Command();

const fallbackPatterns = [
    '**/*.[Oo]outline.yaml', '**/*.[Oo]outline.yml',
    '__outlines__/**/*.yaml', '__outlines__/**/*.yml'
];

const defaultSchemaLocation = path.join(__dirname, '../skelo/schemas/outline.schema.json');


const { name, description, version } = require('./package.json');

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
    .action((patterns, options) => {


        options = useDefaultSchemaIfNeeded(options, defaultSchemaLocation);

        console.log('schema', options.schema);

    })

program.configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    showGlobalOptions: true,
    showDirSummary: true,
    helpWidth: 100,
})

program.parse();



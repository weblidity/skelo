```bash

Usage: skelo-cli [options] [command]

Scaffold Docusaurus documentation project using outline files.

Options:
  -h, --help                          display help for command
  -V, --version                       output the version number

Commands:
  build|b [options] [patterns...]     Build Docusaurus documentation
  help [command]                      display help for command
  init|i [configFile]                 Create a default configuration file
  validate|v [options] [patterns...]  Validate outline files
```

**`build` command:**

```bash
Usage: skelo-cli build|b [options] [patterns...]

Build Docusaurus documentation

Arguments:
  patterns                           Glob patterns for outline files

Options:
  -c, --config <path>                Path to the configuration file (default:
                                     "./skelo.config.json")
  -d, --docs <path>                  Docusaurus documentation directory
                                     (default: "docs")
  --fallback-patterns <patterns...>  Fallback glob patterns for outline files
                                     (default:
                                     ["**/*.outline.yaml","**/*.outline.yml","__outlines__/**/*.yaml","__outlines__/**/*.yml"])
  -h, --help                         display help for command
  -s, --sidebarsFilename <filePath>  Sidebars file name (default:
                                     "sidebars.js")
  --schemaFilename <path>            Schema file (default:
                                     "schemas/outline/v1/outline.schema.json")
  --templateExtension <ext>          Template file extension (default: ".hbs")
  --templates <path>                 Templates directory (default: "templates")
  -v, --verbose                      Verbose output
```

**`help` command:**

```bash
Usage: skelo-cli [options] [command]

Scaffold Docusaurus documentation project using outline files.

Options:
  -h, --help                          display help for command
  -V, --version                       output the version number

Commands:
  build|b [options] [patterns...]     Build Docusaurus documentation
  help [command]                      display help for command
  init|i [configFile]                 Create a default configuration file
  validate|v [options] [patterns...]  Validate outline files
```

**`init` command:**

```bash
Usage: skelo-cli init|i [options] [configFile]

Create a default configuration file

Arguments:
  configFile  Path to the configuration file (default: "./skelo.config.json")

Options:
  -h, --help  display help for command
```

**`validate` command:**

```bash
Usage: skelo-cli validate|v [options] [patterns...]

Validate outline files

Arguments:
  patterns                           Glob patterns for outline files

Options:
  -c, --config <path>                Path to the configuration file (default:
                                     "./skelo.config.json")
  --fallback-patterns <patterns...>  Fallback glob patterns for outline files
                                     (default:
                                     ["**/*.outline.yaml","**/*.outline.yml","__outlines__/**/*.yaml","__outlines__/**/*.yml"])
  -h, --help                         display help for command
  --schemaFilename <path>            Schema file (default:
                                     "schemas/outline/v1/outline.schema.json")
  -v, --verbose                      Verbose output
```

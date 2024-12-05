# skelo-cli

Scaffold Docusaurus documentation project using outline files.

[![npm](https://img.shields.io/npm/v/skelo-cli.svg)](https://www.npmjs.com/package/skelo-cli)
[![npm](https://img.shields.io/npm/dm/skelo-cli.svg)](https://www.npmjs.com/package/skelo-cli)
[![Build Status](https://github.com/weblidity/skelo-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/weblidity/skelo-cli/actions/workflows/node.js.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/weblidity/skelo-cli/badge.svg)](https://snyk.io/test/github/weblidity/skelo-cli) <!-- Example, adapt to your vulnerability scanner -->
![License](https://img.shields.io/badge/license-ISC-green)
[![njsscan sarif](https://github.com/weblidity/skelo-cli/actions/workflows/njsscan.yml/badge.svg)](https://github.com/weblidity/skelo-cli/actions/workflows/njsscan.yml)
[![CodeQL Advanced](https://github.com/weblidity/skelo-cli/actions/workflows/codeql.yml/badge.svg)](https://github.com/weblidity/skelo-cli/actions/workflows/codeql.yml)

<!-- [![npm](https://img.shields.io/npm/l/skelo-cli.svg)](https://www.npmjs.com/package/skelo-cli) -->

<!-- [![Coverage Status](https://coveralls.io/repos/github/weblidity/skelo-cli/badge.svg?branch=main)](https://coveralls.io/github/weblidity/skelo-cli?branch=main) --><!-- Example, adapt if using Coveralls -->

## Description

`skelo CLI` is a command-line tool designed to scaffold Docusaurus documentation projects using outline files. It provides utilities to build and validate documentation structures efficiently.

## Table of Contents

- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage - Building Documentation](#basic-usage---building-documentation)
    - [Specifying Options](#specifying-options)
    - [Example Outline File and Generated Output](#example-outline-file-and-generated-output)
  - [Validation](#validation)
- [License](#license)

## Installation

To install `Skelo CLI`, ensure you have Node.js and npm installed, then run:

```bash
npm  install -g skelo-cli
```

## Usage

After installation, you can use the `skelo` command to build or validate your Docusaurus documentation. The core functionality revolves around processing outline files to generate the appropriate file structure and sidebars.

### Basic Usage - Building Documentation

The simplest way to use `skelo build` is to provide a glob pattern matching your outline files:

```bash

skelo  build  **/*.outline.yaml

````

This  command  will  search  for  all  files  ending  in  `.outline.yaml` in the current directory and its subdirectories, and generate the corresponding markdown files in the docs directory (by  default). The sidebars file (`sidebars.js`  by  default) will also be generated to reflect the structure defined in the outlines.
  
#### Specifying Options

You  can  customize  the  behavior  of  skelo  build  with  various  options:

```bash
skelo build **/*.outline.yaml --docs 'website/docs --sidebarsFilename sidebars.js --templates ./custom-templates --templateExtension .hbs
```

This command uses the following options:

- '--docs 'website/docs'`: Specifies that the generated documentation files should be placed in the  `website/docs`  directory.
- `--sidebarsFilename 'sidebars.js'`: Specifies that the generated sidebars file should be named  `sidebars.js`.
- `--templates './custom-templates'`: Specifies a custom directory containing templates.
- `--templateExtension '.hbs'`: Specifies using  `.hbs`  as the template file extension.
```
####  Using Fallback Patterns

If some of your documentation doesn't follow the outline file structure, you can use fallback patterns:

 ```bash
 skelo build '**/*.outline.yaml' --fallback-patterns 'existing-docs/**/*.yaml'
 ```

This will include any markdown files matching `existing-docs/**/*.yaml` in the generated documentation, even if they don't have corresponding outline files. These files will be placed in the appropriate location based on their relative path.

#### Example Outline File and Generated Output

**outline.yaml:**

```yaml
sidebars:
   - label: docsidebar
     items:
	     - label: Getting Started
	       headings:
		       - Installation
		       - First Steps
```

**Generated Markdown (docs/getting-started.md):**

```md
---
sidebar_label: Getting Started
---

# Getting Started

## Installation
## First Steps
```

**Generated Sidebar (sidebars.js):**

```js
module.exports = {
  docsSidebar: [
    'getting-started', // Automatically added based on the outline
    // ...other items
  ],
};
```

### Validation
The `skelo validate` command checks the validity of your outline files against a schema:

```bash
skelo validate '**/*.outline.yaml' --schemaFilename './schemas/custom-outline.schema.json'
```
This validates all outline files against the specified schema file, ensuring data integrity and consistency. Any validation errors will be reported to the console.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

> Written with [StackEdit](https://stackedit.io/).
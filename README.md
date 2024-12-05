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
<!-- [![Coverage Status](https://coveralls.io/repos/github/weblidity/skelo-cli/badge.svg?branch=main)](https://coveralls.io/github/weblidity/skelo-cli?branch=main) --><!--  Example, adapt if using Coveralls -->

## Description

`skelo CLI` is a command-line tool designed to scaffold Docusaurus documentation projects using outline files. It provides utilities to build and validate documentation structures efficiently.

## Table of Contents

- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
  - [`build`](#build)
  - [`validate`](#validate)
- [License](#license)

## Installation

To install `Skelo CLI`, ensure you have Node.js and npm installed, then run:

```bash
$ npm install -g skelo-cli
```

## Usage

After installation, you can use the skelo command to build or validate your Docusaurus documentation.

```bash
$ skelo build [options] [patterns...]
$ skelo validate [options] [patterns...]
```

## Commands

### `build`

Builds the Docusaurus documentation using outline files.

- **Default command**: `true`
- **Aliases**: `b`
- **Arguments**: [patterns...] - Glob patterns for outline files.
- **Options**:

  * `-v, --verbose`: Verbose output

  * `-d, --docs <path>`: Docusaurus documentation directory (default: docs)

  * `-s, --sidebarsFilename <filePath>`: Sidebars file name (default: sidebars.js)

  * `--fallback-patterns <patterns...>`: Fallback glob patterns for outline files (default: [])

  * `--templates <path>`: Templates directory (default: templates)

  * `--templateExtension <ext>`: Template file extension (default: .hbs)

  * `--schemaFilename <path>`: Schema file (default: schemas/outline/v1/outline.schema.json)

### `validate`

Validates the Docusaurus documentation using outline files.

- **Aliases**: `v`
- **Arguments**: `[patterns...]` - Glob patterns for outline files.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

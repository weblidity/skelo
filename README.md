# skelo-cli


        
Scaffold documentation projects for Docusaurus from outline files.      



[![npm](https://img.shields.io/npm/v/skelo-cli)](https://www.npmjs.com/package/skelo-cli)
[![Node.js CI](https://github.com/weblidity/skelo-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/weblidity/skelo-cli/actions/workflows/node.js.yml)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [Options](#options)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

skelo-cli is a command-line tool that helps you scaffold documentation projects for Docusaurus using outline files. It provides a simple and efficient way to generate documentation projects from outline files, making it easier to manage and maintain your documentation.

## Getting Started

To get started with Skelo, follow these steps:

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

To install Skelo, run the following command:

```bash
npm install -g skelo-cli
```

## Features

Skelo provides the following features:

- Scaffold documentation projects for Docusaurus from outline files
- Support for multiple outline file formats (YAML, JSON)
- Customizable templates for documentation projects
- Validation of outline files against a JSON schema

## Usage

To use Skelo, run the following command:

```bash
skelo [build|b] <outline-file-patterns> [options]
```

### Options

To use Skelo with options, run the following command:

```bash
skelo [build|] <outline-file-patterns> [options]
```

Options:

- `-d, --docs <path>`: Path to folder of generated documentation files (default: `docs`)
- `-s, --sidebars <filepath>`: Path and filename of sidebars file (default: `sidebars.js`)
- `--fallback-patterns <patterns...>`: Fallback patterns for finding outline files
- `--schema <filepath>`: Path to JSON schema validation file (default: `outline.schema.json`)
- `-t, --templates <path>`: Path to folder of template files (default: `templates`)
- `-e, --template-extension <ext>`: Template file extension (default: `.hbs`)
- `-v, --verbose`: Enable verbose logging
- `-h, --help`: Display this help message

## Contributing

Contributions are welcome! If you'd like to contribute to Skelo, please follow these steps:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request
5. Wait for your pull request to be merged

## License

Skelo is distributed under the ISC License. See `LICENSE` for more information.

## Acknowledgments

Skelo uses the following dependencies:

- [commander](https://www.npmjs.com/package/commander)
- [glob](https://www.npmjs.com/package/glob)
- [handlebars](https://www.npmjs.com/package/handlebars)
- [jest](https://www.npmjs.com/package/jest)
- [jsonschema](https://www.npmjs.com/package/jsonschema)
- [mkdirp](https://www.npmjs.com/package/mkdirp)
- [path](https://www.npmjs.com/package/path)
- [shelljs](https://www.npmjs.com/package/shelljs)
- [winston](https://www.npmjs.com/package/winston)
- [yamljs](https://www.npmjs.com/package/yamljs)


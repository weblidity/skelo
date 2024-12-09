# skelo-cli



Scaffold Docusaurus documentation project using outline files.

[![npm](https://img.shields.io/npm/v/skelo-cli.svg)](https://www.npmjs.com/package/skelo-cli)
[![npm](https://img.shields.io/npm/dm/skelo-cli.svg)](https://www.npmjs.com/package/skelo-cli)
[![Build Status](https://github.com/weblidity/skelo-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/weblidity/skelo-cli/actions/workflows/node.js.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/weblidity/skelo-cli/badge.svg)](https://snyk.io/test/github/weblidity/skelo-cli) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fweblidity%2Fskelo-cli.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fweblidity%2Fskelo-cli?ref=badge_shield)
![License](https://img.shields.io/badge/license-MIT-green)
[![njsscan sarif](https://github.com/weblidity/skelo-cli/actions/workflows/njsscan.yml/badge.svg)](https://github.com/weblidity/skelo-cli/actions/workflows/njsscan.yml)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fweblidity%2Fskelo-cli.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fweblidity%2Fskelo-cli?ref=badge_shield&issueType=security)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fweblidity%2Fskelo-cli.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fweblidity%2Fskelo-cli?ref=badge_shield&issueType=license)
[![Maintainability](https://api.codeclimate.com/v1/badges/d92abd58b192b90e0f31/maintainability)](https://codeclimate.com/github/weblidity/skelo-cli/maintainability)

## Description

`skelo-cli` is a command-line tool designed to scaffold Docusaurus documentation projects using outline files. It provides utilities to build and validate documentation structures efficiently.

## Table of Contents

- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Help and Version](#basic-help-and-version)
  - [Help Command Output](#help-command-output)
  - [`build` - Building Skeletion Documentation](#build---building-skeletion-documentation)
    - [Specifying Options](#specifying-options)
    - [Using Fallback Patterns](#using-fallback-patterns)
    - [Example Outline File and Generated Output](#example-outline-file-and-generated-output)
  - [`validate` - Outline Files Validation](#validate---outline-files-validation)
  - [`init` - Initialize Configuration File](#init---initialize-configuration-file)
- [Outline File Format](#outline-file-format)
  - [Key Points](#key-points)
- [Templating](#templating)
  - [Default Template](#default-template)
  - [Custom Templates](#custom-templates)
  - [Template Variables](#template-variables)
  - [Example Custom Template (topic.hbs)](#example-custom-template-topichbs)
- [Schema Validation](#schema-validation)
  - [The Schema File (schemas/outline/v1/outline.schema.json by default)](#the-schema-file-schemasoutlinev1outlineschemajson-by-default)
    - [How Schema Validation Works](#how-schema-validation-works)
    - [Outline File Error Reporting](#outline-file-error-reporting)
- [Error Handling](#error-handling)
  - [Outline File Errors](#outline-file-errors)
  - [Templating Errors](#templating-errors)
  - [General Error Handling Best Practices](#general-error-handling-best-practices)
- [Troubleshooting](#troubleshooting)
- [Related Tools](#related-tools)
- [Configuration File](#configuration-file)
- [Author](#author)
- [License](#license)

## Installation

To install `skelo-cli`, ensure you have Node.js and npm installed, then run:

```bash
npm  install -g skelo-cli
```

## Usage

After installation, you can use the `skelo` command to build or validate your Docusaurus documentation. The core functionality revolves around processing outline files to generate the appropriate file structure and sidebars.

Running with npx (without global installation):

If you don't want to install skelo-cli globally, you can use npx to run it directly:

```bash
npx skelo build **/*.outline.md
npx skelo validate **/*.outline.md
```

This will download and execute the latest version of `skelo-cli` without requiring a global installation. This is particularly useful for trying out the tool or for CI/CD pipelines where you want to ensure you're using a specific version.

### Basic Help and Version

To view the available commands and options, use the following flags:

-h or --help: Display help for the command.
-V or --version: Display the version of skelo-cli.

```bash
$ skelo -h
$ skelo -V
```
>
> **Note:** You can also use `skelo --help` or `skelo --version` to get the same information.

```bash
$ skelo -h
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

Options can be specified via options or config file.
See skelo <command> --help for more info on a command.
```

### Help Command Output

Below is the output of the help command for each available command:

Build Command

```bash
$ skelo build -h # or help build

Usage: skelo build [options] [patterns...]

Build Docusaurus documentation from outline files.

Options:
  -v, --verbose         Verbose output
  --fallback-patterns <patterns...>  Fallback glob patterns for outline files
  --schemaFilename <path>            Schema file (default: "schemas/outline/v1/outline.schema.json")
  -c, --config <path>                Path to the configuration file (default: "./skelo.config.json")
  --templates <directory>            Directory containing custom templates
  --templateExtension <extension>    File extension to use when looking up templates (default: ".hbs")
  -h, --help                         Display help for command
```
Init Command

```bash
$ skelo init -h # or help init
Usage: skelo-cli init|i [options] [configFile]

Create a default configuration file

Arguments:
  configFile  Path to the configuration file (default: "./skelo.config.json")

Options:
  -h, --help  display help for command
```

Validate Command

```bash
$ skelo validate -h # or help validate

Usage: skelo validate [options] [patterns...]

Validate outline files.

Options:
  -v, --verbose         Verbose output
  --fallback-patterns <patterns...>  Fallback glob patterns for outline files
  --schemaFilename <path>            Schema file (default: "schemas/outline/v1/outline.schema.json")
  -c, --config <path>                Path to the configuration file (default: "./skelo.config.json")
  -h, --help                         Display help for command
```

### `build` - Building Skeletion Documentation

The simplest way to use `skelo build` is to provide a glob pattern matching your outline files:

```bash
skelo  build  **/*.outline.yaml
````

This  command  will  search  for  all  files  ending  in  `.outline.yaml` in the current directory and its subdirectories, and generate the corresponding markdown files in the docs directory (by  default). The sidebars file (`sidebars.js`  by  default) will also be generated to reflect the structure defined in the outlines.

#### Specifying Options

You  can  customize  the  behavior  of  skelo  build  with  various  options:

```bash
skelo build **/*.outline.yaml --docs website/docs --sidebarsFilename sidebars.js --templates ./custom-templates --templateExtension .hbs
```

This command uses the following options:

- `--docs 'website/docs`: Specifies that the generated documentation files should be placed in the `website/docs`  directory.
- `--sidebarsFilename sidebars.js`: The generated sidebars file should be named  `sidebars.js`.
- `--templates ./custom-templates`: Specifies a custom directory containing templates.
- `--templateExtension .hbs`: Specifies using  `.hbs`  as the template file extension.

#### Using Fallback Patterns

If some of your documentation doesn't follow the outline file structure, you can use fallback patterns:

 ```bash
 skelo build '**/*.outline.yaml' --fallback-patterns 'existing-docs/**/*.yaml'
 ```

This will include any markdown files matching `existing-docs/**/*.yaml` in the generated documentation, even if they don't have corresponding outline files. Based on their relative path, these files will be placed in the appropriate location.

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

### `validate` - Outline Files Validation

The `skelo validate` command checks the validity of your outline files against a schema:

```bash
skelo validate **/*.outline.yaml --schemaFilename ./schemas/custom-outline.schema.json
```

This validates all outline files against the specified schema file, ensuring data integrity and consistency. Any validation errors will be reported to the console.

### `init` - Initialize Configuration File

The `skelo init` command creates a configuration file for `skelo`:

```bash
skelo init
```
This command creates `skelo.config.json` configuration file in current working file.

```bash
skelo init my-skelo.config.json
```
This command creates `my-skelo.config.json` configuration file in current working file.

The configuration file looks as follows:

```json
{
  "config": "./skelo.config.json",
  "docs": "docs",
  "fallbackPatterns": [
    "**/*.outline.yaml",
    "**/*.outline.yml",
    "__outlines__/**/*.yaml",
    "__outlines__/**/*.yml"
  ],
  "schemaFilename": "schemas/outline/v1/outline.schema.json",
  "sidebarsFilename": "sidebars.js",
  "templateExtension": ".hbs",
  "templateNames": {
    "HEADING_TEMPLATE": "heading",
    "SIDEBARS_TEMPLATE": "sidebars",
    "TOPIC_TEMPLATE": "topic"
  },
  "templates": "templates",
  "verbose": false
}
```


## Outline File Format

The outline files use `YAML` format to define the structure and metadata of your Docusaurus documentation. They specify the sidebar labels, the order of documents, and their nesting within the sidebar. Frontmatter in the outline files is used to set properties of the generated Markdown files.

Here's a breakdown of the format:

```yaml
# This sets the sidebar properties (required).  The key ('sidebars' in this example)
# should match the name you use to export the sidebars object in your sidebars.js file.
sidebars:
  - label: DocSidebar  # Label for the sidebar (displayed in Docusaurus)
    items:             # Array of items in the sidebar
      - id: introduction  # 'id' maps to the file name (introduction.md). If 'label' is not specified below, the filename will be the label in the sidebar.
        label: Introduction # Label for the item in the sidebar (optional, defaults to filename derived from the 'id' if omitted)
      - id: getting-started
        label: Getting Started
        headings:           # Optional nested headings within a document
          - Installation   # These become h2 elements (##) in the generated Markdown
          - First Steps
      - id: advanced-usage
        label: Advanced Usage
        items:             # Nested items create a hierarchical sidebar structure
          - id: configuration
            label: Configuration
          - id: customization
            label: Customization
  - label: API Reference    # Example of a second sidebar
    items:
      - id: api-overview
        label: Overview
      - id: api-endpoints
        label: Endpoints
---
# Frontmatter Example (Optional)
sidebar_label: Overridden Label # If present, this overrides the 'label' from above in the sidebar
custom_property: some value    # Other properties are passed to the generated Markdown file's frontmatter
---

```

### Key Points

- **sidebars**: The top-level key defining the sidebar structure. You can have multiple sidebars by adding more entries to the top level (e.g., tutorials, api, etc.). Make sure the key matches the name you use in your Docusaurus sidebars.js file.
- **label**: The text displayed in the Docusaurus sidebar for a category or document.
- **id**: The identifier that maps to the filename of the generated Markdown file. For example, id: getting-started will generate getting-started.md. This field is required for all items.
- **headings**: (Optional) Allows you to specify headings within a document, creating a nested structure in the sidebar that links directly to sections within the page. These correspond to h2 elements in the generated Markdown. You can nest headings further (e.g., under a heading, adding subheadings). Those nested headings will be mapped to h3, h4, etc. accordingly.
- **items**: Creates nested structures for both sidebars and within documents. This is how you create hierarchical navigation in your documentation.
- **Frontmatter**: You can include YAML frontmatter below the main YAML structure (separated by ---). The sidebar_label property, if present in frontmatter, overrides the label defined in the outline structure. Any other properties are passed directly to the frontmatter of the generated Markdown file. This is useful for customizing page metadata in Docusaurus.

This structured approach allows you to define the entire structure of your documentation in a single (or multiple) YAML file(s), making it easy to manage and maintain. The use of fallback patterns complements this structure by allowing you to include any pre-existing markdown files not described in the outline.

## Templating

skelo-cli uses the Handlebars templating engine to generate Markdown files from outline files. This allows for greater flexibility and customization of the output.

### Default Template

By default, skelo-cli uses a simple template that creates a Markdown file with the frontmatter and headings specified in the outline file. If no custom template is specified, the content from the outline between the second --- and the end of the file (if present) is inserted into the generated markdown file. If no such content is present, the generated file will contain only frontmatter derived from the outline file.

### Custom Templates

You can customize the generated Markdown files by providing your own Handlebars templates. Use the `--templates <directory>` option to specify the directory containing your custom templates. The `--templateExtension <extension>` option allows you to define the file extension to use when looking up templates (`.hbs` by default).

For example, if you have a template file named page.hbs in a directory called ./my-templates:

```bash
skelo build **/*.outline.yaml --templates ./my-templates
```

`skelo-cli` will look for `./my-templates/page.hbs` and use it as the template for generating Markdown files. If you specify a `--templateExtension` other than `.hbs`, make sure this extension exists in the filename (e.g. `page.ejs` when you pass `--templateExtension .ejs`).

### Template Variables

The following variables are available within your Handlebars templates:

- **frontmatter**: An object containing the frontmatter properties. You can access individual properties using dot notation (e.g., {{frontmatter.sidebar_label}}, {{frontmatter.title}}). All custom properties defined in the outline's frontmatter will also be available here.
- **id**: the value of the id parameter as per the outline file. This corresponds to the name of the generated markdown file.
- **slug**: The slugified version of the id parameter.
- **brief**: The brief property from the outline file.
- **description**: The description property from the outline file.
- **headingItems**: The headings property from the outline file (if present).

### Example Custom Template (topic.hbs)

```handlebars
---
sidebar_label: {{{label}}}
---

{{#if title}}
# {{{title}}}
{{else}}
# {{{label}}}
{{/if}}
{{#if brief}}

{{{brief}}}
{{else}}
{{#if description}}

{{{description}}}
{{/if}}
{{/if}}
{{#if headingItems}}

{{{headingItems}}}
{{/if}}

```

By customizing templates, you can precisely control the format and content of your generated Markdown files, integrating them seamlessly with your Docusaurus project's specific requirements.

## Schema Validation

The schema validation process ensures that your outline files adhere to the expected structure, preventing errors during the generation of your Docusaurus documentation. skelo-cli uses a JSON schema file to define the valid structure for outline files.

### The Schema File (schemas/outline/v1/outline.schema.json by default)

The schema file describes the allowed properties, their types, and any required fields. It acts as a blueprint for valid outline files. While I don't have access to the specific contents of your schemas/outline/v1/outline.schema.json file, a typical schema for outline files might look something like this (simplified example):

```json
{
  "type": "object",
  "properties": {
    "sidebars": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "label": { "type": "string" },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "string", "required": true },
                "label": { "type": "string" },
                "headings": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "items": {
                  "type": "array",  // Allows for nested items
                  "items": { "$ref": "#/properties/sidebars/items/items" } // Recursive reference for nested structures
              }
              },
              "required": ["id"]
            }
          }
        },
        "required": ["label", "items"]
      }
    }
  },
  "required": ["sidebars"],
  "additionalProperties": false // Prevents any extra properties not defined in the schema
}

```

This schema defines that:

- The root must be an object with a required "sidebars" property.
- "sidebars" must be an array.
- Each item in "sidebars" must be an object with "label" and "items" properties.
- "items" must be an array where each item has a required "id" property and optional "label," "headings," and "items" properties to handle nesting.

This ensures a consistent and predictable structure for the outline files.

#### How Schema Validation Works

When you run skelo validate, the tool parses your outline files and checks them against the schema. It verifies that all required properties are present, data types are correct, and no invalid properties exist.

#### Outline File Error Reporting

If an outline file doesn't conform to the schema, skelo-cli will report detailed error messages indicating the specific violations. These errors typically include:

- The location of the error (file and line number).
- The property that caused the error.
- The expected type or value.
- The actual value found.

These error messages help you pinpoint and fix issues in your outline files quickly. Clear error reporting is essential for a smooth development experience. By enforcing the schema, skelo-cli helps maintain the integrity and consistency of your Docusaurus documentation structure.

## Error Handling

Robust error handling is crucial for any command-line tool. Here's how skelo-cli should handle errors to provide a good user experience:

### Outline File Errors

- Schema Validation Errors: If an outline file fails schema validation, skelo-cli should:
  - Report the filename and line number of the error. This pinpoints the exact location of the problem.
  - Describe the specific schema violation. For example, "Missing required property 'id'" or "Invalid type for property 'label', expected string, got number".
  - Halt execution. Don't proceed with generating files if the outline is invalid. This prevents the creation of incorrect documentation.
- Parsing Errors: If there's a problem parsing the YAML in an outline file (e.g., invalid syntax), skelo-cli should:
  - Report the parsing error's filename and line number (or character position).
  - Provide a clear error message explaining the syntax issue. For example, "Unexpected token '}'".
  - Halt execution. Similar to schema validation errors, parsing errors should stop the generation process.
- File System Errors: If skelo-cli can't access an outline file (e.g., the file doesn't exist or there are permissions issues), it should:
  - Report the filename and the specific error encountered. For example, "File not found" or "Permission denied".
  - Halt execution. Don't attempt to continue if essential files are inaccessible.

### Templating Errors

- **Missing Templates:** If a specified template file is not found, skelo-cli should:
  - **Report the name of the missing template file.** Clearly indicate which template is causing the issue.
  - **Halt execution.** Don't attempt to generate files without a valid template.
- **Template Compilation Errors:** If there's an error compiling a Handlebars template (e.g., invalid syntax in the template), skelo-cli should:
  - **Report the filename and line number of the error within the template file.** Help users debug their custom templates.
  - **Provide a descriptive error message explaining the compilation problem.**
  - **Halt execution.** Prevent the generation of potentially malformed files.
- **Runtime Errors:** If an error occurs during template rendering (e.g., trying to access a non-existent variable), skelo-cli should:
  - **Report the filename of the template and the specific error that occurred.** This might include the line number in the template where the error originated.
  *** Provide a clear error message explaining the runtime issue.**
  - **Halt execution.** Stop the generation process to avoid incomplete or incorrect files.

### General Error Handling Best Practices

- **Exit Codes:** Use appropriate exit codes to signal success or failure. A non-zero exit code indicates an error, allowing scripts and other tools to detect problems.
- **Consistent Formatting:** Maintain consistent formatting for error messages. This makes them easier to parse and understand. Consider using a standard format like: [ERROR] <filename>:<line number>: <error message>.
- **User-Friendly Language:** Write clear and concise error messages that explain the issue in a way that's easy for users to understand, even if they are not familiar with the technical details. Avoid jargon and overly technical language.

By following these error handling guidelines, skelo-cli can provide a robust and user-friendly experience, making it easier for developers to create and maintain their Docusaurus documentation.

## Troubleshooting

This section outlines some common issues you might encounter while using `skelo-cli` and provides solutions or workarounds.

**1. "Error: Cannot find module 'skelo-cli'"**

- **Cause:** This error usually means that `skelo-cli` is not installed globally or locally in your project.
- **Solution:**
  - **Global Installation:** Install `skelo-cli` globally using: `npm install -g skelo-cli`
  - **Local Installation:**  If you prefer a local installation (recommended), install it as a dev dependency: `npm install --save-dev skelo-cli`  Then, use `npx skelo <command>` to run the tool.

**2.  "Error: ENOENT: no such file or directory, open '<path/to/outline.yaml>' "**

- **Cause:** `skelo-cli` cannot find the specified outline file.
- **Solution:**
  - **Verify Path:** Double-check the path you provided to the `skelo build` command. Ensure the outline file exists at that location.  Use relative paths from the current directory or absolute paths.
  - **Glob Patterns:**  If you're using glob patterns (e.g., `**/*.outline.yaml`), make sure the pattern correctly matches the outline files.

**3. "Error: Invalid outline file. Missing required property 'id'" (or similar schema validation errors)**

- **Cause:** The outline file does not conform to the schema defined in `schemas/outline/v1/outline.schema.json`.
- **Solution:**
  - **Review the schema:** Carefully examine the schema file to understand the required properties and their formats.
  - **Correct the outline file:**  Fix the errors in the outline file according to the schema. The error message will usually indicate the location of the problem in the file.
- **Use a custom schema:** If you have modified the schema, ensure you're using the `--schemaFilename` option to point to your custom schema file.

**4. "Error: Missing template 'page.hbs'"**

- **Cause:** The specified Handlebars template file cannot be found.
- **Solution:**
  - **Check the `--templates` path:** Ensure that the directory provided to the `--templates` option contains the required template file.
  - **Verify the template filename:** Double-check that the template filename is correct (including the extension).

**5.  Unexpected output or errors during template rendering**

- **Cause:** Problems with your custom Handlebars template (e.g., invalid syntax, incorrect variable names).
- **Solution:**
  - **Debug the template:** Carefully review your Handlebars template for syntax errors or incorrect variable usage. Use console logging or a debugger to inspect the template variables.
  - **Consult Handlebars documentation:** Refer to the Handlebars documentation for details on template syntax and usage.

**6.  Sidebars not updating correctly**

- **Cause:** Potential conflicts with existing sidebar configuration in your Docusaurus project.
- **Solution:** Ensure that the sidebar key in your outline files matches the one exported from your sidebars.js (or sidebars.ts) file. Consider backing up your sidebars file before running `skelo build` to avoid data loss.

If you encounter any other issues, please consult the project's documentation or submit an issue on the project's GitHub repository.

## Related Tools

While `skelo-cli` offers a streamlined approach to scaffolding Docusaurus documentation using outline files, several other tools and methods can achieve similar results.  Understanding these alternatives can help you choose the best approach for your specific needs.

- **Manual Docusaurus Sidebar Configuration:** Docusaurus allows for manual sidebar configuration within the `sidebars.js` file.  This offers maximum flexibility but can become tedious and error-prone for large documentation sites. `skelo-cli` aims to automate this process and provide a more manageable way to define the documentation structure.

- **Docusaurus Plugins:** Several community-maintained Docusaurus plugins may offer similar functionality or integrations with different data sources for generating documentation. Exploring these plugins might reveal alternative solutions that better suit your workflow.

- **Static Site Generators (SSGs) with YAML Configuration:** Other SSGs, such as Gatsby and Jekyll, often support defining site structure through YAML configuration.  If you're not using Docusaurus, these alternatives might be more suitable.

- **Custom Scripting:** You can write custom scripts using languages like Node.js or Python to parse YAML files and generate Markdown files.  This gives you the greatest control but requires more development effort. `skelo-cli` simplifies this by providing a dedicated tool for the task.

This list is not exhaustive, but it provides a starting point for exploring the landscape of tools available for generating documentation from structured data.  `skelo-cli` differentiates itself by focusing specifically on Docusaurus, providing an easy-to-use CLI, schema validation, and templating capabilities for greater control over the generated output.

## Configuration File

`skelo-cli` supports a configuration file (`skelo.config.json` by default) to store common options and avoid repeatedly specifying them on the command line. This file uses the JSON format.

**Using a Configuration File:**

You can specify a custom configuration file using the `-c` or `--config` option with either the `build` or `validate` command:

```bash
skelo build '**/*.outline.md' -c my-config.json
skelo validate '**/*.outline.md' --config ./configs/custom-config.json
```

**Configuration File Structure:**

The configuration file can contain any of the options available via command-line arguments. For example:

```json
{
  "verbose": true,
  "docs": "website/docs",
  "sidebarsFilename": "sidebars.ts",
  "fallbackPatterns": ["existing-docs/**/*.md"],
  "templates": "./my-templates",
  "templateExtension": ".ejs",
  "schemaFilename": "./schemas/custom-schema.json",
  "templateNames": {
    "SIDEBARS_TEMPLATE": "custom-sidebars",
    "TOPIC_TEMPLATE": "custom-topic",
    "HEADING_TEMPLATE": "custom-heading"
  }
}

```

**How Settings Work:**

- **Precedence:** When a configuration file is specified using --config, the settings defined in the file override any default values and any options provided directly on the command line. This allows you to define common settings in the file and selectively override them on the command line when needed.
- **Missing File:** If the specified configuration file does not exist, skelo-cli will log a warning and fall back to the default options. This ensures a smooth experience even if the configuration file is accidentally deleted or misplaced. If no configuration is provided by using the -c or --config option, then skelo-cli will search for a skelo.config.json in the current folder. If this file is missing, then default values will be used.
- **Default Values:** If neither a configuration file is specified nor found, skelo-cli uses a set of built-in default values. These defaults are designed to work in most common scenarios.
- **Partial Configuration:** You don't need to specify all options in the configuration file. Any omitted options will use their default values or values specified on the command line.

Example:

If `my-config.json` contains `"docs": "website/docs"` and you run:

```bash
skelo build **/*.outline.yaml -c my-config.json --docs project-docs
```

The `docs` directory used will be `website/docs` (from the config file) because the configuration file overrides command-line options.

This configuration file mechanism makes it easy to manage settings for your Docusaurus documentation builds, particularly for complex projects with many options.

## Author


[Ion Gireada at Weblidity](https://github.com/weblidity) - ion.gireada[at]weblidity.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<!-- INSERT_START:USAGE.md -->
<!-- Mon Dec  9 18:08:43 UTC 2024 -->
This is a mock USAGE.md file.
<!-- INSERT_END:USAGE.md -->




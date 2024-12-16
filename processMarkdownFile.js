const fs = require('fs');

function processMarkdown(markdownContent, basePath = ".") {
    const insertRegex = /<!--\s*::(insert|include)\s+file\s*=\s*"([^"]+)"(?:[\s\S]*?)\s*-->([\s\S]*?)<!--\s*:\/(insert|include)\s*-->/g;

    let processedContent = markdownContent;
    let match;

    while ((match = insertRegex.exec(markdownContent)) !== null) {
        const fullMatch = match[0];
        const file = match[2];
        const existingContent = match[3]; // Content between the tags

        try {
            const fileContent = fs.readFileSync(`${basePath}/${file}`, 'utf8');
            const timestamp = new Date().toLocaleString();
            const replacingContent = `<!-- ::insert file="${file}" -->
<!-- Timestamp: ${timestamp} -->
${fileContent}
<!-- :/insert -->`;
            // Replace the entire match with the file content
            processedContent = processedContent.replace(fullMatch, replacingContent);
        } catch (error) {
            console.error(`Error reading file ${file}:`, error);

            // Replace with error message or leave existing content
            processedContent = processedContent.replace(
                fullMatch,
                `<!-- Error reading file: ${file} -->\n${existingContent}`
            );
        }
    }

    return processedContent;
}


// Example usage (replace with your actual file paths and content):

function example() {
    const markdown = `
# Title

## Subheading

<!-- ::insert file="USAGE.md" -->
<!-- Timestamp: {{ timestamp }} -->
\`\`\`bash
Usage: skelo-cli [options] [command]
\`\`\`
<!-- :/insert -->

<!-- ::insert file="README.md" :/ -->

<!-- ::include file="USAGE.md" -->
Some content here will be replaced.
<!-- :/include -->
  `;

    const fakeUsage = `Fake usage content`;
    const fakeReadme = `Fake readme content`;
    const fs = require('node:fs');

    fs.writeFileSync('USAGE.md', fakeUsage);
    fs.writeFileSync('NOT_README.md', fakeReadme);
    const processed = processMarkdown(markdown);
    console.log(processed);

}



// example();


function secondExample() {

    const markdown = fs.readFileSync('NOT_README.md', 'utf8');
    const processed = processMarkdown(markdown);
    fs.writeFileSync('NOT_README.md', processed);
}


secondExample();

function thirdExample() {
    // automatically process include files in README

    // buildReadmeDependencies(); // create files to include in README.md

    // updateReadme

    try {
        fs.readFileSync('README.md', 'utf8');
        try {
            const processed = processMarkdown(markdown);
            try {
                fs.writeFileSync('README.md', processed);
            } catch (error) {
                console.error(`Error writing file README.md:`, error);
            }
        } catch (error) {
            console.error(`Error processing file README.md:`, error);
        };
    } catch (error) {
        console.error(`Error reading file README.md:`, error);
    }
}



const { execSync } = require('child_process');
const fs = require('fs');

// Function to get the usage information for a command
function getUsage(cliPath, command) {
  try {
    const output = execSync(`node ${cliPath} ${command} -h`).toString();
    return `**\`${command}\` command:**\n\n\`\`\`bash\n${output}\`\`\`\n`;
  } catch (error) {
    return '';
  }
}

// Get the main usage information
const cliPath = process.argv[2];
let usageRaw = execSync(`node ${cliPath} -h`).toString();
let usage = `\`\`\`bash\n\n${usageRaw}\`\`\`\n`;

// Extract the list of commands from the lines following "Commands:"
const commandList = usage.split('\n')
  .slice(usage.split('\n').findIndex(line => line.startsWith('Commands:')) + 1)
  .filter(line => line.match(/^\s{2}\w+/))
  .map(line => line.trim().split(/\s+|\|/)[0]);

// Get the usage information for each command
commandList.forEach((cmd) => {
  usage += `\n${getUsage(cliPath, cmd)}`;
});

// Write the usage information to USAGE.md
fs.writeFileSync('USAGE.md', usage);

const shell = require('shelljs');
const path = require('path');

const { resolve } = require('path')

describe('CLI Tests with shelljs', () => {
    const projectRoot = resolve(__dirname, '../../../');
    const cliPath = resolve(projectRoot, 'index.js');

  const runCLI = (args) => {
    return shell.exec(`node ${cliPath} ${args.join(' ')}`, { silent: true });
  };

  test('should display help with options and commands listed alphabetically', () => {
    const result = runCLI(['--help']);
    const output = result.stdout;

    // Check that options are listed alphabetically
    const optionsIndex = output.indexOf('Options:');
    const optionsSection = output.substring(optionsIndex);
    const options = optionsSection.match(/--\w+/g);
    const sortedOptions = [...options].sort();
    expect(options).toEqual(sortedOptions);

    // Check that commands are listed alphabetically
    const commandsIndex = output.indexOf('Commands:');
    const commandsSection = output.substring(commandsIndex);
    const commands = commandsSection.match(/\s+\w+/g);
    const sortedCommands = [...commands].sort();
    expect(commands).toEqual(sortedCommands);

    expect(result.stderr).toBe('');
    expect(result.code).toBe(0);
  });

  test('should execute build subcommand without options and arguments', () => {
    const result = runCLI(['build']);
    expect(result.stdout).toContain('Build documentation files from outline files matching the filename patterns');
    expect(result.stderr).toBe('');
    expect(result.code).toBe(0);
  });

  test('should execute build subcommand with options and arguments', () => {
    const result = runCLI(['build', '**/*.outline.yaml', '--docs', 'custom_docs', '--verbose']);
    expect(result.stdout).toContain('Build documentation files from outline files matching the filename patterns');
    expect(result.stdout).toContain('custom_docs');
    expect(result.stdout).toContain('**/*.outline.yaml');
    expect(result.stderr).toBe('');
    expect(result.code).toBe(0);
  });
});
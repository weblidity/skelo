const { spawnSync } = require('child_process');
const path = require('path');

const { resolve } = require('path');

describe('CLI Help Command Tests', () => {

    const projectRoot = resolve(__dirname, '../../../');
    const cliPath = resolve(projectRoot, 'index.js');

    const runCLI = (args) => {
      return spawnSync('node', [cliPath, ...args], { encoding: 'utf-8' });
    };
  
  test('should display help with -h', () => {
    const result = runCLI(['-h']);
    console.log(JSON.stringify(result, null, 4))
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('Build documentation files from outline files matching the filename patterns');
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  test('should display help with --help', () => {
    const result = runCLI(['--help']);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('Build documentation files from outline files matching the filename patterns');
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  test('should display help with help command', () => {
    const result = runCLI(['help']);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('Build documentation files from outline files matching the filename patterns');
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});
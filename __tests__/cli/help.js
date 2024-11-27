const { exec } = require('shelljs');
const path = require('path');

describe('index.js responds correctly to -h, --help, -V, --version', () => {
  const indexPath = 'index.js';

  it('should respond correctly to -h', () => {
    const { code, stdout, stderr } = exec(`node ${indexPath} -h`, { silent: true });
    expect(code).toBe(0);
    expect(stdout).toContain('Usage:');
    expect(stderr).toBe('');
  });

  it('should respond correctly to --help', () => {
    const { code, stdout, stderr } = exec(`node ${indexPath} --help`, { silent: true });
    expect(code).toBe(0);
    expect(stdout).toContain('Usage:');
    expect(stderr).toBe('');
  });

  it('should respond correctly to -V', () => {
    const { code, stdout, stderr } = exec(`node ${indexPath} -V`, { silent: true });
    expect(code).toBe(0);
    expect(stdout).toMatch(/\d+(\.\d+){2}/);
    expect(stderr).toBe('');
  });

  it('should respond correctly to --version', () => {
    const { code, stdout, stderr } = exec(`node ${indexPath} --version`, { silent: true });
    expect(code).toBe(0);
    expect(stdout).toMatch(/\d+(\.\d+){2}/);
    expect(stderr).toBe('');
  });
});

describe('index.js lists options in alphabetical order', () => {
  const indexPath = 'index.js';

  it('should list options in alphabetical order', () => {
    const { stdout } = exec(`node ${indexPath} --help`, { silent: true });
    const options = stdout.split('\n').filter(line => line.startsWith('  -'));
    const sortedOptions = options.slice().sort((a, b) => {
      const longOptionA = a.match(/--\w+/)[0];
      const longOptionB = b.match(/--\w+/)[0];
      return longOptionA.localeCompare(longOptionB, undefined, { sensitivity: 'base' });
    });
    expect(options).toEqual(sortedOptions);
  });
});

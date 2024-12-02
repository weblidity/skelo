const fs = require('fs');
const Ajv = require('ajv');
const {validateFiles} = require('../../lib/skelo-utils');

describe('validateFiles', () => {
  it('should throw error if files is not an array', () => {
    expect(() => validateFiles('not an array', {})).toThrowError('Files must be an array of strings.');
  });

  it('should throw error if schema is not an object', () => {
    expect(() => validateFiles([], 'not an object')).toThrowError('Schema must be an object.');
  });

  it('should return empty arrays if files array is empty', () => {
    const result = validateFiles([], {});
    expect(result.validFiles).toEqual([]);
    expect(result.invalidFiles).toEqual({});
  });

  it('should return invalid file if content is not valid JSON', () => {
    const files = ['invalid-json-file.json'];
    const schema = { type: 'object' };
    const invalidJsonContent = ' invalid json ';
    fs.writeFileSync(files[0], invalidJsonContent);
    const result = validateFiles(files, schema);
    expect(result.validFiles).toEqual([]);
    expect(result.invalidFiles).toEqual({ [files[0]]: expect.any(Array) });
  });

  it('should return invalid file if content does not match schema', () => {
    const files = ['invalid-file.json'];
    const schema = { type: 'object', required: ['foo'] };
    const invalidFileContent = JSON.stringify({ bar: 'baz' });
    fs.writeFileSync(files[0], invalidFileContent);
    const result = validateFiles(files, schema);
    expect(result.validFiles).toEqual([]);
    expect(result.invalidFiles).toEqual({ [files[0]]: expect.any(Array) });
  });

  it('should return valid file if content matches schema', () => {
    const files = ['valid-file.json'];
    const schema = { type: 'object', required: ['foo'] };
    const validFileContent = JSON.stringify({ foo: 'bar' });
    fs.writeFileSync(files[0], validFileContent);
    const result = validateFiles(files, schema);
    expect(result.validFiles).toEqual(files);
    expect(result.invalidFiles).toEqual({});
  });

  it('should return multiple files with different validation results', () => {
    const files = ['valid-file.json', 'invalid-file.json'];
    const schema = { type: 'object', required: ['foo'] };
    const validFileContent = JSON.stringify({ foo: 'bar' });
    const invalidFileContent = JSON.stringify({ bar: 'baz' });
    fs.writeFileSync(files[0], validFileContent);
    fs.writeFileSync(files[1], invalidFileContent);
    const result = validateFiles(files, schema);
    expect(result.validFiles).toEqual([files[0]]);
    expect(result.invalidFiles).toEqual({ [files[1]]: expect.any(Array) });
  });

  afterEach(() => {
    const files = ['invalid-json-file.json', 'invalid-file.json', 'valid-file.json', 'file-with-error.json'];
    files.forEach(file => {
      try {
        fs.unlinkSync(file);
      } catch (error) {
        // ignore
      }
    });
  });
});
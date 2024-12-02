const getFilesFromPatterns = require('../../lib/skelo-utils').getFilesFromPatterns; 
const glob = require('glob');

describe('getFilesFromPatterns', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw error when patterns are not arrays of strings', () => {
    expect(() => getFilesFromPatterns('not an array', [])).toThrowError('Patterns should be an array of strings.');
    expect(() => getFilesFromPatterns([1, 2, 3], [])).toThrowError('Patterns should be an array of strings.');
  });

  it('should throw error when fallback patterns are not arrays of strings', () => {
    expect(() => getFilesFromPatterns([], 'not an array')).toThrowError('Fallback patterns should be an array of strings.');
    expect(() => getFilesFromPatterns([], [1, 2, 3])).toThrowError('Fallback patterns should be an array of strings.');
  });

  it('should return empty array when error occurs during file retrieval', () => {
    jest.spyOn(glob, 'sync').mockImplementation(() => { throw new Error('Mock error'); });
    expect(getFilesFromPatterns(['**/*.js'], [])).toEqual([]);
  });

  it('should return files that match the provided patterns', () => {
    const files = getFilesFromPatterns(['**/*.js'], []);
    expect(files).toBeInstanceOf(Array);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should return files that match the fallback patterns when primary patterns fail', () => {
    jest.spyOn(glob, 'sync').mockImplementationOnce(() => []); // primary patterns fail
    const files = getFilesFromPatterns(['**/*.js'], ['**/*.txt']);
    expect(files).toBeInstanceOf(Array);
    expect(files.length).toBeGreaterThan(0);
  });
});
const { globSync } = require('glob');
const { getFilesFromPatterns } = require('../lib/skelo-utils');

jest.mock('glob');

describe('getFilesFromPatterns', () => {
    it('should return primary files if found', () => {
        globSync.mockReturnValueOnce(['file1.txt', 'file2.txt']);
        const primaryPattern = '*.txt';
        const fallbackPattern = '*.md';

        expect(getFilesFromPatterns(primaryPattern, fallbackPattern)).toEqual(['file1.txt', 'file2.txt']);
        expect(globSync).toHaveBeenCalledWith(primaryPattern);
    });

    it('should return fallback files if primary files are not found', () => {
        globSync.mockReturnValueOnce([]);
        globSync.mockReturnValueOnce(['file3.md', 'file4.md']);

        const primaryPattern = '*.txt';
        const fallbackPattern = '*.md';

        expect(getFilesFromPatterns(primaryPattern, fallbackPattern)).toEqual(['file3.md', 'file4.md']);
    });

    it('should return empty array if primary and fallback patterns are invalid', () => {
        globSync.mockReturnValue([]);

        expect(getFilesFromPatterns(null, null)).toEqual([]);
        expect(getFilesFromPatterns(undefined, undefined)).toEqual([]);
        expect(getFilesFromPatterns([], [])).toEqual([]);
    });
});

const {setExtensionIfMissing} = require('../../lib/skelo-utils');

describe('setExtensionIfMissing', () => {
    it('should return the original filePath if it already has the extension', () => {
        expect(setExtensionIfMissing('filename.txt', 'txt')).toBe('filename.txt');
        expect(setExtensionIfMissing('filename.hbs', '.hbs')).toBe('filename.hbs');
        expect(setExtensionIfMissing('./filename.hbs', '.hbs')).toBe('./filename.hbs');
    });

    it('should add the extension if it is missing', () => {
        expect(setExtensionIfMissing('filename', 'txt')).toBe('filename.txt');
        expect(setExtensionIfMissing('filename', '.txt')).toBe('filename.txt');
        expect(setExtensionIfMissing('./filename', 'txt')).toBe('./filename.txt'); // Handles relative path starting with ./
    });

    it('should handle extensions with leading dots correctly', () => {
        expect(setExtensionIfMissing('filename', '.txt')).toBe('filename.txt');
        expect(setExtensionIfMissing('filename.txt', '.txt')).toBe('filename.txt'); // Already has extension
    });

    it('should handle various valid extensions', () => {
        expect(setExtensionIfMissing('filename', 'md')).toBe('filename.md');
        expect(setExtensionIfMissing('filename', 'js')).toBe('filename.js');
        expect(setExtensionIfMissing('filename', 'html')).toBe('filename.html');
    });

    it('should throw an error if the extension is not a string', () => {
        expect(() => setExtensionIfMissing('filename', 123)).toThrow('Invalid extension: extension must be a string.');
        expect(() => setExtensionIfMissing('filename', {})).toThrow('Invalid extension: extension must be a string.');
        expect(() => setExtensionIfMissing('filename', [])).toThrow('Invalid extension: extension must be a string.');
    });

    it('should throw an error if the extension is empty or contains only special characters (excluding ".")', () => {
        expect(() => setExtensionIfMissing('filename', '')).toThrow('Invalid extension: extension cannot be empty or contain special characters (excluding ".")..');
        expect(() => setExtensionIfMissing('filename', '  ')).toThrow('Invalid extension: extension cannot be empty or contain special characters (excluding ".")..');
        expect(() => setExtensionIfMissing('filename', '#$%^')).toThrow('Invalid extension: extension cannot be empty or contain special characters (excluding ".")..');
        expect(() => setExtensionIfMissing('filename', ' .')).toThrow('Invalid extension: extension cannot end with a dot.'); // Trims to "." which ends with a dot
    });

    it('should throw an error if the extension ends with a dot', () => {
        expect(() => setExtensionIfMissing('filename', 'txt.')).toThrow('Invalid extension: extension cannot end with a dot.');
        expect(() => setExtensionIfMissing('filename', '.txt.')).toThrow('Invalid extension: extension cannot end with a dot.');
        expect(() => setExtensionIfMissing('filename', '.')).toThrow('Invalid extension: extension cannot end with a dot.');
    });

    it('should handle complex file paths', () => {
        expect(setExtensionIfMissing('path/to/filename', 'txt')).toBe('path/to/filename.txt');
        expect(setExtensionIfMissing('./path/to/filename', 'txt')).toBe('./path/to/filename.txt');
    });

    it('should handle valid extensions with trailing whitespace', () => {
        expect(setExtensionIfMissing('filename', '.hbs   ')).toBe('filename.hbs');
      });
});

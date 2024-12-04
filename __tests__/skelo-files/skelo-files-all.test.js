const {getFilesFromPatterns, getParentPath, getPathSlugify, setExtensionIfMissing, slugify} = require('../../lib/skelo-files');
const {globSync} = require('glob');
const path = require('path');


jest.mock('glob');
jest.mock('path');

describe('skelo-files', () => {
    describe('getFilesFromPatterns', () => {
        it('should return an empty array if patterns is null', () => {
            expect(getFilesFromPatterns(null, [])).toEqual([]);
        });

        it('should return an empty array if fallbackPatterns is null', () => {
            expect(getFilesFromPatterns([], null)).toEqual([]);
        });

        it('should return an empty array if patterns and fallbackPatterns are empty', () => {
            expect(getFilesFromPatterns([], [])).toEqual([]);
        });

        it('should return files matching the patterns', () => {
            globSync.mockReturnValueOnce(['file1.js', 'file2.js']);

            expect(getFilesFromPatterns(['*.js'], ['*.ts'])).toEqual(['file1.js', 'file2.js']);
         });

        it('should throw an error if a pattern is not a string', () => {
            expect(() => getFilesFromPatterns([123], [])).toThrow('Patterns should be an array of strings.');
        });

        it('should return an empty array if globSync throws an error', () => {
            globSync.mockImplementation(() => {
                throw new Error('Glob error');
              });
              expect(getFilesFromPatterns(['*.js'], [])).toEqual([]);
        });

        it('should throw an error if patterns is not an array of strings', () => {
            expect(() => getFilesFromPatterns([123], [])).toThrow('Patterns should be an array of strings.');
        });

        it('should throw an error if fallbackPatterns is not an array of strings', () => {
            expect(() => getFilesFromPatterns([], [123])).toThrow('Fallback patterns should be an array of strings.');
        });
    });

    describe('getParentPath', () => {
        it('should return the combined path', () => {
            expect(getParentPath('parent', 'item')).toBe('parent/item');
        });

        it('should handle undefined or null inputs', () => {
            expect(getParentPath(null, 'item')).toBe('item');
            expect(getParentPath('parent', null)).toBe('parent');
            expect(getParentPath(undefined, 'item')).toBe('item');
            expect(getParentPath('parent', undefined)).toBe('parent');
            expect(getParentPath(null, null)).toBe('');
        });
    });


    describe('getPathSlugify', () => {
        it('should slugify a Windows path', () => {
            path.parse.mockReturnValue({ dir: 'c:\\Users\\test\\OneDrive\\Documents' });
            expect(getPathSlugify('c:\\Users\\test\\OneDrive\\Documents\\file.md')).toBe('c/users/test/onedrive/documents');
        });

        it('should slugify a Unix path', () => {
            path.parse.mockReturnValue({ dir: '/Users/test/Documents' });

            expect(getPathSlugify('/Users/test/Documents/file.md')).toBe('users/test/documents');
        });

        it('should remove extra slashes', () => {
            path.parse.mockReturnValue({ dir: '//Users//test//Documents//' });

            expect(getPathSlugify('//Users//test//Documents//file.md')).toBe('users/test/documents');
        });

        it('should slugify each segment of the path', () => {
            path.parse.mockReturnValue({ dir: 'Users/Test User/Documents' });
            expect(getPathSlugify('Users/Test User/Documents/File Name.md')).toBe('users/test-user/documents');
        });

        it('should throw an error if input is not a string', () => {
            expect(() => getPathSlugify(123)).toThrow('getPathSlugify: pathString must be a string');
        });
    });

    describe('setExtensionIfMissing', () => {
      it('should add the extension if not present', () => {
        expect(setExtensionIfMissing('file', '.md')).toBe('file.md');
      });
  
      it('should not add the extension if already present', () => {
        expect(setExtensionIfMissing('file.md', '.md')).toBe('file.md');
      });

      it('should handle extensions without a leading dot', () => {
          expect(setExtensionIfMissing('file', 'md')).toBe('file.md');
      });

      it('should handle various extension formats correctly', () => {
        expect(setExtensionIfMissing('file.md', 'md')).toBe('file.md');
        expect(setExtensionIfMissing('file', 'md')).toBe('file.md');
        expect(setExtensionIfMissing('file.md', '.md')).toBe('file.md');
        expect(setExtensionIfMissing('file', '.md')).toBe('file.md');
    });
  
      it('should throw an error if extension contains invalid characters', () => {
        expect(() => setExtensionIfMissing('file', '.m$d')).toThrow('Invalid extension: extension cannot be empty or contain special characters (excluding ".").');
      });

      it('should throw an error if extension ends with a dot', () => {
        expect(() => setExtensionIfMissing('file', '.')).toThrow('Invalid extension: extension cannot end with a dot.');
      });
    });


    describe('slugify', () => {
        it('should slugify a string', () => {
          expect(slugify('Test String')).toBe('test-string');
        });
    
        it('should handle spaces and underscores', () => {
          expect(slugify(' Test_String ')).toBe('test-string');
        });
    
        it('should handle special characters', () => {
          expect(slugify('Test$%^String')).toBe('teststring');
        });
    
        it('should handle leading and trailing hyphens', () => {
          expect(slugify('-Test-String-')).toBe('test-string');
        });
    
        it('should handle multiple hyphens', () => {
          expect(slugify('Test---String')).toBe('test-string');
        });

        it('should return an empty string for null or undefined input', () => {
            expect(slugify(null)).toBe('');
            expect(slugify(undefined)).toBe('');
          });
      });
  
});

const fs = require('fs');
const { validate } = require('jsonschema');
const { validateFilesAgainstSchema } = require('../lib/skelo-utils');

jest.mock('fs');
jest.mock('jsonschema');

describe('validateFilesAgainstSchema', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if schema file is invalid', () => {
        const schemaPath = 'invalid/schema.json';
        fs.readFileSync.mockImplementation(() => {
            throw new Error('File not found');
        });

        expect(() => validateFilesAgainstSchema([], schemaPath)).toThrow(`Error reading or parsing schema file: ${schemaPath} - File not found`);
    });

    it('should validate files against schema', () => {
        const files = ['file1.json', 'file2.json', 'file3.json'];
        const schemaPath = 'valid/schema.json';
        const schemaContent = { type: 'object' };
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(schemaContent));

        const fileContents = [
            { valid: true },
            { valid: false },
            'invalid JSON string',  // Simulate invalid JSON
        ];

        files.forEach((file, i) => {
            if (typeof fileContents[i] === 'string'){
                fs.readFileSync.mockReturnValueOnce(fileContents[i]);
            } else {
                fs.readFileSync.mockReturnValueOnce(JSON.stringify(fileContents[i]));
            }
        })

        validate.mockImplementation((content, schema) => ({
            valid: content.valid
        }));

        const { validFiles, invalidFiles } = validateFilesAgainstSchema(files, schemaPath);

        expect(validFiles).toEqual(['file1.json']);
        expect(invalidFiles).toEqual({
            'file2.json': [{ valid: false }],
            'file3.json': [{ message: 'Unexpected token i in JSON at position 0' }]
        });
    });

    it('should catch json parse errors', () => {
        const files = ['file1.json'];
        const schemaPath = 'valid/schema.json';

        const invalidJSON = '{invalid JSON';

        fs.readFileSync.mockReturnValueOnce(JSON.stringify({
            type: "object"
        }));  // Schema content
        fs.readFileSync.mockReturnValueOnce(invalidJSON);  // Invalid file content

        const { validFiles, invalidFiles } = validateFilesAgainstSchema(files, schemaPath);

        expect(validFiles.length).toBe(0);
        expect(invalidFiles['file1.json']).toEqual([{ message: 'Unexpected token i in JSON at position 11' }]);
    })
});

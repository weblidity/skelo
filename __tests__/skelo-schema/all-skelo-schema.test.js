const {getSchema, validateFiles} = require('../../lib/skelo-schema');
const fs = require('fs');
const { Validator } = require('jsonschema');
const yamljs = require('yamljs');


jest.mock('fs');
jest.mock('jsonschema');
jest.mock('yamljs');

describe('skelo-schema', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSchema', () => {
        it('should throw an error if options is null or undefined', () => {
            expect(() => getSchema(null)).toThrow('getSchema: options or options.schemaFilename is null or undefined.');
            expect(() => getSchema(undefined)).toThrow('getSchema: options or options.schemaFilename is null or undefined.');
        });

        it('should throw an error if schemaFilename is null or undefined', () => {
            expect(() => getSchema({})).toThrow('getSchema: options or options.schemaFilename is null or undefined.');
            expect(() => getSchema({ schemaFilename: null })).toThrow('getSchema: options or options.schemaFilename is null or undefined.');
            expect(() => getSchema({ schemaFilename: undefined })).toThrow('getSchema: options or options.schemaFilename is null or undefined.');

        });

        it('should throw a TypeError if schemaFilename is not a string', () => {
            expect(() => getSchema({ schemaFilename: 123 })).toThrow('getSchema: options.schemaFilename must be a string.');
        });

        it('should throw an error if there is an error reading the schema file', () => {
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File read error');
            });
            expect(() => getSchema({ schemaFilename: 'test.json' })).toThrow('getSchema: error reading or parsing schema file at test.json: File read error');
        });


        it('should throw an error if there is an error parsing the schema file', () => {
            fs.readFileSync.mockReturnValueOnce('invalid json');
            expect(() => getSchema({ schemaFilename: 'test.json' })).toThrow();
            // expect(() => getSchema({ schemaFilename: 'test.json' })).toThrow('getSchema: error reading or parsing schema file at test.json: Unexpected token i in JSON at position 0');
        });


        it('should return the parsed schema if no errors occur', () => {
            const mockSchema = { type: 'object' };
            fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockSchema));

            const returnedSchema = getSchema({ schemaFilename: 'test.json' });

            expect(returnedSchema).toEqual(mockSchema);
        });


    });



    describe('validateFiles', () => {

        it('should throw an error if files is not an array', () => {
            expect(() => validateFiles(null, {})).toThrow('Files must be an array of strings.');
            expect(() => validateFiles('string', {})).toThrow('Files must be an array of strings.');
            expect(() => validateFiles({}, {})).toThrow('Files must be an array of strings.');
        });

        it('should throw an error if schema is not an object', () => {
            expect(() => validateFiles([], null)).toThrow('Schema must be an object.');
            expect(() => validateFiles([], 'string')).toThrow('Schema must be an object.');
            expect(() => validateFiles([], [])).toThrow('Schema must be an object.');
        });

        it('should return valid and invalid files', () => {
            const mockSchema = { type: 'object', properties: { title: { type: 'string' } } };
            const mockValidator = { validate: jest.fn() };
            Validator.mockImplementation(() => mockValidator);

            fs.readFileSync.mockReturnValueOnce(`
title: My Title
            `);

            fs.readFileSync.mockReturnValueOnce(`
---
title: 123
            `);

            fs.readFileSync.mockReturnValueOnce(`
title: My Other Title
            `);

            mockValidator.validate
            .mockReturnValueOnce({ valid: true, errors: [] })
            .mockReturnValueOnce({ valid: false, errors: ['Invalid title'] })
            .mockReturnValueOnce({ valid: true, errors: [] });

            yamljs.parse
            .mockReturnValueOnce({ title: 'My Title' })
            .mockReturnValueOnce({ title: 123 })
            .mockReturnValueOnce({ title: 'My Other Title' });

            const { validFiles, invalidFiles } = validateFiles(['file1.yaml', 'file2.yaml', 'file3.yaml'], mockSchema);

            expect(validFiles).toEqual(['file1.yaml', 'file3.yaml']);
            expect(invalidFiles).toEqual({ 'file2.yaml': ['Invalid title'] });

        });


        it('should handle errors during file processing', () => {
            const mockSchema = { type: "object" };

            fs.readFileSync.mockImplementation(() => { throw new Error("Failed to read file") });
            
            const { validFiles, invalidFiles } = validateFiles(['file1.yaml'], mockSchema);

            expect(validFiles).toEqual([]);
            expect(invalidFiles['file1.yaml'][0].message).toEqual('Failed to read file');
        });

        it('should handle invalid YAML data', () => {
            const mockSchema = { type: 'object', properties: { title: { type: 'string' } } };

            fs.readFileSync.mockReturnValueOnce('invalid yaml');
            yamljs.parse.mockReturnValueOnce(null);

            const { validFiles, invalidFiles } = validateFiles(['file1.yaml'], mockSchema);

            expect(validFiles).toEqual([]);
            expect(invalidFiles).toEqual({ 'file1.yaml': [new Error('Data is not an object.')] });

        });
    });
});

const fs = require('fs');
const { useDefaultSchemaIfNeeded, validateAndSetSchema, readAndValidateSchema, validateSchema } = require('../lib/skelo-validate-schema');

jest.mock('fs');

describe('Schema Validation Utilities', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('useDefaultSchemaIfNeeded', () => {
        it('should throw an error if defaultSchemaLocation is invalid', () => {
            expect(() => useDefaultSchemaIfNeeded({}, '')).toThrowError('Invalid default schema location provided.');
            expect(() => useDefaultSchemaIfNeeded({}, null)).toThrowError('Invalid default schema location provided.');
            expect(() => useDefaultSchemaIfNeeded({}, undefined)).toThrowError('Invalid default schema location provided.');
        });

        it('should throw an error if defaultSchemaLocation does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const defaultSchema = 'path/to/default/schema.json';
            expect(() => useDefaultSchemaIfNeeded({}, defaultSchema)).toThrowError(`Default schema location is invalid: ${defaultSchema}`);
        });

        it('should use default schema if options is invalid', () => {
            fs.existsSync.mockReturnValue(true);
            const defaultSchema = 'path/to/default/schema.json';
            const options = useDefaultSchemaIfNeeded(null, defaultSchema);
            expect(options.schema).toBe(defaultSchema);
        });


        it('should use default schema if options.schema is invalid', () => {
            fs.existsSync.mockReturnValue(true);
            const defaultSchema = 'path/to/default/schema.json';
            const options = useDefaultSchemaIfNeeded({ schema: 'invalid/schema.json' }, defaultSchema);
            expect(fs.existsSync).toHaveBeenCalledWith('invalid/schema.json'); // Check if fs.existsSync is called with invalid path

            expect(options.schema).toBe(defaultSchema);

        });



        it('should use provided schema if valid', () => {
            fs.existsSync.mockReturnValue(true);
            const validSchema = 'path/to/valid/schema.json';
            const options = useDefaultSchemaIfNeeded({ schema: validSchema }, 'path/to/default/schema.json');
            expect(options.schema).toBe(validSchema);
        });


        it('should use default schema if readAndValidateSchema fails', () => {
            const defaultSchema = 'path/to/default/schema.json';
            const invalidSchema = 'path/to/invalid/schema.json';

            fs.existsSync.mockReturnValue(true);
            jest.spyOn(console, 'error').mockImplementation(() => {});


            const options = useDefaultSchemaIfNeeded({ schema: invalidSchema }, defaultSchema);
            expect(options.schema).toBe(defaultSchema);
        });

    });

    describe('validateAndSetSchema', () => {
        it('should return default schema if options.schema is invalid', () => {
            const defaultSchema = 'default/schema.json';
            let options = { schema: 'invalid/schema.json' };
            fs.existsSync.mockReturnValue(false);
            expect(validateAndSetSchema(options, defaultSchema)).toBe(defaultSchema);
        });

        it('should return options.schema if valid', () => {

            const schema = 'valid/schema.json';
            let options = { schema: schema };

            fs.existsSync.mockReturnValue(true);
            expect(validateAndSetSchema(options, 'default/schema.json')).toBe(schema);


        });
    });


    describe('readAndValidateSchema', () => {
        it('should return default schema if schemaPath is invalid', () => {

            fs.readFileSync.mockImplementation(() => {
                throw new Error("File not found");
            });
            expect(readAndValidateSchema('invalid/schema.json', 'default/schema.json')).toBe('default/schema.json');
        });


        it('should return default schema if JSON.parse fails', () => {
            fs.readFileSync.mockReturnValue('{invalid json}');

            expect(readAndValidateSchema('invalid/schema.json', 'default/schema.json')).toBe('default/schema.json');
        });

        it('should return default schema if validateSchema fails', () => {
            const invalidSchema = [];  // Example of an invalid schema

            fs.readFileSync.mockReturnValue(JSON.stringify(invalidSchema)); // Mock the readFileSync to return a valid JSON string


            expect(readAndValidateSchema('invalid/schema.json', 'default/schema.json')).toBe('default/schema.json');
        });



        it('should return schemaPath if valid', () => {
            const validSchema = {}; // A valid schema object
            fs.readFileSync.mockReturnValueOnce(JSON.stringify(validSchema));
            expect(readAndValidateSchema('valid/schema.json', 'default/schema.json')).toBe('valid/schema.json');

        });
    });


    describe('validateSchema', () => {
        it('should return false for invalid schema content', () => {
            expect(validateSchema([])).toBe(false); // Example of invalid content: an array
            expect(validateSchema("string")).toBe(false); // Example of invalid content: a string

        });

        it('should return true for valid schema content', () => {
            expect(validateSchema({})).toBe(true); // A valid schema object

        });

    });
});



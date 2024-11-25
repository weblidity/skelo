const { readAndValidateSchema, useDefaultSchemaIfNeeded, validateAndSetSchema, validateSchema } = require('../lib/skelo-validate-schema')
const fs = require('fs')

jest.mock('fs')

// TODO: #5 Correct tests and code in validateSchema.test.js

describe('validateSchema', () => {
  it('should return true for a valid schema object', () => {
    expect(validateSchema({ type: 'object' })).toBe(true)
  })

  it('should return false for invalid schema content', () => {
    expect(validateSchema(null)).toBe(false)
    expect(validateSchema(undefined)).toBe(false)
    expect(validateSchema('string')).toBe(false)
    expect(validateSchema(123)).toBe(false)
    expect(validateSchema([])).toBe(false)
  })

  it('should catch and log errors during validation', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
    const badSchema = { get type () { throw new Error('Test Error') } }
    expect(validateSchema(badSchema)).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Schema validation error: Test Error')
    consoleErrorSpy.mockRestore()
  })
})

describe('validateAndSetSchema', () => {
  it('should return the schema path if it exists', () => {
    fs.existsSync.mockReturnValue(true)
    const options = { schema: 'path/to/schema.json' }
    expect(validateAndSetSchema(options, 'default/schema.json')).toBe('path/to/schema.json')
  })

  it('should return default schema and log error if schema file does not exist', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')

    fs.existsSync.mockReturnValue(false)
    const options = { schema: 'non/existent/path.json' }
    expect(validateAndSetSchema(options, 'default/schema.json')).toBe('default/schema.json')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Schema file not found: non/existent/path.json. Using default schema: default/schema.json')

    consoleErrorSpy.mockRestore()
  })
})

describe('readAndValidateSchema', () => {
  it('should return default schema if schema file does not exist', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File not found')
    })
    expect(readAndValidateSchema('invalid/path', 'default/path')).toBe('default/path')
    expect(consoleSpy).toHaveBeenCalledWith('Error parsing or validating JSON schema: invalid/path. Using default schema: default/path')
    consoleSpy.mockRestore()
  })

  it('should return the schema path if valid', () => {
    fs.readFileSync.mockReturnValue('{"type": "object"}')
    expect(readAndValidateSchema('valid/path', 'default/path')).toBe('valid/path')
  })

  it('should return the default schema if invalid JSON', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    fs.readFileSync.mockReturnValue('{invalid json}')

    expect(readAndValidateSchema('path/to/invalid.json', 'default/schema.json')).toBe('default/schema.json')
    expect(consoleSpy).toHaveBeenCalledWith('Error parsing or validating JSON schema: path/to/invalid.json. Using default schema: default/schema.json')
    consoleSpy.mockRestore()
  })

  it('should return default schema if schema validation fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')

    fs.readFileSync.mockReturnValue('{}') // Empty schema, which is invalid
    expect(readAndValidateSchema('invalid/schema', 'default/schema')).toBe('default/schema')

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing or validating JSON schema: invalid/schema. Using default schema: default/schema')

    consoleErrorSpy.mockRestore()
  })
})

describe('useDefaultSchemaIfNeeded', () => {
  const defaultSchema = 'default/schema.json'

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should throw an error if defaultSchemaLocation is invalid', () => {
    expect(() => useDefaultSchemaIfNeeded({}, null)).toThrow('Invalid default schema location provided.')
    expect(() => useDefaultSchemaIfNeeded({}, '')).toThrow('Invalid default schema location provided.')
  })

  it('should throw error if defaultSchemaLocation does not exist', () => {
    fs.existsSync.mockReturnValue(false)
    expect(() => useDefaultSchemaIfNeeded({}, defaultSchema)).toThrow('Default schema location is invalid: default/schema.json')
  })

  it('should return default schema if options object is invalid and log to console', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    fs.existsSync.mockReturnValue(true)

    expect(useDefaultSchemaIfNeeded(null, defaultSchema).schema).toBe(defaultSchema)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid options object. Using default schema.'))

    consoleSpy.mockRestore()
  })

  it('should use default schema if options.schema is invalid', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
    fs.existsSync.mockReturnValueOnce(true)
    fs.existsSync.mockReturnValueOnce(false)

    const options = { schema: 'invalid/schema.json' }

    expect(useDefaultSchemaIfNeeded(options, defaultSchema).schema).toBe(defaultSchema)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Schema file not found: invalid/schema.json. Using default schema: default/schema.json')
    consoleErrorSpy.mockRestore()
  })

  it('should correctly validate using functions', () => {
    const options = { schema: 'valid/schema.json' }

    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('{"type": "object"}') // Valid schema content
    const result = useDefaultSchemaIfNeeded(options, defaultSchema)
    expect(result.schema).toBe('valid/schema.json')
  })

  it('should return options with default schema if specified schema is invalid json', () => {
    fs.existsSync.mockReturnValueOnce(true)
    fs.readFileSync.mockReturnValueOnce('{invalid}')

    const options = { schema: 'invalid/schema.json' }

    const result = useDefaultSchemaIfNeeded(options, 'default/schema.json')
    expect(result.schema).toEqual('default/schema.json')
  })
})

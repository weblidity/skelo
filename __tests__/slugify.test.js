const { slugify } = require('../lib/skelo-strings')

describe('slugify', () => {
  it('should convert a string to lowercase', () => {
    expect(slugify('TestString')).toBe('teststring')
  })

  it('should replace invalid characters with hyphens', () => {
    expect(slugify('Test String')).toBe('test-string')
    expect(slugify('Test/String')).toBe('test-string')
    expect(slugify('Test.String')).toBe('test-string')
  })

  it('should replace consecutive hyphens with a single hyphen', () => {
    expect(slugify('Test--String')).toBe('test-string')
  })

  it('should remove leading and trailing hyphens and underscores', () => {
    expect(slugify('-TestString-')).toBe('teststring')
    expect(slugify('_TestString_')).toBe('teststring')
    expect(slugify('_-TestString-_')).toBe('teststring')
  })

  it('should handle strings with leading and trailing spaces, hyphens and underscores', () => {
    expect(slugify(' _-TestString_- ')).toBe('teststring')
  })

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('')
  })

  it('should handle strings with only hyphens and underscores', () => {
    expect(slugify('-_-_-_')).toBe('')
  })

  it('should throw an error if input is not a string', () => {
    expect(() => slugify(123)).toThrow('Invalid input: expected a string.')
    expect(() => slugify(null)).toThrow('Invalid input: expected a string.')

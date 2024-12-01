const { getPathSlugify } = require('../lib/skelo-strings')

describe('getPathSlugify', () => {
  it('should slugify each part of the path', () => {
    expect(getPathSlugify('Test/Path/String')).toBe('test/path/string')
  })

  it('should handle windows paths', () => {
    expect(getPathSlugify('Test\\Path\\String')).toBe('test/path/string')
  })

  it('should remove extra slashes', () => {
    expect(getPathSlugify('//Test///Path//String////')).toBe('test/path/string')
  })

  it('should handle empty strings and return empty string', () => {
    expect(getPathSlugify('')).toBe('')
  })

  it('should handle paths with only slashes and return empty string', () => {
    expect(getPathSlugify('///')).toBe('')
  })

  it('should handle leading and trailing slashes', () => {

const { buildParentPath } = require('../lib/skelo-strings')

describe('buildparentPath', () => {
  it('should combine parent and item paths correctly', () => {
    expect(buildParentPath('parent', 'item')).toBe('parent/item')
  })

  it('should slugify both parent and item paths', () => {
    expect(buildParentPath('Parent Path', 'Item Path')).toBe('parent-path/item-path')
  })

  it('should handle null or empty parent path', () => {
    expect(buildParentPath(null, 'item')).toBe('item')
    expect(buildParentPath('', 'item')).toBe('item')
  })

  it('should handle null or empty item path', () => {
    expect(buildParentPath('parent', null)).toBe('parent')
    expect(buildParentPath('parent', '')).toBe('parent')
  })

  it('should handle both parent and item paths being null or empty', () => {
    expect(buildParentPath(null, null)).toBe('')
    expect(buildParentPath('', '')).toBe('')
    expect(buildParentPath(null, '')).toBe('')
    expect(buildParentPath('', null)).toBe('')
  })

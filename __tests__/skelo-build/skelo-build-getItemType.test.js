const { getItemType, SIDEBAR_ITEM_TYPE } = require('../../lib/skelo-build');

const { LINK, CATEGORY, TOPIC } = SIDEBAR_ITEM_TYPE;
describe('getItemType', () => {
  it('returns INVALID_ITEM for null', () => {
    expect(getItemType(null)).toBe('INVALID_ITEM');
  });

  it('returns INVALID_ITEM for array', () => {
    expect(getItemType([])).toBe('INVALID_ITEM');
  });

  it('returns INVALID_ITEM for non-object', () => {
    expect(getItemType('string')).toBe('INVALID_ITEM');
  });

  it('returns LINK for item with href property', () => {
    const item = {label: 'Link Item', href: 'https://example.com' };
    expect(getItemType(item)).toBe(LINK);
  });

  it('returns CATEGORY for item with items array property', () => {
    const item = {label: 'Category Item', items: [{}, {}] };
    expect(getItemType(item)).toBe(CATEGORY);
  });

  it('returns TOPIC for item with label property', () => {
    const item = { label: 'Topic Item' };
    expect(getItemType(item)).toBe(TOPIC);
  });

  it('returns UNKNOWN for item with no recognizable properties', () => {
    const item = { foo: 'bar' };
    expect(getItemType(item)).toBe('UNKNOWN');
  });
});
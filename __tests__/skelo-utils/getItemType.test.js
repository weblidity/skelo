const getItemType = require('../../lib/skelo-utils').getItemType;
const {LINK, TOPIC, CATEGORY} = require('../../lib/skelo-utils').SIDEBAR_ITEM_TYPE;

describe('getItemType', () => {
  it('returns INVALID_ITEM for non-object item', () => {
    expect(getItemType(null)).toBe('INVALID_ITEM');
    expect(getItemType([])).toBe('INVALID_ITEM');
    expect(getItemType('string')).toBe('INVALID_ITEM');
    expect(getItemType(123)).toBe('INVALID_ITEM');
  });

  it('returns UNKNOWN for item with invalid label', () => {
    expect(getItemType({})).toBe('UNKNOWN');
    expect(getItemType({ label: null })).toBe('UNKNOWN');
    expect(getItemType({ label: 123 })).toBe('UNKNOWN');
    expect(getItemType({ label: '' })).toBe('UNKNOWN');
  });

  it('returns LINK for item with valid href', () => {
    expect(getItemType({label: 'Link', href: 'https://example.com' })).toBe(LINK);
  });

  it('returns CATEGORY for item with at least one item', () => {
    expect(getItemType({label : 'Category', items: [{}, {}] })).toBe(CATEGORY);
  });

  it('returns TOPIC for item with no items', () => {
    expect(getItemType({label: 'Topic'})).toBe(TOPIC);
    expect(getItemType({label: 'Topic', items: [] })).toBe(TOPIC);
  });
});
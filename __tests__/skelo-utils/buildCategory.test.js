const buildCategory = require('../../lib/skelo-utils').buildCategory;
const buildCategoryItems = require('../../lib/skelo-utils').buildCategoryItems;

jest.mock('../../lib/skelo-utils');

describe('buildCategory', () => {
  test.skip('throws error when item is not an object', () => {
    expect(() => buildCategory('string', {})).toThrowError('Item must be an object');
    expect(() => buildCategory(null, {})).toThrowError('Item must be an object');
    expect(() => buildCategory(undefined, {})).toThrowError('Item must be an object');
  });

  test.skip('throws error when item label is not a string', () => {
    expect(() => buildCategory({ label: 123 }, {})).toThrowError('Item label must be a string');
    expect(() => buildCategory({ label: null }, {})).toThrowError('Item label must be a string');
    expect(() => buildCategory({ label: undefined }, {})).toThrowError('Item label must be a string');
  });

  test.skip('returns category sidebar item object with label and items', () => {
    const item = { label: 'Category Label', items: [] };
    const options = {};
    const result = buildCategory(item, options);
    expect(result).toEqual({
      type: 'category',
      label: 'Category Label',
      items: []
    });
  });

  test.skip('calls buildCategoryItems with item items and options', () => {
    const item = { label: 'Category Label', items: [] };
    const options = {};
    const buildCategoryItemsSpy = jest.spyOn(require('./buildCategoryItems'), 'buildCategoryItems');
    buildCategory(item, options);
    expect(buildCategoryItemsSpy).toHaveBeenCalledTimes(1);
    expect(buildCategoryItemsSpy).toHaveBeenCalledWith(item.items, options);
  });

  test.skip('does not throw error when item does not have items array', () => {
    const item = { label: 'Category Label' };
    const options = {};
    expect(() => buildCategory(item, options)).not.toThrowError();
  });
});
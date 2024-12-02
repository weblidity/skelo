const normalizeItem = require('../../lib/skelo-utils').normalizeItem;

describe('normalizeItem', () => {
  it('throws an error when the input is null or undefined', () => {
    expect(() => normalizeItem(null)).toThrowError('Item must be a string or an object.');
    expect(() => normalizeItem(undefined)).toThrowError('Item must be a string or an object.');
  });

  it('throws an error when the input is not a string or object', () => {
    expect(() => normalizeItem(123)).toThrowError('Item must be a string or an object.');
    expect(() => normalizeItem(true)).toThrowError('Item must be a string or an object.');
  });

  it('converts a string to an object with a label property', () => {
    const result = normalizeItem('hello');
    expect(result).toEqual({ label: 'hello' });
  });

  it('converts an object with a single property to an object with label and items properties', () => {
    const result = normalizeItem({ foo: ['bar', 'baz'] });
    expect(result).toEqual({ label: 'foo', items: [{label: 'bar'}, {label: 'baz'}] });
  });

  it('throws an error when the object structure is invalid', () => {
    expect(() => normalizeItem({ foo: 'bar' })).toThrowError('Invalid sidebar item: foo property must be an array if item is an object with a single property.');
  });

  it('recursively normalizes items and headings properties', () => {
    const result = normalizeItem({ label: 'foo', items: ['bar', { label: 'baz' }] });
    expect(result).toEqual({ label: 'foo', items: [{ label: 'bar' }, { label: 'baz' }] });
  });

  it('throws an error when an item has both items and headings properties', () => {
    expect(() => normalizeItem({ label: 'foo', items: ['bar'], headings: ['baz'] })).toThrowError(`Item cannot have both 'items' and 'headings' properties: foo`);
  });

  it('returns a normalized object with a label property', () => {
    const result = normalizeItem({ label: 'foo' });
    expect(result).toEqual({ label: 'foo' });
  });
});
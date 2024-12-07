const normalizeItem = require('../../lib/skelo-utils').normalizeItem;

describe('normalizeItem', () => {
  it('normalizes string item', () => {
    const item = 'test label';
    const expected = { label: 'test label' };
    expect(normalizeItem(item)).toEqual(expected);
  });

  it('normalizes object item with single property', () => {
    const item = { 'test label': ['item1', 'item2'] };
    const expected = { label: 'test label', items: [{label: 'item1'}, {label: 'item2'}] };
    expect(normalizeItem(item)).toEqual(expected);
  });

  it('normalizes object item with label property', () => {
    const item = { label: 'test label' };
    const expected = { label: 'test label' };
    expect(normalizeItem(item)).toEqual(expected);
  });

  it('normalizes object item with items property', () => {
    const item = { label: 'test label', items: ['item1', 'item2'] };
    const expected = { label: 'test label', items: [{label: 'item1'}, {label: 'item2'}] };
    expect(normalizeItem(item)).toEqual(expected);
  });

  it('normalizes object item with headings property', () => {
    const item = { label: 'test label', headings: ['heading1', 'heading2'] };
    const expected = { label: 'test label', headings: [{label: 'heading1'}, {label: 'heading2'}] };
    expect(normalizeItem(item)).toEqual(expected);
  });

  it('throws error for invalid item', () => {
    const item = null;
    expect(() => normalizeItem(item)).toThrowError();
  });

  it('throws error for item with both items and headings properties', () => {
    const item = { label: 'test label', items: ['item1', 'item2'], headings: ['heading1', 'heading2'] };
    expect(() => normalizeItem(item)).toThrowError();
  });
});
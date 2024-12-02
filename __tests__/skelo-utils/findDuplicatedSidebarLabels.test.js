const findDuplicatedSidebarLabels = require('../../lib/skelo-utils').findDuplicatedSidebarLabels;
// const findDuplicatedSidebarLabels = require('./findDuplicatedSidebarLabels');

describe('findDuplicatedSidebarLabels', () => {
  it('throws an error when validFiles is not an array', () => {
    expect(() => findDuplicatedSidebarLabels('not an array')).toThrowError('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
  });

  it('throws an error when validFiles is an array of non-strings', () => {
    expect(() => findDuplicatedSidebarLabels([1, 2, 3])).toThrowError('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
  });

  it('throws an error when sidebars is not an array of objects', () => {
    const getSidebars = jest.fn(() => ({ sidebars: 'not an array' }));
    expect(() => findDuplicatedSidebarLabels(['file1'], getSidebars)).toThrowError('findDuplicatedSidebarLabels: sidebars must be an array of objects.');
  });

//   it('returns an empty array when there are no duplicates', () => {
//     const getSidebars = jest.fn(() => ({ sidebars: [{ label: 'unique' }] }));
//     expect(findDuplicatedSidebarLabels(['file1'], getSidebars)).toEqual([]);
//   });

//   it('returns an array of duplicates when there are duplicate labels', () => {
//     const getSidebars = jest.fn((file) => {
//       if (file === 'file1') {
//         return { sidebars: [{ label: 'duplicate' }] };
//       } else {
//         return { sidebars: [{ label: 'duplicate' }] };
//       }
//     });
//     expect(findDuplicatedSidebarLabels(['file1', 'file2'], getSidebars)).toEqual(['duplicate']);
//   });
});
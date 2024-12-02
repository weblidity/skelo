const findDuplicatedSidebarLabels = require('../../lib/skelo-utils').findDuplicatedSidebarLabels;

describe('findDuplicatedSidebarLabels', () => {
  it('throws an error when validFiles is not an array', () => {
    expect(() => findDuplicatedSidebarLabels('not an array')).toThrowError('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
  });

  it('throws an error when validFiles is an array of non-strings', () => {
    expect(() => findDuplicatedSidebarLabels([1, 2, 3])).toThrowError('findDuplicatedSidebarLabels: validFiles must be an array of strings.');
  });

  it('throws an error when sidebars is not an array of objects', () => {
    const originalGetSidebars = global.getSidebars;
    global.getSidebars = () => ({ sidebars: 'not an array' });
    expect(() => findDuplicatedSidebarLabels(['file1'])).toThrowError('findDuplicatedSidebarLabels: sidebars must be an array of objects.');
    global.getSidebars = originalGetSidebars;
  });

//   it('returns an empty array when there are no duplicates', () => {
//     const originalGetSidebars = global.getSidebars;
//     global.getSidebars = () => ({ sidebars: [{ label: 'unique' }] });
//     expect(findDuplicatedSidebarLabels(['file1'])).toEqual([]);
//     global.getSidebars = originalGetSidebars;
//   });

//   it('returns an array of duplicates when there are duplicate labels', () => {
//     const originalGetSidebars = global.getSidebars;
//     global.getSidebars = (file) => {
//       if (file === 'file1') {
//         return { sidebars: [{ label: 'duplicate' }] };
//       } else {
//         return { sidebars: [{ label: 'duplicate' }] };
//       }
//     };
//     expect(findDuplicatedSidebarLabels(['file1', 'file2'])).toEqual(['duplicate']);
//     global.getSidebars = originalGetSidebars;
//   });
});